document.addEventListener('DOMContentLoaded', () => {
    // 游戏配置
    const config = {
        boardSize: 8,
        tileTypes: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
        initialMoves: 20,
        matchPoints: 10,
        comboMultiplier: 1.5
    };

    // 游戏状态
    let gameState = {
        board: [],
        score: 0,
        moves: config.initialMoves,
        selectedTile: null,
        isBusy: false
    };

    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const movesElement = document.getElementById('moves');
    const restartButton = document.getElementById('restart-button');
    const gameOverModal = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again');

    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        gameState = {
            board: [],
            score: 0,
            moves: config.initialMoves,
            selectedTile: null,
            isBusy: false
        };

        // 更新分数和步数显示
        updateUI();

        // 清空游戏面板
        gameBoard.innerHTML = '';
        
        // 设置游戏面板尺寸
        gameBoard.style.gridTemplateColumns = `repeat(${config.boardSize}, 1fr)`;

        // 创建初始棋盘
        for (let row = 0; row < config.boardSize; row++) {
            gameState.board[row] = [];
            for (let col = 0; col < config.boardSize; col++) {
                // 创建新的瓷砖
                const tileType = getRandomTileType();
                gameState.board[row][col] = { type: tileType, element: null };
                
                createTileElement(row, col, tileType);
            }
        }

        // 检查并清除初始匹配（确保没有初始匹配）
        setTimeout(() => {
            while (findAllMatches().length > 0) {
                resolveMatches(findAllMatches());
                fillEmptyTiles();
            }
            gameState.isBusy = false;
        }, 500);
    }

    // 创建瓷砖DOM元素
    function createTileElement(row, col, type) {
        const tile = document.createElement('div');
        tile.className = `tile ${type}`;
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        // 添加图案或字符
        const symbol = document.createElement('span');
        switch (type) {
            case 'red': symbol.textContent = '🍓'; break;
            case 'blue': symbol.textContent = '🫐'; break;
            case 'green': symbol.textContent = '🥝'; break;
            case 'yellow': symbol.textContent = '🍋'; break;
            case 'purple': symbol.textContent = '🍇'; break;
            case 'orange': symbol.textContent = '🍊'; break;
        }
        tile.appendChild(symbol);
        
        // 添加点击事件
        tile.addEventListener('click', () => handleTileClick(row, col));
        
        // 添加到游戏面板
        gameBoard.appendChild(tile);
        
        // 更新游戏状态
        gameState.board[row][col].element = tile;
        
        return tile;
    }

    // 随机获取一个瓷砖类型
    function getRandomTileType() {
        const index = Math.floor(Math.random() * config.tileTypes.length);
        return config.tileTypes[index];
    }

    // 处理瓷砖点击
    function handleTileClick(row, col) {
        // 如果游戏忙或没有剩余步数，忽略点击
        if (gameState.isBusy || gameState.moves <= 0) return;
        
        const clickedTile = gameState.board[row][col];
        
        // 如果没有选中的瓷砖，选中当前瓷砖
        if (!gameState.selectedTile) {
            gameState.selectedTile = { row, col };
            clickedTile.element.classList.add('selected');
            return;
        }
        
        // 获取选中的瓷砖
        const selectedTile = gameState.board[gameState.selectedTile.row][gameState.selectedTile.col];
        
        // 如果点击的是已选中的瓷砖，取消选中
        if (gameState.selectedTile.row === row && gameState.selectedTile.col === col) {
            selectedTile.element.classList.remove('selected');
            gameState.selectedTile = null;
            return;
        }
        
        // 检查两个瓷砖是否相邻
        const isAdjacent = (
            (Math.abs(gameState.selectedTile.row - row) === 1 && gameState.selectedTile.col === col) ||
            (Math.abs(gameState.selectedTile.col - col) === 1 && gameState.selectedTile.row === row)
        );
        
        // 如果不相邻，选择新的瓷砖
        if (!isAdjacent) {
            selectedTile.element.classList.remove('selected');
            gameState.selectedTile = { row, col };
            clickedTile.element.classList.add('selected');
            return;
        }
        
        // 相邻的瓷砖，尝试交换
        gameState.isBusy = true;
        selectedTile.element.classList.remove('selected');
        
        // 交换瓷砖
        swapTiles(gameState.selectedTile.row, gameState.selectedTile.col, row, col, true);
    }

    // 交换两个瓷砖
    function swapTiles(row1, col1, row2, col2, checkForMatches = false) {
        // 交换DOM元素的类和数据
        const tile1 = gameState.board[row1][col1];
        const tile2 = gameState.board[row2][col2];
        
        // 交换类型和元素引用
        const tempType = tile1.type;
        tile1.type = tile2.type;
        tile2.type = tempType;
        
        // 更新DOM元素的类
        tile1.element.className = `tile ${tile1.type}`;
        tile2.element.className = `tile ${tile2.type}`;
        
        // 更新内容
        tile1.element.innerHTML = '';
        tile2.element.innerHTML = '';
        
        const symbol1 = document.createElement('span');
        const symbol2 = document.createElement('span');
        
        switch (tile1.type) {
            case 'red': symbol1.textContent = '🍓'; break;
            case 'blue': symbol1.textContent = '🫐'; break;
            case 'green': symbol1.textContent = '🥝'; break;
            case 'yellow': symbol1.textContent = '🍋'; break;
            case 'purple': symbol1.textContent = '🍇'; break;
            case 'orange': symbol1.textContent = '🍊'; break;
        }
        
        switch (tile2.type) {
            case 'red': symbol2.textContent = '🍓'; break;
            case 'blue': symbol2.textContent = '🫐'; break;
            case 'green': symbol2.textContent = '🥝'; break;
            case 'yellow': symbol2.textContent = '🍋'; break;
            case 'purple': symbol2.textContent = '🍇'; break;
            case 'orange': symbol2.textContent = '🍊'; break;
        }
        
        tile1.element.appendChild(symbol1);
        tile2.element.appendChild(symbol2);
        
        // 更新数据属性
        tile1.element.dataset.row = row1;
        tile1.element.dataset.col = col1;
        tile2.element.dataset.row = row2;
        tile2.element.dataset.col = col2;
        
        // 如果需要检查匹配
        if (checkForMatches) {
            // 减少移动次数
            gameState.moves--;
            updateUI();
            
            // 检查是否有匹配
            setTimeout(() => {
                const matches = findAllMatches();
                
                // 如果没有匹配，交换回来
                if (matches.length === 0) {
                    swapTiles(row1, col1, row2, col2);
                    gameState.isBusy = false;
                    gameState.selectedTile = null;
                } else {
                    // 处理匹配
                    processMatches();
                }
                
                // 检查游戏是否结束
                checkGameOver();
            }, 300);
        }
    }

    // 处理匹配
    function processMatches() {
        const matches = findAllMatches();
        
        if (matches.length > 0) {
            // 计算分数
            const matchCount = matches.reduce((count, match) => count + match.tiles.length, 0);
            const comboMultiplier = matches.length > 1 ? config.comboMultiplier : 1;
            const points = Math.floor(matchCount * config.matchPoints * comboMultiplier);
            
            gameState.score += points;
            updateUI();
            
            // 移除匹配的瓷砖
            resolveMatches(matches);
            
            // 填充空瓷砖并检查新的匹配
            setTimeout(() => {
                fillEmptyTiles();
                
                // 检查是否有新的匹配
                setTimeout(() => {
                    const newMatches = findAllMatches();
                    if (newMatches.length > 0) {
                        processMatches();
                    } else {
                        gameState.isBusy = false;
                        gameState.selectedTile = null;
                        checkGameOver();
                    }
                }, 500);
            }, 500);
        } else {
            gameState.isBusy = false;
            gameState.selectedTile = null;
        }
    }

    // 查找所有匹配
    function findAllMatches() {
        const matches = [];
        
        // 检查水平匹配
        for (let row = 0; row < config.boardSize; row++) {
            for (let col = 0; col < config.boardSize - 2; col++) {
                const type = gameState.board[row][col].type;
                if (type === gameState.board[row][col+1].type && type === gameState.board[row][col+2].type) {
                    // 找到一个至少3个连续相同的水平匹配
                    const matchTiles = [
                        { row, col },
                        { row, col: col+1 },
                        { row, col: col+2 }
                    ];
                    
                    // 检查更长的匹配
                    let nextCol = col + 3;
                    while (nextCol < config.boardSize && gameState.board[row][nextCol].type === type) {
                        matchTiles.push({ row, col: nextCol });
                        nextCol++;
                    }
                    
                    matches.push({ type, tiles: matchTiles });
                    
                    // 跳过已经匹配的瓷砖
                    col = nextCol - 3;
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < config.boardSize; col++) {
            for (let row = 0; row < config.boardSize - 2; row++) {
                const type = gameState.board[row][col].type;
                if (type === gameState.board[row+1][col].type && type === gameState.board[row+2][col].type) {
                    // 找到一个至少3个连续相同的垂直匹配
                    const matchTiles = [
                        { row, col },
                        { row: row+1, col },
                        { row: row+2, col }
                    ];
                    
                    // 检查更长的匹配
                    let nextRow = row + 3;
                    while (nextRow < config.boardSize && gameState.board[nextRow][col].type === type) {
                        matchTiles.push({ row: nextRow, col });
                        nextRow++;
                    }
                    
                    matches.push({ type, tiles: matchTiles });
                    
                    // 跳过已经匹配的瓷砖
                    row = nextRow - 3;
                }
            }
        }
        
        return matches;
    }

    // 处理匹配的瓷砖
    function resolveMatches(matches) {
        // 标记所有匹配的瓷砖
        matches.forEach(match => {
            match.tiles.forEach(tile => {
                const { row, col } = tile;
                gameState.board[row][col].element.classList.add('matched');
                gameState.board[row][col].type = null;
            });
        });
    }

    // 填充空瓷砖
    function fillEmptyTiles() {
        // 从底部向上移动瓷砖来填充空白
        for (let col = 0; col < config.boardSize; col++) {
            // 计算每列有多少空位
            let emptyCount = 0;
            
            // 从底部向上遍历
            for (let row = config.boardSize - 1; row >= 0; row--) {
                if (gameState.board[row][col].type === null) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    // 将瓷砖向下移动
                    const newRow = row + emptyCount;
                    gameState.board[newRow][col].type = gameState.board[row][col].type;
                    gameState.board[newRow][col].element.className = `tile ${gameState.board[row][col].type}`;
                    
                    // 更新内容
                    gameState.board[newRow][col].element.innerHTML = '';
                    const symbol = document.createElement('span');
                    switch (gameState.board[newRow][col].type) {
                        case 'red': symbol.textContent = '🍓'; break;
                        case 'blue': symbol.textContent = '🫐'; break;
                        case 'green': symbol.textContent = '🥝'; break;
                        case 'yellow': symbol.textContent = '🍋'; break;
                        case 'purple': symbol.textContent = '🍇'; break;
                        case 'orange': symbol.textContent = '🍊'; break;
                    }
                    gameState.board[newRow][col].element.appendChild(symbol);
                    
                    // 添加动画类
                    gameState.board[newRow][col].element.classList.add('dropping');
                    setTimeout(() => {
                        gameState.board[newRow][col].element.classList.remove('dropping');
                    }, 300);
                    
                    // 标记原始位置为空
                    gameState.board[row][col].type = null;
                }
            }
            
            // 用新瓷砖填充顶部空位
            for (let row = emptyCount - 1; row >= 0; row--) {
                const newType = getRandomTileType();
                gameState.board[row][col].type = newType;
                gameState.board[row][col].element.className = `tile ${newType}`;
                
                // 更新内容
                gameState.board[row][col].element.innerHTML = '';
                const symbol = document.createElement('span');
                switch (newType) {
                    case 'red': symbol.textContent = '🍓'; break;
                    case 'blue': symbol.textContent = '🫐'; break;
                    case 'green': symbol.textContent = '🥝'; break;
                    case 'yellow': symbol.textContent = '🍋'; break;
                    case 'purple': symbol.textContent = '🍇'; break;
                    case 'orange': symbol.textContent = '🍊'; break;
                }
                gameState.board[row][col].element.appendChild(symbol);
                
                // 添加动画类
                gameState.board[row][col].element.classList.add('dropping');
                setTimeout(() => {
                    gameState.board[row][col].element.classList.remove('dropping');
                }, 300);
            }
        }
    }

    // 检查游戏是否结束
    function checkGameOver() {
        if (gameState.moves <= 0) {
            // 游戏结束
            gameState.isBusy = true;
            
            // 显示游戏结束模态框
            finalScoreElement.textContent = gameState.score;
            gameOverModal.style.display = 'flex';
        }
    }

    // 更新UI
    function updateUI() {
        scoreElement.textContent = gameState.score;
        movesElement.textContent = gameState.moves;
    }

    // 事件监听器
    restartButton.addEventListener('click', initGame);
    playAgainButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        initGame();
    });

    // 防止移动端滚动和缩放
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('#game-board')) {
            e.preventDefault();
        }
    }, { passive: false });

    // 移动设备优化 - 防止长按弹出菜单
    gameBoard.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 初始化游戏
    initGame();
});
