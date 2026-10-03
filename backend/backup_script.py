import os
import json
import sqlite3

def backup():
    db_paths = [
        'backend/standard_pumps.db',
        'backend/app/database/standard_pumps.db',
        'standard_pumps.db'
    ]
    found = None
    for p in db_paths:
        if os.path.exists(p):
            found = p
            break

    if not found:
        for root, dirs, files in os.walk('backend'):
            for f in files:
                if f.endswith('.db') or f.endswith('.sqlite'):
                    found = os.path.join(root, f)
                    break

    if not found:
        print("No local SQLite database found to export. Initializing clean backup template.")
        backup_data = {"customers": [], "quotations": [], "invoices": []}
        with open('backend/data_backup.json', 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2)
        return

    print(f"Connecting to database: {found}")
    conn = sqlite3.connect(found)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Found tables: {[t[0] for t in tables]}")

    backup_data = {}
    for (tbl,) in tables:
        if tbl != 'sqlite_sequence':
            cursor.execute(f"SELECT * FROM {tbl}")
            rows = cursor.fetchall()
            col_names = [d[0] for d in cursor.description]
            backup_data[tbl] = [dict(zip(col_names, r)) for r in rows]
            print(f"Table '{tbl}': {len(rows)} records exported.")

    conn.close()
    out_file = 'backend/data_backup.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, default=str)
    print(f"Backup successfully written to: {out_file}")

if __name__ == '__main__':
    backup()
