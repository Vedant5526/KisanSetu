/**
 * KisanSetu - Global Frontend Controller & UI Helpers
 * SIH 2026 Problem Statement 26033
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initMandiTicker();
    initRoleBasedUI();
    initMobileNav();
    initKeyboardNav();
    initOfflineDetector();
    updateCartBadge();
    initActiveNav();
    initAutocompleteSearch();
    initGlobalCommandPalette();
    initGlobalHelpFab();
    initGlobalTourModal();
});

// ==========================================
// Role-Based UI Architecture (SIH 2026 PS 26033)
// ==========================================

function initRoleBasedUI() {
    if (!window.kisanStore) return;
    const user = window.kisanStore.getCurrentUser();
    // Role selection is strictly handled at Login; remove horizontal top HUD
    renderPersonaTopHud(user);
    renderRoleNavigation(user);
    renderRoleHeaderActions(user);
    renderRoleContextBanner(user);
    updateIndexRoleHero(user);
}

// 1. Top HUD Persona Switcher (Disabled - role selection is on login page only)
function renderPersonaTopHud(user) {
    const existingHud = document.getElementById('sihDemoHud');
    if (existingHud) {
        existingHud.remove();
    }
}

// 2. Dynamic Navigation by Role
function renderRoleNavigation(user) {
    const nav = document.querySelector('.main-header .nav-links');
    if (!nav) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const role = user ? user.role : 'farmer';

    let links = [];

    switch (role) {
        case 'farmer':
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'farmer-dashboard.html', label: '👨‍🌾 Farm Hub & AI' },
                { href: 'marketplace.html?mode=mandi', label: 'Market Prices' },
                { href: 'logistics.html', label: 'Logistics Map' },
                { href: 'admin-escrow.html', label: 'Escrow Status' }
            ];
            break;
        case 'consumer':
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'marketplace.html', label: '🛒 Fresh Marketplace' },
                { href: 'marketplace.html?category=organic', label: '🥗 100% Organic' },
                { href: 'index.html#transparency', label: 'Price Audit' },
                { href: 'admin-escrow.html', label: '🛡️ Escrow Protection' }
            ];
            break;
        case 'bulk':
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'marketplace.html?mode=bulk', label: '🏢 Bulk Wholesale' },
                { href: 'marketplace.html?tab=rfq', label: '📜 RFQ Contracts & Bids' },
                { href: 'logistics.html', label: '🚚 Freight Corridors' },
                { href: 'admin-escrow.html', label: 'Institutional Escrow' }
            ];
            break;
        case 'logistics':
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'logistics.html', label: '🚚 CVRPTW Optimizer' },
                { href: 'logistics.html#fleet', label: 'Fleet & GPS HUD' },
                { href: 'marketplace.html', label: 'Pickup Lots' },
                { href: 'admin-escrow.html', label: 'Freight Escrow' }
            ];
            break;
        case 'admin':
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'admin-escrow.html', label: '⚖️ Escrow Ledger & Disputes' },
                { href: 'farmer-dashboard.html', label: '🌾 Farmer Registry' },
                { href: 'marketplace.html', label: 'Produce Price Audit' },
                { href: 'logistics.html', label: 'Logistics Grid' }
            ];
            break;
        default:
            links = [
                { href: 'index.html', label: 'Home' },
                { href: 'marketplace.html', label: 'Marketplace' },
                { href: 'farmer-dashboard.html', label: 'AI Forecast' },
                { href: 'logistics.html', label: 'Logistics Map' },
                { href: 'admin-escrow.html', label: 'Escrow Ledger' }
            ];
    }

    let navHtml = '';
    const currentLang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');
    links.forEach(l => {
        const isActive = (currentPath === l.href.split('?')[0].split('#')[0]) || (currentPath === '' && l.href === 'index.html');
        const labelText = translateText(l.label, currentLang);
        navHtml += `<a href="${l.href}" class="nav-link ${isActive ? 'active' : ''}" data-orig-text="${l.label}">${labelText}</a>`;
    });

    nav.innerHTML = navHtml;

    // Also update mobile drawer nav links if present
    const mobileNav = document.getElementById('mobileNavLinks');
    if (mobileNav) {
        mobileNav.innerHTML = navHtml;
    }
}

// 3. Dynamic Header Actions & Profile Capsule
function renderRoleHeaderActions(user) {
    const actionsContainer = document.querySelector('.main-header .header-actions');
    if (!actionsContainer) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const role = user ? user.role : 'farmer';
    const currentLang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');

    let actionButtons = '';

    if (role === 'farmer') {
        const listText = translateText('➕ List Produce', currentLang);
        actionButtons = `
            <button class="btn btn-primary btn-sm" onclick="handleFarmerAction('${currentPath}')" data-orig-text="➕ List Produce">
                ${listText}
            </button>
        `;
    } else if (role === 'consumer') {
        const cartText = translateText('Cart', currentLang);
        const ordersText = translateText('📦 My Orders', currentLang);
        actionButtons = `
            <button class="cart-indicator" onclick="openCartDrawer()" title="Shopping Cart">
                🛒 <span>${cartText}</span>
                <span class="cart-badge" id="cartBadge">0</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="openConsumerOrdersDrawer()" data-orig-text="📦 My Orders">
                ${ordersText}
            </button>
        `;
    } else if (role === 'bulk') {
        const rfqText = translateText('📋 Post RFQ Contract', currentLang);
        actionButtons = `
            <button class="btn btn-accent btn-sm" onclick="handleBulkAction('${currentPath}')" data-orig-text="📋 Post RFQ Contract">
                ${rfqText}
            </button>
            <button class="cart-indicator" onclick="openCartDrawer()" title="Procurement Cart">
                🛒 <span class="cart-badge" id="cartBadge">0</span>
            </button>
        `;
    } else if (role === 'logistics') {
        const cockpitText = translateText('🚚 Driver Cockpit', currentLang);
        const consText = translateText('⚡ Consolidate', currentLang);
        actionButtons = `
            <a href="logistics.html" class="btn btn-primary btn-sm" data-orig-text="🚚 Driver Cockpit">
                ${cockpitText}
            </a>
            <button class="btn btn-outline btn-sm" onclick="if(typeof runOptimization==='function'){runOptimization();}else{window.location.href='logistics.html';}" data-orig-text="⚡ Consolidate">
                ${consText}
            </button>
        `;
    } else if (role === 'admin') {
        const escrowText = translateText('⚖️ Escrow Console', currentLang);
        const resetText = translateText('🔄 Reset Demo', currentLang);
        actionButtons = `
            <a href="admin-escrow.html" class="btn btn-primary btn-sm" data-orig-text="⚖️ Escrow Console">
                ${escrowText}
            </a>
            <button class="btn btn-outline btn-sm" onclick="resetDatabase()" data-orig-text="🔄 Reset Demo">
                ${resetText}
            </button>
        `;
    }

    const openDashText = translateText(`Open ${user.roleTitle.split('/')[0]} Dashboard →`, currentLang);
    const switchRoleText = translateText('Sign Out / Switch Role (Login)', currentLang);

    const capsuleHtml = `
        <div class="user-profile-capsule" id="userProfileCapsule" onclick="toggleProfileDropdown(event)">
            <div class="user-avatar-circle">${user.roleIcon || '👤'}</div>
            <div class="user-meta-box">
                <span class="user-meta-name">${user.name}</span>
                <span class="role-badge role-badge-${user.role}">${user.roleBadge || user.role}</span>
            </div>
            <span class="user-dropdown-arrow">▼</span>

            <div class="profile-dropdown-menu" id="profileDropdownMenu" onclick="event.stopPropagation();">
                <div class="dropdown-user-header">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                        <span class="role-badge role-badge-${user.role}">${user.roleBadge}</span>
                        ${user.kycVerified ? '<span style="color:#059669; font-size:11px; font-weight:700;">✓ Verified KYC</span>' : ''}
                    </div>
                    <h4>${user.name}</h4>
                    <p>📍 ${user.location}</p>
                    <p>📱 +91 ${user.phone}</p>
                    ${user.fpo ? `<p style="color:#059669; margin-top:2px;">🌾 ${user.fpo}</p>` : ''}
                    ${user.gstin ? `<p style="color:#d97706; margin-top:2px;">🏢 GSTIN: ${user.gstin}</p>` : ''}
                    ${user.vehicleType ? `<p style="color:#0284c7; margin-top:2px;">🚚 ${user.vehicleType} (${user.licensePlate})</p>` : ''}
                </div>

                <div class="dropdown-footer" style="padding-top:12px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:8px;">
                    <a href="${user.primaryUrl}" style="color:var(--primary); font-weight:600;" data-orig-text="Open ${user.roleTitle.split('/')[0]} Dashboard →">${openDashText}</a>
                    <a href="login.html" style="color:#ef4444; font-size:13px;" onclick="handleLogout(event)" data-orig-text="Sign Out / Switch Role (Login)">${switchRoleText}</a>
                </div>
            </div>
        </div>
    `;

    const searchPlaceholderText = translateText('Search crops, mandis, certs...', currentLang);
    const searchTriggerHtml = `
        <button type="button" class="header-search-trigger" onclick="openCommandPalette()" title="Search produce, mandis, certificates (Ctrl+K)">
            <span class="search-icon">🔍</span>
            <span class="search-placeholder" data-orig-text="Search crops, mandis, certs...">${searchPlaceholderText}</span>
            <kbd class="cmd-kbd">Ctrl K</kbd>
        </button>
    `;

    actionsContainer.innerHTML = searchTriggerHtml + actionButtons + capsuleHtml;
    updateCartBadge();
}

// 4. Role Context / Access Banner on Specialized Pages
function renderRoleContextBanner(user) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    let existingBanner = document.getElementById('roleContextBanner');
    if (existingBanner) existingBanner.remove();

    let bannerConfig = null;

    if (currentPath === 'farmer-dashboard.html' && user.role !== 'farmer') {
        bannerConfig = {
            type: user.role,
            icon: '👨‍🌾',
            text: `You are viewing the Farmer Command Portal as <strong>${user.roleBadge} (${user.name})</strong> in open demonstration mode.`,
            actionLabel: 'Switch to 👨‍🌾 Farmer Persona',
            targetRole: 'farmer'
        };
    } else if (currentPath === 'admin-escrow.html' && user.role !== 'admin') {
        bannerConfig = {
            type: user.role,
            icon: '🛡️',
            text: `You are viewing the Escrow Ledger in <strong>Public Transparency Audit Mode</strong> as ${user.roleBadge}. Dispute resolution overrides require DoCA Officer role.`,
            actionLabel: 'Switch to ⚖️ Admin Persona',
            targetRole: 'admin'
        };
    } else if (currentPath === 'logistics.html' && user.role !== 'logistics') {
        bannerConfig = {
            type: user.role,
            icon: '🚚',
            text: `You are viewing the CVRPTW Route Engine as ${user.roleBadge}. Fleet driver HUD controls and vehicle GPS are tailored for Logistics Transporters.`,
            actionLabel: 'Switch to 🚚 Logistics Persona',
            targetRole: 'logistics'
        };
    }

    if (bannerConfig) {
        const banner = document.createElement('div');
        banner.id = 'roleContextBanner';
        banner.className = `role-context-banner banner-${bannerConfig.type}`;
        banner.innerHTML = `
            <div class="role-context-banner-text">
                <span>${bannerConfig.icon}</span>
                <span>${bannerConfig.text}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <a href="${user.primaryUrl}" class="btn btn-sm btn-primary">
                    My Dashboard →
                </a>
                <a href="login.html" class="btn btn-sm btn-outline">
                    Switch Role (Login)
                </a>
            </div>
        `;
        const header = document.querySelector('.main-header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(banner, header.nextSibling);
        }
    }
}

// Quick action handlers
function handleFarmerAction(currentPath) {
    if (currentPath === 'farmer-dashboard.html') {
        if (typeof openNewListingModal === 'function') openNewListingModal();
    } else {
        window.location.href = 'farmer-dashboard.html?action=new';
    }
}

function handleBulkAction(currentPath) {
    if (currentPath === 'marketplace.html') {
        if (typeof openNewRfqModal === 'function') {
            openNewRfqModal();
        } else {
            window.location.href = 'marketplace.html?mode=bulk';
        }
    } else {
        window.location.href = 'marketplace.html?mode=bulk';
    }
}

function updateIndexRoleHero(user) {
    const welcomeContainer = document.getElementById('heroRoleWelcome');
    const currentLang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');
    if (welcomeContainer && user) {
        const personaLabel = translateText('Active Persona:', currentLang);
        welcomeContainer.innerHTML = `
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.95); border:1.5px solid var(--border); padding:6px 14px; border-radius:30px; box-shadow:0 2px 8px rgba(0,0,0,0.04); margin-bottom:12px;">
                <span style="font-size:18px;">${user.roleIcon}</span>
                <span style="font-size:13px; color:#334155;">${personaLabel} <strong>${user.name}</strong></span>
                <span class="role-badge role-badge-${user.role}">${user.roleBadge}</span>
            </div>
        `;
    }

    const heroButtons = document.querySelector('.hero-buttons');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (heroButtons && (currentPath === 'index.html' || currentPath === '')) {
        let primaryBtnText = '👨‍🌾 Farmer / FPO Hub';
        if (user.role === 'consumer') primaryBtnText = '🛒 Explore Fresh Marketplace';
        if (user.role === 'bulk') primaryBtnText = '🏢 Bulk Wholesale Hub';
        if (user.role === 'logistics') primaryBtnText = '🚚 CVRPTW Route Hub';
        if (user.role === 'admin') primaryBtnText = '⚖️ Escrow Governance Console';

        const trPrimary = translateText(primaryBtnText, currentLang);
        const trMarket = translateText('🌾 Open Marketplace', currentLang);
        const trLogistics = translateText('🚚 Smart Logistics', currentLang);

        heroButtons.innerHTML = `
            <a href="${user.primaryUrl}" class="btn btn-primary hero-btn-lg" data-orig-text="${primaryBtnText}">
                ${trPrimary} →
            </a>
            <a href="marketplace.html" class="btn btn-secondary hero-btn-lg" data-orig-text="🌾 Open Marketplace">
                ${trMarket}
            </a>
            <a href="logistics.html" class="btn btn-outline hero-btn-lg" data-orig-text="🚚 Smart Logistics">
                ${trLogistics}
            </a>
        `;
    }
}

// Global Switch Active Role
function switchActiveRole(roleKey) {
    if (!window.kisanStore) return;
    const ok = window.kisanStore.switchUserRole(roleKey);
    if (ok) {
        const user = window.kisanStore.getCurrentUser();
        showToast(`Switched active persona to: ${user.roleBadge}`, 'success');
        initRoleBasedUI();

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === 'login.html' || currentPath === 'register.html') {
            window.location.href = user.primaryUrl;
            return;
        }

        // Auto-adapt marketplace mode if on marketplace page
        if (currentPath === 'marketplace.html' && typeof switchMarketMode === 'function') {
            if (user.role === 'bulk') {
                switchMarketMode('bulk');
            } else {
                switchMarketMode('retail');
            }
        }

        // Refresh dashboard views if present
        if (typeof renderFarmerListings === 'function') renderFarmerListings();
        if (typeof renderFarmerOrders === 'function') renderFarmerOrders();
        if (typeof renderWalletTable === 'function') renderWalletTable();
        if (typeof renderEscrowTable === 'function') renderEscrowTable();
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof initForecastChart === 'function') initForecastChart();
    }
}

// User Profile Dropdown handlers
function toggleProfileDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('profileDropdownMenu');
    const capsule = document.getElementById('userProfileCapsule');
    if (!menu) return;
    const isOpen = menu.classList.contains('active');
    closeAllDropdowns();
    if (!isOpen) {
        menu.classList.add('active');
        if (capsule) capsule.classList.add('open');
    }
}

function closeProfileDropdown() {
    const menu = document.getElementById('profileDropdownMenu');
    const capsule = document.getElementById('userProfileCapsule');
    if (menu) menu.classList.remove('active');
    if (capsule) capsule.classList.remove('open');
}

function closeAllDropdowns() {
    closeProfileDropdown();
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('#userProfileCapsule')) {
        closeProfileDropdown();
    }
});

function handleLogout(e) {
    e.preventDefault();
    if (confirm('Sign out and return to KisanSetu portal login?')) {
        window.location.href = 'login.html';
    }
}

// ==========================================
// Consumer Orders Drawer & Escrow Confirmation
// ==========================================
function openConsumerOrdersDrawer() {
    if (!window.kisanStore) return;
    const user = window.kisanStore.getCurrentUser();
    const orders = window.kisanStore.getConsumerOrders ? window.kisanStore.getConsumerOrders(user.id) : window.kisanStore.getOrders();

    let drawer = document.getElementById('consumerOrdersDrawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'consumerOrdersDrawer';
        drawer.className = 'modal-overlay';
        document.body.appendChild(drawer);
    }

    let ordersHtml = '';
    if (!orders.length) {
        ordersHtml = `
            <div style="text-align:center; padding:40px 20px; color:#64748b;">
                <div style="font-size:36px; margin-bottom:10px;">📦</div>
                <p>No active orders placed yet.</p>
                <a href="marketplace.html" class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="closeConsumerOrdersDrawer()">Shop Produce Now</a>
            </div>
        `;
    } else {
        orders.forEach(ord => {
            const isReleased = ord.status === 'delivered' || ord.status === 'escrow_released';
            const isHeld = ord.status === 'escrow_held' || ord.status === 'in_transit' || ord.status === 'pickup_scheduled';

            ordersHtml += `
                <div style="background:#f8fafc; border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <div>
                            <strong style="font-size:15px; color:#0f172a;">${ord.id}</strong>
                            <div style="font-size:12px; color:#64748b;">${ord.date}</div>
                        </div>
                        <span class="status-badge ${isReleased ? 'status-released' : 'status-held'}">
                            ${isReleased ? '✓ Escrow Disbursed' : '🛡️ Locked in Escrow'}
                        </span>
                    </div>

                    <div style="font-size:14px; margin-bottom:6px;">
                        🌾 <strong>${ord.crop}</strong> (${ord.quantityKg} kg)
                    </div>

                    ${renderOrderTimeline(ord)}

                    <div style="display:flex; justify-content:space-between; font-size:13px; color:#475569; margin-bottom:10px;">
                        <span>Delivery Address:</span>
                        <strong style="max-width:200px; text-align:right;">${ord.deliveryAddress}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; color:#059669; padding-top:8px; border-top:1px dashed var(--border); margin-bottom:12px;">
                        <span>Paid with Escrow:</span>
                        <span>₹${ord.totalAmount.toFixed(2)}</span>
                    </div>

                    ${isHeld ? `
                        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin-top:8px;">
                            <div style="font-size:12px; font-weight:700; color:#1e40af; margin-bottom:4px;">
                                🔐 Verify Delivery & Release Escrow to Farmer
                            </div>
                            <p style="font-size:11px; color:#3b82f6; margin:0 0 8px;">
                                Confirm driver delivery by entering the 6-digit delivery code (Demo: <strong>123456</strong>):
                            </p>
                            <div style="display:flex; gap:8px;">
                                <input type="text" id="otpConfirm_${ord.id}" placeholder="123456" maxlength="6" style="width:120px; padding:6px 10px; border:1.5px solid #93c5fd; border-radius:6px; font-size:14px; font-weight:700; text-align:center;">
                                <button class="btn btn-sm btn-primary" onclick="handleConfirmDeliveryOtp('${ord.id}')">
                                    Release Payment ✓
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:10px; font-size:12px; color:#065f46; text-align:center;">
                            ✓ Delivery verified by OTP. Escrow payment released directly to farmer UPI account!
                        </div>
                    `}
                </div>
            `;
        });
    }

    drawer.innerHTML = `
        <div class="modal-box" style="max-width:540px; max-height:85vh; overflow-y:auto;">
            <button class="modal-close-btn" onclick="closeConsumerOrdersDrawer()">✕</button>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span class="role-badge role-badge-consumer">🛒 Consumer Portal</span>
                <span style="font-size:12px; color:#64748b;">SIH 2026 Escrow Delivery Verification</span>
            </div>
            <h3 class="modal-title" style="margin-bottom:4px;">My Agricultural Orders</h3>
            <p style="font-size:13px; color:#64748b; margin-bottom:16px;">
                Funds are held in Ministry nodal escrow until you verify delivery OTP.
            </p>
            <div>${ordersHtml}</div>
        </div>
    `;

    drawer.classList.add('active');
}

function closeConsumerOrdersDrawer() {
    const drawer = document.getElementById('consumerOrdersDrawer');
    if (drawer) drawer.classList.remove('active');
}

function handleConfirmDeliveryOtp(orderId) {
    const input = document.getElementById(`otpConfirm_${orderId}`);
    const code = input ? input.value : '';
    if (!code) {
        showToast('Please enter the 6-digit delivery OTP (Demo: 123456)', 'error');
        return;
    }
    const res = window.kisanStore.verifyDeliveryOtp(orderId, code);
    if (res.success) {
        showToast(res.message, 'success');
        openConsumerOrdersDrawer();
        if (typeof renderFarmerOrders === 'function') renderFarmerOrders();
        if (typeof renderEscrowTable === 'function') renderEscrowTable();
        if (typeof renderWalletTable === 'function') renderWalletTable();
    } else {
        showToast(res.message, 'error');
    }
}

// Listen to role changes
document.addEventListener('kisanRoleChanged', (e) => {
    initRoleBasedUI();
});


// Master Phrase Translation Dictionary for elements across the app
const UI_TRANSLATIONS = {
    hi: {
        // Gov Bar & Tagline
        "Government of India • Ministry of Consumer Affairs, Food & Public Distribution (DoCA)": "भारत सरकार • उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय (DoCA)",
        "Government of India • Ministry of Consumer Affairs, Food & Public Distribution": "भारत सरकार • उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
        "Government of India • Department of Consumer Affairs (DoCA) • SIH 2026 (PS 26033)": "भारत सरकार • उपभोक्ता मामले विभाग (DoCA) • SIH 2026 (PS 26033)",
        "Aadhaar eKYC Enabled | Agmarknet AI Integrated": "आधार ई-केवाईसी सक्षम | एगमार्कनेट एआई एकीकृत",
        "LIVE AGMARKNET FEED": "लाइव एगमार्कनेट भाव",
        "Direct Farm-to-Fork Digital Bridge": "खेत से थाली तक सीधा डिजिटल सेतु",
        "Farmer / FPO Command Portal": "किसान / एफपीओ कमांड पोर्टल",
        "Logistics Route & Fleet Dispatch": "लॉजिस्टिक्स रूट और फ्लीट डिस्पैच",
        "National Escrow & Dispute Console": "राष्ट्रीय एस्क्रो और विवाद समाधान कंसोल",

        // Navigation
        "Home": "होम",
        "Marketplace": "मंडी बाजार",
        "AI Forecast": "एआई भाव पूर्वानुमान",
        "Smart Logistics": "स्मार्ट लॉजिस्टिक्स",
        "Logistics Map": "लॉजिस्टिक्स नक्शा",
        "Escrow Ledger": "एस्क्रो लेजर",
        "Escrow Status": "एस्क्रो स्थिति",
        "👨‍🌾 Farm Hub & AI": "👨‍🌾 किसान केंद्र व एआई",
        "🛒 Fresh Marketplace": "🛒 ताजा मंडी बाजार",
        "🥗 100% Organic": "🥗 100% जैविक",
        "Price Audit": "मूल्य ऑडिट",
        "🛡️ Escrow Protection": "🛡️ एस्क्रो सुरक्षा",
        "🏢 Bulk Wholesale": "🏢 थोक व्यापार केंद्र",
        "📜 RFQ Contracts & Bids": "📜 आरएफक्यू अनुबंध व बोलियां",
        "🚚 Freight Corridors": "🚚 मालवाहतूक कॉरिडोर",
        "Institutional Escrow": "संस्थागत एस्क्रो",
        "🚚 CVRPTW Optimizer": "🚚 मार्ग अनुकूलक",
        "Fleet & GPS HUD": "फ्लीट व जीपीएस डैशबोर्ड",
        "Pickup Lots": "पिकअप लॉट्स",
        "Freight Escrow": "भाड़ा एस्क्रो",
        "⚖️ Escrow Ledger & Disputes": "⚖️ एस्क्रो लेजर व विवाद",
        "🌾 Farmer Registry": "🌾 किसान रजिस्ट्री",
        "Produce Price Audit": "उपज मूल्य ऑडिट",
        "Logistics Grid": "लॉजिस्टिक्स ग्रिड",
        "Login": "लॉगिन",
        "Register": "पंजीकरण",
        "Cart": "कार्ट",
        "My Orders": "मेरे ऑर्डर",
        "📦 My Orders": "📦 मेरे ऑर्डर",
        "🛒 Cart": "🛒 कार्ट",
        "Search crops, mandis, certs...": "फसल, मंडी, प्रमाणपत्र खोजें...",
        "Search crops, mandis, certificates, testing labs...": "फसल, मंडी, गुणवत्ता प्रमाणपत्र, प्रयोगशालाएं खोजें...",
        "Help & Support": "मदद और सहायता",
        "Kisan Sahayata & Support": "किसान सहायता एवं सहयोग",
        "1-Min Platform Tour": "1-मिनट प्लेटफॉर्म टूर",
        "✨ 1-Min Platform Tour": "✨ 1-मिनट प्लेटफॉर्म टूर",
        "Verify Certificate": "प्रमाणपत्र सत्यापित करें",
        "🔬 Verify Certificate": "🔬 प्रमाणपत्र सत्यापित करें",
        "Voice Reader": "आवाज से सुनें",
        "WhatsApp KisanBot": "व्हाट्सएप किसानबॉट",
        "Kisan Call Centre": "किसान कॉल सेंटर",

        // Actions
        "➕ List Produce": "➕ फसल दर्ज करें",
        "➕ List New Produce": "➕ नई फसल दर्ज करें",
        "📋 Post RFQ Contract": "📋 अनुबंध जारी करें",
        "🚚 Driver Cockpit": "🚚 ड्राइवर कॉकपिट",
        "⚡ Consolidate": "⚡ मार्ग समेकन",
        "⚖️ Escrow Console": "⚖️ एस्क्रो कंसोल",
        "🔄 Reset Demo": "🔄 डेमो रीसेट करें",
        "Sign Out": "साइन आउट",
        "Sign Out / Switch Role (Login)": "साइन आउट / भूमिका बदलें (लॉगिन)",
        "Open Farmer Dashboard →": "किसान डैशबोर्ड खोलें →",
        "Open Consumer Dashboard →": "उपभोक्ता डैशबोर्ड खोलें →",
        "Open Bulk Buyer Dashboard →": "थोक खरीदार डैशबोर्ड खोलें →",
        "Open Transporter Dashboard →": "ट्रांसपोर्टर डैशबोर्ड खोलें →",
        "Open Escrow Admin Dashboard →": "प्रशासक डैशबोर्ड खोलें →",
        "Active Persona:": "सक्रिय उपयोगकर्ता:",

        // Login & Register
        "Login to KisanSetu": "किसानसेतु में लॉगिन करें",
        "Choose your account role to continue": "जारी रखने के लिए अपना खाता प्रकार चुनें",
        "SELECT ACCOUNT TYPE": "खाता प्रकार चुनें",
        "👨‍🌾 Farmer": "👨‍🌾 किसान",
        "🛒 Consumer": "🛒 उपभोक्ता",
        "🏢 Bulk": "🏢 थोक",
        "🚚 Logistics": "🚚 ट्रांसपोर्ट",
        "⚖️ Admin": "⚖️ प्रशासक",
        "⚡ 1-CLICK QUICK DEMO LOGIN (SIH 2026)": "⚡ 1-क्लिक त्वरित डेमो लॉगिन",
        "Instant Auth": "त्वरित सत्यापन",
        "📲 Mobile OTP (Fast)": "📲 मोबाइल ओटीपी (त्वरित)",
        "🔑 Password": "🔑 पासवर्ड",
        "Registered Mobile Number": "पंजीकृत मोबाइल नंबर",
        "Enter 10-digit mobile number": "10 अंकों का मोबाइल नंबर दर्ज करें",
        "Send OTP": "ओटीपी भेजें",
        "OTP Code": "ओटीपी कोड",
        "Enter 6-digit OTP": "6 अंकों का ओटीपी दर्ज करें",
        "Verify OTP & Access Hub": "ओटीपी सत्यापित करें और आगे बढ़ें",
        "Remember this device for 30 days": "इस डिवाइस को 30 दिनों तक याद रखें",
        "Password": "पासवर्ड",
        "Enter Password": "पासवर्ड दर्ज करें",
        "Login with Password": "पासवर्ड से लॉगिन करें",
        "New to KisanSetu?": "किसानसेतु पर नए हैं?",
        "Register New Account →": "नया खाता बनाएं →",
        "Already registered?": "पहले से पंजीकृत हैं?",
        "Already have an account?": "पहले से खाता है?",
        "Sign In here →": "यहाँ लॉगिन करें →",
        "Join KisanSetu Ecosystem": "किसानसेतु से जुड़ें",
        "Empowering farmers with direct access & transparent escrow": "पारदर्शी एस्क्रो और सीधे बाजार से किसानों का सशक्तिकरण",
        "I AM REGISTERING AS:": "मैं इस रूप में पंजीकरण कर रहा हूँ:",
        "👨‍🌾 Farmer / FPO": "👨‍🌾 किसान / एफपीओ",
        "🏢 Bulk Buyer": "🏢 थोक खरीदार",
        "🚚 Transporter": "🚚 ट्रांसपोर्टर",
        "⚖️ Escrow Admin": "⚖️ एस्क्रो प्रशासक",
        "Full Name / Entity Name": "पूरा नाम / संस्था का नाम",
        "Mobile Number": "मोबाइल नंबर",
        "Location (District & State)": "स्थान (जिला और राज्य)",
        "District & State": "जिला और राज्य",
        "Aadhaar Number (UIDAI eKYC)": "आधार नंबर (UIDAI ई-केवाईसी)",
        "Verify Aadhaar & Create Account": "आधार सत्यापित करें और खाता बनाएं",

        // Dashboard Tabs
        "📈 AI Demand & Price Forecast": "📈 एआई मांग व भाव पूर्वानुमान",
        "📦 Incoming Orders & Counter-Offers": "📦 प्राप्त ऑर्डर व मोलभाव",
        "🌱 Active Produce Inventory": "🌱 उपलब्ध शेतमाल सूची",
        "💳 Escrow Wallet & UPI Payouts": "💳 एस्क्रो वॉलेट व यूपीआई भुगतान",
        "👥 FPO Aggregator Group": "👥 एफपीओ एकत्रीकरण समूह",
        "🔬 Quality Testing & Assayer Labs": "🔬 गुणवत्ता चाचणी व प्रयोगशाळा",
        "Network Connectivity": "नेटवर्क कनेक्टिविटी",
        "ONLINE": "ऑनलाइन",

        // Hero & Stats
        "🌾 Open Marketplace": "🌾 मंडी बाजार खोलें",
        "🌾 Explore Fresh Marketplace": "🌾 ताजा मंडी बाजार देखें",
        "🏢 Bulk Wholesale Hub": "🏢 थोक व्यापार केंद्र",
        "🚚 CVRPTW Route Hub": "🚚 स्मार्ट मार्ग केंद्र",
        "⚖️ Escrow Governance Console": "⚖️ एस्क्रो कंसोल",
        "1,450+ Verified Farmers": "1,450+ सत्यापित किसान",
        "0% Intermediary Cuts": "0% बिचौलिया मुनाफा",
        "+38% Higher Farmer Income": "+38% किसानों को अधिक आय",
        "24% Saved by Consumers": "24% उपभोक्ताओं की बचत",
        "Verified Farmers Registered": "सत्यापित पंजीकृत किसान",
        "Intermediary Arbitrage Cuts": "बिचौलिया मुनाफा समाप्त",
        "Higher Net Farmer Income": "किसानों को अधिक शुद्ध आय",
        "Direct Savings for Consumers": "उपभोक्ताओं की सीधी बचत",

        // Marketplace
        "Fresh Farm Marketplace": "ताजा मंडी बाजार",
        "Direct from verified farmers at fair APMC-indexed prices": "सत्यापित किसानों से सीधे उचित एपीएमसी मूल्य पर",
        "All Produce": "सभी फसलें",
        "Vegetables": "सब्जियां",
        "Fruits": "फल",
        "Grains & Pulses": "अनाज व दालें",
        "100% Certified Organic": "100% जैविक प्रमाणित",
        "Traditional Mandi Price": "पारंपरिक मंडी भाव",
        "KisanSetu Direct Price": "किसानसेतु सीधा भाव",
        "Itemized Price Breakdown": "पारदर्शी मूल्य विभाजन",
        "Direct to Farmer": "सीधे किसान को",
        "Logistics & Cold Transport": "लॉजिस्टिक्स व शीतगृह",
        "KisanSetu Platform (3%)": "प्लेटफॉर्म शुल्क (3%)",
        "Order with Escrow": "एस्क्रो से ऑर्डर करें",
        "Add to Cart": "कार्ट में जोड़ें",
        "Buy Now": "अभी खरीदें",
        "Search fresh crops, verified farmers, or regions...": "फसल, किसान या जिले का नाम खोजें...",
        "Search produce, farmer, or APMC mandi...": "फसल, किसान या मंडी खोजें...",
        "📊 View Transparent Fee Breakdown (Zero Middlemen) →": "📊 पारदर्शी मूल्य विभाजन देखें (शून्य बिचौलिया) →",

        // Farmer Dashboard
        "AI Forecast & Farm": "एआई पूर्वानुमान व शेत",
        "AI Price & Demand Forecasting Engine": "एआई मूल्य व मांग पूर्वानुमान इंजन",
        "Trained on daily Agmarknet mandi data, IMD monsoon radar, and festival calendars to predict the 3-14 day optimal selling window.": "दैनिक एगमार्कनेट मंडी डेटा, मौसम रडार और त्योहारी कैलेंडर पर प्रशिक्षित, 3-14 दिनों की सर्वोत्तम बिक्री अवधि बताने के लिए।",
        "Select Crop:": "फसल चुनें:",
        "Tomato (Hybrid Table)": "टमाटर (हाइब्रिड टेबल)",
        "Onion (Lasalgaon Red)": "प्याज (लासलगांव लाल)",
        "Potato (Jyoti Fresh)": "आलू (ज्योति फ्रेश)",
        "CURRENT MANDI BENCHMARK": "वर्तमान मंडी बेंचमार्क",
        "Current Mandi Benchmark": "वर्तमान मंडी बेंचमार्क",
        "Nashik APMC Daily Modal Rate": "नासिक एपीएमसी दैनिक मॉडल दर",
        "AI SUGGESTED FARMER LISTING PRICE": "एआई अनुशंसित किसान विक्रय मूल्य",
        "AI Suggested Farmer Listing Price": "एआई अनुशंसित किसान विक्रय मूल्य",
        "AI OPTIMAL HARVEST SELLING WINDOW": "एआई अनुकूलतम कटाई व बिक्री समय",
        "AI Optimal Harvest Selling Window": "एआई अनुकूलतम कटाई व बिक्री समय",
        "Next 4 to 7 Days (Festival Spike)": "अगले 4 से 7 दिन (त्योहारी मांग)",
        "Hold produce 3-4 days for +18% upside": "+18% अधिक लाभ हेतु 3-4 दिन उपज रोकें",
        "Sell immediately (high cold-storage releases incoming)": "तुरंत बेचें (शीतगृह से भारी आवक शुरू)",
        "Historical Agmarknet Prices + 14-Day AI Forecast Curve": "ऐतिहासिक एगमार्कनेट भाव + 14-दिवसीय एआई पूर्वानुमान वक्र",
        "Model: Facebook Prophet / XGBoost Ensemble": "मॉडल: फेसबुक प्रॉफेट / एक्सजीबूस्ट एन्सेम्बल",
        "AI Rationale & Explainability:": "एआई तर्क व स्पष्टीकरण:",
        "Analysis of 30-day Agmarknet trends + IMD rainfall in Nashik & upcoming Ganesh Utsav shows high consumer demand and temporary supply tightening (+18% expected price hike).": "30 दिनों के मंडी रुझान + नासिक वर्षा व आगामी गणेशोत्सव के आधार पर उपभोक्ता मांग अधिक और आवक कम रहने से +18% मूल्य वृद्धि का अनुमान है।",
        "Order & Buyer Management": "ऑर्डर व खरीदार प्रबंधन",
        "Real-time order requests, counter-offers, and delivery tracking state machine.": "रीयल-टाइम ऑर्डर अनुरोध, मोलभाव व डिलीवरी ट्रैकिंग स्थिति।",
        "Order ID & Date": "ऑर्डर आईडी व दिनांक",
        "Buyer & Location": "खरीदार व स्थान",
        "Crop & Quantity": "फसल व मात्रा",
        "Farmer Payout": "किसान भुगतान",
        "Escrow Status": "एस्क्रो स्थिति",
        "Logistics & Tracking": "लॉजिस्टिक्स व ट्रैकिंग",
        "Actions": "कार्रवाई",
        "Accept Order": "ऑर्डर स्वीकारें",
        "Counter": "मोलभाव",
        "Confirmed ✓": "सत्यापित ✓",
        "Delivered • Escrow Released": "वितरित • एस्क्रो जारी",
        "My Listed Farm Produce": "मेरी सूचीबद्ध कृषि उपज",
        "Manage stock quantities, harvest batch dates, and wholesale tier pricing.": "उपज मात्रा, कटाई तिथि और थोक मूल्य दरों का प्रबंधन करें।",
        "➕ Add New Produce Listing": "➕ नई कृषि उपज जोड़ें",
        "Add New Produce Listing": "नई कृषि उपज जोड़ें",
        "Quantity Available:": "उपलब्ध मात्रा:",
        "Farmer Realized Price:": "किसान को प्राप्त मूल्य:",
        "Consumer Price on Portal:": "पोर्टल पर उपभोक्ता मूल्य:",
        "Escrow Wallet & Payout Settlement": "एस्क्रो वॉलेट व भुगतान निपटान",
        "Zero middleman commission leakage. 100% of proceeds settled straight to your bank account / UPI.": "शून्य बिचौलिया कमीशन। 100% राशि सीधे आपके बैंक खाते / यूपीआई में जमा।",
        "⚡ Instant UPI Penny-Drop Payout": "⚡ त्वरित यूपीआई पेनी-ड्रॉप भुगतान",
        "HELD IN SECURE ESCROW": "सुरक्षित एस्क्रो में सुरक्षित",
        "Held in Secure Escrow": "सुरक्षित एस्क्रो में सुरक्षित",
        "Releases upon customer delivery OTP confirmation": "ग्राहक द्वारा डिलीवरी ओटीपी देने पर राशि जारी",
        "SETTLED & DISBURSED TO UPI": "यूपीआई खाते में सफलतापूर्वक जमा",
        "Settled & Disbursed to UPI": "यूपीआई खाते में सफलतापूर्वक जमा",
        "MIDDLEMAN CUT ELIMINATED": "बिचौलिया कमीशन समाप्त",
        "Middleman Cut Eliminated": "बिचौलिया कमीशन समाप्त",
        "Extra net profit retained on KisanSetu": "किसानसेतु पर किसानों का अतिरिक्त शुद्ध लाभ",
        "Escrow Txn Ref": "एस्क्रो लेनदेन संदर्भ",
        "Order Ref": "ऑर्डर संदर्भ",
        "Date": "दिनांक",
        "Customer": "ग्राहक",
        "Gross Order": "कुल ऑर्डर राशि",
        "Direct Farmer Payout": "किसान को शुद्ध भुगतान",
        "Receipt": "रसीद",
        "Released to UPI": "यूपीआई में जारी",
        "Held in Dispute": "विवाद में स्थगित",
        "FPO Aggregator Administration": "एफपीओ एकत्रीकरण प्रशासन",
        "Sahyadri Farmers Producer Co. • Aggregating 12 member-farmers' harvest into high-volume commercial lots.": "सह्याद्री फार्मर्स प्रोड्यूसर कं. • 12 किसान सदस्यों की उपज को बड़े वाणिज्यिक लॉट में एकत्र करना।",
        "Active FPO Aggregated Lots": "सक्रिय एफपीओ संकलित लॉट्स",
        "FPO Batch ID": "एफपीओ बैच आईडी",
        "Crop": "फसल",
        "Aggregated Volume": "एकत्रित मात्रा",
        "Participating Farmers": "भागीदार किसान",
        "Average Realized Price": "औसत प्राप्त मूल्य",
        "Status": "स्थिति",
        "Sold to FreshKart": "फ्रेशकार्ट को बेचा गया",
        "In Logistics Transit": "परिवहन में जारी",
        "Member Farmers": "सदस्य किसान",
        "List Farm Produce": "कृषि उपज दर्ज करें",
        "Instant listing with AI-suggested fair pricing from Agmarknet.": "एगमार्कनेट से एआई अनुशंसित उचित मूल्य के साथ त्वरित लिस्टिंग।",
        "Crop & Variety": "फसल व किस्म",
        "Category": "श्रेणी",
        "Total Quantity (kg)": "कुल मात्रा (किग्रा)",
        "Farmer Price (₹/kg)": "किसान भाव (₹/किग्रा)",
        "Harvest Timing": "कटाई समय",
        "Harvested Today Morning": "आज सुबह ताजा कटाई",
        "AI Pricing Advisory:": "एआई मूल्य सलाह:",
        "100% Pesticide Residue Free / Organic": "100% कीटनाशक मुक्त / जैविक",
        "🌱 Publish to Live Direct Marketplace →": "🌱 सीधे मंडी बाजार में प्रकाशित करें →",
        "Farmer Command Hub & AI": "किसान कमांड हब व एआई",
        "LOW-LITERACY VOICE ASSISTANT": "अल्प-साक्षर वॉइस सहायक",
        "Offline action queue active. Retries sync with idempotency keys on reconnect.": "ऑफलाइन कतार सक्रिय। पुनः कनेक्ट होने पर डेटा स्वतः सिंक होगा।",
        "Aadhaar eKYC Verified": "आधार ई-केवाईसी सत्यापित",
        "✓ Aadhaar eKYC Verified": "✓ आधार ई-केवाईसी सत्यापित",
        "Registered Stakeholder": "पंजीकृत हितधारक",

        // Smart Logistics Dashboard
        "Smart Logistics & CVRPTW": "स्मार्ट लॉजिस्टिक्स व मार्ग अनुकूलन",
        "SIH 2026 PROBLEM STATEMENT 26033 • SECTIONS 8 & 9": "SIH 2026 समस्या विवरण 26033 • धारा 8 व 9",
        "Capacitated Vehicle Routing Problem (CVRPTW) Engine": "वाहन क्षमता व समय-खिड़की मार्ग अनुकूलन (CVRPTW) इंजन",
        "Batching farm pickups across the Nashik-Pune agricultural corridor into consolidated multi-drop delivery runs, cutting transport cost by 61% and carbon footprint by 68%.": "नासिक-पुणे कृषि कॉरिडोर में खेतों से उपज एकत्र कर समेकित डिलीवरी रूट बनाना, जिससे परिवहन लागत में 61% और कार्बन उत्सर्जन में 68% की कमी आती है।",
        "⚠️ View Unoptimized (6 Trips)": "⚠️ असंयोजित रूट देखें (6 चक्कर)",
        "View Unoptimized (6 Trips)": "असंयोजित रूट देखें (6 चक्कर)",
        "✨ Optimize Route (1 Consolidated)": "✨ मार्ग अनुकूलित करें (1 समेकित रूट)",
        "Optimize Route (1 Consolidated)": "मार्ग अनुकूलित करें (1 समेकित रूट)",
        "🚚 Track Live Vehicle GPS": "🚚 लाइव वाहन जीपीएस ट्रैक करें",
        "Track Live Vehicle GPS": "लाइव वाहन जीपीएस ट्रैक करें",
        "Vehicle: Tata Ace EV (MH-15-EG-4921)": "वाहन: टाटा ऐस ईवी (MH-15-EG-4921)",
        "Driver: Santosh Jadhav • Chilled EV Payload: 780 kg / 1,200 kg (65% capacity)": "चालक: संतोष जाधव • प्रशीतित ईवी पेलोड: 780 किग्रा / 1,200 किग्रा (65% क्षमता)",
        "Current Live Status": "वर्तमान लाइव स्थिति",
        "CURRENT LIVE STATUS": "वर्तमान लाइव स्थिति",
        "In-Transit: Heading to Drop 1 (Baner)": "मार्ग में: ड्रॉप 1 (बानेर) की ओर अग्रसर",
        "✓ Confirm Delivery & Release Escrow": "✓ डिलीवरी सत्यापित करें और एस्क्रो जारी करें",
        "Confirm Delivery & Release Escrow": "डिलीवरी सत्यापित करें और एस्क्रो जारी करें",
        "🔐 Verify Delivery & Release Escrow →": "🔐 डिलीवरी सत्यापित करें व एस्क्रो जारी करें →",
        "ℹ️ Inspect CVRPTW Algorithm": "ℹ️ CVRPTW एल्गोरिथ्म समझें",
        "Route Economics Audit": "मार्ग आर्थिक विश्लेषण व बचत ऑडिट",
        "OPTIMIZED CVRPTW": "अनुकूलित CVRPTW",
        "UNOPTIMIZED ROUTE": "असंयोजित मार्ग",
        "UNOPTIMIZED (6 TRIPS)": "असंयोजित (6 चक्कर)",
        "HEADLINE SIH DEMO COMPARISON": "SIH मुख्य डेमो बचत तुलना",
        "Headline SIH Demo Comparison": "SIH मुख्य डेमो बचत तुलना",
        "61% Transport Savings": "61% परिवहन बचत",
        "Comparing 6 individual farmer trips vs. 1 consolidated multi-node milk-run corridor.": "6 अलग-अलग किसान चक्करों की तुलना में 1 समेकित संयुक्त मिल्क-रन रूट।",
        "Total Distance:": "कुल दूरी:",
        "Corridor Transport Cost:": "कॉरिडोर परिवहन लागत:",
        "Carbon Emissions:": "कार्बन उत्सर्जन:",
        "Transit Fleet Required:": "आवश्यक वाहन संख्या:",
        "6 Vehicles": "6 वाहन",
        "1 EV Chiller": "1 ईवी प्रशीतित वाहन",
        "Ordered Stop Sequence & ETAs": "क्रमबद्ध पड़ाव व आगमन समय (ETA)",
        "Turn-by-Turn GPS API Integration: Deep-links directly to Google Maps / Mapbox mobile navigation for rural gig drivers.": "टर्न-बाय-टर्न जीपीएस एकीकरण: ग्रामीण चालकों के लिए गूगल मैप्स / मैपबॉक्स नेविगेशन से सीधे जुड़ा।",
        "DEPOT": "डिपो (प्रस्थान केंद्र)",
        "PICKUP": "पिकअप (शेतमाल संकलन)",
        "DROP": "वितरण (ग्राहक/बाजार)",
        "Nashik Consolidation Hub (Depot)": "नासिक संकलन केंद्र (डिपो)",
        "Departure Hub (6:00 AM)": "प्रस्थान केंद्र (सुबह 6:00)",
        "Farm 1: Ramesh Shinde (Dindori)": "खेत 1: रमेश शिंदे (दिंडोरी)",
        "+250 kg Tomatoes (Fresh Cut)": "+250 किग्रा टमाटर (ताजा कटाई)",
        "Farm 2: Balwantrao Patil (Lasalgaon)": "खेत 2: बळवंतराव पाटील (लासलगांव)",
        "+350 kg Red Onions": "+350 किग्रा लाल प्याज",
        "Farm 3: Kailash Deshmukh (Khed)": "खेत 3: कैलाश देशमुख (खेड)",
        "+180 kg Jyoti Potatoes": "+180 किग्रा ज्योति आलू",
        "Drop 1: Retail Cluster (Baner & Aundh)": "ड्रॉप 1: खुदरा क्लस्टर (बानेर व औंध)",
        "-280 kg Fresh Packs": "-280 किग्रा ताजा पैकेट",
        "Drop 2: GreenGrocer Bulk DC (Pune)": "ड्रॉप 2: ग्रीनग्रोसर थोक केंद्र (पुणे)",
        "-350 kg Bulk Onion Bags": "-350 किग्रा थोक प्याज की बोरियां",
        "Drop 3: Kalyani Nagar Society Cluster": "ड्रॉप 3: कल्याणी नगर सोसाइटी क्लस्टर",
        "-150 kg Mixed Produce": "-150 किग्रा मिश्रित उपज",
        "⚡ Consolidate & Optimize": "⚡ मार्ग समेकन व अनुकूलन",
        "Consolidate & Optimize": "मार्ग समेकन व अनुकूलन",

        // Admin Escrow Dashboard
        "Escrow Ledger & Governance": "एस्क्रो लेजर व प्रशासनिक नियंत्रण",
        "SIH 2026 PROBLEM STATEMENT 26033 • SECTION 11 PAYMENTS & ESCROW": "SIH 2026 समस्या विवरण 26033 • धारा 11 भुगतान व एस्क्रो",
        "Transparent Escrow Ledger & Dispute Resolution Console": "पारदर्शी एस्क्रो लेजर व विवाद समाधान कंसोल",
        "Demonstrating the exact hold-and-release state machine that protects both the farmer and consumer. Funds remain locked in the gateway nodal account until delivery OTP confirmation or dispute grace window closure.": "किसान और उपभोक्ता दोनों की सुरक्षा करने वाली एस्क्रो स्टेट मशीन। डिलीवरी ओटीपी सत्यापन या विवाद अवधि पूरी होने तक राशि नोडल खाते में सुरक्षित रहती है।",
        "Gross Merchandise Value (GMV)": "सकल व्यापार मूल्य (GMV)",
        "GROSS MERCHANDISE VALUE (GMV)": "सकल व्यापार मूल्य (GMV)",
        "Total transparent transactions logged": "दर्ज किए गए कुल पारदर्शी लेनदेन",
        "Farmer Direct Payouts (UPI)": "किसानों को सीधा भुगतान (यूपीआई)",
        "FARMER DIRECT PAYOUTS (UPI)": "किसानों को सीधा भुगतान (यूपीआई)",
        "86.3% net share to agricultural producers": "कृषि उत्पादकों को 86.3% शुद्ध हिस्सा",
        "Held in Nodal Escrow": "नोडल एस्क्रो में सुरक्षित",
        "HELD IN NODAL ESCROW": "नोडल एस्क्रो में सुरक्षित",
        "Protected by 24h SLA Auto-Release": "24 घंटे ऑटो-रिलीज़ द्वारा सुरक्षित",
        "KisanSetu Platform Reserve (3.5%)": "किसानसेतु प्लेटफॉर्म रिज़र्व (3.5%)",
        "KISANSETU PLATFORM RESERVE (3.5%)": "किसानसेतु प्लेटफॉर्म रिज़र्व (3.5%)",
        "Sustains open AI & logistics tech infrastructure": "ओपन एआई व लॉजिस्टिक्स तकनीक का संचालन",
        "Escrow Lifecycle State Machine Flow": "एस्क्रो जीवनचक्र स्थिति प्रवाह",
        "1. Payment Collected": "1. भुगतान प्राप्त हुआ",
        "UPI / Cards / COD": "यूपीआई / कार्ड / नेट बैंकिंग",
        "2. Held in Escrow": "2. एस्क्रो में सुरक्षित",
        "Nodal Account Locked": "नोडल खाते में लॉक",
        "3. CVRPTW Transit": "3. मार्ग में परिवहन",
        "Live GPS Tracking": "लाइव जीपीएस ट्रैकिंग",
        "4. Delivery OTP": "4. डिलीवरी ओटीपी",
        "Buyer Verifies Goods": "खरीदार ने माल परखा",
        "5. Escrow Released": "5. एस्क्रो राशि जारी",
        "Direct to Farmer UPI": "सीधे किसान के यूपीआई में",
        "Live Escrow Transactions Ledger": "लाइव एस्क्रो लेनदेन लेजर",
        "Real-time audit log with interactive state simulation buttons for SIH evaluation.": "SIH मूल्यांकन हेतु संवादात्मक स्थिति बटनों के साथ रीयल-टाइम ऑडिट लॉग।",
        "All Records": "सभी रिकॉर्ड",
        "Held in Escrow": "एस्क्रो में सुरक्षित",
        "Released": "सफलतापूर्वक जारी",
        "Disputed": "विवादित",
        "Txn ID": "लेनदेन आईडी",
        "Buyer & Farmer": "खरीदार व किसान",
        "Farmer Net Payout": "किसान शुद्ध भुगतान",
        "Logistics / Platform": "लॉजिस्टिक्स / प्लेटफॉर्म शुल्क",
        "Interactive Simulation Actions": "सिमुलेशन कार्रवाई",
        "Released to Farmer UPI": "किसान यूपीआई में जारी",
        "⚠️ Dispute Paused": "⚠️ विवाद में रोका गया",
        "🛡️ Held in Escrow": "🛡️ एस्क्रो में सुरक्षित",
        "Settled to UPI ✓": "यूपीआई में भुगतान संपन्न ✓",
        "✓ Confirm & Release": "✓ पुष्टि करें व जारी करें",
        "Confirm & Release": "पुष्टि करें व जारी करें",
        "⚠️ Simulate Dispute": "⚠️ विवाद सिमुलेट करें",
        "Simulate Dispute": "विवाद सिमुलेट करें",
        "Release to Farmer": "किसान को भुगतान जारी करें",
        "Refund Buyer": "खरीदार को राशि लौटाएं",
        "DIRECT REBUTTAL TO PS OPENING CLAIM": "समस्या विवरण के प्रारंभिक दावे का सीधा समाधान",
        "\"How KisanSetu Guarantees Fair Farmer Earnings\"": "\"किसानसेतु कैसे किसानों की उचित आय की गारंटी देता है\"",
        "Test any custom basket size to inspect the exact fee reconciliation algorithm.": "शुल्क समाधान एल्गोरिथ्म जांचने हेतु किसी भी राशि की टोकरी का परीक्षण करें।",
        "Test Basket Gross Amount:": "परीक्षण टोकरी सकल राशि:",
        "DIRECT TO FARMER (85%)": "सीधे किसान को (85%)" ,
        "Zero unlisted mandi broker cuts": "शून्य अघोषित मंडी दलाली",
        "COLD LOGISTICS (11.5%)": "शीतगृह लॉजिस्टिक्स (11.5%)",
        "Consolidated CVRPTW corridor": "समेकित स्मार्ट मार्ग व्यवस्थापन",
        "PLATFORM FEE (3.5%)": "प्लेटफॉर्म शुल्क (3.5%)",
        "Sustains cloud AI & escrow APIs": "क्लाउड एआई व एस्क्रो का संचालन",
        "MIDDLEMAN CUT ON KISANSETU": "किसानसेतु पर बिचौलियों का कमीशन",
        "vs ₹450-₹550 in traditional APMC": "पारंपरिक मंडी में ₹450-₹550 की तुलना में",
        "Raise Escrow Quality Dispute": "एस्क्रो गुणवत्ता विवाद दर्ज करें",
        "Simulates a consumer finding damaged produce upon delivery. Escrow auto-release is paused immediately.": "डिलीवरी पर खराब उपज मिलने का सिमुलेशन। एस्क्रो ऑटो-रिलीज़ तुरंत रुक जाता है।",
        "Dispute Reason / Category": "विवाद का कारण / श्रेणी",
        "Transit Bruising / Crushed in Delivery (30% weight damaged)": "परिवहन में क्षति (30% उपज खराब)",
        "Underweight Delivery (Received 8kg instead of 10kg)": "कम वजन प्राप्त हुआ (10 किग्रा के स्थान पर 8 किग्रा)",
        "Wrong Produce Grade Delivered": "गलत ग्रेड की उपज मिली",
        "Photo Proof of Damaged Goods": "खराब उपज का फोटो प्रमाण",
        "📸 Simulated Photo Proof Uploaded (tomato_damage_proof.jpg)": "📸 फोटो प्रमाण अपलोड किया गया (tomato_damage_proof.jpg)",
        "⚠️ Lock Escrow & Halt Farmer Payout": "⚠️ एस्क्रो रोकें और भुगतान स्थगित करें",
        "🔄 Reset Demo Data": "🔄 डेमो डेटा रीसेट करें",
        "Reset Demo Data": "डेमो डेटा रीसेट करें",

        // Marketplace & Wholesale RFQ
        "Fresh Agricultural Produce": "ताजा कृषि उपज",
        "100% of produce delivered directly from verified farm gates within 24-48 hours of harvest.": "कटाई के 24-48 घंटों के भीतर 100% उपज सीधे सत्यापित खेतों से वितरित।",
        "Verified Direct Sourcing • SIH 2026": "सत्यापित सीधा स्रोत • SIH 2026",
        "🥗 Retail Consumers": "🥗 खुदरा उपभोक्ता",
        "Retail Consumers": "खुदरा उपभोक्ता",
        "🏢 Bulk Wholesale & RFQ": "🏢 थोक व्यापार व आरएफक्यू",
        "Bulk Wholesale & RFQ": "थोक व्यापार व आरएफक्यू",
        "All Crops": "सभी फसलें",
        "🌿 100% Organic": "🌿 100% जैविक",
        "Radius: All Distances": "दूरी: सभी क्षेत्र",
        "📍 Radius: All Distances": "📍 दूरी: सभी क्षेत्र",
        "Within 25 km (Local Hub)": "25 किमी के भीतर (स्थानीय हब)",
        "📍 Within 25 km (Local Hub)": "📍 25 किमी के भीतर (स्थानीय हब)",
        "Within 50 km (Regional)": "50 किमी के भीतर (क्षेत्रीय)",
        "📍 Within 50 km (Regional)": "📍 50 किमी के भीतर (क्षेत्रीय)",
        "eKYC Verified Only": "केवल ई-केवाईसी सत्यापित",
        "COMMERCIAL BUYER SPECIAL": "व्यावसायिक खरीदार विशेष",
        "Need Large Volumes? Post a Request for Quote (RFQ)": "बड़ी मात्रा चाहिए? कोटेशन अनुरोध (RFQ) पोस्ट करें",
        "Farmers & FPOs will directly bid competitive rates to fulfill your commercial requirement.": "किसान व एफपीओ सीधे प्रतिस्पर्धी दरों की बोली लगाकर आपकी आपूर्ति पूरी करेंगे।",
        "📝 Post New RFQ Requirement": "📝 नया आरएफक्यू अनुबंध पोस्ट करें",
        "Post New RFQ Requirement": "नया आरएफक्यू अनुबंध पोस्ट करें",
        "REVERSE AUCTION SYSTEM": "रिवर्स नीलामी प्रणाली",
        "Active Bulk Buyer RFQs & Farmer Quotes": "सक्रिय थोक आरएफक्यू व किसानों की बोलियां",
        "Commercial requirements currently receiving competitive farm bids.": "व्यावसायिक आवश्यकताएं जिन पर किसान सीधे प्रतिस्पर्धी बोलियां लगा रहे हैं।",
        "RFQ ID": "आरएफक्यू आईडी",
        "Buyer Organization": "खरीदार संस्था",
        "Crop Required": "आवश्यक फसल",
        "Quantity": "मात्रा",
        "Price Ceiling": "अधिकतम मूल्य सीमा",
        "Farmer Bids Received": "प्राप्त किसान बोलियां",
        "Open Reverse Auction": "सक्रिय रिवर्स नीलामी",
        "Shopping Cart": "शॉपिंग कार्ट",
        "Escrow-Protected Checkout": "एस्क्रो सुरक्षित चेकआउट",
        "Items in Cart": "कार्ट में उत्पाद",
        "Delivery Recipient Details": "डिलीवरी विवरण",
        "Full Name": "पूरा नाम",
        "Mobile Number (for delivery OTP)": "मोबाइल नंबर (डिलीवरी ओटीपी हेतु)",
        "Delivery Address & Landmark": "डिलीवरी का पता व लैंडमार्क",
        "Payment Method": "भुगतान विधि",
        "UPI (Google Pay / PhonePe / BHIM)": "यूपीआई (गूगल पे / फोनपे / भीम)",
        "Net Banking / Rupay Card": "नेट बैंकिंग / रुपे कार्ड",
        "Subtotal": "उप-कुल",
        "Delivery & Cold-Chain Transport": "डिलीवरी व कोल्ड-चेन परिवहन",
        "Total Payable:": "कुल देय राशि:",
        "Place Escrow-Protected Order →": "एस्क्रो सुरक्षित ऑर्डर दें →",
        "Itemized Price Breakdown & Transparency Audit": "पारदर्शी मूल्य विभाजन और ऑडिट",
        "SIH 2026 Mandate: Absolute Transparency Against Middlemen": "SIH 2026 अधिदेश: बिचौलियों के विरुद्ध पूर्ण पारदर्शिता",
        "Produce Item": "फसल वस्तु",
        "Nashik APMC Daily Reference": "नासिक एपीएमसी दैनिक संदर्भ भाव",
        "KisanSetu Direct Consumer Price": "किसानसेतु सीधा उपभोक्ता भाव",
        "Zero Middleman Cut": "बिचौलिया शुल्क शून्य",
        "Cold Logistics (Consolidated CVRPTW Run)": "कोल्ड लॉजिस्टिक्स (स्मार्ट रूट)",
        "Total Item Cost": "कुल लागत",
        "Traditional APMC Commission / Wastage Arbitrage": "पारंपरिक मंडी दलाली व नुकसान अंतर",
        "Search crops, farmers, districts (e.g. Tomato, Nashik, Organic)...": "फसल, किसान या जिले का नाम खोजें (जैसे टमाटर, नासिक, जैविक)...",
        "No produce matches your current filter": "आपके फिल्टर से मेल खाने वाली कोई उपज नहीं मिली",
        "Try expanding your proximity radius or selecting \"All Crops\".": "कृपया दूरी का दायरा बढ़ाएं या \"सभी फसलें\" चुनें।",
        "🌾 YOUR FARM LISTING": "🌾 आपकी कृषि उपज",
        "✓ eKYC Verified": "✓ ई-केवाईसी सत्यापित",
        "ORGANIC": "जैविक",
        "Manage Lot in Farmer Command Hub": "⚙️ किसान केंद्र में लॉट का प्रबंधन करें",

        // Farmer Dashboard Navigation & Tabs
        "AI Demand & Price Forecast": "एआई मांग व मूल्य पूर्वानुमान",
        "APMC Mandi Rates (Amravati)": "एपीएमसी मंडी भाव (अमरावती)",
        "Incoming Orders & Counter-Offers": "प्राप्त ऑर्डर्स व मोलभाव",
        "Active Produce Inventory": "सक्रिय कृषि उपज स्टॉक",
        "Escrow Wallet & UPI Payouts": "एस्क्रो वॉलेट व यूपीआई भुगतान",
        "FPO Aggregator Group": "एफपीओ उत्पादक संघ",
        "Quality Testing & Assayer Labs": "गुणवत्ता जांच व प्रयोगशाला",

        // Farmer Dashboard Mandi Table
        "Amravati Division APMC Mandi Rates": "अमरावती संभाग एपीएमसी मंडी भाव",
        "Real-time wholesale modal arrivals for Akola APMC & Buldhana APMC (July 10 – September 9, 2026) verified via Agmarknet / data.gov.in.": "अकोला व बुलढाणा एपीएमसी हेतु वास्तविक थोक आवक दर (10 जुलाई - 9 सितंबर, 2026) एगमार्कनेट द्वारा सत्यापित।",
        "Filter APMC:": "मंडी चुनें:",
        "All Mandis (Akola & Buldhana)": "सभी मंडियां (अकोला व बुलढाणा)",
        "Akola APMC": "अकोला एपीएमसी",
        "Buldhana APMC": "बुलढाणा एपीएमसी",
        "Commodity:": "फसल / जिंस:",
        "All Commodities (7 Crops)": "सभी फसलें (7 फसलें)",
        "Tomato (Hybrid)": "टमाटर (हाइब्रिड)",
        "Onion (Red Kharif)": "प्याज (लाल खरीफ)",
        "Potato (Jyoti)": "आलू (ज्योति)",
        "Wheat (Sharbati)": "गेहूं (शरबती)",
        "Soybean (Yellow Gr. A)": "सोयाबीन (पीला ग्रेड ए)",
        "Cauliflower (Snowball)": "फूलगोभी (स्नोबॉल)",
        "Red Chilli (Byadagi Dry)": "लाल मिर्च (ब्यादगी सूखी)",
        "Search date, crop...": "दिनांक, फसल खोजें...",
        "View Full Market Terminal →": "संपूर्ण मार्केट टर्मिनल देखें →",
        "Mandi Yard": "मंडी केंद्र",
        "Min (₹/kg)": "न्यूनतम (₹/किग्रा)",
        "Max (₹/kg)": "अधिकतम (₹/किग्रा)",
        "Modal Price": "मॉडल भाव",
        "Modal (₹/Qtl)": "मॉडल (₹/क्विंटल)",
        "Arrivals": "दैनिक आवक",
        "24h Trend": "24 घंटे का रुझान",
        "Forecast": "पूर्वानुमान",
        "AI Curve": "एआई ग्राफ",

        // Quality Assaying & Labs
        "Smart India Hackathon 2026 • DoCA PS 26033": "स्मार्ट इंडिया हैकाथॉन 2026 • उपभोक्ता मामले मंत्रालय",
        "AGMARK & NABL Accredited Testing": "एगमार्क व एनएबीएल मान्यता प्राप्त प्रयोगशाला",
        "Authorized Quality Assaying & Testing Centers": "अधिकृत गुणवत्ता परख व परीक्षण केंद्र",
        "Locate accredited testing laboratories, KVK centers, and APMC assaying terminals near": "अपने निकट अधिकृत परीक्षण प्रयोगशालाएं, केवीके केंद्र और एपीएमसी टर्मिनल खोजें",
        "Verify Any Certificate": "प्रमाणपत्र सत्यापित करें",
        "Book Farm-Gate Sample Pickup": "खेत से नमूना संग्रहण बुक करें",
        "Schedule Farm Collection": "खेत पर जांच शेड्यूल करें",
        "Call Lab": "प्रयोगशाला को कॉल करें",
        "View Sample Certificate": "नमूना प्रमाणपत्र देखें",
        "All Districts": "सभी जिले",
        "All Commodities": "सभी फसलें",
        "Search lab name, equipment, crop, or location...": "प्रयोगशाला का नाम, उपकरण, फसल या स्थान खोजें...",
        "How Quality Assaying Works for Farmers on KisanSetu": "किसानसेतु पर किसानों हेतु गुणवत्ता परख कैसे कार्य करती है",
        "Transparent certification protects farmers from unscientific mandi rejections and unlocks bulk buyer premiums.": "पारदर्शी प्रमाणीकरण किसानों को अकारण मंडी अस्वीकृति से बचाता है और 18-25% अधिक मूल्य दिलाता है।",
        "1. Sample Collection": "1. नमूना संग्रहण",
        "Walk-in or Farm Pickup": "वॉक-इन या खेत से पिकअप",
        "Bring a 1-2 kg composite produce sample to any lab or request an assayer van to visit your farm gate in Dindori.": "किसी भी लैब में 1-2 किग्रा नमूना लाएं या डिंडोरी में खेत पर सैंपल वैन बुलाएं।",
        "2. Machine Calibration": "2. मशीन अंशांकन व परीक्षण",
        "Objective Grading": "वैज्ञानिक ग्रेडिंग",
        "Automated sensors test moisture, Brix sweetness, millimeter caliber, and FSSAI pesticide MRLs in 15–20 minutes.": "स्वचालित सेंसर 15-20 मिनट में नमी, मिठास, आकार और कीटनाशक अवशेषों का परीक्षण करते हैं।",
        "3. Cryptographic Pass": "3. डिजिटल प्रमाणपत्र",
        "Direct Marketplace Boost": "सीधे मंडी में अतिरिक्त मूल्य",
        "A digitally signed AGMARK certificate is linked to your lot. Buyers purchase instantly with zero quality disputes.": "डिजिटल हस्ताक्षरित एगमार्क प्रमाणपत्र से खरीदार बिना किसी गुणवत्ता विवाद के तुरंत खरीदारी करते हैं।",
        "Location:": "स्थान:",
        "Assayer In-Charge:": "प्रभारी परीक्षक:",
        "Operating Hours:": "कार्यकारी समय:",
        "Contact:": "संपर्क:",
        "Crops:": "फसलें:",
        "Available Equipment & Testing Kits:": "उपलब्ध उपकरण व परीक्षण किट:",
        "Turnaround:": "जांच अवधि:",
        "Assay Fee:": "परीक्षण शुल्क:",
        "Book Pickup": "पिकअप बुक करें",
        "Cert": "सर्टिफिकेट",
        "Map": "नक्शा",
        "Call": "कॉल",
        "On-Farm Pickup Available": "खेत पर पिकअप उपलब्ध",
        "Mandi Yard Walk-in": "मंडी यार्ड वॉक-इन",
        "NEAREST": "निकटतम",
        "NEAREST TESTING CENTER • 14 KM FROM YOUR FARM": "निकटतम परीक्षण केंद्र • आपके खेत से 14 किमी",
        "Spot Assay: 15–20 Mins": "त्वरित परीक्षण: 15–20 मिनट",
        "Govt Subsidized (FREE Spot / ₹75 MRL)": "सरकारी अनुदानित (निःशुल्क स्पॉट / ₹75 MRL)",
        "On-Farm Pickup Van Active in Dindori": "खेत से सैंपल कलेक्शन वैन डिंडोरी में सक्रिय",

        // Badges & Labels
        "Assayer Certified": "एगमार्क प्रमाणित",
        "View Sheet 📄": "प्रमाणपत्र देखें 📄",
        "Network Connectivity": "नेटवर्क कनेक्टिविटी",
        "ONLINE": "ऑनलाइन",
        "Hold produce 3-4 days for upside": "अधिक लाभ हेतु 3-4 दिन उपज रोकें",
        "Akola APMC Daily Modal Rate": "अकोला एपीएमसी दैनिक मॉडल भाव",
        "Buldhana APMC Daily Modal Rate": "बुलढाणा एपीएमसी दैनिक मॉडल भाव",
        "Daily Modal Rate": "दैनिक मॉडल भाव",
        "Tomato (Akola APMC Hybrid)": "टमाटर (अकोला एपीएमसी हाइब्रिड)",
        "Onion (Buldhana APMC Red Kharif)": "प्याज (बुलढाणा एपीएमसी लाल खरीफ)",
        "Potato (Akola APMC Jyoti)": "आलू (अकोला एपीएमसी ज्योति)",
        "Wheat (Akola APMC Sharbati)": "गेहूं (अकोला एपीएमसी शरबती)",
        "Soybean (Akola APMC Yellow Gr. A)": "सोयाबीन (अकोला एपीएमसी पीला ग्रेड ए)",
        "Cauliflower (Buldhana APMC Snowball)": "फूलगोभी (बुलढाणा एपीएमसी स्नोबॉल)",
        "Red Chilli (Buldhana APMC Byadagi Dry)": "लाल मिर्च (बुलढाणा एपीएमसी ब्यादगी सूखी)"
    },
    mr: {
        // Gov Bar & Tagline
        "Government of India • Ministry of Consumer Affairs, Food & Public Distribution (DoCA)": "भारत सरकार • ग्राहक व्यवहार, अन्न आणि सार्वजनिक वितरण मंत्रालय (DoCA)",
        "Government of India • Ministry of Consumer Affairs, Food & Public Distribution": "भारत सरकार • ग्राहक व्यवहार, अन्न आणि सार्वजनिक वितरण मंत्रालय",
        "Government of India • Department of Consumer Affairs (DoCA) • SIH 2026 (PS 26033)": "भारत सरकार • ग्राहक व्यवहार विभाग (DoCA) • SIH 2026 (PS 26033)",
        "Aadhaar eKYC Enabled | Agmarknet AI Integrated": "आधार ई-केवायसी सक्षम | ॲगमार्कनेट AI एकात्मिक",
        "LIVE AGMARKNET FEED": "थेट ॲगमार्कनेट बाजारभाव",
        "Direct Farm-to-Fork Digital Bridge": "थेट शेतातून ताटापर्यंत डिजिटल सेतू",
        "Farmer / FPO Command Portal": "शेतकरी / FPO नियंत्रण केंद्र",
        "Logistics Route & Fleet Dispatch": "वाहतूक मार्ग व वाहन वितरण",
        "National Escrow & Dispute Console": "राष्ट्रीय एस्क्रो व तक्रार निवारण कक्ष",

        // Navigation
        "Home": "मुख्यपृष्ठ",
        "Marketplace": "बाजारपेठ",
        "AI Forecast": "AI भाव अंदाज",
        "Smart Logistics": "स्मार्ट वाहतूक",
        "Logistics Map": "वाहतूक नकाशा",
        "Escrow Ledger": "एस्क्रो खातेवही",
        "Escrow Status": "एस्क्रो स्थिती",
        "👨‍🌾 Farm Hub & AI": "👨‍🌾 शेतकरी केंद्र व AI",
        "🛒 Fresh Marketplace": "🛒 ताजी बाजारपेठ",
        "🥗 100% Organic": "🥗 १००% सेंद्रिय",
        "Price Audit": "दर पडताळणी",
        "🛡️ Escrow Protection": "🛡️ एस्क्रो संरक्षण",
        "🏢 Bulk Wholesale": "🏢 घाऊक बाजारपेठ",
        "📜 RFQ Contracts & Bids": "📜 RFQ कंत्राट व निविदा",
        "🚚 Freight Corridors": "🚚 मालवाहतूक मार्ग",
        "Institutional Escrow": "संस्थात्मक एस्क्रो",
        "🚚 CVRPTW Optimizer": "🚚 वाहतूक मार्ग अनुकूलक",
        "Fleet & GPS HUD": "वाहन ताफा व GPS ट्रॅकिंग",
        "Pickup Lots": "पिकअप संकलन",
        "Freight Escrow": "वाहतूक एस्क्रो",
        "⚖️ Escrow Ledger & Disputes": "⚖️ एस्क्रो खातेवही व तक्रारी",
        "🌾 Farmer Registry": "🌾 शेतकरी नोंदणी",
        "Produce Price Audit": "शेतमाल दर लेखापरीक्षण",
        "Logistics Grid": "वाहतूक नेटवर्क",
        "Login": "लॉगिन",
        "Register": "नोंदणी",
        "Cart": "कार्ट",
        "My Orders": "माझे ऑर्डर",
        "📦 My Orders": "📦 माझे ऑर्डर",
        "🛒 Cart": "🛒 कार्ट",
        "Search crops, mandis, certs...": "पीके, मंडई, प्रमाणपत्रे शोधा...",
        "Search crops, mandis, certificates, testing labs...": "पीके, मंडई, गुणवत्ता प्रमाणपत्रे, प्रयोगशाळा शोधा...",
        "Help & Support": "मदत आणि सहाय्य",
        "Kisan Sahayata & Support": "शेतकरी सहाय्यता आणि मदत",
        "1-Min Platform Tour": "१-मिनिट प्लॅटफॉर्म टूर",
        "✨ 1-Min Platform Tour": "✨ १-मिनिट प्लॅटफॉर्म टूर",
        "Verify Certificate": "प्रमाणपत्र पडताळा",
        "🔬 Verify Certificate": "🔬 प्रमाणपत्र पडताळा",
        "Voice Reader": "आवाजात ऐका",
        "WhatsApp KisanBot": "व्हॉट्सॲप किसानबॉट",
        "Kisan Call Centre": "किसान कॉल सेंटर",

        // Actions
        "➕ List Produce": "➕ शेतमाल नोंदवा",
        "➕ List New Produce": "➕ नवीन शेतमाल नोंदवा",
        "📋 Post RFQ Contract": "📋 कंत्राट प्रसिद्ध करा",
        "🚚 Driver Cockpit": "🚚 चालक नियंत्रण कक्ष",
        "⚡ Consolidate": "⚡ वाहतूक एकत्रिकरण",
        "⚖️ Escrow Console": "⚖️ एस्क्रो कन्सोल",
        "🔄 Reset Demo": "🔄 डेमो रीसेट करा",
        "Sign Out": "बाहेर पडा",
        "Sign Out / Switch Role (Login)": "साइन आउट / खाते बदला (लॉगिन)",
        "Open Farmer Dashboard →": "शेतकरी डॅशबोर्ड उघडा →",
        "Open Consumer Dashboard →": "ग्राहक डॅशबोर्ड उघडा →",
        "Open Bulk Buyer Dashboard →": "घाऊक खरेदीदार डॅशबोर्ड उघडा →",
        "Open Transporter Dashboard →": "वाहतूकदार डॅशबोर्ड उघडा →",
        "Open Escrow Admin Dashboard →": "प्रशासक डॅशबोर्ड उघडा →",
        "Active Persona:": "सक्रिय व्यक्तीमत्त्व:",

        // Login & Register
        "Login to KisanSetu": "किसानसेतू मध्ये लॉगिन करा",
        "Choose your account role to continue": "पुढे जाण्यासाठी तुमचा खाते प्रकार निवडा",
        "SELECT ACCOUNT TYPE": "खात्याचा प्रकार निवडा",
        "👨‍🌾 Farmer": "👨‍🌾 शेतकरी",
        "🛒 Consumer": "🛒 ग्राहक",
        "🏢 Bulk": "🏢 घाऊक",
        "🚚 Logistics": "🚚 वाहतूक",
        "⚖️ Admin": "⚖️ प्रशासक",
        "⚡ 1-CLICK QUICK DEMO LOGIN (SIH 2026)": "⚡ १-क्लिक जलद डेमो लॉगिन",
        "Instant Auth": "झटपट पडताळणी",
        "📲 Mobile OTP (Fast)": "📲 मोबाईल OTP (जलद)",
        "🔑 Password": "🔑 पासवर्ड",
        "Registered Mobile Number": "नोंदणीकृत मोबाईल नंबर",
        "Enter 10-digit mobile number": "१० अंकी मोबाईल नंबर टाका",
        "Send OTP": "OTP पाठवा",
        "OTP Code": "OTP कोड",
        "Enter 6-digit OTP": "६ अंकी OTP टाका",
        "Verify OTP & Access Hub": "OTP पडताळा आणि पुढे जा",
        "Remember this device for 30 days": "हे उपकरण ३० दिवसांसाठी लक्षात ठेवा",
        "Password": "पासवर्ड",
        "Enter Password": "पासवर्ड टाका",
        "Login with Password": "पासवर्डने लॉगिन करा",
        "New to KisanSetu?": "किसानसेतूवर नवीन आहात?",
        "Register New Account →": "नवीन खाते नोंदवा →",
        "Already registered?": "आधीच नोंदणी केली आहे?",
        "Already have an account?": "आधीच खाते आहे?",
        "Sign In here →": "येथे लॉगिन करा →",
        "Join KisanSetu Ecosystem": "किसानसेतू परिवारात सामील व्हा",
        "Empowering farmers with direct access & transparent escrow": "थेट बाजारपेठ आणि सुरक्षित एस्क्रो द्वारे शेतकऱ्यांचे सक्षमीकरण",
        "I AM REGISTERING AS:": "मी याद्वारे नोंदणी करत आहे:",
        "👨‍🌾 Farmer / FPO": "👨‍🌾 शेतकरी / FPO",
        "🏢 Bulk Buyer": "🏢 घाऊक खरेदीदार",
        "🚚 Transporter": "🚚 मालवाहतूकदार",
        "⚖️ Escrow Admin": "⚖️ एस्क्रो अधिकारी",
        "Full Name / Entity Name": "पूर्ण नाव / संस्थेचे नाव",
        "Mobile Number": "मोबाईल नंबर",
        "Location (District & State)": "स्थान (जिल्हा आणि राज्य)",
        "District & State": "जिल्हा आणि राज्य",
        "Aadhaar Number (UIDAI eKYC)": "आधार क्रमांक (UIDAI e-KYC)",
        "Verify Aadhaar & Create Account": "आधार पडताळा आणि खाते तयार करा",

        // Dashboard Tabs
        "📈 AI Demand & Price Forecast": "📈 AI मागणी व दर अंदाज",
        "📦 Incoming Orders & Counter-Offers": "📦 आलेले ऑर्डर्स व वाटाघाटी",
        "🌱 Active Produce Inventory": "🌱 उपलब्ध शेतमाल साठा",
        "💳 Escrow Wallet & UPI Payouts": "💳 एस्क्रो पाकीट व UPI जमा",
        "👥 FPO Aggregator Group": "👥 FPO शेतकरी गट",
        "🔬 Quality Testing & Assayer Labs": "🔬 गुणवत्ता चाचणी व तपासणी लॅब्स",
        "Network Connectivity": "नेटवर्क स्थिती",
        "ONLINE": "ऑनलाइन",

        // Hero & Stats
        "🌾 Open Marketplace": "🌾 ताजी बाजारपेठ उघडा",
        "🌾 Explore Fresh Marketplace": "🌾 ताजी बाजारपेठ पहा",
        "🏢 Bulk Wholesale Hub": "🏢 घाऊक व्यापार केंद्र",
        "🚚 CVRPTW Route Hub": "🚚 स्मार्ट वाहतूक केंद्र",
        "⚖️ Escrow Governance Console": "⚖️ एस्क्रो कन्सोल",
        "1,450+ Verified Farmers": "१,४५०+ नोंदणीकृत शेतकरी",
        "0% Intermediary Cuts": "०% मध्यस्थांची लूट",
        "+38% Higher Farmer Income": "+३८% शेतकऱ्यांना अधिक नफा",
        "24% Saved by Consumers": "२४% ग्राहकांची थेट बचत",
        "Verified Farmers Registered": "नोंदणीकृत पडताळलेले शेतकरी",
        "Intermediary Arbitrage Cuts": "मध्यस्थांची लूट संपुष्टात",
        "Higher Net Farmer Income": "शेतकऱ्यांना जास्त निव्वळ नफा",
        "Direct Savings for Consumers": "ग्राहकांची थेट पैशांची बचत",

        // Marketplace
        "Fresh Farm Marketplace": "ताजी बाजारपेठ",
        "Direct from verified farmers at fair APMC-indexed prices": "शेतकऱ्यांकडून थेट योग्य एपीएमसी दरानुसार",
        "All Produce": "सर्व शेतमाल",
        "Vegetables": "भाजीपाला",
        "Fruits": "फळे",
        "Grains & Pulses": "धान्य व कडधान्ये",
        "100% Certified Organic": "१००% सेंद्रिय प्रमाणित",
        "Traditional Mandi Price": "स्थानिक अडत भाव",
        "KisanSetu Direct Price": "किसानसेतू थेट दर",
        "Itemized Price Breakdown": "दरांचे पारदर्शक वर्गीकरण",
        "Direct to Farmer": "थेट शेतकऱ्याला",
        "Logistics & Cold Transport": "वाहतूक व शीतगृह",
        "KisanSetu Platform (3%)": "प्लॅटफॉर्म सेवा (३%)",
        "Order with Escrow": "एस्क्रो सुरक्षित ऑर्डर",
        "Add to Cart": "कार्टमध्ये टाका",
        "Buy Now": "आत्ताच खरेदी करा",
        "Search fresh crops, verified farmers, or regions...": "शेतमाल, शेतकरी किंवा तालुका शोधा...",
        "Search produce, farmer, or APMC mandi...": "शेतमाल, शेतकरी किंवा मंडी शोधा...",
        "📊 View Transparent Fee Breakdown (Zero Middlemen) →": "📊 पारदर्शक दर विभाजन पहा (मध्यस्थ नाही) →",

        // Farmer Dashboard
        "AI Forecast & Farm": "AI अंदाज व शेत",
        "AI Price & Demand Forecasting Engine": "AI दर व मागणी अंदाज प्रणाली",
        "Trained on daily Agmarknet mandi data, IMD monsoon radar, and festival calendars to predict the 3-14 day optimal selling window.": "दैनिक ॲगमार्कनेट बाजारभाव, हवामान अंदाज आणि सणासुदीनुसार ३-१४ दिवसांतील सर्वाधिक फायद्याची विक्री वेळ सूचित करते.",
        "Select Crop:": "पीक निवडा:",
        "Tomato (Hybrid Table)": "टोमॅटो (हायब्रिड टेबल)",
        "Onion (Lasalgaon Red)": "कांदा (लासलगाव लाल)",
        "Potato (Jyoti Fresh)": "बटाटा (ज्योती फ्रेश)",
        "CURRENT MANDI BENCHMARK": "चालू बाजार समिती भाव",
        "Current Mandi Benchmark": "चालू बाजार समिती भाव",
        "Nashik APMC Daily Modal Rate": "नाशिक कृषी उत्पन्न बाजार दैनिक दर",
        "AI SUGGESTED FARMER LISTING PRICE": "AI शिफारस केलेला शेतकरी थेट दर",
        "AI Suggested Farmer Listing Price": "AI शिफारस केलेला शेतकरी थेट दर",
        "AI OPTIMAL HARVEST SELLING WINDOW": "AI शिफारस केलेली सर्वोत्तम विक्री वेळ",
        "AI Optimal Harvest Selling Window": "AI शिफारस केलेली सर्वोत्तम विक्री वेळ",
        "Next 4 to 7 Days (Festival Spike)": "पुढील ४ ते ७ दिवस (सणासुदीची मागणी)",
        "Hold produce 3-4 days for +18% upside": "+१८% अधिक नफ्यासाठी माल ३-४ दिवस राखून ठेवा",
        "Sell immediately (high cold-storage releases incoming)": "लगेच विक्री करा (शीतगृहातून आवक सुरू)",
        "Historical Agmarknet Prices + 14-Day AI Forecast Curve": "मागील ॲगमार्कनेट बाजारभाव + १४ दिवसांचा AI दर अंदाज आलेख",
        "Model: Facebook Prophet / XGBoost Ensemble": "मॉडेल: फेसबुक प्रॉफेट / XGBoost प्रगत AI",
        "AI Rationale & Explainability:": "AI विश्लेषण व कारणमीमांसा:",
        "Analysis of 30-day Agmarknet trends + IMD rainfall in Nashik & upcoming Ganesh Utsav shows high consumer demand and temporary supply tightening (+18% expected price hike).": "मागील ३० दिवसांचे बाजारभाव + नाशिकमधील पाऊस आणि आगामी गणेशोत्सवामुळे मागणी वाढून आवक मर्यादित राहण्याची व दर +१८% वाढण्याची शक्यता आहे.",
        "Order & Buyer Management": "ऑर्डर व खरेदीदार व्यवस्थापन",
        "Real-time order requests, counter-offers, and delivery tracking state machine.": "थेट मागणी ऑर्डर्स, वाटाघाटी दर आणि मालवाहतूक ट्रॅकिंग यंत्रणा.",
        "Order ID & Date": "ऑर्डर क्रमांक व दिनांक",
        "Buyer & Location": "खरेदीदार व ठिकाण",
        "Crop & Quantity": "पीक व प्रमाण",
        "Farmer Payout": "शेतकरी जमा रक्कम",
        "Escrow Status": "एस्क्रो स्थिती",
        "Logistics & Tracking": "वाहतूक व ट्रॅकिंग",
        "Actions": "कृती / पर्याय",
        "Accept Order": "ऑर्डर स्वीकारा",
        "Counter": "वाटाघाटी",
        "Confirmed ✓": "निश्चित झाले ✓",
        "Delivered • Escrow Released": "वितरित • एस्क्रो जमा",
        "My Listed Farm Produce": "माझा नोंदवलेला शेतमाल",
        "Manage stock quantities, harvest batch dates, and wholesale tier pricing.": "शिल्लक साठा, काढणीची तारीख आणि घाऊक दर व्यवस्थापित करा.",
        "➕ Add New Produce Listing": "➕ नवीन शेतमाल जोडा",
        "Add New Produce Listing": "नवीन शेतमाल जोडा",
        "Quantity Available:": "उपलब्ध साठा:",
        "Farmer Realized Price:": "शेतकऱ्याला मिळणारा निव्वळ भाव:",
        "Consumer Price on Portal:": "पोर्टलवर ग्राहकांसाठी दर:",
        "Escrow Wallet & Payout Settlement": "एस्क्रो पाकीट व बँक जमा तपशील",
        "Zero middleman commission leakage. 100% of proceeds settled straight to your bank account / UPI.": "दलालांना ०% कमिशन. विक्रीचे १००% पैसे थेट तुमच्या बँक खात्यात / UPI वर जमा.",
        "⚡ Instant UPI Penny-Drop Payout": "⚡ झटपट UPI पेनी-ड्रॉप बँक जमा",
        "HELD IN SECURE ESCROW": "सुरक्षित एस्क्रोमध्ये जमा",
        "Held in Secure Escrow": "सुरक्षित एस्क्रोमध्ये जमा",
        "Releases upon customer delivery OTP confirmation": "ग्राहकाने डिलिव्हरी OTP दिल्यावर थेट खात्यात जमा",
        "SETTLED & DISBURSED TO UPI": "UPI द्वारे थेट खात्यात वर्ग",
        "Settled & Disbursed to UPI": "UPI द्वारे थेट खात्यात वर्ग",
        "MIDDLEMAN CUT ELIMINATED": "दलालांची लूट संपुष्टात",
        "Middleman Cut Eliminated": "दलालांची लूट संपुष्टात",
        "Extra net profit retained on KisanSetu": "किसानसेतूमुळे शेतकऱ्यांचा वाढीव निव्वळ नफा",
        "Escrow Txn Ref": "एस्क्रो व्यवहार संदर्भ",
        "Order Ref": "ऑर्डर संदर्भ",
        "Date": "दिनांक",
        "Customer": "ग्राहक",
        "Gross Order": "एकूण ऑर्डर मूल्य",
        "Direct Farmer Payout": "शेतकऱ्याला थेट जमा",
        "Receipt": "पावती",
        "Released to UPI": "UPI वर जमा झाले",
        "Held in Dispute": "तक्रारीमुळे स्थगित",
        "FPO Aggregator Administration": "FPO शेतकरी गट एकत्रीकरण केंद्र",
        "Sahyadri Farmers Producer Co. • Aggregating 12 member-farmers' harvest into high-volume commercial lots.": "सह्याद्री शेतकरी उत्पादक कंपनी • १२ शेतकरी सदस्यांचा शेतमाल एकत्र करून मोठ्या व्यावसायिक लॉटमध्ये विक्री.",
        "Active FPO Aggregated Lots": "सक्रिय FPO एकत्र साठा लॉट्स",
        "FPO Batch ID": "FPO बॅच क्रमांक",
        "Crop": "शेतमाल",
        "Aggregated Volume": "एकूण संकलित प्रमाण",
        "Participating Farmers": "सहभागी शेतकरी संख्या",
        "Average Realized Price": "सरासरी मिळालेला दर",
        "Status": "स्थिती",
        "Sold to FreshKart": "फ्रेशकार्टला विकले",
        "In Logistics Transit": "वाहतुकीमध्ये सुरू",
        "Member Farmers": "सदस्य शेतकरी",
        "List Farm Produce": "शेतमाल नोंदणी करा",
        "Instant listing with AI-suggested fair pricing from Agmarknet.": "ॲगमार्कनेटच्या आधारे AI ने सुचवलेल्या योग्य दरासह झटपट नोंदणी.",
        "Crop & Variety": "पीक व जात",
        "Category": "प्रवर्ग",
        "Total Quantity (kg)": "एकूण प्रमाण (कि.ग्रॅ.)",
        "Farmer Price (₹/kg)": "शेतकरी दर (₹/कि.ग्रॅ.)",
        "Harvest Timing": "कापणी वेळ",
        "Harvested Today Morning": "आज सकाळी ताजी काढणी",
        "AI Pricing Advisory:": "AI दर सल्ला:",
        "100% Pesticide Residue Free / Organic": "१००% कीटकनाशक मुक्त / सेंद्रिय",
        "🌱 Publish to Live Direct Marketplace →": "🌱 थेट ताजी बाजारपेठेत प्रसिद्ध करा →",
        "Farmer Command Hub & AI": "शेतकरी नियंत्रण केंद्र व AI",
        "LOW-LITERACY VOICE ASSISTANT": "अल्प-साक्षर व्हॉइस सहाय्यक",
        "Offline action queue active. Retries sync with idempotency keys on reconnect.": "ऑफलाइन कृती कतार सक्रिय. इंटरनेट सुरू होताच आपोआप अचूक सिंक होईल.",
        "Aadhaar eKYC Verified": "आधार ई-केवायसी पडताळलेले",
        "✓ Aadhaar eKYC Verified": "✓ आधार ई-केवायसी पडताळलेले",
        "Registered Stakeholder": "नोंदणीकृत घटक",

        // Smart Logistics Dashboard
        "Smart Logistics & CVRPTW": "स्मार्ट वाहतूक व मार्ग नियोजन",
        "SIH 2026 PROBLEM STATEMENT 26033 • SECTIONS 8 & 9": "SIH 2026 समस्या विधान 26033 • विभाग ८ व ९",
        "Capacitated Vehicle Routing Problem (CVRPTW) Engine": "वाहतूक मार्ग व वाहन क्षमता अनुकूलन (CVRPTW) प्रणाली",
        "Batching farm pickups across the Nashik-Pune agricultural corridor into consolidated multi-drop delivery runs, cutting transport cost by 61% and carbon footprint by 68%.": "नाशिक-पुणे शेतमाल मार्गावर वेगवेगळ्या शेतातून एकत्र संकलन करून एकाच गाडीतून वितरण, ज्यामुळे वाहतूक खर्च ६१% व कार्बन उत्सर्जन ६८% कमी होते.",
        "⚠️ View Unoptimized (6 Trips)": "⚠️ असंयोजित मार्ग पहा (६ फेऱ्या)",
        "View Unoptimized (6 Trips)": "असंयोजित मार्ग पहा (६ फेऱ्या)",
        "✨ Optimize Route (1 Consolidated)": "✨ मार्ग अनुकूलित करा (१ एकत्र फेरी)",
        "Optimize Route (1 Consolidated)": "मार्ग अनुकूलित करा (१ एकत्र फेरी)",
        "🚚 Track Live Vehicle GPS": "🚚 थेट वाहन GPS ट्रॅक करा",
        "Track Live Vehicle GPS": "थेट वाहन GPS ट्रॅक करा",
        "Vehicle: Tata Ace EV (MH-15-EG-4921)": "वाहन: टाटा एस ईव्ही (MH-15-EG-4921)",
        "Driver: Santosh Jadhav • Chilled EV Payload: 780 kg / 1,200 kg (65% capacity)": "चालक: संतोष जाधव • शीतगृह EV क्षमता: ७८० कि.ग्रॅ. / १,२०० कि.ग्रॅ. (६५% भरलेला)",
        "Current Live Status": "सध्याची थेट स्थिती",
        "CURRENT LIVE STATUS": "सध्याची थेट स्थिती",
        "In-Transit: Heading to Drop 1 (Baner)": "मार्गावर: वितरण १ (बाणेर) कडे रवाना",
        "✓ Confirm Delivery & Release Escrow": "✓ डिलिव्हरी खात्री करा आणि एस्क्रो जमा करा",
        "Confirm Delivery & Release Escrow": "डिलिव्हरी खात्री करा आणि एस्क्रो जमा करा",
        "🔐 Verify Delivery & Release Escrow →": "🔐 डिलिव्हरी पडताळा आणि एस्क्रो जमा करा →",
        "ℹ️ Inspect CVRPTW Algorithm": "ℹ️ CVRPTW अल्गोरिदम समजून घ्या",
        "Route Economics Audit": "वाहतूक खर्च व थेट बचत विश्लेषण",
        "OPTIMIZED CVRPTW": "अनुकूलित CVRPTW",
        "UNOPTIMIZED ROUTE": "असंयोजित मार्ग",
        "UNOPTIMIZED (6 TRIPS)": "असंयोजित (६ फेऱ्या)",
        "HEADLINE SIH DEMO COMPARISON": "SIH थेट बचत तुलना",
        "Headline SIH Demo Comparison": "SIH थेट बचत तुलना",
        "61% Transport Savings": "६१% थेट वाहतूक बचत",
        "Comparing 6 individual farmer trips vs. 1 consolidated multi-node milk-run corridor.": "६ वेगवेगळ्या स्वतंत्र गाड्यांऐवजी १ एकत्र सर्वसमावेशक वाहतूक फेरी.",
        "Total Distance:": "एकूण अंतर:",
        "Corridor Transport Cost:": "एकूण वाहतूक खर्च:",
        "Carbon Emissions:": "कार्बन उत्सर्जन:",
        "Transit Fleet Required:": "आवश्यक वाहने:",
        "6 Vehicles": "६ गाड्या",
        "1 EV Chiller": "१ शीतगृह EV गाडी",
        "Ordered Stop Sequence & ETAs": "क्रमबद्ध थांबे व पोहोचण्याची वेळ (ETA)",
        "Turn-by-Turn GPS API Integration: Deep-links directly to Google Maps / Mapbox mobile navigation for rural gig drivers.": "टर्न-बाय-टर्न GPS नेव्हिगेशन: ग्रामीण चालकांसाठी थेट गुगल मॅप्स / मॅपबॉक्सशी जोडलेले.",
        "DEPOT": "डेपो (प्रस्थान केंद्र)",
        "PICKUP": "पिकअप (शेतमाल संकलन)",
        "DROP": "वितरण (ग्राहक/बाजार)",
        "Nashik Consolidation Hub (Depot)": "नाशिक संकलन केंद्र (डेपो)",
        "Departure Hub (6:00 AM)": "प्रस्थान केंद्र (सकाळी ६:००)",
        "Farm 1: Ramesh Shinde (Dindori)": "शेत १: रमेश शिंदे (दिंडोरी)",
        "+250 kg Tomatoes (Fresh Cut)": "+२५० कि.ग्रॅ. टोमॅटो (ताजा माल)",
        "Farm 2: Balwantrao Patil (Lasalgaon)": "शेत २: बळवंतराव पाटील (लासलगाव)",
        "+350 kg Red Onions": "+३५० कि.ग्रॅ. लाल कांदा",
        "Farm 3: Kailash Deshmukh (Khed)": "शेत ३: कैलास देशमुख (खेड)",
        "+180 kg Jyoti Potatoes": "+१८० कि.ग्रॅ. ज्योती बटाटा",
        "Drop 1: Retail Cluster (Baner & Aundh)": "वितरण १: ग्राहक संकुल (बाणेर व औंध)",
        "-280 kg Fresh Packs": "-२८० कि.ग्रॅ. ताजे पॅक्स",
        "Drop 2: GreenGrocer Bulk DC (Pune)": "वितरण २: ग्रीनग्रोसर घाऊक केंद्र (पुणे)",
        "-350 kg Bulk Onion Bags": "-३५० कि.ग्रॅ. घाऊक कांदा पोती",
        "Drop 3: Kalyani Nagar Society Cluster": "वितरण ३: कल्याणी नगर सोसायटी संकुल",
        "-150 kg Mixed Produce": "-१५० कि.ग्रॅ. मिश्रित शेतमाल",
        "⚡ Consolidate & Optimize": "⚡ एकत्रिकरण व अनुकूलन",
        "Consolidate & Optimize": "एकत्रिकरण व अनुकूलन",

        // Admin Escrow Dashboard
        "Escrow Ledger & Governance": "एस्क्रो खातेवही व प्रशासकीय नियंत्रण",
        "SIH 2026 PROBLEM STATEMENT 26033 • SECTION 11 PAYMENTS & ESCROW": "SIH 2026 समस्या विधान 26033 • विभाग ११ पेमेंट व एस्क्रो",
        "Transparent Escrow Ledger & Dispute Resolution Console": "पारदर्शक एस्क्रो खातेवही व तक्रार निवारण कक्ष",
        "Demonstrating the exact hold-and-release state machine that protects both the farmer and consumer. Funds remain locked in the gateway nodal account until delivery OTP confirmation or dispute grace window closure.": "शेतकरी आणि ग्राहक दोघांचेही रक्षण करणारी एस्क्रो सुरक्षा यंत्रणा. डिलिव्हरी OTP पडताळणी किंवा तक्रार कालावधी पूर्ण होईपर्यंत रक्कम सुरक्षित नोडल खात्यात जमा राहते.",
        "Gross Merchandise Value (GMV)": "एकूण व्यापार मूल्य (GMV)",
        "GROSS MERCHANDISE VALUE (GMV)": "एकूण व्यापार मूल्य (GMV)",
        "Total transparent transactions logged": "नोंदवलेले एकूण पारदर्शक व्यवहार",
        "Farmer Direct Payouts (UPI)": "शेतकऱ्यांना थेट बँक जमा (UPI)",
        "FARMER DIRECT PAYOUTS (UPI)": "शेतकऱ्यांना थेट बँक जमा (UPI)",
        "86.3% net share to agricultural producers": "८६.३% निव्वळ रक्कम थेट शेतकरी बांधवांना",
        "Held in Nodal Escrow": "नोडल एस्क्रोमध्ये सुरक्षित",
        "HELD IN NODAL ESCROW": "नोडल एस्क्रोमध्ये सुरक्षित",
        "Protected by 24h SLA Auto-Release": "२४ तास स्वयं-वितरण हमी",
        "KisanSetu Platform Reserve (3.5%)": "किसानसेतू प्लॅटफॉर्म सेवा निधी (३.५%)",
        "KISANSETU PLATFORM RESERVE (3.5%)": "किसानसेतू प्लॅटफॉर्म सेवा निधी (३.५%)",
        "Sustains open AI & logistics tech infrastructure": "AI व लॉजिस्टिक्स डिजिटल यंत्रणेच्या देखभालीसाठी",
        "Escrow Lifecycle State Machine Flow": "एस्क्रो सुरक्षा जीवनचक्र प्रवाह",
        "1. Payment Collected": "१. रक्कम जमा झाली",
        "UPI / Cards / COD": "UPI / कार्ड / नेट बँकिंग",
        "2. Held in Escrow": "२. एस्क्रोमध्ये सुरक्षित",
        "Nodal Account Locked": "नोडल बँक खात्यात लॉक",
        "3. CVRPTW Transit": "३. थेट मालवाहतूक",
        "Live GPS Tracking": "थेट GPS ट्रॅकिंग",
        "4. Delivery OTP": "४. डिलिव्हरी OTP",
        "Buyer Verifies Goods": "ग्राहकाने माल तपासला",
        "5. Escrow Released": "५. एस्क्रो रक्कम वर्ग",
        "Direct to Farmer UPI": "थेट शेतकऱ्याच्या खात्यात जमा",
        "Live Escrow Transactions Ledger": "थेट एस्क्रो व्यवहार खातेवही",
        "Real-time audit log with interactive state simulation buttons for SIH evaluation.": "SIH मूल्यमापनासाठी परस्परसंवादी बटणांसह थेट पारदर्शक ऑडिट खातेवही.",
        "All Records": "सर्व व्यवहार",
        "Held in Escrow": "एस्क्रोमध्ये सुरक्षित",
        "Released": "जमा झाले",
        "Disputed": "तक्रार असलेले",
        "Txn ID": "व्यवहार क्र.",
        "Buyer & Farmer": "खरेदीदार व शेतकरी",
        "Farmer Net Payout": "शेतकऱ्यास निव्वळ रक्कम",
        "Logistics / Platform": "वाहतूक / प्लॅटफॉर्म शुल्क",
        "Interactive Simulation Actions": "प्रशासकीय कृती",
        "Released to Farmer UPI": "शेतकऱ्याच्या UPI वर जमा",
        "⚠️ Dispute Paused": "⚠️ तक्रारीमुळे थांबवले",
        "🛡️ Held in Escrow": "🛡️ एस्क्रोमध्ये सुरक्षित",
        "Settled to UPI ✓": "UPI खात्यात जमा झाले ✓",
        "✓ Confirm & Release": "✓ खात्री करा व जमा करा",
        "Confirm & Release": "खात्री करा व जमा करा",
        "⚠️ Simulate Dispute": "⚠️ तक्रार दाखल करा",
        "Simulate Dispute": "तक्रार दाखल करा",
        "Release to Farmer": "शेतकऱ्यास रक्कम द्या",
        "Refund Buyer": "ग्राहकास परतावा द्या",
        "DIRECT REBUTTAL TO PS OPENING CLAIM": "दलाली निर्मूलनाचा थेट पारदर्शक पुरावा",
        "\"How KisanSetu Guarantees Fair Farmer Earnings\"": "\"किसानसेतू शेतकऱ्यांना कसा रास्त आणि हमखास नफा मिळवून देतो\"",
        "Test any custom basket size to inspect the exact fee reconciliation algorithm.": "नफा व खर्चाचे अचूक वाटप तपासण्यासाठी कोणतीही रक्कम टाकून पहा.",
        "Test Basket Gross Amount:": "चाचणी एकूण खरेदी रक्कम:",
        "DIRECT TO FARMER (85%)": "थेट शेतकऱ्याला (८५%)",
        "Zero unlisted mandi broker cuts": "शून्य अनाधिकृत अडत कपात",
        "COLD LOGISTICS (11.5%)": "शीतगृह वाहतूक (११.५%)",
        "Consolidated CVRPTW corridor": "एकत्रित CVRPTW वाहतूक मार्ग",
        "PLATFORM FEE (3.5%)": "प्लॅटफॉर्म सेवा शुल्क (३.५%)",
        "Sustains cloud AI & escrow APIs": "क्लाउड AI व एस्क्रो यंत्रणेसाठी",
        "MIDDLEMAN CUT ON KISANSETU": "किसानसेतूवर दलालांची लूट",
        "vs ₹450-₹550 in traditional APMC": "पारंपरिक अडतीत लागणाऱ्या ₹४५०-₹५५० च्या तुलनेत",
        "Raise Escrow Quality Dispute": "एस्क्रो गुणवत्ता तक्रार नोंदवा",
        "Simulates a consumer finding damaged produce upon delivery. Escrow auto-release is paused immediately.": "मालाचे नुकसान झाल्याची ग्राहकाची तक्रार. एस्क्रो जमा होणे त्वरित थांबवले जाते.",
        "Dispute Reason / Category": "तक्रारीचे कारण / प्रकार",
        "Transit Bruising / Crushed in Delivery (30% weight damaged)": "वाहतुकीदरम्यान मालाचे नुकसान (३०% माल खराब)",
        "Underweight Delivery (Received 8kg instead of 10kg)": "कमी वजन पोहोचले (१० किलो ऐवजी ८ किलो मिळाले)",
        "Wrong Produce Grade Delivered": "चुकीचा प्रतवारी माल मिळाला",
        "Photo Proof of Damaged Goods": "खराब मालाचा फोटो पुरावा",
        "📸 Simulated Photo Proof Uploaded (tomato_damage_proof.jpg)": "📸 फोटो पुरावा जोडला (tomato_damage_proof.jpg)",
        "⚠️ Lock Escrow & Halt Farmer Payout": "⚠️ एस्क्रो लॉक करा व पैसे थांबवा",
        "🔄 Reset Demo Data": "🔄 डेमो डेटा रीसेट करा",
        "Reset Demo Data": "डेमो डेटा रीसेट करा",

        // Marketplace & Wholesale RFQ
        "Fresh Agricultural Produce": "ताजा शेतमाल",
        "100% of produce delivered directly from verified farm gates within 24-48 hours of harvest.": "कापणीनंतर २४ ते ४८ तासांच्या आत १००% शेतमाल थेट शेतकऱ्यांकडून ग्राहकांपर्यंत.",
        "Verified Direct Sourcing • SIH 2026": "पडताळलेला थेट शेतमाल • SIH 2026",
        "🥗 Retail Consumers": "🥗 किरकोळ ग्राहक",
        "Retail Consumers": "किरकोळ ग्राहक",
        "🏢 Bulk Wholesale & RFQ": "🏢 घाऊक बाजार व RFQ",
        "Bulk Wholesale & RFQ": "घाऊक बाजार व RFQ",
        "All Crops": "सर्व शेतमाल",
        "🌿 100% Organic": "🌿 १००% सेंद्रिय",
        "Radius: All Distances": "अंतर: सर्व तालुके",
        "📍 Radius: All Distances": "📍 अंतर: सर्व तालुके",
        "Within 25 km (Local Hub)": "२५ किमीच्या आत (स्थानिक केंद्र)",
        "📍 Within 25 km (Local Hub)": "📍 २५ किमीच्या आत (स्थानिक केंद्र)",
        "Within 50 km (Regional)": "५० किमीच्या आत (प्रादेशिक)",
        "📍 Within 50 km (Regional)": "📍 ५० किमीच्या आत (प्रादेशिक)",
        "eKYC Verified Only": "फक्त e-KYC पडताळलेले",
        "COMMERCIAL BUYER SPECIAL": "व्यावसायिक खरेदीदार विशेष",
        "Need Large Volumes? Post a Request for Quote (RFQ)": "मोठ्या प्रमाणात शेतमाल हवाय? निविदा (RFQ) प्रसिद्ध करा",
        "Farmers & FPOs will directly bid competitive rates to fulfill your commercial requirement.": "शेतकरी व FPO थेट सर्वोत्तम दराची बोली लावून तुमची गरज पूर्ण करतील.",
        "📝 Post New RFQ Requirement": "📝 नवीन RFQ निविदा प्रसिद्ध करा",
        "Post New RFQ Requirement": "नवीन RFQ निविदा प्रसिद्ध करा",
        "REVERSE AUCTION SYSTEM": "रिव्हर्स लिलाव पद्धत",
        "Active Bulk Buyer RFQs & Farmer Quotes": "सक्रिय घाऊक RFQ व शेतकरी निविदा",
        "Commercial requirements currently receiving competitive farm bids.": "व्यावसायिक मागण्या ज्यांवर शेतकरी थेट स्पर्धात्मक बोली लावत आहेत.",
        "RFQ ID": "RFQ क्रमांक",
        "Buyer Organization": "खरेदीदार संस्था",
        "Crop Required": "अपेक्षित शेतमाल",
        "Quantity": "प्रमाण",
        "Price Ceiling": "कमाल दर मर्यादा",
        "Farmer Bids Received": "प्राप्त शेतकरी निविदा",
        "Open Reverse Auction": "सुरू लिलाव",
        "Shopping Cart": "खरेदी कार्ट",
        "Escrow-Protected Checkout": "एस्क्रो सुरक्षित पेमेंट",
        "Items in Cart": "कार्टमधील वस्तू",
        "Delivery Recipient Details": "वितरण पत्ता व तपशील",
        "Full Name": "पूर्ण नाव",
        "Mobile Number (for delivery OTP)": "मोबाईल नंबर (डिलिव्हरी OTP साठी)",
        "Delivery Address & Landmark": "वितरण पत्ता व खूण",
        "Payment Method": "पेमेंट पद्धत",
        "UPI (Google Pay / PhonePe / BHIM)": "UPI (Google Pay / PhonePe / BHIM)",
        "Net Banking / Rupay Card": "नेट बँकिंग / RuPay कार्ड",
        "Subtotal": "एकूण रक्कम",
        "Delivery & Cold-Chain Transport": "वाहतूक व शीतगृह सेवा",
        "Total Payable:": "एकूण देय रक्कम:",
        "Place Escrow-Protected Order →": "एस्क्रो सुरक्षित ऑर्डर करा →",
        "Itemized Price Breakdown & Transparency Audit": "किंमतींचे पारदर्शक वर्गीकरण व लेखापरीक्षण",
        "SIH 2026 Mandate: Absolute Transparency Against Middlemen": "SIH 2026 आदेश: दलालांविरुद्ध पूर्ण पारदर्शकता",
        "Produce Item": "शेतमाल",
        "Nashik APMC Daily Reference": "नाशिक एपीएमसी दैनिक संदर्भ भाव",
        "KisanSetu Direct Consumer Price": "किसानसेतू थेट ग्राहक दर",
        "Zero Middleman Cut": "मध्यस्थ शुल्क शून्य",
        "Cold Logistics (Consolidated CVRPTW Run)": "शीतगृह वाहतूक (स्मार्ट मार्ग)",
        "Total Item Cost": "एकूण दर",
        "Traditional APMC Commission / Wastage Arbitrage": "पारंपरिक एपीएमसी दलाली व नासाडी फरक",
        "Search crops, farmers, districts (e.g. Tomato, Nashik, Organic)...": "शेतमाल, शेतकरी किंवा तालुका शोधा (उदा. टोमॅटो, नाशिक, सेंद्रिय)...",
        "No produce matches your current filter": "निवडलेल्या निकषानुसार शेतमाल आढळला नाही",
        "Try expanding your proximity radius or selecting \"All Crops\".": "कृपया अंतराची मर्यादा वाढवा किंवा \"सर्व शेतमाल\" निवडा.",
        "🌾 YOUR FARM LISTING": "🌾 तुमची स्वतःची शेतमाल नोंद",
        "✓ eKYC Verified": "✓ e-KYC पडताळलेले",
        "ORGANIC": "सेंद्रिय",
        "Manage Lot in Farmer Command Hub": "⚙️ शेतकरी केंद्रात साठा व्यवस्थापित करा",

        // Farmer Dashboard Navigation & Tabs
        "AI Demand & Price Forecast": "AI मागणी व दर अंदाज",
        "APMC Mandi Rates (Amravati)": "एपीएमसी बाजार समिती दर (अमरावती)",
        "Incoming Orders & Counter-Offers": "प्राप्त ऑर्डर्स व वाटाघाटी",
        "Active Produce Inventory": "उपलब्ध शेतमाल साठा",
        "Escrow Wallet & UPI Payouts": "एस्क्रो पाकीट व यूपीआय खात्यात जमा",
        "FPO Aggregator Group": "FPO शेतकरी उत्पादक गट",
        "Quality Testing & Assayer Labs": "प्रतवारी चाचणी व प्रयोगशाळा",

        // Farmer Dashboard Mandi Table
        "Amravati Division APMC Mandi Rates": "अमरावती विभाग एपीएमसी बाजार भाव",
        "Real-time wholesale modal arrivals for Akola APMC & Buldhana APMC (July 10 – September 9, 2026) verified via Agmarknet / data.gov.in.": "अकोला व बुलढाणा एपीएमसी घाऊक आवक दर (१० जुलै - ९ सप्टेंबर, २०२६) ॲगमार्कनेटद्वारे पडताळलेले.",
        "Filter APMC:": "मंडी निवडा:",
        "All Mandis (Akola & Buldhana)": "सर्व बाजार समित्या (अकोला व बुलढाणा)",
        "Akola APMC": "अकोला एपीएमसी",
        "Buldhana APMC": "बुलढाणा एपीएमसी",
        "Commodity:": "शेतमाल / पीक:",
        "All Commodities (7 Crops)": "सर्व शेतमाल (७ पिके)",
        "Tomato (Hybrid)": "टोमॅटो (हायब्रिड)",
        "Onion (Red Kharif)": "कांदा (लाल खरीप)",
        "Potato (Jyoti)": "बटाटा (ज्योती)",
        "Wheat (Sharbati)": "गहू (शरबती)",
        "Soybean (Yellow Gr. A)": "सोयाबीन (पिवळा ग्रेड A)",
        "Cauliflower (Snowball)": "फ्लॉवर (स्नोबॉल)",
        "Red Chilli (Byadagi Dry)": "लाल मिरची (ब्याडगी सुकी)",
        "Search date, crop...": "तारीख, पीक शोधा...",
        "View Full Market Terminal →": "संपूर्ण मार्केट टर्मिनल पहा →",
        "Mandi Yard": "बाजार आवार",
        "Min (₹/kg)": "किमान (₹/किलो)",
        "Max (₹/kg)": "कमाल (₹/किलो)",
        "Modal Price": "सरासरी भाव",
        "Modal (₹/Qtl)": "सरासरी (₹/क्विंटल)",
        "Arrivals": "दैनिक आवक",
        "24h Trend": "२४ तास कल",
        "Forecast": "अंदाज",
        "AI Curve": "AI आलेख",

        // Quality Assaying & Labs
        "Smart India Hackathon 2026 • DoCA PS 26033": "स्मार्ट इंडिया हॅकाथॉन २०२६ • ग्राहक व्यवहार मंत्रालय",
        "AGMARK & NABL Accredited Testing": "ॲगमार्क व NABL मान्यताप्राप्त प्रयोगशाळा",
        "Authorized Quality Assaying & Testing Centers": "अधिकृत प्रतवारी व गुणवत्ता चाचणी प्रयोगशाळा",
        "Locate accredited testing laboratories, KVK centers, and APMC assaying terminals near": "आपल्या नजीक अधिकृत प्रयोगशाळा, केव्हीके केंद्रे आणि बाजार समिती प्रतवारी केंद्रे शोधा",
        "Verify Any Certificate": "प्रमाणपत्र पडताळा",
        "Book Farm-Gate Sample Pickup": "थेट बांधावरून नमुना संकलन बुक करा",
        "Schedule Farm Collection": "बांधावर चाचणी निश्चित करा",
        "Call Lab": "प्रयोगशाळेला कॉल करा",
        "View Sample Certificate": "नमुना प्रमाणपत्र पहा",
        "All Districts": "सर्व जिल्हे",
        "All Commodities": "सर्व शेतमाल",
        "Search lab name, equipment, crop, or location...": "प्रयोगशाळेचे नाव, उपकरणे, पीक किंवा ठिकाण शोधा...",
        "How Quality Assaying Works for Farmers on KisanSetu": "किसानसेतूवर शेतकऱ्यांसाठी प्रतवारी चाचणी कशी कार्य करते",
        "Transparent certification protects farmers from unscientific mandi rejections and unlocks bulk buyer premiums.": "पारदर्शक प्रमाणीकरणामुळे बाजारात विनाकारण माल नाकारला जात नाही आणि १८-२५% जास्त दर मिळतो.",
        "1. Sample Collection": "१. नमुना संकलन",
        "Walk-in or Farm Pickup": "थेट भेट किंवा बांधावरून पिकअप",
        "Bring a 1-2 kg composite produce sample to any lab or request an assayer van to visit your farm gate in Dindori.": "कोणत्याही प्रयोगशाळेत १-२ किलो नमुना आणा किंवा दिंडोरीत थेट शेतात सॅम्पल व्हॅन बोलवा.",
        "2. Machine Calibration": "२. अचूक डिजिटल चाचणी",
        "Objective Grading": "वस्तुनिष्ठ प्रतवारी",
        "Automated sensors test moisture, Brix sweetness, millimeter caliber, and FSSAI pesticide MRLs in 15–20 minutes.": "स्वयंचलित सेन्सर्स १५-२० मिनिटांत ओलावा, गोडवा, साईझ आणि कीटकनाशक प्रमाणाची अचूक चाचणी करतात.",
        "3. Cryptographic Pass": "३. डिजिटल स्वाक्षरी प्रमाणपत्र",
        "Direct Marketplace Boost": "बाजारपेठेत वाढीव दर",
        "A digitally signed AGMARK certificate is linked to your lot. Buyers purchase instantly with zero quality disputes.": "डिजिटल स्वाक्षरी असलेले ॲगमार्क प्रमाणपत्र शेतमालाशी जोडले जाते. खरेदीदार विनातक्रार त्वरित खरेदी करतात.",
        "Location:": "ठिकाण:",
        "Assayer In-Charge:": "प्रयोगशाळा प्रमुख:",
        "Operating Hours:": "कामकाजाची वेळ:",
        "Contact:": "संपर्क:",
        "Crops:": "शेतमाल:",
        "Available Equipment & Testing Kits:": "उपलब्ध उपकरणे व चाचणी किट:",
        "Turnaround:": "चाचणी कालावधी:",
        "Assay Fee:": "चाचणी शुल्क:",
        "Book Pickup": "पिकअप बुक करा",
        "Cert": "प्रमाणपत्र",
        "Map": "नकाशा",
        "Call": "कॉल",
        "On-Farm Pickup Available": "बांधावर संकलन उपलब्ध",
        "Mandi Yard Walk-in": "बाजार आवार थेट भेट",
        "NEAREST": "सर्वात जवळ",
        "NEAREST TESTING CENTER • 14 KM FROM YOUR FARM": "सर्वात जवळची लॅब • तुमच्या शेतापासून १४ किमी",
        "Spot Assay: 15–20 Mins": "त्वरित चाचणी: १५–२० मिनिटे",
        "Govt Subsidized (FREE Spot / ₹75 MRL)": "शासकीय अनुदानित (मोफत स्पॉट / ₹७५ MRL)",
        "On-Farm Pickup Van Active in Dindori": "बांधावर नमुना संकलन व्हॅन दिंडोरीत कार्यरत",

        // Badges & Labels
        "Assayer Certified": "प्रतवारी प्रमाणित",
        "View Sheet 📄": "प्रमाणपत्र पहा 📄",
        "Network Connectivity": "नेटवर्क कनेक्टिव्हिटी",
        "ONLINE": "ऑनलाइन",
        "Hold produce 3-4 days for upside": "+१८% अधिक नफ्यासाठी माल ३-४ दिवस राखून ठेवा",
        "Akola APMC Daily Modal Rate": "अकोला बाजार समिती दैनिक दर",
        "Buldhana APMC Daily Modal Rate": "बुलढाणा बाजार समिती दैनिक दर",
        "Daily Modal Rate": "दैनंदिन सरासरी दर",
        "Tomato (Akola APMC Hybrid)": "टोमॅटो (अकोला एपीएमसी हायब्रिड)",
        "Onion (Buldhana APMC Red Kharif)": "कांदा (बुलढाणा एपीएमसी लाल खरीप)",
        "Potato (Akola APMC Jyoti)": "बटाटा (अकोला एपीएमसी ज्योती)",
        "Wheat (Akola APMC Sharbati)": "गहू (अकोला एपीएमसी शरबती)",
        "Soybean (Akola APMC Yellow Gr. A)": "सोयाबीन (अकोला एपीएमसी पिवळा ग्रेड A)",
        "Cauliflower (Buldhana APMC Snowball)": "फ्लॉवर (बुलढाणा एपीएमसी स्नोबॉल)",
        "Red Chilli (Buldhana APMC Byadagi Dry)": "लाल मिरची (बुलढाणा एपीएमसी ब्याडगी सुकी)"
    }
};

// Lowercase index cache for case-insensitive lookup
const UI_TRANSLATIONS_LOWER = { hi: {}, mr: {} };
function initTranslationsIndex() {
    ['hi', 'mr'].forEach(lang => {
        if (!UI_TRANSLATIONS[lang]) return;
        UI_TRANSLATIONS_LOWER[lang] = {};
        for (const [key, val] of Object.entries(UI_TRANSLATIONS[lang])) {
            UI_TRANSLATIONS_LOWER[lang][key.trim().toLowerCase()] = val;
        }
    });
}
initTranslationsIndex();

function translateText(text, lang) {
    if (!text || lang === 'en') return text;
    const clean = text.trim();
    if (!clean) return text;

    // 1. Direct exact match
    if (UI_TRANSLATIONS[lang] && UI_TRANSLATIONS[lang][clean]) {
        return UI_TRANSLATIONS[lang][clean];
    }

    // 2. Case-insensitive match (handles ALL CAPS titles like CURRENT MANDI BENCHMARK)
    const lower = clean.toLowerCase();
    if (UI_TRANSLATIONS_LOWER[lang] && UI_TRANSLATIONS_LOWER[lang][lower]) {
        return UI_TRANSLATIONS_LOWER[lang][lower];
    }

    // 3. Leading emoji/symbol strip & translate remainder
    const emojiMatch = clean.match(/^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}✓⚠️⚡✨📝📍💡🧠🔊📸➕📦🌱💳👥🛒⚖️🏢🥗📜]+)\s*(.+)$/u);
    if (emojiMatch) {
        const symbol = emojiMatch[1];
        const remainder = emojiMatch[2].trim();
        const trRemainder = translateText(remainder, lang);
        if (trRemainder && trRemainder !== remainder) {
            return `${symbol} ${trRemainder}`;
        }
    }

    // 4. Dynamic agricultural & dashboard patterns
    // Confidence range
    const confMatch = clean.match(/^Confidence:\s*(.+)$/i);
    if (confMatch) {
        return (lang === 'mr' ? 'अंदाजित दर पट्टा: ' : 'विश्वसनीयता श्रेणी: ') + confMatch[1];
    }
    // Held in escrow SLA
    const slaMatch = clean.match(/^Held in Escrow\s*\((.+)h SLA\)$/i);
    if (slaMatch) {
        return (lang === 'mr' ? `एस्क्रोमध्ये सुरक्षित (${slaMatch[1]} तास SLA)` : `एस्क्रो में सुरक्षित (${slaMatch[1]} घंटे SLA)`);
    }
    // Stop sequence
    const stopMatch = clean.match(/^Stop\s*(\d+):\s*(.+)$/i);
    if (stopMatch) {
        const stopTr = translateText(stopMatch[2], lang);
        return (lang === 'mr' ? `थांबा ${stopMatch[1]}: ${stopTr}` : `पड़ाव ${stopMatch[1]}: ${stopTr}`);
    }
    // Live vehicle arrive ping
    const arrivedMatch = clean.match(/^Arrived at Stop\s*(\d+):\s*(.+)$/i);
    if (arrivedMatch) {
        const stopTr = translateText(arrivedMatch[2], lang);
        return (lang === 'mr' ? `थांबा ${arrivedMatch[1]} वर पोहोचले: ${stopTr}` : `पड़ाव ${arrivedMatch[1]} पर पहुंचे: ${stopTr}`);
    }
    // Quantity Available
    const qtyMatch = clean.match(/^Quantity Available:\s*(.+)$/i);
    if (qtyMatch) {
        return (lang === 'mr' ? 'उपलब्ध साठा: ' : 'उपलब्ध मात्रा: ') + qtyMatch[1];
    }
    // Farmer Realized Price
    const farmPriceMatch = clean.match(/^Farmer Realized Price:\s*(.+)$/i);
    if (farmPriceMatch) {
        return (lang === 'mr' ? 'शेतकऱ्याला मिळणारा भाव: ' : 'किसान को प्राप्त मूल्य: ') + farmPriceMatch[1];
    }
    // Save X%
    const saveMatch = clean.match(/^Save\s*(\d+)%$/i);
    if (saveMatch) {
        return `${saveMatch[1]}% ` + (lang === 'mr' ? 'बचत' : 'बचत');
    }
    // Retail/Mandi
    const retMandiMatch = clean.match(/^Retail\/Mandi:\s*(.+)$/i);
    if (retMandiMatch) {
        return (lang === 'mr' ? 'स्थानिक अडत भाव: ' : 'पारंपरिक मंडी भाव: ') + retMandiMatch[1];
    }
    // Showing X Centers
    const countMatch = clean.match(/^Showing\s*(\d+)\s*Centers?$/i);
    if (countMatch) {
        return lang === 'mr' ? `${countMatch[1]} प्रयोगशाळा दाखवत आहे` : `${countMatch[1]} केंद्र प्रदर्शित`;
    }
    // X km away
    const kmMatch = clean.match(/^(\d+(?:\.\d+)?)\s*km away$/i);
    if (kmMatch) {
        return lang === 'mr' ? `${kmMatch[1]} किमी अंतरावर` : `${kmMatch[1]} किमी दूर`;
    }
    // Member Farmers
    const membersMatch = clean.match(/^(\d+)\s*Member Farmers$/i);
    if (membersMatch) {
        return lang === 'mr' ? `${membersMatch[1]} शेतकरी सदस्य` : `${membersMatch[1]} सदस्य किसान`;
    }
    // Transferred to ...
    const transMatch = clean.match(/^Transferred to\s*(.+)$/i);
    if (transMatch) {
        return lang === 'mr' ? `${transMatch[1]} वर वर्ग केले` : `${transMatch[1]} पर स्थानांतरित`;
    }
    // Role: ...
    const roleMatch = clean.match(/^Role:\s*(.+)$/i);
    if (roleMatch) {
        return (lang === 'mr' ? 'भूमिका: ' : 'भूमिका: ') + roleMatch[1];
    }

    return text;
}

/**
 * Universal TreeWalker DOM Translator
 * Replaces visible text nodes directly without destroying HTML structure or canvas/maps
 */
function translateDom(rootNode = document.body, lang = null) {
    if (!rootNode) return;
    if (!lang) {
        lang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');
    }

    // 1. Walk every visible text node
    const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toUpperCase();
                if (['SCRIPT', 'STYLE', 'CANVAS', 'SVG', 'CODE', 'NOSCRIPT'].includes(tag)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.closest('#tickerTrack') || parent.closest('.lang-selector') || parent.closest('.notranslate')) {
                    return NodeFilter.FILTER_REJECT;
                }
                const trimmed = node.nodeValue.trim();
                if (!trimmed) return NodeFilter.FILTER_REJECT;
                // Pure numbers or single non-text characters skip unless dictionary has them
                if (/^[0-9.,₹$%+\-/*:;()#@!_~<>=\s]+$/.test(trimmed)) {
                    if (!UI_TRANSLATIONS.hi[trimmed] && !UI_TRANSLATIONS.mr[trimmed]) {
                        return NodeFilter.FILTER_SKIP;
                    }
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
        if (typeof currentNode._origText === 'undefined') {
            currentNode._origText = currentNode.nodeValue;
        }
        const orig = currentNode._origText;
        const trimmed = orig.trim();

        if (lang === 'en') {
            currentNode.nodeValue = orig;
        } else {
            const translated = translateText(trimmed, lang);
            if (translated && translated !== trimmed) {
                const leading = orig.match(/^\s*/)[0];
                const trailing = orig.match(/\s*$/)[0];
                currentNode.nodeValue = leading + translated + trailing;
            }
        }
        currentNode = walker.nextNode();
    }

    // 2. Input and Textarea placeholders
    rootNode.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(inp => {
        if (inp.closest('.notranslate')) return;
        if (typeof inp._origPlaceholder === 'undefined') {
            inp._origPlaceholder = inp.placeholder;
        }
        const orig = (inp._origPlaceholder || '').trim();
        if (!orig) return;
        if (lang === 'en') {
            inp.placeholder = inp._origPlaceholder;
        } else {
            const tr = translateText(orig, lang);
            if (tr) inp.placeholder = tr;
        }
    });

    // 3. Option elements in select dropdowns
    rootNode.querySelectorAll('option').forEach(opt => {
        if (typeof opt._origText === 'undefined') {
            opt._origText = opt.textContent;
        }
        const orig = (opt._origText || '').trim();
        if (!orig) return;
        if (lang === 'en') {
            opt.textContent = opt._origText;
        } else {
            const tr = translateText(orig, lang);
            if (tr) opt.textContent = tr;
        }
    });
}

// Expose globally for dynamic components
window.translateDom = translateDom;
window.translateText = translateText;
window.applyLanguage = applyLanguage;

// ==========================================
// Language Switcher & Localization
// ==========================================
function initLanguage() {
    const currentLang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');
    applyLanguage(currentLang);

    // Give asynchronous or synchronous DOM elements a slight moment to render on first load
    setTimeout(() => {
        applyLanguage(window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en'));
    }, 80);

    // Click handler with event delegation so all .lang-btn instances everywhere work
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn');
        if (!btn) return;
        const chosenLang = btn.getAttribute('data-lang');
        if (!chosenLang) return;

        if (window.kisanStore) {
            window.kisanStore.setLanguage(chosenLang);
        } else {
            localStorage.setItem('kisansetu_lang', chosenLang);
        }
        applyLanguage(chosenLang);

        const names = { en: 'English', hi: 'हिन्दी (Hindi)', mr: 'मराठी (Marathi)' };
        showToast(`Language switched to ${names[chosenLang] || chosenLang.toUpperCase()}`, 'success');
    });

    document.addEventListener('kisanLanguageChanged', (e) => {
        const l = (e.detail && (e.detail.lang || e.detail.language)) || 'en';
        applyLanguage(l);
    });
}

function applyLanguage(lang) {
    if (!lang) lang = 'en';
    document.documentElement.lang = lang;

    // 1. Update active class on all lang buttons across the page
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 2. Synchronize WhatsApp Chatbot language state
    if (typeof currentWaLang !== 'undefined' && currentWaLang !== lang) {
        currentWaLang = lang;
        if (typeof updateWhatsAppChatUI === 'function') {
            updateWhatsAppChatUI();
        }
    }

    // 3. Translate [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!el.getAttribute('data-orig-html')) {
            el.setAttribute('data-orig-html', el.innerHTML);
        }
        if (lang === 'en') {
            const orig = el.getAttribute('data-orig-html');
            if (orig) el.innerHTML = orig;
        } else if (window.kisanStore && window.kisanStore.t) {
            const tr = window.kisanStore.t(key);
            if (tr && tr !== key) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = tr;
                } else {
                    el.innerHTML = tr;
                }
            }
        }
    });

    // 3. TreeWalker translation for all visible text nodes across the entire page
    translateDom(document.body, lang);

    // 4. Update ticker label if present
    const tickerLabel = document.querySelector('.ticker-label');
    if (tickerLabel) {
        if (!tickerLabel.getAttribute('data-orig-text')) {
            tickerLabel.setAttribute('data-orig-text', tickerLabel.textContent.trim());
        }
        const orig = tickerLabel.getAttribute('data-orig-text');
        tickerLabel.textContent = lang === 'en' ? orig : (translateText(orig, lang) || orig);
    }

    // 5. Re-render dynamic header & nav with translations
    if (window.kisanStore) {
        const user = window.kisanStore.getCurrentUser();
        renderRoleNavigation(user);
        renderRoleHeaderActions(user);
        updateIndexRoleHero(user);
    }

    // Cancel any active speech when user toggles language
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    // 6. Update all audio/Sunno buttons to selected language
    document.querySelectorAll('.btn-sunno').forEach(btn => {
        if (!btn.classList.contains('speaking')) {
            if (btn.id === 'btnSunnoRationale') {
                btn.innerHTML = lang === 'hi' ? '🔊 सुनो (आवाज़ में सुनें)' : (lang === 'mr' ? '🔊 ऐका (आवाजात ऐका)' : '🔊 Sunno (Audio)');
            } else {
                btn.innerHTML = lang === 'hi' ? '🔊 सुनो' : (lang === 'mr' ? '🔊 ऐका' : '🔊 Sunno');
            }
        }
    });

    // 7. Broadcast event so specific dashboard components can refresh if needed
    document.dispatchEvent(new CustomEvent('kisanLanguageApplied', { detail: { lang } }));
}

// ==========================================
// Mandi Price Marquee Ticker
// ==========================================
function initMandiTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track || !window.kisanStore) return;

    const items = window.kisanStore.getMandiTicker();
    let html = '';
    // Duplicate twice for seamless marquee loop
    for (let i = 0; i < 2; i++) {
        items.forEach(item => {
            const trendClass = item.trend === 'up' ? 'ticker-up' : 'ticker-down';
            const arrow = item.trend === 'up' ? '▲' : '▼';
            const priceStr = typeof item.modalPrice === 'number' ? item.modalPrice.toFixed(2) : item.modalPrice;
            html += `
                <div class="ticker-item" style="cursor: pointer;" onclick="window.location.href='marketplace.html?mode=mandi'" title="Click to view full APMC Mandi Market Prices">
                    <span>🌾 <strong>${item.crop}</strong> (${item.mandi}):</span>
                    <span class="ticker-price">₹${priceStr}/kg</span>
                    <span class="${trendClass}">${arrow} ${item.change}</span>
                </div>
            `;
        });
    }
    track.innerHTML = html;
}

// ==========================================
// Navigation & Active State
// ==========================================
function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ==========================================
// Cart Badge & Cart Operations
// ==========================================
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge || !window.kisanStore) return;
    const cart = window.kisanStore.getCart();
    const count = cart.reduce((acc, item) => acc + (item.qtyKg || 1), 0);
    badge.innerText = Math.round(count);
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}

// ==========================================
// Toast Notification System (Modernized)
// ==========================================
class Toast {
    static getContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('role', 'status');
            document.body.appendChild(container);
        }
        return container;
    }

    static show(message, type = 'info', duration = 4000) {
        const container = Toast.getContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ';
        if (type === 'success') icon = '✓';
        if (type === 'error') icon = '✕';
        if (type === 'warning') icon = '⚠';

        toast.innerHTML = `
            <div class="toast-content" style="display:flex; align-items:center; gap:10px; flex:1;">
                <span class="toast-icon" style="font-size:18px; line-height:1; font-weight:bold;">${icon}</span>
                <span class="toast-msg">${message}</span>
            </div>
            <button type="button" class="toast-close" aria-label="Close notification" style="background:none; border:none; color:inherit; font-size:18px; cursor:pointer; padding:0 4px; line-height:1; opacity:0.8;">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        let timer = null;

        const dismiss = () => {
            if (timer) clearTimeout(timer);
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px) scale(0.95)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 260);
        };

        if (closeBtn) closeBtn.addEventListener('click', dismiss);
        if (duration > 0) {
            timer = setTimeout(dismiss, duration);
        }

        container.appendChild(toast);
        return toast;
    }

    static success(msg, dur) { return Toast.show(msg, 'success', dur); }
    static error(msg, dur) { return Toast.show(msg, 'error', dur); }
    static warning(msg, dur) { return Toast.show(msg, 'warning', dur); }
    static info(msg, dur) { return Toast.show(msg, 'info', dur); }
}

function showToast(message, type = 'info', duration = 4000) {
    return Toast.show(message, type, duration);
}
window.Toast = Toast;

// ==========================================
// Transparent Pricing Modal
// ==========================================
function openTransparencyModal(listingId) {
    if (!window.kisanStore) return;
    const item = window.kisanStore.getListingById(listingId);
    if (!item) return;

    let modal = document.getElementById('transparencyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'transparencyModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const diff = (item.traditionalMandiPrice - item.retailPrice).toFixed(2);
    const pctSaved = Math.round((diff / item.traditionalMandiPrice) * 100);

    modal.innerHTML = `
        <div class="modal-box">
            <button class="modal-close-btn" onclick="closeTransparencyModal()">✕</button>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                <span style="background:#d1fae5; color:#065f46; font-weight:700; font-size:11px; padding:3px 8px; border-radius:12px;">SIH 2026 TRANSPARENCY AUDIT</span>
            </div>
            <h3 class="modal-title">${item.crop}</h3>
            <p style="color:#64748b; font-size:14px; margin-bottom:16px;">Sourced directly from <strong>${item.farmerName}</strong> (${item.region})</p>

            <div style="background:#fee2e2; border-left:4px solid #ef4444; padding:12px 14px; border-radius:6px; margin-bottom:16px; font-size:13px; color:#991b1b;">
                <strong>Traditional Middlemen Retail Price: ₹${item.traditionalMandiPrice.toFixed(2)}/kg</strong>
                <div style="font-size:11px; color:#b91c1c; margin-top:2px;">Includes local trader cuts, transport broker cuts, and retail markups (+55%).</div>
            </div>

            <h4 style="font-size:14px; text-transform:uppercase; letter-spacing:0.5px; color:#059669; font-weight:700;">KisanSetu Transparent Price Breakdown:</h4>
            
            <div class="itemized-card">
                <div class="itemized-row">
                    <span>👨‍🌾 Paid Directly to Farmer (84%):</span>
                    <strong>₹${item.farmerPrice.toFixed(2)} / kg</strong>
                </div>
                <div class="itemized-row">
                    <span>🚚 Consolidated Cold-Chain Logistics (12%):</span>
                    <strong>₹${item.logisticsFee.toFixed(2)} / kg</strong>
                </div>
                <div class="itemized-row">
                    <span>🛡️ KisanSetu Platform & Escrow Fee (3.5%):</span>
                    <strong>₹${item.platformFee.toFixed(2)} / kg</strong>
                </div>
                <div class="itemized-row highlight">
                    <span>Final Transparent Consumer Price:</span>
                    <span>₹${item.retailPrice.toFixed(2)} / kg</span>
                </div>
            </div>

            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:14px; text-align:center; margin-bottom:20px;">
                <div style="font-size:13px; color:#047857; font-weight:600;">Consumer Saves: <strong>₹${diff}/kg (${pctSaved}%)</strong></div>
                <div style="font-size:12px; color:#065f46;">Farmer Earns: <strong>+38% higher than local APMC middleman!</strong></div>
            </div>

            <button class="btn btn-primary" style="width:100%; padding:12px;" onclick="quickAddToCart('${item.id}'); closeTransparencyModal();">
                🛒 Add ${item.crop} to Cart (₹${item.retailPrice.toFixed(2)}/kg)
            </button>
        </div>
    `;

    modal.classList.add('active');
}

function closeTransparencyModal() {
    const modal = document.getElementById('transparencyModal');
    if (modal) modal.classList.remove('active');
}

function quickAddToCart(listingId) {
    if (!window.kisanStore) return;
    window.kisanStore.addToCart(listingId, 2);
    updateCartBadge();
    showToast('Added 2 kg to cart with Escrow Protection!', 'success');
}

// Global modal background click close
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});


// Auto-refresh UI when backend data syncs
document.addEventListener('kisanStoreUpdated', () => {
    if (typeof renderFarmerListings === 'function') renderFarmerListings();
    if (typeof renderEscrowTable === 'function') renderEscrowTable();
    if (typeof renderFarmerOrders === 'function') renderFarmerOrders();
    if (typeof renderWalletTable === 'function') renderWalletTable();
    if (typeof updateCartBadge === 'function') updateCartBadge();
    console.log('UI Refreshed with live backend data!');
});

// ==========================================
// Theme (Dark / Light Mode) Controller
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('kisansetu-theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    ensureThemeToggleButton();
}

function ensureThemeToggleButton() {
    const topBarRight = document.querySelector('.top-bar-right');
    if (topBarRight && !topBarRight.querySelector('.top-bar-theme-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle-btn top-bar-theme-btn';
        btn.setAttribute('aria-label', 'Toggle Dark / Light Mode');
        btn.title = 'Toggle Dark / Light Mode';
        btn.onclick = toggleDarkMode;
        topBarRight.appendChild(btn);
        updateThemeToggleButtons(localStorage.getItem('kisansetu-theme') || 'light');
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('kisansetu-theme', theme);
    updateThemeToggleButtons(theme);
    window.dispatchEvent(new CustomEvent('kisansetuThemeChanged', { detail: { theme } }));
}

function toggleDarkMode() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function updateThemeToggleButtons(theme) {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const isDark = theme === 'dark';
        btn.innerHTML = isDark
            ? '<span style="font-size:13px;">☀️</span> <span>Light Mode</span>'
            : '<span style="font-size:13px;">🌙</span> <span>Dark Mode</span>';
        btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
}

// ==========================================
// Accessible Form Validation Helper
// ==========================================
function validateField(fieldId, rules = {}) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    if (!field) return true;

    const val = field.value !== undefined ? field.value.trim() : '';
    let errorMsg = '';

    if (rules.required && !val) {
        errorMsg = rules.requiredMsg || 'This field is required.';
    } else if (rules.minLength && val.length < rules.minLength) {
        errorMsg = rules.minLengthMsg || `Minimum ${rules.minLength} characters required.`;
    } else if (rules.maxLength && val.length > rules.maxLength) {
        errorMsg = rules.maxLengthMsg || `Maximum ${rules.maxLength} characters allowed.`;
    } else if (rules.min !== undefined && Number(val) < rules.min) {
        errorMsg = rules.minMsg || `Minimum value is ${rules.min}.`;
    } else if (rules.max !== undefined && Number(val) > rules.max) {
        errorMsg = rules.maxMsg || `Maximum value is ${rules.max}.`;
    } else if (rules.pattern && !rules.pattern.test(val)) {
        errorMsg = rules.patternMsg || 'Invalid format.';
    } else if (rules.custom && typeof rules.custom === 'function') {
        const customRes = rules.custom(val, field);
        if (customRes !== true) {
            errorMsg = typeof customRes === 'string' ? customRes : 'Invalid value.';
        }
    }

    const formGroup = field.closest('.form-group') || field.parentElement;
    let errorContainer = document.getElementById(`${field.id || field.name}-error`);

    if (!errorContainer && formGroup) {
        errorContainer = formGroup.querySelector('.form-error');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-error';
            errorContainer.setAttribute('role', 'alert');
            if (field.id) errorContainer.id = `${field.id}-error`;
            formGroup.appendChild(errorContainer);
        }
    }

    if (errorMsg) {
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        if (errorContainer) {
            errorContainer.textContent = errorMsg;
            errorContainer.style.display = 'block';
            field.setAttribute('aria-describedby', errorContainer.id || '');
        }
        return false;
    } else {
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('is-invalid');
        if (val.length > 0) field.classList.add('is-valid');
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }
        return true;
    }
}

function validateForm(formElement, fieldRulesMap) {
    if (!formElement) return true;
    let isValid = true;
    let firstInvalid = null;

    Object.keys(fieldRulesMap).forEach(fieldId => {
        const field = formElement.querySelector(`#${fieldId}`) || document.getElementById(fieldId);
        if (field) {
            const ok = validateField(field, fieldRulesMap[fieldId]);
            if (!ok) {
                isValid = false;
                if (!firstInvalid) firstInvalid = field;
            }
        }
    });

    if (firstInvalid) {
        firstInvalid.focus();
    }
    return isValid;
}

// ==========================================
// Loading States & Shimmer Skeletons
// ==========================================
class LoadingState {
    static show(container, type = 'card', count = 3) {
        if (!container) return;
        const target = typeof container === 'string' ? document.querySelector(container) : container;
        if (!target) return;
        target.classList.add('loading');
        target.innerHTML = LoadingState.createSkeleton(type, count);
    }

    static hide(container) {
        if (!container) return;
        const target = typeof container === 'string' ? document.querySelector(container) : container;
        if (!target) return;
        target.classList.remove('loading');
    }

    static createSkeleton(type = 'card', count = 3) {
        let html = '<div class="skeleton-loader">';
        for (let i = 0; i < count; i++) {
            if (type === 'card' || type === 'produce') {
                html += `
                    <div class="skeleton-item" style="border-radius:12px; padding:16px; margin-bottom:16px; background:var(--bg-card, #fff); border:1px solid var(--border);">
                        <div class="skeleton-avatar" style="width:100%; height:160px; border-radius:8px; margin-bottom:12px;"></div>
                        <div class="skeleton-line" style="width:70%; height:20px; margin-bottom:10px;"></div>
                        <div class="skeleton-line" style="width:40%; height:16px; margin-bottom:12px;"></div>
                        <div style="display:flex; justify-content:space-between; gap:10px;">
                            <div class="skeleton-line" style="width:45%; height:36px; border-radius:6px;"></div>
                            <div class="skeleton-line" style="width:45%; height:36px; border-radius:6px;"></div>
                        </div>
                    </div>
                `;
            } else if (type === 'table') {
                html += `
                    <div class="skeleton-item" style="display:flex; gap:16px; padding:14px; border-bottom:1px solid var(--border);">
                        <div class="skeleton-line" style="width:20%; height:16px;"></div>
                        <div class="skeleton-line" style="width:30%; height:16px;"></div>
                        <div class="skeleton-line" style="width:25%; height:16px;"></div>
                        <div class="skeleton-line" style="width:15%; height:16px;"></div>
                    </div>
                `;
            } else {
                html += `
                    <div class="skeleton-item" style="padding:16px; margin-bottom:12px;">
                        <div class="skeleton-line" style="width:60%; height:18px; margin-bottom:8px;"></div>
                        <div class="skeleton-line" style="width:90%; height:14px; margin-bottom:6px;"></div>
                        <div class="skeleton-line" style="width:40%; height:14px;"></div>
                    </div>
                `;
            }
        }
        html += '</div>';
        return html;
    }
}
window.LoadingState = LoadingState;

// ==========================================
// Mobile Navigation Drawer Controller
// ==========================================
function initMobileNav() {
    let overlay = document.getElementById('mobileNavOverlay');
    let drawer = document.getElementById('mobileNavDrawer');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobileNavOverlay';
        overlay.className = 'mobile-nav-overlay';
        overlay.addEventListener('click', closeMobileNav);
        document.body.appendChild(overlay);
    }

    if (!drawer) {
        drawer = document.createElement('nav');
        drawer.id = 'mobileNavDrawer';
        drawer.className = 'mobile-nav-menu';
        drawer.setAttribute('aria-label', 'Mobile Navigation');
        drawer.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:14px; border-bottom:1px solid var(--border);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:24px;">🌾</span>
                    <strong style="font-size:18px;">KisanSetu</strong>
                </div>
                <button type="button" class="mobile-nav-close" onclick="closeMobileNav()" aria-label="Close Navigation Menu">&times;</button>
            </div>
            <div class="mobile-nav-links" id="mobileNavLinks">
                <!-- Syncs with role navigation -->
            </div>
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:10px;">
                <button type="button" class="btn btn-outline btn-sm theme-toggle-btn" onclick="toggleDarkMode()" style="width:100%; text-align:center;">
                    🌙 Toggle Dark Mode
                </button>
            </div>
        `;
        document.body.appendChild(drawer);
    }

    // Ensure hamburger button exists in header
    const header = document.querySelector('.main-header');
    if (header && !document.getElementById('mobileMenuToggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'mobileMenuToggle';
        toggleBtn.className = 'menu-toggle';
        toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-controls', 'mobileNavDrawer');
        toggleBtn.innerHTML = '☰';
        toggleBtn.addEventListener('click', openMobileNav);

        const actions = header.querySelector('.header-actions');
        if (actions) {
            header.insertBefore(toggleBtn, actions);
        } else {
            header.appendChild(toggleBtn);
        }
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
            closeMobileNav();
        }
    });

    // Populate links if user exists
    if (window.kisanStore) {
        renderRoleNavigation(window.kisanStore.getCurrentUser());
    }
}

function openMobileNav() {
    const overlay = document.getElementById('mobileNavOverlay');
    const drawer = document.getElementById('mobileNavDrawer');
    const toggle = document.getElementById('mobileMenuToggle');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    const overlay = document.getElementById('mobileNavOverlay');
    const drawer = document.getElementById('mobileNavDrawer');
    const toggle = document.getElementById('mobileMenuToggle');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// ==========================================
// Accessible Keyboard Navigation for HUD
// ==========================================
function initKeyboardNav() {
    // Global hotkey listeners (Ctrl+K, Cmd+K, Escape)
    if (!window._kisanKeyboardNavInit) {
        window._kisanKeyboardNavInit = true;
        window.addEventListener('keydown', (e) => {
            // Command Palette shortcut: Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                const cmdOverlay = document.getElementById('cmdPaletteOverlay');
                if (cmdOverlay && cmdOverlay.style.display !== 'none') {
                    closeCommandPalette();
                } else {
                    openCommandPalette();
                }
            }
            // Escape to close active modal/palette/drawer
            if (e.key === 'Escape') {
                const cmdOverlay = document.getElementById('cmdPaletteOverlay');
                if (cmdOverlay && cmdOverlay.style.display !== 'none') {
                    closeCommandPalette();
                }
                const tourOverlay = document.getElementById('tourModalOverlay');
                if (tourOverlay && tourOverlay.style.display !== 'none') {
                    closePlatformTour();
                }
                const helpDrawer = document.getElementById('kisanHelpDrawer');
                if (helpDrawer && helpDrawer.style.display !== 'none') {
                    toggleHelpDrawer(false);
                }
                const waModal = document.getElementById('kisanWhatsAppModal');
                if (waModal && waModal.style.display !== 'none') {
                    closeWhatsAppSupportModal();
                }
            }
        });
    }

    const hudContainer = document.getElementById('sihDemoHud');
    if (!hudContainer) return;

    const pills = Array.from(hudContainer.querySelectorAll('.sih-demo-pill:not(.theme-toggle-btn)'));
    pills.forEach((pill, idx) => {
        pill.setAttribute('tabindex', '0');
        pill.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = pills[(idx + 1) % pills.length];
                next.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = pills[(idx - 1 + pills.length) % pills.length];
                prev.focus();
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                pill.click();
            }
        });
    });
}

// ==========================================
// Rural Connectivity & Offline Detection
// ==========================================
function initOfflineDetector() {
    let banner = document.getElementById('offlineBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offlineBanner';
        banner.className = 'offline-banner';
        banner.setAttribute('role', 'alert');
        banner.style.display = 'none';
        banner.innerHTML = `
            <div style="background:#fef3c7; color:#92400e; border-bottom:2px solid #f59e0b; padding:8px 16px; font-size:13px; font-weight:700; text-align:center; display:flex; justify-content:center; align-items:center; gap:8px;">
                <span>⚠️ आप ऑफ़लाइन हैं (You are Offline)</span>
                <span style="font-weight:normal; font-size:12px;">— Local cached data active. Actions will sync automatically when connected.</span>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }

    const checkStatus = () => {
        if (!navigator.onLine) {
            banner.style.display = 'block';
            showToast('⚠️ इंटरनेट कनेक्शन कट गया है। ऑफ़लाइन मोड सक्रिय है।', 'warning');
        } else {
            if (banner.style.display === 'block') {
                banner.style.display = 'none';
                showToast('✅ इंटरनेट वापस जुड़ गया है (Back Online)! Data synced.', 'success');
            }
        }
    };

    window.addEventListener('offline', checkStatus);
    window.addEventListener('online', checkStatus);
    if (!navigator.onLine) checkStatus();
}

// ==========================================
// ==========================================
// Rural Audio / Multilingual Voice Readout (Hindi, Marathi, English)
// Dual Engine: Online Native Regional Stream + Browser SpeechSynthesis
// ==========================================
let currentSpeechUtterance = null;
let currentSpeakingBtn = null;
let currentAudioPlayer = null;
let availableVoices = [];

function updateSpeechVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        availableVoices = window.speechSynthesis.getVoices() || [];
    }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    updateSpeechVoices();
    window.speechSynthesis.onvoiceschanged = updateSpeechVoices;
}

/**
 * Returns the active user language ('hi', 'mr', or 'en').
 */
function getActiveLanguage() {
    let lang = 'en';
    if (window.kisanStore && typeof window.kisanStore.getLanguage === 'function') {
        lang = window.kisanStore.getLanguage();
    } else {
        try {
            lang = localStorage.getItem('kisansetu_lang') || (document.documentElement ? document.documentElement.lang : 'en') || 'en';
        } catch(e) {}
    }
    return (['en', 'hi', 'mr'].includes(lang)) ? lang : 'en';
}

/**
 * Immediately stops any currently active audio or speech playback.
 */
function stopAnyCurrentSpeech() {
    if (currentAudioPlayer) {
        try {
            currentAudioPlayer.pause();
            currentAudioPlayer.src = '';
        } catch(e) {}
        currentAudioPlayer = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
            window.speechSynthesis.cancel();
        } catch(e) {}
    }
    if (currentSpeakingBtn) {
        currentSpeakingBtn.classList.remove('speaking');
        const orig = currentSpeakingBtn.getAttribute('data-original-html');
        if (orig) currentSpeakingBtn.innerHTML = orig;
        currentSpeakingBtn = null;
    }
    currentSpeechUtterance = null;
}

/**
 * Splits long regional paragraphs into safe ~150 character audio chunks for TTS streaming.
 */
function splitTextIntoAudioChunks(text, maxLen = 150) {
    if (!text) return [];
    const clean = text.replace(/₹/g, ' रुपये ').replace(/\//g, ' प्रति ').replace(/APMC/gi, 'एपीएमसी').replace(/\s+/g, ' ').trim();
    const sentences = clean.match(/[^।!?.\n]+[।!?.\n]*/g) || [clean];
    const chunks = [];
    let current = '';

    for (const s of sentences) {
        const trimmed = s.trim();
        if (!trimmed) continue;
        if ((current + ' ' + trimmed).trim().length <= maxLen) {
            current = (current + ' ' + trimmed).trim();
        } else {
            if (current) chunks.push(current);
            if (trimmed.length <= maxLen) {
                current = trimmed;
            } else {
                const words = trimmed.split(/([,; ]+)/);
                let sub = '';
                for (const w of words) {
                    if ((sub + w).length <= maxLen) {
                        sub += w;
                    } else {
                        if (sub.trim()) chunks.push(sub.trim());
                        sub = w;
                    }
                }
                current = sub.trim();
            }
        }
    }
    if (current && current.trim()) chunks.push(current.trim());
    return chunks;
}

/**
 * High-definition Online Devanagari TTS Audio Player.
 * Guarantees native, accent-perfect Hindi & Marathi on all Windows/Mac/Mobile browsers,
 * regardless of whether Windows has installed regional voice packs.
 */
function playOnlineTtsAudio(text, langCode, onEndCallback, onErrorCallback) {
    const tl = (langCode === 'mr' || langCode === 'mr-IN') ? 'mr' : (langCode === 'hi' || langCode === 'hi-IN') ? 'hi' : 'en';
    const chunks = splitTextIntoAudioChunks(text, 150);
    if (!chunks.length) {
        if (onEndCallback) onEndCallback();
        return;
    }

    let currentIndex = 0;
    const audio = new Audio();
    currentAudioPlayer = audio;

    function playNextChunk() {
        if (currentIndex >= chunks.length) {
            currentAudioPlayer = null;
            if (onEndCallback) onEndCallback();
            return;
        }

        const chunkText = chunks[currentIndex];
        currentIndex++;
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;

        audio.src = url;
        audio.onended = playNextChunk;
        audio.onerror = (err) => {
            console.warn('[Online TTS Stream failed, falling back to local synthesis]:', err);
            currentAudioPlayer = null;
            if (onErrorCallback) onErrorCallback();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                console.warn('[Audio play interrupted or blocked]:', err);
                currentAudioPlayer = null;
                if (onErrorCallback) onErrorCallback();
            });
        }
    }

    playNextChunk();
}

/**
 * Finds the most suitable TTS voice for the target language in window.speechSynthesis.
 */
function getBestVoiceForLanguage(targetLocale) {
    const locale = (targetLocale || 'en-IN').toLowerCase();
    const primary = locale.slice(0, 2); // 'hi', 'mr', 'en'
    const voices = (availableVoices && availableVoices.length) ? availableVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);

    if (!voices.length) return null;

    // 1. Exact BCP-47 tag match (e.g. 'hi-in', 'mr-in', 'en-in')
    let match = voices.find(v => v.lang && v.lang.toLowerCase() === locale);
    if (match) return match;

    // 2. Starts with primary language prefix (e.g. 'mr-', 'hi-')
    match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(primary + '-'));
    if (match) return match;

    // 3. Exact 2-letter match (e.g. 'mr', 'hi')
    match = voices.find(v => v.lang && v.lang.toLowerCase() === primary);
    if (match) return match;

    // 4. Targeted name search per language
    if (primary === 'mr') {
        match = voices.find(v => /marathi|मराठी|aarohi|manohar/i.test(v.name));
        if (match) return match;
        // Fallback for Marathi: Hindi Devanagari voice (NOT English!)
        match = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase() === 'hi'));
        if (match) return match;
        match = voices.find(v => /hindi|हिन्दी|swara|madhur|kalpana|hemant/i.test(v.name));
        if (match) return match;
    } else if (primary === 'hi') {
        match = voices.find(v => /hindi|हिन्दी|swara|madhur|kalpana|hemant/i.test(v.name));
        if (match) return match;
    } else if (primary === 'en') {
        match = voices.find(v => v.lang && v.lang.toLowerCase() === 'en-in');
        if (match) return match;
        match = voices.find(v => /india|heera|ravi|neerja|prabhat/i.test(v.name) && v.lang && v.lang.toLowerCase().startsWith('en'));
        if (match) return match;
        match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
        if (match) return match;
    }

    return null;
}

/**
 * Universal Multilingual Audio Function:
 * For Hindi & Marathi:
 *   - Checks if a real, verified Hindi or Marathi voice exists on this machine.
 *   - If not (default on Windows without Indian language packs), it streams Google's native Devanagari audio,
 *     guaranteeing 100% authentic, fluent Hindi or Marathi through the speaker!
 * For English:
 *   - Uses the browser's speech synthesis or online audio.
 */
function speakText(text, targetLocale = 'hi-IN') {
    stopAnyCurrentSpeech();

    if (!text || !text.trim()) return;

    const langCode = targetLocale.slice(0, 2).toLowerCase(); // 'hi', 'mr', 'en'
    const chosenVoice = getBestVoiceForLanguage(targetLocale);

    // Verify if an actual regional voice exists in the browser
    const hasRegionalVoice = chosenVoice && (
        (langCode === 'hi' && (chosenVoice.lang.toLowerCase().startsWith('hi') || /hindi|हिन्दी/i.test(chosenVoice.name))) ||
        (langCode === 'mr' && (chosenVoice.lang.toLowerCase().startsWith('mr') || chosenVoice.lang.toLowerCase().startsWith('hi') || /marathi|मराठी|hindi|हिन्दी/i.test(chosenVoice.name)))
    );

    // If target is Hindi or Marathi, and Windows does NOT have a native Hindi/Marathi voice:
    // Stream authentic Devanagari audio directly so speaker plays real Hindi/Marathi!
    if ((langCode === 'hi' || langCode === 'mr') && !hasRegionalVoice) {
        playOnlineTtsAudio(
            text,
            langCode,
            () => {
                if (currentSpeakingBtn) {
                    currentSpeakingBtn.classList.remove('speaking');
                    const orig = currentSpeakingBtn.getAttribute('data-original-html');
                    if (orig) currentSpeakingBtn.innerHTML = orig;
                    currentSpeakingBtn = null;
                }
            },
            () => {
                fallbackSpeechSynthesis(text, targetLocale, chosenVoice);
            }
        );
        return;
    }

    // Default to browser SpeechSynthesis if native voice exists or for English
    fallbackSpeechSynthesis(text, targetLocale, chosenVoice);
}

function fallbackSpeechSynthesis(text, targetLocale, chosenVoice) {
    if (!('speechSynthesis' in window)) {
        showToast('Speech synthesis not supported on this browser', 'warning');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = targetLocale;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (chosenVoice) {
        utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
        if (currentSpeakingBtn) {
            currentSpeakingBtn.classList.remove('speaking');
            const orig = currentSpeakingBtn.getAttribute('data-original-html');
            if (orig) currentSpeakingBtn.innerHTML = orig;
            currentSpeakingBtn = null;
        }
        currentSpeechUtterance = null;
    };

    utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis Error]:', e);
        if (currentSpeakingBtn) {
            currentSpeakingBtn.classList.remove('speaking');
            const orig = currentSpeakingBtn.getAttribute('data-original-html');
            if (orig) currentSpeakingBtn.innerHTML = orig;
            currentSpeakingBtn = null;
        }
        currentSpeechUtterance = null;
    };

    currentSpeechUtterance = utterance;

    setTimeout(() => {
        try {
            window.speechSynthesis.speak(utterance);
        } catch(err) {
            console.warn('[speak failed]:', err);
        }
    }, 50);
}

function speakProductInfo(listingId, btn) {
    if (!window.kisanStore) return;
    const item = window.kisanStore.getListingById(listingId);
    if (!item) return;

    const currentLang = getActiveLanguage();

    if (btn) {
        if (btn.classList.contains('speaking')) {
            stopAnyCurrentSpeech();
            return;
        }
        stopAnyCurrentSpeech();
        btn.setAttribute('data-original-html', btn.innerHTML);
        btn.classList.add('speaking');
        btn.innerHTML = currentLang === 'mr' ? '⏹️ थांबवा' : (currentLang === 'hi' ? '⏹️ रोकें' : '⏹️ Stop');
        currentSpeakingBtn = btn;
    }

    const cropName = typeof translateText === 'function' ? translateText(item.crop, currentLang) : item.crop;
    let text = '';
    if (currentLang === 'mr') {
        text = `${cropName}। थेट शेतातील दर फक्त ₹${item.retailPrice} प्रति किलो। शेतकरी बंधू: ${item.farmerName}, परिसर: ${item.region}। शेतकऱ्याला थेट ₹${item.farmerPrice} प्रति किलो मोबदला मिळतो, कोणतीही मध्यस्थांची दलाली नाही। पेमेंट एस्क्रो सुरक्षित आहे।`;
    } else if (currentLang === 'hi') {
        text = `${cropName}। सीधे खेत का भाव मात्र ₹${item.retailPrice} प्रति किलो। किसान भाई: ${item.farmerName}, क्षेत्र: ${item.region}। किसान को सीधा ₹${item.farmerPrice} प्रति किलो भुगतान, बिना किसी दलाली के। एस्क्रो पेमेंट सुरक्षा उपलब्ध है।`;
    } else {
        text = `${item.crop}. Direct farm price ₹${item.retailPrice} per kilogram. Cultivated by ${item.farmerName} from ${item.region}. Farmer receives ₹${item.farmerPrice} per kilo directly with zero middleman commission. Escrow payment protection guaranteed.`;
    }

    const speechLocale = currentLang === 'hi' ? 'hi-IN' : (currentLang === 'mr' ? 'mr-IN' : 'en-IN');
    speakText(text, speechLocale);
}

function speakRationale(btn) {
    const currentLang = getActiveLanguage();
    const cropSelect = document.getElementById('forecastCropSelect');
    const cropKey = cropSelect ? cropSelect.value : 'tomato';

    let textToSpeak = '';
    // 1. Direct query from data store guarantees 100% authentic, localized text for user's chosen language
    if (window.kisanStore && typeof window.kisanStore.getForecast === 'function') {
        const fc = window.kisanStore.getForecast(cropKey, currentLang);
        if (fc && fc.rationale) {
            textToSpeak = fc.rationale;
        }
    }

    // 2. Fallback to DOM element if needed
    if (!textToSpeak) {
        const textEl = document.getElementById('dispRationaleText');
        textToSpeak = textEl ? textEl.innerText.trim() : '';
    }

    // 3. Fallback to badge element
    if (!textToSpeak) {
        const rationaleEl = document.getElementById('dispRationale');
        textToSpeak = rationaleEl ? rationaleEl.innerText.replace('🧠', '').replace(/AI Rationale & Explainability:?/i, '').replace(/Sunno/i, '').trim() : '';
    }

    if (!textToSpeak) {
        textToSpeak = currentLang === 'mr' ? 'एआय भाव अंदाज आणि विश्लेषण माहिती.' : (currentLang === 'hi' ? 'एआई भाव पूर्वानुमान और विश्लेषण जानकारी.' : 'AI Price Forecast & Rationale.');
    }

    if (btn) {
        if (btn.classList.contains('speaking')) {
            stopAnyCurrentSpeech();
            return;
        }
        stopAnyCurrentSpeech();
        btn.setAttribute('data-original-html', btn.innerHTML);
        btn.classList.add('speaking');
        btn.innerHTML = currentLang === 'mr' ? '⏹️ थांबवा' : (currentLang === 'hi' ? '⏹️ रोकें' : '⏹️ Stop');
        currentSpeakingBtn = btn;
    }

    const speechLocale = currentLang === 'hi' ? 'hi-IN' : (currentLang === 'mr' ? 'mr-IN' : 'en-IN');
    speakText(textToSpeak, speechLocale);
}

// Expose TTS helpers on window
if (typeof window !== 'undefined') {
    window.speakText = speakText;
    window.speakRationale = speakRationale;
    window.speakProductInfo = speakProductInfo;
    window.getBestVoiceForLanguage = getBestVoiceForLanguage;
    window.getActiveLanguage = getActiveLanguage;
    window.stopAnyCurrentSpeech = stopAnyCurrentSpeech;
    window.playOnlineTtsAudio = playOnlineTtsAudio;
}

// ==========================================
// Live Autocomplete Search Dropdown
// ==========================================
function initAutocompleteSearch(inputId = 'searchInput', containerId = 'searchDropdown') {
    const input = document.getElementById(inputId);
    if (!input || !window.kisanStore) return;

    let dropdown = document.getElementById(containerId);
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = containerId;
        dropdown.className = 'search-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.style.display = 'none';
        if (input.parentNode) {
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(dropdown);
        }
    }

    let activeIndex = -1;

    const renderResults = (query) => {
        if (!query || query.length < 2) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            activeIndex = -1;
            return;
        }

        const listings = window.kisanStore.getListings ? window.kisanStore.getListings() : [];
        const q = query.toLowerCase();

        const cropMatches = [];
        const farmerMatches = [];
        const regionMatches = [];

        listings.forEach(l => {
            if (l.crop.toLowerCase().includes(q) && !cropMatches.some(c => c.name.toLowerCase() === l.crop.toLowerCase())) {
                cropMatches.push({ name: l.crop, sub: `₹${l.retailPrice}/kg • Fresh Harvest`, icon: '🌾', type: 'crop', id: l.id });
            }
            if (l.farmerName.toLowerCase().includes(q) && !farmerMatches.some(f => f.name.toLowerCase() === l.farmerName.toLowerCase())) {
                farmerMatches.push({ name: l.farmerName, sub: `${l.region} • ${l.fpo || 'Verified Farmer'}`, icon: '👨‍🌾', type: 'farmer' });
            }
            if (l.region.toLowerCase().includes(q) && !regionMatches.some(r => r.name.toLowerCase() === l.region.toLowerCase())) {
                regionMatches.push({ name: l.region, sub: 'Mandi Sourcing Cluster', icon: '📍', type: 'region' });
            }
        });

        const all = [...cropMatches.slice(0, 3), ...farmerMatches.slice(0, 2), ...regionMatches.slice(0, 2)];

        if (!all.length) {
            dropdown.innerHTML = `
                <div style="padding:12px; text-align:center; color:#64748b; font-size:13px;">
                    No results found for "${query}"
                </div>
            `;
            dropdown.style.display = 'block';
            return;
        }

        let html = '';
        all.forEach((item, idx) => {
            html += `
                <div class="search-result" role="option" data-index="${idx}" data-val="${item.name}">
                    <span class="result-icon">${item.icon}</span>
                    <div style="flex:1;">
                        <div class="result-name">${item.name}</div>
                        <div style="font-size:11px; color:#64748b;">${item.sub}</div>
                    </div>
                    <span class="result-type" style="font-size:10px; text-transform:uppercase; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700; color:#475569;">${item.type}</span>
                </div>
            `;
        });

        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
        activeIndex = -1;

        dropdown.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                input.value = el.getAttribute('data-val');
                dropdown.style.display = 'none';
                input.dispatchEvent(new Event('input'));
                if (typeof applyFilters === 'function') applyFilters();
            });
        });
    };

    input.addEventListener('input', (e) => renderResults(e.target.value));
    input.addEventListener('focus', (e) => {
        if (e.target.value.length >= 2) renderResults(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.search-result');
        if (!items.length || dropdown.style.display === 'none') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            updateActiveItem(items);
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && items[activeIndex]) {
                e.preventDefault();
                items[activeIndex].click();
            }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });

    const updateActiveItem = (items) => {
        items.forEach((it, idx) => {
            it.classList.toggle('active', idx === activeIndex);
            if (idx === activeIndex) {
                it.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// ==========================================
// Visual Order Timeline Component
// ==========================================
function renderOrderTimeline(ord) {
    let currentStepIndex = 1;
    if (ord.status === 'in_transit') currentStepIndex = 2;
    if (ord.status === 'delivered' || ord.status === 'escrow_released') currentStepIndex = 3;

    const steps = [
        { label: 'Order & Escrow Locked', desc: 'Held in Nodal A/C', icon: '🛡️' },
        { label: 'FPO Quality Check', desc: 'Grading Verified', icon: '🔬' },
        { label: 'Cold-Chain Transit', desc: 'Live GPS Tracking', icon: '🚚' },
        { label: 'Delivered & Released', desc: 'OTP Verified', icon: '✓' }
    ];

    let stepsHtml = '';
    steps.forEach((st, idx) => {
        const isPassed = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        let statusClass = 'pending';
        let markerContent = idx + 1;
        if (isPassed) {
            statusClass = 'completed';
            markerContent = '✓';
        } else if (isCurrent) {
            statusClass = 'active';
            markerContent = `<span class="timeline-pulse"></span>${st.icon}`;
        }

        stepsHtml += `
            <div class="timeline-step ${statusClass}">
                <div class="timeline-marker">${markerContent}</div>
                <div class="timeline-content">
                    <div style="font-weight:700; font-size:12px;">${st.label}</div>
                    <div style="font-size:10px; color:#64748b;">${st.desc}</div>
                </div>
            </div>
        `;
    });

    return `
        <div class="order-timeline" style="margin: 14px 0 10px;">
            ${stepsHtml}
        </div>
    `;
}

// ===================================================
// QUALITY CHECKER & ASSAYER CERTIFICATE SYSTEM
// SIH 2026 PS 26033 - DoCA Quality Framework
// ===================================================

function viewListingCertificate(listingId) {
    openCertVerificationModal(listingId);
}

function openCertVerificationModal(initialQuery = 'AGM-MH-2026-89421') {
    let modal = document.getElementById('certVerificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'certVerificationModal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '99999';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="cert-modal-box">
            <button class="modal-close-btn" style="position: absolute; right: 20px; top: 18px; z-index: 10;" onclick="closeCertVerificationModal()">✕</button>
            
            <div class="cert-lookup-bar">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <span style="background:#022c22; color:#ffffff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px; letter-spacing:0.5px;">GOVERNMENT OF INDIA • DoCA SIH 2026</span>
                        <h3 style="font-size:18px; font-weight:800; color:var(--primary-deep); margin-top:2px;">
                            🔬 Quality Checker & Assayer Certificate Verification
                        </h3>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline" style="border-color:#059669; color:#059669; font-weight:700;" onclick="simulateQrScan()">
                        📷 Scan Lot QR Code
                    </button>
                </div>

                <div class="cert-lookup-input-wrap">
                    <input type="text" id="certSearchInput" class="cert-lookup-input" placeholder="Enter Certificate ID (e.g. AGM-MH-2026-89421) or Lot ID (e.g. lst_101)..." onkeydown="if(event.key==='Enter'){searchCertVerification();}">
                    <button class="btn btn-primary" onclick="searchCertVerification()" style="padding:10px 18px; font-weight:700; white-space:nowrap;">
                        🔍 Verify Authenticity
                    </button>
                </div>

                <div class="cert-chips-row">
                    <span style="font-size:11px; font-weight:700; color:#64748b;">Quick Demo Lots:</span>
                    <button type="button" class="cert-chip-btn" onclick="lookupSpecificCert('AGM-MH-2026-89421')">🍅 Tomato (Nashik Hybrid)</button>
                    <button type="button" class="cert-chip-btn" onclick="lookupSpecificCert('AGM-MH-2026-78142')">🧅 Onion (Lasalgaon 55mm+)</button>
                    <button type="button" class="cert-chip-btn" onclick="lookupSpecificCert('GI-AGM-2026-11048')">🥭 Devgad Alphonso (GI Tagged)</button>
                    <button type="button" class="cert-chip-btn" onclick="lookupSpecificCert('AGM-MP-2026-90234')">🌾 Sharbati Wheat (MRL Free)</button>
                </div>
            </div>

            <div id="certResultContainer" style="padding: 10px 16px 24px 16px;">
                <!-- Dynamically populated via renderOfficialCertificate() -->
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set initial search value and render
    const input = document.getElementById('certSearchInput');
    if (input && initialQuery) {
        input.value = initialQuery;
        lookupSpecificCert(initialQuery);
    }
}

function closeCertVerificationModal() {
    const modal = document.getElementById('certVerificationModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

function lookupSpecificCert(query) {
    const input = document.getElementById('certSearchInput');
    if (input) input.value = query;

    if (!window.kisanStore) return;
    const cert = window.kisanStore.getCertificate(query);
    const container = document.getElementById('certResultContainer');
    if (!container) return;

    if (cert) {
        container.innerHTML = renderOfficialCertificateHtml(cert);
    } else {
        container.innerHTML = `
            <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:36px 24px; text-align:center; margin:20px 8px;">
                <div style="font-size:42px; margin-bottom:12px;">⚠️</div>
                <h3 style="color:#b91c1c; font-size:20px; font-weight:800; margin-bottom:8px;">UNVERIFIED CERTIFICATE / RECORD NOT FOUND</h3>
                <p style="color:#7f1d1d; font-size:14px; max-width:540px; margin:0 auto 16px; line-height:1.5;">
                    No certified laboratory assay record matches <strong>"${query}"</strong> in the Central AGMARK / NABL Assayer Registry.
                </p>
                <div style="background:#ffffff; border:1px dashed #f87171; border-radius:8px; padding:12px; display:inline-block; font-size:12px; color:#991b1b; text-align:left;">
                    <strong>Security Warning for Buyers:</strong><br>
                    • Produce from unverified lots may not adhere to FSSAI MRL limits or mandated moisture standards.<br>
                    • Only accept deliveries with verifiable QR seals on crates.
                </div>
            </div>
        `;
    }
}

function searchCertVerification() {
    const input = document.getElementById('certSearchInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
        showToast('Please enter a Certificate ID or Lot Reference', 'warning');
        return;
    }
    lookupSpecificCert(val);
}

function simulateQrScan() {
    showToast('📷 Camera QR Scanner activated... Aligning with lot packaging barcode...', 'info');
    setTimeout(() => {
        const demoCerts = ['AGM-MH-2026-89421', 'AGM-MH-2026-78142', 'GI-AGM-2026-11048', 'AGM-MP-2026-90234'];
        const picked = demoCerts[Math.floor(Math.random() * demoCerts.length)];
        showToast(`✓ QR Barcode Scanned successfully: ${picked}`, 'success');
        lookupSpecificCert(picked);
    }, 900);
}

function copyCertId(certId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(certId).then(() => {
            showToast(`Certificate ID "${certId}" copied to clipboard!`, 'success');
        });
    } else {
        showToast(`Certificate ID: ${certId}`, 'info');
    }
}

function printQualityCertificate() {
    window.print();
}

function renderOfficialCertificateHtml(cert) {
    const paramRows = (cert.parameters || []).map(p => `
        <tr>
            <td style="font-weight:700;">
                <span style="margin-right:6px;">${p.icon || '🔬'}</span> ${p.metric}
            </td>
            <td style="font-weight:800; color:#064e3b; font-size:13px;">
                ${p.value}
            </td>
            <td style="color:#475569;">
                ${p.benchmark}
            </td>
            <td>
                <span class="cert-status-pass">✓ ${p.status || 'PASS'}</span>
            </td>
        </tr>
    `).join('');

    return `
        <div class="official-cert-sheet" id="printableCertSheet">
            <!-- Header -->
            <div class="cert-header">
                <div class="cert-emblem-row">
                    <span class="cert-emblem-badge">DIRECTORATE OF MARKETING & INSPECTION (DMI)</span>
                </div>
                <div class="cert-title-main">AGMARK QUALITY ASSAY CERTIFICATE</div>
                <div class="cert-subtitle">
                    Issued in compliance with Agricultural Produce (Grading & Marking) Act, 1937 & DoCA SIH 2026 Guidelines
                </div>
            </div>

            <!-- Meta Strip -->
            <div class="cert-meta-strip">
                <div class="cert-meta-item">
                    <span class="cert-meta-label">Certificate ID / Assay No.</span>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="cert-meta-value">${cert.certId}</span>
                        <button type="button" onclick="copyCertId('${cert.certId}')" title="Copy Certificate ID" style="background:none; border:none; cursor:pointer; font-size:12px;">📋</button>
                    </div>
                </div>
                <div class="cert-meta-item">
                    <span class="cert-meta-label">Accreditation & Registry</span>
                    <span class="cert-meta-value" style="font-size:11px;">${cert.accreditation || 'NABL Accredited Lab (TC-7841)'}</span>
                </div>
                <div class="cert-meta-item">
                    <span class="cert-meta-label">Inspection Date</span>
                    <span class="cert-meta-value">${cert.issueDate}</span>
                </div>
                <div class="cert-meta-item">
                    <span class="cert-meta-label">Verification Status</span>
                    <span class="cert-meta-value" style="color:#059669; display:flex; align-items:center; gap:4px;">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
                        VERIFIED & ACTIVE
                    </span>
                </div>
            </div>

            <!-- Entities: Farmer & Consignment + Assaying Lab -->
            <div class="cert-entity-card">
                <div class="cert-info-box">
                    <h5>🌾 Consignment & Producer Details</h5>
                    <div class="cert-info-row">
                        <span>Produce Variety:</span>
                        <strong>${cert.crop}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Farmer / Producer:</span>
                        <strong>${cert.farmerName}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>FPO Aggregator:</span>
                        <strong>${cert.fpo || 'Independent Primary Producer'}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Origin Geolocation:</span>
                        <strong>${cert.region}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Certified Lot Volume:</span>
                        <strong>${cert.quantityKg} kg</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Harvest Batch Timestamp:</span>
                        <strong>${cert.harvestDate}</strong>
                    </div>
                </div>

                <div class="cert-info-box">
                    <h5>🔬 Authorized Testing Center & Assayer</h5>
                    <div class="cert-info-row">
                        <span>Assaying Laboratory:</span>
                        <strong style="text-align:right; max-width:220px;">${cert.labName}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Certified Assayer:</span>
                        <strong>${cert.assayerName}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Assayer License No.:</span>
                        <strong style="color:#065f46;">${cert.assayerLicense}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Classification Grade:</span>
                        <strong style="color:#059669; font-size:13px;">${cert.grade}</strong>
                    </div>
                    <div class="cert-info-row">
                        <span>Certificate Valid Until:</span>
                        <strong style="color:#b45309;">${cert.validUntil}</strong>
                    </div>
                </div>
            </div>

            <!-- Physical & Chemical Parameter Table -->
            <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:flex-end;">
                <h4 style="font-size:13px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.4px;">
                    🧪 Laboratory Physical & Chemical Test Parameters:
                </h4>
                <span style="font-size:11px; color:#64748b;">NABL 17025 Compliant Standard</span>
            </div>

            <div class="cert-param-table-wrap">
                <table class="cert-param-table">
                    <thead>
                        <tr>
                            <th>Quality Parameter</th>
                            <th>Lab Tested Result</th>
                            <th>Mandated AGMARK Standard</th>
                            <th>Compliance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paramRows}
                    </tbody>
                </table>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; margin-bottom:18px; font-size:12px; color:#475569;">
                <strong>Assayer Remarks & Handling Protocol:</strong> ${cert.notes || 'Graded and packed under cold-chain ambient inspection. Complies with all statutory grading criteria.'}
            </div>

            <!-- Official Seal & Cryptographic Signature -->
            <div class="cert-footer-strip">
                <div class="cert-seal-box">
                    <div class="cert-official-seal">
                        <span>AGMARK</span>
                        <span>★ ★ ★</span>
                        <span style="font-size:7px;">CERTIFIED</span>
                    </div>
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#064e3b; text-transform:uppercase;">
                            Government Authorized Assayer Seal
                        </div>
                        <div style="font-size:10px; color:#64748b;">
                            Signatory: ${cert.assayerName} (${cert.assayerLicense})
                        </div>
                    </div>
                </div>

                <div class="cert-qr-container">
                    <img src="${cert.qrCodeSim || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KISANSETU-VERIFIED'}" alt="QR Verification">
                    <div>
                        <div style="font-size:10px; font-weight:700; color:#0f172a; margin-bottom:2px;">
                            Tamper-Evident Verification Hash:
                        </div>
                        <div class="cert-hash-display">
                            ${cert.digitalSignature || 'SHA256:7f8a9e2d1c4b5a68738920194857bdfa1029384756'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons inside Sheet -->
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; padding-top:14px; border-top:1px solid #e2e8f0;">
                <button type="button" class="btn btn-outline btn-sm" onclick="copyCertId('${cert.certId}')">
                    📋 Copy Certificate ID
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="printQualityCertificate()">
                    🖨️ Print Official Certificate
                </button>
            </div>
        </div>
    `;
}

// =========================================================================
// UX OVERHAUL: UNIVERSAL SEARCH & COMMAND PALETTE (CTRL + K)
// SIH 2026 Problem Statement 26033 - Department of Consumer Affairs
// =========================================================================

let currentCmdCategory = 'all';
let currentCmdResults = [];
let selectedCmdIndex = 0;

function initGlobalCommandPalette() {
    if (document.getElementById('cmdPaletteOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cmdPaletteOverlay';
    overlay.className = 'cmd-palette-overlay';
    overlay.style.display = 'none';
    overlay.onclick = handleCmdBackdropClick;

    overlay.innerHTML = `
        <div class="cmd-palette-box" id="cmdPaletteBox" onclick="event.stopPropagation()">
            <div class="cmd-input-wrap">
                <span class="cmd-search-icon">🔍</span>
                <input type="text" id="cmdPaletteInput" class="cmd-input" placeholder="Search crops, mandis, certificates, testing labs... (e.g. Tomato, Nashik, AGM, Escrow)" autocomplete="off" spellcheck="false" oninput="handleCmdSearchInput(event)" onkeydown="handleCmdKeyDown(event)">
                <span class="cmd-esc-badge" onclick="closeCommandPalette()" title="Press Escape to close">ESC</span>
            </div>
            <div class="cmd-filter-tabs" id="cmdFilterTabs">
                <button type="button" class="cmd-filter-tab active" data-cat="all" onclick="setCmdCategory('all')">All Results</button>
                <button type="button" class="cmd-filter-tab" data-cat="produce" onclick="setCmdCategory('produce')">🌾 Produce</button>
                <button type="button" class="cmd-filter-tab" data-cat="mandis" onclick="setCmdCategory('mandis')">🏛️ Mandis</button>
                <button type="button" class="cmd-filter-tab" data-cat="certs" onclick="setCmdCategory('certs')">🔬 Quality Certs</button>
                <button type="button" class="cmd-filter-tab" data-cat="labs" onclick="setCmdCategory('labs')">🧪 Testing Labs</button>
                <button type="button" class="cmd-filter-tab" data-cat="actions" onclick="setCmdCategory('actions')">⚡ Quick Actions</button>
            </div>
            <div class="cmd-results-list" id="cmdResultsList"></div>
            <div class="cmd-footer">
                <div class="cmd-footer-shortcuts">
                    <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Select</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:11px; color:#64748b;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
                    <span>KisanSetu Live Search Engine</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function openCommandPalette(initialQuery = '') {
    initGlobalCommandPalette();
    const overlay = document.getElementById('cmdPaletteOverlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    const input = document.getElementById('cmdPaletteInput');
    if (input) {
        input.value = initialQuery;
        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);
    }
    searchCommandPalette(initialQuery, currentCmdCategory || 'all');
}

function closeCommandPalette() {
    const overlay = document.getElementById('cmdPaletteOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function handleCmdBackdropClick(e) {
    if (e.target.id === 'cmdPaletteOverlay') {
        closeCommandPalette();
    }
}

function handleCmdSearchInput(e) {
    searchCommandPalette(e.target.value, currentCmdCategory);
}

function setCmdCategory(cat) {
    currentCmdCategory = cat;
    const tabs = document.querySelectorAll('.cmd-filter-tab');
    tabs.forEach(t => {
        if (t.getAttribute('data-cat') === cat) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
    const input = document.getElementById('cmdPaletteInput');
    searchCommandPalette(input ? input.value : '', cat);
}

function handleCmdKeyDown(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentCmdResults.length > 0) {
            selectedCmdIndex = (selectedCmdIndex + 1) % currentCmdResults.length;
            highlightCmdItem(selectedCmdIndex);
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentCmdResults.length > 0) {
            selectedCmdIndex = (selectedCmdIndex - 1 + currentCmdResults.length) % currentCmdResults.length;
            highlightCmdItem(selectedCmdIndex);
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentCmdResults.length > 0 && currentCmdResults[selectedCmdIndex]) {
            const item = currentCmdResults[selectedCmdIndex];
            executeCmdItem(item.actionType, item.actionData);
        }
    } else if (e.key === 'Escape') {
        closeCommandPalette();
    }
}

function highlightCmdItem(index) {
    const items = document.querySelectorAll('.cmd-item');
    items.forEach((it, i) => {
        if (i === index) {
            it.classList.add('selected');
            it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            it.classList.remove('selected');
        }
    });
}

function searchCommandPalette(query = '', category = 'all') {
    const resultsContainer = document.getElementById('cmdResultsList');
    if (!resultsContainer) return;

    const q = query.trim().toLowerCase();
    const results = [];

    // Master dataset access
    const store = window.kisanStore;
    const listings = store ? store.getListings() : [];
    const certs = store ? store.getAllCertificates() : [];
    const labs = store ? store.getAssayingCenters() : [];

    // Mandis master benchmarks
    const mandis = [
        { name: 'Amravati APMC Terminal', crop: 'Tomato (Hybrid Red)', rate: '₹21.50/kg', district: 'Amravati, MH', trend: '+4.2%' },
        { name: 'Buldhana APMC Yard', crop: 'Snowball Cauliflower', rate: '₹19.00/kg', district: 'Buldhana, MH', trend: '-2.1%' },
        { name: 'Lasalgaon APMC (Asia Largest)', crop: 'Nashik Red Onion', rate: '₹22.00/kg', district: 'Nashik, MH', trend: '+1.8%' },
        { name: 'Nashik APMC Main', crop: 'Tomato & Table Grapes', rate: '₹22.80/kg', district: 'Nashik, MH', trend: '+3.5%' },
        { name: 'Pune Gultekdi Market Yard', crop: 'Jyoti Potato & Green Chilli', rate: '₹21.00/kg', district: 'Pune, MH', trend: 'Stable' },
        { name: 'Vashi APMC Navi Mumbai', crop: 'Tomato & Leafy Veg', rate: '₹26.50/kg', district: 'Navi Mumbai, MH', trend: '+5.0%' },
        { name: 'Nagpur Cotton & Orange Mandi', crop: 'Nagpur Santra & Soybean', rate: '₹48.00/kg', district: 'Nagpur, MH', trend: '+2.4%' },
        { name: 'Azadpur Mandi (National Hub)', crop: 'Multi-Commodity Benchmark', rate: '₹25.00/kg', district: 'Delhi NCR', trend: 'Active' }
    ];

    // Quick Actions & Tools
    const quickActions = [
        { title: '✨ 1-Minute Interactive Platform Tour', sub: 'Guided 5-slide visual walkthrough of KisanSetu direct bridge', cat: 'Tour', actionType: 'tour', icon: '✨' },
        { title: '🔬 Verify AGMARK Inspection Certificate', sub: 'Instant cryptographic verification & NABL parameter audit', cat: 'Quality', actionType: 'cert', actionData: 'AGM-MH-2026-89421', icon: '🔬' },
        { title: '📈 AI Mandi Price Forecasting Engine', sub: '7-day predictive price trends & harvest dispatch advice', cat: 'AI Hub', actionType: 'url', actionData: 'farmer-dashboard.html#tabMandiRates', icon: '📈' },
        { title: '🚚 CVRPTW Smart Route & Cold-Chain HUD', sub: 'Live vehicle GPS telemetry and temperature sensors (+4°C to +8°C)', cat: 'Logistics', actionType: 'url', actionData: 'logistics.html', icon: '🚚' },
        { title: '🛡️ National Escrow & Dispute Ledger', sub: 'DoCA-regulated public fund transparency & 24h conciliation', cat: 'Escrow', actionType: 'url', actionData: 'admin-escrow.html', icon: '🛡️' },
        { title: '📞 Kisan Call Centre Toll-Free Helpline', sub: '1800-180-1551 (24x7 Free Govt. Farmer Guidance)', cat: 'Helpline', actionType: 'call', actionData: '18001801551', icon: '📞' },
        { title: '🔊 Page Voice Reader (Audio Assistant)', sub: 'Listen to the current page in clear regional speech', cat: 'Voice', actionType: 'voice', icon: '🔊' },
        { title: '💬 WhatsApp AI Sahayak Simulator', sub: 'Interactive bilingual chat assistance for farmers', cat: 'WhatsApp', actionType: 'whatsapp', icon: '💬' }
    ];

    // --- 1. Filter Produce Listings ---
    if (category === 'all' || category === 'produce') {
        listings.forEach(item => {
            const matches = !q || 
                item.crop.toLowerCase().includes(q) || 
                item.variety.toLowerCase().includes(q) || 
                item.origin.toLowerCase().includes(q) || 
                item.farmerName.toLowerCase().includes(q) ||
                (item.grade && item.grade.toLowerCase().includes(q));
            if (matches) {
                results.push({
                    group: '🌾 Farm Produce Listings',
                    icon: '🌱',
                    title: `${item.crop} (${item.variety})`,
                    sub: `₹${item.price}/${item.unit} • ${item.quantity.toLocaleString('en-IN')} ${item.unit} available • 📍 ${item.origin} (${item.farmerName})`,
                    tag: `Grade ${item.grade || 'A'}`,
                    tagColor: '#059669',
                    actionType: 'url',
                    actionData: `marketplace.html?crop=${encodeURIComponent(item.crop)}`
                });
            }
        });
    }

    // --- 2. Filter Mandi Benchmarks ---
    if (category === 'all' || category === 'mandis') {
        mandis.forEach(m => {
            const matches = !q ||
                m.name.toLowerCase().includes(q) ||
                m.crop.toLowerCase().includes(q) ||
                m.district.toLowerCase().includes(q);
            if (matches) {
                results.push({
                    group: '🏛️ Mandi Benchmarks & APMCs',
                    icon: '🏛️',
                    title: `${m.name} — ${m.crop}`,
                    sub: `Modal Rate: ${m.rate} • 📍 ${m.district} • Trend: ${m.trend}`,
                    tag: 'APMC Live',
                    tagColor: '#d97706',
                    actionType: 'url',
                    actionData: `marketplace.html?mode=mandi`
                });
            }
        });
    }

    // --- 3. Filter Quality Certificates ---
    if (category === 'all' || category === 'certs') {
        certs.forEach(c => {
            const matches = !q ||
                c.certId.toLowerCase().includes(q) ||
                c.crop.toLowerCase().includes(q) ||
                c.variety.toLowerCase().includes(q) ||
                c.farmerName.toLowerCase().includes(q) ||
                c.centerName.toLowerCase().includes(q) ||
                c.assayerName.toLowerCase().includes(q);
            if (matches) {
                results.push({
                    group: '🔬 Quality Inspection Certificates',
                    icon: '🔬',
                    title: `Certificate ${c.certId}: ${c.crop} (${c.grade})`,
                    sub: `Farmer: ${c.farmerName} • Center: ${c.centerName} • Moisture: ${c.parameters ? c.parameters.moisture : '11.8%'}`,
                    tag: 'Verified AGMARK',
                    tagColor: '#0284c7',
                    actionType: 'cert',
                    actionData: c.certId
                });
            }
        });
    }

    // --- 4. Filter Testing Laboratories ---
    if (category === 'all' || category === 'labs') {
        labs.forEach(lab => {
            const matches = !q ||
                lab.name.toLowerCase().includes(q) ||
                lab.district.toLowerCase().includes(q) ||
                lab.city.toLowerCase().includes(q) ||
                (lab.cropsSupported && lab.cropsSupported.join(' ').toLowerCase().includes(q));
            if (matches) {
                results.push({
                    group: '🧪 Assaying & Testing Laboratories',
                    icon: '🧪',
                    title: lab.name,
                    sub: `📍 ${lab.city}, ${lab.district} (${lab.pincode}) • Accreditation: ${lab.accreditation} • Phone: ${lab.phone}`,
                    tag: lab.type || 'Lab',
                    tagColor: '#7c3aed',
                    actionType: 'url',
                    actionData: 'farmer-dashboard.html#tabAssayingCenters'
                });
            }
        });
    }

    // --- 5. Filter Quick Actions ---
    if (category === 'all' || category === 'actions') {
        quickActions.forEach(qa => {
            const matches = !q ||
                qa.title.toLowerCase().includes(q) ||
                qa.sub.toLowerCase().includes(q) ||
                qa.cat.toLowerCase().includes(q);
            if (matches) {
                results.push({
                    group: '⚡ Quick Actions & Tools',
                    icon: qa.icon,
                    title: qa.title,
                    sub: qa.sub,
                    tag: qa.cat,
                    tagColor: '#059669',
                    actionType: qa.actionType,
                    actionData: qa.actionData
                });
            }
        });
    }

    currentCmdResults = results;
    selectedCmdIndex = 0;
    renderCommandResults(results, q);
}

function renderCommandResults(results, query) {
    const resultsContainer = document.getElementById('cmdResultsList');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div style="padding:40px 20px; text-align:center; color:#64748b;">
                <div style="font-size:36px; margin-bottom:10px;">🔍</div>
                <div style="font-size:15px; font-weight:700; color:#1e293b; margin-bottom:4px;">No matching results found</div>
                <div style="font-size:13px; max-width:340px; margin:0 auto;">
                    We couldn't find anything matching "<strong>${escapeHtml(query)}</strong>". Try searching for <em>Tomato</em>, <em>Nashik</em>, <em>AGM</em>, or <em>Escrow</em>.
                </div>
            </div>
        `;
        return;
    }

    // Group items by group title
    let html = '';
    let currentGroup = '';

    results.forEach((item, index) => {
        if (item.group !== currentGroup) {
            currentGroup = item.group;
            html += `<div class="cmd-group-title">${currentGroup}</div>`;
        }

        const isSelected = index === selectedCmdIndex ? 'selected' : '';
        html += `
            <div class="cmd-item ${isSelected}" data-index="${index}" onclick="executeCmdItem('${item.actionType}', '${item.actionData || ''}')">
                <div class="cmd-item-left">
                    <div class="cmd-item-icon">${item.icon}</div>
                    <div class="cmd-item-text">
                        <div class="cmd-item-title">${escapeHtml(item.title)}</div>
                        <div class="cmd-item-sub">${escapeHtml(item.sub)}</div>
                    </div>
                </div>
                <div class="cmd-item-right">
                    <span class="cmd-item-tag" style="background:${item.tagColor}15; color:${item.tagColor}; border:1px solid ${item.tagColor}30;">
                        ${escapeHtml(item.tag)}
                    </span>
                </div>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

function executeCmdItem(actionType, actionData) {
    closeCommandPalette();

    switch (actionType) {
        case 'url':
            if (actionData) window.location.href = actionData;
            break;
        case 'cert':
            openCertVerificationModal(actionData || 'AGM-MH-2026-89421');
            break;
        case 'tour':
            openPlatformTour(1);
            break;
        case 'voice':
            triggerVoiceReader();
            break;
        case 'call':
            window.location.href = `tel:${actionData || '18001801551'}`;
            break;
        case 'whatsapp':
            openWhatsAppSupportSimulator();
            break;
        default:
            console.log('Action executed:', actionType, actionData);
    }
}

// Helper escape function
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

// =========================================================================
// UX OVERHAUL: FLOATING QUICK-HELP & FARMER SUPPORT WIDGET
// Helpline 1800-180-1551 • WhatsApp AI Sahayak • Web Speech Voice Reader
// =========================================================================

function initGlobalHelpFab() {
    if (document.getElementById('kisanHelpFab')) return;

    // Floating Action Button
    const fab = document.createElement('div');
    fab.id = 'kisanHelpFab';
    fab.className = 'kisan-help-fab';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Kisan Sahayata and Help Support Drawer');
    fab.onclick = () => toggleHelpDrawer();
    fab.innerHTML = `
        <span class="kisan-help-fab-icon">🎧</span>
        <span class="kisan-help-fab-text">Help & Support</span>
    `;

    // Drawer Container
    const drawer = document.createElement('div');
    drawer.id = 'kisanHelpDrawer';
    drawer.className = 'kisan-help-drawer';
    drawer.style.display = 'none';

    drawer.innerHTML = `
        <div class="kisan-help-header">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:24px; background:rgba(255,255,255,0.15); width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;">🌾</span>
                <div>
                    <h3 style="margin:0; font-size:15px; font-weight:800; letter-spacing:0.3px;">Kisan Sahayata & Support</h3>
                    <p style="margin:2px 0 0 0; font-size:11px; opacity:0.85;">24x7 Direct Assistance • Toll-Free • Voice</p>
                </div>
            </div>
            <button type="button" onclick="toggleHelpDrawer(false)" style="background:none; border:none; color:white; font-size:20px; cursor:pointer; padding:4px 8px; border-radius:6px; opacity:0.85;" aria-label="Close help drawer">✕</button>
        </div>

        <div class="kisan-help-body">
            <!-- 4 Quick Action Cards -->
            <div class="help-cards-grid">
                <a href="tel:18001801551" class="help-card-btn" title="Call Kisan Call Centre Toll-Free">
                    <span class="h-icon">📞</span>
                    <span class="h-title">Kisan Call Centre</span>
                    <span class="h-sub">Toll-Free 1800-180-1551 (24x7 Govt. Helpline)</span>
                </a>
                <button type="button" class="help-card-btn" onclick="openWhatsAppSupportSimulator()" title="Chat with WhatsApp KisanBot">
                    <span class="h-icon">💬</span>
                    <span class="h-title">WhatsApp AI Sahayak</span>
                    <span class="h-sub">Instant answers in Marathi, Hindi & English</span>
                </button>
                <button type="button" class="help-card-btn" onclick="triggerVoiceReader()" title="Read page aloud with Web Speech">
                    <span class="h-icon">🔊</span>
                    <span class="h-title">Voice Reader</span>
                    <span class="h-sub">Listen to current screen aloud in regional voice</span>
                </button>
                <button type="button" class="help-card-btn" onclick="openPlatformTour()" title="Interactive 1-Minute Platform Tour">
                    <span class="h-icon">✨</span>
                    <span class="h-title">1-Min Platform Tour</span>
                    <span class="h-sub">Visual walkthrough for farmers & evaluators</span>
                </button>
            </div>

            <!-- Escrow Safety Guarantee Banner -->
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:10px 12px; display:flex; gap:10px; align-items:flex-start;">
                <span style="font-size:20px; line-height:1;">🛡️</span>
                <div style="font-size:11px; color:#065f46; line-height:1.4;">
                    <strong style="display:block; margin-bottom:2px; font-size:12px;">DoCA Escrow Payment Protection</strong>
                    Buyer funds are pre-locked in escrow before dispatch. 100% farm-gate settlement is directly transferred via UPI/Bank within 24h of QR inspection.
                </div>
            </div>

            <!-- Farmer FAQ Accordion -->
            <div>
                <div style="font-size:12px; font-weight:800; color:#0f172a; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Frequently Asked Questions (FAQ)</span>
                    <span style="font-size:10px; color:#64748b; font-weight:600;">Tap to read</span>
                </div>
                
                <div class="faq-accordion-item">
                    <div class="faq-question" onclick="toggleFaq(1)">
                        <span>1. How is my payment guaranteed as a farmer?</span>
                        <span id="faqArrow1">▼</span>
                    </div>
                    <div class="faq-answer" id="faqAns1">
                        Buyer funds are deposited into an RBI-regulated tripartite Escrow account supervised by the Department of Consumer Affairs (DoCA) before transport starts. Funds are auto-released directly to your bank account upon digital delivery OTP verification.
                    </div>
                </div>

                <div class="faq-accordion-item">
                    <div class="faq-question" onclick="toggleFaq(2)">
                        <span>2. Where can I get my produce quality tested?</span>
                        <span id="faqArrow2">▼</span>
                    </div>
                    <div class="faq-answer" id="faqAns2">
                        You can visit any of our 8 AGMARKNET & NABL-accredited Assaying Centers located near APMC mandis (e.g. Dindori, Amravati, Buldhana, Nashik). Testing takes under 2 hours and issues a verifiable QR certificate unlocking 18–25% higher prices.
                    </div>
                </div>

                <div class="faq-accordion-item">
                    <div class="faq-question" onclick="toggleFaq(3)">
                        <span>3. How does transport and pickup work?</span>
                        <span id="faqArrow3">▼</span>
                    </div>
                    <div class="faq-answer" id="faqAns3">
                        Our CVRPTW algorithm clusters neighboring farmers in the same tehsil into consolidated reefer trucks with IoT temperature monitoring (+4°C to +8°C). You will receive an SMS and call with the driver's arrival time window.
                    </div>
                </div>

                <div class="faq-accordion-item">
                    <div class="faq-question" onclick="toggleFaq(4)">
                        <span>4. How does the AI Mandi Price Forecast help me?</span>
                        <span id="faqArrow4">▼</span>
                    </div>
                    <div class="faq-answer" id="faqAns4">
                        KisanSetu uses ARIMA + XGBoost models on 5 years of historical APMC data and daily arrivals to recommend whether you should sell immediately or hold for 3-5 days to maximize your profit and avoid distress sales during gluts.
                    </div>
                </div>

                <div class="faq-accordion-item">
                    <div class="faq-question" onclick="toggleFaq(5)">
                        <span>5. What happens if there is a quality dispute?</span>
                        <span id="faqArrow5">▼</span>
                    </div>
                    <div class="faq-answer" id="faqAns5">
                        If a buyer reports a defect, a DoCA-appointed Conciliation Officer reviews timestamped photos and original laboratory certificates. Unfounded rejections are barred and funds are protected by the Escrow Ledger within 24 hours.
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(drawer);
}

function toggleHelpDrawer(forceState) {
    const drawer = document.getElementById('kisanHelpDrawer');
    if (!drawer) return;

    if (typeof forceState === 'boolean') {
        drawer.style.display = forceState ? 'flex' : 'none';
    } else {
        drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
    }
}

function toggleFaq(index) {
    const ans = document.getElementById(`faqAns${index}`);
    const arrow = document.getElementById(`faqArrow${index}`);
    if (!ans) return;

    if (ans.style.display === 'block') {
        ans.style.display = 'none';
        if (arrow) arrow.innerText = '▼';
    } else {
        ans.style.display = 'block';
        if (arrow) arrow.innerText = '▲';
    }
}

// --- Voice Reader via Web Speech Synthesis API ---
let isVoiceReading = false;

function triggerVoiceReader() {
    toggleHelpDrawer(false);

    if (!('speechSynthesis' in window)) {
        Toast.warning('Voice speech is not supported in this browser. Please use Chrome, Edge, or Firefox.');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        isVoiceReading = false;
        Toast.info('⏹️ Voice Reader paused.');
        return;
    }

    // Determine current language
    const currentLang = window.kisanStore ? window.kisanStore.getLanguage() : (localStorage.getItem('kisansetu_lang') || 'en');
    
    // Build context-aware speech summary
    let spokenText = '';
    const pageTitle = document.title || 'KisanSetu';
    const heroTitle = document.querySelector('.hero-title')?.innerText || '';
    const heroSub = document.querySelector('.hero-subtitle')?.innerText || '';

    if (currentLang === 'hi') {
        spokenText = `किसान सेतु में आपका स्वागत है। खेत से सीधे थाली तक। पारदर्शी मूल्य, गुणवत्ता जांच प्रमाणन और सुरक्षित एस्क्रो भुगतान। ${heroSub ? heroSub : 'कृषि उपज का सीधा और सुरक्षित व्यापार।'}`;
    } else if (currentLang === 'mr') {
        spokenText = `किसान सेतू मध्ये आपले स्वागत आहे. थेट शेतातून ग्राहकांच्या दारापर्यंत. पारदर्शक बाजारभाव, ॲगमार्क गुणवत्ता तपासणी आणि सुरक्षित एस्क्रो पेमेंट.`;
    } else {
        spokenText = `Welcome to KisanSetu. The direct digital bridge connecting farmers to consumers and bulk buyers with zero middlemen, AGMARK quality certification, smart cold-chain logistics, and DoCA-regulated escrow protection.`;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Pick best regional voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
        if (currentLang === 'hi') {
            const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
            if (hiVoice) utterance.voice = hiVoice;
        } else if (currentLang === 'mr') {
            const mrVoice = voices.find(v => v.lang.includes('mr') || v.name.includes('Marathi'));
            if (mrVoice) utterance.voice = mrVoice;
        } else {
            const inVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
            if (inVoice) utterance.voice = inVoice;
        }
    }

    utterance.onstart = () => {
        isVoiceReading = true;
        Toast.success('🔊 Voice Reader Active: Reading screen aloud... Click again to stop.', 5000);
    };

    utterance.onend = () => {
        isVoiceReading = false;
    };

    utterance.onerror = () => {
        isVoiceReading = false;
    };

    window.speechSynthesis.speak(utterance);
}

// --- WhatsApp KisanBot AI Simulator with Marathi, Hindi & English Support ---
let currentWaLang = 'mr';

const WA_I18N = {
    mr: {
        title: 'किसानसेतू सहाय्यक AI',
        badge: 'शासकीय कृषी सहाय्यता • ऑनलाइन 🟢',
        welcome: `सस्नेह नमस्कार शेतकरी बंधूंनो! 🙏<br>मी आपला <strong>किसानसेतू सहाय्यक AI</strong> आहे. आज मी आपल्याला शेतमाल बाजारभाव, ॲगमार्क गुणवत्ता लॅब, वाहतूक किंवा एस्क्रो पेमेंटमध्ये काय मदत करू शकतो?`,
        placeholder: 'संदेश टाईप करा (उदा. टोमॅटो भाव, कांदा दर, माल कसा विकायचा, लॅब)...',
        prompts: [
            { label: '🍅 टोमॅटो भाव', query: 'आजचे टोमॅटो बाजारभाव काय आहेत?' },
            { label: '🧅 कांदा दर', query: 'लासलगाव आजचा कांदा बाजारभाव काय आहे?' },
            { label: '🥔 बटाटा भाव', query: 'आजचा बटाटा बाजारभाव काय आहे?' },
            { label: '🌾 माल कसा विकायचा?', query: 'किसानसेतूवर माझा शेतमाल कसा विकायचा?' },
            { label: '📝 शेतकरी नोंदणी', query: 'शेतकरी नोंदणी आणि आधार व्हेरिफिकेशन कसे करावे?' },
            { label: '🔬 ॲगमार्क लॅब', query: 'ॲगमार्क गुणवत्ता तपासणी प्रमाणपत्र कोठे व कसे मिळेल?' },
            { label: '🛡️ एस्क्रो पेमेंट सुरक्षा', query: 'एस्क्रो खात्यातून शेतकऱ्यांना पैसे २४ तासांत कसे मिळतात?' },
            { label: '🚚 शीतगृह वाहतूक', query: 'कोल्ड-चेन वाहतूक आणि शेतातून पिकअप कसा होतो?' },
            { label: '🌦️ हवामान अंदाज', query: 'शेतमाल काढणी आणि वाहतुकीसाठी आजचे हवामान कसे आहे?' }
        ],
        switchNotice: '🌐 भाषा मराठीत बदलली आहे. आता मराठीत थेट प्रश्न विचारा.',
        listenBtn: '🔊 ऐका'
    },
    hi: {
        title: 'किसानसेतु सहायक AI',
        badge: 'आधिकारिक सरकारी कृषि सहायता • ऑनलाइन 🟢',
        welcome: `नमस्ते किसान भाइयों! 🙏<br>मैं आपका <strong>किसानसेतु सहायक AI</strong> हूँ। आज मैं फसलों के मंडी भाव, एगमार्क गुणवत्ता जांच, ट्रांसपोर्ट या एस्क्रो भुगतान में आपकी क्या सहायता कर सकता हूँ?`,
        placeholder: 'संदेश लिखें (उदा. टमाटर भाव, प्याज दाम, फसल कैसे बेचें, लैब)...',
        prompts: [
            { label: '🍅 टमाटर भाव', query: 'आज का टमाटर का मंडी भाव क्या है?' },
            { label: '🧅 प्याज दाम', query: 'लासलगांव आज का प्याज मंडी भाव क्या है?' },
            { label: '🥔 आलू भाव', query: 'आज का आलू का मंडी भाव क्या है?' },
            { label: '🌾 फसल कैसे बेचें?', query: 'किसानसेतु पर अपनी फसल सीधे कैसे बेचें?' },
            { label: '📝 किसान पंजीकरण', query: 'किसान पंजीकरण और आधार सत्यापन कैसे करें?' },
            { label: '🔬 एगमार्क जांच लैब', query: 'एगमार्क गुणवत्ता जांच प्रयोगशाला कहां और कैसे मिलेगी?' },
            { label: '🛡️ एस्क्रो भुगतान गारंटी', query: 'एस्क्रो से किसान को 24 घंटे में सुरक्षित भुगतान कैसे मिलता है?' },
            { label: '🚚 कोल्ड-चेन ट्रांसपोर्ट', query: 'कोल्ड-चेन ट्रांसपोर्ट और खेत से पिकअप कैसे होगा?' },
            { label: '🌦️ मौसम पूर्वानुमान', query: 'फसल कटाई और परिवहन के लिए मौसम का हाल क्या है?' }
        ],
        switchNotice: '🌐 भाषा हिंदी में बदल दी गई है। अब हिंदी में सीधे सवाल पूछें।',
        listenBtn: '🔊 सुनें'
    },
    en: {
        title: 'KisanSetu Sahayak AI',
        badge: 'Official Govt. Agri Support • Online 🟢',
        welcome: `Welcome farmers! 🙏<br>I am your <strong>KisanSetu Sahayak AI</strong>. How can I assist you with crops, mandi benchmark prices, AGMARK testing labs, or escrow settlements today?`,
        placeholder: 'Type a message (e.g. tomato price, how to sell, escrow)...',
        prompts: [
            { label: '🍅 Tomato Price', query: 'What is today live Tomato mandi rate?' },
            { label: '🧅 Onion Rate', query: 'What is today Lasalgaon & Nashik onion rate?' },
            { label: '🥔 Potato Price', query: 'What is today Potato market rate?' },
            { label: '🌾 How to Sell Produce?', query: 'How do I list and sell produce directly on KisanSetu?' },
            { label: '📝 Farmer Registration', query: 'How to register as a verified farmer with Aadhaar eKYC?' },
            { label: '🔬 AGMARK Testing Labs', query: 'Where are the official AGMARK & NABL testing labs located?' },
            { label: '🛡️ Escrow Guarantee', query: 'How does DoCA Escrow guarantee 24-hour payment to farmers?' },
            { label: '🚚 Cold-Chain Logistics', query: 'How does refrigerated transport and farm-gate pickup work?' },
            { label: '🌦️ Weather Advisory', query: 'What is the agricultural weather advisory for harvest?' }
        ],
        switchNotice: '🌐 Language switched to English. You can now ask questions in English.',
        listenBtn: '🔊 Listen'
    }
};

function renderWaPromptPills(lang) {
    const config = WA_I18N[lang] || WA_I18N.mr;
    return config.prompts.map(p => `
        <button type="button" onclick="sendSimulatedWhatsAppMsg('${escapeHtml(p.query)}')" style="background:#ffffff; border:1px solid #d1d7db; border-radius:16px; padding:5px 12px; font-size:11px; font-weight:600; cursor:pointer; color:#008069; white-space:nowrap;">
            ${escapeHtml(p.label)}
        </button>
    `).join('');
}

function setWhatsAppChatLang(lang) {
    currentWaLang = lang;
    if (window.kisanStore) {
        window.kisanStore.setLanguage(lang);
    } else {
        localStorage.setItem('kisansetu_lang', lang);
    }
    applyLanguage(lang);

    // Post friendly language change indicator in chat
    const chatBody = document.getElementById('waChatBody');
    if (chatBody) {
        const note = document.createElement('div');
        note.style.cssText = 'align-self:center; background:#dcf8c6; color:#075e54; font-size:11px; font-weight:700; padding:4px 12px; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.08); text-align:center; margin:4px 0;';
        note.innerHTML = (WA_I18N[lang] || WA_I18N.mr).switchNotice;
        chatBody.appendChild(note);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function updateWhatsAppChatUI() {
    const config = WA_I18N[currentWaLang] || WA_I18N.mr;
    const titleEl = document.getElementById('waHeaderTitle');
    const subEl = document.getElementById('waHeaderSubtitle');
    const inputEl = document.getElementById('waSimInput');
    const pillsEl = document.getElementById('waPromptPills');
    const btnGroup = document.getElementById('waLangBtnGroup');
    const welcomeBubble = document.getElementById('waWelcomeBubble');

    if (titleEl) titleEl.innerText = config.title;
    if (subEl) subEl.innerText = config.badge;
    if (inputEl) inputEl.placeholder = config.placeholder;
    if (pillsEl) pillsEl.innerHTML = renderWaPromptPills(currentWaLang);

    if (welcomeBubble) {
        welcomeBubble.innerHTML = `
            ${config.welcome}
            <div style="font-size:10px; color:#667781; text-align:right; margin-top:4px;">Just now</div>
        `;
    }

    if (btnGroup) {
        const buttons = btnGroup.querySelectorAll('.wa-lang-btn');
        buttons.forEach(btn => {
            const btnLang = btn.innerText.includes('मराठी') ? 'mr' : (btn.innerText.includes('हिंदी') ? 'hi' : 'en');
            if (btnLang === currentWaLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function openWhatsAppSupportSimulator() {
    toggleHelpDrawer(false);

    // Sync default language with platform setting
    const appLang = (window.kisanStore && window.kisanStore.getLanguage()) || localStorage.getItem('kisansetu_lang') || 'mr';
    if (['mr', 'hi', 'en'].includes(appLang)) {
        currentWaLang = appLang;
    }

    let modal = document.getElementById('kisanWhatsAppModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kisanWhatsAppModal';
        modal.className = 'cmd-palette-overlay';
        modal.style.zIndex = '100005';
        modal.onclick = (e) => {
            if (e.target.id === 'kisanWhatsAppModal') closeWhatsAppSupportModal();
        };

        modal.innerHTML = `
            <div class="cmd-palette-box" style="max-width:460px; padding:0; overflow:hidden; border-radius:18px; box-shadow:0 25px 50px rgba(0,0,0,0.35);" onclick="event.stopPropagation()">
                <!-- WhatsApp Header -->
                <div style="background:#075e54; color:white; padding:12px 18px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:#25d366; display:flex; align-items:center; justify-content:center; font-size:22px; color:white; font-weight:bold;">
                            🌾
                        </div>
                        <div>
                            <div style="font-weight:700; font-size:15px; display:flex; align-items:center; gap:6px;">
                                <span id="waHeaderTitle">${WA_I18N[currentWaLang].title}</span>
                                <span style="background:#25d366; width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
                            </div>
                            <div id="waHeaderSubtitle" style="font-size:11px; opacity:0.85;">${WA_I18N[currentWaLang].badge}</div>
                        </div>
                    </div>
                    <button type="button" onclick="closeWhatsAppSupportModal()" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;" aria-label="Close WhatsApp chat">✕</button>
                </div>

                <!-- Language Selector Bar -->
                <div style="background:#054c44; padding:6px 14px; display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#d1d7db; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span>🌐 भाषा निवडा / भाषा चुनें:</span>
                    <div style="display:flex; gap:6px;" id="waLangBtnGroup">
                        <button type="button" class="wa-lang-btn ${currentWaLang === 'mr' ? 'active' : ''}" onclick="setWhatsAppChatLang('mr')">मराठी</button>
                        <button type="button" class="wa-lang-btn ${currentWaLang === 'hi' ? 'active' : ''}" onclick="setWhatsAppChatLang('hi')">हिंदी</button>
                        <button type="button" class="wa-lang-btn ${currentWaLang === 'en' ? 'active' : ''}" onclick="setWhatsAppChatLang('en')">English</button>
                    </div>
                </div>

                <!-- Chat Body -->
                <div id="waChatBody" style="background:#efeae2; padding:16px; min-height:280px; max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; font-size:13px;">
                    <div style="align-self:center; background:#ffeecd; color:#534327; font-size:11px; padding:4px 10px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.1); text-align:center;">
                        🔒 End-to-end encrypted • Smart India Hackathon 2026
                    </div>
                    
                    <div id="waWelcomeBubble" style="align-self:flex-start; background:#ffffff; color:#111b21; padding:10px 12px; border-radius:0 12px 12px 12px; max-width:85%; box-shadow:0 1px 2px rgba(0,0,0,0.1); line-height:1.4;">
                        ${WA_I18N[currentWaLang].welcome}
                        <div style="font-size:10px; color:#667781; text-align:right; margin-top:4px;">Just now</div>
                    </div>
                </div>

                <!-- Quick Prompt Pills -->
                <div id="waPromptPills" style="padding:8px 12px; background:#f0f2f5; border-top:1px solid #e9edef; display:flex; gap:6px; overflow-x:auto; white-space:nowrap;">
                    ${renderWaPromptPills(currentWaLang)}
                </div>

                <!-- Chat Input Bar -->
                <div style="padding:10px 12px; background:#f0f2f5; display:flex; gap:8px; align-items:center;">
                    <input type="text" id="waSimInput" placeholder="${WA_I18N[currentWaLang].placeholder}" style="flex:1; border:none; background:#ffffff; border-radius:20px; padding:9px 14px; font-size:13px; outline:none;" onkeydown="if(event.key==='Enter') sendSimulatedWhatsAppMsg(this.value)">
                    <button type="button" onclick="sendSimulatedWhatsAppMsg(document.getElementById('waSimInput').value)" style="background:#00a884; color:white; border:none; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px;" aria-label="Send message">
                        ➤
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        updateWhatsAppChatUI();
    }

    modal.style.display = 'flex';
}

function closeWhatsAppSupportModal() {
    const modal = document.getElementById('kisanWhatsAppModal');
    if (modal) modal.style.display = 'none';
}

function speakWhatsAppMessage(btn, lang) {
    if (!('speechSynthesis' in window)) {
        Toast.warning('Speech synthesis not supported in this browser.');
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btn.innerText = (WA_I18N[lang] || WA_I18N.mr).listenBtn;
        return;
    }

    const parent = btn.closest('div');
    if (!parent) return;

    // Get plain text without the button text
    const clone = parent.cloneNode(true);
    const btns = clone.querySelectorAll('button');
    btns.forEach(b => b.remove());
    const rawText = clone.innerText.replace(/Just now.*$/i, '').trim();

    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'mr') {
        const mrVoice = voices.find(v => v.lang.includes('mr') || v.name.includes('Marathi'));
        if (mrVoice) utterance.voice = mrVoice;
    } else if (lang === 'hi') {
        const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
        if (hiVoice) utterance.voice = hiVoice;
    } else {
        const inVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
        if (inVoice) utterance.voice = inVoice;
    }

    btn.innerText = '⏹️ थांबवा / रोकें';
    utterance.onend = () => {
        btn.innerText = (WA_I18N[lang] || WA_I18N.mr).listenBtn;
    };
    utterance.onerror = () => {
        btn.innerText = (WA_I18N[lang] || WA_I18N.mr).listenBtn;
    };

    window.speechSynthesis.speak(utterance);
}

function detectWaQueryLang(query, activeLang) {
    const text = (query || '').trim();
    if (!text) return activeLang || 'mr';

    // Distinctive Marathi indicator words & postpositions
    const mrRegex = /(कांदा|टोमॅटो|बटाटा|गहू|सोयाबीन|फ्लॉवर|फुलकोबी|मिरची|कापूस|शेतकरी|आहे|नाही|कसे|कधी|करावे|मिळेल|मिळतील|तपासणी|चाचणी|वाहतूक|शीतगृह|हवामान|विक्री|नोंदणी|पैसे|बाजारभाव|सस्नेह|नमस्कार|काय|आहात|भांडवल|खरेदीदार|ऑर्डर|तक्रार|घ्यावे|द्यावे|आम्हाला|तुम्ही)/i;
    // Distinctive Hindi indicator words & postpositions
    const hiRegex = /(टमाटर|प्याज|आलू|गेहूं|सोयाबीन|गोभी|मिर्च|कपास|किसान|है|नहीं|कैसे|कब|करना|मिलेगा|मिलेंगे|जांच|परिवहन|मौसम|बिक्री|पंजीकरण|रुपये|नमस्ते|दाम|प्रयोगशाला|क्या|हो|खरीददार|शिकायत|सुरक्षा|चाहिए|सकते|हमको|आप)/i;

    if (mrRegex.test(text)) return 'mr';
    if (hiRegex.test(text)) return 'hi';

    // If text contains Devanagari script
    if (/[\u0900-\u097F]/.test(text)) {
        return (activeLang === 'hi' || activeLang === 'mr') ? activeLang : 'mr';
    }

    // If English alphabetic characters dominate
    if (/[a-zA-Z]{2,}/.test(text)) {
        return (activeLang === 'en' || !/[\u0900-\u097F]/.test(text)) ? 'en' : activeLang;
    }

    return activeLang || 'mr';
}

function generateWhatsAppBotReply(query, preferredLang) {
    const clean = (query || '').trim();
    const lang = detectWaQueryLang(clean, preferredLang);
    const lower = clean.toLowerCase();

    // Intent Matchers with boundary checks and comprehensive synonym coverage
    const isLogistics = /\b(transport|transportation|transporter|transporters|transporting|logistics|truck|trucks|lorry|tempo|vehicle|vehicles|reefer|cold\s*chain|cold\s*storage|pickup|pickups|delivery|deliveries|dispatch|freight|transit)\b/i.test(lower) || /(वाहतूक|वाहतुकी|वाहतुकीसाठी|शीतगृह|पिकअप|गाडी|गाड्या|वाहन|वाहने|कोल्ड\s*चेन|ट्रक|परिवहन|डिस्पॅच|भाडे|पोहोच)/i.test(clean);
    const isSell = /\b(sell|selling|seller|list|listing|how to sell|upload crop|put up for sale|start selling)\b/i.test(lower) || /(विक्री|विकायचे|विकायचा|विकणे|बेचना|बेचें|बिक्री|लिस्टिंग)/i.test(clean);
    const isLab = /\b(lab|labs|agmark|agmarknet|cert|certificate|nabl|assay|assaying|test|testing|quality|moisture|grade|grading)\b/i.test(lower) || /(लॅब|प्रयोगशाळा|तपासणी|चाचणी|गुणवत्ता|ॲगमार्क|एगमार्क|सर्टिफिकेट|प्रमाणपत्र|जांच|ग्रेडिंग|ओलावा)/i.test(clean);
    const isEscrow = /\b(escrow|pay|payment|payments|settlement|money|bank|upi|funds|wallet|credit|payout|guarantee)\b/i.test(lower) || /(पैसे|पेमेंट|एस्क्रो|खात्यात|बँक|खाते|रुपये|मिळतील|मिळतात|भुगतान|पैसा|बैंक|खाता|सुरक्षा|हमी)/i.test(clean);
    const isRegister = /\b(register|registration|sign\s*up|create account|login|kyc|aadhaar|join)\b/i.test(lower) || /(नोंदणी|खाते|अकाउंट|पंजीकरण|साइन\s*अप|आधार|दस्तऐवज|ई-केवायसी|ekyc)/i.test(clean);
    const isWeather = /\b(weather|rain|rains|climate|monsoon|temperature|forecast|harvest weather)\b/i.test(lower) || /(हवामान|पाऊस|तापमान|अंदाज|मौसम|बारिश|धूप)/i.test(clean);
    const isBuyerOrder = /\b(buyer|buyers|order|orders|offer|offers|counter\s*offer|bid|bids|negotiate|bargain|deal)\b/i.test(lower) || /(खरेदीदार|ऑर्डर|ऑफर|काउंटर|व्यापारी|सौदा|बोली|खरीदार)/i.test(clean);
    const isFpo = /\b(fpo|farmer group|cooperative|aggregation|cluster)\b/i.test(lower) || /(fpo|गट\s*शेती|शेतकरी\s*गट|सह्याद्री|उत्पादक\s*कंपनी|समूह)/i.test(clean);
    const isVoice = /\b(voice|speak|microphone|mic|audio|speech|listen)\b/i.test(lower) || /(आवाज|बोलून|माईक|ऐका|सुनें|ध्वनी)/i.test(clean);
    const isDispute = /\b(dispute|complaint|problem|issue|cancel|refund|help|helpline|call|toll\s*free|phone|support)\b/i.test(lower) || /(तक्रार|समस्या|मदत|कॉल|हेल्पलाइन|टोल\s*फ्री|नंबर|फोन|शिकायत|सहाय्यता)/i.test(clean);
    const isAbout = /\b(what is kisansetu|about kisansetu|who (made|built|developed)|sih|hackathon|objective|mission)\b/i.test(lower) || /(किसान\s*सेतू|किसानसेतू|किसान\s*सेतु).*(काय|क्या|बद्दल|बारे)/i.test(clean) || /(काय आहे|क्या है).*(किसान\s*सेतू|किसानसेतू|किसान\s*सेतु|प्लॅटफॉर्म|प्लेटफॉर्म)/i.test(clean);
    const isGreeting = /\b(hi|hello|hey|greetings|namaste|namaskar|ram\s*ram)\b/i.test(lower) || /(नमस्कार|नमस्ते|राम\s*राम|हॅलो|हाय|सुप्रभात|शुभ\s*सकाळ|कसे\s*आहात|कैसे\s*हो|रामराम)/i.test(clean);

    // Crops
    const isTomato = /\b(tomato|tomatoes|tamatar)\b/i.test(lower) || /(टोमॅटो|टमाटर)/i.test(clean);
    const isOnion = /\b(onion|onions|kanda|pyaj|pyaz)\b/i.test(lower) || /(कांदा|कांदे|कांद्याचा|कांद्याचे|प्याज)/i.test(clean);
    const isPotato = /\b(potato|potatoes|aloo|alu|batata)\b/i.test(lower) || /(बटाटा|बटाटे|बटाट्याचे|आलू)/i.test(clean);
    const isWheat = /\b(wheat|gehu|gehun|gahu)\b/i.test(lower) || /(गहू|गव्हाचा|गव्हाचे|गेहूं|गेहू)/i.test(clean);
    const isSoybean = /\b(soybean|soya\s*bean|soya)\b/i.test(lower) || /(सोयाबीन)/i.test(clean);
    const isCauliflower = /\b(cauliflower|cabbage|gobhi|gobi|flower)\b/i.test(lower) || /(कॉलिफ्लॉवर|फुलकोबी|गोभी|पत्ताकोबी|फ्लॉवर)/i.test(clean);
    const isChilli = /\b(chilli|chili|mirchi|mirch)\b/i.test(lower) || /(मिरची|मिरचीचे|मिर्च)/i.test(clean);
    const isCotton = /\b(cotton|kapas|kapus)\b/i.test(lower) || /(कापूस|कपाशी|कपास)/i.test(clean);
    const isGeneralPrice = /\b(price|prices|rate|rates|mandi|bhav|market rate|cost|benchmark)\b/i.test(lower) || /(भाव|दर|बाजारभाव|मंडी\s*भाव|दाम|किंमत)/i.test(clean);

    let reply = '';

    // ==========================================
    // MARATHI (मराठी) INTENT RESPONSES
    // ==========================================
    if (lang === 'mr') {
        // Priority 1: Workflows & Actions (Logistics, Selling, Lab, Escrow, etc.)
        if (isLogistics) {
            reply = `🚚 <strong>स्मार्ट कोल्ड-चेन वाहतूक आणि शेतातून थेट पिकअप:</strong><br>• <strong>CVRPTW अल्गोरिदम:</strong> एकाच परिसरातील शेतकऱ्यांचा शेतमाल एकत्र करून शीतगृह (+४°C ते +८°C) वाहने पाठवली जातात.<br>• <strong>३४% वाहतूक बचत:</strong> मार्ग अनुकूलनामुळे वाहतूक खर्च ३४% ने कमी होतो.<br>• <strong>थेट शेतातून पिकअप:</strong> वाहन शेतात पोहोचण्यापूर्वी २ तास आधी ड्रायव्हरचे नाव, संपर्क आणि थेट GPS ट्रॅकिंग SMS द्वारे पाठवले जाते.`;
        } else if (isSell) {
            reply = `🌾 <strong>किसानसेतूवर शेतमाल विक्रीची सोपी ४-टप्पी पद्धत:</strong><br>१. <strong>डॅशबोर्डवर जा:</strong> 'Farmer Hub' किंवा 'माझे डॅशबोर्ड' उघडा.<br>२. <strong>माल नोंदणी करा:</strong> <strong>'List New Produce'</strong> बटनावर क्लिक करा (किंवा माईक 🎙️ द्वारे बोलून नोंदवा).<br>३. <strong>तपशील भरा:</strong> पिकाचे नाव, उपलब्ध प्रमाण (किलो/क्विंटल), अपेक्षित दर आणि काढणी तारीख टाका.<br>४. <strong>थेट खरेदीदार:</strong> नोंदणी होताच हजारो किरकोळ ग्राहक व घाऊक खरेदीदारांना तुमचा माल थेट दिसतो.<br>🛡️ <em>फायदा: ०% दलाली + २४ तासांत एस्क्रो द्वारे थेट बँक खात्यात पैसे जमा!</em>`;
        } else if (isLab) {
            reply = `🔬 <strong>शासकीय ॲगमार्क व NABL गुणवत्ता तपासणी लॅब केंद्र:</strong><br>• <strong>जवळची प्रमुख केंद्रे:</strong><br>  - <strong>नाशिक जिल्हा:</strong> KVK दिंडोरी व पिंपळगाव बसवंत गुणवत्ता केंद्र (०२५३-२३४१२९०)<br>  - <strong>अमरावती APMC:</strong> विदर्भ ॲग्री टेस्टिंग लॅब (कापूस यार्ड जवळ)<br>  - <strong>बुलढाणा APMC:</strong> शेगाव रोड ॲगमार्क असेसिंग लॅब<br>• <strong>तपासणी वेळ:</strong> <strong>फक्त २ तास</strong> (ओलावा, साईझ ग्रेडिंग, कीटकनाशक अवशेष).<br>• <strong>फायदा:</strong> डिजिटल QR प्रमाणपत्रामुळे बाजारात <strong>१८% ते २५% अधिक हमीभाव</strong> मिळतो!<br>👉 <em>वर हेडरमधील 'Verify Certificate' वरून आपण कोणत्याही लॉटचा QR कोड तपासू शकता.</em>`;
        } else if (isEscrow) {
            reply = `🛡️ <strong>DoCA ग्राहक व्यवहार मंत्रालय एस्क्रो पेमेंट सुरक्षा:</strong><br>• <strong>१००% सुरक्षित ठेव:</strong> खरेदीदाराचे पैसे शेतमाल निघण्यापूर्वीच RBI-नियमन केलेल्या एस्क्रो खात्यात जमा केले जातात.<br>• <strong>२४ तासांत थेट बँक जमा:</strong> शेतमाल पोहोचून खरेदीदाराने OTP व QR पडताळणी करताच <strong>२४ तासांच्या आत थेट तुमच्या बँक खात्यात / UPI वर पैसे जमा होतात</strong>.<br>• <strong>शून्य मध्यस्थ दलाली:</strong> कोणतीही गुप्त कपात किंवा आढ़त कट होत नाही.<br>⚖️ <em>तक्रार निवारण: मालाबाबत वाद झाल्यास DoCA नोडल अधिकारी ६ तासांत निष्पक्ष तोडगा काढतात.</em>`;
        } else if (isRegister) {
            reply = `📝 <strong>किसानसेतू नोंदणी व आधार eKYC माहिती:</strong><br>• <strong>कोणी नोंदणी करावी?</strong> शेतकरी, ग्राहक, FPO उत्पादक समूह, घाऊक खरेदीदार आणि वाहतूकदार सर्वांसाठी नोंदणी पूर्णपणे मोफत आहे.<br>• <strong>आवश्यक कागदपत्रे:</strong> मोबाईलशी जोडलेला आधार क्रमांक आणि बँक खाते तपशील (किंवा UPI आयडी).<br>• <strong>नोंदणी कशी करावी?</strong> स्क्रीनवरील उजव्या कोपऱ्यात <strong>'नोंदणी / Register'</strong> वर क्लिक करा.<br>✅ <em>eKYC फायदा: आधार पडताळणी पूर्ण झाल्यावर तुमच्या प्रोफाईलला अधिकृत 'Verified' हिरवा टिक मिळतो, ज्यामुळे खरेदीदारांचा विश्वास वाढतो.</em>`;
        } else if (isWeather) {
            reply = `🌦️ <strong>हवामान अंदाज व कृषी सल्ला (Agricultural Weather Advisory):</strong><br>• <strong>सद्यस्थिती (महाराष्ट्र):</strong> स्वच्छ आकाश, आर्द्रता ६५%-७०%, तापमान २२°C ते ३१°C दरम्यान.<br>• <strong>काढणी सल्ला:</strong> टोमॅटो, भाजीपाला व कांदा काढणीसाठी हवामान अत्यंत अनुकूल आहे.<br>💡 <em>महत्त्वाची टीप: उष्णतेमुळे होणारे नुकसान टाळण्यासाठी काढणी सकाळी ६:०० ते ९:३० या वेळेतच करावी आणि माल झाडाच्या सावलीत ठेवावा.</em>`;
        } else if (isBuyerOrder) {
            reply = `🤝 <strong>खरेदीदार ऑर्डर्स व काउंटर-ऑफर (Negotiation System):</strong><br>• <strong>थेट ऑर्डर्स:</strong> घाऊक किंवा किरकोळ खरेदीदाराने मागणी नोंदवल्यावर तुम्हाला तत्काळ SMS व डॅशबोर्ड सूचना मिळते.<br>• <strong>काउंटर ऑफर:</strong> खरेदीदाराचा दर कमी असल्यास तुम्ही डॅशबोर्डमध्ये <strong>'Counter Offer'</strong> बटनावर क्लिक करून तुमचा योग्य दर सुचवू शकता.<br>• <strong>सौदा पक्का:</strong> दोघांचे एकमत होताच एस्क्रो रक्कम लॉक होते आणि माल उचलण्यासाठी वाहन निश्चित केले जाते.`;
        } else if (isFpo) {
            reply = `🌾 <strong>FPO शेतकरी उत्पादक समूह व एकत्रित विक्री:</strong><br>• <strong>मोठा फायदा:</strong> लहान शेतकरी एकत्र येऊन ५ टन किंवा त्याहून अधिक मोठा लॉट तयार करतात.<br>• <strong>मोठ्या कंपन्यांशी थेट करार:</strong> सह्याद्री FPO सारख्या समूहांना सुपरमार्केट्स, हॉटेल्स व प्रक्रिया उद्योग थेट उच्चतम घाऊक दराने खरेदी करतात.<br>• <strong>नफा वाटप:</strong> शेतमाल विक्रीनंतर प्रत्येक शेतकऱ्याला त्यांच्या वजनानुसार पूर्ण नफा थेट बँक खात्यात मिळतो.`;
        } else if (isVoice) {
            reply = `🎙️ <strong>आवाज सहाय्यक (Voice Reader & Mic Features):</strong><br>• <strong>बोलून शोधा:</strong> शोध पट्टी किंवा माल नोंदणीमध्ये 🎙️ माईक आयकॉन दाबून मराठी, हिंदी किंवा इंग्रजीत थेट बोला.<br>• <strong>ऐका:</strong> कोणत्याही संदेशाखालील <strong>'🔊 ऐका'</strong> बटनावर क्लिक केल्यास संपूर्ण संदेश मराठी आवाजात वाचून दाखवला जातो.<br>• <strong>स्क्रीन वाचक:</strong> खालील उजव्या कोपऱ्यातील मदत बटणातून 'Voice Reader' चालू करून संपूर्ण स्क्रीन ऐकू शकता.`;
        } else if (isDispute) {
            reply = `📞 <strong>तक्रार निवारण व शासकीय किसान कॉल सेंटर:</strong><br>• <strong>एस्क्रो सुरक्षा:</strong> मालाच्या वजनात किंवा दर्जात तफावत असल्यास पेमेंट तात्काळ थांबवले जाते आणि ६ तासांत तपासणी केली जाते.<br>• <strong>शासकीय टोल-फ्री हेल्पलाइन:</strong> २४x७ कृषी सहाय्यासाठी थेट किसान कॉल सेंटरवर 📞 <strong>१८००-१८०-१५५१</strong> वर मोफत कॉल करा.<br>• <strong>DoCA नोडल अधिकारी:</strong> ईमेल: nodal.admin@kisansetu.gov.in`;
        } else if (isAbout) {
            reply = `🌾 <strong>किसानसेतू (KisanSetu) प्लॅटफॉर्मविषयी माहिती:</strong><br>• <strong>उद्दिष्ट:</strong> Smart India Hackathon 2026 (Problem Statement 26033) अंतर्गत ग्राहक व्यवहार मंत्रालय (DoCA) द्वारे विकसित.<br>• <strong>मुख्य कार्य:</strong> शेतकरी आणि ग्राहक यांच्यातील ३ ते ५ दलालांची साखळी नष्ट करून शेतकऱ्यांना <strong>२५% ते ३८% अधिक नफा</strong> मिळवून देणे आणि ग्राहकांना ताजा शेतमाल वाजवी दरात पुरवणे.<br>• <strong>प्रमुख वैशिष्ट्ये:</strong> AI बाजारभाव अंदाज, ८ NABL तपासणी लॅब, DoCA एस्क्रो २४ तास बँक जमा, आणि CVRPTW शीतगृह वाहतूक.`;
        }
        // Priority 2: Specific Crop Live Mandi Benchmarks
        else if (isTomato) {
            reply = `🍅 <strong>थेट टोमॅटो बाजारभाव व AI अंदाज (Tomato Live APMC Rates):</strong><br>• <strong>अमरावती APMC:</strong> संकरित टोमॅटो (ग्रेड A) सरासरी दर: <strong>₹२१.५० / किलो</strong> (आवक: ५४ क्विंटल).<br>• <strong>नाशिक APMC:</strong> टोमॅटो क्रेट दर: <strong>₹२२.८० / किलो</strong>.<br>• <strong>किसानसेतू थेट शेतकरी दर:</strong> <strong>₹२४.०० / किलो</strong> (दलाल नसल्यामुळे ₹२.५० अधिक थेट नफा).<br>📈 <em>AI ३-दिवसीय अंदाज: स्थानिक आवक नियंत्रित असल्यामुळे पुढील ३ दिवसांत दर ₹२–₹३ वाढण्याची शक्यता आहे.</em><br>💡 <em>सल्ला: शेतमाल स्वच्छ प्लास्टिक क्रेटमध्ये पॅक करून ठेवल्यास वाहतुकीतील नुकसान ४% पेक्षा कमी होते.</em>`;
        } else if (isOnion) {
            reply = `🧅 <strong>थेट कांदा बाजारभाव व निर्यात अपडेट (Onion Live Benchmark):</strong><br>• <strong>लासलगाव APMC (आशियातील सर्वात मोठी बाजारपेठ):</strong> नाशिक लाल कांदा सरासरी दर: <strong>₹२२.०० - ₹२४.५० / किलो</strong>.<br>• <strong>पिंपळगाव बसवंत APMC:</strong> उन्हाळ कांदा उत्तम प्रत: <strong>₹२५.२० / किलो</strong>.<br>• <strong>किसानसेतू थेट विक्री भाव:</strong> <strong>₹२६.०० / किलो</strong> (थेट UPI जमा).<br>📊 <em>AI मार्केट अलर्ट: मुंबई व दक्षिण भारतातील घाऊक खरेदीदारांकडून चांगल्या वाळवलेल्या लाल कांद्याला मोठी मागणी आहे. ओलावा १२% पेक्षा कमी असावा.</em>`;
        } else if (isPotato) {
            reply = `🥔 <strong>थेट बटाटा बाजारभाव व शीतगृह स्टॉक (Potato APMC Rates):</strong><br>• <strong>पुणे गुलटेकडी मार्केट यार्ड:</strong> ज्योती बटाटा सरासरी भाव: <strong>₹२१.०० / किलो</strong>.<br>• <strong>अकोला APMC:</strong> कुफरी पुखराज दर: <strong>₹२२.५० / किलो</strong>.<br>• <strong>किसानसेतू थेट दर:</strong> <strong>₹२३.०० / किलो</strong>.<br>❄️ <em>AI सल्ला: शीतगृहातील बटाटा बाहेर काढल्यानंतर २-३ तास सावलीत ठेवून मगच वाहतुकीसाठी लोड करावा, जेणेकरून सालीला घाम येत नाही.</em>`;
        } else if (isWheat) {
            reply = `🌾 <strong>थेट गहू बाजारभाव व हमीभाव पडताळणी (Wheat APMC & MSP Rates):</strong><br>• <strong>अमरावती / अकोला APMC:</strong> शरबती / लोकवन गहू: <strong>₹२७.५० - ₹३१.०० / किलो</strong> (₹२,७५० - ₹३,१०० / क्विंटल).<br>• <strong>शासकीय हमीभाव (MSP):</strong> ₹२,२७५ / क्विंटल.<br>• <strong>किसानसेतू थेट शेतकरी विक्री:</strong> <strong>₹३२.०० / किलो</strong> थेट गिरणी मालकांना.<br>🔍 <em>गुणवत्ता टीप: ओलावा १०% पेक्षा कमी असल्यास NABL लॅबकडून Grade A प्रमाणपत्र मिळते.</em>`;
        } else if (isSoybean) {
            reply = `🌱 <strong>थेट सोयाबीन बाजारभाव व तेल प्रमाण चाचणी (Soybean Rates):</strong><br>• <strong>लातूर APMC:</strong> पिवळा सोयाबीन सरासरी दर: <strong>₹४४.५० - ₹४६.८० / किलो</strong> (₹४,४५० - ₹४,६८० / क्विंटल).<br>• <strong>अकोला APMC:</strong> <strong>₹४५.२० / किलो</strong>.<br>• <strong>किसानसेतू थेट विक्री:</strong> <strong>₹४८.०० / किलो</strong> थेट सॉल्व्हेंट एक्स्ट्रॅक्शन प्लांटला.<br>🧪 <em>टीप: १९% पेक्षा जास्त तेल प्रमाण असल्यास ₹१५० ते ₹२०० प्रति क्विंटल अधिक भाव मिळतो.</em>`;
        } else if (isCauliflower) {
            reply = `🥦 <strong>थेट कॉलिफ्लॉवर / कोबी बाजारभाव (Cauliflower & Cabbage):</strong><br>• <strong>बुलढाणा APMC:</strong> स्नोबॉल कॉलिफ्लॉवर सरासरी दर: <strong>₹१९.०० / किलो</strong>.<br>• <strong>पुणे गुलटेकडी:</strong> पत्ताकोबी दर: <strong>₹१६.५० / किलो</strong>.<br>• <strong>किसानसेतू थेट भाव:</strong> <strong>₹२१.०० / किलो</strong> (शेतकऱ्यांना पूर्ण नफा).<br>🚚 <em>शीतगृह वाहतूक: +६°C ते +८°C तापमानात वाहतूक केल्यास पानांचा ताजेपणा ४८ तास टिकून राहतो.</em>`;
        } else if (isChilli) {
            reply = `🌶️ <strong>थेट मिरची बाजारभाव (Chilli Mandi Benchmark):</strong><br>• <strong>नंदुरबार / ब्याडगी APMC:</strong> सुकी लाल मिरची: <strong>₹१५५.०० - ₹१९०.०० / किलो</strong>.<br>• <strong>अमरावती APMC:</strong> ताजी हिरवी मिरची (ज्वाला): <strong>₹३८.०० - ₹४६.०० / किलो</strong>.<br>• <strong>किसानसेतू थेट विक्री:</strong> <strong>₹४८.०० / किलो</strong> हिरवी, <strong>₹२०५.०० / किलो</strong> लाल मिरची थेट मसाला उत्पादकांना.`;
        } else if (isCotton) {
            reply = `🌾 <strong>थेट कापूस बाजारभाव व लांब धागा प्रत (Cotton APMC Rates):</strong><br>• <strong>विदर्भ / खान्देश APMC:</strong> मध्यम-लांब धागा कापूस: <strong>₹७,१५० - ₹७,४५० / क्विंटल</strong>.<br>• <strong>शासकीय हमीभाव (MSP):</strong> ₹७,१२१ / क्विंटल.<br>• <strong>किसानसेतू थेट जिनिंग मिल भाव:</strong> <strong>₹७,६५० / क्विंटल</strong>.<br>🔍 <em>सल्ला: कापसात ओलावा ८% पेक्षा कमी आणि कचरा २% पेक्षा कमी असल्यास सर्वोत्तम ग्रेड मिळतो.</em>`;
        }
        // Priority 3: General Mandi Prices Overview
        else if (isGeneralPrice) {
            reply = `📊 <strong>थेट शासकीय ॲगमार्कनेट बाजारभाव सारांश (Live APMC Benchmarks):</strong><br>• 🍅 <strong>टोमॅटो:</strong> ₹२१.५० / किलो (अमरावती APMC)<br>• 🧅 <strong>कांदा:</strong> ₹२२.०० / किलो (लासलगाव APMC)<br>• 🥔 <strong>बटाटा:</strong> ₹२१.०० / किलो (पुणे गुलटेकडी)<br>• 🥦 <strong>कॉलिफ्लॉवर:</strong> ₹१९.०० / किलो (बुलढाणा APMC)<br>• 🌾 <strong>गहू:</strong> ₹२८.५० / किलो (अकोला APMC)<br>• 🌱 <strong>सोयाबीन:</strong> ₹४५.५० / किलो (लातूर APMC)<br>💡 <em>विशिष्ट शेतमालाचा अधिक माहितीसाठी थेट 'टोमॅटो भाव' किंवा 'कांदा भाव' असा प्रश्न विचारा.</em>`;
        }
        // Priority 4: Greetings
        else if (isGreeting) {
            reply = `सस्नेह नमस्कार! 🙏 मी आपला <strong>किसानसेतू सहाय्यक AI</strong> आहे.<br>मी आपल्याला खालील सर्व विषयांवर अचूक मदत करू शकतो:<br>• 🍅 <strong>थेट बाजारभाव:</strong> टोमॅटो, कांदा, बटाटा, गहू, सोयाबीन इ.<br>• 🌾 <strong>शेतमाल विक्री:</strong> माल कसा नोंदवायचा व विकायचा<br>• 🔬 <strong>ॲगमार्क लॅब:</strong> गुणवत्ता चाचणी व QR प्रमाणपत्र<br>• 🛡️ <strong>एस्क्रो पेमेंट:</strong> २४ तासांत थेट बँक खात्यात जमा<br>• 🚚 <strong>वाहतूक:</strong> शेतातून शीतगृह पिकअप<br><em>खालीलपैकी कोणताही प्रश्न विचारा किंवा पर्याय निवडा!</em>`;
        }
        // Priority 5: Fallback with Interactive Chips
        else {
            reply = `🙏 <strong>आपल्या प्रश्नाचे स्वागत आहे!</strong><br>आपण विचारलेल्या विषयावर अचूक माहिती देण्यासाठी कृपया खालील पर्यायांपैकी एकावर क्लिक करा किंवा अधिक स्पष्ट प्रश्न विचारा:<br><div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0;"><button type="button" onclick="sendSimulatedWhatsAppMsg('आजचे टोमॅटो भाव काय आहेत?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🍅 टोमॅटो भाव</button><button type="button" onclick="sendSimulatedWhatsAppMsg('किसानसेतूवर माझा शेतमाल कसा विकायचा?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🌾 माल कसा विकायचा?</button><button type="button" onclick="sendSimulatedWhatsAppMsg('एस्क्रो खात्यातून शेतकऱ्यांना पैसे कसे मिळतात?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🛡️ एस्क्रो पेमेंट</button><button type="button" onclick="sendSimulatedWhatsAppMsg('ॲगमार्क गुणवत्ता तपासणी प्रमाणपत्र कोठे मिळेल?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🔬 ॲगमार्क लॅब</button><button type="button" onclick="sendSimulatedWhatsAppMsg('कोल्ड-चेन वाहतूक आणि शेतातून पिकअप कसा होतो?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🚚 शीतगृह वाहतूक</button></div>तसेच २४x७ शासकीय किसान कॉल सेंटर 📞 <strong>१८००-१८०-१५५१</strong> वर मोफत कॉल करू शकता.`;
        }
    }
    // ==========================================
    // HINDI (हिंदी) INTENT RESPONSES
    // ==========================================
    else if (lang === 'hi') {
        // Priority 1: Workflows & Actions (Logistics, Selling, Lab, Escrow, etc.)
        if (isLogistics) {
            reply = `🚚 <strong>स्मार्ट कोल्ड-चेन ट्रांसपोर्ट और खेत से सीधा पिकअप:</strong><br>• <strong>CVRPTW रूट ऑप्टिमाइजेशन:</strong> एक ही तहसील के किसानों के माल को समेकित करके रेफ्रिजरेटेड (+4°C से +8°C) वाहन सीधे खेत पर आते हैं।<br>• <strong>34% तक किराए की बचत:</strong> साझा परिवहन से लॉजिस्टिक्स लागत में 34% की भारी कटौती होती है।<br>• <strong>लाइव जीपीएस:</strong> पिकअप से 2 घंटे पहले ड्राइवर का नाम, मोबाइल नंबर और लाइव GPS ट्रैकिंग SMS द्वारा प्राप्त होती है।`;
        } else if (isSell) {
            reply = `🌾 <strong>किसानसेतु पर फसल बेचने की आसान 4-चरणीय विधि:</strong><br>1. <strong>डैशबोर्ड खोलें:</strong> 'Farmer Hub' या 'My Dashboard' पर जाएं।<br>2. <strong>फसल दर्ज करें:</strong> <strong>'List New Produce'</strong> बटन दबाएं (या माइक 🎙️ से बोलकर दर्ज करें)।<br>3. <strong>विवरण भरें:</strong> फसल का नाम, मात्रा (किग्रा/क्विंटल), अपनी न्यूनतम कीमत और कटाई की तारीख चुनें।<br>4. <strong>सीधी बिक्री:</strong> दर्ज होते ही पूरे राज्य के थोक व्यापारियों और उपभोक्ताओं को आपका माल दिखता है।<br>🛡️ <em>लाभ: 0% बिचौलिया कमीशन + 24 घंटे में सीधे बैंक खाते / UPI में सुरक्षित भुगतान!</em>`;
        } else if (isLab) {
            reply = `🔬 <strong>सरकारी एगमार्क व NABL गुणवत्ता जांच केंद्र:</strong><br>• <strong>निकटतम प्रमुख लैब:</strong><br>  - <strong>नासिक:</strong> KVK डिंडोरी और पिंपलगांव बसवंत लैब (0253-2341290)<br>  - <strong>अमरावती APMC:</strong> विदर्भ एग्री टेस्टिंग लैब (कॉटन यार्ड के पास)<br>  - <strong>बुलढाणा APMC:</strong> शेगांव रोड एगमार्क असेसिंग सेंटर<br>• <strong>जांच समय:</strong> <strong>मात्र 2 घंटे</strong> (नमी, साइज ग्रेडिंग, कीटनाशक अवशेष)।<br>• <strong>लाभ:</strong> डिजिटल QR सर्टिफिकेट से सीधे <strong>18% से 25% अधिक दाम</strong> मिलते हैं!<br>👉 <em>ऊपर हेडर में 'Verify Certificate' दबाकर किसी भी लॉट का प्रमाण पत्र तुरंत सत्यापित करें।</em>`;
        } else if (isEscrow) {
            reply = `🛡️ <strong>DoCA उपभोक्ता मामले मंत्रालय एस्क्रो भुगतान सुरक्षा:</strong><br>• <strong>100% फंड लॉक:</strong> खेत से गाड़ी निकलने से पहले ही खरीदार का पूरा भुगतान RBI-विनियमित एस्क्रो खाते में जमा करा लिया जाता है।<br>• <strong>24 घंटे में सीधा ट्रांसफर:</strong> डिलीवरी के समय OTP और QR सत्यापन होते ही <strong>24 घंटे के भीतर सीधे आपके बैंक खाते / UPI में भुगतान आ जाता है</strong>।<br>• <strong>शून्य बिचौलिया कटौती:</strong> कोई कमीशन या गुप्त कटौती नहीं होती।<br>⚖️ <em>विवाद सुरक्षा: गुणवत्ता को लेकर कोई आपत्ति होने पर DoCA नोडल अधिकारी 6 घंटे में समाधान करते हैं।</em>`;
        } else if (isRegister) {
            reply = `📝 <strong>किसानसेतु पंजीकरण और आधार eKYC प्रक्रिया:</strong><br>• <strong>कौन जुड़ सकता है?</strong> किसान, उपभोक्ता, FPO समूह, थोक खरीददार और ट्रांसपोर्टर्स के लिए पंजीकरण पूर्णतः निःशुल्क है।<br>• <strong>आवश्यक दस्तावेज:</strong> आधार नंबर (OTP सत्यापन हेतु) और बैंक खाता विवरण / UPI आईडी।<br>• <strong>पंजीकरण कैसे करें?</strong> ऊपर दाईं ओर <strong>'Register / पंजीकरण'</strong> बटन पर क्लिक करें।<br>✅ <em>सत्यापन लाभ: आधार eKYC होते ही प्रोफाइल पर आधिकारिक 'Verified' ग्रीन टिक मिलता है, जिससे खरीदारों में भरोसा बढ़ता है।</em>`;
        } else if (isWeather) {
            reply = `🌦️ <strong>मौसम पूर्वानुमान व कृषि सलाह (Agricultural Weather Advisory):</strong><br>• <strong>वर्तमान स्थिति (महाराष्ट्र):</strong> साफ आसमान, आर्द्रता 65%-70%, तापमान 22°C से 31°C के बीच।<br>• <strong>कटाई सलाह:</strong> टमाटर, सब्जियों और प्याज की तुड़ाई के लिए मौसम पूरी तरह अनुकूल है।<br>💡 <em>महत्वपूर्ण टिप: धूप से फसल को बचाने के लिए सुबह 6:00 से 9:30 बजे के बीच ही तुड़ाई करें और माल को छाया में रखें।</em>`;
        } else if (isBuyerOrder) {
            reply = `🤝 <strong>खरीददार ऑर्डर्स और काउंटर-ऑफर (Negotiation System):</strong><br>• <strong>डायरेक्ट ऑर्डर्स:</strong> खरीदार द्वारा ऑर्डर या बोली लगाने पर आपको तुरंत SMS और डैशबोर्ड अलर्ट मिलता है।<br>• <strong>काउंटर ऑफर:</strong> यदि खरीदार का दाम कम लगे, तो आप 'Counter Offer' बटन दबाकर अपनी उचित कीमत भेज सकते हैं।<br>• <strong>डील फाइनल:</strong> दोनों पक्षों की सहमति होते ही एस्क्रो राशि लॉक हो जाती है और पिकअप गाड़ी शेड्यूल हो जाती है।`;
        } else if (isFpo) {
            reply = `🌾 <strong>FPO किसान उत्पादक समूह व सामूहिक बिक्री:</strong><br>• <strong>बड़ा लाभ:</strong> छोटे व सीमांत किसान मिलकर 5 टन या अधिक का बड़ा लॉट तैयार करते हैं।<br>• <strong>संस्थागत खरीदार:</strong> सह्याद्री FPO जैसे समूहों से सुपरमार्केट्स, होटल चेन्स और फूड प्रोसेसर्स सीधे थोक भाव पर माल खरीदते हैं।<br>• <strong>पारदर्शी मुनाफा:</strong> बिक्री के बाद प्रत्येक किसान को उनके माल के वजन के अनुपात में पूरा भुगतान सीधे बैंक में मिलता है।`;
        } else if (isVoice) {
            reply = `🎙️ <strong>आवाज सहायक (Voice Reader & Mic Features):</strong><br>• <strong>बोलकर खोजें:</strong> सर्च बार या फसल लिस्टिंग में 🎙️ माइक आइकन दबाकर हिंदी, मराठी या अंग्रेजी में सीधे बोलें।<br>• <strong>सुनें:</strong> किसी भी मैसेज के नीचे <strong>'🔊 सुनें'</strong> बटन दबाकर पूरा उत्तर हिंदी आवाज में सुन सकते हैं।<br>• <strong>स्क्रीन रीडर:</strong> नीचे दाईं ओर हेल्प मेनू से 'Voice Reader' ऑन करके पूरा पेज सुन सकते हैं।`;
        } else if (isDispute) {
            reply = `📞 <strong>शिकायत निवारण व सरकारी किसान कॉल सेंटर:</strong><br>• <strong>एस्क्रो सुरक्षा:</strong> वजन या गुणवत्ता में अंतर आने पर पेमेंट रोक दिया जाता है और 6 घंटे में सरकारी लैब जांच होती है।<br>• <strong>टोल-फ्री हेल्पलाइन:</strong> 24x7 कृषि सहायता के लिए सीधे किसान कॉल सेंटर 📞 <strong>1800-180-1551</strong> पर निःशुल्क संपर्क करें।<br>• <strong>DoCA नोडल अधिकारी:</strong> ईमेल: nodal.admin@kisansetu.gov.in`;
        } else if (isAbout) {
            reply = `🌾 <strong>किसानसेतु (KisanSetu) प्लेटफॉर्म के बारे में:</strong><br>• <strong>उद्देश्य:</strong> Smart India Hackathon 2026 (Problem Statement 26033) के तहत उपभोक्ता मामले मंत्रालय (DoCA) द्वारा विकसित।<br>• <strong>मुख्य कार्य:</strong> खेत से सीधे उपभोक्ता व थोक खरीददारों को जोड़कर 3-5 बिचौलियों को हटाना, जिससे किसानों को <strong>25% से 38% अधिक आमदनी</strong> और उपभोक्ताओं को ताजा माल मिले।<br>• <strong>मुख्य स्तंभ:</strong> AI मंडी पूर्वानुमान, 8 NABL लैब नेटवर्क, DoCA एस्क्रो 24 घंटे में भुगतान, और CVRPTW कोल्ड-चेन ट्रांसपोर्ट।`;
        }
        // Priority 2: Specific Crop Live Mandi Benchmarks
        else if (isTomato) {
            reply = `🍅 <strong>लाइव टमाटर मंडी भाव व AI पूर्वानुमान (Tomato Live APMC Rates):</strong><br>• <strong>अमरावती APMC:</strong> हाइब्रिड टमाटर (ग्रेड A) मॉडल भाव: <strong>₹21.50 / किग्रा</strong> (आवक: 54 क्विंटल)।<br>• <strong>नासिक APMC:</strong> टमाटर क्रेट भाव: <strong>₹22.80 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट किसान भाव:</strong> <strong>₹24.00 / किग्रा</strong> (बिचौलिया न होने से ₹2.50 ज्यादा मुनाफा)।<br>📈 <em>AI 3-दिवसीय पूर्वानुमान: आवक नियंत्रित रहने से अगले 3 दिनों में भाव ₹2–₹3 मजबूत होने की उम्मीद है।</em><br>💡 <em>सलाह: जालीदार प्लास्टिक क्रेट में पैकिंग करने से परिवहन के दौरान नुकसान 4% से कम रहता है।</em>`;
        } else if (isOnion) {
            reply = `🧅 <strong>लाइव प्याज मंडी भाव व एक्सपोर्ट अपडेट (Onion Live Benchmark):</strong><br>• <strong>लासलगांव APMC (एशिया की सबसे बड़ी मंडी):</strong> नासिक लाल प्याज मॉडल भाव: <strong>₹22.00 - ₹24.50 / किग्रा</strong>।<br>• <strong>पिंपलगांव बसवंत APMC:</strong> उन्नत समर प्याज: <strong>₹25.20 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट किसान भाव:</strong> <strong>₹26.00 / किग्रा</strong> (सीधे बैंक में जमा)।<br>📊 <em>AI मार्केट अलर्ट: अच्छी तरह सुखाए गए प्याज की मुंबई और थोक खरीदारों से भारी मांग है। नमी 12% से कम रखें।</em>`;
        } else if (isPotato) {
            reply = `🥔 <strong>लाइव आलू मंडी भाव व कोल्ड स्टोरेज अपडेट (Potato APMC Rates):</strong><br>• <strong>पुणे गुलटेकडी मार्केट यार्ड:</strong> ज्योति आलू मॉडल भाव: <strong>₹21.00 / किग्रा</strong>।<br>• <strong>अकोला APMC:</strong> कुफरी पुखराज भाव: <strong>₹22.50 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट भाव:</strong> <strong>₹23.00 / किग्रा</strong>।<br>❄️ <em>AI सलाह: कोल्ड स्टोरेज से आलू निकालने के बाद 2-3 घंटे छायादार स्थान पर रखें ताकि छिलके में नमी न रहे।</em>`;
        } else if (isWheat) {
            reply = `🌾 <strong>लाइव गेहूं मंडी भाव व एमएसपी तुलना (Wheat APMC & MSP Rates):</strong><br>• <strong>अमरावती / अकोला APMC:</strong> शरबती / लोकवन गेहूं: <strong>₹27.50 - ₹31.00 / किग्रा</strong> (₹2,750 - ₹3,100 / क्विंटल)।<br>• <strong>सरकारी न्यूनतम समर्थन मूल्य (MSP):</strong> ₹2,275 / क्विंटल।<br>• <strong>किसानसेतु डायरेक्ट भाव:</strong> <strong>₹32.00 / किग्रा</strong> सीधे फ्लोर मिल खरीदारों को।<br>🔍 <em>गुणवत्ता टिप: नमी 10% से कम रहने पर NABL लैब से Grade A सर्टिफिकेट जारी होता है।</em>`;
        } else if (isSoybean) {
            reply = `🌱 <strong>लाइव सोयाबीन मंडी भाव व तेल प्रतिशत जांच (Soybean Rates):</strong><br>• <strong>लातूर APMC:</strong> पीला सोयाबीन मॉडल भाव: <strong>₹44.50 - ₹46.80 / किग्रा</strong> (₹4,450 - ₹4,680 / क्विंटल)।<br>• <strong>अकोला APMC:</strong> <strong>₹45.20 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट भाव:</strong> <strong>₹48.00 / किग्रा</strong> सीधे ऑयल मिल खरीदारों को।<br>🧪 <em>टिप: 19% से अधिक तेल प्रतिशत होने पर ₹150 से ₹200 प्रति क्विंटल अतिरिक्त बोनस मिलता है।</em>`;
        } else if (isCauliflower) {
            reply = `🥦 <strong>लाइव गोभी / फूलगोभी मंडी भाव (Cauliflower & Cabbage Rates):</strong><br>• <strong>बुलढाणा APMC:</strong> स्नोबॉल फूलगोभी मॉडल भाव: <strong>₹19.00 / किग्रा</strong>।<br>• <strong>पुणे गुलटेकडी:</strong> पत्तागोभी भाव: <strong>₹16.50 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट भाव:</strong> <strong>₹21.00 / किग्रा</strong> (100% बिचौलिया मुक्त)।<br>🚚 <em>कोल्ड ट्रांसपोर्ट: +6°C से +8°C तापमान में परिवहन से ताजगी 48 घंटे तक बरकरार रहती है।</em>`;
        } else if (isChilli) {
            reply = `🌶️ <strong>लाइव मिर्च मंडी भाव (Chilli Mandi Benchmark):</strong><br>• <strong>नंदुरबार / ब्याडगी APMC:</strong> सूखी लाल मिर्च: <strong>₹155.00 - ₹190.00 / किग्रा</strong>।<br>• <strong>अमरावती APMC:</strong> ताजी हरी मिर्च (ज्वाला): <strong>₹38.00 - ₹46.00 / किग्रा</strong>।<br>• <strong>किसानसेतु डायरेक्ट भाव:</strong> <strong>₹48.00 / किग्रा</strong> हरी मिर्च, <strong>₹205.00 / किग्रा</strong> लाल मिर्च सीधे मसाला निर्माताओं को।`;
        } else if (isCotton) {
            reply = `🌾 <strong>लाइव कपास मंडी भाव (Cotton APMC Rates):</strong><br>• <strong>विदर्भ / खान्देश APMC:</strong> मीडियम-लॉन्ग स्टेपल कपास: <strong>₹7,150 - ₹7,450 / क्विंटल</strong>।<br>• <strong>सरकारी एमएसपी:</strong> ₹7,121 / क्विंटल।<br>• <strong>किसानसेतु डायरेक्ट जिनिंग भाव:</strong> <strong>₹7,650 / क्विंटल</strong>।<br>🔍 <em>सलाह: कपास में नमी 8% से कम और कचरा 2% से कम रखने पर ग्रेड A भाव मिलता है।</em>`;
        }
        // Priority 3: General Mandi Prices Overview
        else if (isGeneralPrice) {
            reply = `📊 <strong>लाइव सरकारी एगमार्कनेट मंडी भाव सारांश (Live APMC Benchmarks):</strong><br>• 🍅 <strong>टमाटर:</strong> ₹21.50 / किग्रा (अमरावती APMC)<br>• 🧅 <strong>प्याज:</strong> ₹22.00 / किग्रा (लासलगांव APMC)<br>• 🥔 <strong>आलू:</strong> ₹21.00 / किग्रा (पुणे गुलटेकडी)<br>• 🥦 <strong>गोभी:</strong> ₹19.00 / किग्रा (बुलढाणा APMC)<br>• 🌾 <strong>गेहूं:</strong> ₹28.50 / किग्रा (अकोला APMC)<br>• 🌱 <strong>सोयाबीन:</strong> ₹45.50 / किग्रा (लातूर APMC)<br>💡 <em>किसी विशेष फसल की विस्तृत जानकारी के लिए सीधे 'टमाटर भाव' या 'प्याज भाव' लिखकर पूछें।</em>`;
        }
        // Priority 4: Greetings
        else if (isGreeting) {
            reply = `नमस्ते! 🙏 मैं आपका <strong>किसानसेतु सहायक AI</strong> हूँ।<br>मैं आपकी इन सभी महत्वपूर्ण विषयों पर तुरंत सहायता कर सकता हूँ:<br>• 🍅 <strong>लाइव मंडी भाव:</strong> टमाटर, प्याज, आलू, गेहूं, सोयाबीन आदि<br>• 🌾 <strong>फसल बिक्री:</strong> माल कैसे रजिस्टर करें और बेचें<br>• 🔬 <strong>एगमार्क लैब:</strong> गुणवत्ता जांच व QR सर्टिफिकेट<br>• 🛡️ <strong>एस्क्रो भुगतान:</strong> 24 घंटे में सीधे बैंक खाते में गारंटीड पेमेंट<br>• 🚚 <strong>ट्रांसपोर्ट:</strong> खेत से कोल्ड-चेन पिकअप<br><em>नीचे दिए गए सुझावों पर क्लिक करें या अपना सवाल सीधे लिखें!</em>`;
        }
        // Priority 5: Fallback with Interactive Chips
        else {
            reply = `🙏 <strong>आपके प्रश्न का स्वागत है!</strong><br>सटीक जानकारी प्राप्त करने के लिए कृपया नीचे दिए गए विकल्पों में से किसी एक पर क्लिक करें या स्पष्ट सवाल लिखें:<br><div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0;"><button type="button" onclick="sendSimulatedWhatsAppMsg('आज का टमाटर का मंडी भाव क्या है?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🍅 टमाटर भाव</button><button type="button" onclick="sendSimulatedWhatsAppMsg('किसानसेतु पर अपनी फसल सीधे कैसे बेचें?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🌾 फसल कैसे बेचें?</button><button type="button" onclick="sendSimulatedWhatsAppMsg('एस्क्रो से किसान को 24 घंटे में सुरक्षित भुगतान कैसे मिलता है?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🛡️ एस्क्रो भुगतान</button><button type="button" onclick="sendSimulatedWhatsAppMsg('एगमार्क गुणवत्ता जांच प्रयोगशाला कहां है?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🔬 एगमार्क लैब</button><button type="button" onclick="sendSimulatedWhatsAppMsg('कोल्ड-चेन ट्रांसपोर्ट और खेत से पिकअप कैसे होगा?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🚚 कोल्ड-चेन ट्रांसपोर्ट</button></div>साथ ही 24x7 सरकारी किसान कॉल सेंटर 📞 <strong>1800-180-1551</strong> पर निःशुल्क कॉल कर सकते हैं।`;
        }
    }
    // ==========================================
    // ENGLISH (अंग्रेजी) INTENT RESPONSES
    // ==========================================
    else {
        // Priority 1: Workflows & Actions (Logistics, Selling, Lab, Escrow, etc.)
        if (isLogistics) {
            reply = `🚚 <strong>Smart Cold-Chain Logistics & Farm-Gate Pickup:</strong><br>• <strong>CVRPTW Route Optimization:</strong> Nearby harvest orders are consolidated into temperature-controlled (+4°C to +8°C) refrigerated reefer trucks.<br>• <strong>Up to 34% Freight Savings:</strong> Route bundling dramatically reduces per-kg logistics overhead.<br>• <strong>Live GPS & Alerts:</strong> Driver contact details, arrival ETA, and live tracking are dispatched via SMS 2 hours prior to pickup.`;
        } else if (isSell) {
            reply = `🌾 <strong>Simple 4-Step Produce Listing & Direct Selling Guide:</strong><br>1. <strong>Access Dashboard:</strong> Go to the 'Farmer Hub' or click 'My Dashboard' in the top header.<br>2. <strong>Start Listing:</strong> Click the green <strong>'List New Produce'</strong> button (or tap 🎙️ Mic for Voice Listing).<br>3. <strong>Enter Details:</strong> Specify crop, quantity (kg/quintal), expected price per kg, and harvest date.<br>4. <strong>Instant Buyer Reach:</strong> Your listing becomes immediately visible to thousands of retail households and bulk procurement buyers.<br>🛡️ <em>Advantage: Zero commission + 100% DoCA Escrow protected payout within 24 hours of delivery!</em>`;
        } else if (isLab) {
            reply = `🔬 <strong>Official AGMARKNET & NABL Accredited Testing Laboratories:</strong><br>• <strong>Nearby Key Centers:</strong><br>  - <strong>Nashik District:</strong> KVK Dindori & Pimpalgaon Baswant Agri Lab (0253-2341290)<br>  - <strong>Amravati APMC:</strong> Vidarbha Quality Assaying Hub (Near Cotton Yard)<br>  - <strong>Buldhana APMC:</strong> Shegaon Road Mandi Assaying Yard<br>• <strong>Turnaround:</strong> <strong>Under 2 hours</strong> for moisture, size grading, and pesticide residues.<br>• <strong>Commercial Value:</strong> AGMARK QR certification commands <strong>18%–25% higher market realization</strong>!<br>👉 <em>Click 'Verify Certificate' in the top header to inspect or scan any lot certificate.</em>`;
        } else if (isEscrow) {
            reply = `🛡️ <strong>DoCA Tripartite Escrow Payment Security Guarantee:</strong><br>• <strong>100% Pre-Funded:</strong> Buyer funds are locked into an RBI-regulated escrow account before transit leaves your farm gate.<br>• <strong>24-Hour Direct Settlement:</strong> As soon as the shipment is delivered and verified via digital OTP/QR scan, funds are <strong>transferred directly to your bank account / UPI within 24 hours</strong>.<br>• <strong>Zero Intermediary Commissions:</strong> Farmers retain 100% of the agreed farm-gate realization.<br>⚖️ <em>Dispute Safeguard: If a mismatch occurs, payouts are protected while a DoCA assayer conducts a 6-hour re-check.</em>`;
        } else if (isRegister) {
            reply = `📝 <strong>KisanSetu User Registration & Aadhaar eKYC Guide:</strong><br>• <strong>Who Can Join?</strong> Registration is 100% free for Farmers, Household Consumers, FPOs, Bulk Institutional Buyers, and Fleet Drivers.<br>• <strong>Documents Needed:</strong> Aadhaar number (for instant OTP verification) and Bank Account / UPI ID for direct payouts.<br>• <strong>How to Register:</strong> Tap <strong>'Register'</strong> at the top right of the screen or open the Login/Register modal.<br>✅ <em>eKYC Advantage: Verified farmers receive an official green shield badge, boosting buyer confidence and faster order bookings.</em>`;
        } else if (isWeather) {
            reply = `🌦️ <strong>Live Weather & Harvest Advisory (Maharashtra Agri Region):</strong><br>• <strong>Current Conditions:</strong> Clear skies, 65%–70% relative humidity, ambient temperature 22°C to 31°C.<br>• <strong>Harvest Readiness:</strong> Optimal conditions for harvesting tomatoes, onions, leafy vegetables, and pulses.<br>💡 <em>AI Advisory: Complete harvesting between 6:00 AM and 9:30 AM to minimize transit dehydration and preserve post-harvest firmness.</em>`;
        } else if (isBuyerOrder) {
            reply = `🤝 <strong>Buyer Orders & Interactive Counter-Offer Negotiation:</strong><br>• <strong>Direct Inquiries:</strong> When a buyer bids on your produce lot, an instant SMS alert and dashboard notification are triggered.<br>• <strong>Counter-Offer Option:</strong> If a buyer's offer is below your expectation, click <strong>'Counter Offer'</strong> on your Farmer Dashboard to propose an adjusted price.<br>• <strong>Contract Lock:</strong> Once mutually agreed, funds are pre-locked in escrow and transportation pickup is immediately scheduled.`;
        } else if (isFpo) {
            reply = `🌾 <strong>FPO Aggregation & Collective Wholesale Commerce:</strong><br>• <strong>Collective Scale:</strong> Smallholder farmers pool harvests into 5-ton+ bulk lots (e.g. Sahyadri Farmers Producer Co.).<br>• <strong>Institutional Contracts:</strong> Supermarkets, food processors, and hotel chains place bulk wholesale bids directly on FPO lots.<br>• <strong>Direct Distribution:</strong> Escrow disbursements are settled transparently to each individual farmer's bank account based on measured weight and assay grade.`;
        } else if (isVoice) {
            reply = `🎙️ <strong>Voice Assistant & Speech Synthesis Support:</strong><br>• <strong>Voice Dictation:</strong> Tap the 🎙️ mic icon on any search box or produce listing modal to dictate in Marathi, Hindi, or English.<br>• <strong>Read Aloud:</strong> Tap the <strong>'🔊 Listen'</strong> button underneath any message bubble to hear it spoken via browser speech synthesis.<br>• <strong>Screen Reader:</strong> Open the floating help drawer to enable full-page voice reading at any time.`;
        } else if (isDispute) {
            reply = `📞 <strong>Dispute Escalation & Official Kisan Helpline:</strong><br>• <strong>Escrow Lock Protection:</strong> If a delivery discrepancy is flagged, payout is temporarily paused while an accredited assayer conducts an independent 6-hour check.<br>• <strong>Official Kisan Call Centre:</strong> Dial 24x7 National Toll-Free Helpline 📞 <strong>1800-180-1551</strong> (Govt. of India).<br>• <strong>DoCA Escrow Nodal Officer:</strong> Email: nodal.admin@kisansetu.gov.in`;
        } else if (isAbout) {
            reply = `🌾 <strong>About KisanSetu Platform (SIH 2026 Problem Statement 26033):</strong><br>• <strong>Mandate:</strong> Developed under the Ministry of Consumer Affairs (DoCA), Govt. of India, to bridge farmers directly with retail consumers and bulk commercial buyers.<br>• <strong>Core Impact:</strong> Eliminates 3 to 5 layers of exploitative middlemen, increasing farm-gate earnings by <strong>25% to 38%</strong> while lowering retail grocery costs by up to 24%.<br>• <strong>Pillars:</strong> AI benchmark forecasting, 8 NABL testing hubs, DoCA Tripartite Escrow (24h direct settlement), and CVRPTW cold-chain pickup.`;
        }
        // Priority 2: Specific Crop Live Mandi Benchmarks
        else if (isTomato) {
            reply = `🍅 <strong>Live Tomato Mandi Benchmark & AI Forecast:</strong><br>• <strong>Amravati APMC Terminal:</strong> Hybrid Tomato (Grade A) modal rate: <strong>₹21.50 / kg</strong> (Arrivals: 54 quintals).<br>• <strong>Nashik APMC:</strong> Crate wholesale rate: <strong>₹22.80 / kg</strong>.<br>• <strong>KisanSetu Direct Farm-Gate Realization:</strong> <strong>₹24.00 / kg</strong> (+₹2.50/kg extra net margin with zero commission agents).<br>📈 <em>AI 3-Day Projection: Moderate regional arrivals are expected to keep prices firm (+₹2.00 to +₹3.00/kg).</em><br>💡 <em>Advisory: Pack produce in ventilated food-grade plastic crates to keep transit wastage below 4%.</em>`;
        } else if (isOnion) {
            reply = `🧅 <strong>Live Onion Mandi Benchmark & Demand Update:</strong><br>• <strong>Lasalgaon APMC (Asia's Largest Hub):</strong> Nashik Red Onion modal rate: <strong>₹22.00 - ₹24.50 / kg</strong>.<br>• <strong>Pimpalgaon Baswant APMC:</strong> Grade A Summer Onion: <strong>₹25.20 / kg</strong>.<br>• <strong>KisanSetu Direct Farm Realization:</strong> <strong>₹26.00 / kg</strong>.<br>📊 <em>AI Market Alert: Strong institutional demand across Mumbai and South India. Cured onions with moisture <12% qualify for top-tier wholesale pricing.</em>`;
        } else if (isPotato) {
            reply = `🥔 <strong>Live Potato Mandi Benchmark & Storage Status:</strong><br>• <strong>Pune Gultekdi Market Yard:</strong> Jyoti Potato modal rate: <strong>₹21.00 / kg</strong>.<br>• <strong>Akola APMC:</strong> Kufri Pukhraj rate: <strong>₹22.50 / kg</strong>.<br>• <strong>KisanSetu Direct Farm Realization:</strong> <strong>₹23.00 / kg</strong>.<br>❄️ <em>Storage Advisory: Condition cold-stored tubers in shaded dry air for 2 hours before loading to prevent sweating and skin rot.</em>`;
        } else if (isWheat) {
            reply = `🌾 <strong>Live Wheat Benchmark & MSP Comparison:</strong><br>• <strong>Amravati / Akola APMC:</strong> Sharbati / Lokwan Wheat modal rate: <strong>₹27.50 - ₹31.00 / kg</strong> (₹2,750 - ₹3,100 / quintal).<br>• <strong>Govt MSP Benchmark:</strong> ₹2,275 / quintal.<br>• <strong>KisanSetu Direct Realization:</strong> <strong>₹32.00 / kg</strong> directly to flour mills.<br>🔍 <em>Quality Parameter: Moisture level under 10% qualifies for Grade A certification and premium mill bids.</em>`;
        } else if (isSoybean) {
            reply = `🌱 <strong>Live Soybean Mandi Benchmark & Oil Content Bonus:</strong><br>• <strong>Latur APMC Hub:</strong> Yellow Soybean modal rate: <strong>₹44.50 - ₹46.80 / kg</strong> (₹4,450 - ₹4,680 / quintal).<br>• <strong>Akola APMC:</strong> <strong>₹45.20 / kg</strong>.<br>• <strong>KisanSetu Direct Sale:</strong> <strong>₹48.00 / kg</strong> directly to solvent extraction processors.<br>🧪 <em>Assaying Note: Oil content testing >19% earns an extra ₹150–₹200/quintal premium on KisanSetu.</em>`;
        } else if (isCauliflower) {
            reply = `🥦 <strong>Live Cauliflower & Cabbage Mandi Benchmark:</strong><br>• <strong>Buldhana APMC:</strong> Snowball Cauliflower modal rate: <strong>₹19.00 / kg</strong>.<br>• <strong>Pune Gultekdi:</strong> Cabbage wholesale: <strong>₹16.50 / kg</strong>.<br>• <strong>KisanSetu Direct Realization:</strong> <strong>₹21.00 / kg</strong>.<br>🚚 <em>Logistics Tip: Transporting at +6°C to +8°C preserves curd firmness and freshness for 48 hours.</em>`;
        } else if (isChilli) {
            reply = `🌶️ <strong>Live Chilli Mandi Benchmark:</strong><br>• <strong>Nandurbar / Byadagi APMC:</strong> Dry Red Chilli: <strong>₹155.00 - ₹190.00 / kg</strong>.<br>• <strong>Amravati APMC:</strong> Fresh Green Chilli (Jwalamukhi): <strong>₹38.00 - ₹46.00 / kg</strong>.<br>• <strong>KisanSetu Direct Sale:</strong> <strong>₹48.00 / kg</strong> green, <strong>₹205.00 / kg</strong> dry directly to spice manufacturers.`;
        } else if (isCotton) {
            reply = `🌾 <strong>Live Cotton Mandi Benchmark & Ginning Demand:</strong><br>• <strong>Vidarbha / Khandesh APMC:</strong> Medium-Long Staple: <strong>₹7,150 - ₹7,450 / quintal</strong>.<br>• <strong>Govt MSP:</strong> ₹7,121 / quintal.<br>• <strong>KisanSetu Direct Sale:</strong> <strong>₹7,650 / quintal</strong> directly to spinning/ginning mills.<br>🔍 <em>Advisory: Moisture <8% and trash <2% qualify for top-grade procurement.</em>`;
        }
        // Priority 3: General Mandi Prices Overview
        else if (isGeneralPrice) {
            reply = `📊 <strong>Live Official AGMARKNET Mandi Benchmark Summary:</strong><br>• 🍅 <strong>Tomato:</strong> ₹21.50 / kg (Amravati APMC)<br>• 🧅 <strong>Onion:</strong> ₹22.00 / kg (Lasalgaon APMC)<br>• 🥔 <strong>Potato:</strong> ₹21.00 / kg (Pune Gultekdi)<br>• 🥦 <strong>Cauliflower:</strong> ₹19.00 / kg (Buldhana APMC)<br>• 🌾 <strong>Wheat:</strong> ₹28.50 / kg (Akola APMC)<br>• 🌱 <strong>Soybean:</strong> ₹45.50 / kg (Latur APMC)<br>💡 <em>For in-depth details on any crop, ask specifically (e.g. 'Tomato price' or 'Onion rate').</em>`;
        }
        // Priority 4: Greetings
        else if (isGreeting) {
            reply = `Hello and welcome! 🙏 I am your <strong>KisanSetu Sahayak AI</strong>.<br>I can provide instant, verified assistance on:<br>• 🍅 <strong>Live Mandi Rates:</strong> Tomato, Onion, Potato, Wheat, Soybean, etc.<br>• 🌾 <strong>Sell Produce:</strong> Step-by-step produce listing and pricing<br>• 🔬 <strong>AGMARK Labs:</strong> Nearest testing centers and QR quality certification<br>• 🛡️ <strong>Escrow Settlement:</strong> 24-hour direct UPI/Bank payout guarantee<br>• 🚚 <strong>Logistics:</strong> Consolidated farm-gate cold chain pickup<br><em>Tap any quick prompt below or type your question directly!</em>`;
        }
        // Priority 5: Fallback with Interactive Chips
        else {
            reply = `🙏 <strong>Thanks for reaching out!</strong><br>To get instant, accurate guidance, please tap one of the direct topics below or specify your question:<br><div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0;"><button type="button" onclick="sendSimulatedWhatsAppMsg('What is today live Tomato mandi rate?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🍅 Tomato Rate</button><button type="button" onclick="sendSimulatedWhatsAppMsg('How do I list and sell produce directly on KisanSetu?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🌾 How to Sell</button><button type="button" onclick="sendSimulatedWhatsAppMsg('How does DoCA Escrow guarantee 24-hour payment to farmers?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🛡️ Escrow Payout</button><button type="button" onclick="sendSimulatedWhatsAppMsg('Where are the official AGMARK & NABL testing labs located?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🔬 Testing Labs</button><button type="button" onclick="sendSimulatedWhatsAppMsg('How does refrigerated transport and farm-gate pickup work?')" style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:12px; padding:3px 8px; font-size:11px; color:#1b5e20; cursor:pointer; font-weight:600;">🚚 Cold Logistics</button></div>You can also reach the 24x7 Government Kisan Call Centre at 📞 <strong>1800-180-1551</strong>.`;
        }
    }

    return { reply, lang };
}

function sendSimulatedWhatsAppMsg(text) {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    const chatBody = document.getElementById('waChatBody');
    const input = document.getElementById('waSimInput');
    if (!chatBody) return;

    if (input) input.value = '';

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'align-self:flex-end; background:#d9fdd3; color:#111b21; padding:8px 12px; border-radius:12px 0 12px 12px; max-width:85%; box-shadow:0 1px 2px rgba(0,0,0,0.1); line-height:1.4; word-break:break-word;';
    userMsg.innerHTML = `${escapeHtml(clean)}<div style="font-size:10px; color:#667781; text-align:right; margin-top:2px;">Just now ✓✓</div>`;
    chatBody.appendChild(userMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate smart AI reply after 350ms
    setTimeout(() => {
        const { reply, lang } = generateWhatsAppBotReply(clean, currentWaLang);
        const listenBtnLabel = (WA_I18N[lang] || WA_I18N.mr).listenBtn;

        const botMsg = document.createElement('div');
        botMsg.style.cssText = 'align-self:flex-start; background:#ffffff; color:#111b21; padding:10px 12px; border-radius:0 12px 12px 12px; max-width:88%; box-shadow:0 1px 2px rgba(0,0,0,0.1); line-height:1.45; word-break:break-word;';
        botMsg.innerHTML = `
            ${reply}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px dashed #e2e8f0;">
                <button type="button" onclick="speakWhatsAppMessage(this, '${lang}')" style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:3px 10px; font-size:11px; color:#065f46; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Listen aloud in regional language">
                    ${listenBtnLabel}
                </button>
                <div style="font-size:10px; color:#667781;">Just now</div>
            </div>
        `;
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 350);
}

// =========================================================================
// UX OVERHAUL: 1-MINUTE GUIDED PLATFORM TOUR MODAL
// 5 High-Impact Slides for First-Time Farmers & SIH 2026 Evaluators
// =========================================================================

let currentTourStep = 1;

const TOUR_SLIDES = [
    {
        step: 1,
        badge: 'STEP 1 OF 5 • DIRECT COMMERCE',
        icon: '🌾',
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        title: 'Direct Farm-to-Buyer Marketplace',
        desc: 'Eliminate 3 to 5 layers of commission agents (arhatiyas) and middlemen. Farmers receive 25% to 30% higher farm-gate price realizations while retail consumers and institutional buyers enjoy 100% fresh, traceable produce delivered straight from harvest.',
        benefit: '💡 Real Impact: Direct UPI settlement within 24 hours of delivery with zero commission deduction.'
    },
    {
        step: 2,
        badge: 'STEP 2 OF 5 • QUALITY ASSURANCE',
        icon: '🔬',
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        title: 'AGMARKNET & NABL Quality Assaying',
        desc: 'No more arbitrary quality rejections at mandi gates! 8 regional accredited assaying labs test moisture, size grading, pesticide residue, and brix sweetness, generating cryptographic QR certificates recognized nationwide.',
        benefit: '🔒 Tamper-Proof: SHA-256 digital signature verified instantly by scanning the harvest lot QR.'
    },
    {
        step: 3,
        badge: 'STEP 3 OF 5 • SMART LOGISTICS',
        icon: '🚚',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        title: 'CVRPTW Route Optimization & Cold-Chain IoT',
        desc: 'AI algorithms bundle multi-farmer pickups into consolidated temperature-controlled reefer trucks, slashing freight costs by up to 34%. In-transit IoT sensors continuously stream live temperature (+4°C to +8°C) and GPS telemetry.',
        benefit: '⚡ Zero Perishable Wastage: Transit time reduced by an average of 4.2 hours across transport corridors.'
    },
    {
        step: 4,
        badge: 'STEP 4 OF 5 • SECURE ESCROW',
        icon: '⚖️',
        iconBg: '#f3e8ff',
        iconColor: '#9333ea',
        title: 'DoCA-Supervised Smart Escrow Payments',
        desc: 'Buyer funds are locked in an RBI-regulated tripartite escrow account before trucks dispatch. Once the buyer verifies the digital QR & OTP upon delivery, funds disburse instantaneously to the farmer’s verified bank account.',
        benefit: '🛡️ 100% Protection: DoCA Conciliation Officers resolve commercial disputes within 24 hours.'
    },
    {
        step: 5,
        badge: 'STEP 5 OF 5 • AI FORECASTING',
        icon: '📈',
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        title: 'Predictive Mandi AI & Farm Command Hub',
        desc: '7-Day ARIMA + XGBoost machine learning models analyze rainfall, arrivals, and national mandi trends to advise farmers: "Hold 3 days" or "Dispatch immediately to Amravati APMC for maximum realization".',
        benefit: '🎯 Smart Decision: Farmers achieve +₹4.50/kg average gain over distressed mandi distress sales.'
    }
];

function initGlobalTourModal() {
    if (document.getElementById('tourModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tourModalOverlay';
    overlay.className = 'tour-modal-overlay';
    overlay.style.display = 'none';
    overlay.onclick = (e) => {
        if (e.target.id === 'tourModalOverlay') closePlatformTour();
    };

    overlay.innerHTML = `
        <div class="tour-modal-box" id="tourModalBox" onclick="event.stopPropagation()">
            <button type="button" onclick="closePlatformTour()" style="position:absolute; top:16px; right:18px; background:none; border:none; font-size:22px; color:#64748b; cursor:pointer; z-index:10;" aria-label="Close tour">✕</button>
            <div id="tourSlideContent"></div>
            <div class="tour-footer">
                <button type="button" class="btn btn-outline btn-sm" id="tourPrevBtn" onclick="tourPrevStep()">
                    ← Back
                </button>
                <div class="tour-dots" id="tourDots"></div>
                <button type="button" class="btn btn-primary btn-sm" id="tourNextBtn" onclick="tourNextStep()">
                    Next Step →
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function openPlatformTour(startStep = 1) {
    initGlobalTourModal();
    const overlay = document.getElementById('tourModalOverlay');
    if (!overlay) return;

    currentTourStep = Math.max(1, Math.min(startStep, TOUR_SLIDES.length));
    renderTourSlide(currentTourStep);
    overlay.style.display = 'flex';
}

function closePlatformTour() {
    const overlay = document.getElementById('tourModalOverlay');
    if (overlay) overlay.style.display = 'none';
}

function tourNextStep() {
    if (currentTourStep >= TOUR_SLIDES.length) {
        closePlatformTour();
        Toast.success('🎉 Tour complete! Welcome to KisanSetu.', 4000);
        return;
    }
    currentTourStep++;
    renderTourSlide(currentTourStep);
}

function tourPrevStep() {
    if (currentTourStep <= 1) return;
    currentTourStep--;
    renderTourSlide(currentTourStep);
}

function goToTourStep(step) {
    currentTourStep = Math.max(1, Math.min(step, TOUR_SLIDES.length));
    renderTourSlide(currentTourStep);
}

function renderTourSlide(step) {
    const slide = TOUR_SLIDES.find(s => s.step === step) || TOUR_SLIDES[0];
    const container = document.getElementById('tourSlideContent');
    const dotsContainer = document.getElementById('tourDots');
    const prevBtn = document.getElementById('tourPrevBtn');
    const nextBtn = document.getElementById('tourNextBtn');

    if (!container) return;

    container.innerHTML = `
        <div class="tour-slide">
            <span class="tour-step-badge">${slide.badge}</span>
            <div class="tour-icon-avatar" style="background:${slide.iconBg}; color:${slide.iconColor};">
                ${slide.icon}
            </div>
            <h3 class="tour-title">${slide.title}</h3>
            <p class="tour-desc">${slide.desc}</p>
            <div class="tour-benefit-card">
                ${slide.benefit}
            </div>
        </div>
    `;

    // Update Dots
    if (dotsContainer) {
        dotsContainer.innerHTML = TOUR_SLIDES.map(s => `
            <div class="tour-dot ${s.step === step ? 'active' : ''}" onclick="goToTourStep(${s.step})" title="Go to step ${s.step}"></div>
        `).join('');
    }

    // Update Buttons
    if (prevBtn) {
        prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    }
    if (nextBtn) {
        if (step === TOUR_SLIDES.length) {
            nextBtn.innerText = '🚀 Explore KisanSetu Now';
            nextBtn.className = 'btn btn-accent btn-sm';
        } else {
            nextBtn.innerText = 'Next Step →';
            nextBtn.className = 'btn btn-primary btn-sm';
        }
    }
}

// Global window registrations
window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;
window.setCmdCategory = setCmdCategory;
window.executeCmdItem = executeCmdItem;
window.toggleHelpDrawer = toggleHelpDrawer;
window.toggleFaq = toggleFaq;
window.triggerVoiceReader = triggerVoiceReader;
window.openWhatsAppSupportSimulator = openWhatsAppSupportSimulator;
window.closeWhatsAppSupportModal = closeWhatsAppSupportModal;
window.sendSimulatedWhatsAppMsg = sendSimulatedWhatsAppMsg;
window.generateWhatsAppBotReply = generateWhatsAppBotReply;
window.detectWaQueryLang = detectWaQueryLang;
window.setWhatsAppChatLang = setWhatsAppChatLang;
window.speakWhatsAppMessage = speakWhatsAppMessage;
window.openPlatformTour = openPlatformTour;
window.closePlatformTour = closePlatformTour;
window.tourNextStep = tourNextStep;
window.tourPrevStep = tourPrevStep;
window.goToTourStep = goToTourStep;


