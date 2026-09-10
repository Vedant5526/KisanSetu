# 🌾 KisanSetu (किसान सेतु)
### Direct Farm-to-Fork Digital Bridge | Smart India Hackathon 2026 (Problem Statement 26033)

[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)
[![Theme](https://img.shields.io/badge/Theme-Agriculture%20%26%20Rural%20Development-orange.svg)](#)
[![Organization](https://img.shields.io/badge/Org-Department%20of%20Consumer%20Affairs%20(DoCA)-blue.svg)](#)

---

## 📌 Problem Overview
Smallholder farmers in India frequently face exploitation by intermediaries, lack of transparent price discovery, and delayed payments. Consumers and institutional buyers face inflated retail costs with uncertain produce freshness.

**KisanSetu** bridges this divide by providing an end-to-end digital marketplace with transparent pricing, integrated smart logistics, multi-language support, automated escrow-based buyer-farmer payments, and AI-driven market intelligence powered by real-time Agmarknet mandi feeds.

---

## 🚀 Core Features

- **🛒 Farmer-to-Consumer Digital Marketplace**:
  - Filter by category (Cereals, Pulses, Vegetables, Fruits, Oilseeds, Spices).
  - Search, sort by price/rating/distance, dynamic cart and checkout.
  - Transparent pricing with per-quintal, per-kg, and bulk lot orders.

- **📈 Agmarknet Live Mandi Feed & AI Forecasting**:
  - Ticker with live APMC mandi rates across India.
  - Price trends and AI-driven harvest timing / selling recommendations.

- **🔒 Aadhaar eKYC & Farmer Profiles**:
  - Trust badge verification system.
  - Farmer dashboard with lot listings, active orders, and revenue insights.

- **🚚 Smart Cold-Chain & Hyperlocal Logistics**:
  - Real-time consignment tracking with temperature/humidity sensor simulations.
  - Route milestones, vehicle assignment, and delivery verification.

- **💳 Escrow Ledger & Instant Payouts**:
  - Multi-party escrow system protecting farmers and buyers.
  - Automatic fund release upon delivery confirmation (OTP / digital signature).

- **🌐 Multi-Language Support**:
  - Native localization for English (EN), Hindi (हिन्दी), and Marathi (मराठी).

- **🗄️ Relational Database Architecture**:
  - Full MySQL 8.0 schema (`kisansetu_db`) with 12 normalized tables.
  - Analytical views (`vw_marketplace_catalog`, `vw_escrow_financial_summary`, `vw_order_tracking_pipeline`).
  - MySQL Workbench visual model (`db.mwb`) and analytical SQL query suite.

---

## 📂 Project Structure

```plaintext
KisanSetu/
├── index.html                # Landing page & platform overview
├── marketplace.html          # Produce catalog, filters, search & shopping cart
├── farmer-dashboard.html     # Farmer portal: listings, AI forecasts, analytics
├── logistics.html            # Fleet dispatch & cold-chain shipment tracking
├── admin-escrow.html         # Escrow management, disputes & UPI settlements
├── login.html                # Multi-role authentication (Farmer / Buyer / Admin)
├── register.html             # Aadhaar eKYC onboarding & registration
├── style.css                 # Root CSS import
├── css/
│   └── style.css             # Comprehensive design system & component styles
├── js/
│   ├── data-store.js         # Reactive central state store & local storage cache
│   └── script.js             # UI interactions, i18n, filtering, and events
└── database/
    ├── README_DATABASE.md    # MySQL Workbench setup & query execution guide
    ├── kisansetu_schema.sql  # 12-table DDL, foreign keys, views & seed data
    ├── sample_queries.sql    # Business intelligence & analytical queries
    └── db.mwb                # MySQL Workbench ER diagram model
```

---

## 🛠️ Quick Start

### 1. Run the Web Application
No build tools or servers are required! Simply open `index.html` in any modern web browser:
- Double click `index.html` or open via VS Code / Antigravity Live Server.

### 2. Set Up the Relational Database (Optional)
1. Open **MySQL Workbench**.
2. Connect to your local MySQL instance (port `3306`).
3. Open `database/kisansetu_schema.sql` and run the script (⚡ Lightning bolt icon).
4. Run queries from `database/sample_queries.sql` to test data flow and analytics.
5. For full instructions, refer to [`database/README_DATABASE.md`](database/README_DATABASE.md).

---

## 🌐 Technologies Used

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, Micro-animations), JavaScript (ES6+)
- **State Management**: Centralized reactive client-side store with `localStorage` persistence
- **Backend/Database**: MySQL 8.0 DDL, Triggers, Views & Workbench ER modeling
- **Integrations**: Agmarknet Mandi API integration model, Aadhaar eKYC simulation, UPI Escrow Payment Gateway simulation

---

## 📜 License
This project is developed for **Smart India Hackathon (SIH 2026)**. All rights reserved.
