document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startModal = document.getElementById('start-modal');
    const completeModal = document.getElementById('complete-modal');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const startGameBtn = document.getElementById('start-game');
    const playAgainBtn = document.getElementById('play-again');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const infoIcon = document.getElementById('info-icon');
    const popupMenu = document.getElementById('popup-menu');
    const popupOverlay = document.getElementById('popup-overlay');
    
    // Initialize game
    const game = new MemoryGame(gameBoard);
    let selectedDifficulty = 'medium';
    let selectedTheme = 'space';
    
    // Show start modal on page load
    startModal.classList.add('active');
    
    // Info icon and popup menu
    infoIcon.addEventListener('click', () => {
        popupOverlay.classList.toggle('active');
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!popupMenu.contains(e.target) && e.target !== infoIcon) {
            popupOverlay.classList.remove('active');
        }
    });
    
    // Theme selection
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTheme = btn.dataset.theme;
            
            // Update game title based on theme
            const gameTitle = document.querySelector('h1');
            const modalTitle = document.querySelector('#start-modal h2');
            
            const themeTitles = {
                'space': 'Cosmic Match',
                'animals': 'Animal Match',
                'vehicles': 'Vehicle Match',
                'tools': 'Tool Match',
                'flags': 'Flag Match',
                'fruits': 'Fruit Match',
                'sports': 'Sports Match'
            };
            
            gameTitle.textContent = themeTitles[selectedTheme];
            modalTitle.textContent = themeTitles[selectedTheme];
            
            // Apply theme colors
            game.setTheme(selectedTheme);
        });
    });
    
    // Difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDifficulty = btn.dataset.difficulty;
        });
        
        // Select medium by default
        if (btn.dataset.difficulty === 'medium') {
            btn.classList.add('selected');
        }
    });
    
    // Start game button
    startGameBtn.addEventListener('click', () => {
        startModal.classList.remove('active');
        game.setDifficulty(selectedDifficulty);
        game.setTheme(selectedTheme);
        game.init();
    });
    
    // Restart game button
    restartBtn.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
        game.resetGame();
    });
    
    // New game button
    newGameBtn.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
        startModal.classList.add('active');
    });
    
    // Play again button
    playAgainBtn.addEventListener('click', () => {
        completeModal.classList.remove('active');
        startModal.classList.add('active');
    });
});