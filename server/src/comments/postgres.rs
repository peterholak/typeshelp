use std::path::Path;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use r2d2::Pool;
use r2d2_postgres::{PostgresConnectionManager, TlsMode};

use comments::*;

pub struct CommentPostgresDatabase {
    pool: Pool<PostgresConnectionManager>
}

#[allow(dead_code)]
impl CommentPostgresDatabase {
    pub fn new<P: AsRef<Path>>(_file: P) -> CommentPostgresDatabase {
        let manager = PostgresConnectionManager::new("", TlsMode::None).unwrap();
        let database = CommentPostgresDatabase {
            pool: Pool::new(manager).unwrap()
        };
        let connection = database.pool.get().unwrap();
        connection.batch_execute("PRAGMA journal_mode=WAL").unwrap();
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

impl CommentDatabase for CommentPostgresDatabase {
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
}
