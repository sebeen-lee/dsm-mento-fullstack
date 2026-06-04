import sqlite3 from "sqlite3";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, './data/data.db');
const db = new sqlite3.Database(dbPath);

export function initDb() {
    return new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE IF NOT EXISTS memos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                pinned INTEGER DEFAULT 0,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
                if (err) {
                    reject(err); // 에러 발생 시 reject 호출
                } else {
                    resolve();   // 성공 시 resolve 호출
                }
            }
        );
    });
}

export function createMemo(title, content, callback) {
  db.run(
    "INSERT INTO memos (title, content) VALUES (?, ?)",
    [title, content],
    function (err) {
      callback(err, this?.lastID);
    }
  );
}

export function getMemos(callback) {
    db.all("SELECT * FROM memos", callback);
}

export function getMemosWithOptions(option, callback) {
    if(!option) {
        getMemos(callback);
        return;
    }

    const sort = option?.sort === "ASC".toLowerCase() ? "ASC" : "DESC";
    const limit = option?.limit ?? 3;

    db.all(`SELECT * FROM memos ORDER BY id ${sort} LIMIT ?`,
        [limit],
        callback
    );
}

export function getMemoById(id, callback) {
    db.get("SELECT * FROM memos WHERE id = ?", [id], callback);
}

export function updateMemoById(id, { title, content, pinned, image_url }, callback) {
  db.run(
    `UPDATE memos
     SET title = ?,
         content = ?,
         pinned = ?,
         image_url = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, content, pinned ? 1 : 0, image_url ?? null, id],
    function (err) {
      callback(err, this?.changes ?? 0);
    }
  );
}

export function deleteMemoById(index, callback) {
    db.run("DELETE FROM memos WHERE id = ?"
        [index],
        function(err) {
            callback(err, this?.changes ?? 0);
        }
    );
  // TODO: DELETE FROM memos WHERE id = ?
  // db.run 콜백에서 this.changes → callback(err, changes)
}

export default db;