extern crate dotenv;
extern crate r2d2;
extern crate r2d2_sqlite;
extern crate r2d2_postgres;
#[macro_use]
extern crate rouille;
extern crate rusqlite;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate strum_macros;
extern crate ctrlc;

mod comments;

use dotenv::dotenv;
use rouille::Request;
use rouille::Response;
use std::env;
use comments::*;
use comments::sqlite::*;
//use comments::postgres::*;
use std::process;
use std::fs::File;

fn main() {
    dotenv().ok();

    let address = env::var("TH_LISTEN").ok().unwrap_or(String::from("0.0.0.0:8080"));
    let database = env::var("TH_DATABASE").unwrap();
    let frontend_path = env::var("TH_FRONTEND").ok();
    let use_xff = env::var("TH_XFF_IP")
        .map(|value| value.eq("1")).unwrap_or(false);
    let allow_null_origin = env::var("TH_CORS_NULL")
        .map(|value| value.eq("1")).unwrap_or(false);

    let comments = CommentSqliteDatabase::new(database);

    let closer = comments.get_closer().deref();
    ctrlc::set_handler(move || {
        println!("Signal received, exiting...!");
        closer.finish_writes();
        process::exit(0)
    }).unwrap();

    rouille::start_server(address, move |request| {
        router!(request,
            (OPTIONS) (/{url}) => { handle_cors_preflight(request, url, allow_null_origin) },
            (POST) (/sendComment) => { handle_post_comment(request, &comments, use_xff, allow_null_origin) },
            _ => { try_static_assets(request, &frontend_path) }
        )
    })
}

fn try_static_assets(request: &Request, frontend_path: &Option<String>) -> Response {
    frontend_path.as_ref()
        .and_then(|path| {
            if request.raw_url().eq("/") {
                Some(index_html(path))
            } else {
                let response = rouille::match_assets(&request, &path);
                if response.is_success() { Some(response) } else { None }
            }
        })
        .unwrap_or_else(|| handle_404())
}

fn index_html(path: &String) -> Response {
    File::open(&[path, "/index.html"].concat())
        .map(|file| Response::from_file("text/html; charset=utf-8", file))
        .unwrap_or_else(|_| handle_404())
}

fn handle_cors_preflight(request: &Request, _url: String, allow_null_origin: bool) -> Response {
    let request_origin = request.header("Origin");
    if allow_null_origin && request_origin.map(|o| o.eq("null")).unwrap_or(false) {
        Response::empty_204().with_cors_post_allowed(allow_null_origin)
    } else {
        Response::empty_204()
    }
}

trait CorsAware {
    fn with_cors_post_allowed(self, allow_null_origin: bool) -> Self;
}

impl CorsAware for Response {
    fn with_cors_post_allowed(self, allow_null_origin: bool) -> Self {
        if allow_null_origin {
            self.with_unique_header("Access-Control-Allow-Origin", "null")
                .with_unique_header("Access-Control-Allow-Headers", "Content-Type")
                .with_unique_header("Access-Control-Allow-Methods", "POST")
        } else {
            self
        }
    }
}

fn handle_post_comment(request: &Request, comments: &CommentDatabase, use_xff: bool, allow_null_origin: bool) -> Response {
    let input = rouille::input::json_input::<Comment>(request);
    let comment: Comment = try_or_400!(input);

    let ip = match use_xff {
        true => {
            request.header("X-Forwarded-For").map(|s| s.to_string()).unwrap_or_else(||
                request.remote_addr().ip().to_string()
            )
        }
        false => { request.remote_addr().ip().to_string() }
    };

    match comments.save_comment(comment, ip.as_str()) {
        Ok(_) => { raw_json("{\"status\":\"ok\"}", 200).with_cors_post_allowed(allow_null_origin) }
        Err(_) => { raw_json("{\"status\":\"error\"}", 500).with_cors_post_allowed(allow_null_origin) }
    }
}

fn handle_404() -> Response {
    Response::text("404").with_status_code(404)
}

fn raw_json(s: &str, code: u16) -> Response {
    Response::text(s)
        .with_unique_header("Content-Type", "application/json")
        .with_status_code(code)
}
