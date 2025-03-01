// Variables globales
let playerName = "";
let money = {
    bronze: 0,
    silver: 0,
    gold: 0
};

let quests = [
    { 
        id: 1, 
        level: 1,
        description: "¡Rechazar el ataque!", 
        required: 6, 
        progress: 0, 
        reward: { bronze: 30 }, 
        completed: false,
        claimed: false,
        enemyType: "huargo"
    },
    { 
        id: 2, 
        level: 2,
        description: "Investigar la Mina del Eco", 
        required: 10, 
        progress: 0, 
        reward: { bronze: 50 }, 
        completed: false,
        claimed: false,
        enemyType: "kobold"
    }
];

const enemies = [
    { 
        name: "Huargo Roca Negra", 
        level: 1,
        maxHealth: 12,
        currentHealth: 12,
        type: "huargo",
        icon: "https://wow.zamimg.com/images/wow/icons/large/inv_misc_monsterclaw_03.jpg"
    },
    { 
        name: "Trabajador Kóbold", 
        level: 3,
        maxHealth: 15,
        currentHealth: 15,
        type: "kobold",
        icon: "https://wow.zamimg.com/uploads/screenshots/normal/73677-trabajador-kobold.jpg"
    }
];

// Elementos del DOM
const startScreen = document.getElementById('start-screen');
const nameInput = document.getElementById('character-name-input');
const startBtn = document.getElementById('start-game-btn');
const playerNameDisplay = document.getElementById('player-name');
const resetBtn = document.getElementById('reset-btn');
const container = document.getElementById('container');
const bronzeDisplay = document.getElementById('bronze');
const silverDisplay = document.getElementById('silver');
const goldDisplay = document.getElementById('gold');
const enemyList = document.getElementById('enemy-list');
const questList = document.getElementById('quest-list');

// Función para reiniciar el juego
function resetGame() {
    // Borrar los datos de localStorage
    localStorage.removeItem('gameData');
    
    // Recargar la página para empezar de cero
    window.location.reload();
}

// Evento para el botón de reinicio
resetBtn.addEventListener('click', resetGame);

// Cargar datos del juego desde localStorage
function loadGameData() {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const data = JSON.parse(savedData);
        playerName = data.playerName;
        money = data.money;
        quests = data.quests;
        updateMoneyDisplay();
        renderEnemies();
        renderQuests();
        playerNameDisplay.textContent = playerName; // Mostrar el nombre del jugador
        container.style.display = 'flex';
        startScreen.style.display = 'none';
    }
}

// Guardar datos del juego en localStorage
function saveGameData() {
    const gameData = {
        playerName,
        money,
        quests
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// Evento para iniciar el juego
startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length >= 3 && name.length <= 20) {
        playerName = name;
        startScreen.style.display = 'none';
        container.style.display = 'flex';
        playerNameDisplay.textContent = playerName;
        saveGameData(); // Guardar datos al iniciar el juego
    } else {
        alert("El nombre debe tener entre 3 y 20 caracteres.");
    }
});

// Sistema monetario
function updateMoneyDisplay() {
    while(money.bronze >= 100) {
        money.bronze -= 100;
        money.silver += 1;
    }
    while(money.silver >= 100) {
        money.silver -= 100;
        money.gold += 1;
    }

    bronzeDisplay.textContent = money.bronze;
    silverDisplay.textContent = money.silver;
    goldDisplay.textContent = money.gold;
    saveGameData(); // Guardar datos después de actualizar el dinero
}

// Sistema de combate
function renderEnemies() {
    enemyList.innerHTML = '';
    enemies.forEach(enemy => {
        const li = document.createElement('li');
        const isDead = enemy.currentHealth <= 0;
        
        li.innerHTML = `
            <img src="${enemy.icon}" class="enemy-icon" style="opacity: ${isDead ? 0.5 : 1}">
            <div>
                ${enemy.name} (Nivel ${enemy.level})
                <div class="health-bar">
                    <div class="health-progress" style="width: ${(enemy.currentHealth/enemy.maxHealth)*100}%"></div>
                </div>
                <div style="font-size: 10px; color: ${isDead ? '#FF5555' : '#FFD700'}">
                    ${isDead ? 'MUERTO' : `Salud: ${enemy.currentHealth}/${enemy.maxHealth}`}
                </div>
            </div>
        `;

        if (!isDead) {
            li.addEventListener('click', () => attackEnemy(enemy));
            li.style.cursor = 'pointer';
        } else {
            li.style.cursor = 'not-allowed';
            li.style.backgroundColor = '#3a3a3a';
        }

        li.addEventListener('dragstart', (e) => e.preventDefault());
        enemyList.appendChild(li);
    });
}

function attackEnemy(enemy) {
    if (enemy.currentHealth <= 0) return;
    
    enemy.currentHealth -= 1;
    
    if (enemy.currentHealth <= 0) {
        const min = enemy.type === 'huargo' ? 1 : 3;
        const max = enemy.type === 'huargo' ? 5 : 8;
        const loot = Math.floor(Math.random() * (max - min + 1)) + min;
        
        money.bronze += loot;
        updateQuestProgress(enemy.type);
        
        setTimeout(() => {
            enemy.currentHealth = enemy.maxHealth;
            renderEnemies();
        }, 1000);
    }
    
    updateMoneyDisplay();
    renderEnemies();
}

// Sistema de misiones
function updateQuestProgress(enemyType) {
    quests.forEach(quest => {
        if (!quest.completed && quest.enemyType === enemyType) {
            quest.progress = Math.min(quest.progress + 1, quest.required);
            if (quest.progress >= quest.required) {
                quest.completed = true;
            }
            renderQuests();
        }
    });
    saveGameData(); // Guardar progreso después de actualizar misiones
}

function claimQuest(quest) {
    if (quest.completed && !quest.claimed) {
        quest.claimed = true;
        money.bronze += quest.reward.bronze;
        updateMoneyDisplay();
        renderQuests();
        saveGameData(); // Guardar progreso después de reclamar misión
    }
}

function renderQuests() {
    questList.innerHTML = '';
    quests.filter(q => !q.claimed).sort((a, b) => a.level - b.level).forEach(quest => {
        const li = document.createElement('li');
        const title = document.createElement('div');
        title.innerHTML = `<span style="color: #00FF00;">[Nivel ${quest.level}]</span> ${quest.description}`;
        title.className = 'quest-title';
        
        const objective = document.createElement('div');
        objective.className = 'quest-objective' + (quest.completed ? ' completed' : '');
        
        const icon = document.createElement('img');
        icon.src = enemies.find(e => e.type === quest.enemyType).icon;
        icon.className = 'enemy-icon';
        icon.draggable = false;
        
        const rewardIcon = document.createElement('img');
        rewardIcon.src = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_coin_01.jpg";
        rewardIcon.className = 'coin-icon bronze-coin';
        rewardIcon.draggable = false;
        
        objective.appendChild(icon);
        objective.appendChild(document.createTextNode(
            `Matar ${quest.progress}/${quest.required} ${quest.enemyType === 'huargo' ? 'Huargos Roca Negra' : 'Trabajadores Kóbold'} - Recompensa: ${quest.reward.bronze} `
        ));
        objective.appendChild(rewardIcon);
        
        if (quest.completed) {
            li.className = 'completed';
            li.onclick = () => claimQuest(quest);
        }
        
        li.appendChild(title);
        li.appendChild(objective);
        questList.appendChild(li);
    });
}

// Iniciar el juego
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar la pantalla de inicio siempre
    startScreen.style.display = 'flex';
    container.style.display = 'none';

    // Cargar datos guardados al iniciar la página
    loadGameData();
});
