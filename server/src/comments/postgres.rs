use r2d2::Pool;
use r2d2_postgres::{PostgresConnectionManager, TlsMode};
use std::path::Path;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;
use std::thread;
use std::time::Duration;
use comments::*;
use std::rc::Rc;

pub struct CommentPostgresDatabase {
    pool: Pool<PostgresConnectionManager>
}

struct PostgresCloser {
    pool: Pool<PostgresConnectionManager>
}

#[allow(dead_code)]
impl CommentPostgresDatabase {
    pub fn new<P: AsRef<Path>>(file: P) -> CommentPostgresDatabase {
        let manager = PostgresConnectionManager::new("", TlsMode::None);
        let database = CommentPostgresDatabase {
            pool: Pool::new(manager).unwrap()
        };
        let connection = database.pool.get().unwrap();
        connection.execute_batch("PRAGMA journal_mode=WAL").unwrap();
        connection.execute("CREATE TABLE IF NOT EXISTS comment(\
            id INTEGER PRIMARY KEY,\
            text TEXT NOT NULL,\
            quote TEXT NOT NULL,\
            type TEXT NOT NULL,\
            created INTEGER NOT NULL,\
            ip TEXT NOT NULL
        )", &[]).unwrap();
        database
    }
}

impl CommentDatabase for PostgresConnectionManager {
    fn save_comment(&self, comment: Comment, ip: &str) -> Result<(), Error> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH).unwrap()
            .as_secs()
            as i64;

        let connection = self.pool.get().unwrap();

        connection
            .execute(
                "INSERT INTO comment(text, quote, type, created, ip) VALUES(?1, ?2, ?3, ?4, ?5)",
                &[
                    &comment.text,
                    &comment.quote,
                    &comment.type_.to_string(),
                    &now,
                    &ip.to_string()
                ],
            )
            .map(|_| ())
            .map_err(|_| Error{})
    }

    fn get_closer(&self) -> Rc<DatabaseCloser> {
        Rc::new(PostgresCloser { pool: self.pool.clone() })
    }
}

impl DatabaseCloser for PostgresCloser {
    fn finish_writes(&self) {
        let mut counter = 0;
        while self.pool.state().connections != self.pool.state().idle_connections && counter < 30 {
            counter += 1;
            thread::sleep(Duration::from_millis(100));
        }
    }
}