// Variables globales
let playerName = "";
let playerLevel = 1;
let playerExperience = 0;
let experienceToNextLevel = 400; // Actualizado según la tabla
let money = {
    bronze: 0,
    silver: 0,
    gold: 0
};

// Variable para controlar el estado del combate
let isCombatActive = false;

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

// Variables globales para el inventario
let inventory = {
    healthPotions: 0,
    resurrectionStones: 0
};

// Variables globales para la vida
let playerHealth = 100;
let playerMaxHealth = 100;

// Sistema de reputación
const reputationRanks = [
    { id: 1, name: "Odiado", threshold: 0, color: "#FF0000" },
    { id: 2, name: "Hostil", threshold: 36000, color: "#FF5555" },
    { id: 3, name: "Adverso", threshold: 39000, color: "#FF8000" },
    { id: 4, name: "Neutral", threshold: 42000, color: "#FFFF00" },
    { id: 5, name: "Amistoso", threshold: 45000, color: "#00FF00" },
    { id: 6, name: "Honorable", threshold: 51000, color: "#00FFFF" },
    { id: 7, name: "Reverenciado", threshold: 63000, color: "#0080FF" },
    { id: 8, name: "Exaltado", threshold: 84000, color: "#A335EE" }
];

// Facciones disponibles
const factions = [
    { 
        id: 1, 
        name: "Ventormenta", 
        description: "Esta capital de la Alianza, una de los últimos baluartes del poder humano, está gobernada por Anduin Wrynn, un rey sabio a pesar de su juventud.",
        icon: "https://wow.zamimg.com/images/wow/icons/large/achievement_reputation_01.jpg"
    },
    { 
        id: 2, 
        name: "Darnassus", 
        description: "Hogar de los elfos de la noche y su líder, la suma sacerdotisa Tyrande Whisperwind.",
        icon: "https://wow.zamimg.com/images/wow/icons/large/achievement_reputation_04.jpg"
    },
    { 
        id: 3, 
        name: "Forjaz", 
        description: "La ciudad subterránea de los enanos, gobernada por el Consejo de los Tres Martillos.",
        icon: "https://wow.zamimg.com/images/wow/icons/large/achievement_reputation_02.jpg"
    },
    { 
        id: 4, 
        name: "Gnomeregan", 
        description: "Antiguo hogar de los gnomos, ahora en reconstrucción tras la invasión de troggs. Liderada por el Alto Manitas Mekkatorque.",
        icon: "https://wow.zamimg.com/images/wow/icons/large/achievement_reputation_gnomeragan.jpg"
    }
];

// Reputación del jugador con cada facción
let playerReputation = [
    { factionId: 1, points: 0 }, // Ventormenta
    { factionId: 2, points: 0 }, // Darnassus
    { factionId: 3, points: 0 }, // Forjaz
    { factionId: 4, points: 0 }  // Gnomeregan
];

// Función para obtener el rango de reputación actual
function getReputationRank(points) {
    // Encontrar el rango más alto que el jugador ha alcanzado
    let rank = reputationRanks[0]; // Por defecto, Odiado
    
    for (let i = 1; i < reputationRanks.length; i++) {
        if (points >= reputationRanks[i].threshold) {
            rank = reputationRanks[i];
        } else {
            break;
        }
    }
    
    return rank;
}

// Función para calcular el progreso hacia el siguiente rango
function getReputationProgress(points) {
    const currentRank = getReputationRank(points);
    const currentIndex = reputationRanks.findIndex(r => r.id === currentRank.id);
    
    // Si está en el rango máximo, mostrar 100%
    if (currentIndex === reputationRanks.length - 1) {
        return 100;
    }
    
    const nextRank = reputationRanks[currentIndex + 1];
    const currentThreshold = currentRank.threshold;
    const nextThreshold = nextRank.threshold;
    
    // Calcular el porcentaje de progreso
    const pointsForCurrentRank = points - currentThreshold;
    const pointsNeededForNextRank = nextThreshold - currentThreshold;
    
    return Math.min(100, Math.floor((pointsForCurrentRank / pointsNeededForNextRank) * 100));
}

// Función para ganar reputación con una facción
function gainReputation(factionId, amount) {
    const factionIndex = playerReputation.findIndex(r => r.factionId === factionId);
    
    if (factionIndex !== -1) {
        const oldRank = getReputationRank(playerReputation[factionIndex].points);
        playerReputation[factionIndex].points += amount;
        const newRank = getReputationRank(playerReputation[factionIndex].points);
        
        // Si el jugador ha alcanzado un nuevo rango, mostrar notificación
        if (newRank.id > oldRank.id) {
            const faction = factions.find(f => f.id === factionId);
            showNotification(`¡Has alcanzado el rango ${newRank.name} con ${faction.name}!`);
        }
        
        saveGameData();
        updateReputationDisplay();
    }
}

// Función para actualizar la visualización de reputación en la ventana de información
function updateReputationDisplay() {
    const reputationContainer = document.getElementById('reputation-container');
    if (!reputationContainer) return;
    
    reputationContainer.innerHTML = '';
    
    playerReputation.forEach(rep => {
        const faction = factions.find(f => f.id === rep.factionId);
        if (!faction) return;
        
        const rank = getReputationRank(rep.points);
        const progress = getReputationProgress(rep.points);
        
        const factionElement = document.createElement('div');
        factionElement.className = 'reputation-faction';
        
        const factionHeader = document.createElement('div');
        factionHeader.className = 'reputation-faction-header';
        
        // Agregar icono de facción
        const factionIcon = document.createElement('img');
        factionIcon.src = faction.icon;
        factionIcon.alt = faction.name;
        factionIcon.className = 'faction-icon';
        factionHeader.appendChild(factionIcon);
        
        // Nombre de la facción y el rango
        const factionInfo = document.createElement('div');
        factionInfo.className = 'faction-info';
        factionInfo.innerHTML = `
            <span class="faction-name">${faction.name}</span>
            <span class="faction-rank" style="color: ${rank.color}">${rank.name}</span>
        `;
        factionHeader.appendChild(factionInfo);
        
        factionElement.appendChild(factionHeader);
        
        // Barra de progreso
        const progressBar = document.createElement('div');
        progressBar.className = 'reputation-progress-bar-container';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'reputation-progress-bar';
        progressFill.style.width = `${progress}%`;
        progressFill.style.backgroundColor = rank.color;
        
        progressBar.appendChild(progressFill);
        factionElement.appendChild(progressBar);
        
        // Puntos de reputación
        const pointsElement = document.createElement('div');
        pointsElement.className = 'reputation-points';
        
        // Si está en el rango máximo, mostrar "Max"
        if (rank.id === reputationRanks.length) {
            pointsElement.textContent = 'Reputación máxima';
        } else {
            const nextRank = reputationRanks.find(r => r.id === rank.id + 1);
            const pointsToNext = nextRank.threshold - rep.points;
            pointsElement.textContent = `${rep.points} / ${nextRank.threshold} (${pointsToNext} para el siguiente rango)`;
        }
        
        factionElement.appendChild(pointsElement);
        
        reputationContainer.appendChild(factionElement);
    });
}

// Tabla de experiencia basada en niveles de WoW (1-60)
const experienceTable = [
    { level: 1, expToNext: 400, mobExp: 50, mobsToLevel: 8 },
    { level: 2, expToNext: 900, mobExp: 55, mobsToLevel: 16 },
    { level: 3, expToNext: 1400, mobExp: 60, mobsToLevel: 23 },
    { level: 4, expToNext: 2100, mobExp: 65, mobsToLevel: 32 },
    { level: 5, expToNext: 2800, mobExp: 70, mobsToLevel: 40 },
    { level: 6, expToNext: 3600, mobExp: 75, mobsToLevel: 48 },
    { level: 7, expToNext: 4500, mobExp: 80, mobsToLevel: 56 },
    { level: 8, expToNext: 5400, mobExp: 85, mobsToLevel: 64 },
    { level: 9, expToNext: 6500, mobExp: 90, mobsToLevel: 72 },
    { level: 10, expToNext: 7600, mobExp: 95, mobsToLevel: 80 },
    { level: 11, expToNext: 8800, mobExp: 100, mobsToLevel: 88 },
    { level: 12, expToNext: 10100, mobExp: 105, mobsToLevel: 96 },
    { level: 13, expToNext: 11400, mobExp: 110, mobsToLevel: 104 },
    { level: 14, expToNext: 12900, mobExp: 115, mobsToLevel: 112 },
    { level: 15, expToNext: 14400, mobExp: 120, mobsToLevel: 120 },
    { level: 16, expToNext: 16000, mobExp: 125, mobsToLevel: 128 },
    { level: 17, expToNext: 17700, mobExp: 130, mobsToLevel: 136 },
    { level: 18, expToNext: 19400, mobExp: 135, mobsToLevel: 144 },
    { level: 19, expToNext: 21300, mobExp: 140, mobsToLevel: 152 },
    { level: 20, expToNext: 23200, mobExp: 145, mobsToLevel: 160 },
    { level: 21, expToNext: 25200, mobExp: 150, mobsToLevel: 168 },
    { level: 22, expToNext: 27300, mobExp: 155, mobsToLevel: 176 },
    { level: 23, expToNext: 29400, mobExp: 160, mobsToLevel: 184 },
    { level: 24, expToNext: 31700, mobExp: 165, mobsToLevel: 192 },
    { level: 25, expToNext: 34000, mobExp: 170, mobsToLevel: 200 },
    { level: 26, expToNext: 36400, mobExp: 175, mobsToLevel: 208 },
    { level: 27, expToNext: 38900, mobExp: 180, mobsToLevel: 216 },
    { level: 28, expToNext: 41400, mobExp: 185, mobsToLevel: 224 },
    { level: 29, expToNext: 44300, mobExp: 190, mobsToLevel: 233 },
    { level: 30, expToNext: 47400, mobExp: 195, mobsToLevel: 243 },
    { level: 31, expToNext: 50800, mobExp: 200, mobsToLevel: 254 },
    { level: 32, expToNext: 54500, mobExp: 205, mobsToLevel: 266 },
    { level: 33, expToNext: 58600, mobExp: 210, mobsToLevel: 279 },
    { level: 34, expToNext: 62800, mobExp: 215, mobsToLevel: 292 },
    { level: 35, expToNext: 67100, mobExp: 220, mobsToLevel: 305 },
    { level: 36, expToNext: 71600, mobExp: 225, mobsToLevel: 318 },
    { level: 37, expToNext: 76100, mobExp: 230, mobsToLevel: 331 },
    { level: 38, expToNext: 80800, mobExp: 235, mobsToLevel: 344 },
    { level: 39, expToNext: 85700, mobExp: 240, mobsToLevel: 357 },
    { level: 40, expToNext: 90700, mobExp: 245, mobsToLevel: 370 },
    { level: 41, expToNext: 95800, mobExp: 250, mobsToLevel: 383 },
    { level: 42, expToNext: 101000, mobExp: 255, mobsToLevel: 396 },
    { level: 43, expToNext: 106300, mobExp: 260, mobsToLevel: 409 },
    { level: 44, expToNext: 111800, mobExp: 265, mobsToLevel: 422 },
    { level: 45, expToNext: 117500, mobExp: 270, mobsToLevel: 435 },
    { level: 46, expToNext: 123200, mobExp: 275, mobsToLevel: 448 },
    { level: 47, expToNext: 129100, mobExp: 280, mobsToLevel: 461 },
    { level: 48, expToNext: 135100, mobExp: 285, mobsToLevel: 474 },
    { level: 49, expToNext: 141200, mobExp: 290, mobsToLevel: 487 },
    { level: 50, expToNext: 147500, mobExp: 295, mobsToLevel: 500 },
    { level: 51, expToNext: 153900, mobExp: 300, mobsToLevel: 513 },
    { level: 52, expToNext: 160400, mobExp: 305, mobsToLevel: 526 },
    { level: 53, expToNext: 167100, mobExp: 310, mobsToLevel: 539 },
    { level: 54, expToNext: 173900, mobExp: 315, mobsToLevel: 552 },
    { level: 55, expToNext: 180800, mobExp: 320, mobsToLevel: 565 },
    { level: 56, expToNext: 187900, mobExp: 325, mobsToLevel: 578 },
    { level: 57, expToNext: 195000, mobExp: 330, mobsToLevel: 591 },
    { level: 58, expToNext: 202300, mobExp: 335, mobsToLevel: 604 },
    { level: 59, expToNext: 209800, mobExp: 340, mobsToLevel: 617 },
    { level: 60, expToNext: 0, mobExp: 345, mobsToLevel: 0 } // Nivel máximo
];

// Mapeo de stats iniciales por clase
const classStats = {
    Guerrero: { strength: 2, agility: 1, stamina: 2, intellect: 1, spirit: 1 },
    Pícaro: { strength: 1, agility: 2, stamina: 2, intellect: 1, spirit: 1 },
    Cazador: { strength: 1, agility: 2, stamina: 2, intellect: 1, spirit: 1 },
    Mago: { strength: 1, agility: 1, stamina: 1, intellect: 2, spirit: 2 },
    Sacerdote: { strength: 1, agility: 1, stamina: 1, intellect: 2, spirit: 2 },
    Brujo: { strength: 1, agility: 1, stamina: 1, intellect: 2, spirit: 2 },
    Druida: { strength: 1, agility: 1, stamina: 2, intellect: 2, spirit: 1 },
    Chamán: { strength: 1, agility: 1, stamina: 2, intellect: 2, spirit: 1 },
    Paladín: { strength: 2, agility: 1, stamina: 2, intellect: 1, spirit: 1 }
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
        title: "¡Rechazar el ataque!", 
        description: "Así que eres [GENDER] recluta de Ventormenta, ¿eh? Soy el alguacil McBride, comandante de este cuartel. Me alegra tenerte a bordo...\n\n<McBride mira unos papeles.>\n\n[NAME]. Es [NAME], ¿verdad?\n\nLlegas justo a tiempo. Los orcos Roca Negra han conseguido colarse en Villanorte a través de una brecha en las montañas. Mis soldados están haciendo todo lo que pueden para rechazarlos, pero me temo que pronto se verán superados.\n\n¡Dirígete al noroeste, al bosque y mata a los atacantes huargos Roca Negra! ¡Ayuda a mis soldados!",
        shortDescription: "Elimina a los huargos Roca Negra que atacan Villanorte",
        required: 6, 
        progress: 0, 
        reward: { bronze: 55, experience: 10 },
        completed: false,
        claimed: false,
        enemyType: "huargo",
        questGiver: "Alguacil McBride",
        location: "Villadorada"
    },
    { 
        id: 2, 
        level: 2,
        title: "Investigar la Mina del Eco", 
        description: "La Mina del Eco ha sido invadida por kóbolds. Necesitamos que investigues la situación y elimines la amenaza.",
        shortDescription: "Explora la mina del Eco y elimina a los kóbolds",
        required: 10, 
        progress: 0, 
        reward: { bronze: 50, experience: 20 },
        completed: false,
        claimed: false,
        enemyType: "kobold",
        nextQuestId: 3, // Añadido para vincular con la siguiente misión
        questGiver: "Capataz Oslow",
        location: "Villadorada"
    },
    {
        id: 3,
        level: 5,
        title: "Escarmuza en la Mina del Eco",
        description: "Los obreros kóbolds están excavando más profundo en la mina. Debes detenerlos antes de que lleguen a zonas peligrosas.",
        shortDescription: "Elimina a los obreros kóbold de la mina",
        required: 12,
        progress: 0,
        reward: { bronze: 120, experience: 50 },
        completed: false,
        claimed: false,
        enemyType: "kobold_worker",
        requiresQuest: 2, // Esta misión requiere que la misión 2 esté completada
        questGiver: "Capataz Oslow",
        location: "Villadorada"
    }
];

const enemies = [
    { 
        name: "Huargo Roca Negra", 
        level: 1,
        maxHealth: 20,
        currentHealth: 20,
        type: "huargo",
        icon: "https://wow.zamimg.com/uploads/screenshots/normal/49871-huargo-roca-negra.jpg",
        respawnTimer: null
    },
    { 
        name: "Trabajador Kóbold", 
        level: 3,
        maxHealth: 35,
        currentHealth: 35,
        type: "kobold",
        icon: "https://wow.zamimg.com/uploads/screenshots/normal/73677-trabajador-kobold.jpg",
        respawnTimer: null
    },
    {
        name: "Obrero Kóbold",
        level: 5,
        maxHealth: 60,
        currentHealth: 60,
        type: "kobold_worker",
        icon: "https://wow.zamimg.com/uploads/screenshots/normal/73679-obrero-k%C3%B3bold.jpg",
        respawnTimer: null
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
const usePotionBtn = document.getElementById('use-potion-btn');

// Elementos del DOM para la tienda
const shopBtn = document.getElementById('shop-btn');
const shopOverlay = document.getElementById('shop-overlay');
const closeShopBtn = document.getElementById('close-shop-btn');
const buyPotionBtn = document.getElementById('buy-potion-btn');

// Elementos del DOM para el inventario
const inventoryBtn = document.getElementById('inventory-btn');
const inventoryOverlay = document.getElementById('inventory-overlay');

// Elementos para el detalle de misiones
const questDetailOverlay = document.getElementById('quest-detail-overlay');
const questDetailTitle = document.getElementById('quest-detail-title');
const questDetailLevel = document.getElementById('quest-detail-level');
const questDetailGiver = document.getElementById('quest-detail-giver');
const questDetailLocation = document.getElementById('quest-detail-location');
const questDetailIcon = document.getElementById('quest-detail-icon');
const questDetailObjective = document.getElementById('quest-detail-objective');
const questDetailProgressBar = document.getElementById('quest-detail-progress-bar');
const questDetailDescription = document.getElementById('quest-detail-description');
const questDetailBronze = document.getElementById('quest-detail-bronze');
const questDetailExp = document.getElementById('quest-detail-exp');
const questDetailClaimBtn = document.getElementById('quest-detail-claim-btn');
const closeQuestDetailBtn = document.getElementById('close-quest-detail-btn');

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
    if (infoWindow.style.display === 'block') {
        infoWindow.style.display = 'none';
    } else {
        infoWindow.style.display = 'block';
        updateReputationDisplay(); // Actualizar la visualización de reputación
        
        // Actualizar el retrato del personaje según la raza y clase
        updateCharacterPortrait();
    }
});

// Función para actualizar el retrato del personaje según raza y clase
function updateCharacterPortrait() {
    const portraitImg = document.getElementById('character-portrait');
    if (!portraitImg) return;
    
    // Determinar la URL de la imagen basada en la raza y clase
    let portraitUrl = "https://wow.zamimg.com/images/wow/icons/large/";
    
    switch (playerRace) {
        case "humano":
            portraitUrl += "achievement_character_human_";
            break;
        case "elfo_noche":
            portraitUrl += "achievement_character_nightelf_";
            break;
        case "enano":
            portraitUrl += "achievement_character_dwarf_";
            break;
        case "gnomo":
            portraitUrl += "achievement_character_gnome_";
            break;
        case "draenei":
            portraitUrl += "achievement_character_draenei_";
            break;
        default:
            portraitUrl += "achievement_character_human_";
    }
    
    // Agregar género (por simplicidad, usaremos el mismo criterio que para [GENDER])
    if (playerRace === 'elfo_noche' || playerRace === 'draenei') {
        portraitUrl += "female";
    } else {
        portraitUrl += "male";
    }
    
    portraitUrl += ".jpg";
    portraitImg.src = portraitUrl;
}

// Cerrar ventana de información
document.getElementById('close-info-btn').addEventListener('click', () => {
    infoWindow.style.display = 'none';
});

// Manejar cambios de pestañas en la ventana de información
document.querySelectorAll('.info-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remover la clase active de todos los botones y contenidos
        document.querySelectorAll('.info-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.info-tab-content').forEach(content => content.classList.remove('active'));
        
        // Agregar la clase active al botón clickeado y su contenido correspondiente
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId + '-tab').classList.add('active');
        
        // Si se selecciona la pestaña de reputación, actualizar la visualización
        if (tabId === 'reputation') {
            updateReputationDisplay();
        }
    });
});

// Evento para mostrar el mapa
mapBtn.addEventListener('click', () => {
    mapOverlay.style.display = 'flex';
});

// Evento para cerrar el mapa
closeMapBtn.addEventListener('click', () => {
    mapOverlay.style.display = 'none';
});

// Evento para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'resurrection-notification';
    notification.innerHTML = `
        <div class="resurrection-text">${message}</div>
    `;
    
    // Eliminar notificaciones anteriores
    const oldNotifications = document.querySelectorAll('.resurrection-notification');
    oldNotifications.forEach(n => n.remove());
    
    document.body.appendChild(notification);
    
    // Forzar un reflow para que la animación funcione
    notification.offsetHeight;
    
    // Activar la notificación
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Evento para abrir la tienda
shopBtn.addEventListener('click', () => {
    const potionPrice = 15;
    const stonePrice = calculateResurrectionStoneCost();
    const gnomeRepPrice = 250; // Precio aumentado considerablemente
    const stormwindRepPrice = 250; // Precio aumentado considerablemente
    
    shopOverlay.style.display = 'flex';
    
    const shopContainer = document.querySelector('#shop-container');
    shopContainer.innerHTML = `
        <h2>Tienda</h2>
        <div class="shop-menu">
            <div class="shop-category">
                <h3>Consumibles</h3>
                <div class="shop-items-row">
                    <div class="shop-item">
                        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_potion_51.jpg" alt="Poción de Curación">
                        <div class="item-info">
                            <h3>Poción de Curación</h3>
                            <p>Restaura 20 puntos de vida</p>
                            <div class="item-price">
                                <span>${potionPrice} monedas de cobre</span>
                            </div>
                            <button id="buy-health-potion" class="shop-btn">
                                Comprar (${inventory.healthPotions} disponibles)
                            </button>
                        </div>
                    </div>
                    <div class="shop-item">
                        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_jewelry_talisman_01.jpg" alt="Piedra de Resurrección">
                        <div class="item-info">
                            <h3>Piedra de Resurrección</h3>
                            <p>Te permite resucitar una vez al morir</p>
                            <div class="item-price">
                                <span>${stonePrice} monedas de cobre</span>
                            </div>
                            <button id="buy-res-stone" class="shop-btn">
                                Comprar (${inventory.resurrectionStones} disponibles)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="shop-category">
                <h3>Artículos de Reputación</h3>
                <div class="shop-items-row">
                    <div class="shop-item">
                        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_misc_gear_08.jpg" alt="Planos tecnológicos de Gnomeregan">
                        <div class="item-info">
                            <h3>Planos Tecnológicos</h3>
                            <p>Gana 250 puntos de reputación con Gnomeregan</p>
                            <div class="item-price">
                                <span>${gnomeRepPrice} monedas de cobre</span>
                            </div>
                            <button id="buy-gnome-rep-btn" class="shop-btn">Comprar</button>
                        </div>
                    </div>
                    <div class="shop-item">
                        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_misc_note_01.jpg" alt="Documentos de Ventormenta">
                        <div class="item-info">
                            <h3>Documentos de Ventormenta</h3>
                            <p>Gana 250 puntos de reputación con Ventormenta</p>
                            <div class="item-price">
                                <span>${stormwindRepPrice} monedas de cobre</span>
                            </div>
                            <button id="buy-sw-rep-btn" class="shop-btn">Comprar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <button id="close-shop-btn" class="shop-btn">Cerrar Tienda</button>
        </div>
    `;
    
    // Añadir eventos a los botones
    document.getElementById('buy-health-potion').addEventListener('click', () => {
        const currentCopper = getTotalCopper();
        if (currentCopper >= potionPrice) {
            const newTotal = currentCopper - potionPrice;
            const newMoney = distributeCopper(newTotal);
            money = newMoney;
            inventory.healthPotions += 1;
            updateMoneyDisplay();
            updatePotionButton();
            saveGameData();
            showNotification('Has comprado una Poción de Curación por ' + potionPrice + ' monedas de cobre');
            
            // Actualizar el texto del botón
            document.getElementById('buy-health-potion').textContent = `Comprar (${inventory.healthPotions} disponibles)`;
        } else {
            showNotification(`No tienes suficientes monedas. Te faltan ${potionPrice - currentCopper} monedas de cobre.`);
        }
    });
    
    document.getElementById('buy-res-stone').addEventListener('click', () => {
        const currentCopper = getTotalCopper();
        if (currentCopper >= stonePrice) {
            const newTotal = currentCopper - stonePrice;
            const newMoney = distributeCopper(newTotal);
            money = newMoney;
            inventory.resurrectionStones += 1;
            updateMoneyDisplay();
            saveGameData();
            showNotification('Has comprado una Piedra de Resurrección por ' + stonePrice + ' monedas de cobre');
            
            // Actualizar el texto del botón
            document.getElementById('buy-res-stone').textContent = `Comprar (${inventory.resurrectionStones} disponibles)`;
        } else {
            showNotification(`No tienes suficientes monedas. Te faltan ${stonePrice - currentCopper} monedas de cobre.`);
        }
    });
    
    // Evento para el botón de compra de reputación con Gnomeregan
    document.getElementById('buy-gnome-rep-btn').addEventListener('click', () => {
        const repCost = gnomeRepPrice; // Precio actualizado
        const repAmount = 250; // Cantidad de reputación que otorga
        
        const currentCopper = getTotalCopper();
        if (currentCopper >= repCost) {
            const newTotal = currentCopper - repCost;
            const newMoney = distributeCopper(newTotal);
            money = newMoney;
            
            // Otorgar reputación a Gnomeregan
            gainReputation(4, repAmount); // 4 es el ID de Gnomeregan
            
            updateMoneyDisplay();
            saveGameData();
            showNotification(`Has comprado Planos Tecnológicos y ganado ${repAmount} puntos de reputación con Gnomeregan`);
        } else {
            showNotification(`No tienes suficientes monedas. Te faltan ${repCost - currentCopper} monedas de cobre.`);
        }
    });
    
    // Evento para el botón de compra de reputación con Ventormenta
    document.getElementById('buy-sw-rep-btn').addEventListener('click', () => {
        const repCost = stormwindRepPrice; // Precio actualizado
        const repAmount = 250; // Cantidad de reputación que otorga
        
        const currentCopper = getTotalCopper();
        if (currentCopper >= repCost) {
            const newTotal = currentCopper - repCost;
            const newMoney = distributeCopper(newTotal);
            money = newMoney;
            
            // Otorgar reputación a Ventormenta
            gainReputation(1, repAmount); // 1 es el ID de Ventormenta
            
            updateMoneyDisplay();
            saveGameData();
            showNotification(`Has comprado Documentos de Ventormenta y ganado ${repAmount} puntos de reputación con Ventormenta`);
        } else {
            showNotification(`No tienes suficientes monedas. Te faltan ${repCost - currentCopper} monedas de cobre.`);
        }
    });
    
    document.getElementById('close-shop-btn').addEventListener('click', () => {
        shopOverlay.style.display = 'none';
    });
});

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
        playerMaxHealth,
        inventory,
        playerReputation, // Guardar la reputación
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
    
    // Inicializar valores de experiencia según la tabla
    playerLevel = 1;
    playerExperience = 0;
    experienceToNextLevel = experienceTable[0].expToNext; // Experiencia para nivel 1->2
    
    // Calcular la vida máxima basada en el aguante
    playerMaxHealth = calculateMaxHealth();
    playerHealth = playerMaxHealth; // Iniciar con vida completa

    // Actualizar barras de progreso
    updateExperienceDisplay();
    updateHealthBars();

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

// Evento para comenzar el juego
startBtn.addEventListener('click', () => {
    playerName = nameInput.value.trim();
    if (playerName.length > 0) {
        // Mostrar la pantalla de selección de raza y clase
        startScreen.style.display = 'none';
        raceClassScreen.style.display = 'block';
        
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
        showNotification("Por favor, introduce un nombre para tu personaje");
    }
});

// Función para actualizar el selector de clases según la raza seleccionada
function updateClassSelector() {
    const selectedRace = raceSelect.value;
    const availableClasses = raceClassMapping[selectedRace];
    
    classSelect.innerHTML = '';
    availableClasses.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
}

// Evento para cambiar las clases disponibles cuando cambia la raza
raceSelect.addEventListener('change', updateClassSelector);

// Sistema monetario
function updateMoneyDisplay() {
    // Convertir todo a cobre primero
    const totalCopper = getTotalCopper();
    
    // Redistribuir las monedas
    const newMoney = distributeCopper(totalCopper);
    
    // Actualizar el monedero
    money.gold = newMoney.gold;
    money.silver = newMoney.silver;
    money.bronze = newMoney.bronze;

    // Actualizar la visualización
    bronzeDisplay.textContent = money.bronze;
    silverDisplay.textContent = money.silver;
    goldDisplay.textContent = money.gold;
    
    saveGameData();
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
        const oldStats = { ...playerStats };
        playerLevel += 1;
        playerExperience -= experienceToNextLevel;
        
        // Obtener la nueva experiencia requerida para el siguiente nivel de la tabla
        if (playerLevel <= experienceTable.length) {
            experienceToNextLevel = experienceTable[playerLevel - 1].expToNext;
        } else {
            // Si el nivel está fuera de la tabla, aumentar un 20% respecto al anterior
            experienceToNextLevel = Math.round(experienceToNextLevel * 1.20);
        }
        
        // Aumentar los stats según la clase del personaje
        if (playerClass === "Guerrero" || playerClass === "Paladín") {
            playerStats.strength += 1;
            if (playerLevel % 2 === 0) playerStats.stamina += 1; // Cada 2 niveles
        } else if (playerClass === "Pícaro" || playerClass === "Cazador") {
            playerStats.agility += 1;
            if (playerLevel % 2 === 0) playerStats.stamina += 1; // Cada 2 niveles
        } else if (playerClass === "Mago" || playerClass === "Brujo") {
            playerStats.intellect += 1;
            if (playerLevel % 2 === 0) playerStats.spirit += 1; // Cada 2 niveles
        } else if (playerClass === "Sacerdote") {
            if (playerLevel % 2 === 0) {
                playerStats.spirit += 1;
                playerStats.intellect += 1;
            }
        } else if (playerClass === "Druida" || playerClass === "Chamán") {
            if (playerLevel % 3 === 0) { // Cada 3 niveles
                playerStats.intellect += 1;
                playerStats.spirit += 1;
                playerStats.strength += 1;
            }
        }
        
        // Recalcular la vida máxima basada en el nuevo aguante
        const oldMaxHealth = playerMaxHealth;
        playerMaxHealth = calculateMaxHealth();
        const healthIncrease = playerMaxHealth - oldMaxHealth;
        
        // Restaurar la vida del jugador al máximo cuando sube de nivel
        playerHealth = playerMaxHealth;
        updateHealthBars();
        
        // Actualizar toda la información del personaje en la ventana de información
        infoLevel.textContent = playerLevel;
        document.getElementById('info-strength').textContent = playerStats.strength;
        document.getElementById('info-agility').textContent = playerStats.agility;
        document.getElementById('info-stamina').textContent = playerStats.stamina;
        document.getElementById('info-intellect').textContent = playerStats.intellect;
        document.getElementById('info-spirit').textContent = playerStats.spirit;
        
        updateExperienceDisplay();
        
        // Crear mensaje de mejoras
        let statsMessage = '';
        if (playerStats.strength > oldStats.strength) statsMessage += `\n⚔️ Fuerza +${playerStats.strength - oldStats.strength}`;
        if (playerStats.agility > oldStats.agility) statsMessage += `\n🏃 Agilidad +${playerStats.agility - oldStats.agility}`;
        if (playerStats.stamina > oldStats.stamina) statsMessage += `\n❤️ Aguante +${playerStats.stamina - oldStats.stamina}`;
        if (playerStats.intellect > oldStats.intellect) statsMessage += `\n🔮 Intelecto +${playerStats.intellect - oldStats.intellect}`;
        if (playerStats.spirit > oldStats.spirit) statsMessage += `\n✨ Espíritu +${playerStats.spirit - oldStats.spirit}`;
        if (healthIncrease > 0) statsMessage += `\n❤️ Vida Máxima +${healthIncrease}`;
        
        // Mostrar la notificación en pantalla
        showLevelUpNotification(playerLevel, statsMessage);
        
        // Si el jugador todavía tiene experiencia para otro nivel, llamar recursivamente
        if (playerExperience >= experienceToNextLevel) {
            levelUp();
        }
        
        saveGameData();
    }
}

// Función para mostrar la notificación de subida de nivel
function showLevelUpNotification(level, statsMessage) {
    // Eliminar notificaciones anteriores de nivel
    const oldNotifications = document.querySelectorAll('.level-up-notification');
    oldNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <div class="level-up-title">¡Nivel ${level}!</div>
        <div class="level-up-stats">${statsMessage}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Forzar un reflow para que la animación funcione
    notification.offsetHeight;
    
    // Activar la notificación
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Función para calcular la experiencia que da un enemigo
function calculateExperience(enemyLevel) {
    // Obtener la experiencia base según el nivel del jugador (desde la tabla)
    const playerEntry = experienceTable[playerLevel - 1];
    const baseExperience = playerEntry ? playerEntry.mobExp : 50; // Valor por defecto si no se encuentra el nivel

    const levelDifference = enemyLevel - playerLevel;

    // Ajustar experiencia según la diferencia de niveles
    if (levelDifference < -7) {
        return 0; // No da experiencia si el personaje tiene más de 7 niveles por encima
    }

    if (levelDifference < -5) {
        return Math.round(baseExperience * 0.1); // 10% de la experiencia base
    }

    if (levelDifference < -3) {
        return Math.round(baseExperience * 0.3); // 30% de la experiencia base
    }

    if (levelDifference <= 0) {
        // Entre 60% y 100% de la experiencia base para enemigos de nivel inferior o igual
        const percent = 0.6 + ((3 + levelDifference) * 0.1);
        return Math.round(baseExperience * percent);
    }

    if (levelDifference <= 3) {
        // 100% a 120% de la experiencia base para enemigos hasta 3 niveles superiores
        return Math.round(baseExperience * (1 + levelDifference * 0.07));
    }

    if (levelDifference <= 5) {
        // 120% a 140% para enemigos 4-5 niveles superiores
        return Math.round(baseExperience * (1.2 + (levelDifference - 3) * 0.1));
    }

    // 150% para enemigos muy superiores
    return Math.round(baseExperience * 1.5);
}

// Función para calcular las monedas que da un enemigo
function calculateMoneyReward(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;
    const baseReward = 5;

    if (levelDifference < -7) {
        return 1; // Mínimo de monedas
    }

    if (levelDifference < -3) {
        return Math.round(baseReward * 0.4); // 40% de la recompensa base
    }

    if (levelDifference <= 3) {
        return Math.round(baseReward * (1 + levelDifference * 0.2)); // Recompensa base + 20% por nivel
    }

    if (levelDifference <= 5) {
        return Math.round(baseReward * (1.6 + (levelDifference - 3) * 0.3)); // 160% base + 30% extra por nivel
    }

    return Math.round(baseReward * 2.5); // 250% de la recompensa base para enemigos muy superiores
}

// Función para calcular el daño del enemigo
function calculateEnemyDamage(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;
    
    // Calcular el daño base considerando el nivel del enemigo y la vida máxima del jugador
    // Aproximadamente entre un 8-12% de la vida máxima del jugador por turno para enemigos del mismo nivel
    const baseDamagePercent = 0.1; // 10% de la vida máxima por golpe para enemigos del mismo nivel
    const baseDamage = Math.floor((playerMaxHealth * baseDamagePercent) + (enemyLevel * 0.8));
    
    let damageMultiplier = 1;

    // Ajustar multiplicador según diferencia de niveles
    if (levelDifference < -7) {
        // Enemigos extremadamente débiles
        damageMultiplier = 0.15; // 15% del daño base
    } else if (levelDifference < -5) {
        // Enemigos muy débiles
        damageMultiplier = 0.25; // 25% del daño base
    } else if (levelDifference < -3) {
        // Enemigos débiles
        damageMultiplier = 0.4; // 40% del daño base
    } else if (levelDifference < 0) {
        // Enemigos de nivel inferior pero cercano
        damageMultiplier = 0.7 + (levelDifference * 0.1); // 70-90% del daño base
    } else if (levelDifference === 0) {
        // Enemigos del mismo nivel
        damageMultiplier = 1.0; // 100% del daño base
    } else if (levelDifference <= 2) {
        // Enemigos ligeramente superiores
        damageMultiplier = 1.0 + (levelDifference * 0.15); // 115-130% del daño base
    } else if (levelDifference <= 4) {
        // Enemigos superiores
        damageMultiplier = 1.3 + ((levelDifference - 2) * 0.2); // 130-170% del daño base
    } else {
        // Enemigos muy superiores
        damageMultiplier = 1.7 + ((levelDifference - 4) * 0.15); // 170%+ del daño base
    }
    
    // Factor de defensa: reducir ligeramente el daño basado en el aguante del jugador (resistencia)
    const staminaReduction = 1 - (playerStats.stamina * 0.02); // Cada punto de aguante reduce 2% el daño, hasta un máximo de 40%
    const defenseMultiplier = Math.max(0.6, staminaReduction); // No permitir que la reducción sea mayor al 40%
    
    // Calcular daño final con variación
    let finalDamage = Math.round(baseDamage * damageMultiplier * defenseMultiplier);
    
    // Añadir variación aleatoria entre 85% y 115%
    const randomVariation = 0.85 + (Math.random() * 0.3);
    finalDamage = Math.round(finalDamage * randomVariation);
    
    // Garantizar un daño mínimo de 1
    return Math.max(1, finalDamage);
}

// Función para determinar el color del nivel del enemigo
function getLevelColor(enemyLevel) {
    const levelDifference = enemyLevel - playerLevel;

    if (levelDifference < -7) {
        return 'gray'; // Enemigo muy inferior (gris)
    } else if (levelDifference < -3) {
        return 'green'; // Enemigo inferior (verde)
    } else if (levelDifference <= 2) {
        return 'yellow'; // Enemigo de nivel similar (amarillo)
    } else if (levelDifference <= 4) {
        return 'orange'; // Enemigo superior (naranja)
    } else {
        return 'red'; // Enemigo muy superior (rojo)
    }
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

// Función para actualizar el texto del botón de pociones
function updatePotionButton() {
    usePotionBtn.textContent = `Usar Poción (${inventory.healthPotions})`;
}

// Evento para usar poción en combate
usePotionBtn.addEventListener('click', () => {
    if (combatOverlay.style.display === 'flex') {
        useHealthPotion();
        updatePotionButton();
    }
});

// Modificar la función startCombat
function startCombat(enemy) {
    if (isCombatActive || enemy.currentHealth <= 0) {
        if (enemy.currentHealth <= 0) {
            showNotification("Este enemigo está muerto y no puede ser atacado.");
        }
        return;
    }

    // Limpiar el overlay de combate anterior y restablecer el estado
    combatOverlay.innerHTML = '';
    isCombatActive = true;
    currentEnemy = enemy;
    enemyHealth = enemy.maxHealth;

    const combatContent = document.createElement('div');
    combatContent.className = 'combat-content';
    
    // Añadir el indicador de turno
    const turnIndicator = document.createElement('div');
    turnIndicator.className = 'turn-indicator player-turn';
    turnIndicator.textContent = '¡Tu Turno!';
    combatContent.appendChild(turnIndicator);

    combatContent.innerHTML += `
        <div class="enemy-info">
            <img src="${enemy.icon}" id="enemy-combat-image" class="enemy-combat-image">
            <div class="enemy-stats">
                <h3>${enemy.name}</h3>
                <div class="stat-row">
                    <span class="stat-label">Nivel:</span>
                    <span class="stat-value ${getLevelColor(enemy.level)}">${enemy.level}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Salud:</span>
                    <span class="stat-value">${enemy.maxHealth}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Daño:</span>
                    <span class="stat-value">${calculateEnemyDamage(enemy.level)}</span>
                </div>
            </div>
        </div>
        <div class="combat-bars">
            <div class="health-container enemy-health">
                <div class="health-bar">
                    <div id="enemy-combat-health-bar" class="health-progress"></div>
                </div>
                <span id="enemy-health-text">${enemyHealth} / ${currentEnemy.maxHealth}</span>
            </div>
            <div class="health-container player-health">
                <div class="health-bar">
                    <div id="player-combat-health-bar" class="health-progress"></div>
                </div>
                <span id="player-health-text">${playerHealth} / ${playerMaxHealth}</span>
            </div>
        </div>
        <div class="combat-controls">
            <button id="attack-btn">Atacar</button>
            <button id="use-potion-btn">Usar Poción (${inventory.healthPotions})</button>
            <button id="flee-btn">Huir</button>
        </div>
    `;

    combatOverlay.appendChild(combatContent);

    let isPlayerTurn = true;

    function disableButtons(disabled) {
        document.getElementById('attack-btn').disabled = disabled;
        document.getElementById('use-potion-btn').disabled = disabled;
        document.getElementById('flee-btn').disabled = disabled;
    }

    function updateTurnIndicator(isPlayerTurn) {
        const turnIndicator = document.querySelector('.turn-indicator');
        turnIndicator.className = `turn-indicator ${isPlayerTurn ? 'player-turn' : 'enemy-turn'}`;
        turnIndicator.textContent = isPlayerTurn ? '¡Tu Turno!' : '¡Turno Enemigo!';
    }

    function enemyTurn() {
        isPlayerTurn = false;
        updateTurnIndicator(false);
        disableButtons(true);

        setTimeout(() => {
            const enemyDamage = calculateEnemyDamage(currentEnemy.level);
            playerHealth = Math.max(playerHealth - enemyDamage, 0);
            
            // Crear notificación de daño del enemigo
            const enemyDamageNotification = document.createElement('div');
            enemyDamageNotification.className = 'damage-notification';
            enemyDamageNotification.textContent = `-${enemyDamage}`;
            enemyDamageNotification.style.top = '70%';
            
            document.querySelector('.player-health').appendChild(enemyDamageNotification);
            
            setTimeout(() => {
                enemyDamageNotification.remove();
            }, 1000);
            
            updateHealthBars();
            
            if (playerHealth <= 0) {
                handlePlayerDeath();
            } else {
                setTimeout(() => {
                    isPlayerTurn = true;
                    updateTurnIndicator(true);
                    disableButtons(false);
                }, 1000);
            }
        }, 1500);
    }

    document.getElementById('attack-btn').addEventListener('click', () => {
        if (!isPlayerTurn || currentEnemy.currentHealth <= 0) return;

        const playerDamage = calculateDamage();
        enemyHealth = Math.max(enemyHealth - playerDamage, 0);
        
        // Crear notificación de daño del jugador
        const playerDamageNotification = document.createElement('div');
        playerDamageNotification.className = 'damage-notification';
        playerDamageNotification.textContent = `-${playerDamage}`;
        playerDamageNotification.style.top = '30%';
        
        document.querySelector('.enemy-info').appendChild(playerDamageNotification);
        
        setTimeout(() => {
            playerDamageNotification.remove();
        }, 1000);
        
        updateHealthBars();
        
        if (enemyHealth <= 0) {
            handleEnemyDeath();
        } else {
            enemyTurn();
        }
    });

    document.getElementById('use-potion-btn').addEventListener('click', () => {
        if (!isPlayerTurn) return;
        useHealthPotion();
        updatePotionButton();
        if (inventory.healthPotions > 0) {
            enemyTurn();
        }
    });

    document.getElementById('flee-btn').addEventListener('click', () => {
        if (!isPlayerTurn) return;
        const fleeChance = Math.random();
        const fleeSuccess = fleeChance > 0.3; // 70% de probabilidad de éxito
        
        if (fleeSuccess) {
            showNotification("Has huido con éxito del combate.");
            setTimeout(() => {
                combatOverlay.style.display = 'none';
                combatOverlay.innerHTML = ''; // Limpiar el contenido
                isCombatActive = false; // Restablecer el estado del combate al huir
                currentEnemy = null; // Limpiar la referencia al enemigo actual
                isPlayerTurn = true; // Restablecer el turno
            }, 1000);
        } else {
            const fleeMessage = document.createElement('div');
            fleeMessage.className = 'flee-message';
            fleeMessage.textContent = `¡No has podido huir!`;
            document.querySelector('.combat-content').appendChild(fleeMessage);
            
            setTimeout(() => fleeMessage.remove(), 2000);
            
            enemyTurn();
        }
    });

    const enemyHealthPercentage = (enemyHealth / currentEnemy.maxHealth) * 100;
    const enemyCombatHealthBar = document.getElementById('enemy-combat-health-bar');
    enemyCombatHealthBar.style.width = `${enemyHealthPercentage}%`;

    combatOverlay.style.display = 'flex';
    updateHealthBars();
    updatePotionButton();
}

// Función para actualizar las barras de salud
function updateHealthBars() {
    const playerHealthPercentage = (playerHealth / playerMaxHealth) * 100;
    // Actualizar la barra de progreso
    const healthProgress = document.getElementById('health-progress');
    healthProgress.style.width = `${playerHealthPercentage}%`;

    // Actualizar el texto de la vida
    const healthText = document.getElementById('health-text');
    healthText.textContent = `${playerHealth} / ${playerMaxHealth}`;

    // Si estás en combate, también actualiza la barra de vida
    if (combatOverlay.style.display === 'flex') {
        const playerCombatHealthBar = document.getElementById('player-combat-health-bar');
        playerCombatHealthBar.style.width = `${playerHealthPercentage}%`;
        document.getElementById('player-health-text').textContent = `${playerHealth} / ${playerMaxHealth}`;
        
        const enemyHealthPercentage = (enemyHealth / currentEnemy.maxHealth) * 100;
        const enemyCombatHealthBar = document.getElementById('enemy-combat-health-bar');
        enemyCombatHealthBar.style.width = `${enemyHealthPercentage}%`;
        document.getElementById('enemy-health-text').textContent = `${enemyHealth} / ${currentEnemy.maxHealth}`;
    }
}

// Función para calcular el daño basado en las estadísticas de la clase
function calculateDamage() {
    let baseDamage = 0;
    
    switch(playerClass) {
        case "Guerrero":
            // Daño basado principalmente en fuerza
            baseDamage = Math.floor(playerStats.strength * 2 + playerStats.agility * 0.5);
            break;
        case "Pícaro":
            // Daño basado principalmente en agilidad
            baseDamage = Math.floor(playerStats.agility * 2 + playerStats.strength * 0.5);
            break;
        case "Cazador":
            // Daño basado principalmente en agilidad
            baseDamage = Math.floor(playerStats.agility * 2 + playerStats.strength * 0.3);
            break;
        case "Mago":
            // Daño basado principalmente en intelecto
            baseDamage = Math.floor(playerStats.intellect * 2.2);
            break;
        case "Sacerdote":
            // Daño basado en intelecto y espíritu
            baseDamage = Math.floor(playerStats.intellect * 1.5 + playerStats.spirit * 0.8);
            break;
        case "Brujo":
            // Daño basado principalmente en intelecto
            baseDamage = Math.floor(playerStats.intellect * 2 + playerStats.spirit * 0.5);
            break;
        case "Druida":
            // Daño híbrido basado en intelecto y fuerza
            baseDamage = Math.floor((playerStats.intellect + playerStats.strength) * 1.3);
            break;
        case "Chamán":
            // Daño híbrido basado en intelecto y espíritu
            baseDamage = Math.floor(playerStats.intellect * 1.5 + playerStats.spirit * 0.8);
            break;
        case "Paladín":
            // Daño basado en fuerza y espíritu
            baseDamage = Math.floor(playerStats.strength * 1.8 + playerStats.spirit * 0.5);
            break;
        default:
            baseDamage = 5;
    }
    
    // Aumentar el daño base según el nivel del jugador (5% más por nivel)
    return Math.floor(baseDamage * (1 + (playerLevel - 1) * 0.05));
}

// Función para abrir y renderizar el inventario
function openInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';
    
    // Renderizar pociones de vida
    const potionSlot = document.createElement('div');
    potionSlot.className = 'inventory-slot';
    potionSlot.innerHTML = `
        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_potion_51.jpg" alt="Poción de Curación">
        <div class="item-info">
            <span class="item-name">Poción de Curación</span>
            <span class="item-quantity">x${inventory.healthPotions}</span>
        </div>
    `;
    if (inventory.healthPotions > 0) {
        potionSlot.addEventListener('click', () => {
            if (playerHealth < playerMaxHealth) {
                useHealthPotion();
                openInventory(); // Actualizar el inventario
            } else {
                showNotification("Tu vida ya está al máximo");
            }
        });
        potionSlot.style.cursor = 'pointer';
    }
    inventoryGrid.appendChild(potionSlot);
    
    // Renderizar piedras de resurrección
    const stoneSlot = document.createElement('div');
    stoneSlot.className = 'inventory-slot';
    stoneSlot.innerHTML = `
        <img src="https://wow.zamimg.com/images/wow/icons/large/inv_jewelry_talisman_01.jpg" alt="Piedra de Resurrección">
        <div class="item-info">
            <span class="item-name">Piedra de Resurrección</span>
            <span class="item-quantity">x${inventory.resurrectionStones}</span>
        </div>
    `;
    inventoryGrid.appendChild(stoneSlot);
    
    inventoryOverlay.style.display = 'flex';
}

// Modificar la función useHealthPotion para actualizar el inventario
function useHealthPotion() {
    if (inventory.healthPotions > 0 && playerHealth < playerMaxHealth) {
        inventory.healthPotions -= 1;
        playerHealth = Math.min(playerHealth + 20, playerMaxHealth);
        updateHealthBars();
        saveGameData();
        showNotification(`Has usado una poción. Vida actual: ${playerHealth}/${playerMaxHealth}`);
        
        // Actualizar el botón de pociones en combate si está visible
        if (combatOverlay.style.display === 'flex') {
            updatePotionButton();
        }
    } else if (inventory.healthPotions <= 0) {
        showNotification("No tienes pociones de curación");
    } else {
        showNotification("Tu vida ya está al máximo");
    }
}

// Función para calcular el coste de la resurrección
function calculateResurrectionCost() {
    return Math.floor(50 * Math.pow(1.2, playerLevel - 1)); // 50 cobre base, aumenta un 20% por nivel
}

// Función para calcular el coste de la piedra de resurrección
function calculateResurrectionStoneCost() {
    return Math.floor(100 * Math.pow(1.3, playerLevel - 1)); // 100 cobre base, aumenta un 30% por nivel
}

// Función para mostrar la interfaz de muerte
function showDeathInterface() {
    const deathOverlay = document.createElement('div');
    deathOverlay.className = 'death-overlay';
    
    const resurrectionCost = calculateResurrectionCost();
    const totalCopper = getTotalCopper();
    
    deathOverlay.innerHTML = `
        <div class="death-container">
            <div class="death-title">Has muerto</div>
            ${(inventory.resurrectionStones === 0 && totalCopper < resurrectionCost) ? 
                `<div class="death-message">No tienes dinero ni piedras de resurrección para continuar y debes reiniciar el juego.</div>` : ''
            }
            <div class="death-options">
                ${inventory.resurrectionStones > 0 ? 
                    `<button id="use-stone-btn" class="resurrection-btn">
                        Usar Piedra de Resurrección (${inventory.resurrectionStones})
                    </button>` : ''
                }
                ${totalCopper >= resurrectionCost ? 
                    `<button id="pay-resurrection-btn" class="resurrection-btn">
                        Pagar Resurrección (${resurrectionCost} monedas)
                    </button>` : ''
                }
                ${(inventory.resurrectionStones === 0 && totalCopper < resurrectionCost) ?
                    `<button id="reset-game-btn" class="resurrection-btn reset-btn">
                        Reiniciar Juego
                    </button>` : ''
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(deathOverlay);
    
    // Ocultar la interfaz principal
    container.style.display = 'none';
    
    // Eventos para los botones
    const useStoneBtn = document.getElementById('use-stone-btn');
    const payResurrectionBtn = document.getElementById('pay-resurrection-btn');
    const resetGameBtn = document.getElementById('reset-game-btn');
    
    if (useStoneBtn) {
        useStoneBtn.addEventListener('click', () => {
            inventory.resurrectionStones--;
            resurrectPlayer();
            deathOverlay.remove();
        });
    }
    
    if (payResurrectionBtn) {
        payResurrectionBtn.addEventListener('click', () => {
            const newTotal = getTotalCopper() - resurrectionCost;
            const newMoney = distributeCopper(newTotal);
            money.gold = newMoney.gold;
            money.silver = newMoney.silver;
            money.bronze = newMoney.bronze;
            updateMoneyDisplay();
            resurrectPlayer();
            deathOverlay.remove();
        });
    }
    
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', () => {
            resetGame();
        });
    }
}

// Función para resucitar al jugador
function resurrectPlayer() {
    playerHealth = playerMaxHealth;
    updateHealthBars();
    container.style.display = 'flex';
    saveGameData();
    
    // Mostrar notificación de resurrección
    showResurrectionNotification();
}

// Función para mostrar la notificación de resurrección
function showResurrectionNotification() {
    const notification = document.createElement('div');
    notification.className = 'resurrection-notification';
    notification.innerHTML = `
        <div class="resurrection-title">¡Has resucitado!</div>
        <div class="resurrection-text">Has vuelto a la vida con toda tu salud.</div>
    `;
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Función para manejar la muerte del jugador
function handlePlayerDeath() {
    combatOverlay.style.display = 'none';
    isCombatActive = false; // Restablecer el estado del combate al morir
    showDeathInterface();
    saveGameData();
}

// Modificar la función handleEnemyDeath
function handleEnemyDeath() {
    // Deshabilitar todos los botones de combate
    const attackBtn = document.getElementById('attack-btn');
    const fleeBtn = document.getElementById('flee-btn');
    const usePotionBtn = document.getElementById('use-potion-btn');
    
    if (attackBtn) attackBtn.disabled = true;
    if (fleeBtn) fleeBtn.disabled = true;
    if (usePotionBtn) usePotionBtn.disabled = true;
    
    const experienceGained = calculateExperience(currentEnemy.level);
    playerExperience += experienceGained;
    updateExperienceDisplay();
    levelUp();

    const moneyReward = calculateMoneyReward(currentEnemy.level);
    money.bronze += moneyReward;
    updateMoneyDisplay();

    showNotification(`Has obtenido ${moneyReward} ${moneyReward === 1 ? 'moneda de cobre' : 'monedas de cobre'} y ${experienceGained} experiencia.`);

    updateQuestProgress(currentEnemy.type);

    currentEnemy.currentHealth = 0;
    currentEnemy.respawnTimer = 5;
    
    const deadEnemy = currentEnemy;
    
    // Crear y mostrar el mensaje de victoria
    const victoryMessage = document.createElement('div');
    victoryMessage.className = 'victory-message';
    victoryMessage.innerHTML = `
        ¡Has derrotado a ${currentEnemy.name}!
        <div class="countdown">La ventana se cerrará en 2 segundos</div>
    `;
    document.querySelector('.combat-content').appendChild(victoryMessage);
    
    // Actualizar la cuenta atrás
    let timeLeft = 2;
    const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            victoryMessage.querySelector('.countdown').textContent = `La ventana se cerrará en ${timeLeft} segundo${timeLeft !== 1 ? 's' : ''}`;
        }
    }, 1000);
    
    const respawnInterval = setInterval(() => {
        if (deadEnemy.respawnTimer > 0) {
            deadEnemy.respawnTimer -= 1;
            renderEnemies();

            if (deadEnemy.respawnTimer <= 0) {
                clearInterval(respawnInterval);
                deadEnemy.currentHealth = deadEnemy.maxHealth;
                deadEnemy.respawnTimer = null;
                renderEnemies();
            }
        }
    }, 1000);
    
    // Desactivar los clics en enemigos durante la animación de victoria
    const enemyElements = document.querySelectorAll('#enemy-list li');
    enemyElements.forEach(el => {
        el.style.pointerEvents = 'none';
    });
    
    // Cerrar la ventana de combate después de 2 segundos
    setTimeout(() => {
        clearInterval(countdownInterval);
        combatOverlay.style.display = 'none';
        isCombatActive = false; // Restablecer el estado del combate
        
        // Reactivar los clics en enemigos
        enemyElements.forEach(el => {
            el.style.pointerEvents = 'auto';
        });
        
        // Limpiar el contenido del overlay
        combatOverlay.innerHTML = '';
    }, 2000);
    
    saveGameData();
}

// Sistema de misiones
function updateQuestProgress(enemyType) {
    quests.forEach(quest => {
        // Verificar si la misión está disponible (no reclamada y cumple los prerrequisitos)
        const isAvailable = !quest.claimed && (!quest.requiresQuest || quests.find(prevQuest => 
            prevQuest.id === quest.requiresQuest && prevQuest.claimed
        ));
        
        if (!quest.completed && quest.enemyType === enemyType && isAvailable) {
            quest.progress = Math.min(quest.progress + 1, quest.required);
            if (quest.progress >= quest.required) {
                quest.completed = true;
            }
            renderQuests();
        }
    });
    saveGameData();
}

function claimQuest(quest) {
    if (quest.completed && !quest.claimed) {
        quest.claimed = true;
        money.bronze += quest.reward.bronze;
        playerExperience += quest.reward.experience;
        
        // Ganar reputación con Ventormenta al completar misiones
        gainReputation(1, 25 * quest.level); // 25 puntos por nivel de la misión
        
        // Ganar reputación con Gnomeregan si el jugador es gnomo o si la misión es de un nivel alto
        if (playerRace === "gnomo" || quest.level >= 5) {
            gainReputation(4, 20 * quest.level); // 20 puntos por nivel de la misión para Gnomeregan
        }
        
        // Mostrar notificación de recompensa
        showNotification(`¡Misión completada! Has obtenido ${quest.reward.bronze} monedas de cobre y ${quest.reward.experience} experiencia.`);
        
        updateMoneyDisplay();
        updateExperienceDisplay();
        levelUp();
        renderQuests();
        saveGameData();
        
        // Si está abierto el overlay de detalles, cerrarlo
        if (questDetailOverlay.style.display === 'flex') {
            questDetailOverlay.style.display = 'none';
        }
    }
}

// Función para renderizar misiones
function renderQuests() {
    questList.innerHTML = '';
    quests
        .filter(q => !q.claimed && (!q.requiresQuest || quests.find(prevQuest => prevQuest.id === q.requiresQuest && prevQuest.claimed)))
        .sort((a, b) => a.level - b.level)
        .forEach(quest => {
        const li = document.createElement('li');
        const title = document.createElement('div');
        title.innerHTML = `<span style="color: #00FF00;">[Nivel ${quest.level}]</span> ${quest.title}`;
        title.className = 'quest-title';
        
        const objective = document.createElement('div');
        objective.className = 'quest-objective' + (quest.completed ? ' completed' : '');
        
        const icon = document.createElement('img');
        icon.src = enemies.find(e => e.type === quest.enemyType).icon;
        icon.className = 'enemy-icon';
        icon.draggable = false;
        
        objective.appendChild(icon);
        
        // Crear un elemento para el texto
        const enemyText = quest.enemyType === 'huargo' ? 'Huargos Roca Negra' : 
                          quest.enemyType === 'kobold' ? 'Trabajadores Kóbold' : 
                          'Obreros Kóbold';
        const progressText = document.createElement('div');
        progressText.textContent = `${quest.progress}/${quest.required} ${enemyText} - ${quest.shortDescription}`;
        objective.appendChild(progressText);
        
        // Añadir información de la recompensa
        const reward = document.createElement('div');
        reward.className = 'quest-reward';
        reward.innerHTML = `<img src="https://wow.zamimg.com/images/wow/icons/large/inv_misc_coin_01.jpg" class="coin-icon bronze-coin"><span>Recompensa: ${quest.reward.bronze} cobre y ${quest.reward.experience} exp</span>`;
        
        // Añadir barra de progreso
        const progressBar = document.createElement('div');
        progressBar.className = 'quest-progress';
        const progressBarInner = document.createElement('div');
        progressBarInner.className = 'quest-progress-bar';
        progressBarInner.style.width = `${(quest.progress/quest.required)*100}%`;
        progressBar.appendChild(progressBarInner);
        
        li.appendChild(title);
        li.appendChild(objective);
        li.appendChild(progressBar);
        li.appendChild(reward);
        
        // Añadir comportamiento al hacer clic en la misión
        li.addEventListener('click', () => {
            if (quest.completed) {
                claimQuest(quest);
            } else {
                showQuestDetails(quest);
            }
        });
        
        // Añadir clase 'clickable' para indicar visualmente que es interactivo
        li.className = quest.completed ? 'completed clickable' : 'clickable';
        
        questList.appendChild(li);
    });
}

// Función para mostrar los detalles de una misión
function showQuestDetails(quest) {
    // Verificar que todos los campos necesarios existan
    if (!quest) return;
    
    // Establecer los valores en el overlay
    questDetailTitle.textContent = quest.title || "Misión sin título";
    questDetailLevel.textContent = quest.level || "?";
    questDetailGiver.textContent = quest.questGiver || "Desconocido";
    questDetailLocation.textContent = quest.location || "Desconocido";
    
    // Establecer el icono
    const enemy = enemies.find(e => e.type === quest.enemyType);
    if (enemy && enemy.icon) {
        questDetailIcon.src = enemy.icon;
    } else {
        questDetailIcon.src = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
    }
    
    // Información de progreso
    let objectiveText = "enemigos";
    if (quest.enemyType === 'huargo') {
        objectiveText = "Huargos Roca Negra";
    } else if (quest.enemyType === 'kobold') {
        objectiveText = "Trabajadores Kóbold";
    } else if (quest.enemyType === 'kobold_worker') {
        objectiveText = "Obreros Kóbold";
    }
    
    questDetailObjective.textContent = `${quest.progress || 0}/${quest.required || '?'} ${objectiveText} eliminados`;
    
    // Barra de progreso
    const progressPercentage = quest.required ? (quest.progress / quest.required) * 100 : 0;
    questDetailProgressBar.style.width = `${progressPercentage}%`;
    
    // Establecer recompensas
    questDetailBronze.textContent = quest.reward ? quest.reward.bronze : 0;
    questDetailExp.textContent = quest.reward ? quest.reward.experience : 0;
    
    // Personalizar descripción con el nombre del jugador y género
    let personalizedDescription = quest.description || "No hay descripción disponible para esta misión.";
    personalizedDescription = personalizedDescription.replace(/\[NAME\]/g, playerName || "Aventurero");
    
    // Determinar el género basado en la raza
    const gender = (playerRace === 'elfo_noche' || playerRace === 'draenei') ? 'la nueva' : 'el nuevo';
    personalizedDescription = personalizedDescription.replace(/\[GENDER\]/g, gender);
    
    questDetailDescription.textContent = personalizedDescription;
    
    // Configurar el botón de reclamar
    if (quest.completed && !quest.claimed) {
        questDetailClaimBtn.style.display = 'block';
        questDetailClaimBtn.onclick = () => {
            claimQuest(quest);
            questDetailOverlay.style.display = 'none';
        };
    } else {
        questDetailClaimBtn.style.display = 'none';
    }
    
    // Mostrar el overlay
    questDetailOverlay.style.display = 'flex';
}

// Función para cerrar el overlay de detalles de misión
closeQuestDetailBtn.addEventListener('click', () => {
    questDetailOverlay.style.display = 'none';
});

// Función para convertir todas las monedas a cobre
function getTotalCopper() {
    return money.bronze + (money.silver * 100) + (money.gold * 10000);
}

// Función para distribuir el cobre en oro, plata y cobre
function distributeCopper(totalCopper) {
    let remaining = totalCopper;
    
    // Calcular oro
    const gold = Math.floor(remaining / 10000);
    remaining = remaining % 10000;
    
    // Calcular plata
    const silver = Math.floor(remaining / 100);
    remaining = remaining % 100;
    
    // El resto es cobre
    const bronze = remaining;
    
    return { gold, silver, bronze };
}

// Función para calcular la vida máxima basada en el aguante
function calculateMaxHealth() {
    // Vida base + 10 puntos de vida por cada punto de aguante
    return 60 + (playerStats.stamina * 10);
}

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la barra de experiencia con los valores correctos
    updateExperienceDisplay();
    
    // Inicializar los eventos para la ventana de información
    initializeInfoWindowEvents();
    
    // Cargar datos guardados
    loadGameData();
    
    // Verificar si hay datos guardados
    const savedData = localStorage.getItem('gameData');
    if (!savedData) {
        startScreen.style.display = 'flex';
        container.style.display = 'none';
    } else {
        startScreen.style.display = 'none';
        container.style.display = 'flex';
    }

    // Configurar eventos del inventario
    if (inventoryBtn) {
        inventoryBtn.addEventListener('click', () => {
            openInventory();
        });
    }
    
    if (inventoryOverlay) {
        const closeInventoryBtn = inventoryOverlay.querySelector('#close-inventory-btn');
        if (closeInventoryBtn) {
            closeInventoryBtn.addEventListener('click', () => {
                inventoryOverlay.style.display = 'none';
            });
        }
    }
    
    // Evento para el botón de compra de reputación con Gnomeregan
    const buyGnomeRepBtn = document.getElementById('buy-gnome-rep-btn');
    if (buyGnomeRepBtn) {
        buyGnomeRepBtn.addEventListener('click', () => {
            const repCost = 45; // Costo en monedas de cobre
            const repAmount = 250; // Cantidad de reputación que otorga
            
            const currentCopper = getTotalCopper();
            if (currentCopper >= repCost) {
                const newTotal = currentCopper - repCost;
                const newMoney = distributeCopper(newTotal);
                money = newMoney;
                
                // Otorgar reputación a Gnomeregan
                gainReputation(4, repAmount); // 4 es el ID de Gnomeregan
                
                updateMoneyDisplay();
                saveGameData();
                showNotification(`Has comprado Planos Tecnológicos y ganado ${repAmount} puntos de reputación con Gnomeregan`);
            } else {
                showNotification(`No tienes suficientes monedas. Te faltan ${repCost - currentCopper} monedas de cobre.`);
            }
        });
    }
    
    // Actualizar la barra de vida del jugador
    updateHealthBars();
});

// Función para inicializar los eventos de la ventana de información
function initializeInfoWindowEvents() {
    const closeInfoBtn = document.getElementById('close-info-btn');
    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', () => {
            document.getElementById('info-window').style.display = 'none';
        });
    }
    
    document.querySelectorAll('.info-tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Remover la clase active de todos los botones y contenidos
            document.querySelectorAll('.info-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.info-tab-content').forEach(content => content.classList.remove('active'));
            
            // Agregar la clase active al botón clickeado y su contenido correspondiente
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId + '-tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Si se selecciona la pestaña de reputación, actualizar la visualización
            if (tabId === 'reputation') {
                updateReputationDisplay();
            }
        });
    });
}

// Cargar datos del juego desde localStorage
function loadGameData() {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const data = JSON.parse(savedData);
        playerName = data.playerName;
        playerLevel = data.playerLevel || 1;
        playerExperience = data.playerExperience || 0;
        experienceToNextLevel = data.experienceToNextLevel || 400;
        money = data.money;
        quests = data.quests;
        playerRace = data.playerRace || "humano";
        playerClass = data.playerClass || "Guerrero";
        playerStats = data.playerStats || { strength: 0, agility: 0, stamina: 0, intellect: 0, spirit: 0 };
        playerHealth = data.playerHealth !== undefined ? data.playerHealth : 100;
        playerMaxHealth = data.playerMaxHealth !== undefined ? data.playerMaxHealth : calculateMaxHealth();
        inventory = data.inventory || { healthPotions: 0, resurrectionStones: 0 };
        
        // Cargar la reputación existente y añadir Gnomeregan si no existe
        playerReputation = data.playerReputation || [
            { factionId: 1, points: 0 },
            { factionId: 2, points: 0 },
            { factionId: 3, points: 0 }
        ];
        
        // Verificar si existe la facción de Gnomeregan en los datos cargados
        if (!playerReputation.some(rep => rep.factionId === 4)) {
            playerReputation.push({ factionId: 4, points: 0 });
        }

        updateMoneyDisplay();
        updateExperienceDisplay();
        renderEnemies();
        renderQuests();
        updateHealthBars();
        updateReputationDisplay();

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

        // Mostrar el contenedor principal y ocultar la pantalla de inicio
        container.style.display = 'flex';
        startScreen.style.display = 'none';
    } else {
        // Si no hay datos guardados, inicializar la barra de experiencia con valores correctos
        updateExperienceDisplay();
    }
}