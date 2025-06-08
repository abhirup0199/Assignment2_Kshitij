// DOM Elements
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

// Game state variables
let board = [];
let solution = [];
let difficulty = 'easy';
let timer = null;
let seconds = 0;
let gameActive = false;
let userInputs = {}; // Track user inputs for reset functionality

// Stats variables
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

// Initialize the game
function init() {
    loadStats();
    updateStatsDisplay();
    setupEventListeners();
    loadThemePreference();
    loadFontPreference();
    
    // Hide modals on initialization - using both class and style
    completionModal.classList.add('hidden');
    completionModal.style.display = 'none';
    resetModal.classList.add('hidden');
    
    startNewGame();
}

// Setup event listeners
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
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Start a new game
// Start a new game
function startNewGame() {
    // Clear previous game state
    clearInterval(timer);
    seconds = 0;
    timerDisplay.textContent = '00:00';
    messageEl.classList.add('hidden');
    completionModal.classList.add('hidden'); // Explicitly hide completion modal
    userInputs = {};
    gameActive = true;
    
    // Generate a new puzzle based on difficulty
    generatePuzzle();
    renderBoard();
    
    // Start the timer
    timer = setInterval(updateTimer, 1000);
}

// Generate a Sudoku puzzle
function generatePuzzle() {
    // First, generate a solved Sudoku board
    solution = generateSolvedBoard();
    
    // Create a copy of the solution
    board = JSON.parse(JSON.stringify(solution));
    
    // Remove numbers based on difficulty
    let cellsToRemove;
    switch(difficulty) {
        case 'easy':
            cellsToRemove = 40; // 41 clues
            break;
        case 'medium':
            cellsToRemove = 50; // 31 clues
            break;
        case 'hard':
            cellsToRemove = 60; // 21 clues
            break;
        default:
            cellsToRemove = 40;
    }
    
    // Randomly remove numbers
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (board[row][col] !== 0) {
            // Temporarily remove the number
            const temp = board[row][col];
            board[row][col] = 0;
            
            // Check if the puzzle still has a unique solution
            // For simplicity, we're not implementing a full solver here
            // In a real implementation, you would check for uniqueness
            
            removed++;
        }
    }
}

// Generate a solved Sudoku board using backtracking
function generateSolvedBoard() {
    // Create an empty 9x9 board
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill the board using backtracking
    solveSudoku(board);
    
    return board;
}

// Solve the Sudoku using backtracking algorithm
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // Find an empty cell
            if (board[row][col] === 0) {
                // Try placing numbers 1-9
                const nums = getRandomNumberArray();
                for (let num of nums) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        
                        // Recursively try to solve the rest of the board
                        if (solveSudoku(board)) {
                            return true;
                        }
                        
                        // If placing the number doesn't lead to a solution, backtrack
                        board[row][col] = 0;
                    }
                }
                
                // If no number works, backtrack
                return false;
            }
        }
    }
    
    // If we've filled all cells, the board is solved
    return true;
}

// Check if placing a number is valid
function isValidPlacement(board, row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }
    
    // Check 3x3 box
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

// Get an array of numbers 1-9 in random order
function getRandomNumberArray() {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]]; // Swap
    }
    return nums;
}

// Render the Sudoku board
function renderBoard() {
    sudokuBoard.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add special styling for 3x3 box borders
            if (row % 3 === 0 && row !== 0) {
                cell.style.borderTop = '2px solid var(--dark-color)';
            }
            if (col % 3 === 0 && col !== 0) {
                cell.style.borderLeft = '2px solid var(--dark-color)';
            }
            
            if (board[row][col] !== 0) {
                // Prefilled cell
                cell.textContent = board[row][col];
                cell.classList.add('prefilled');
            } else {
                // Empty cell - add input
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                
                // Restore user input if available
                const cellKey = `${row}-${col}`;
                if (userInputs[cellKey]) {
                    input.value = userInputs[cellKey];
                }
                
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (value && (isNaN(value) || value < 1 || value > 9)) {
                        e.target.value = '';
                    } else {
                        // Store user input
                        userInputs[cellKey] = value;
                        
                        // Check for conflicts
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

// Validate a cell's value against Sudoku rules
function validateCell(row, col, value) {
    if (!value) return;
    
    const numValue = parseInt(value);
    let hasConflict = false;
    
    // Clear previous error highlights
    clearErrors();
    
    // Check row
    for (let i = 0; i < 9; i++) {
        if (i !== col) {
            const cellValue = getCellValue(row, i);
            if (cellValue === numValue) {
                highlightError(row, i);
                hasConflict = true;
            }
        }
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
        if (i !== row) {
            const cellValue = getCellValue(i, col);
            if (cellValue === numValue) {
                highlightError(i, col);
                hasConflict = true;
            }
        }
    }
    
    // Check 3x3 box
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
    
    // Highlight the current cell if there's a conflict
    if (hasConflict) {
        highlightError(row, col);
    }
}

// Get the value of a cell (either from prefilled or user input)
function getCellValue(row, col) {
    if (board[row][col] !== 0) {
        return board[row][col];
    }
    
    const cellKey = `${row}-${col}`;
    return userInputs[cellKey] ? parseInt(userInputs[cellKey]) : 0;
}

// Highlight cells in the same row, column, and box
function highlightRelatedCells(row, col) {
    clearHighlights();
    
    // Highlight row
    for (let i = 0; i < 9; i++) {
        highlightCell(row, i);
    }
    
    // Highlight column
    for (let i = 0; i < 9; i++) {
        highlightCell(i, col);
    }
    
    // Highlight 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            highlightCell(boxRow + i, boxCol + j);
        }
    }
}

// Highlight a specific cell
function highlightCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('highlighted');
    }
}

// Highlight a cell with an error
function highlightError(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('error');
    }
}

// Clear all highlights
function clearHighlights() {
    const highlightedCells = document.querySelectorAll('.cell.highlighted');
    highlightedCells.forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

// Clear all error highlights
function clearErrors() {
    const errorCells = document.querySelectorAll('.cell.error');
    errorCells.forEach(cell => {
        cell.classList.remove('error');
    });
}

// Check if the current board state is a valid solution
function checkSolution() {
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (getCellValue(row, col) === 0) {
                showMessage('Please fill in all cells before checking.', 'error');
                return;
            }
        }
    }
    
    // Check if there are any conflicts
    if (document.querySelectorAll('.cell.error').length > 0) {
        showMessage('There are errors in your solution. Please fix them and try again.', 'error');
        return;
    }
    
    // Check against the solution
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0 && getCellValue(row, col) !== solution[row][col]) {
                showMessage('Your solution is incorrect. Keep trying!', 'error');
                return;
            }
        }
    }
    
    // If we get here, the solution is correct
    gameActive = false;
    clearInterval(timer);
    
    // Update stats
    stats.puzzlesSolved++;
    updateBestTime();
    stats.totalTime += seconds;
    saveStats();
    updateStatsDisplay();
    
    // Show completion modal
    completionTimeEl.textContent = formatTime(seconds);
    completionModal.classList.remove('hidden');
}

// Provide a hint by filling in a random empty cell
function provideHint() {
    if (!gameActive) return;
    
    // Find all empty cells
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
    
    // Select a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const {row, col} = emptyCells[randomIndex];
    
    // Fill it with the correct value
    const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (input) {
        input.value = solution[row][col];
        userInputs[`${row}-${col}`] = solution[row][col].toString();
        
        // Validate the cell
        validateCell(row, col, solution[row][col]);
    }
}

// Reset the current game
function resetGame() {
    resetModal.classList.add('hidden');
    
    // Clear user inputs but keep prefilled numbers
    userInputs = {};
    renderBoard();
    clearErrors();
    
    showMessage('Game has been reset.', 'success');
}

// Update the timer display
function updateTimer() {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
}

// Format time as MM:SS
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format time as HH:MM:SS
function formatLongTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Show a message to the user
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
    
    // Hide the message after 3 seconds
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}

// Update best time for current difficulty
function updateBestTime() {
    if (!stats.bestTimes[difficulty] || seconds < stats.bestTimes[difficulty]) {
        stats.bestTimes[difficulty] = seconds;
    }
    
    // Add to leaderboard
    stats.leaderboard.push({
        difficulty,
        time: seconds,
        date: new Date().toISOString()
    });
    
    // Sort leaderboard by time (ascending)
    stats.leaderboard.sort((a, b) => a.time - b.time);
    
    // Keep only top 10 entries
    if (stats.leaderboard.length > 10) {
        stats.leaderboard = stats.leaderboard.slice(0, 10);
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('sudokuStats', JSON.stringify(stats));
}

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('sudokuStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// Update the stats display
function updateStatsDisplay() {
    puzzlesSolvedEl.textContent = stats.puzzlesSolved;
    
    // Display best time for each difficulty
    let bestTime = '--:--';
    if (stats.bestTimes[difficulty]) {
        bestTime = formatTime(stats.bestTimes[difficulty]);
    }
    bestTimeEl.textContent = bestTime;
    
    totalTimeEl.textContent = formatLongTime(stats.totalTime);
    
    // Update leaderboard
    updateLeaderboard();
}

// Update the leaderboard display
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

// Reset all stats
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

// Toggle between light and dark theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
}

// Load theme preference from localStorage
function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
}

// Change font style
function changeFontStyle() {
    const font = fontSelect.value;
    document.documentElement.style.setProperty('--font-family', `'${font}', sans-serif`);
    localStorage.setItem('font', font);
}

// Load font preference from localStorage
function loadFontPreference() {
    const font = localStorage.getItem('font');
    if (font) {
        fontSelect.value = font;
        document.documentElement.style.setProperty('--font-family', `'${font}', sans-serif`);
    }
}

// Handle keyboard navigation
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
    
    // Arrow keys for navigation
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
        // Number keys 1-9 for input
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
    
    // Find the next input to focus
    while (board[newRow][newCol] !== 0) {
        // If we hit a prefilled cell, continue in the same direction
        if (e.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
        else if (e.key === 'ArrowDown') newRow = Math.min(8, newRow + 1);
        else if (e.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
        else if (e.key === 'ArrowRight') newCol = Math.min(8, newCol + 1);
        
        // If we've reached the edge, stop
        if (newRow < 0 || newRow > 8 || newCol < 0 || newCol > 8) break;
        
        // If we've gone full circle, stay where we are
        if (newRow === row && newCol === col) break;
    }
    
    // Focus the new cell if it's different and not prefilled
    if ((newRow !== row || newCol !== col) && board[newRow][newCol] === 0) {
        const newInput = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
        if (newInput) {
            newInput.focus();
            e.preventDefault(); // Prevent scrolling
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', init);