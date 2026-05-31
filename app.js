// --- WEDDING APP CORE STATE ---
let STATE = {
  currentUser: null,
  guests: [],
  users: [],
  activeTab: 'dashboard',
  map: null,
  mapMarkers: [],
  routeLine: null
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load initial data
  initDatabase();
  
  // Set clock
  updateClock();
  setInterval(updateClock, 60000);

  // Initialize Lucide icons
  lucide.createIcons();

  // Floating petals animation
  initPetals();

  // Loading Screen Delay
  setTimeout(() => {
    const loader = document.getElementById("loading-screen");
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
      // Check if logged in
      const savedUser = localStorage.getItem("wedding_user");
      if (savedUser) {
        STATE.currentUser = JSON.parse(savedUser);
        document.getElementById("main-app").classList.remove("hidden");
        updateUserDisplay();
        switchTab('dashboard');
      } else {
        document.getElementById("envelope-screen").classList.remove("hidden");
      }
    }, 1000);
  }, 2200);
});

// --- LOCAL DATABASE SETUP ---
function initDatabase() {
  const savedGuests = localStorage.getItem("wedding_guests");
  const savedUsers = localStorage.getItem("wedding_users");

  if (savedGuests !== null) {
    STATE.guests = JSON.parse(savedGuests);
  } else {
    STATE.guests = []; // Start empty by default
    localStorage.setItem("wedding_guests", JSON.stringify(STATE.guests));
  }

  if (savedUsers !== null) {
    STATE.users = JSON.parse(savedUsers);
  } else {
    // Start with only the Admin user
    STATE.users = [{ id: 1, username: "admin", fullName: "Bhanu Prasad (Admin)", role: "Admin" }];
    localStorage.setItem("wedding_users", JSON.stringify(STATE.users));
  }
}

function saveGuestsToLocalStorage() {
  localStorage.setItem("wedding_guests", JSON.stringify(STATE.guests));
}

// --- UTILITIES ---
function updateClock() {
  const now = new Date();
  let hrs = now.getHours().toString().padStart(2, '0');
  let mins = now.getMinutes().toString().padStart(2, '0');
  document.getElementById("clock-display").textContent = `${hrs}:${mins}`;
}

// --- FLOATING PETALS ANIMATION ---
function initPetals() {
  const container = document.getElementById("petals-container");
  const petalCount = 20;
  
  // SVG representations of Jasmine (ivory) and Rose (pinkish crimson) petals
  const petalTypes = [
    // Rose petal path
    "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12,2 C15,6 20,8 19,13 C18,17 14,21 11,21 C7,20 4,16 5,12 C6,8 9,3 12,2 Z' fill='%23C0392B' opacity='0.7'/%3E%3C/svg%3E",
    // Small rose petal path
    "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12,4 C14,8 18,10 17,14 C16,17 13,19 10,19 C7,18 5,15 6,12 C7,9 10,5 12,4 Z' fill='%23E74C3C' opacity='0.85'/%3E%3C/svg%3E",
    // Jasmine petal path (cream/ivory)
    "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12,2 C13.5,6.5 17,8 17,11 C17,14 14,17 11.5,17 C9,17 6.5,14 6.5,11 C6.5,8 10.5,6.5 12,2 Z' fill='%23FAF6EB' opacity='0.9' stroke='%23FAF3C0' stroke-width='0.5'/%3E%3C/svg%3E"
  ];

  for (let i = 0; i < petalCount; i++) {
    createPetal(container, petalTypes);
  }
}

function createPetal(container, types) {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  
  const size = Math.random() * 15 + 10; // 10px to 25px
  const type = types[Math.floor(Math.random() * types.length)];
  
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  petal.style.backgroundImage = `url("${type}")`;
  
  petal.style.left = `${Math.random() * 100}vw`;
  
  // Random animations parameters
  const duration = Math.random() * 8 + 8; // 8s to 16s
  const delay = Math.random() * -15; // Prefill screen
  
  petal.style.animationDuration = `${duration}s`;
  petal.style.animationDelay = `${delay}s`;
  
  container.appendChild(petal);

  // Recalculate horizontal offset when animation ends to prevent repetitive falling paths
  petal.addEventListener('animationiteration', () => {
    petal.style.left = `${Math.random() * 100}vw`;
  });
}

// --- ENVELOPE CONTROLLER ---
function openEnvelope() {
  const wrapper = document.getElementById("wedding-envelope");
  wrapper.classList.add("open");
}

function enterApplication() {
  // Move to Login Screen
  document.getElementById("envelope-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

// --- LOGIN MANAGER ---
function handleLogin(event) {
  event.preventDefault();
  const userIn = document.getElementById("username").value.toLowerCase();
  const passIn = document.getElementById("password").value;

  const matchedUser = STATE.users.find(u => u.username === userIn && passIn === "admin");

  if (matchedUser) {
    STATE.currentUser = matchedUser;
    localStorage.setItem("wedding_user", JSON.stringify(matchedUser));
    
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    
    updateUserDisplay();
    switchTab('dashboard');
  } else {
    const errorEl = document.getElementById("login-error");
    errorEl.classList.remove("hidden");
    setTimeout(() => errorEl.classList.add("hidden"), 4000);
  }
}

function handleLogout() {
  localStorage.removeItem("wedding_user");
  STATE.currentUser = null;
  
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  
  // Reset envelope
  const wrapper = document.getElementById("wedding-envelope");
  wrapper.classList.remove("open");
}

function updateUserDisplay() {
  if (STATE.currentUser) {
    document.getElementById("user-display-name").textContent = STATE.currentUser.fullName;
    document.getElementById("user-display-role").textContent = `${STATE.currentUser.role} Account`;
    
    // Populate distributor dropdowns
    const dropdown = document.getElementById("modal-guest-assigned");
    dropdown.innerHTML = '<option value="">Choose distributor...</option>';
    STATE.users.forEach(u => {
      dropdown.innerHTML += `<option value="${u.fullName}">${u.fullName}</option>`;
    });
  }
}

// --- TAB SWITCHER ---
function switchTab(tabId) {
  STATE.activeTab = tabId;
  
  // Hide all panels
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  
  // Show active panel
  document.getElementById(`panel-${tabId}`).classList.remove("hidden");
  
  // Update nav UI
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("bg-maroon/50", "border-l-2", "border-gold", "text-gold-light");
    b.classList.add("text-cream/70");
  });
  
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove("text-cream/70");
    activeBtn.classList.add("bg-maroon/50", "border-l-2", "border-gold", "text-gold-light");
  }

  // Update header title
  const titles = {
    dashboard: "Auspicious Wedding Dashboard",
    guests: "Wedding Guest Registry & Cards",
    locations: "Location-Grouped Invitations",
    routing: "Distribution Route Planning Maps",
    analytics: "Distribution Progress Analytics",
    exchange: "Excel Data Import / Export"
  };
  document.getElementById("page-title").textContent = titles[tabId] || "Wedding Management Portal";

  // Trigger tab-specific loaders
  if (tabId === 'dashboard') {
    loadDashboardStats();
  } else if (tabId === 'guests') {
    populateCityFilters();
    renderGuestsTable();
  } else if (tabId === 'locations') {
    renderLocationGroups();
  } else if (tabId === 'routing') {
    initRoutingMap();
  } else if (tabId === 'analytics') {
    renderAnalyticsCharts();
  }
  
  // Close mobile sidebar on navigation
  const sidebar = document.querySelector("aside");
  sidebar.classList.remove("mobile-open");
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector("aside");
  sidebar.classList.toggle("-translate-x-full");
  // Toggle desktop layout handling
}

// --- DASHBOARD LOADER ---
function loadDashboardStats() {
  const guests = STATE.guests;
  const totalCards = guests.length;
  const distributed = guests.filter(g => g.status === 'Distributed').length;
  const assigned = guests.filter(g => g.status === 'Assigned').length;
  const pending = guests.filter(g => g.status === 'Pending').length;
  const totalGuests = guests.reduce((sum, g) => sum + (parseInt(g.familyMembers) || 1), 0);
  
  // Get unique areas (city + village combinations)
  const locations = new Set(guests.map(g => `${g.city}-${g.village}`));
  
  // Set counters
  animateCounter("counter-total-cards", totalCards);
  animateCounter("counter-distributed", distributed);
  animateCounter("counter-assigned", assigned);
  animateCounter("counter-pending", pending);
  animateCounter("counter-total-guests", totalGuests);
  animateCounter("counter-total-locations", locations.size);

  // Compute progress
  const progressPerc = totalCards > 0 ? Math.round((distributed / totalCards) * 100) : 0;
  document.getElementById("stat-radial-progress").textContent = `${progressPerc}%`;
  document.getElementById("stat-bar-progress").style.width = `${progressPerc}%`;

  // Distributed today (mock date: matches today's local date or latest dates in dataset)
  // Let's filter cards distributed in the last 2 days for the demo.
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDistributed = guests.filter(g => g.status === 'Distributed' && g.distributedDate);
  document.getElementById("counter-today-count").textContent = `${todayDistributed.length} cards`;

  // Render today's activity log
  const activityList = document.getElementById("dashboard-today-list");
  activityList.innerHTML = "";
  if (todayDistributed.length === 0) {
    activityList.innerHTML = "<div class='text-gray-500 text-xs italic text-center py-6'>No invitations delivered today.</div>";
  } else {
    // Sort by date / time descending
    todayDistributed.sort((a,b) => `${b.distributedDate}T${b.distributedTime}`.localeCompare(`${a.distributedDate}T${a.distributedTime}`));
    
    todayDistributed.forEach(g => {
      activityList.innerHTML += `
        <div class="border-b border-gold-dark/10 py-2.5 flex items-start space-x-2 text-xs">
          <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] mt-0.5">
            ✓
          </div>
          <div class="flex-1">
            <div class="font-semibold text-maroon-dark">${g.name}</div>
            <div class="text-[10px] text-gray-500">${g.village}, ${g.city} • By ${g.assignedTo || 'Distributor'}</div>
            <div class="text-[9px] font-mono mt-0.5 text-emerald-600">${g.distributedDate} ${g.distributedTime || ''}</div>
          </div>
        </div>
      `;
    });
  }

  // Render distributor leaderboard
  const dbTable = document.getElementById("dashboard-distributors-table");
  dbTable.innerHTML = "";
  
  STATE.users.forEach(u => {
    const distCards = guests.filter(g => g.assignedTo === u.fullName);
    const completed = distCards.filter(g => g.status === 'Distributed').length;
    const workPending = distCards.filter(g => g.status === 'Assigned').length;
    
    const totalAssigned = distCards.length;
    const perc = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
    
    dbTable.innerHTML += `
      <tr class="border-b border-gold-dark/10 hover:bg-cream-dark/10">
        <td class="py-2.5 font-semibold text-maroon-dark">${u.fullName}</td>
        <td class="py-2.5 text-gray-600">${u.role}</td>
        <td class="py-2.5 text-center font-bold">${totalAssigned}</td>
        <td class="py-2.5 text-center text-emerald-700 font-bold">${completed}</td>
        <td class="py-2.5 text-center text-amber-700 font-bold">${workPending}</td>
        <td class="py-2.5 text-right font-semibold text-gold-dark">
          <div class="inline-flex items-center space-x-1">
            <span>${perc}%</span>
            <div class="w-10 bg-gray-200 h-1 rounded-full overflow-hidden">
              <div class="bg-gold h-full" style="width: ${perc}%"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
}

function animateCounter(id, targetValue) {
  const el = document.getElementById(id);
  if (!el) return;
  
  let currentVal = 0;
  const speed = 30; // ms per tick
  const step = Math.max(1, Math.floor(targetValue / 15));
  
  clearInterval(el.timer);
  el.timer = setInterval(() => {
    currentVal += step;
    if (currentVal >= targetValue) {
      currentVal = targetValue;
      clearInterval(el.timer);
    }
    el.textContent = currentVal.toLocaleString();
  }, speed);
}

// --- GUEST MANAGEMENT CRUD ---
function populateCityFilters() {
  const cities = [...new Set(STATE.guests.map(g => g.city))];
  const filter = document.getElementById("guest-city-filter");
  filter.innerHTML = '<option value="ALL">All Cities</option>';
  cities.forEach(c => {
    filter.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function renderGuestsTable() {
  const query = document.getElementById("guest-search-input").value.toLowerCase();
  const status = document.getElementById("guest-status-filter").value;
  const city = document.getElementById("guest-city-filter").value;
  const tableBody = document.getElementById("guests-table-body");
  
  tableBody.innerHTML = "";
  
  // Apply fuzzy searching & dropdown filters
  const filtered = STATE.guests.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(query) ||
      g.mobile.includes(query) ||
      (g.village && g.village.toLowerCase().includes(query)) ||
      g.city.toLowerCase().includes(query) ||
      (g.remarks && g.remarks.toLowerCase().includes(query));
      
    const matchesStatus = (status === 'ALL' || g.status === status);
    const matchesCity = (city === 'ALL' || g.city === city);
    
    return matchesSearch && matchesStatus && matchesCity;
  });

  document.getElementById("filtered-guest-count").textContent = filtered.length;
  
  if (filtered.length === 0) {
    document.getElementById("guests-empty-state").classList.remove("hidden");
    return;
  }
  document.getElementById("guests-empty-state").classList.add("hidden");

  filtered.forEach(g => {
    let badgeClass = "bg-red-50 text-red-700 border border-red-200";
    if (g.status === 'Assigned') badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";
    if (g.status === 'Distributed') badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";

    const googleMapsUrl = g.latitude && g.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${g.latitude},${g.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.fullAddress)}`;

    // Build WhatsApp message
    const msg = `Namaskaram! 🌸\nWe cordially invite you to the wedding ceremony of SIVARAMA & LAKSHMI on August 27, 2026.\n\nInvitation details for: *${g.name}*\nFamily Members: ${g.familyMembers}\nAddress: ${g.fullAddress}\nInvitation Card Status: ${g.status}\n\nWe look forward to seeking your blessings!\nLocate Venue: https://maps.app.goo.gl/MConventionVijayawada`;
    const waUrl = `https://api.whatsapp.com/send?phone=91${g.mobile}&text=${encodeURIComponent(msg)}`;

    tableBody.innerHTML += `
      <tr class="border-b border-gold-dark/10 hover:bg-cream-dark/10 transition-colors">
        <td class="p-3 pl-4">
          <div class="font-bold text-maroon-dark">${g.name}</div>
          <div class="text-[10px] text-gray-500">${g.notes || 'No special notes'}</div>
        </td>
        <td class="p-3">
          <div class="font-semibold">${g.mobile}</div>
          <div class="flex items-center space-x-1.5 mt-1">
            <a href="${waUrl}" target="_blank" class="text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5" title="WhatsApp Invite">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>Invite</span>
            </a>
            <span class="text-gray-300">|</span>
            <button onclick="showQRCode('${g.id}')" class="text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5" title="QR Code">
              <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
              <span>QR</span>
            </button>
          </div>
        </td>
        <td class="p-3 text-center font-bold text-maroon">${g.familyMembers}</td>
        <td class="p-3">
          <div class="font-semibold text-[#553311]">${g.village}, ${g.city}</div>
          <a href="${googleMapsUrl}" target="_blank" class="text-blue-600 hover:text-blue-700 flex items-center space-x-0.5 mt-0.5">
            <i data-lucide="map-pin" class="w-3 h-3"></i>
            <span>Google Maps</span>
          </a>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">
            ${g.status}
          </span>
        </td>
        <td class="p-3">
          <div class="font-semibold text-gray-700">${g.assignedTo || 'Unassigned'}</div>
          <div class="text-[9px] text-gray-500 max-w-[150px] truncate">${g.remarks || '-'}</div>
        </td>
        <td class="p-3 text-right pr-4">
          <div class="inline-flex space-x-1">
            <button onclick="openEditGuestModal('${g.id}')" class="p-1 border border-gold-dark/40 rounded text-gold-dark hover:bg-gold/10" title="Edit Guest">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="deleteGuest('${g.id}')" class="p-1 border border-red-200 rounded text-red-600 hover:bg-red-50" title="Delete Guest">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  lucide.createIcons();
}

function handleGuestSearch() {
  renderGuestsTable();
}

// --- ADD/EDIT MODAL CONTROL ---
function openAddGuestModal() {
  document.getElementById("modal-title").textContent = "Add Auspicious Guest";
  document.getElementById("guest-form").reset();
  document.getElementById("modal-guest-id").value = "";
  
  // Default coordinate generators (can simulate Hyderabad center)
  document.getElementById("modal-guest-lat").value = 17.4325 + (Math.random() - 0.5) * 0.1;
  document.getElementById("modal-guest-lng").value = 78.4074 + (Math.random() - 0.5) * 0.1;

  toggleModalFields();
  document.getElementById("guest-modal").classList.remove("hidden");
}

function openEditGuestModal(guestId) {
  const g = STATE.guests.find(x => x.id == guestId);
  if (!g) return;

  document.getElementById("modal-title").textContent = "Edit Guest Details";
  document.getElementById("modal-guest-id").value = g.id;
  document.getElementById("modal-guest-name").value = g.name;
  document.getElementById("modal-guest-mobile").value = g.mobile;
  document.getElementById("modal-guest-family").value = g.familyMembers;
  document.getElementById("modal-guest-village").value = g.village || "";
  document.getElementById("modal-guest-city").value = g.city;
  document.getElementById("modal-guest-state").value = g.state || "Andhra Pradesh";
  document.getElementById("modal-guest-status").value = g.status;
  document.getElementById("modal-guest-address").value = g.fullAddress;
  document.getElementById("modal-guest-lat").value = g.latitude || "";
  document.getElementById("modal-guest-lng").value = g.longitude || "";
  document.getElementById("modal-guest-assigned").value = g.assignedTo || "";
  document.getElementById("modal-guest-remarks").value = g.remarks || "";
  document.getElementById("modal-guest-notes").value = g.notes || "";

  toggleModalFields();
  document.getElementById("guest-modal").classList.remove("hidden");
}

function toggleModalFields() {
  const status = document.getElementById("modal-guest-status").value;
  const assignField = document.getElementById("modal-field-assigned-to");
  const remarksField = document.getElementById("modal-field-remarks");

  if (status === 'Pending') {
    assignField.classList.add("hidden");
    remarksField.classList.add("hidden");
  } else if (status === 'Assigned') {
    assignField.classList.remove("hidden");
    remarksField.classList.add("hidden");
  } else if (status === 'Distributed') {
    assignField.classList.remove("hidden");
    remarksField.classList.remove("hidden");
  }
}

function closeGuestModal() {
  document.getElementById("guest-modal").classList.add("hidden");
}

function saveGuestForm(event) {
  event.preventDefault();
  
  const id = document.getElementById("modal-guest-id").value;
  const name = document.getElementById("modal-guest-name").value.trim();
  const mobile = document.getElementById("modal-guest-mobile").value.trim();
  const family = parseInt(document.getElementById("modal-guest-family").value) || 1;
  const village = document.getElementById("modal-guest-village").value.trim();
  const city = document.getElementById("modal-guest-city").value.trim();
  const state = document.getElementById("modal-guest-state").value.trim();
  const status = document.getElementById("modal-guest-status").value;
  const address = document.getElementById("modal-guest-address").value.trim();
  const lat = parseFloat(document.getElementById("modal-guest-lat").value) || null;
  const lng = parseFloat(document.getElementById("modal-guest-lng").value) || null;
  const assigned = document.getElementById("modal-guest-assigned").value;
  const remarks = document.getElementById("modal-guest-remarks").value.trim();
  const notes = document.getElementById("modal-guest-notes").value.trim();

  if (!name || !mobile || !city || !address) {
    alert("Please fill in all required fields marked with *");
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

  if (id) {
    // Edit Mode
    const g = STATE.guests.find(x => x.id == id);
    if (g) {
      g.name = name;
      g.mobile = mobile;
      g.familyMembers = family;
      g.village = village;
      g.city = city;
      g.state = state;
      
      // Update distribution timelines
      if (status === 'Distributed' && g.status !== 'Distributed') {
        g.distributedDate = todayStr;
        g.distributedTime = timeStr;
      } else if (status !== 'Distributed') {
        g.distributedDate = null;
        g.distributedTime = null;
      }
      
      g.status = status;
      g.fullAddress = address;
      g.latitude = lat;
      g.longitude = lng;
      g.assignedTo = assigned || null;
      g.remarks = remarks;
      g.notes = notes;
    }
  } else {
    // Add Mode
    const newGuest = {
      id: Date.now(),
      name,
      mobile,
      familyMembers: family,
      village,
      city,
      state,
      status,
      fullAddress: address,
      latitude: lat,
      longitude: lng,
      assignedTo: assigned || null,
      distributedDate: status === 'Distributed' ? todayStr : null,
      distributedTime: status === 'Distributed' ? timeStr : null,
      remarks: remarks,
      notes: notes
    };
    STATE.guests.push(newGuest);
  }

  saveGuestsToLocalStorage();
  closeGuestModal();
  
  if (STATE.activeTab === 'guests') {
    populateCityFilters();
    renderGuestsTable();
  } else {
    switchTab('guests');
  }
}

function deleteGuest(guestId) {
  if (confirm("Are you sure you want to remove this guest from the wedding registry?")) {
    STATE.guests = STATE.guests.filter(x => x.id != guestId);
    saveGuestsToLocalStorage();
    renderGuestsTable();
  }
}

function showQRCode(guestId) {
  const g = STATE.guests.find(x => x.id == guestId);
  if (!g) return;
  alert(`Digital Registry QR Code (UUID: ${g.id})\nDistributors can scan this code to confirm invitation receipt.`);
}

// --- LOCATION ACCORDION GROUPER ---
function renderLocationGroups() {
  const container = document.getElementById("location-clusters-accordion");
  container.innerHTML = "";

  // Group by City
  const cities = [...new Set(STATE.guests.map(g => g.city))];
  
  if (cities.length === 0) {
    container.innerHTML = "<div class='text-gray-500 italic text-center py-6'>No locations stored in registry.</div>";
    return;
  }

  cities.forEach(city => {
    const cityGuests = STATE.guests.filter(g => g.city === city);
    const cityCount = cityGuests.length;
    const cityDelivered = cityGuests.filter(g => g.status === 'Distributed').length;

    // Group within city by Village/Area
    const villages = [...new Set(cityGuests.map(g => g.village || "Unknown Area"))];
    
    let villageAccordionHtml = "";
    
    villages.forEach(village => {
      const vilGuests = cityGuests.filter(g => (g.village || "Unknown Area") === village);
      const vilCount = vilGuests.length;
      
      let guestListHtml = "";
      vilGuests.forEach(g => {
        let statusColor = "text-red-600";
        if (g.status === 'Assigned') statusColor = "text-amber-600";
        if (g.status === 'Distributed') statusColor = "text-emerald-600 font-bold";

        guestListHtml += `
          <div class="pl-4 py-2 border-b border-gold-dark/5 flex items-center justify-between text-xs hover:bg-cream-light/60">
            <div>
              <span class="font-semibold text-maroon-dark">${g.name}</span>
              <span class="text-gray-500 text-[10px] ml-2">(${g.familyMembers} members)</span>
              <div class="text-[10px] text-gray-500 mt-0.5">${g.fullAddress}</div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="${statusColor} text-[10px] uppercase font-semibold">${g.status}</span>
              <button onclick="quickDistribute(${g.id})" class="text-gold-dark hover:text-gold border border-gold-dark/40 px-2 py-0.5 rounded text-[10px] bg-cream/50" ${g.status === 'Distributed' ? 'disabled style="opacity: 0.5"' : ''}>
                Delivered
              </button>
            </div>
          </div>
        `;
      });

      const vilId = `vil-${city.replace(/\s+/g, '')}-${village.replace(/\s+/g, '')}`;

      villageAccordionHtml += `
        <div class="border border-gold-dark/20 rounded bg-cream/40 overflow-hidden mb-2">
          <button onclick="toggleAccordion('${vilId}')" class="w-full flex items-center justify-between p-3 font-semibold text-xs text-maroon hover:bg-cream-dark/25 text-left">
            <span class="flex items-center">
              <i data-lucide="chevron-right" class="w-4 h-4 mr-2 transition-transform transform" id="icon-${vilId}"></i>
              ${village}
            </span>
            <span class="bg-gold/20 text-gold-dark font-bold px-2 py-0.5 rounded-full text-[10px]">
              ${vilCount} guests
            </span>
          </button>
          <div id="${vilId}" class="hidden bg-cream-light p-2 border-t border-gold-dark/10 space-y-1">
            ${guestListHtml}
          </div>
        </div>
      `;
    });

    const cityId = `city-${city.replace(/\s+/g, '')}`;

    container.innerHTML += `
      <div class="bg-cream-light border border-gold-foil/30 rounded-lg shadow overflow-hidden">
        <button onclick="toggleAccordion('${cityId}')" class="w-full flex items-center justify-between p-4 font-cinzel font-bold text-sm text-maroon-dark bg-maroon/5 hover:bg-maroon/10 text-left">
          <span class="flex items-center">
            <i data-lucide="chevron-right" class="w-4.5 h-4.5 mr-2 transition-transform transform" id="icon-${cityId}"></i>
            ${city.toUpperCase()}
          </span>
          <span class="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
            ${cityDelivered} / ${cityCount} Cards Done
          </span>
        </button>
        <div id="${cityId}" class="hidden p-4 border-t border-gold-dark/20 space-y-2">
          ${villageAccordionHtml}
        </div>
      </div>
    `;
  });
  lucide.createIcons();
}

function toggleAccordion(id) {
  const panel = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);
  
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
    if (icon) icon.classList.add("rotate-90");
  } else {
    panel.classList.add("hidden");
    if (icon) icon.classList.remove("rotate-90");
  }
}

function quickDistribute(guestId) {
  const g = STATE.guests.find(x => x.id == guestId);
  if (g) {
    g.status = 'Distributed';
    g.distributedDate = new Date().toISOString().split('T')[0];
    g.distributedTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    g.remarks = "Marked delivered from Location Groups view.";
    saveGuestsToLocalStorage();
    renderLocationGroups();
  }
}

// --- ROUTE PLANNING MAPS MANAGER (LEAFLET) ---
function initRoutingMap() {
  if (STATE.map) {
    STATE.map.remove();
    STATE.map = null;
  }

  // Find center of coordinates
  let centerLat = 16.5062; // Vijayawada center fallback
  let centerLng = 80.6480;

  // Let's populate the Area selector
  populateAreaSelector();

  STATE.map = L.map('routing-map').setView([centerLat, centerLng], 12);

  // Faint vintage styles using Leaflet tile providers (OpenStreetMap fallback with grayscale tiles for premium vintage look)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(STATE.map);

  loadAreaOnMap();
}

function populateAreaSelector() {
  const areas = [];
  const selector = document.getElementById("route-area-selector");
  
  STATE.guests.forEach(g => {
    const key = `${g.city} - ${g.village || 'General'}`;
    if (!areas.includes(key)) areas.push(key);
  });

  selector.innerHTML = "";
  areas.forEach(area => {
    selector.innerHTML += `<option value="${area}">${area}</option>`;
  });
}

function loadAreaOnMap() {
  if (!STATE.map) return;

  // Clear markers
  STATE.mapMarkers.forEach(marker => STATE.map.removeLayer(marker));
  STATE.mapMarkers = [];
  
  if (STATE.routeLine) {
    STATE.map.removeLayer(STATE.routeLine);
    STATE.routeLine = null;
  }

  const selectedAreaStr = document.getElementById("route-area-selector").value;
  if (!selectedAreaStr) return;

  const [city, village] = selectedAreaStr.split(" - ");
  const statusFilter = document.getElementById("route-status-selector").value;

  // Get matching guests
  const areaGuests = STATE.guests.filter(g => {
    const matchesArea = g.city === city && (g.village || 'General') === village;
    if (!matchesArea) return false;
    
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NOT_DISTRIBUTED') return g.status !== 'Distributed';
    return g.status === 'Distributed';
  });

  // Calculate statistics
  document.getElementById("route-stat-guests").textContent = areaGuests.length;
  const famCount = areaGuests.reduce((s, g) => s + (g.familyMembers || 1), 0);
  document.getElementById("route-stat-family").textContent = famCount;
  document.getElementById("route-stat-distance").textContent = "0.0 km";

  if (areaGuests.length === 0) return;

  // Render markers
  const bounds = [];
  
  areaGuests.forEach(g => {
    if (!g.latitude || !g.longitude) return;

    bounds.push([g.latitude, g.longitude]);

    // Choose marker color
    let markerColor = "red";
    if (g.status === 'Assigned') markerColor = "orange";
    if (g.status === 'Distributed') markerColor = "green";

    // Setup custom icon using SVG markup for gold vintage style pins
    const pinSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.03 0 3 4.03 3 9C3 14.25 12 24 12 24C12 24 21 14.25 21 9C21 4.03 16.97 0 12 0ZM12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12Z" fill="${markerColor === 'red' ? '#DC2626' : markerColor === 'orange' ? '#D97706' : '#059669'}" stroke="#D4AF37" stroke-width="1.5"/>
      </svg>
    `;

    const customIcon = L.divIcon({
      html: pinSVG,
      className: 'custom-leaflet-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });

    const marker = L.marker([g.latitude, g.longitude], { icon: customIcon }).addTo(STATE.map);
    
    // Popup template
    const popupContent = `
      <div class="p-2 text-xs font-montserrat space-y-1.5" style="min-width: 180px;">
        <div class="font-bold text-maroon-dark text-sm border-b border-gold/30 pb-1">${g.name}</div>
        <div><b>Mobile:</b> ${g.mobile}</div>
        <div><b>Address:</b> ${g.fullAddress}</div>
        <div><b>Status:</b> <span class="font-semibold text-maroon">${g.status}</span></div>
        ${g.status !== 'Distributed' ? `
          <button onclick="markAsDistributedOnMap(${g.id})" class="w-full btn-gold py-1.5 rounded mt-2 text-[10px] font-semibold text-center uppercase tracking-wider">
            Delivered Just Now
          </button>
        ` : `<div class='text-emerald-700 font-bold text-[10px] mt-1'>✓ Invitation Delivered</div>`}
      </div>
    `;

    marker.bindPopup(popupContent, { className: 'leaflet-gold-popup' });
    STATE.mapMarkers.push(marker);
  });

  if (bounds.length > 0) {
    STATE.map.fitBounds(bounds, { padding: [40, 40] });
  }
}

function markAsDistributedOnMap(guestId) {
  const g = STATE.guests.find(x => x.id == guestId);
  if (g) {
    g.status = 'Distributed';
    g.distributedDate = new Date().toISOString().split('T')[0];
    g.distributedTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    g.remarks = "Delivered via map pin action.";
    saveGuestsToLocalStorage();
    
    // Refresh map state
    loadAreaOnMap();
  }
}

// Travelling Salesperson (Nearest Neighbor heuristic routing)
function generateOptimizedRoute() {
  if (STATE.mapMarkers.length <= 1) {
    alert("Need at least 2 coordinate points in the area to optimize route.");
    return;
  }

  const selectedAreaStr = document.getElementById("route-area-selector").value;
  const [city, village] = selectedAreaStr.split(" - ");
  const statusFilter = document.getElementById("route-status-selector").value;

  const areaGuests = STATE.guests.filter(g => {
    const matchesArea = g.city === city && (g.village || 'General') === village;
    if (!matchesArea) return false;
    
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NOT_DISTRIBUTED') return g.status !== 'Distributed';
    return g.status === 'Distributed';
  }).filter(g => g.latitude && g.longitude);

  if (areaGuests.length <= 1) return;

  // Core nearest-neighbor heuristic
  const unvisited = [...areaGuests];
  const route = [];
  
  // Start at centroid
  let current = unvisited.shift();
  route.push(current);

  while (unvisited.length > 0) {
    let bestIndex = 0;
    let bestDist = calculateDistance(current.latitude, current.longitude, unvisited[0].latitude, unvisited[0].longitude);

    for (let i = 1; i < unvisited.length; i++) {
      let d = calculateDistance(current.latitude, current.longitude, unvisited[i].latitude, unvisited[i].longitude);
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    
    current = unvisited.splice(bestIndex, 1)[0];
    route.push(current);
  }

  // Draw Route Polyline
  if (STATE.routeLine) {
    STATE.map.removeLayer(STATE.routeLine);
  }

  const latlngs = route.map(r => [r.latitude, r.longitude]);
  STATE.routeLine = L.polyline(latlngs, {
    color: '#AA7C11',
    weight: 4,
    opacity: 0.85,
    dashArray: '10, 8',
    lineJoin: 'round'
  }).addTo(STATE.map);

  // Compute total travel distance
  let totalKm = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalKm += calculateDistance(route[i].latitude, route[i].longitude, route[i+1].latitude, route[i+1].longitude);
  }

  document.getElementById("route-stat-distance").textContent = `${totalKm.toFixed(2)} km`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// --- ANALYTICS CHARTS (CHART.JS) ---
let cityChartInstance = null;
let shareChartInstance = null;
let dailyChartInstance = null;

function renderAnalyticsCharts() {
  const guests = STATE.guests;
  
  // Calculate Dashboard counters
  const total = guests.length;
  const distributed = guests.filter(g => g.status === 'Distributed').length;
  const remaining = total - distributed;
  const progress = total > 0 ? Math.round((distributed / total) * 100) : 0;

  document.getElementById("analytics-perc").textContent = `${progress}%`;
  document.getElementById("analytics-bar").style.width = `${progress}%`;
  document.getElementById("analytics-total").textContent = total;
  document.getElementById("analytics-dist").textContent = distributed;
  document.getElementById("analytics-rem").textContent = remaining;

  // Chart 1: City-wise Distribution Rate
  const cities = [...new Set(guests.map(g => g.city))];
  const cityTotals = cities.map(c => guests.filter(g => g.city === c).length);
  const cityDelivered = cities.map(c => guests.filter(g => g.city === c && g.status === 'Distributed').length);

  if (cityChartInstance) cityChartInstance.destroy();
  const ctxCity = document.getElementById("chart-city-distribution").getContext("2d");
  cityChartInstance = new Chart(ctxCity, {
    type: 'bar',
    data: {
      labels: cities,
      datasets: [
        {
          label: 'Total Cards Printed',
          data: cityTotals,
          backgroundColor: '#E6DEC9',
          borderColor: '#8C6615',
          borderWidth: 1
        },
        {
          label: 'Distributed Cards',
          data: cityDelivered,
          backgroundColor: '#4E141B',
          borderColor: '#2A080C',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(212,175,55,0.1)' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { labels: { font: { family: 'Montserrat' } } }
      }
    }
  });

  // Chart 2: Status Share Pie
  const statusValues = ['Pending', 'Assigned', 'Distributed'];
  const statusCounts = statusValues.map(s => guests.filter(g => g.status === s).length);

  if (shareChartInstance) shareChartInstance.destroy();
  const ctxShare = document.getElementById("chart-status-share").getContext("2d");
  shareChartInstance = new Chart(ctxShare, {
    type: 'doughnut',
    data: {
      labels: statusValues,
      datasets: [{
        data: statusCounts,
        backgroundColor: ['#70222B', '#D97706', '#059669'],
        borderColor: '#FAF6EB',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Montserrat' } } }
      }
    }
  });

  // Chart 3: Daily Activity
  // Get date range (last 7 days)
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const dailyActivity = dates.map(dt => {
    return guests.filter(g => g.status === 'Distributed' && g.distributedDate === dt).length;
  });

  if (dailyChartInstance) dailyChartInstance.destroy();
  const ctxDaily = document.getElementById("chart-daily-activity").getContext("2d");
  dailyChartInstance = new Chart(ctxDaily, {
    type: 'line',
    data: {
      labels: dates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`; // DD/MM
      }),
      datasets: [{
        label: 'Invitations Delivered',
        data: dailyActivity,
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: '#4E141B',
        pointBorderColor: '#D4AF37'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(212,175,55,0.1)' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { labels: { font: { family: 'Montserrat' } } }
      }
    }
  });
}

// --- DATA IMPORT & EXPORT (SHEETJS) ---
function triggerFileInput() {
  document.getElementById("excel-file-input").click();
}

function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      let importedCount = 0;
      rows.forEach(row => {
        // Map excel columns to database fields
        const name = row.Name || row['Guest Name'] || row.GuestName;
        const mobile = row.Mobile || row['Mobile Number'] || row.Phone;
        const family = parseInt(row.FamilyCount || row.Family || row['Family Members Count']) || 1;
        const village = row.Village || row.Area || row['Village / Area'] || 'General';
        const city = row.City || row.Town || 'Hyderabad';
        const address = row.Address || row['Full Address'] || 'Andhra Pradesh';
        const notes = row.Notes || row.SpecialNotes || '';

        if (name && mobile) {
          // Check if guest already exists
          const exists = STATE.guests.find(g => g.mobile === String(mobile));
          if (!exists) {
            // Estimate default coordinates
            const lat = 16.5062 + (Math.random() - 0.5) * 0.1;
            const lng = 80.6480 + (Math.random() - 0.5) * 0.1;

            STATE.guests.push({
              id: Date.now() + Math.floor(Math.random()*1000),
              name: String(name),
              mobile: String(mobile),
              familyMembers: family,
              village: String(village),
              city: String(city),
              state: row.State || 'Andhra Pradesh',
              status: 'Pending',
              fullAddress: String(address),
              latitude: lat,
              longitude: lng,
              notes: String(notes),
              assignedTo: null,
              distributedDate: null,
              distributedTime: null,
              remarks: ""
            });
            importedCount++;
          }
        }
      });

      if (importedCount > 0) {
        saveGuestsToLocalStorage();
        document.getElementById("import-status-msg").textContent = `✓ Successfully imported ${importedCount} new guests to registry!`;
        document.getElementById("import-status-msg").className = "text-xs font-semibold text-center italic text-emerald-600";
        
        // Refresh local lists
        setTimeout(() => {
          switchTab('guests');
        }, 1500);
      } else {
        document.getElementById("import-status-msg").textContent = "No new unique guest records found (matched by mobile number).";
        document.getElementById("import-status-msg").className = "text-xs font-semibold text-center italic text-amber-600";
      }

    } catch (err) {
      console.error(err);
      alert("Error reading Excel sheet. Ensure layout matches the instruction schema.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function exportGuestList(statusFilter) {
  const exportData = STATE.guests
    .filter(g => statusFilter === 'ALL' || g.status === statusFilter)
    .map(g => ({
      'Guest Name': g.name,
      'Mobile Number': g.mobile,
      'Family Members': g.familyMembers,
      'Village / Area': g.village,
      'City': g.city,
      'Full Address': g.fullAddress,
      'Invitation Status': g.status,
      'Assigned Distributor': g.assignedTo || 'Unassigned',
      'Delivery Date': g.distributedDate || '',
      'Delivery Time': g.distributedTime || '',
      'Remarks / Delivery Notes': g.remarks || '',
      'Notes': g.notes || ''
    }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wedding Guests');
  
  // Style headers & width auto-fit (Basic SheetJS setup)
  const filename = `Wedding_Guests_${statusFilter === 'ALL' ? 'Registry' : 'Distributed'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

function wipeDatabase() {
  if (confirm("WARNING: Are you sure you want to delete all guest and user records? This will remove all dummy distributors and sample data, leaving only your Admin account.")) {
    localStorage.removeItem("wedding_guests");
    localStorage.removeItem("wedding_users");
    
    alert("Registry and distributor accounts wiped successfully! Reloading...");
    location.reload();
  }
}

function reloadDummyData() {
  if (confirm("Are you sure you want to reload the default Telugu dummy data? This will overwrite your current database.")) {
    STATE.guests = INITIAL_GUESTS;
    saveGuestsToLocalStorage();
    
    STATE.users = INITIAL_USERS;
    localStorage.setItem("wedding_users", JSON.stringify(STATE.users));
    
    updateUserDisplay();
    alert("Sample dummy data reloaded!");
    
    // Reset filters
    const statusF = document.getElementById("guest-status-filter");
    const cityF = document.getElementById("guest-city-filter");
    if (statusF) statusF.value = "ALL";
    if (cityF) cityF.value = "ALL";

    switchTab('dashboard');
  }
}

