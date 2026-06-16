// Game Configuration & Modes
const GameModes = [
    { name: "Number (1-100)", maxValue: 100, bits: 7, isAlpha: false, icon: "🔢", description: "Think of a number between 1 and 100." },
    { name: "Alphabet (A-Z)", maxValue: 26, bits: 5, isAlpha: true, icon: "🔤", description: "Choose a letter from A to Z." },
    { name: "Age", maxValue: 100, bits: 7, isAlpha: false, icon: "🎂", description: "Select an age between 1 and 100." },
    { name: "Birthday Date", maxValue: 31, bits: 5, isAlpha: false, icon: "📅", description: "Pick a day of the month (1-31)." },
    { name: "Birth Month", maxValue: 12, bits: 4, isAlpha: false, icon: "🌙", description: "Choose a birth month number (1-12)." },
    { name: "Crush Initial", maxValue: 26, bits: 5, isAlpha: true, icon: "💌", description: "Think of the first letter of your crush's name." }
];

const Months = ["", "January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];

// Application State
let state = {
    playerName: "Anonymous",
    currentMode: null,
    currentBitIndex: 0,
    accumulatedSum: 0,
    isMystery: false
};

// DOM Elements
const views = {
    landing: document.getElementById("view-landing"),
    dashboard: document.getElementById("view-dashboard"),
    game: document.getElementById("view-game"),
    scanning: document.getElementById("view-scanning"),
    result: document.getElementById("view-result"),
    zodiac: document.getElementById("view-zodiac"),
    history: document.getElementById("view-history")
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    // Event Listeners
    document.getElementById("btn-start").addEventListener("click", startApp);
    document.getElementById("name-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") startApp();
    });
    
    document.getElementById("btn-yes").addEventListener("click", () => submitChoice(true));
    document.getElementById("btn-no").addEventListener("click", () => submitChoice(false));
    
    document.getElementById("btn-restart").addEventListener("click", () => showView("dashboard"));
    document.getElementById("btn-result-right").addEventListener("click", () => logFeedback(true));
    document.getElementById("btn-result-wrong").addEventListener("click", () => logFeedback(false));
    
    document.getElementById("btn-zodiac-back").addEventListener("click", () => showView("dashboard"));
    document.getElementById("btn-calculate-zodiac").addEventListener("click", calculateZodiac);
    
    document.getElementById("btn-history-back").addEventListener("click", () => showView("dashboard"));
    document.getElementById("btn-clear-history").addEventListener("click", clearHistory);

    // Build Dashboard Game Cards
    buildDashboardGrid();
});

// Navigation helper
function showView(viewName) {
    Object.keys(views).forEach(key => {
        views[key].classList.remove("active");
    });
    views[viewName].classList.add("active");
    
    if (viewName === "dashboard") {
        document.getElementById("dashboard-welcome").textContent = `Welcome, ${state.playerName}! ✨`;
    }
}

// Landing View Action
function startApp() {
    const input = document.getElementById("name-input").value.trim();
    state.playerName = input ? input.toUpperCase() : "ANONYMOUS";
    showView("dashboard");
}

// Dashboard Grid Builder
function buildDashboardGrid() {
    const grid = document.getElementById("dashboard-grid");
    grid.innerHTML = "";
    
    GameModes.forEach((mode, index) => {
        const card = document.createElement("div");
        card.className = "mode-card";
        card.innerHTML = `
            <div class="mode-icon">${mode.icon}</div>
            <div class="mode-title">${mode.name}</div>
        `;
        card.addEventListener("click", () => startGame(index));
        grid.appendChild(card);
    });

    // Mystery Mode Button
    const mysteryBtn = document.createElement("div");
    mysteryBtn.className = "btn-mystery";
    mysteryBtn.innerHTML = `
        <span class="mode-icon">🔮</span>
        <div>
            <div style="font-size: 1.15rem;">Mystery Mode</div>
            <div style="font-size: 0.85rem; font-weight: 400; opacity: 0.8; margin-top: 3px;">Let the universe pick a surprise mode for you</div>
        </div>
    `;
    mysteryBtn.addEventListener("click", () => {
        const randomIdx = Math.floor(Math.random() * GameModes.length);
        startGame(randomIdx, true);
    });
    grid.appendChild(mysteryBtn);

    // Add Zodiac Card
    const zodiacBtn = document.getElementById("btn-goto-zodiac");
    zodiacBtn.addEventListener("click", () => showView("zodiac"));

    // Add History Card
    const historyBtn = document.getElementById("btn-goto-history");
    historyBtn.addEventListener("click", () => {
        renderHistory();
        showView("history");
    });
}

// Game Play Actions
function startGame(modeIndex, isMystery = false) {
    state.currentMode = GameModes[modeIndex];
    state.currentBitIndex = 0;
    state.accumulatedSum = 0;
    state.isMystery = isMystery;

    // Display Number Grid Preview only if the mode is "Number" or "Age"
    const isNumGrid = state.currentMode.name.includes("Number") || state.currentMode.name === "Age";
    const gridPreview = document.getElementById("number-grid-preview");
    if (isNumGrid) {
        gridPreview.style.display = "block";
        const gridContent = document.getElementById("preview-grid-content");
        gridContent.innerHTML = "";
        for (let i = 1; i <= 100; i++) {
            const span = document.createElement("span");
            span.className = "grid-num";
            span.textContent = i;
            gridContent.appendChild(span);
        }
    } else {
        gridPreview.style.display = "none";
    }

    document.getElementById("game-instruction").textContent = state.currentMode.description;
    
    loadCard(0);
    showView("game");
}

function loadCard(bitIndex) {
    state.currentBitIndex = bitIndex;
    
    // Set progress bar
    const progressPercent = (bitIndex / state.currentMode.bits) * 100;
    document.getElementById("progress-fill").style.width = `${progressPercent}%`;
    document.getElementById("progress-text").textContent = `Card ${bitIndex + 1} of ${state.currentMode.bits}`;

    // Fill Magic Card Elements
    const elementsContainer = document.getElementById("card-elements-content");
    elementsContainer.innerHTML = "";
    
    const elements = [];
    for (let num = 1; num <= state.currentMode.maxValue; num++) {
        if (num & (1 << bitIndex)) {
            let displayVal = "";
            if (state.currentMode.isAlpha) {
                displayVal = String.fromCharCode(65 + num - 1);
            } else {
                displayVal = num;
            }
            elements.push(displayVal);
        }
    }

    elements.forEach(val => {
        const item = document.createElement("span");
        item.className = "card-item";
        item.textContent = val;
        elementsContainer.appendChild(item);
    });

    // Animate Card load
    const magicCard = document.querySelector(".magic-card");
    magicCard.style.transform = "rotateY(10deg) scale(0.98)";
    setTimeout(() => {
        magicCard.style.transform = "rotateY(0deg) scale(1)";
    }, 150);
}

function submitChoice(isSelected) {
    if (isSelected) {
        state.accumulatedSum += (1 << state.currentBitIndex);
    }
    
    const nextBitIndex = state.currentBitIndex + 1;
    if (nextBitIndex < state.currentMode.bits) {
        loadCard(nextBitIndex);
    } else {
        // All cards shown - process mind reading simulation
        startScanning();
    }
}

// Scanning Transition
function startScanning() {
    showView("scanning");
    
    const statusText = document.getElementById("scanning-status");
    const statuses = [
        "Aligning cosmic frequencies...",
        "Scanning synaptic outputs...",
        "Reading memory registers...",
        "Decoding binary coordinates...",
        "Unveiling your thoughts..."
    ];
    
    let statusIdx = 0;
    statusText.textContent = statuses[statusIdx];
    
    const statusInterval = setInterval(() => {
        statusIdx++;
        if (statusIdx < statuses.length) {
            statusText.textContent = statuses[statusIdx];
        }
    }, 450);

    setTimeout(() => {
        clearInterval(statusInterval);
        revealGuess();
    }, 2200);
}

// Result View Actions
function revealGuess() {
    const finalSum = state.accumulatedSum;
    const resultTitle = document.getElementById("result-mode-title");
    const resultValEl = document.getElementById("result-val");
    const resultSubtext = document.getElementById("result-subtext");
    const feedbackBox = document.getElementById("feedback-box");
    const saveSuccessEl = document.getElementById("save-success");

    feedbackBox.style.display = "flex";
    saveSuccessEl.style.display = "none";
    
    const displayName = state.isMystery ? `${state.currentMode.name} (Mystery)` : state.currentMode.name;
    resultTitle.textContent = displayName;

    let displayVal = "";
    let isValid = finalSum >= 1 && finalSum <= state.currentMode.maxValue;

    if (!isValid) {
        resultValEl.className = "reveal-value long-text";
        resultValEl.textContent = "🔮";
        resultSubtext.textContent = "Wait, something went wrong! Did you select a valid number or make a mistake during the card checks? Let's try again! 😊";
        feedbackBox.style.display = "none";
        showView("result");
        return;
    }

    if (state.currentMode.isAlpha) {
        displayVal = String.fromCharCode(65 + finalSum - 1);
    } else if (state.currentMode.name === "Birth Month") {
        displayVal = Months[finalSum];
    } else {
        displayVal = finalSum;
    }

    // Adjust font size for longer texts
    if (typeof displayVal === 'string' && displayVal.length > 3) {
        resultValEl.className = "reveal-value long-text";
    } else {
        resultValEl.className = "reveal-value";
    }

    resultValEl.textContent = displayVal;

    // Tailor the subtitle description
    if (state.currentMode.name.includes("Crush")) {
        resultSubtext.textContent = `Is "${displayVal}" the letter of someone special in your heart? 💌`;
    } else if (state.currentMode.name.includes("Month")) {
        resultSubtext.textContent = `Your birth month is indeed ${displayVal}! 🎂`;
    } else {
        resultSubtext.textContent = `I successfully read your mind! It is "${displayVal}"! Was I correct?`;
    }

    // Save to Local History
    saveToHistory(displayName, displayVal);
    
    showView("result");
    triggerConfetti();
}

function logFeedback(correct) {
    document.getElementById("feedback-box").style.display = "none";
    const saveSuccess = document.getElementById("save-success");
    saveSuccess.style.display = "block";
    saveSuccess.innerHTML = correct 
        ? "<span>🎉 Excellent! My telepathic powers remain unmatched.</span>" 
        : "<span>🔮 Ah, a slight interference in the binary field. Let's calibrate and try again!</span>";
}

// Zodiac Calculator Logic
function calculateZodiac() {
    const month = parseInt(document.getElementById("zodiac-month").value);
    const day = parseInt(document.getElementById("zodiac-day").value);
    const resultBox = document.getElementById("zodiac-result-container");
    const resultSign = document.getElementById("zodiac-sign-val");

    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        alert("Please select a valid birth month and day!");
        return;
    }

    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month]) {
        alert(`Invalid date! ${Months[month]} only has ${daysInMonth[month]} days.`);
        return;
    }

    let zodiacSign = "♑ Capricorn"; // Default fallback
    
    const ranges = [
        { sm: 1, sd: 20, em: 2, ed: 18, sign: "♒ Aquarius" },
        { sm: 2, sd: 19, em: 3, ed: 20, sign: "♓ Pisces" },
        { sm: 3, sd: 21, em: 4, ed: 19, sign: "♈ Aries" },
        { sm: 4, sd: 20, em: 5, ed: 20, sign: "♉ Taurus" },
        { sm: 5, sd: 21, em: 6, ed: 20, sign: "♊ Gemini" },
        { sm: 6, sd: 21, em: 7, ed: 22, sign: "♋ Cancer" },
        { sm: 7, sd: 23, em: 8, ed: 22, sign: "♌ Leo" },
        { sm: 8, sd: 23, em: 9, ed: 22, sign: "♍ Virgo" },
        { sm: 9, sd: 23, em: 10, ed: 22, sign: "♎ Libra" },
        { sm: 10, sd: 23, em: 11, ed: 21, sign: "♏ Scorpio" },
        { sm: 11, sd: 22, em: 12, ed: 21, sign: "♐ Sagittarius" },
        { sm: 12, sd: 22, em: 12, ed: 31, sign: "♑ Capricorn" }
    ];

    for (const range of ranges) {
        if ((month === range.sm && day >= range.sd) || (month === range.em && day <= range.ed)) {
            zodiacSign = range.sign;
            break;
        }
    }

    resultSign.textContent = zodiacSign;
    resultBox.classList.add("active");

    // Save Zodiac Calculator usage to history
    saveToHistory("Zodiac Sign", zodiacSign);
}

// Local Storage History Management
function saveToHistory(modeName, value) {
    try {
        const history = JSON.parse(localStorage.getItem("mind_reader_history")) || [];
        const newItem = {
            player: state.playerName,
            mode: modeName,
            value: value,
            timestamp: new Date().toLocaleString()
        };
        // Insert at beginning
        history.unshift(newItem);
        // Limit to 50 items
        if (history.length > 50) history.pop();
        localStorage.setItem("mind_reader_history", JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save history:", e);
    }
}

function renderHistory() {
    const listContainer = document.getElementById("history-list-content");
    listContainer.innerHTML = "";
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("mind_reader_history")) || [];
    } catch (e) {
        console.error("Failed to parse history:", e);
    }

    if (history.length === 0) {
        listContainer.innerHTML = `<div class="no-history">No mind reading history recorded yet. Choose a mode and start playing! 🔮</div>`;
        return;
    }

    history.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        
        let badge = "🔮";
        if (item.mode.includes("Number") || item.mode.includes("Age")) badge = "🔢";
        else if (item.mode.includes("Alphabet") || item.mode.includes("Crush")) badge = "🔤";
        else if (item.mode.includes("Birth Month")) badge = "🌙";
        else if (item.mode.includes("Birthday Date")) badge = "📅";
        else if (item.mode.includes("Zodiac")) badge = "✨";

        div.innerHTML = `
            <div class="history-badge">${badge}</div>
            <div class="history-details">
                <div class="history-player">${item.player} <span style="font-weight: normal; color: var(--text-muted); font-size: 0.85rem;">in ${item.mode}</span></div>
                <div class="history-meta">${item.timestamp}</div>
            </div>
            <div class="history-val">${item.value}</div>
        `;
        listContainer.appendChild(div);
    });
}

function clearHistory() {
    if (confirm("Are you sure you want to clear your mind reading history?")) {
        localStorage.removeItem("mind_reader_history");
        renderHistory();
    }
}

// Confetti Effect Particle System
function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ["#c38eff", "#00f0ff", "#ff007f", "#39ff14", "#ffeb3b"];
    const particles = [];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let animationFrameId;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let active = false;
        particles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
            
            if (p.y < canvas.height) active = true;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        if (active) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Resize listener
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, { once: true });

    draw();
}
