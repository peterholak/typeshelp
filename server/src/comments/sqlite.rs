use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::path::Path;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;
use std::thread;
use std::time::Duration;
use comments::*;
use std::rc::Rc;

pub struct CommentSqliteDatabase {
    pool: Pool<SqliteConnectionManager>
}

struct SqliteCloser {
    pool: Pool<SqliteConnectionManager>
}

#[allow(dead_code)]
impl CommentSqliteDatabase {
    pub fn new<P: AsRef<Path>>(file: P) -> CommentSqliteDatabase {
        let manager = SqliteConnectionManager::file(file);
        let database = CommentSqliteDatabase {
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

impl CommentDatabase for CommentSqliteDatabase {
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
        Rc::new(SqliteCloser { pool: self.pool.clone() })
    }
}

impl DatabaseCloser for SqliteCloser {
    fn finish_writes(&self) {
        let mut counter = 0;
        while self.pool.state().connections != self.pool.state().idle_connections && counter < 30 {
            counter += 1;
            thread::sleep(Duration::from_millis(100));
        }
    }
}
