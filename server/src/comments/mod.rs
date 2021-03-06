use std::error::Error as StdError;
use std::fmt;
use std::sync::Mutex;

pub mod sqlite;
pub mod postgres;

pub struct Error {}
impl StdError for Error {}
impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Comment error.")
    }
}
impl fmt::Debug for Error{
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Comment error.")
    }
}

#[derive(Deserialize, Serialize, Display)]
enum CommentType {
    DontUnderstand,
    NotCorrect,
    Great,
    Other,
}

#[derive(Deserialize)]
pub struct Comment {
    text: String,
    quote: String,
    #[serde(rename = "type")]
    type_: CommentType,
}

pub trait CommentDatabase {
    fn save_comment(&self, comment: Comment, ip: &str) -> Result<(), Error>;
}

pub struct CommentInMemoryDatabase {
    comments: Mutex<Vec<Comment>>
}

#[allow(dead_code)]
impl CommentInMemoryDatabase {
    pub fn new() -> CommentInMemoryDatabase {
        CommentInMemoryDatabase { comments: Mutex::new(Vec::new()) }
    }
}

impl CommentDatabase for CommentInMemoryDatabase {
    fn save_comment(&self, comment: Comment, _ip: &str) -> Result<(), Error> {
        self.comments.lock().unwrap().push(comment);
        Ok(())
    }
}
