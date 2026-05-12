import sqlite3
import json
import threading

DB_FILE = 'game_state.db'
lock = threading.Lock()

def get_connection():
    return sqlite3.connect(DB_FILE, check_same_thread=False)

def init_db():
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS state (
                        key TEXT PRIMARY KEY,
                        value TEXT
                    )''')
        c.execute('''CREATE TABLE IF NOT EXISTS teams (
                        id TEXT PRIMARY KEY,
                        name TEXT,
                        color TEXT,
                        score INTEGER,
                        wildcards TEXT,
                        traps TEXT
                    )''')
        c.execute('''CREATE TABLE IF NOT EXISTS active_effects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT,
                        name TEXT,
                        team_id TEXT
                    )''')
        # Setup initial state if empty
        c.execute("SELECT count(*) FROM state")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO state (key, value) VALUES ('phase', '\"setup\"')")
            c.execute("INSERT INTO state (key, value) VALUES ('config', 'null')")
            c.execute("INSERT INTO state (key, value) VALUES ('active_question', 'null')")
            c.execute("INSERT INTO state (key, value) VALUES ('stealable', 'false')")
            c.execute("INSERT INTO state (key, value) VALUES ('has_stolen', 'false')")
            c.execute("INSERT INTO state (key, value) VALUES ('team_order', '[]')")
            c.execute("INSERT INTO state (key, value) VALUES ('current_turn_index', '0')")
        conn.commit()
        conn.close()

def set_state(key, value):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("REPLACE INTO state (key, value) VALUES (?, ?)", (key, json.dumps(value)))
        conn.commit()
        conn.close()

def get_state(key, default=None):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT value FROM state WHERE key = ?", (key,))
        row = c.fetchone()
        conn.close()
        if row:
            return json.loads(row[0])
        return default

def add_team(team_id, name, color):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        wildcards = json.dumps(["double_points", "double_chance", "steal", "shield", "clue"])
        traps = json.dumps(["half_time", "half_points", "minesweeper"])
        c.execute("INSERT OR REPLACE INTO teams (id, name, color, score, wildcards, traps) VALUES (?, ?, ?, 0, ?, ?)",
                  (team_id, name, color, wildcards, traps))
        conn.commit()
        conn.close()

def remove_team(team_id):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM teams WHERE id = ?", (team_id,))
        conn.commit()
        conn.close()

def get_teams():
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT id, name, color, score, wildcards, traps FROM teams")
        rows = c.fetchall()
        conn.close()
        teams = []
        for r in rows:
            teams.append({
                "id": r[0],
                "name": r[1],
                "color": r[2],
                "score": r[3],
                "wildcards": json.loads(r[4]),
                "traps": json.loads(r[5])
            })
        return teams

def update_team_score(team_id, new_score):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("UPDATE teams SET score = ? WHERE id = ?", (new_score, team_id))
        conn.commit()
        conn.close()

def use_item(team_id, item_type, item_name):
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute(f"SELECT {item_type}s FROM teams WHERE id = ?", (team_id,))
        row = c.fetchone()
        if not row:
            conn.close()
            return False
        items = json.loads(row[0])
        if item_name in items:
            items.remove(item_name)
            c.execute(f"UPDATE teams SET {item_type}s = ? WHERE id = ?", (json.dumps(items), team_id))
            c.execute("INSERT INTO active_effects (type, name, team_id) VALUES (?, ?, ?)", (item_type, item_name, team_id))
            conn.commit()
            conn.close()
            return True
        conn.close()
        return False

def get_active_effects():
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT id, type, name, team_id FROM active_effects")
        rows = c.fetchall()
        conn.close()
        return [{"id": r[0], "type": r[1], "name": r[2], "team_id": r[3]} for r in rows]

def clear_active_effects():
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM active_effects")
        conn.commit()
        conn.close()

def reset_game():
    with lock:
        conn = get_connection()
        c = conn.cursor()
        c.execute("DELETE FROM state")
        c.execute("DELETE FROM teams")
        c.execute("DELETE FROM active_effects")
        conn.commit()
        conn.close()
    init_db()
