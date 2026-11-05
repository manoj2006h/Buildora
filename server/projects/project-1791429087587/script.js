// --- Mock Stock Data & Watchlist ---
let watchlistData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2980.00, chg: 28.40, pct: 0.96, type: 'BUY' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', ltp: 3890.50, chg: -15.20, pct: -0.39, type: 'SELL' },
    { symbol: 'INFY', name: 'Infosys Limited', ltp: 1540.20, chg: 12.80, pct: 0.84, type: 'BUY' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', ltp: 1495.00, chg: 8.50, pct: 0.57, type: 'BUY' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', ltp: 1080.40, chg: -4.10, pct: -0.38, type: 'SELL' },
    { symbol: 'SBIN', name: 'State Bank of India', ltp: 785.60, chg: 14.30, pct: 1.85, type: 'BUY' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', ltp: 995.30, chg: 22.10, pct: 2.27, type: 'BUY' },
    { symbol: 'ITC', name: 'ITC Limited', ltp: 432.10, chg: -1.20, pct: -0.28, type: 'SELL' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', ltp: 1240.00, chg: 18.60, pct: 1.52, type: 'BUY' },
    { symbol: 'WIPRO', name: 'Wipro Limited', ltp: 478.90, chg: -2.40, pct: -0.50, type: 'SELL' }
];

let activeStock = watchlistData[0];
let userOrders = [];
let userHoldings = [
    { symbol: 'RELIANCE', qty: 5, avg: 2910.00, ltp: 2980.00 },
    { symbol: 'INFY', qty: 10, avg: 1500.00, ltp: 1540.20 }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderWatchlist(watchlistData);
    renderChartBars();
    renderHoldings();

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileHamburger = document.getElementById('mobile-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    [mobileMenuBtn, mobileHamburger].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    });

    // Search input filter in Watchlist
    const searchInput = document.getElementById('watchlist-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = watchlistData.filter(item => 
                item.symbol.toLowerCase().includes(query) || 
                item.name.toLowerCase().includes(query)
            );
            renderWatchlist(filtered);
        });
    }

    // Live fluctuating ticker simulation
    setInterval(() => {
        fluctuatePrices();
    }, 3000);
});

// --- Render Watchlist ---
function renderWatchlist(data) {
    const container = document.getElementById('watchlist-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = `<div class="p-4 text-xs text-gray-500 text-center">No stocks found</div>`;
        return;
    }

    data.forEach(item => {
        const isPos = item.chg >= 0;
        const colorClass = isPos ? 'text-green-400' : 'text-red-400';
        const sign = isPos ? '+' : '';
        const isActive = activeStock.symbol === item.symbol;

        const div = document.createElement('div');
        div.className = `p-3 flex items-center justify-between cursor-pointer transition hover:bg-gray-900 ${isActive ? 'bg-gray-900/90 border-l-4 border-zerodha-blue' : ''}`;
        div.innerHTML = `
            <div>
                <span class="font-bold text-white text-xs block">${item.symbol}</span>
                <span class="text-[10px] text-gray-400">${item.name}</span>
            </div>
            <div class="text-right">
                <span class="text-xs font-semibold text-white block">₹${item.ltp.toFixed(2)}</span>
                <span class="text-[10px] ${colorClass}">${sign}${item.chg.toFixed(2)} (${sign}${item.pct.toFixed(2)}%)</span>
            </div>
        `;
        div.addEventListener('click', () => {
            selectStock(item);
        });
        container.appendChild(div);
    });
}

// --- Select Stock in Kite ---
function selectStock(item) {
    activeStock = item;
    document.getElementById('active-stock-name').innerText = item.symbol;
    document.getElementById('active-stock-price').innerText = `₹${item.ltp.toFixed(2)}`;
    const isPos = item.chg >= 0;
    const sign = isPos ? '+' : '';
    const chgEl = document.getElementById('active-stock-chg');
    chgEl.className = isPos ? 'text-green-400' : 'text-red-400';
    chgEl.innerText = `${sign}${item.chg.toFixed(2)} (${sign}${item.pct.toFixed(2)}%)`;
    
    renderWatchlist(watchlistData);
    renderChartBars();
}

// --- Reset Watchlist ---
function resetWatchlist() {
    document.getElementById('watchlist-search').value = '';
    renderWatchlist(watchlistData);
}

// --- Render Mock Chart Bars ---
function renderChartBars() {
    const chartContainer = document.getElementById('mock-chart-bars');
    if (!chartContainer) return;
    chartContainer.innerHTML = '';

    // Generate 35 pseudo candlestick bars
    for (let i = 0; i < 35; i++) {
        const height = Math.floor(Math.random() * 60) + 20; // height percentage
        const isGreen = Math.random() > 0.4;
        const barColor = isGreen ? 'bg-green-500/80 hover:bg-green-400' : 'bg-red-500/80 hover:bg-red-400';

        const barWrapper = document.createElement('div');
        barWrapper.className = 'flex-1 flex flex-col justify-center items-center h-full group relative cursor-pointer';
        barWrapper.innerHTML = `
            <div class="w-1.5 rounded-sm ${barColor} transition-all duration-300" style="height: ${height}%;"></div>
        `;
        chartContainer.appendChild(barWrapper);
    }
}

// --- Fluctuate Prices Live Simulation ---
function fluctuatePrices() {
    watchlistData.forEach(item => {
        const delta = (Math.random() - 0.48) * 2; // slight random fluctuation
        item.ltp += delta;
        item.chg += delta;
        item.pct = (item.chg / (item.ltp - item.chg)) * 100;
    });

    // Update active stock price if matched
    const currentActive = watchlistData.find(s => s.symbol === activeStock.symbol);
    if (currentActive) {
        activeStock = currentActive;
        const priceEl = document.getElementById('active-stock-price');
        if (priceEl) priceEl.innerText = `₹${activeStock.ltp.toFixed(2)}`;
    }

    // Refresh watchlist view without losing scroll if search is empty
    const query = document.getElementById('watchlist-search').value.toLowerCase();
    if (!query) {
        renderWatchlist(watchlistData);
    }

    // Update market ticker top bar indices randomly
    const niftyEl = document.getElementById('ticker-nifty');
    if (niftyEl) {
        let val = parseFloat(niftyEl.innerText.replace(',', '')) + (Math.random() - 0.5) * 5;
        niftyEl.innerText = val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

// --- Kite Tabs Switcher ---
function switchKiteTab(tabName) {
    ['chart', 'orders', 'holdings'].forEach(t => {
        document.getElementById(`tab-content-${t}`).classList.add('hidden');
        document.getElementById(`tab-btn-${t}`).className = 'py-3 px-4 text-gray-400 hover:text-white';
    });

    document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-btn-${tabName}`).className = 'py-3 px-4 text-zerodha-blue border-b-2 border-zerodha-blue font-semibold';
}

// --- Order Modal Logic ---
let currentOrderAction = 'BUY';

function openOrderModal(action) {
    currentOrderAction = action;
    const modal = document.getElementById('orderModal');
    const header = document.getElementById('order-modal-header');
    const title = document.getElementById('order-modal-title');
    const executeBtn = document.getElementById('order-execute-btn');

    title.innerText = `${action} ${activeStock.symbol} (NSE)`;
    document.getElementById('order-modal-price').innerText = `₹${activeStock.ltp.toFixed(2)}`;
    document.getElementById('order-qty').value = '1';
    document.getElementById('order-margin').innerText = `₹${activeStock.ltp.toFixed(2)}`;

    if (action === 'BUY') {
        header.className = 'px-5 py-3 font-bold text-sm flex justify-between items-center bg-blue-600 text-white';
        executeBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold';
        executeBtn.innerText = 'Execute Buy';
    } else {
        header.className = 'px-5 py-3 font-bold text-sm flex justify-between items-center bg-orange-600 text-white';
        executeBtn.className = 'bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded font-bold';
        executeBtn.innerText = 'Execute Sell';
    }

    modal.classList.remove('hidden');

    // Update margin on qty change
    const qtyInput = document.getElementById('order-qty');
    qtyInput.oninput = (e) => {
        const q = parseInt(e.target.value) || 0;
        const total = q * activeStock.ltp;
        document.getElementById('order-margin').innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

function executeOrder() {
    const qty = parseInt(document.getElementById('order-qty').value) || 1;
    const orderType = document.querySelector('input[name="ordertype"]:checked').value;
    
    const newOrder = {
        id: Math.floor(Math.random() * 900000) + 100000,
        time: new Date().toLocaleTimeString(),
        action: currentOrderAction,
        symbol: activeStock.symbol,
        qty: qty,
        price: activeStock.ltp,
        type: orderType,
        status: 'COMPLETE'
    };

    userOrders.unshift(newOrder);
    document.getElementById('order-count').innerText = userOrders.length;
    renderOrders();

    // If BUY, add or update holdings
    if (currentOrderAction === 'BUY') {
        const existingHolding = userHoldings.find(h => h.symbol === activeStock.symbol);
        if (existingHolding) {
            const totalCost = (existingHolding.qty * existingHolding.avg) + (qty * activeStock.ltp);
            existingHolding.qty += qty;
            existingHolding.avg = totalCost / existingHolding.qty;
        } else {
            userHoldings.push({
                symbol: activeStock.symbol,
                qty: qty,
                avg: activeStock.ltp,
                ltp: activeStock.ltp
            });
        }
        renderHoldings();
    }

    closeOrderModal();
    switchKiteTab('orders');
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    if (userOrders.length === 0) {
        list.innerHTML = `<div class="text-xs text-gray-500 py-4 text-center">No orders placed yet.</div>`;
        return;
    }

    list.innerHTML = '';
    userOrders.forEach(ord => {
        const isBuy = ord.action === 'BUY';
        const badgeColor = isBuy ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300';
        
        const div = document.createElement('div');
        div.className = 'bg-gray-950 p-3 rounded border border-gray-800 flex items-center justify-between text-xs';
        div.innerHTML = `
            <div>
                <div class="flex items-center space-x-2 mb-1">
                    <span class="px-1.5 py-0.5 rounded font-bold text-[10px] ${badgeColor}">${ord.action}</span>
                    <strong class="text-white">${ord.symbol}</strong>
                    <span class="text-gray-400">Qty: ${ord.qty}</span>
                </div>
                <span class="text-[10px] text-gray-500">${ord.type} • Order ID: #${ord.id} • ${ord.time}</span>
            </div>
            <div class="text-right">
                <span class="text-white font-semibold block">₹${ord.price.toFixed(2)}</span>
                <span class="text-green-400 text-[10px] font-medium">COMPLETE</span>
            </div>
        `;
        list.appendChild(div);
    });
}

function clearOrders() {
    userOrders = [];
    document.getElementById('order-count').innerText = '0';
    renderOrders();
}

function renderHoldings() {
    const tbody = document.getElementById('holdings-table-body');
    if (!tbody) return;
    if (userHoldings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No holdings in portfolio.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    userHoldings.forEach(h => {
        // Find current ltp from watchlist
        const foundStock = watchlistData.find(s => s.symbol === h.symbol);
        const currentLtp = foundStock ? foundStock.ltp : h.avg;
        const pnl = (currentLtp - h.avg) * h.qty;
        const pnlPct = ((currentLtp - h.avg) / h.avg) * 100;
        const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
        const sign = pnl >= 0 ? '+' : '';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-950/50';
        tr.innerHTML = `
            <td class="p-2.5 font-bold text-white">${h.symbol}</td>
            <td class="p-2.5">${h.qty}</td>
            <td class="p-2.5">₹${h.avg.toFixed(2)}</td>
            <td class="p-2.5">₹${currentLtp.toFixed(2)}</td>
            <td class="p-2.5 font-semibold ${pnlColor}">${sign}₹${pnl.toFixed(2)} (${sign}${pnlPct.toFixed(2)}%)</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Brokerage Calculator Logic ---
function calculateBrokerage() {
    const type = document.getElementById('calc-type').value;
    const amount = parseFloat(document.getElementById('calc-amount').value) || 0;
    let brokerage = 0;

    if (type === 'intraday' || type === 'fno') {
        brokerage = Math.min(20, amount * 0.0003);
    } else {
        brokerage = 0; // delivery is free
    }

    // Add approx GST & STT charges
    const stt = type === 'delivery' ? amount * 0.001 : (type === 'intraday' ? amount * 0.00025 : amount * 0.0001);
    const gst = brokerage * 0.18;
    const total = brokerage + stt + gst;

    const resultEl = document.getElementById('calc-result');
    resultEl.innerHTML = `Estimated Total Charges: <span class="text-zerodha-blue font-bold">₹${total.toFixed(2)}</span> (Brokerage: ₹${brokerage.toFixed(2)}, STT: ₹${stt.toFixed(2)}, GST: ₹${gst.toFixed(2)})`;
}

// --- Modal Controls (Kite, Signup, Support) ---
function openMockKiteModal() {
    document.getElementById('mockKiteModal').classList.remove('hidden');
}

function closeMockKiteModal() {
    document.getElementById('mockKiteModal').classList.add('hidden');
}

function openSignupModal() {
    document.getElementById('signupModal').classList.remove('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('signup-success').classList.add('hidden');
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.add('hidden');
}

function handleSignup(e) {
    e.preventDefault();
    const phone = document.getElementById('signup-phone').value;
    document.getElementById('display-phone').innerText = `+91 ${phone}`;
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('signup-success').classList.remove('hidden');
}

function openSupportModal() {
    document.getElementById('supportModal').classList.remove('hidden');
}

function closeSupportModal() {
    document.getElementById('supportModal').classList.add('hidden');
}
