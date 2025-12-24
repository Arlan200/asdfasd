// ================== STATE ==================
let selectedValue = null;
let selectedSuit = null;
let target = "player";

let runningCount = 0;
let totalDecks = 6;
let cardsDealt = 0;

let history = [];

// ================== ELEMENTS ==================
const playerCards = document.getElementById("player-cards");
const dealerCards = document.getElementById("dealer-cards");
const decksSelect = document.getElementById("decks");
const submitBtn = document.getElementById("submit");

// ================== HI-LO ==================
function hiLoValue(card) {
    if (["2", "3", "4", "5", "6"].includes(card)) return 1;
    if (["7", "8", "9"].includes(card)) return 0;
    return -1; // 10, J, Q, K, A
}

// ================== STATS ==================
function updateStats() {
    const cardsInDeck = totalDecks * 52;
    const cardsLeft = cardsInDeck - cardsDealt;
    const remainingDecks = cardsLeft / 52;

    // логика обновления UI будет здесь позже
}

// ================== функцию Проверки ==================
function updateSubmitState() {
    submitBtn.disabled = dealerCards.children.length === 0;
}


// ================== CARD UI ==================
function createCard(value, suit) {
    const card = document.createElement("div");
    card.className = "card";

    if (["♥", "♦"].includes(suit)) {
        card.classList.add("red");
    }

    card.innerHTML = `
        <div class="value">${value}</div>
        <div class="suit">${suit}</div>
    `;

    return card;
}

// ================== ADD CARD ==================
function addCard() {
    if (!selectedValue || !selectedSuit) return;

    const card = createCard(selectedValue, selectedSuit);

    const cardData = {
        value: selectedValue,
        suit: selectedSuit,
        target: target,
        element: card
    };

    if (target === "player") {
        playerCards.appendChild(card);
    } else {
        dealerCards.appendChild(card);
    }

    history.push(cardData);

    runningCount += hiLoValue(selectedValue);
    cardsDealt++;

    selectedValue = null;
    selectedSuit = null;

    updateStats();
    updateSubmitState();
}

// ================== UNDO ==================
document.getElementById("undo").addEventListener("click", () => {
    if (history.length === 0) return;

    const lastCard = history.pop();

    if (lastCard.target === "player") {
        playerCards.removeChild(lastCard.element);
    } else {
        dealerCards.removeChild(lastCard.element);
    }

    runningCount -= hiLoValue(lastCard.value);
    cardsDealt--;

    updateStats();
});

// ================== CONTROLS ==================

// значения карт
document.querySelectorAll(".card-values button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedValue = btn.dataset.value;
        addCard();
    });
});

// масти
document.querySelectorAll(".card-suits button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedSuit = btn.dataset.suit;
        addCard();
    });
});

// цель
document.getElementById("to-player").onclick = () => target = "player";
document.getElementById("to-dealer").onclick = () => target = "dealer";

// колоды
decksSelect.onchange = () => {
    totalDecks = parseInt(decksSelect.value);
    updateStats();
};

// ================== INIT ==================
updateStats();





// ================== SEND RESULT ==================
document.getElementById("submit").addEventListener("click", () => {

    const cardsInDeck = totalDecks * 52;
    const cardsLeft = cardsInDeck - cardsDealt;
    const remainingDecks = cardsLeft / 52;

    const trueCount = remainingDecks > 0
        ? runningCount / remainingDecks
        : 0;

    let decision = "НЕ СТАВИТЬ";
    let probability = 0;

    if (trueCount >= 8) {
        decision = "СТАВИТЬ АГРЕССИВНО";
        probability = randomBetween(75, 90);
    } else if (trueCount >= 6) {
        decision = "СТАВИТЬ";
        probability = randomBetween(65, 75);
    } else if (trueCount >= 4) {
        decision = "МОЖНО СТАВИТЬ";
        probability = randomBetween(55, 65);
    } else {
        decision = "НЕ СТАВИТЬ";
        probability = randomBetween(40, 55);
    }

    const payload = {
        runningCount: runningCount,
        trueCount: trueCount.toFixed(2),
        decision: decision,
        probability: probability + "%"
    };

    // отправка в Telegram
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify(payload));
        Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }

    showResultMessage(decision, probability);
    clearTable();
});



// ================== ДОБАВЬ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showResultMessage(decision, probability) {
    const box = document.getElementById("result-message");

    box.innerHTML = `
        <strong>${decision}</strong><br>
        Вероятность: ${probability}%
    `;

    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 2500);
}


// ================== CLEAR TABLE (NO RESET COUNT) ==================
function clearTable() {
    playerCards.innerHTML = "";
    dealerCards.innerHTML = "";

    history = [];

    selectedValue = null;
    selectedSuit = null;
}
