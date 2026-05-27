# Database Backup & Export Planning Document

This blueprint documents backup, disaster recovery, and data export strategies designed for standard local/offline and future cloud deployments of the **Standard Pumps Quotation System** SQLite database.

---

## 💾 SQLite Local Backup Strategies

Since SQLite is a single-file relational database (`standard_pumps.db`), it is extremely reliable and easy to copy. We will prepare the following operational strategies:

### 1. Automated Transaction-Safe Dumps
To prevent file corruption during an active write, we will plan an automated task that executes an offline backup by using the SQLite backup API:
```python
import sqlite3

def backup_sqlite_db(src_path="standard_pumps.db", dest_path="backups/standard_pumps_backup.db"):
    con = sqlite3.connect(src_path)
    bck = sqlite3.connect(dest_path)
    with bck:
        con.backup(bck)
    bck.close()
    con.close()
```
* **Schedule**: Hooked to FastAPI startup and teardown, or scheduled as a daily background cron service running at closing time (e.g. 09:00 PM).
* **Retention Policy**: Keep rolling daily backups for the last 30 days, compressed into lightweight ZIP/GZIP files to conserve storage space.

### 2. Manual Backup Export Button
Add a "Backup Database" button in the admin/settings panel of the frontend. Hitting this triggers a GET request to `/api/v1/history/backup` that streams the raw `.db` binary file directly as a local browser download, allowing the shopkeeper to save backups manually to a USB drive or local computer.

---

## 📊 CSV & Excel Spreadsheet Exports

For accounting and stock tracking, the system should allow exporting database tables to standard spreadsheet formats:

### 1. Customer Directory CSV
An export that lists all customers along with their snapshot metrics:
* Columns: `Customer ID`, `Customer Name`, `Clean Phone`, `Total Quotations Generated`, `Total Spend (INR)`, `Last Visit Date`.
* **Utility**: High value for marketing campaigns, bulk festival SMS/WhatsApp wishes, and sales analytics.

### 2. Quotation Registry CSV
A detailed list of all quotation snapshots:
* Columns: `Quotation ID`, `Date`, `Customer Name`, `Phone`, `Bore Depth (FT)`, `Material Mode`, `Grand Total (INR)`, `Status (ACTIVE/ARCHIVED)`.
* **Utility**: Seamless parsing inside Microsoft Excel or Tally ERP for daily balance sheets and financial auditing.

---

## ☁️ Future Cloud Syncing (Hybrid Operational Model)

While the system is designed to run 100% offline, if internet connectivity is detected, a background worker can securely sync database backups:

* **SaaS Storage Sync**: Sync backups to secure Amazon S3 or Google Cloud Storage buckets.
* **Google Drive Integration**: Allow direct backup linking to the shop's personal Google Drive folder using Google OAuth APIs.
* **Incremental Syncing**: Send new/modified rows to a remote web server database (e.g., PostgreSQL) instead of copying the whole SQLite file, allowing real-time multi-branch synchronization.
