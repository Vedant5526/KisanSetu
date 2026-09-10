-- ========================================================================
-- KisanSetu Database Architecture & Schema Definition
-- Smart India Hackathon 2026 - Problem Statement 26033
-- Ministry of Consumer Affairs, Food & Public Distribution
-- ========================================================================
-- Target RDBMS: MySQL 8.0+ / MariaDB 10.4+
-- Connection Tool: MySQL Workbench / Adminer / DBeaver / Navicat
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `kisansetu_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `kisansetu_db`;

-- Set SQL Modes for data integrity
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `ai_price_forecasts`;
DROP TABLE IF EXISTS `mandi_prices_live`;
DROP TABLE IF EXISTS `logistics_route_nodes`;
DROP TABLE IF EXISTS `rfq_bids`;
DROP TABLE IF EXISTS `rfq_contracts`;
DROP TABLE IF EXISTS `escrow_ledger`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `bulk_pricing_tiers`;
DROP TABLE IF EXISTS `crop_listings`;
DROP TABLE IF EXISTS `logistics_fleet`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- 1. USERS TABLE
-- Platform participants across all stakeholder roles:
-- Farmer/FPO, Retail Consumer, Bulk Commercial Buyer, Logistics, Admin
-- ========================================================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'System readable identifier (e.g. usr_farmer_01)',
    `full_name` VARCHAR(150) NOT NULL,
    `role` ENUM('farmer', 'consumer', 'bulk', 'logistics', 'admin') NOT NULL DEFAULT 'farmer',
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(150) DEFAULT NULL,
    `password_hash` VARCHAR(255) DEFAULT '$2a$12$e8rG6vQ9rF1eXExampleHashKisanSetu2026SecureKey',
    `district` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `location_full` VARCHAR(255) NOT NULL,
    `kyc_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `aadhaar_masked` VARCHAR(25) DEFAULT NULL COMMENT 'e.g. XXXX-XXXX-8921 (UIDAI sandboxed token)',
    `gstin` VARCHAR(30) DEFAULT NULL COMMENT 'For bulk commercial buyers & processors',
    `fpo_name` VARCHAR(150) DEFAULT NULL COMMENT 'Farmer Producer Organization membership if applicable',
    `upi_id` VARCHAR(100) DEFAULT NULL COMMENT 'Direct settlement VPA for instant escrow disbursement',
    `bank_account_number` VARCHAR(50) DEFAULT NULL,
    `bank_ifsc` VARCHAR(20) DEFAULT NULL,
    `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    `reviews_count` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB COMMENT='Registered platform stakeholders and KYC credentials';

-- ========================================================================
-- 2. LOGISTICS FLEET TABLE
-- Active transport vehicles, EV chillers, capacities, and driver details
-- ========================================================================
CREATE TABLE `logistics_fleet` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `fleet_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. VEH-01',
    `driver_user_id` INT DEFAULT NULL,
    `driver_name` VARCHAR(150) NOT NULL,
    `driver_phone` VARCHAR(20) NOT NULL,
    `vehicle_type` VARCHAR(120) NOT NULL COMMENT 'e.g. Tata Ace 1.2 Ton EV Chiller',
    `license_plate` VARCHAR(30) NOT NULL UNIQUE,
    `capacity_kg` DECIMAL(10,2) NOT NULL,
    `current_load_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('idle', 'active_route', 'maintenance', 'offline') NOT NULL DEFAULT 'idle',
    `current_latitude` DECIMAL(10,6) DEFAULT 19.997500,
    `current_longitude` DECIMAL(10,6) DEFAULT 73.789800,
    `last_gps_update` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fleet_driver` FOREIGN KEY (`driver_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_fleet_status` (`status`)
) ENGINE=InnoDB COMMENT='Refrigerated and local fleet vehicles for CVRPTW routing';

-- ========================================================================
-- 3. CROP LISTINGS TABLE
-- Farm produce listings posted directly by farmers & FPOs with transparent pricing
-- ========================================================================
CREATE TABLE `crop_listings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `listing_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. lst_101',
    `farmer_id` INT NOT NULL,
    `crop_name` VARCHAR(120) NOT NULL,
    `category` ENUM('veg', 'fruits', 'grains', 'pulses', 'spices', 'dairy') NOT NULL DEFAULT 'veg',
    `grade_variety` VARCHAR(100) DEFAULT 'Grade A Export Quality',
    `region` VARCHAR(150) NOT NULL,
    `latitude` DECIMAL(10,6) DEFAULT 20.203000,
    `longitude` DECIMAL(10,6) DEFAULT 73.834000,
    `photo_url` TEXT DEFAULT NULL,
    `quantity_available_kg` DECIMAL(10,2) NOT NULL,
    `min_order_retail_kg` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    `min_order_bulk_kg` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    `harvest_date_str` VARCHAR(100) DEFAULT 'Harvested Today',
    `freshness_score` VARCHAR(50) DEFAULT '98% Ultra Fresh',
    `farmer_price_per_kg` DECIMAL(10,2) NOT NULL COMMENT 'Guaranteed direct net farmer share',
    `logistics_fee_per_kg` DECIMAL(10,2) NOT NULL COMMENT 'AI-optimized cold chain transit share',
    `platform_fee_per_kg` DECIMAL(10,2) NOT NULL COMMENT 'Transparent 3% to 3.5% tech fee',
    `retail_price_per_kg` DECIMAL(10,2) NOT NULL COMMENT 'Final consumer price = farmer + logistics + platform',
    `traditional_mandi_price` DECIMAL(10,2) NOT NULL COMMENT 'Middleman inflated price reference',
    `is_organic` BOOLEAN NOT NULL DEFAULT FALSE,
    `description` TEXT DEFAULT NULL,
    `status` ENUM('active', 'sold_out', 'paused', 'deleted') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_listings_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_listings_category` (`category`),
    INDEX `idx_listings_status` (`status`),
    INDEX `idx_listings_crop` (`crop_name`)
) ENGINE=InnoDB COMMENT='Direct farmer produce marketplace listings';

-- ========================================================================
-- 4. BULK PRICING TIERS TABLE
-- Tiered wholesale volume pricing for commercial buyers (e.g. >100kg, >500kg)
-- ========================================================================
CREATE TABLE `bulk_pricing_tiers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `listing_id` INT NOT NULL,
    `min_kg` DECIMAL(10,2) NOT NULL,
    `discounted_price_per_kg` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `fk_bulk_tiers_listing` FOREIGN KEY (`listing_id`) REFERENCES `crop_listings` (`id`) ON DELETE CASCADE,
    INDEX `idx_tiers_listing` (`listing_id`)
) ENGINE=InnoDB COMMENT='Wholesale volume discount tiers for B2B buyers';

-- ========================================================================
-- 5. ORDERS TABLE
-- Consumer and bulk purchase orders with delivery tracking and status lifecycle
-- ========================================================================
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_ref` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. ORD-8821',
    `buyer_id` INT NOT NULL,
    `listing_id` INT NOT NULL,
    `buyer_name` VARCHAR(150) NOT NULL,
    `buyer_phone` VARCHAR(20) NOT NULL,
    `delivery_address` TEXT NOT NULL,
    `crop_summary` VARCHAR(255) NOT NULL,
    `quantity_kg` DECIMAL(10,2) NOT NULL,
    `farmer_payout` DECIMAL(10,2) NOT NULL,
    `logistics_fee` DECIMAL(10,2) NOT NULL,
    `platform_fee` DECIMAL(10,2) NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `order_status` ENUM('pending', 'escrow_held', 'in_transit', 'delivered', 'escrow_released', 'disputed', 'cancelled') NOT NULL DEFAULT 'escrow_held',
    `escrow_status` ENUM('held', 'released', 'disputed', 'refunded') NOT NULL DEFAULT 'held',
    `tracking_ref` VARCHAR(50) DEFAULT NULL,
    `eta_description` VARCHAR(150) DEFAULT NULL,
    `assigned_fleet_id` INT DEFAULT NULL,
    `driver_name_display` VARCHAR(150) DEFAULT NULL,
    `delivery_otp` VARCHAR(6) NOT NULL DEFAULT '123456' COMMENT 'OTP required for buyer delivery confirmation',
    `dispute_reason` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_orders_listing` FOREIGN KEY (`listing_id`) REFERENCES `crop_listings` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_orders_fleet` FOREIGN KEY (`assigned_fleet_id`) REFERENCES `logistics_fleet` (`id`) ON DELETE SET NULL,
    INDEX `idx_orders_status` (`order_status`),
    INDEX `idx_orders_escrow_status` (`escrow_status`),
    INDEX `idx_orders_ref` (`order_ref`)
) ENGINE=InnoDB COMMENT='Customer orders and shipment delivery status';

-- ========================================================================
-- 6. ESCROW LEDGER TABLE
-- Transparent Nodal Escrow Hold-and-Release State Machine
-- Mandated under SIH 2026 Problem Statement 26033 (Section 11)
-- ========================================================================
CREATE TABLE `escrow_ledger` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `txn_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. ESC-9921',
    `order_id` INT NOT NULL UNIQUE,
    `buyer_id` INT NOT NULL,
    `farmer_id` INT NOT NULL,
    `gross_amount` DECIMAL(10,2) NOT NULL,
    `farmer_payout` DECIMAL(10,2) NOT NULL,
    `logistics_fee` DECIMAL(10,2) NOT NULL,
    `platform_fee` DECIMAL(10,2) NOT NULL,
    `status` ENUM('held', 'released', 'disputed', 'refunded') NOT NULL DEFAULT 'held',
    `payment_method` VARCHAR(50) NOT NULL DEFAULT 'UPI',
    `gateway_nodal_ref` VARCHAR(100) NOT NULL DEFAULT 'NODAL_HDFC_ESCROW_9921',
    `settlement_utr` VARCHAR(100) DEFAULT NULL COMMENT 'Bank UTR on release to farmer UPI/account',
    `sla_hours_remaining` INT NOT NULL DEFAULT 24 COMMENT 'Auto-release SLA countdown in hours',
    `dispute_flag` BOOLEAN NOT NULL DEFAULT FALSE,
    `dispute_notes` TEXT DEFAULT NULL,
    `released_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_escrow_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_escrow_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_escrow_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    INDEX `idx_escrow_status` (`status`),
    INDEX `idx_escrow_txn` (`txn_id`)
) ENGINE=InnoDB COMMENT='Transparent nodal escrow accounts and dispute records';

-- ========================================================================
-- 7. RFQ CONTRACTS TABLE (Bulk Request for Quotations)
-- Institutional buyers posting wholesale harvest demands
-- ========================================================================
CREATE TABLE `rfq_contracts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rfq_ref` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. RFQ-501',
    `buyer_id` INT NOT NULL,
    `buyer_company_name` VARCHAR(150) NOT NULL,
    `buyer_gstin` VARCHAR(30) NOT NULL,
    `crop_name` VARCHAR(120) NOT NULL,
    `quantity_demanded_kg` DECIMAL(10,2) NOT NULL,
    `price_ceiling_per_kg` DECIMAL(10,2) NOT NULL,
    `delivery_location` VARCHAR(255) NOT NULL,
    `deadline_date` DATE NOT NULL,
    `recurring_frequency` VARCHAR(50) DEFAULT 'One-time',
    `status` ENUM('open', 'awarded', 'closed', 'cancelled') NOT NULL DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rfq_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_rfq_status` (`status`)
) ENGINE=InnoDB COMMENT='B2B bulk procurement contracts and demand tenders';

-- ========================================================================
-- 8. RFQ BIDS TABLE
-- Direct bids submitted by farmers and FPO cooperatives on open RFQs
-- ========================================================================
CREATE TABLE `rfq_bids` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rfq_id` INT NOT NULL,
    `farmer_id` INT NOT NULL,
    `bid_price_per_kg` DECIMAL(10,2) NOT NULL,
    `offered_quantity_kg` DECIMAL(10,2) NOT NULL,
    `fulfillment_note` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bids_rfq` FOREIGN KEY (`rfq_id`) REFERENCES `rfq_contracts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bids_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_bids_status` (`status`)
) ENGINE=InnoDB COMMENT='Farmer bids on bulk procurement tenders';

-- ========================================================================
-- 9. LOGISTICS ROUTE NODES TABLE
-- Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) nodes
-- ========================================================================
CREATE TABLE `logistics_route_nodes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `trip_ref` VARCHAR(50) NOT NULL DEFAULT 'TRIP-Nashik-Pune-01',
    `node_code` VARCHAR(50) NOT NULL,
    `node_name` VARCHAR(150) NOT NULL,
    `node_type` ENUM('depot', 'pickup', 'drop') NOT NULL,
    `latitude` DECIMAL(10,6) NOT NULL,
    `longitude` DECIMAL(10,6) NOT NULL,
    `demand_qty_kg` DECIMAL(10,2) NOT NULL COMMENT 'Positive for pickup, negative for drop',
    `sequence_order` INT NOT NULL DEFAULT 1,
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX `idx_trip_nodes` (`trip_ref`, `sequence_order`)
) ENGINE=InnoDB COMMENT='CVRPTW pickup and drop hubs for intelligent vehicle routing';

-- ========================================================================
-- 10. MANDI PRICES LIVE TABLE
-- Live APMC / Agmarknet market benchmark prices for farmer comparison
-- ========================================================================
CREATE TABLE `mandi_prices_live` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `crop_name` VARCHAR(120) NOT NULL,
    `mandi_name` VARCHAR(120) NOT NULL,
    `state` VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    `modal_price_per_kg` DECIMAL(10,2) NOT NULL,
    `min_price_per_kg` DECIMAL(10,2) NOT NULL,
    `max_price_per_kg` DECIMAL(10,2) NOT NULL,
    `price_change_str` VARCHAR(20) NOT NULL,
    `trend_direction` ENUM('up', 'down', 'stable') NOT NULL DEFAULT 'stable',
    `recorded_at` DATE NOT NULL,
    INDEX `idx_mandi_crop` (`crop_name`),
    INDEX `idx_mandi_name` (`mandi_name`)
) ENGINE=InnoDB COMMENT='Agmarknet and APMC traditional market price benchmarks';

-- ========================================================================
-- 11. AI PRICE FORECASTS TABLE
-- Machine learning 14-day price forecasting with confidence intervals
-- ========================================================================
CREATE TABLE `ai_price_forecasts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `crop_slug` VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. tomato, onion, potato',
    `crop_name` VARCHAR(120) NOT NULL,
    `current_avg_mandi` DECIMAL(10,2) NOT NULL,
    `suggested_farmer_price` DECIMAL(10,2) NOT NULL,
    `confidence_lower` DECIMAL(10,2) NOT NULL,
    `confidence_upper` DECIMAL(10,2) NOT NULL,
    `best_selling_window` VARCHAR(255) NOT NULL,
    `ai_rationale` TEXT NOT NULL,
    `historical_days_json` JSON NOT NULL,
    `historical_prices_json` JSON NOT NULL,
    `forecast_days_json` JSON NOT NULL,
    `forecast_prices_json` JSON NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Agri-AI price projections and harvest timing recommendations';

-- ========================================================================
-- 12. AUDIT LOGS TABLE
-- Complete tamper-evident log for admin actions and dispute resolutions
-- ========================================================================
CREATE TABLE `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `action_type` VARCHAR(80) NOT NULL,
    `performed_by_user_id` INT DEFAULT NULL,
    `target_entity` VARCHAR(80) NOT NULL,
    `target_id` INT NOT NULL,
    `details` TEXT DEFAULT NULL,
    `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`performed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Audit trail for escrow disbursements, KYC, and disputes';

-- ========================================================================
-- SEED DATA INSERTION
-- Comprehensive realistic dataset mirroring KisanSetu frontend and SIH demo
-- ========================================================================

-- Insert Platform Users
INSERT INTO `users` (`id`, `user_code`, `full_name`, `role`, `phone`, `email`, `district`, `state`, `location_full`, `kyc_verified`, `aadhaar_masked`, `gstin`, `fpo_name`, `upi_id`, `rating`, `reviews_count`) VALUES
(1, 'usr_farmer_01', 'Ramesh Balasaheb Shinde', 'farmer', '9822014523', 'ramesh.shinde@kisansetu.in', 'Nashik', 'Maharashtra', 'Dindori, Nashik, Maharashtra', TRUE, 'XXXX-XXXX-8921', NULL, 'Sahyadri Farmers Producer Co.', 'ramesh.shinde@oksbi', 4.90, 142),
(2, 'usr_farmer_02', 'Balwantrao Patil', 'farmer', '9822087612', 'balwantrao.patil@kisansetu.in', 'Nashik', 'Maharashtra', 'Lasalgaon, Niphad, Maharashtra', TRUE, 'XXXX-XXXX-4512', NULL, 'Godavari Valley FPO', 'balwant.patil@okhdfcbank', 4.85, 98),
(3, 'usr_farmer_03', 'Kailash Deshmukh', 'farmer', '9823055412', 'kailash.deshmukh@kisansetu.in', 'Pune', 'Maharashtra', 'Khed, Pune, Maharashtra', TRUE, 'XXXX-XXXX-7721', NULL, 'Manchar Agro Farmer Producer Co.', 'kailash.deshmukh@icici', 4.80, 64),
(4, 'usr_farmer_04', 'Ganesh Kadam', 'farmer', '9823411223', 'ganesh.kadam@kisansetu.in', 'Sindhudurg', 'Maharashtra', 'Devgad, Sindhudurg, Maharashtra', TRUE, 'XXXX-XXXX-9904', NULL, 'Konkan Mango Growers Producer Org.', 'ganesh.kadam@kotak', 4.95, 210),
(5, 'usr_farmer_05', 'Sunil Wankhede', 'farmer', '9823789012', 'sunil.wankhede@kisansetu.in', 'Nagpur', 'Maharashtra', 'Katol, Nagpur, Maharashtra', TRUE, 'XXXX-XXXX-3345', NULL, 'Vidarbha Citrus FPO', 'sunil.wankhede@paytm', 4.75, 52),
(6, 'usr_farmer_06', 'Narayan Rao Verma', 'farmer', '9823901234', 'narayan.verma@kisansetu.in', 'Sehore', 'Madhya Pradesh', 'Sehore, MP Border Hub', TRUE, 'XXXX-XXXX-1122', NULL, 'Narmada Krishi Producer Co.', 'narayan.verma@ybl', 4.90, 115),
(7, 'usr_farmer_07', 'Sudhakar Bhave', 'farmer', '9823567890', 'sudhakar.bhave@kisansetu.in', 'Palghar', 'Maharashtra', 'Wada, Palghar, Maharashtra', TRUE, 'XXXX-XXXX-6677', NULL, 'Palghar Tribal Agro Cooperative', 'sudhakar.bhave@oksbi', 4.92, 88),
(8, 'usr_consumer_01', 'Sneha Kulkarni', 'consumer', '9823419082', 'sneha.kulkarni@gmail.com', 'Pune', 'Maharashtra', 'Baner, Pune, MH - 411045', TRUE, 'XXXX-XXXX-3419', NULL, NULL, 'sneha.kulkarni@okhdfcbank', 5.00, 12),
(9, 'usr_consumer_02', 'Anand Joshi', 'consumer', '9422019943', 'anand.joshi@gmail.com', 'Pune', 'Maharashtra', 'Kothrud, Pune, MH - 411038', TRUE, 'XXXX-XXXX-9943', NULL, NULL, 'anand.joshi@axisbank', 5.00, 8),
(10, 'usr_bulk_01', 'GreenGrocer Fresh Mart (Bulk)', 'bulk', '9890123456', 'procurement@greengrocer.in', 'Pune', 'Maharashtra', 'Viman Nagar Wholesale Hub, Pune', TRUE, NULL, '27AABCG4521M1ZR', NULL, 'greengrocer@icici', 4.90, 44),
(11, 'usr_bulk_02', 'FreshKart Hypermarkets Ltd.', 'bulk', '9890234567', 'supply@freshkart.in', 'Mumbai', 'Maharashtra', 'Bhiwandi Central DC, Mumbai-Thane', TRUE, NULL, '27AABCF4921K1ZZ', NULL, 'freshkart@hdfcbank', 4.95, 78),
(12, 'usr_driver_01', 'Santosh Jadhav', 'logistics', '9823671234', 'santosh.jadhav@kisansetu.in', 'Nashik', 'Maharashtra', 'Panchavati, Nashik, Maharashtra', TRUE, 'XXXX-XXXX-1234', NULL, NULL, 'santosh.jadhav@oksbi', 4.88, 320),
(13, 'usr_admin_01', 'KisanSetu Escrow Nodal Admin', 'admin', '9800012345', 'nodal.admin@kisansetu.gov.in', 'New Delhi', 'Delhi', 'Krishi Bhawan, New Delhi', TRUE, 'XXXX-XXXX-0001', '07DOCAG1234F1Z0', NULL, 'nodal.admin@sbi', 5.00, 0);

-- Insert Logistics Fleet
INSERT INTO `logistics_fleet` (`id`, `fleet_code`, `driver_user_id`, `driver_name`, `driver_phone`, `vehicle_type`, `license_plate`, `capacity_kg`, `current_load_kg`, `status`, `current_latitude`, `current_longitude`) VALUES
(1, 'VEH-01', 12, 'Santosh Jadhav', '9823671234', 'Tata Ace (1.2 Ton EV Chiller)', 'MH-15-EG-4921', 1200.00, 780.00, 'active_route', 19.997500, 73.789800),
(2, 'VEH-02', NULL, 'Mahesh Ghorpade', '9822456789', 'Mahindra Bolero Maxi Truck (Cold-Wrap)', 'MH-12-PQ-9011', 1800.00, 0.00, 'idle', 18.520400, 73.856700);

-- Insert Crop Listings
INSERT INTO `crop_listings` (`id`, `listing_code`, `farmer_id`, `crop_name`, `category`, `grade_variety`, `region`, `latitude`, `longitude`, `photo_url`, `quantity_available_kg`, `min_order_retail_kg`, `min_order_bulk_kg`, `harvest_date_str`, `freshness_score`, `farmer_price_per_kg`, `logistics_fee_per_kg`, `platform_fee_per_kg`, `retail_price_per_kg`, `traditional_mandi_price`, `is_organic`, `description`) VALUES
(1, 'lst_101', 1, 'Tomato (Nashik Hybrid)', 'veg', 'Grade A Export Quality', 'Dindori, Nashik (22 km away)', 20.203000, 73.834000, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80', 850.00, 2.00, 100.00, 'Harvested Today (4 hrs ago)', '98% Ultra Fresh', 24.00, 3.50, 1.00, 28.50, 42.00, TRUE, 'Naturally ripened, pesticide residue-free tomatoes harvested early morning. Ideal for retail tables or commercial puree production.'),
(2, 'lst_102', 2, 'Onion (Lasalgaon Premium Red)', 'veg', 'Medium-Large (55mm+)', 'Lasalgaon, Niphad (35 km away)', 20.148000, 74.228000, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80', 2400.00, 5.00, 250.00, 'Harvested Yesterday', '96% Dry Cured', 20.00, 2.50, 0.80, 23.30, 38.00, FALSE, 'Renowned Lasalgaon quality red onions with high dry matter content and 60-day shelf life. Packed in 25kg aerated mesh bags.'),
(3, 'lst_103', 3, 'Potato (Jyoti Fresh Table)', 'veg', 'Grade A Smooth Skin', 'Khed, Pune (18 km away)', 18.847000, 73.912000, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80', 1600.00, 3.00, 150.00, 'Harvested 2 days ago', '94% Fresh Soil-Cured', 16.00, 2.50, 0.70, 19.20, 30.00, FALSE, 'Low-sugar Jyoti table potatoes. Excellent for everyday boiling, frying, and culinary use. Direct farm sorting.'),
(4, 'lst_104', 4, 'Ratnagiri Hapus Alphonso Mango', 'fruits', 'GI-Certified Premium', 'Devgad, Sindhudurg', 16.376000, 73.376000, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80', 420.00, 2.00, 50.00, 'Harvested Today (Hay Packed)', '99% GI-Tagged Direct', 280.00, 25.00, 9.00, 314.00, 480.00, TRUE, 'Original GI Tagged Konkan Alphonso. Tree-ripened in organic hay boxes. Intensely aromatic and rich saffron pulp.'),
(5, 'lst_105', 5, 'Nagpur Sweet Mandarin Oranges', 'fruits', 'Grade A Sweet Ambiya Bahar', 'Katol, Nagpur', 21.272000, 78.586000, 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=80', 950.00, 2.00, 100.00, 'Harvested Yesterday', '97% Juicy Fresh', 42.00, 5.00, 1.50, 48.50, 75.00, FALSE, 'Juicy, naturally sweet Nagpur oranges packed directly from orchard with minimal transit shock.'),
(6, 'lst_106', 6, 'Sehore Sharbati Golden Wheat', 'grains', 'Super Golden Heavy Grain', 'Sehore, MP border hub', 23.203000, 77.084000, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80', 3500.00, 10.00, 500.00, 'Cleaned & Machine Sorted', '99% Moisture Controlled', 32.00, 3.00, 1.00, 36.00, 52.00, TRUE, 'Premium Sharbati wheat grown in black cotton soil without chemical pesticides. Makes super soft rotis.'),
(7, 'lst_107', 1, 'Fresh Farm Green Spinach (Palak)', 'veg', 'Tender Broad Leaves', 'Dindori, Nashik (22 km away)', 20.203000, 73.834000, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80', 180.00, 1.00, 20.00, 'Harvested 3 hours ago', '100% Crisp Morning Cut', 18.00, 3.00, 0.80, 21.80, 35.00, TRUE, 'Harvested with roots in cold water hydro-wrap. Zero yellow leaves, pesticide-free.'),
(8, 'lst_108', 7, 'Kolam Wada Heritage Rice', 'grains', 'Zini Kolam First Sorter', 'Wada, Palghar', 19.654000, 73.138000, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80', 2100.00, 5.00, 200.00, 'Aged 12 Months', '98% Ideal Non-Sticky', 52.00, 4.00, 1.80, 57.80, 85.00, TRUE, 'GI Recognized Wada Kolam fragrant rice. Aged for superior fluffy grain separation and aroma.');

-- Insert Bulk Pricing Tiers
INSERT INTO `bulk_pricing_tiers` (`listing_id`, `min_kg`, `discounted_price_per_kg`) VALUES
(1, 100.00, 26.50),
(1, 500.00, 25.00),
(2, 250.00, 22.00),
(2, 1000.00, 21.00),
(3, 150.00, 18.00),
(3, 500.00, 17.00),
(4, 50.00, 295.00),
(5, 100.00, 45.00),
(6, 500.00, 34.00),
(6, 2000.00, 33.00),
(7, 20.00, 19.50),
(8, 200.00, 54.00);

-- Insert Orders
INSERT INTO `orders` (`id`, `order_ref`, `buyer_id`, `listing_id`, `buyer_name`, `buyer_phone`, `delivery_address`, `crop_summary`, `quantity_kg`, `farmer_payout`, `logistics_fee`, `platform_fee`, `total_amount`, `order_status`, `escrow_status`, `tracking_ref`, `eta_description`, `assigned_fleet_id`, `driver_name_display`, `delivery_otp`, `dispute_reason`) VALUES
(1, 'ORD-8821', 8, 1, 'Sneha Kulkarni', '9823419082', 'Baner, Pune, MH - 411045', 'Tomato (Nashik Hybrid)', 10.00, 240.00, 35.00, 10.00, 285.00, 'in_transit', 'held', 'TRK-MH-7741', 'Today by 5:45 PM', 1, 'Santosh Jadhav (Tata Ace MH-15-EG-4921)', '492182', NULL),
(2, 'ORD-8819', 10, 2, 'GreenGrocer Fresh Mart (Bulk)', '9890123456', 'Viman Nagar Wholesale Hub, Pune', 'Onion (Lasalgaon Premium Red)', 300.00, 6000.00, 750.00, 240.00, 6990.00, 'delivered', 'released', 'TRK-MH-6502', 'Delivered Yesterday', 2, 'Mahesh Ghorpade (Mahindra Bolero MH-12-PQ-9011)', '901123', NULL),
(3, 'ORD-8814', 9, 4, 'Anand Joshi', '9422019943', 'Kothrud, Pune - 411038', 'Ratnagiri Hapus Alphonso Mango', 4.00, 1120.00, 100.00, 36.00, 1256.00, 'delivered', 'released', 'TRK-MH-5120', 'Delivered', 1, 'Santosh Jadhav (Tata Ace MH-15-EG-4921)', '512044', NULL);

-- Insert Escrow Ledger Records
INSERT INTO `escrow_ledger` (`id`, `txn_id`, `order_id`, `buyer_id`, `farmer_id`, `gross_amount`, `farmer_payout`, `logistics_fee`, `platform_fee`, `status`, `payment_method`, `gateway_nodal_ref`, `settlement_utr`, `sla_hours_remaining`, `dispute_flag`, `dispute_notes`, `released_at`) VALUES
(1, 'ESC-9921', 1, 8, 1, 285.00, 240.00, 35.00, 10.00, 'held', 'UPI', 'NODAL_HDFC_ESCROW_9921', NULL, 18, FALSE, 'Awaiting customer delivery verification code or 24hr auto-release SLA', NULL),
(2, 'ESC-9919', 2, 10, 2, 6990.00, 6000.00, 750.00, 240.00, 'released', 'NEFT/RTGS', 'NODAL_HDFC_ESCROW_9919', 'UTR-HDFC-991902814', 0, FALSE, 'Delivery confirmed by buyer via OTP. Funds transferred to farmer UPI.', NOW() - INTERVAL 1 DAY),
(3, 'ESC-9914', 3, 9, 4, 1256.00, 1120.00, 100.00, 36.00, 'released', 'UPI', 'NODAL_HDFC_ESCROW_9914', 'UTR-SBI-991488102', 0, FALSE, 'Auto-released after 24h flawless delivery.', NOW() - INTERVAL 2 DAY);

-- Insert Bulk RFQ Contracts
INSERT INTO `rfq_contracts` (`id`, `rfq_ref`, `buyer_id`, `buyer_company_name`, `buyer_gstin`, `crop_name`, `quantity_demanded_kg`, `price_ceiling_per_kg`, `delivery_location`, `deadline_date`, `recurring_frequency`, `status`) VALUES
(1, 'RFQ-501', 11, 'FreshKart Hypermarkets Ltd.', '27AABCF4921K1ZZ', 'Tomato (Hybrid)', 2500.00, 24.00, 'Bhiwandi Central DC, Mumbai-Thane', '2026-09-15', 'Weekly (Every Monday)', 'open'),
(2, 'RFQ-502', 10, 'Swad Restaurant Chain', '27AAECP1122D1Z2', 'Onion (Lasalgaon Red)', 1200.00, 22.00, 'Shivaji Nagar, Pune', '2026-09-12', 'Bi-weekly', 'open');

-- Insert Farmer Bids on RFQs
INSERT INTO `rfq_bids` (`rfq_id`, `farmer_id`, `bid_price_per_kg`, `offered_quantity_kg`, `fulfillment_note`, `status`) VALUES
(1, 1, 23.50, 1500.00, 'Can fulfill 1500kg immediate morning harvest with Sahyadri FPO sorting', 'pending'),
(1, 2, 23.00, 1000.00, 'Grade A table hybrid harvested under certified standards', 'pending'),
(2, 2, 21.00, 1200.00, '55mm+ sorted Lasalgaon red onions in aerated mesh sacks', 'accepted');

-- Insert Logistics Route Nodes (CVRPTW)
INSERT INTO `logistics_route_nodes` (`trip_ref`, `node_code`, `node_name`, `node_type`, `latitude`, `longitude`, `demand_qty_kg`, `sequence_order`, `is_completed`) VALUES
('TRIP-Nashik-Pune-01', 'N0_DEPOT', 'Nashik Agri Logistics Consolidation Hub', 'depot', 20.005000, 73.790000, 0.00, 1, TRUE),
('TRIP-Nashik-Pune-01', 'N1_FARM', 'Farmer Ramesh Shinde (Tomatoes 250kg)', 'pickup', 20.120000, 73.840000, 250.00, 2, TRUE),
('TRIP-Nashik-Pune-01', 'N2_FARM', 'Farmer Balwantrao Patil (Onions 400kg)', 'pickup', 20.148000, 74.020000, 400.00, 3, TRUE),
('TRIP-Nashik-Pune-01', 'N3_FARM', 'Farmer Kailash Deshmukh (Potatoes 180kg)', 'pickup', 19.820000, 73.910000, 180.00, 4, TRUE),
('TRIP-Nashik-Pune-01', 'N4_DROP', 'Consumer Cluster A (Kalyani Nagar / Viman Nagar)', 'drop', 18.550000, 73.900000, -280.00, 5, FALSE),
('TRIP-Nashik-Pune-01', 'N5_DROP', 'Bulk Buyer: GreenGrocer Warehouse Pune', 'drop', 18.520000, 73.856700, -350.00, 6, FALSE),
('TRIP-Nashik-Pune-01', 'N6_DROP', 'Consumer Cluster B (Baner & Aundh)', 'drop', 18.560000, 73.780000, -200.00, 7, FALSE);

-- Insert Live Mandi Prices (Agmarknet Feeds)
INSERT INTO `mandi_prices_live` (`crop_name`, `mandi_name`, `state`, `modal_price_per_kg`, `min_price_per_kg`, `max_price_per_kg`, `price_change_str`, `trend_direction`, `recorded_at`) VALUES
('Tomato Hybrid', 'Nashik APMC', 'Maharashtra', 28.00, 24.00, 32.00, '+ ₹3.50', 'up', '2026-09-08'),
('Onion Lasalgaon Red', 'Lasalgaon APMC', 'Maharashtra', 24.00, 20.00, 27.00, '- ₹1.20', 'down', '2026-09-08'),
('Potato Jyoti', 'Pune Market Yard', 'Maharashtra', 19.00, 16.00, 22.00, '+ ₹0.80', 'up', '2026-09-08'),
('Sharbati Wheat', 'Nagpur APMC', 'Maharashtra', 34.00, 30.00, 38.00, '+ ₹1.00', 'up', '2026-09-08'),
('Soybean Yellow', 'Latur Mandi', 'Maharashtra', 46.00, 42.00, 49.00, '+ ₹2.10', 'up', '2026-09-08'),
('Cauliflower Snowball', 'Azadpur Mandi', 'Delhi', 22.00, 18.00, 26.00, '- ₹2.00', 'down', '2026-09-08'),
('Green Chilli', 'Kolhapur APMC', 'Maharashtra', 52.00, 45.00, 60.00, '+ ₹4.00', 'up', '2026-09-08');

-- Insert AI Price Forecasts
INSERT INTO `ai_price_forecasts` (`crop_slug`, `crop_name`, `current_avg_mandi`, `suggested_farmer_price`, `confidence_lower`, `confidence_upper`, `best_selling_window`, `ai_rationale`, `historical_days_json`, `historical_prices_json`, `forecast_days_json`, `forecast_prices_json`) VALUES
('tomato', 'Tomato (Hybrid)', 28.00, 24.50, 23.00, 26.50, 'Next 4 to 7 Days (Peak Festival Surge)', 'Analysis of 30-day Agmarknet trends + IMD rainfall in Nashik & upcoming Ganesh Utsav shows high consumer demand and temporary supply tightening (+18% expected price hike).', '["Day -14", "Day -12", "Day -10", "Day -8", "Day -6", "Day -4", "Day -2", "Today"]', '[20.5, 21.0, 22.8, 23.5, 24.0, 26.2, 27.5, 28.0]', '["Tomorrow", "+3 Days", "+5 Days", "+7 Days", "+10 Days", "+14 Days"]', '[29.0, 31.5, 33.0, 34.2, 31.0, 28.5]'),
('onion', 'Onion (Red)', 24.00, 21.00, 20.00, 22.50, 'Hold for 10 days or list in wholesale bulk tier', 'Agmarknet Lasalgaon arrivals are steady; export policy clarity is boosting commercial buyer inquiries for bulk lots (>500kg).', '["Day -14", "Day -12", "Day -10", "Day -8", "Day -6", "Day -4", "Day -2", "Today"]', '[26.0, 25.5, 25.0, 24.5, 24.0, 24.2, 23.8, 24.0]', '["Tomorrow", "+3 Days", "+5 Days", "+7 Days", "+10 Days", "+14 Days"]', '[24.5, 25.2, 26.0, 27.4, 28.5, 29.0]'),
('potato', 'Potato (Jyoti)', 19.00, 16.50, 15.50, 17.50, 'Sell immediately (high cold-storage releases incoming)', 'Cold storage unloading in UP and MP arriving in western markets. Prices likely to stabilize around ₹18-₹19/kg.', '["Day -14", "Day -12", "Day -10", "Day -8", "Day -6", "Day -4", "Day -2", "Today"]', '[18.0, 18.2, 18.5, 18.8, 19.0, 19.2, 19.0, 19.0]', '["Tomorrow", "+3 Days", "+5 Days", "+7 Days", "+10 Days", "+14 Days"]', '[19.2, 19.0, 18.8, 18.5, 18.2, 18.0]');

-- ========================================================================
-- CONVENIENCE ANALYTICAL VIEWS FOR WORKBENCH & API BACKEND
-- ========================================================================

-- View 1: Denormalized Marketplace Produce Catalog
CREATE OR REPLACE VIEW `vw_marketplace_catalog` AS
SELECT 
    l.id AS listing_id,
    l.listing_code,
    l.crop_name,
    l.category,
    l.grade_variety,
    l.region,
    l.quantity_available_kg,
    l.retail_price_per_kg,
    l.farmer_price_per_kg,
    l.logistics_fee_per_kg,
    l.platform_fee_per_kg,
    l.traditional_mandi_price,
    ROUND(((l.traditional_mandi_price - l.retail_price_per_kg) / l.traditional_mandi_price) * 100, 1) AS consumer_savings_pct,
    ROUND(((l.farmer_price_per_kg - (l.traditional_mandi_price * 0.60)) / (l.traditional_mandi_price * 0.60)) * 100, 1) AS farmer_gain_pct,
    l.is_organic,
    l.freshness_score,
    l.photo_url,
    u.id AS farmer_user_id,
    u.full_name AS farmer_name,
    u.fpo_name,
    u.kyc_verified AS farmer_kyc_verified,
    u.rating AS farmer_rating,
    u.reviews_count AS farmer_reviews_count
FROM `crop_listings` l
JOIN `users` u ON l.farmer_id = u.id
WHERE l.status = 'active';

-- View 2: Real-time Escrow Financial Dashboard (GMV & Nodal Balance)
CREATE OR REPLACE VIEW `vw_escrow_financial_summary` AS
SELECT 
    COUNT(e.id) AS total_escrow_transactions,
    COALESCE(SUM(e.gross_amount), 0.00) AS total_gross_merchandise_value,
    COALESCE(SUM(e.farmer_payout), 0.00) AS total_farmer_payouts,
    COALESCE(SUM(CASE WHEN e.status = 'held' THEN e.gross_amount ELSE 0 END), 0.00) AS funds_held_in_nodal_escrow,
    COALESCE(SUM(CASE WHEN e.status = 'released' THEN e.farmer_payout ELSE 0 END), 0.00) AS funds_disbursed_to_farmers,
    COALESCE(SUM(e.platform_fee), 0.00) AS total_platform_reserve_3_5_pct,
    COALESCE(SUM(e.logistics_fee), 0.00) AS total_logistics_disbursements,
    COUNT(CASE WHEN e.dispute_flag = TRUE THEN 1 END) AS active_dispute_count
FROM `escrow_ledger` e;

-- View 3: Order Fulfillment & Logistics Pipeline
CREATE OR REPLACE VIEW `vw_order_tracking_pipeline` AS
SELECT 
    o.order_ref,
    o.created_at AS order_date,
    o.buyer_name,
    o.buyer_phone,
    o.delivery_address,
    o.crop_summary,
    o.quantity_kg,
    o.total_amount,
    o.order_status,
    o.escrow_status,
    o.tracking_ref,
    o.eta_description,
    o.driver_name_display,
    e.txn_id AS escrow_txn_id,
    e.status AS escrow_ledger_status,
    e.sla_hours_remaining
FROM `orders` o
LEFT JOIN `escrow_ledger` e ON o.id = e.order_id;

-- ========================================================================
-- VERIFICATION CONFIRMATION
-- ========================================================================
SELECT 'KisanSetu Database Schema successfully created and populated!' AS Status;
SELECT COUNT(*) AS total_users FROM `users`;
SELECT COUNT(*) AS total_crop_listings FROM `crop_listings`;
SELECT COUNT(*) AS total_orders FROM `orders`;
SELECT COUNT(*) AS total_escrow_records FROM `escrow_ledger`;
