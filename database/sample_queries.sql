-- ========================================================================
-- KisanSetu - Helpful Queries for MySQL Workbench Testing
-- Smart India Hackathon 2026 - Problem Statement 26033
-- ========================================================================

USE `kisansetu_db`;

-- 1. View All Active Marketplace Produce with Farmer KYC & Margin Breakdown
SELECT 
    listing_code,
    crop_name,
    category,
    region,
    farmer_name,
    fpo_name,
    farmer_price_per_kg AS `Farmer Share (₹)`,
    logistics_fee_per_kg AS `Cold Chain Logistics (₹)`,
    platform_fee_per_kg AS `Platform 3% (₹)`,
    retail_price_per_kg AS `KisanSetu Direct (₹)`,
    traditional_mandi_price AS `Traditional Mandi (₹)`,
    consumer_savings_pct AS `Consumer Saved %`,
    farmer_gain_pct AS `Farmer Higher Income %`,
    freshness_score
FROM `vw_marketplace_catalog`
ORDER BY category, crop_name;

-- 2. Inspect Escrow Ledger & Nodal Account Balances (SIH Section 11)
SELECT 
    e.txn_id AS `Escrow Ref`,
    e.status AS `Escrow Status`,
    o.order_ref AS `Order Ref`,
    e.buyer_id,
    u_buyer.full_name AS `Buyer Name`,
    u_farmer.full_name AS `Farmer Name`,
    u_farmer.upi_id AS `Disbursement VPA`,
    e.gross_amount AS `Held Amount (₹)`,
    e.farmer_payout AS `Farmer Payout (₹)`,
    e.sla_hours_remaining AS `Hours Left in SLA`,
    e.dispute_flag AS `Disputed?`,
    e.settlement_utr AS `Bank UTR`
FROM `escrow_ledger` e
JOIN `orders` o ON e.order_id = o.id
JOIN `users` u_buyer ON e.buyer_id = u_buyer.id
JOIN `users` u_farmer ON e.farmer_id = u_farmer.id
ORDER BY e.id DESC;

-- 3. Live Escrow KPI Metrics Summary (Matches Admin Escrow Dashboard)
SELECT * FROM `vw_escrow_financial_summary`;

-- 4. Check Open Bulk RFQ Tenders and Submitted Farmer Bids
SELECT 
    r.rfq_ref,
    r.crop_name,
    r.quantity_demanded_kg AS `Demand (kg)`,
    r.price_ceiling_per_kg AS `Ceiling Price (₹/kg)`,
    r.deadline_date,
    r.status AS `RFQ Status`,
    b.bid_price_per_kg AS `Farmer Bid (₹/kg)`,
    b.offered_quantity_kg AS `Offered (kg)`,
    u.full_name AS `Bidding Farmer`,
    u.fpo_name AS `FPO Org`,
    b.status AS `Bid Status`
FROM `rfq_contracts` r
LEFT JOIN `rfq_bids` b ON r.id = b.rfq_id
LEFT JOIN `users` u ON b.farmer_id = u.id;

-- 5. Inspect Logistics Route Nodes (CVRPTW Optimized Route)
SELECT 
    sequence_order,
    node_code,
    node_name,
    node_type,
    demand_qty_kg AS `Pickup(+) / Drop(-) kg`,
    latitude,
    longitude,
    is_completed
FROM `logistics_route_nodes`
WHERE trip_ref = 'TRIP-Nashik-Pune-01'
ORDER BY sequence_order ASC;

-- 6. AI 14-Day Price Forecasts vs Current Mandi Rates
SELECT 
    crop_name,
    current_avg_mandi AS `Mandi Benchmark (₹/kg)`,
    suggested_farmer_price AS `AI Suggested Listing Price (₹/kg)`,
    CONCAT('₹', confidence_lower, ' - ₹', confidence_upper) AS `Confidence Range`,
    best_selling_window AS `Optimal Selling Window`,
    ai_rationale AS `AI Insight`
FROM `ai_price_forecasts`;
