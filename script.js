// 遊戲狀態
const gameState = {
    currentScreen: 'intro',
    currentPlayer: 1,
    player1Poison: null,
    player2Poison: null,
    eatenApples: [],
    gamePhase: 'setupPoison',
    setupPlayer: 1,
    player1Name: '玩家1',
    player2Name: '玩家2',
    soundEnabled: true
};

// DOM 元素
const screens = {
    intro: document.getElementById('introScreen'),
    poisonSetup: document.getElementById('poisonSetupScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen')
};

const buttons = {
    start: document.getElementById('startBtn'),
    restart: document.getElementById('restartBtn'),
    home: document.getElementById('homeBtn'),
    restartGame: document.getElementById('restartGameBtn'),
    soundToggle: document.getElementById('soundToggle')
};

const messages = {
    poison: document.getElementById('poisonMessage'),
    game: document.getElementById('gameMessage'),
    winner: document.getElementById('winnerMessage')
};

const players = {
    poisonSetup: {
        player1: document.getElementById('player1Info'),
        player2: document.getElementById('player2Info'),
        player1Name: document.getElementById('setupPlayer1Name'),
        player2Name: document.getElementById('setupPlayer2Name')
    },
    game: {
        player1: document.getElementById('gamePlayer1'),
        player2: document.getElementById('gamePlayer2'),
        player1Name: document.getElementById('gamePlayer1Name'),
        player2Name: document.getElementById('gamePlayer2Name')
    }
};

const playerNameInputs = {
    player1: document.getElementById('player1Name'),
    player2: document.getElementById('player2Name')
};

// 音效元素
const sounds = {
    click: document.getElementById('clickSound'),
    eat: document.getElementById('eatSound'),
    poison: document.getElementById('poisonSound'),
    win: document.getElementById('winSound')
};

// 播放音效
function playSound(sound) {
    if (!gameState.soundEnabled) return;
    
    try {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
        console.log("Audio error:", e);
    }
}

// 初始化遊戲
function initGame() {
    // 播放點擊音效
    playSound(sounds.click);
    
    // 獲取玩家名稱
    gameState.player1Name = playerNameInputs.player1.value.trim() || '玩家1';
    gameState.player2Name = playerNameInputs.player2.value.trim() || '玩家2';
    
    // 更新玩家名稱顯示
    players.poisonSetup.player1Name.textContent = gameState.player1Name;
    players.poisonSetup.player2Name.textContent = gameState.player2Name;
    players.game.player1Name.textContent = gameState.player1Name;
    players.game.player2Name.textContent = gameState.player2Name;
    
    // 重置遊戲狀態
    gameState.currentPlayer = 1;
    gameState.player1Poison = null;
    gameState.player2Poison = null;
    gameState.eatenApples = [];
    gameState.gamePhase = 'setupPoison';
    gameState.setupPlayer = 1;
    
    // 創建蘋果網格
    createAppleGrid('poisonGrid', 25, handlePoisonSelection);
    createAppleGrid('gameGrid', 25, handleAppleSelection);
    
    // 更新玩家信息
    updatePlayerUI();
    
    // 顯示設置毒蘋果畫面
    showScreen('poisonSetup');
    updatePoisonMessage();
}

// 創建蘋果網格
function createAppleGrid(containerId, count, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const apple = document.createElement('div');
        apple.className = 'apple';
        apple.dataset.index = i;
        
        // 添加點擊事件
        apple.addEventListener('click', () => {
            playSound(sounds.click);
            clickHandler(i);
        });
        
        container.appendChild(apple);
    }
}

// 處理毒蘋果選擇
function handlePoisonSelection(index) {
    if (gameState.setupPlayer === 1) {
        gameState.player1Poison = index;
        gameState.setupPlayer = 2;
        players.poisonSetup.player1.classList.remove('active');
        players.poisonSetup.player2.classList.add('active');
    } else {
        gameState.player2Poison = index;
        gameState.gamePhase = 'playing';
        gameState.currentPlayer = 1;
        showScreen('game');
        updateGameMessage();
        updatePlayerUI();
    }
    
    updatePoisonMessage();
}

// 處理遊戲中的蘋果選擇
function handleAppleSelection(index) {
    // 如果蘋果已被吃掉，則忽略點擊
    if (gameState.eatenApples.includes(index)) return;
    
    // 標記蘋果為已吃
    gameState.eatenApples.push(index);
    const apple = document.getElementById('gameGrid').children[index];
    
    // 添加動畫效果
    apple.classList.add('eaten');
    apple.classList.remove('apple');
    
    // 播放吃蘋果音效
    playSound(sounds.eat);
    
    // 檢查是否吃到毒蘋果
    if (index === gameState.player1Poison || index === gameState.player2Poison) {
        // 播放毒蘋果音效
        playSound(sounds.poison);
        
        // 當前玩家吃到毒蘋果，遊戲結束
        const winner = gameState.currentPlayer === 1 ? 2 : 1;
        
        // 延遲顯示結果，讓玩家看到毒蘋果
        setTimeout(() => {
            endGame(winner);
        }, 800);
        
        return;
    }
    
    // 切換到下一個玩家
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateGameMessage();
    updatePlayerUI();
}

// 結束遊戲
function endGame(winner) {
    // 播放勝利音效
    playSound(sounds.win);
    
    const winnerName = winner === 1 ? gameState.player1Name : gameState.player2Name;
    messages.winner.textContent = `${winnerName} 獲勝！`;
    showScreen('result');
    
    // 顯示所有毒蘋果
    const gameGrid = document.getElementById('gameGrid');
    if (gameGrid) {
        if (gameState.player1Poison !== null) {
            const poisonApple1 = gameGrid.children[gameState.player1Poison];
            poisonApple1.classList.add('poison');
        }
        if (gameState.player2Poison !== null) {
            const poisonApple2 = gameGrid.children[gameState.player2Poison];
            poisonApple2.classList.add('poison');
        }
    }
}

// 更新毒蘋果設置消息
function updatePoisonMessage() {
    const playerName = gameState.setupPlayer === 1 ? 
        gameState.player1Name : gameState.player2Name;
    
    messages.poison.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${playerName}：請選擇你的毒蘋果`;
}

// 更新遊戲消息
function updateGameMessage() {
    const playerName = gameState.currentPlayer === 1 ? 
        gameState.player1Name : gameState.player2Name;
    
    messages.game.innerHTML = `<i class="fas fa-info-circle"></i> ${playerName}：請選擇要吃的蘋果`;
}

// 更新玩家UI狀態
function updatePlayerUI() {
    // 重置所有玩家狀態
    players.poisonSetup.player1.classList.remove('active');
    players.poisonSetup.player2.classList.remove('active');
    players.game.player1.classList.remove('active');
    players.game.player2.classList.remove('active');
    
    // 根據當前狀態設置活動玩家
    if (gameState.gamePhase === 'setupPoison') {
        if (gameState.setupPlayer === 1) {
            players.poisonSetup.player1.classList.add('active');
        } else {
            players.poisonSetup.player2.classList.add('active');
        }
    } else {
        if (gameState.currentPlayer === 1) {
            players.game.player1.classList.add('active');
            players.game.player1.querySelector('p').textContent = '當前回合';
            players.game.player2.querySelector('p').textContent = '等待回合';
        } else {
            players.game.player2.classList.add('active');
            players.game.player1.querySelector('p').textContent = '等待回合';
            players.game.player2.querySelector('p').textContent = '當前回合';
        }
    }
}

// 顯示指定屏幕
function showScreen(screenName) {
    // 隱藏所有屏幕
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 顯示指定屏幕
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// 切換音效
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = buttons.soundToggle.querySelector('i');
    
    if (gameState.soundEnabled) {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
        buttons.soundToggle.style.color = '#8f94fb';
    } else {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
        buttons.soundToggle.style.color = '#ff6b6b';
    }
}

// 事件監聽器
buttons.start.addEventListener('click', initGame);
buttons.restart.addEventListener('click', initGame);
buttons.home.addEventListener('click', () => {
    playSound(sounds.click);
    showScreen('intro');
});
buttons.restartGame.addEventListener('click', () => {
    playSound(sounds.click);
    initGame();
});
buttons.soundToggle.addEventListener('click', toggleSound);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePlayerUI();
    
    // 添加蘋果懸浮動畫延遲
    const apples = document.querySelectorAll('.apple');
    apples.forEach((apple, index) => {
        apple.style.animationDelay = `${index * 0.1}s`;
    });
});
