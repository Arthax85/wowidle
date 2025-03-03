// Variables globales
let playerName = "";
let playerLevel = 1;
let playerExperience = 0;
let experienceToNextLevel = 50; // Experiencia necesaria para el nivel 2
let money = {
    bronze: 0,
    silver: 0,
    gold: 0
};

// Variables globales para raza y clase
let playerRace = "";
let playerClass = "";

// Variables globales para los stats del personaje
let playerStats = {
    strength: 0,
    agility: 0,
    stamina: 0,
    intellect: 0,
    spirit: 0
};

// Mapeo de stats iniciales por clase
const classStats = {
    Sacerdote: { strength: 0, agility: 0, stamina: 0, intellect: 2, spirit: 3 },
    Pícaro: { strength: 1, agility: 3, stamina: 1, intellect: 0, spirit: 0 },
    Guerrero: { strength: 3, agility: 0, stamina: 2, intellect: 0, spirit: 0 },
    Mago: { strength: 0, agility: 0, stamina: 0, intellect: 3, spirit: 2 },
    Druida: { strength: 1, agility: 0, stamina: 0, intellect: 2, spirit: 2 },
    Cazador: { strength: 0, agility: 3, stamina: 1, intellect: 0, spirit: 1 },
    Brujo: { strength: 0, agility: 0, stamina: 1, intellect: 2, spirit: 2 },
    Chamán: { strength: 1, agility: 0, stamina: 1, intellect: 1, spirit: 2 },
    Paladín: { strength: 2, agility: 0, stamina: 2, intellect: 0, spirit: 1 }
};

// Mapeo de razas y clases disponibles
const raceClassMapping = {
    humano: ["Guerrero", "Cazador", "Mago", "Pícaro", "Sacerdote", "Brujo", "Paladín"],
    elfo_noche: ["Guerrero", "Cazador", "Mago", "Pícaro", "Sacerdote", "Brujo", "Druida"],
    enano: ["Guerrero", "Cazador", "Mago", "Pícaro", "Sacerdote", "Brujo", "Paladín", "Chamán"],
    gnomo: ["Guerrero", "Cazador", "Mago", "Pícaro", "Sacerdote", "Brujo"],
    draenei: ["Guerrero", "Cazador", "Mago", "Pícaro", "Sacerdote", "Brujo", "Paladín", "Chamán"]
};

let quests = [
    { 
        id: 1, 
        level: 1,
        description: "¡Rechazar el ataque!", 
        required: 6, 
        progress: 0, 
        reward: { bronze: 30, experience: 10 }, // Recompensa en monedas y experiencia
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
        reward: { bronze: 50, experience: 20 }, // Recompensa en monedas y experiencia
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
        icon: "https://raw.githubusercontent.com/Arthax85/wowidle/refs/heads/main/huargo-roca-negra.jpg", // Nuevo icono
        respawnTimer: null // Temporizador para revivir
    },
    { 
        name: "Trabajador Kóbold", 
        level: 3,
        maxHealth: 15,
        currentHealth: 15,
        type: "kobold",
        icon: "https://wow.zamimg.com/uploads/screenshots/normal/73677-trabajador-kobold.jpg",
        respawnTimer: null // Temporizador para revivir
    }
];

// Elementos del DOM
const startScreen = document.getElementById('start-screen');
const nameInput = document.getElementById('character-name-input');
const startBtn = document.getElementById('start-game-btn');
const infoBtn = document.getElementById('info-btn');
const resetBtn = document.getElementById('reset-btn');
const container = document.getElementById('container');
const bronzeDisplay = document.getElementById('bronze');
const silverDisplay = document.getElementById('silver');
const goldDisplay = document.getElementById('gold');
const enemyList = document.getElementById('enemy-list');
const questList = document.getElementById('quest-list');
const infoWindow = document.getElementById('info-window');
const infoName = document.getElementById('info-name');
const infoLevel = document.getElementById('info-level');
const experienceProgress = document.getElementById('experience-progress');
const experienceText = document.getElementById('experience-text');
const mapBtn = document.getElementById('map-btn');
const mapOverlay = document.getElementById('map-overlay');
const closeMapBtn = document.getElementById('close-map-btn');

// Elementos del DOM para la selección de raza y clase
const raceClassScreen = document.getElementById('race-class-screen');
const raceSelect = document.getElementById('race-select');
const classSelect = document.getElementById('class-select');
const confirmRaceClassBtn = document.getElementById('confirm-race-class-btn');

// Variables globales para el combate
let currentEnemy = null;
let playerHealth = 100;
let enemyHealth = 100;

// Elementos del DOM para el combate
const combatOverlay = document.getElementById('combat-overlay');
const enemyCombatImage = document.getElementById('enemy-combat-image');
const enemyCombatHealthBar = document.getElementById('enemy-combat-health-bar');
const playerCombatHealthBar = document.getElementById('player-combat-health-bar');
const attackBtn = document.getElementById('attack-btn');
const fleeBtn = document.getElementById('flee-btn');
const closeCombatBtn = document.getElementById('close-combat-btn');
const rewardsText = document.getElementById('rewards-text');

// Función para reiniciar el juego
function resetGame() {
    // Borrar los datos de localStorage
    localStorage.removeItem('gameData');
    
    // Recargar la página para empezar de cero
    window.location.reload();
}

// Evento para el botón de reinicio
resetBtn.addEventListener('click', resetGame);

// Evento para el botón de información del personaje
infoBtn.addEventListener('click', () => {
    infoWindow.style.display = infoWindow.style.display === 'block' ? 'none' : 'block';
});

// Evento para mostrar el mapa
mapBtn.addEventListener('click', () => {
    mapOverlay.style.display = 'flex';
});

// Evento para cerrar el mapa
closeMapBtn.addEventListener('click', () => {
    mapOverlay.style.display = 'none';
});

// Cargar datos del juego desde localStorage
function loadGameData() {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const data = JSON.parse(savedData);
        playerName = data.playerName;
        playerLevel = data.playerLevel || 1;
        playerExperience = data.playerExperience || 0;
        experienceToNextLevel = data.experienceToNextLevel || 50;
        money = data.money;
        quests = data.quests;
        playerRace = data.playerRace || "humano";
        playerClass = data.playerClass || "Guerrero";
        playerStats = data.playerStats || { strength: 0, agility: 0, stamina: 0, intellect: 0, spirit: 0 };
        playerHealth = data.playerHealth !== undefined ? data.playerHealth : 100; // Cargar la vida del jugador, incluso si es 0

        updateMoneyDisplay();
        updateExperienceDisplay();
        renderEnemies();
        renderQuests();

        // Actualizar la información del personaje
        document.getElementById('info-name').textContent = playerName;
        document.getElementById('info-race').textContent = playerRace;
        document.getElementById('info-class').textContent = playerClass;
        document.getElementById('info-level').textContent = playerLevel;
        document.getElementById('info-strength').textContent = playerStats.strength;
        document.getElementById('info-agility').textContent = playerStats.agility;
        document.getElementById('info-stamina').textContent = playerStats.stamina;
        document.getElementById('info-intellect').textContent = playerStats.intellect;
        document.getElementById('info-spirit').textContent = playerStats.spirit;

        // Actualizar la barra de vida del jugador
        updateHealthBars();

        container.style.display = 'flex';
        startScreen.style.display = 'none';
    }
}

// Guardar datos del juego en localStorage
function saveGameData() {
    const gameData = {
        playerName,
        playerLevel,
        playerExperience,
        experienceToNextLevel,
        money,
        quests,
        playerRace,
        playerClass,
        playerStats,
        playerHealth,
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// Evento para cambiar las clases disponibles según la raza seleccionada
raceSelect.addEventListener('change', () => {
    const selectedRace = raceSelect.value;
    const availableClasses = raceClassMapping[selectedRace];
    
    // Limpiar las opciones de clase anteriores
    classSelect.innerHTML = '';
    
    // Llenar las nuevas opciones de clase
    availableClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
});

// Evento para confirmar la selección de raza y clase
confirmRaceClassBtn.addEventListener('click', () => {
    playerRace = raceSelect.value;
    playerClass = classSelect.value;

    // Asignar stats iniciales según la clase seleccionada
    playerStats = { ...classStats[playerClass] };

    // Actualizar la información del personaje
    document.getElementById('info-name').textContent = playerName;
    document.getElementById('info-race').textContent = playerRace;
    document.getElementById('info-class').textContent = playerClass;
    document.getElementById('info-level').textContent = playerLevel;
    document.getElementById('info-strength').textContent = playerStats.strength;
    document.getElementById('info-agility').textContent = playerStats.agility;
    document.getElementById('info-stamina').textContent = playerStats.stamina;
    document.getElementById('info-intellect').textContent = playerStats.intellect;
    document.getElementById('info-spirit').textContent = playerStats.spirit;

    // Ocultar la pantalla de selección de raza y clase
    raceClassScreen.style.display = 'none';

    // Mostrar el contenido principal del juego
    container.style.display = 'flex';

    // Renderizar enemigos y misiones
    renderEnemies();
    renderQuests();

    // Guardar los datos del juego
    saveGameData();
});

// Modificar el evento de inicio del juego para mostrar la pantalla de selección de raza y clase
startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length >= 3 && name.length <= 20) {
        playerName = name;
        startScreen.style.display = 'none';
        raceClassScreen.style.display = 'flex';
        
        // Llenar las clases iniciales basadas en la raza predeterminada (Humano)
        const initialClasses = raceClassMapping['humano'];
        classSelect.innerHTML = '';
        initialClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = cls;
            classSelect.appendChild(option);
        });
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

// Función para actualizar la barra de experiencia
function updateExperienceDisplay() {
    const experiencePercentage = (playerExperience / experienceToNextLevel) * 100;
    experienceProgress.style.width = `${experiencePercentage}%`;
    experienceText.textContent = `${playerExperience} / ${experienceToNextLevel}`; // Actualizar el texto de la experiencia
}

// Función para subir de nivel
function levelUp() {
    if (playerExperience >= experienceToNextLevel) {
        playerLevel += 1;
        playerExperience -= experienceToNextLevel; // Restar la experiencia usada para subir de nivel
        experienceToNextLevel = Math.round(experienceToNextLevel * 1.20); // Incrementar la experiencia necesaria en un 20%
        
        // Restaurar la vida del jugador al máximo cuando sube de nivel
        playerHealth = 100; // <-- Restaurar la vida al máximo
        updateHealthBars(); // Actualizar la barra de vida del jugador
        
        infoLevel.textContent = playerLevel; // Actualizar el nivel en la ventana de información
        updateExperienceDisplay();
        saveGameData(); // Guardar datos después de subir de nivel
    }
}

// Función para calcular la experiencia que da un enemigo
function calculateExperience(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;

    if (levelDifference < -7) {
        return 0; // No da experiencia si el personaje tiene más de 7 niveles por encima
    }

    if (levelDifference < -3) {
        return 5; // Experiencia reducida si el personaje tiene más de 3 niveles por encima
    }

    if (levelDifference <= 3) {
        return 10; // Experiencia base si la diferencia es de 3 niveles o menos
    }

    if (levelDifference <= 5) {
        return 15; // Más experiencia si el enemigo tiene hasta 5 niveles por encima
    }

    return 20; // Mucha más experiencia si el enemigo tiene más de 5 niveles por encima
}

// Función para calcular las monedas que da un enemigo
function calculateMoneyReward(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;

    if (levelDifference < -7) {
        return 1; // Mínimo de monedas si el enemigo es muy débil
    }

    if (levelDifference < -3) {
        return 3; // Monedas reducidas si el enemigo es débil
    }

    if (levelDifference <= 3) {
        return 5; // Monedas base si la diferencia es de 3 niveles o menos
    }

    if (levelDifference <= 5) {
        return 10; // Más monedas si el enemigo es fuerte
    }

    return 15; // Muchas más monedas si el enemigo es muy fuerte
}

// Función para determinar el color del nivel del enemigo
function getLevelColor(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;

    if (levelDifference < -7) {
        return 'gray'; // No da experiencia
    }

    if (levelDifference < -3) {
        return 'green'; // Experiencia reducida
    }

    if (levelDifference <= 3) {
        return 'yellow'; // Experiencia base
    }

    if (levelDifference <= 5) {
        return 'red'; // Más experiencia
    }

    return 'red'; // Mucha más experiencia
}

// Sistema de combate
function renderEnemies() {
    enemyList.innerHTML = '';
    enemies.forEach(enemy => {
        const li = document.createElement('li');
        const isDead = enemy.currentHealth <= 0;
        const levelColor = getLevelColor(enemy.level);
        
        li.innerHTML = `
            <img src="${enemy.icon}" class="enemy-icon" style="opacity: ${isDead ? 0.5 : 1}">
            <div>
                ${enemy.name} <span class="enemy-level ${levelColor}">(Nivel ${enemy.level})</span>
                <div class="health-bar">
                    <div class="health-progress" style="width: ${(enemy.currentHealth/enemy.maxHealth)*100}%"></div>
                </div>
                <div style="font-size: 10px; color: ${isDead ? '#FF5555' : '#FFD700'}">
                    ${isDead ? 'MUERTO' : `Salud: ${enemy.currentHealth}/${enemy.maxHealth}`}
                </div>
                ${isDead ? `<div style="font-size: 10px; color: #FFD700;">Resucitando en ${enemy.respawnTimer} segundos</div>` : ''}
            </div>
        `;

        if (!isDead) {
            li.addEventListener('click', () => startCombat(enemy)); // Iniciar combate al hacer clic
            li.style.cursor = 'pointer';
        } else {
            li.style.cursor = 'not-allowed';
            li.style.backgroundColor = '#3a3a3a';
        }

        li.addEventListener('dragstart', (e) => e.preventDefault());
        enemyList.appendChild(li);
    });
}

// Función para iniciar el combate
function startCombat(enemy) {
    if (enemy.currentHealth <= 0) {
        alert("Este enemigo está muerto y no puede ser atacado.");
        return;
    }

    currentEnemy = enemy;
    enemyHealth = enemy.maxHealth; // Restablecer la vida del enemigo al máximo

    // Mostrar la imagen y salud del enemigo
    enemyCombatImage.src = enemy.icon;

    // Actualizar la barra de salud del enemigo al iniciar el combate
    const enemyHealthPercentage = (enemyHealth / currentEnemy.maxHealth) * 100;
    const enemyCombatHealthBar = document.getElementById('enemy-combat-health-bar');
    enemyCombatHealthBar.style.width = `${enemyHealthPercentage}%`;
    document.getElementById('enemy-health-text').textContent = `${enemyHealth} / ${currentEnemy.maxHealth}`;

    // Mostrar la pantalla de combate
    combatOverlay.style.display = 'flex';

    // Actualizar la barra de salud del jugador
    updateHealthBars();
}

// Función para actualizar las barras de salud
function updateHealthBars() {
    const playerHealthPercentage = (playerHealth / 100) * 100;
    // Actualizar la barra de progreso
    const healthProgress = document.getElementById('health-progress');
    healthProgress.style.width = `${playerHealthPercentage}%`;

    // Actualizar el texto de la vida
    const healthText = document.getElementById('health-text');
    healthText.textContent = `${playerHealth} / 100`;

    // Si estás en combate, también actualiza la barra de vida
    if (combatOverlay.style.display === 'flex') {
        const playerCombatHealthBar = document.getElementById('player-combat-health-bar');
        playerCombatHealthBar.style.width = `${playerHealthPercentage}%`;
        document.getElementById('player-health-text').textContent = `${playerHealth} / 100`;
        
        const enemyHealthPercentage = (enemyHealth / currentEnemy.maxHealth) * 100;
        const enemyCombatHealthBar = document.getElementById('enemy-combat-health-bar');
        enemyCombatHealthBar.style.width = `${enemyHealthPercentage}%`;
        document.getElementById('enemy-health-text').textContent = `${enemyHealth} / ${currentEnemy.maxHealth}`;
    }
}

// Función para calcular el daño basado en las estadísticas de la clase
function calculateDamage() {
    if (playerClass === "Guerrero" || playerClass === "Pícaro" || playerClass === "Cazador" || playerClass === "Paladín") {
        // Clases físicas: daño basado en fuerza y agilidad
        return Math.floor(playerStats.strength * 1.5 + playerStats.agility * 0.5);
    } else if (playerClass === "Mago" || playerClass === "Sacerdote" || playerClass === "Brujo" || playerClass === "Druida" || playerClass === "Chamán") {
        // Clases mágicas: daño basado en intelecto y espíritu
        return Math.floor(playerStats.intellect * 1.5 + playerStats.spirit * 0.5);
    }
    return 10; // Daño base por defecto
}

// Evento para atacar al enemigo
attackBtn.addEventListener('click', () => {
    if (currentEnemy && currentEnemy.currentHealth > 0) { // Solo atacar si el enemigo está vivo
        // Daño al enemigo basado en las estadísticas de la clase
        const damage = calculateDamage();
        enemyHealth = Math.max(enemyHealth - damage, 0);

        // Daño al jugador (contraataque del enemigo)
        const enemyDamage = Math.floor(Math.random() * 8) + 3; // Daño aleatorio entre 3 y 10
        playerHealth = Math.max(playerHealth - enemyDamage, 0);

        // Actualizar las barras de salud y el texto de la vida
        updateHealthBars();

        // Verificar si el enemigo o el jugador han sido derrotados
        if (enemyHealth <= 0) {
            // Desactivar los botones de "Atacar" y "Huir"
            attackBtn.disabled = true;
            fleeBtn.disabled = true;

            // Sumar experiencia al jugador
            const experienceGained = calculateExperience(currentEnemy.level);
            playerExperience += experienceGained;
            updateExperienceDisplay();
            levelUp(); // Verificar si el jugador sube de nivel

            // Sumar monedas al jugador
            const moneyReward = calculateMoneyReward(currentEnemy.level);
            money.bronze += moneyReward;
            updateMoneyDisplay();

            // Mostrar las recompensas en la pantalla de combate
            rewardsText.textContent = `Has obtenido ${moneyReward} monedas y ${experienceGained} experiencia.`;

            // Actualizar el progreso de las misiones
            updateQuestProgress(currentEnemy.type);

            // Actualizar la lista de enemigos
            renderEnemies();

            // Iniciar temporizador para revivir al enemigo
            currentEnemy.respawnTimer = 5; // 5 segundos para revivir
            const respawnInterval = setInterval(() => {
                currentEnemy.respawnTimer -= 1;
                renderEnemies();

                if (currentEnemy.respawnTimer <= 0) {
                    clearInterval(respawnInterval);
                    currentEnemy.currentHealth = currentEnemy.maxHealth;
                    currentEnemy.respawnTimer = null;
                    renderEnemies();
                }
            }, 1000); // Actualizar cada segundo

            // Guardar los datos del juego
            saveGameData();
        } else if (playerHealth <= 0) {
            
            alert(`¡Has sido derrotado por ${currentEnemy.name}!`);
            combatOverlay.style.display = 'none';
            
            // Guardar el estado del juego cuando el jugador queda con 0 de vida
            saveGameData();
        }
    }
});

// Evento para huir del combate
fleeBtn.addEventListener('click', () => {
    alert("Has huido del combate.");
    combatOverlay.style.display = 'none';
});

// Evento para cerrar la pantalla de combate
closeCombatBtn.addEventListener('click', () => {
    combatOverlay.style.display = 'none';
    // Reactivar los botones de "Atacar" y "Huir" para el próximo combate
    attackBtn.disabled = false;
    fleeBtn.disabled = false;
    // Limpiar el texto de recompensas
    rewardsText.textContent = '';
});

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
        money.bronze += quest.reward.bronze; // Otorgar monedas
        playerExperience += quest.reward.experience; // Otorgar experiencia
        updateMoneyDisplay();
        updateExperienceDisplay();
        levelUp(); // Verificar si el jugador sube de nivel
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
            `Matar ${quest.progress}/${quest.required} ${quest.enemyType === 'huargo' ? 'Huargos Roca Negra' : 'Trabajadores Kóbold'} - Recompensa: ${quest.reward.bronze} monedas y ${quest.reward.experience} experiencia`
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
    // Cargar datos guardados al iniciar la página
    loadGameData();

    // Verificar si hay datos guardados
    const savedData = localStorage.getItem('gameData');
    if (!savedData) {
        // Si no hay datos guardados, mostrar la pantalla de inicio
        startScreen.style.display = 'flex';
        container.style.display = 'none';
    } else {
        // Si hay datos guardados, ocultar la pantalla de inicio y mostrar el contenido del juego
        startScreen.style.display = 'none';
        container.style.display = 'flex';

        // Llenar las clases según la raza seleccionada
        if (playerRace) {
            const availableClasses = raceClassMapping[playerRace];
            classSelect.innerHTML = '';
            availableClasses.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls;
                option.textContent = cls;
                classSelect.appendChild(option);
            });
            classSelect.value = playerClass; // Seleccionar la clase guardada
        }

        // Actualizar la barra de vida del jugador
        updateHealthBars(); // <-- Llamar a updateHealthBars() aquí
    }
});