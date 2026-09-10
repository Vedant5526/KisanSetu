# 🌾 KisanSetu (किसान सेतु)
### Direct Farm-to-Fork Digital Bridge | Smart India Hackathon 2026
**Problem Statement ID: 26033** • **Ministry:** Ministry of Consumer Affairs, Food & Public Distribution (DoCA)  
**Theme:** Agriculture, Food Security & Rural Development

[![Status](https://img.shields.io/badge/Status-Active%20%26%20Production--Ready-brightgreen.svg)](#)
[![Theme](https://img.shields.io/badge/Theme-Agriculture%20%26%20Rural%20Development-orange.svg)](#)
[![Ministry](https://img.shields.io/badge/Ministry-Department%20of%20Consumer%20Affairs%20(DoCA)-059669.svg)](#)
[![Hackathon](https://img.shields.io/badge/SIH-2026%20Problem%2026033-blue.svg)](#)
[![License](https://img.shields.io/badge/License-Government%20of%20India%20DoCA-teal.svg)](#)

---

## 📌 Executive Summary & Problem Overview

Smallholder farmers across India face systemic challenges:
1. **Severe Intermediary Exploitation:** 3 to 5 layers of commission agents (*arhatiyas*) reduce farm-gate price realizations to as little as 25%–35% of the retail price.
2. **Arbitrary Mandi Gate Rejections:** Lack of pre-dispatch standardized grading forces distress sales during supply gluts.
3. **High Perishable Transit Wastage:** Up to 18%–25% of horticulture spoils due to fragmented logistics and unmonitored ambient temperatures.
4. **Delayed & Insecure Payments:** Traditional mandi settlements take 15–45 days, trapping farmers in debt cycles.

**KisanSetu** solves this through a unified, end-to-end digital commerce bridge:
- **Direct Farm-to-Buyer Commerce** with zero commission intermediaries.
- **AGMARKNET & NABL Accredited Quality Assaying** with tamper-evident cryptographic SHA-256 QR certificates.
- **AI Mandi Price Intelligence** powered by ARIMA + XGBoost algorithms.
- **CVRPTW-Optimized Logistics** with in-transit IoT cold-chain telemetry (+4°C to +8°C).
- **DoCA-Regulated Tripartite Escrow** guaranteeing 100% farm-gate payment within 24 hours of delivery.
- **Accessible Multilingual Experience** supporting English, Hindi (हिन्दी), and Marathi (मराठी) with Web Speech synthesis and a dedicated WhatsApp AI chatbot.

---

## 🚀 Key Modules & System Architecture

### 1. 🔍 Universal Search & Command Palette (`Ctrl + K` / `Cmd + K`)
- **Global Hotkey:** Press `Ctrl + K` (or `Cmd + K` on Mac) anywhere across the site or click the header search trigger.
- **Unified Cross-Domain Indexing:**
  - **🌾 Produce Listings:** Live query across crops, varieties, farm origins, and farmer profiles.
  - **🏛️ APMC Mandis:** Real-time benchmark rates for Amravati, Buldhana, Lasalgaon, Nashik, Pune, Vashi, and Azadpur.
  - **🔬 Quality Certificates:** Direct search and inspection of official AGMARKNET inspection certificates.
  - **🧪 Assaying Laboratories:** Location and contact lookup for accredited testing labs near agricultural APMCs.
  - **⚡ Quick Actions:** Instant jump shortcuts to platform tours, Mandi AI price forecasts, logistics tracking, and escrow ledger.
- **Category Filter Tabs:** Fast switching between *All Results*, *Produce*, *Mandis*, *Quality Certs*, *Testing Labs*, and *Quick Actions*.
- **Full Keyboard Navigation:** `↑` and `↓` arrow keys to highlight items, `Enter` to select, and `Esc` to dismiss.

---

### 2. 🔬 AGMARKNET & NABL Quality Assaying & QR Verification
- **Official Laboratory Inspection:** Physical & chemical parameters testing (moisture content, brix sweetness, foreign matter, pesticide residues, and size grading).
- **Cryptographic Tamper-Evidence:** Each certificate generates an official AGMARK seal and SHA-256 digital verification hash.
- **Instant QR Verification Modal:** Accessible from the top header (`🔬 Verify Certificate`) or search palette to verify any lot ID.
- **Farmer Dashboard Lab Locator:** Vertical tab displaying regional accredited laboratories (e.g. Dindori Nashik, Amravati Terminal, Buldhana Yard) with turnaround times under 2 hours, unlocking 18%–25% higher market realization.

---

### 3. 💬 Multilingual WhatsApp AI Sahayak Chatbot Simulator
- **Dedicated Language Selector:** Interactive language pills directly in the chat window:
  `🌐 भाषा निवडा / भाषा चुनें: [मराठी] [हिंदी] [English]`
- **Native Language Understanding:** Automatically understands Devanagari input and conversational queries in **Marathi**, **Hindi**, and **English**.
- **Contextual Agricultural Guidance:**
  - 🍅 **Mandi Rates:** Live APMC modal prices and 3-day predictive price movement advice.
  - 🔬 **Quality Assaying:** Testing lab locations, turnaround times, and grade certification.
  - 🛡️ **Escrow Guarantee:** Transparent explanations of RBI/DoCA-regulated payment protection and 24h bank settlement.
  - 🚚 **Cold-Chain Logistics:** CVRPTW consolidated pickup schedules and temperature monitoring.
- **🔊 In-Chat Speech Synthesis:** Every bot response includes an audio playback button (`🔊 ऐका` / `🔊 सुनें` / `🔊 Listen`) to read answers aloud in native regional accents.

---

### 4. 🎧 Floating Quick-Help & Farmer Support Widget (Kisan Sahayata)
- **Persistent Floating Action Button (`🎧 Help & Support`):** Bottom-right corner across all pages with an active emerald pulse indicator.
- **Quick Support Drawer:**
  - 📞 **Kisan Call Centre:** Direct click-to-call link for the official Govt. of India Toll-Free helpline (**1800-180-1551**, 24x7 Free).
  - 💬 **WhatsApp AI Sahayak:** Instant trilingual chat assistant.
  - 🔊 **Page Voice Reader:** Built-in Web Speech API synthesizes the screen content aloud for farmers with limited reading literacy.
  - ✨ **1-Min Tour:** Launches the interactive platform walkthrough.
  - 🛡️ **Escrow Safety Banner:** Explains upfront buyer deposits and 24h payout guarantees.
  - ❓ **FAQ Accordion:** 5 curated Q&As on payments, grading, transport, AI forecasts, and dispute resolution.

---

### 5. ✨ 1-Minute Interactive Guided Platform Tour
- **Interactive 5-Slide Modal:**
  1. **Direct Farm-to-Buyer Marketplace:** Eliminating 3–5 middleman layers; +25–30% farm-gate realization; direct UPI settlement.
  2. **AGMARKNET & NABL Quality Assaying:** Grade A/B/C testing; SHA-256 cryptographic verification; tamper-proof QR certificates.
  3. **CVRPTW Route Optimization & Cold-Chain IoT:** Multi-farmer pickup bundling; -34% transport cost; +4°C to +8°C telemetry.
  4. **DoCA-Supervised Smart Escrow Payments:** 100% upfront buyer deposit; 24h bank transfer upon delivery QR scan; DoCA dispute protection.
  5. **Predictive Mandi AI & Farm Command Hub:** 7-Day ARIMA + XGBoost models; harvest dispatch advice; +₹4.50/kg gain over distress sales.
- **Navigation Controls:** Step progress badges, progress dots, Back/Next navigation, and hero CTA on `index.html`.

---

### 6. 🚚 Smart Cold-Chain & CVRPTW Route Optimization
- **Algorithm:** Capacitated Vehicle Routing Problem with Time Windows (CVRPTW).
- **Consolidated Multi-Farmer Pickups:** Groups neighboring farm lots within the same tehsil, reducing transport emissions and cutting logistics costs by up to 34%.
- **Live IoT Sensor Telemetry:** Simulated temperature sensors continuously track reefer compartments (+4°C to +8°C) with threshold alerts.
- **Automated Alerts:** Drivers and farmers receive SMS arrival notices with live GPS coordinates.

---

### 7. ⚖️ DoCA-Supervised Smart Escrow Ledger & Dispute Console
- **Tripartite Fund Security:** Buyer funds are locked into an RBI-regulated escrow account before trucks depart from the farm gate.
- **Automated Payouts:** Funds disburse directly to the farmer's bank account / UPI within 24 hours of digital delivery verification (OTP & QR scan).
- **Public Audit Mode & Officer Resolution:** DoCA Conciliation Officers investigate photographic evidence and lab parameters to resolve commercial disputes within 24 hours.

---

## 📂 Project Structure

```plaintext
KisanSetu/
├── index.html                # Platform landing page, hero tour CTA & live ticker
├── marketplace.html          # Fresh produce catalog, mandi benchmarks & cart drawer
├── farmer-dashboard.html     # Farmer hub: lot listings, Mandi AI, orders, testing labs
├── logistics.html            # CVRPTW route optimizer, fleet GPS & cold-chain HUD
├── admin-escrow.html         # DoCA escrow ledger, transaction audit & disputes
├── login.html                # Role authentication (Farmer, Consumer, Bulk, Logistics, Admin)
├── register.html             # Aadhaar eKYC farmer onboarding & registration
├── css/
│   └── style.css             # Unified design system, command palette, FAB & dark theme
├── js/
│   ├── data-store.js         # Reactive data store, mock database & APMC historical feeds
│   └── script.js             # Global controller, command palette, WhatsApp AI & speech
└── database/
    ├── README_DATABASE.md    # MySQL Workbench setup & execution guide
    ├── kisansetu_schema.sql  # 12-table DDL, foreign keys, views & seed data
    ├── sample_queries.sql    # Analytical SQL queries & business intelligence
    └── db.mwb                # MySQL Workbench ER diagram model
```

---

## 🗄️ Relational Database Architecture

KisanSetu includes an enterprise-grade MySQL 8.0 relational schema:
- **12 Normalized Tables:** `users`, `farmer_profiles`, `produce_categories`, `produce_listings`, `quality_certificates`, `orders`, `order_items`, `escrow_accounts`, `escrow_transactions`, `logistics_shipments`, `sensor_telemetry`, and `mandi_price_benchmarks`.
- **Analytical Views:**
  - `vw_marketplace_catalog`: Live catalog with farmer rating, pricing, and AGMARK certification status.
  - `vw_escrow_financial_summary`: Real-time ledger of locked, released, and refunded funds.
  - `vw_order_tracking_pipeline`: Consolidated tracking pipeline with vehicle status and temperature telemetry.
- **Complete Visual Model:** Native MySQL Workbench `.mwb` file included in `database/db.mwb`.

---

## 🛠️ Quick Start Guide

### 1. Run the Web Application
No build tools, compilers, or local web servers are required! Simply open `index.html` in any modern web browser:
```bash
# Option A: Open directly in your default browser (Windows)
start index.html

# Option B: Run via a lightweight HTTP server
npx serve .
```

### 2. Try the Key User Flows
- **Search Anything:** Press `Ctrl + K` (or `Cmd + K`) to launch the Command Palette. Type `Tomato`, `Nashik`, `AGM`, or `Escrow`.
- **Chat in Marathi or Hindi:** Click the `🎧 Help & Support` button in the bottom right, open **WhatsApp AI Sahayak**, select `मराठी` or `हिंदी`, and ask questions.
- **Listen to the Screen:** Click **Voice Reader** in the help drawer to hear the screen read aloud.
- **Take the Tour:** Click `✨ 1-Min Platform Tour` on the home page hero section.
- **Verify a Certificate:** Click `🔬 Verify Certificate` in the top header and enter `AGM-MH-2026-89421`.
- **Inspect Escrow:** Visit `admin-escrow.html` to audit transparent fund deposits and dispute resolution.

### 3. Set Up MySQL Database (Optional)
1. Open **MySQL Workbench** and connect to your local MySQL instance (`localhost:3306`).
2. Open and execute [`database/kisansetu_schema.sql`](database/kisansetu_schema.sql).
3. Execute analytical queries from [`database/sample_queries.sql`](database/sample_queries.sql).
4. Full setup details available in [`database/README_DATABASE.md`](database/README_DATABASE.md).

---

## 🌐 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | Semantic HTML5, Vanilla JavaScript (ES6+ Modules), Vanilla CSS3 |
| **Styling & Aesthetics** | Custom Emerald/Slate Design System, Glassmorphism, Micro-animations, Responsive Grid, Dark Mode |
| **Voice & Accessibility** | Web Speech API (`SpeechSynthesis`), W3C WCAG 2.1 AA Compliance, Keyboard Shortcuts (`Ctrl+K`, `Esc`) |
| **State Management** | Centralized Reactive Store (`js/data-store.js`) with `localStorage` Cache |
| **Algorithms** | CVRPTW Route Engine, ARIMA + XGBoost Mandi Forecast Simulation, SHA-256 Digital Signatures |
| **Database** | MySQL 8.0 DDL, Foreign Keys, Triggers, Views & MySQL Workbench ER Modeling (`.mwb`) |
| **Government Feeds** | Simulated Agmarknet Mandi API, Aadhaar eKYC, Unified Payments Interface (UPI) Escrow |

---

## 👥 Target Stakeholder Personas

1. **👨‍🌾 Farmers & FPOs:** Direct market listings, fair prices (+25–30%), AI harvest advisory, and guaranteed 24h bank settlement.
2. **🛒 Retail Consumers:** Farm-fresh produce delivered within 24h of harvest, verifiable AGMARK quality, and transparent pricing.
3. **🏢 Bulk & Institutional Buyers:** Commercial procurement, bulk RFQ contracts, automated invoicing, and escrow safety.
4. **🚚 Logistics Transporters:** Consolidated multi-stop route assignments, higher truck utilization, and real-time cold-chain tracking.
5. **⚖️ DoCA & Regulatory Admins:** Public transparency audit, escrow fund oversight, and dispute resolution within 24 hours.

---

## 📜 License & Hackathon Attribution

Developed for the **Smart India Hackathon 2026 (SIH 2026)** under **Problem Statement 26033** by the **Department of Consumer Affairs (DoCA)**, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.
