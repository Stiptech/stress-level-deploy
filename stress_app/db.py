"""Lapisan data: SQLite + hashing password.

Pengganti localStorage dari versi React. Password disimpan dalam bentuk
hash (PBKDF2), bukan teks biasa seperti versi lama.
"""
import hashlib
import hmac
import os
import secrets
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get("STRESS_DB", "data.db")


@contextmanager
def _conn():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def init_db() -> None:
    with _conn() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                pw_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                student_id TEXT DEFAULT '',
                age INTEGER DEFAULT 0,
                gender TEXT DEFAULT 'male',
                university TEXT DEFAULT '',
                department TEXT DEFAULT '',
                photo BLOB
            );
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                pss INTEGER, gad INTEGER, phq INTEGER,
                primary_domain TEXT, primary_severity TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            """
        )


def _hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)
    return salt.hex() + "$" + dk.hex()


def _verify(password: str, stored: str) -> bool:
    salt_hex, _ = stored.split("$")
    return hmac.compare_digest(_hash(password, bytes.fromhex(salt_hex)), stored)


def register(email: str, password: str, name: str) -> tuple[dict | None, str]:
    email = email.strip().lower()
    try:
        with _conn() as con:
            con.execute(
                "INSERT INTO users (email, pw_hash, name) VALUES (?, ?, ?)",
                (email, _hash(password), name.strip()),
            )
    except sqlite3.IntegrityError:
        return None, "Email sudah terdaftar"
    return get_user_by_email(email), ""


def login(email: str, password: str) -> dict | None:
    email = email.strip().lower()
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row and _verify(password, row["pw_hash"]):
        return _public(row)
    return None


def get_user_by_email(email: str) -> dict | None:
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    return _public(row) if row else None


def get_user(user_id: int) -> dict | None:
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _public(row) if row else None


def _public(row: sqlite3.Row) -> dict:
    d = dict(row)
    d.pop("pw_hash", None)
    return d


def update_profile(user_id: int, **fields) -> None:
    allowed = {"name", "student_id", "age", "gender", "university", "department", "photo"}
    fields = {k: v for k, v in fields.items() if k in allowed}
    if not fields:
        return
    sets = ", ".join(f"{k} = ?" for k in fields)
    with _conn() as con:
        con.execute(f"UPDATE users SET {sets} WHERE id = ?", (*fields.values(), user_id))


def save_result(user_id: int, pss: int, gad: int, phq: int, domain: str, severity: str) -> None:
    with _conn() as con:
        con.execute(
            "INSERT INTO results (user_id, pss, gad, phq, primary_domain, primary_severity) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, pss, gad, phq, domain, severity),
        )


def get_history(user_id: int) -> list[dict]:
    with _conn() as con:
        rows = con.execute(
            "SELECT created_at, pss, gad, phq, primary_domain, primary_severity "
            "FROM results WHERE user_id = ? ORDER BY id DESC",
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]
