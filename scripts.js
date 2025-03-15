let rows = 10;
let cols = 10;
let mines = 10;
let game = [];
let firstClick = true;
let gameLost = false;
let revealeds = 0;

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    // Add event listeners for difficulty buttons
    document.getElementById('easy').addEventListener('click', () => {
        rows = 10;
        cols = 10;
        mines = 10;
        initializeGame();
    });

    document.getElementById('medium').addEventListener('click', () => {
        rows = 15;
        cols = 15;
        mines = 30;
        initializeGame();
    });

    document.getElementById('hard').addEventListener('click', () => {
        rows = 20;
        cols = 20;
        mines = 50;
        initializeGame();
    });

    // Reset button
    document.getElementById('reset').addEventListener('click', initializeGame);
});

function initializeGame() {
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = ''; // Clear the game container

    // Set grid template rows and columns
    gameContainer.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    game = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', (event) => {
                if (!gameLost && !game[i][j].revealed) {
                    handleCellClick(event);
                }
            });
            gameContainer.appendChild(cell);
            game[i][j] = {
                element: cell,
                mine: false,
                revealed: false,
                minesAround: 0
            };
        }
    }

    firstClick = true;
    gameLost = false;
    revealeds = 0;
}

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (firstClick) {
        placeMines(row, col); // Place mines after the first click
        firstClick = false;
    }

    revealCell(row, col);

    if (gameLost) {
        alert('Game Over');
        revealAllMines();
    } else if (revealeds === (rows * cols) - mines) {
        alert('You have won!');
    }
}

function placeMines(safeRow, safeCol) {
    let minePositions = [];

    // Generate all possible positions except the safe cell and its neighbors
    for (let i = 0; i < rows * cols; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        // Exclude the safe cell and its immediate neighbors
        if (Math.abs(row - safeRow) > 1 || Math.abs(col - safeCol) > 1) {
            minePositions.push(i);
        }
    }

    // Randomly select mine positions
    minePositions = minePositions.sort(() => Math.random() - 0.5).slice(0, mines);

    // Place mines
    for (const pos of minePositions) {
        const row = Math.floor(pos / cols);
        const col = pos % cols;
        game[row][col].mine = true;
    }

    // Calculate the number of adjacent mines for each cell
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            calculateMinesAround(i, j);
        }
    }
}

function calculateMinesAround(row, col) {
    let count = 0;
    for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, rows - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, cols - 1); j++) {
            if (game[i][j].mine) {
                count++;
            }
        }
    }
    game[row][col].minesAround = count;
}

function revealCell(row, col) {
    const cell = game[row][col];
    if (cell.revealed) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');
    revealeds++;

    if (cell.mine) {
        cell.element.classList.add('mine');
        gameLost = true;
        return;
    }

    if (cell.minesAround === 0) {
        // Cascade reveal for cells with no adjacent mines
        for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, rows - 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, cols - 1); j++) {
                if (!game[i][j].revealed) {
                    revealCell(i, j);
                }
            }
        }
    } else {
        cell.element.textContent = cell.minesAround;
    }
}

function revealAllMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (game[i][j].mine) {
                game[i][j].element.classList.add('mine');
            }
        }
    }
}