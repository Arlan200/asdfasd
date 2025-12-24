// === STATE ===
let selectedValue = null;
let selectedSuit = null;
let target = "player";

let runningCount = 0;
let totalDecks = 6;
let cardsDealt = 0;

// === ELEMENTS ===
const runningCountEl = document.getElementById("running-count");
const trueCountEl = document.getElementById("true-count");
const cardsLeftEl = document.getElementById("cards-left");

const playerCards = document.getElementById("player-cards");
const dealerCards = document.getElementById("dealer-cards");
const decksSelect = document.getElementById("decks");

// === HI-LO MAP ===
function hiLoValue(card) {
    if (["2","3","4","5","6"].includes(card)) return 1;
    if (["7","8","9"].includes(card)) return 0;
    return -1; // 10, J, Q, K, A
}

// === UPDATE STATS ===
function updateStats() {
    const cardsInDeck = totalDecks * 52;
    const cardsLeft = cardsInDeck - cardsDealt;
    const remainingDecks = cardsLeft / 52;

    // Обновление переменных для логики
    // runningCount и trueCount уже обновляются при добавлении карты
    // cardsLeft может использоваться для логики или undo
}


// === CREATE CARD ===
function createCard(value, suit) {
    const card = document.createElement("div");
    card.className = "card";

    if (["♥","♦"].includes(suit)) {
        card.classList.add("red");
    }

    card.innerHTML = `
        <div class="value">${value}</div>
        <div class="suit">${suit}</div>
    `;

    return card;
}

// === ADD CARD ===
function addCard() {
    if (!selectedValue || !selectedSuit) return;

    const card = createCard(selectedValue, selectedSuit);

    if (target === "player") {
        playerCards.appendChild(card);
    } else {
        dealerCards.appendChild(card);
    }

    runningCount += hiLoValue(selectedValue);
    cardsDealt++;

    selectedValue = null;
    selectedSuit = null;

    updateStats();
}

// === BUTTON LISTENERS ===

// Card values
document.querySelectorAll(".card-values button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedValue = btn.dataset.value;
        addCard();
    });
});

// Card suits
document.querySelectorAll(".card-suits button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedSuit = btn.dataset.suit;
        addCard();
    });
});

// Target
document.getElementById("to-player").onclick = () => target = "player";
document.getElementById("to-dealer").onclick = () => target = "dealer";

// Decks select
decksSelect.onchange = () => {
    totalDecks = parseInt(decksSelect.value);
    updateStats();
};

// INIT
updateStats();

// === HISTORY STACK ===
let history = [];

// === ADD CARD (модифицировано) ===
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

    // добавляем в историю
    history.push(cardData);

    // обновляем подсчёт
    runningCount += hiLoValue(selectedValue);
    cardsDealt++;

    selectedValue = null;
    selectedSuit = null;

    updateStats();
}

// === UNDO ===
document.getElementById("undo").addEventListener("click", () => {
    if (history.length === 0) return;

    const lastCard = history.pop();

    // удаляем с DOM
    if (lastCard.target === "player") {
        playerCards.removeChild(lastCard.element);
    } else {
        dealerCards.removeChild(lastCard.element);
    }

    // откатываем подсчёт
    runningCount -= hiLoValue(lastCard.value);
    cardsDealt--;

    updateStats();
});
