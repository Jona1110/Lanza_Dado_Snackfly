// Configuración del juego
const GAME_CONFIG = {
    prizes: {
        1: { text: "5% de descuento", icon: "🎫", color: "#ff6b6b" },
        2: { text: "Gomiloca Gratis", icon: "🍬", color: "#4ecdc4" },
        3: { text: "¡Suerte para la próxima!", icon: "🎁", color: "#ffaaa5" },
        4: { text: "Pepinos Locos Extra", icon: "🥒", color: "#a8e6cf" },
        5: { text: "¡Suerte para la próxima!", icon: "😅", color: "#ff8b94" },
        6: { text: "10% de descuento", icon: "🎟️", color: "#ffe66d" },
    },
    storageKey: 'snackDiceGame_hasPlayed',
    animationDuration: 2000
};

// Elementos del DOM
const dice = document.getElementById('dice');
const rollButton = document.getElementById('rollButton');
const resultArea = document.getElementById('resultArea');
const resultCard = document.getElementById('resultCard');
const resultTitle = document.getElementById('resultTitle');
const prizeIcon = document.getElementById('prizeIcon');
const prizeText = document.getElementById('prizeText');
const timestamp = document.getElementById('timestamp');
const attemptsInfo = document.getElementById('attemptsInfo');
const devResetButton = document.getElementById('devResetButton');

// Estado del juego
let gameState = {
    hasPlayed: false,
    isRolling: false,
    lastResult: null
};

// Inicialización del juego
function initGame() {
    checkUserStatus();
    setupEventListeners();
    updateUI();
}

// Verificar si el usuario ya jugó
function checkUserStatus() {
    const savedData = localStorage.getItem(GAME_CONFIG.storageKey);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            gameState.hasPlayed = true;
            gameState.lastResult = data;
            showPreviousResult(data);
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
            localStorage.removeItem(GAME_CONFIG.storageKey);
        }
    }
}

// Configurar event listeners
function setupEventListeners() {
    rollButton.addEventListener('click', handleRollClick);
    
    // CORRECCIÓN: Agregar event listener al botón de reset
    devResetButton.addEventListener('click', handleResetClick);
    
    // Agregar efecto hover al dado
    dice.addEventListener('mouseenter', () => {
        if (!gameState.isRolling) {
            dice.style.transform = 'rotateX(15deg) rotateY(15deg) scale(1.1)';
        }
    });
    
    dice.addEventListener('mouseleave', () => {
        if (!gameState.isRolling) {
            dice.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        }
    });
}

// CORRECCIÓN: Nueva función para manejar el click del botón reset
function handleResetClick() {
    // Confirmar antes de resetear
    const confirmReset = confirm('¿Estás seguro de que quieres resetear el juego? Esto eliminará tu resultado actual.');
    if (confirmReset) {
        resetGame();
        console.log('🔄 Juego reseteado correctamente');
        
        // Feedback visual opcional
        devResetButton.style.background = 'rgba(0, 255, 0, 0.3)';
        devResetButton.textContent = '✅ RESETEADO';
        
        setTimeout(() => {
            devResetButton.style.background = 'rgba(0, 0, 0, 0.7)';
            devResetButton.textContent = '🔄 DEV RESET';
        }, 1500);
    }
}

// Manejar clic en el botón de tirar
function handleRollClick() {
    if (gameState.hasPlayed || gameState.isRolling) {
        return;
    }
    
    rollDice();
}

// Función principal para tirar el dado
function rollDice() {
    gameState.isRolling = true;
    updateUI();
    
    // Ocultar resultado anterior si existe
    resultArea.classList.remove('show');
    
    // Generar número aleatorio
    const result = Math.floor(Math.random() * 6) + 1;
    
    // Iniciar animación del dado
    startDiceAnimation(result);
    
    // Mostrar resultado después de la animación
    setTimeout(() => {
        showResult(result);
        saveGameResult(result);
        gameState.isRolling = false;
        gameState.hasPlayed = true;
        updateUI();
    }, GAME_CONFIG.animationDuration);
}

// Animación del dado
function startDiceAnimation(finalResult) {
    dice.classList.add('rolling');
    
    // Crear efecto de rotación múltiple
    let rotationX = 0;
    let rotationY = 0;
    
    const animationInterval = setInterval(() => {
        rotationX += 90;
        rotationY += 90;
        dice.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }, 100);
    
    // Detener animación y mostrar resultado final
    setTimeout(() => {
        clearInterval(animationInterval);
        dice.classList.remove('rolling');
        showFinalDiceFace(finalResult);
    }, GAME_CONFIG.animationDuration - 500);
}

// Mostrar la cara final del dado
function showFinalDiceFace(result) {
    const rotations = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(0deg) rotateY(90deg)',
        3: 'rotateX(0deg) rotateY(180deg)',
        4: 'rotateX(0deg) rotateY(-90deg)',
        5: 'rotateX(-90deg) rotateY(0deg)',
        6: 'rotateX(90deg) rotateY(0deg)'
    };
    
    dice.style.transform = rotations[result];
    
    // Efecto de rebote al final
    setTimeout(() => {
        dice.style.transform = rotations[result] + ' scale(1.1)';
        setTimeout(() => {
            dice.style.transform = rotations[result] + ' scale(1)';
        }, 200);
    }, 100);
}

// Mostrar resultado del premio
function showResult(diceResult) {
    const prize = GAME_CONFIG.prizes[diceResult];
    const now = new Date();
    
    // Actualizar contenido del resultado
    resultTitle.textContent = '¡Felicidades!';
    prizeIcon.textContent = prize.icon;
    prizeText.textContent = `Has ganado: ${prize.text}`;
    
    // Agregar timestamp con verificación
    const timestampText = `${now.toLocaleDateString('es-ES')} - ${now.toLocaleTimeString('es-ES')}`;
    timestamp.textContent = `Ganado el: ${timestampText}`;
    
    // Cambiar color del fondo según el premio
    resultCard.style.background = `linear-gradient(135deg, ${prize.color} 0%, ${adjustColor(prize.color, -20)} 100%)`;
    
    // Mostrar resultado con animación
    setTimeout(() => {
        resultArea.classList.add('show');
        
        // Efecto de confeti
        createConfettiEffect();
        
        // Sonido de celebración (simulado con vibración en móviles)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }, 300);
}

// Mostrar resultado anterior
function showPreviousResult(savedData) {
    const prize = GAME_CONFIG.prizes[savedData.result];
    
    resultTitle.textContent = 'Tu premio anterior';
    prizeIcon.textContent = prize.icon;
    prizeText.textContent = `Ganaste: ${prize.text}`;
    timestamp.textContent = `Ganado el: ${savedData.timestamp}`;
    
    resultCard.style.background = `linear-gradient(135deg, ${prize.color} 0%, ${adjustColor(prize.color, -20)} 100%)`;
    
    // Mostrar la cara correcta del dado
    showFinalDiceFace(savedData.result);
    
    // Mostrar resultado
    resultArea.classList.add('show');
}

// Guardar resultado del juego
function saveGameResult(result) {
    const now = new Date();
    const gameData = {
        result: result,
        timestamp: `${now.toLocaleDateString('es-ES')} - ${now.toLocaleTimeString('es-ES')}`,
        date: now.toISOString(),
        prize: GAME_CONFIG.prizes[result].text
    };
    
    try {
        localStorage.setItem(GAME_CONFIG.storageKey, JSON.stringify(gameData));
        gameState.lastResult = gameData;
    } catch (error) {
        console.error('Error al guardar resultado:', error);
    }
}

// Actualizar interfaz de usuario
function updateUI() {
    if (gameState.hasPlayed) {
        rollButton.disabled = true;
        rollButton.textContent = '🎲 YA JUGASTE 🎲';
        attemptsInfo.textContent = 'Ya has usado tu oportunidad';
        attemptsInfo.style.color = '#ff6b6b';
    } else if (gameState.isRolling) {
        rollButton.disabled = true;
        rollButton.textContent = '🎲 TIRANDO... 🎲';
        attemptsInfo.textContent = 'El dado está girando...';
        attemptsInfo.style.color = '#4ecdc4';
    } else {
        rollButton.disabled = false;
        rollButton.textContent = '🎲 ¡TIRA EL DADO! 🎲';
        attemptsInfo.textContent = 'Tienes 1 oportunidad disponible';
        attemptsInfo.style.color = '#666';
    }
}

// Crear efecto de confeti
function createConfettiEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#ffaaa5'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    
    document.body.appendChild(confettiContainer);
    
    // Crear partículas de confeti
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
            
            // Eliminar confeti después de la animación
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }, i * 50);
    }
    
    // Eliminar contenedor después de 6 segundos
    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 6000);
}

// Función auxiliar para ajustar color
function adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Agregar animación CSS para el confeti
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Función para resetear el juego (solo para desarrollo/testing)
function resetGame() {
    localStorage.removeItem(GAME_CONFIG.storageKey);
    gameState.hasPlayed = false;
    gameState.isRolling = false;
    gameState.lastResult = null;
    resultArea.classList.remove('show');
    dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
    updateUI();
}

// Agregar función de reset al objeto window para debugging
window.resetSnackDiceGame = resetGame;

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);

// Agregar soporte para teclado (Enter para tirar)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !gameState.hasPlayed && !gameState.isRolling) {
        rollDice();
    }
});

// Prevenir zoom en dispositivos móviles al hacer doble tap
document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('🎲 Snack Dice Game cargado correctamente!');
console.log('💡 Tip: Usa resetSnackDiceGame() en la consola para resetear el juego durante el desarrollo.');
