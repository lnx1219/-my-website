// script.js
// 游戏状态
const gameState = {
    currentScreen: 'intro',
    currentPlayer: 1,
    player1Poison: null,
    player2Poison: null,
    eatenApples: [],
    gamePhase: 'setupPoison', // 'setupPoison' 或 'playing'
    setupPlayer: 1
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
    home: document.getElementById('homeBtn')
};

const messages = {
    poison: document.getElementById('poisonMessage'),
    game: document.getElementById('gameMessage'),
    winner: document.getElementById('winnerMessage')
};

const players = {
    poisonSetup: {
        player1: document.getElementById('player1Info'),
        player2: document.getElementById('player2Info')
    },
    game: {
        player1: document.getElementById('gamePlayer1'),
        player2: document.getElementById('gamePlayer2')
    }
};

// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameState.currentPlayer = 1;
    gameState.player1Poison = null;
    gameState.player2Poison = null;
    gameState.eatenApples = [];
    gameState.gamePhase = 'setupPoison';
    gameState.setupPlayer = 1;
    
    // 创建苹果网格
    createAppleGrid('poisonGrid', 25, handlePoisonSelection);
    createAppleGrid('gameGrid', 25, handleAppleSelection);
    
    // 更新玩家信息
    updatePlayerUI();
    
    // 显示设置毒苹果画面
    showScreen('poisonSetup');
    updatePoisonMessage();
}

// 创建苹果网格
function createAppleGrid(containerId, count, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const apple = document.createElement('div');
        apple.className = 'apple';
        apple.dataset.index = i;
        apple.addEventListener('click', () => clickHandler(i));
        container.appendChild(apple);
    }
}

// 处理毒苹果选择
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

// 处理游戏中的苹果选择
function handleAppleSelection(index) {
    // 如果苹果已被吃掉，则忽略点击
    if (gameState.eatenApples.includes(index)) return;
    
    // 标记苹果为已吃
    gameState.eatenApples.push(index);
    const apple = document.getElementById('gameGrid').children[index];
    apple.classList.add('eaten');
    apple.classList.remove('apple');
    
    // 检查是否吃到毒苹果
    if ((gameState.currentPlayer === 1 && index === gameState.player2Poison) || 
        (gameState.currentPlayer === 2 && index === gameState.player1Poison)) {
        
        // 当前玩家吃到毒苹果，游戏结束
        const winner = gameState.currentPlayer === 1 ? 2 : 1;
        endGame(winner);
        return;
    }
    
    // 切换到下一个玩家
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateGameMessage();
    updatePlayerUI();
}

// 结束游戏
function endGame(winner) {
    messages.winner.textContent = `玩家 ${winner} 獲胜！`;
    showScreen('result');
    
    // 显示所有毒苹果
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

// 更新毒苹果设置消息
function updatePoisonMessage() {
    if (gameState.setupPlayer === 1) {
        messages.poison.textContent = '玩家 1：請選擇你的毒蘋果';
    } else {
        messages.poison.textContent = '玩家 2：請選擇你的毒蘋果';
    }
}

// 更新游戏消息
function updateGameMessage() {
    messages.game.textContent = `玩家 ${gameState.currentPlayer}：請選擇要吃的蘋果`;
}

// 更新玩家UI状态
function updatePlayerUI() {
    // 重置所有玩家状态
    players.poisonSetup.player1.classList.remove('active');
    players.poisonSetup.player2.classList.remove('active');
    players.game.player1.classList.remove('active');
    players.game.player2.classList.remove('active');
    
    // 根据当前状态设置活动玩家
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

// 显示指定屏幕
function showScreen(screenName) {
    // 隐藏所有屏幕
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 显示指定屏幕
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// 事件监听器
buttons.start.addEventListener('click', initGame);
buttons.restart.addEventListener('click', initGame);
buttons.home.addEventListener('click', () => showScreen('intro'));

// 初始化
updatePlayerUI();