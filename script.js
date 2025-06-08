const sudokuBoard = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game-btn');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');
const messageEl = document.getElementById('message');
const timerDisplay = document.getElementById('timer-display');
const difficultySelect = document.getElementById('difficulty-select');
const fontSelect = document.getElementById('font-select');
const themeSwitch = document.getElementById('theme-switch');
const resetModal = document.getElementById('reset-modal');
const cancelResetBtn = document.getElementById('cancel-reset');
const confirmResetBtn = document.getElementById('confirm-reset');
const completionModal = document.getElementById('completion-modal');
const completionTimeEl = document.getElementById('completion-time');
const newGameAfterWinBtn = document.getElementById('new-game-after-win');
const puzzlesSolvedEl = document.getElementById('puzzles-solved');
const bestTimeEl = document.getElementById('best-time');
const totalTimeEl = document.getElementById('total-time');
const resetStatsBtn = document.getElementById('reset-stats-btn');
const leaderboardList = document.getElementById('leaderboard-list');

let board = [];
let solution = [];
let difficulty = 'easy';
let timer = null;
let seconds = 0;
let gameActive = false;
let userInputs = {};

let stats = {
    puzzlesSolved: 0,
    bestTimes: {
        easy: null,
        medium: null,
        hard: null
    },
    totalTime: 0,
    leaderboard: []
};

function init() {
    loadStats();
    updateStatsDisplay();
    setupEventListeners();
    loadThemePreference();
    loadFontPreference();
    completionModal.classList.add('hidden');
    completionModal.style.display = 'none';
    resetModal.classList.add('hidden');
    startNewGame();
}

function setupEventListeners() {
    newGameBtn.addEventListener('click', startNewGame);
    checkBtn.addEventListener('click', checkSolution);
    resetBtn.addEventListener('click', () => resetModal.classList.remove('hidden'));
    hintBtn.addEventListener('click', provideHint);
    cancelResetBtn.addEventListener('click', () => resetModal.classList.add('hidden'));
    confirmResetBtn.addEventListener('click', resetGame);
    newGameAfterWinBtn.addEventListener('click', () => {
        completionModal.classList.add('hidden');
        startNewGame();
    });
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
    fontSelect.addEventListener('change', changeFontStyle);
    themeSwitch.addEventListener('change', toggleTheme);
    resetStatsBtn.addEventListener('click', resetStats);
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function startNewGame() {
    clearInterval(timer);
    seconds = 0;
    timerDisplay.textContent = '00:00';
    messageEl.classList.add('hidden');
    completionModal.classList.add('hidden');
    userInputs = {};
    gameActive = true;
    generatePuzzle();
    renderBoard();
    timer = setInterval(updateTimer, 1000);
}

function generatePuzzle() {
    solution = generateSolvedBoard();
    board = JSON.parse(JSON.stringify(solution));
    let cellsToRemove;
    switch(difficulty) {
        case 'easy':
            cellsToRemove = 40;
            break;
        case 'medium':
            cellsToRemove = 50;
            break;
        case 'hard':
            cellsToRemove = 60;
            break;
        default:
            cellsToRemove = 40;
    }
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            const temp = board[row][col];
            board[row][col] = 0;
            removed++;
        }
    }
}

function generateSolvedBoard() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    solveSudoku(board);
    return board;
}

function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const nums = getRandomNumberArray();
                for (let num of nums) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidPlacement(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function getRandomNumberArray() {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
}

function renderBoard() {
    sudokuBoard.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            if (row % 3 === 0 && row !== 0) {
                cell.style.borderTop = '2px solid var(--dark-color)';
            }
            if (col % 3 === 0 && col !== 0) {
                cell.style.borderLeft = '2px solid var(--dark-color)';
            }
            if (board[row][col] !== 0) {
                cell.textContent = board[row][col];
                cell.classList.add('prefilled');
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                const cellKey = `${row}-${col}`;
                if (userInputs[cellKey]) {
                    input.value = userInputs[cellKey];
                }
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (value && (isNaN(value) || value < 1 || value > 9)) {
                        e.target.value = '';
                    } else {
                        userInputs[cellKey] = value;
                        validateCell(row, col, value);
                    }
                });
                input.addEventListener('focus', () => highlightRelatedCells(row, col));
                input.addEventListener('blur', clearHighlights);
                cell.appendChild(input);
            }
            sudokuBoard.appendChild(cell);
        }
    }
}

function validateCell(row, col, value) {
    if (!value) return;
    const numValue = parseInt(value);
    let hasConflict = false;
    clearErrors();
    for (let i = 0; i < 9; i++) {
        if (i !== col) {
            const cellValue = getCellValue(row, i);
            if (cellValue === numValue) {
                highlightError(row, i);
                hasConflict = true;
            }
        }
    }
    for (let i = 0; i < 9; i++) {
        if (i !== row) {
            const cellValue = getCellValue(i, col);
            if (cellValue === numValue) {
                highlightError(i, col);
                hasConflict = true;
            }
        }
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const r = boxRow + i;
            const c = boxCol + j;
            if (r !== row || c !== col) {
                const cellValue = getCellValue(r, c);
                if (cellValue === numValue) {
                    highlightError(r, c);
                    hasConflict = true;
                }
            }
        }
    }
    if (hasConflict) {
        highlightError(row, col);
    }
}

function getCellValue(row, col) {
    if (board[row][col] !== 0) {
        return board[row][col];
    }
    const cellKey = `${row}-${col}`;
    return userInputs[cellKey] ? parseInt(userInputs[cellKey]) : 0;
}

function highlightRelatedCells(row, col) {
    clearHighlights();
    for (let i = 0; i < 9; i++) {
        highlightCell(row, i);
    }
    for (let i = 0; i < 9; i++) {
        highlightCell(i, col);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            highlightCell(boxRow + i, boxCol + j);
        }
    }
}

function highlightCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('highlighted');
    }
}

function highlightError(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('error');
    }
}

function clearHighlights() {
    const highlightedCells = document.querySelectorAll('.cell.highlighted');
    highlightedCells.forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

function clearErrors() {
    const errorCells = document.querySelectorAll('.cell.error');
    errorCells.forEach(cell => {
        cell.classList.remove('error');
    });
}

function checkSolution() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (getCellValue(row, col) === 0) {
                showMessage('Please fill in all cells before checking.', 'error');
                return;
            }
        }
    }
    if (document.querySelectorAll('.cell.error').length > 0) {
        showMessage('There are errors in your solution. Please fix them and try again.', 'error');
        return;
    }
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0 && getCellValue(row, col) !== solution[row][col]) {
                showMessage('Your solution is incorrect. Keep trying!', 'error');
                return;
            }
        }
    }
    gameActive = false;
    clearInterval(timer);
    stats.puzzlesSolved++;
    updateBestTime();
    stats.totalTime += seconds;
    saveStats();
    updateStatsDisplay();
    completionTimeEl.textContent = formatTime(seconds);
    completionModal.classList.remove('hidden');
}

function provideHint() {
    if (!gameActive) return;
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0 && !userInputs[`${row}-${col}`]) {
                emptyCells.push({row, col});
            }
        }
    }
    if (emptyCells.length === 0) {
        showMessage('No empty cells left to fill!', 'error');
        return;
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const {row, col} = emptyCells[randomIndex];
    const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (input) {
        input.value = solution[row][col];
        userInputs[`${row}-${col}`] = solution[row][col].toString();
        validateCell(row, col, solution[row][col]);
    }
}

function resetGame() {
    resetModal.classList.add('hidden');
    userInputs = {};
    renderBoard();
    clearErrors();
    showMessage('Game has been reset.', 'success');
}

function updateTimer() {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatLongTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

function updateBestTime() {
    if (!stats.bestTimes[difficulty] || seconds < stats.bestTimes[difficulty]) {
        stats.bestTimes[difficulty] = seconds;
    }
    stats.leaderboard.push({
        difficulty,
        time: seconds,
        date: new Date().toISOString()
    });
    stats.leaderboard.sort((a, b) => a.time - b.time);
    if (stats.leaderboard.length > 10) {
        stats.leaderboard = stats.leaderboard.slice(0, 10);
    }
}

function saveStats() {
    localStorage.setItem('sudokuStats', JSON.stringify(stats));
}

function loadStats() {
    const savedStats = localStorage.getItem('sudokuStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

function updateStatsDisplay() {
    puzzlesSolvedEl.textContent = stats.puzzlesSolved;
    let bestTime = '--:--';
    if (stats.bestTimes[difficulty]) {
        bestTime = formatTime(stats.bestTimes[difficulty]);
    }
    bestTimeEl.textContent = bestTime;
    totalTimeEl.textContent = formatLongTime(stats.totalTime);
    updateLeaderboard();
}

function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    if (stats.leaderboard.length === 0) {
        const noEntries = document.createElement('div');
        noEntries.className = 'no-entries';
        noEntries.textContent = 'Complete a puzzle to get on the leaderboard!';
        leaderboardList.appendChild(noEntries);
        return;
    }
    stats.leaderboard.forEach((entry, index) => {
        const entryEl = document.createElement('div');
        entryEl.className = 'leaderboard-entry';
        const position = document.createElement('span');
        position.className = 'entry-position';
        position.textContent = `#${index + 1}`;
        const difficulty = document.createElement('span');
        difficulty.className = 'entry-difficulty';
        difficulty.textContent = entry.difficulty;
        const time = document.createElement('span');
        time.className = 'entry-time';
        time.textContent = formatTime(entry.time);
        entryEl.appendChild(position);
        entryEl.appendChild(difficulty);
        entryEl.appendChild(time);
        leaderboardList.appendChild(entryEl);
    });
}

function resetStats() {
    stats = {
        puzzlesSolved: 0,
        bestTimes: {
            easy: null,
            medium: null,
            hard: null
        },
        totalTime: 0,
        leaderboard: []
    };
    saveStats();
    updateStatsDisplay();
    showMessage('Stats have been reset.', 'success');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
}

function changeFontStyle() {
    const font = fontSelect.value;
    document.documentElement.style.setProperty('--font-family', `'${font}', sans-serif`);
    localStorage.setItem('font', font);
}

function loadFontPreference() {
    const font = localStorage.getItem('font');
    if (font) {
        fontSelect.value = font;
        document.documentElement.style.setProperty('--font-family', `'${font}', sans-serif`);
    }
}

function handleKeyboardNavigation(e) {
    if (!gameActive) return;
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.tagName || activeElement.tagName.toLowerCase() !== 'input') {
        return;
    }
    const row = parseInt(activeElement.dataset.row);
    const col = parseInt(activeElement.dataset.col);
    let newRow = row;
    let newCol = col;
    switch (e.key) {
        case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
        case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
        case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
        case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
            activeElement.value = e.key;
            userInputs[`${row}-${col}`] = e.key;
            validateCell(row, col, e.key);
            return;
        case 'Delete': case 'Backspace':
            activeElement.value = '';
            delete userInputs[`${row}-${col}`];
            clearErrors();
            return;
        default:
            return;
    }
    while (board[newRow][newCol] !== 0) {
        if (e.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
        else if (e.key === 'ArrowDown') newRow = Math.min(8, newRow + 1);
        else if (e.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
        else if (e.key === 'ArrowRight') newCol = Math.min(8, newCol + 1);
        if (newRow < 0 || newRow > 8 || newCol < 0 || newCol > 8) break;
        if (newRow === row && newCol === col) break;
    }
    if ((newRow !== row || newCol !== col) && board[newRow][newCol] === 0) {
        const newInput = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newInput) {
            newInput.focus();
            e.preventDefault();
        }
    }
}
window.addEventListener('DOMContentLoaded', init);
