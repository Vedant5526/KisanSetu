# KisanSetu MySQL Database & MySQL Workbench Connection Guide

This guide explains how to connect and interact with the **KisanSetu** relational database (`kisansetu_db`) using **MySQL Workbench**.

---

## 1. Quick Connection Settings

Use the following parameters in **MySQL Workbench**:

| Setting | Value |
| :--- | :--- |
| **Connection Name** | `KisanSetu Local` (or any name) |
| **Connection Method** | `Standard (TCP/IP)` |
| **Hostname** | `127.0.0.1` or `localhost` |
| **Port** | `3306` |
| **Username** | `root` |
| **Password** | `root` (Click *"Store in Vault..."* to save) |
| **Default Schema** | `kisansetu_db` |

---

## 2. Step-by-Step: Connecting via MySQL Workbench

1. **Launch MySQL Workbench**:
   - Open **MySQL Workbench 8.0 CE** from your Windows Start Menu.
2. **Connect to Database**:
   - On the welcome screen, you will see **MySQL Connections**.
   - If **"Local instance MySQL80"** is already there, click on it.
   - Enter password: `root`.
   - *(Optional)* Or click the **`+`** icon next to "MySQL Connections" and fill in the parameters from the table above, then click **"Test Connection"** followed by **"OK"**.
3. **Explore the Database**:
   - In the left sidebar under **SCHEMAS**, find **`kisansetu_db`**.
   - Expand `Tables` to view all 12 tables.
   - Expand `Views` to view the 3 pre-built analytical views (`vw_marketplace_catalog`, `vw_escrow_financial_summary`, `vw_order_tracking_pipeline`).
4. **View Table Data**:
   - Right-click on any table (e.g. `crop_listings` or `escrow_ledger`) and select **"Select Rows - Limit 1000"**.
   - You will see the live pre-seeded records immediately!

---

## 3. Opening & Running Queries in Workbench

Two prepared SQL files are located in your project under the `database/` folder:

1. **[`kisansetu_schema.sql`](kisansetu_schema.sql)**:
   - Contains the full DDL table schemas, foreign keys, indexes, views, and seed data.
   - If you ever need to reset or rebuild the database from scratch, open this file in MySQL Workbench (`File -> Open SQL Script...`) and click the **Lightning Bolt (Execute)** icon.
2. **[`sample_queries.sql`](sample_queries.sql)**:
   - Contains 6 pre-crafted analytical queries covering:
     - Active marketplace produce with transparent margin breakdown
     - Escrow ledger with hold-and-release status
     - GMV and Nodal escrow KPIs
     - B2B Bulk RFQ demand contracts and farmer bids
     - CVRPTW logistics pickup/drop route sequence
     - AI 14-day price projections vs Agmarknet mandi rates

---

## 4. Generating the EER Diagram in MySQL Workbench

To visually see the relational Entity-Relationship (ER) diagram of the KisanSetu database:

1. In MySQL Workbench, go to the top menu: **`Database`** ➔ **`Reverse Engineer...`** (or press `Ctrl + R`).
2. Select your stored connection (`Local instance MySQL80` or `127.0.0.1:3306`) and click **Next**.
3. When prompted to select schemas, check **`kisansetu_db`** and click **Next**.
4. Click **Execute** ➔ **Next** ➔ **Finish**.
5. MySQL Workbench will automatically layout an interactive visual diagram with all tables, primary keys, and foreign key connector lines!

---

## 5. Database Schema Summary

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `users` | Platform accounts across all roles | `id`, `user_code`, `role`, `phone`, `kyc_verified`, `aadhaar_masked`, `upi_id` |
| `crop_listings` | Farm produce listings | `id`, `listing_code`, `crop_name`, `category`, `farmer_price_per_kg`, `retail_price_per_kg` |
| `bulk_pricing_tiers`| Wholesale volume discounts | `listing_id`, `min_kg`, `discounted_price_per_kg` |
| `orders` | Purchases & deliveries | `id`, `order_ref`, `buyer_id`, `listing_id`, `order_status`, `escrow_status`, `delivery_otp` |
| `escrow_ledger` | Nodal escrow hold/release engine | `id`, `txn_id`, `order_id`, `farmer_payout`, `status`, `sla_hours_remaining`, `dispute_flag` |
| `rfq_contracts` | B2B bulk institutional tenders | `id`, `rfq_ref`, `crop_name`, `quantity_demanded_kg`, `price_ceiling_per_kg`, `deadline_date` |
| `rfq_bids` | Farmer / FPO bids on RFQs | `rfq_id`, `farmer_id`, `bid_price_per_kg`, `offered_quantity_kg`, `status` |
| `logistics_fleet` | Transport vehicles & EV chillers | `id`, `fleet_code`, `vehicle_type`, `capacity_kg`, `current_load_kg`, `status` |
| `logistics_route_nodes`| CVRPTW route pickup/drop points | `trip_ref`, `node_code`, `demand_qty_kg`, `sequence_order`, `latitude`, `longitude` |
| `mandi_prices_live` | APMC / Agmarknet benchmark rates | `crop_name`, `mandi_name`, `modal_price_per_kg`, `trend_direction`, `recorded_at` |
| `ai_price_forecasts`| AI 14-day price forecasting | `crop_slug`, `current_avg_mandi`, `suggested_farmer_price`, `best_selling_window` |
| `audit_logs` | Tamper-evident admin audit trail | `action_type`, `target_entity`, `performed_by_user_id`, `created_at` |

---

## 6. (Optional) Connecting from Backend Code

### Python (FastAPI / Flask / SQLAlchemy / PyMySQL)
```python
import pymysql

connection = pymysql.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="root",
    database="kisansetu_db",
    cursorclass=pymysql.cursors.DictCursor
)

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM vw_escrow_financial_summary")
    result = cursor.fetchone()
    print("GMV & Escrow KPI:", result)
```

### Node.js (Express / mysql2)
```javascript
const mysql = require('mysql2/promise');

async function getMarketplaceProduce() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'kisansetu_db'
    });

    const [rows] = await connection.execute('SELECT * FROM vw_marketplace_catalog LIMIT 10');
    console.log(rows);
}
```

---

## 7. Troubleshooting

- **MySQL Service Status**:
  If MySQL Workbench reports *"Cannot connect to Database Server"*, verify the Windows service is running in PowerShell:
  ```powershell
  Get-Service MySQL80
  # If stopped, start it with:
  Start-Service MySQL80
  ```
- **Port Conflict**:
  Default port is `3306`. Ensure no other application (like XAMPP or another MariaDB instance) is conflicting on port `3306`.
