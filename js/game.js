class MemoryGame {
    constructor(boardElement, options = {}) {
        this.boardElement = boardElement;
        this.options = Object.assign({
            difficulty: 'medium',
            theme: 'space'
        }, options);
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.gameStarted = false;
        this.timerInterval = null;
        this.startTime = 0;
        this.elapsedTime = 0;

        this.streak = 0;
        this.maxStreak = 0;
        this.lastMatchTime = 0;
        
        // DOM elements
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.matchesElement = document.getElementById('matches');
        this.totalPairsElement = document.getElementById('total-pairs');
        this.moveCountElement = document.getElementById('move-count');
        this.matchedPileElement = document.getElementById('matched-pile');
        
        // Card symbols based on theme
        this.symbols = {
            space: ['🚀', '🪐', '🌟', '🌙', '🌎', '☄️', '👽', '🛸', '🌌', '🔭'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁'],
            vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️'],
            tools: ['🔨', '🪓', '🔧', '🪛', '🔩', '⚙️', '🧰', '🔌', '💻', '📱'],
            flags: ['🇺🇸', '🇬🇧', '🇯🇵', '🇨🇦', '🇧🇷', '🇮🇳', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸'],
            fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥭'],
            sports: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓']
        };
        
        // Theme colors
        this.themeColors = {
            space: {
                primary: '#1a1a2e',
                secondary: '#16213e',
                accent: '#0f3460',
                highlight: '#e94560',
                text: '#f1f1f1'
            },
            animals: {
                primary: '#2c3e50',
                secondary: '#34495e',
                accent: '#16a085',
                highlight: '#f1c40f',
                text: '#ffffff'
            },
            vehicles: {
                primary: '#34495e',
                secondary: '#2c3e50',
                accent: '#3498db',
                highlight: '#e74c3c',
                text: '#ffffff'
            },
            tools: {
                primary: '#2d3436',
                secondary: '#636e72',
                accent: '#74b9ff',
                highlight: '#fdcb6e',
                text: '#ffffff'
            },
            flags: {
                primary: '#2d3436',
                secondary: '#636e72',
                accent: '#0984e3',
                highlight: '#00b894',
                text: '#ffffff'
            },
            fruits: {
                primary: '#2c3e50',
                secondary: '#34495e',
                accent: '#16a085',
                highlight: '#f1c40f',
                text: '#ffffff'
            },
            sports: {
                primary: '#2d3436',
                secondary: '#636e72',
                accent: '#0984e3',
                highlight: '#00b894',
                text: '#ffffff'
            }
        };
        
        // Grid configuration based on difficulty
        this.gridConfig = {
            easy: { rows: 3, cols: 4 },
            medium: { rows: 4, cols: 4 },
            hard: { rows: 4, cols: 5 }
        };
        
        // Initialize player stats from local storage
        this.playerStats = this.loadPlayerStats();
        
    }
    
    init() {
        const { rows, cols } = this.gridConfig[this.options.difficulty];
        this.totalPairs = Math.floor(rows * cols / 2);
        this.totalPairsElement.textContent = this.totalPairs;
        
        // Create card pairs
        const symbols = this.getRandomSymbols(this.totalPairs);
        const cardPairs = [...symbols, ...symbols];
        this.cards = this.shuffleArray(cardPairs);
        
        // Set up the game board
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.renderBoard();
        
        // Reset game state
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.updateStats();
    }
    
    getRandomSymbols(count) {
        const themeSymbols = this.symbols[this.options.theme];
        const shuffled = this.shuffleArray([...themeSymbols]);
        return shuffled.slice(0, count);
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-face card-back';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-face card-front';
            cardFront.textContent = symbol;
            
            card.appendChild(cardBack);
            card.appendChild(cardFront);
            
            card.addEventListener('click', () => this.flipCard(card, index));
            
            this.boardElement.appendChild(card);
        });
    }
    
    flipCard(card, index) {
        // Prevent flipping if game is locked or card is already flipped/matched
        if (this.isLocked || 
            this.flippedCards.includes(index) || 
            card.classList.contains('matched')) {
            return;
        }
        
        // Start the game timer on first card flip
        if (!this.gameStarted) {
            this.startGame();
        }
        
        // Flip the card
        card.classList.add('flipped');
        this.flippedCards.push(index);
        
        // Play flip sound
        this.playSound('flip');
        
        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkForMatch();
        }
    }
    
    checkForMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.boardElement.querySelector(`[data-index="${firstIndex}"]`);
        const secondCard = this.boardElement.querySelector(`[data-index="${secondIndex}"]`);
        
        const isMatch = this.cards[firstIndex] === this.cards[secondIndex];
        
        this.isLocked = true;
        
        setTimeout(() => {
            if (isMatch) {
                // Handle match
                this.handleMatch(firstCard, secondCard);
            } else {
                // Handle no match
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
            }
            
            this.flippedCards = [];
            this.isLocked = false;
            
            // Check if game is complete
            if (this.matchedPairs === this.totalPairs) {
                this.endGame();
            }
        }, 1000);
    }
    
    handleMatch(firstCard, secondCard) {
        this.matchedPairs++;
        
        // Calculate streak bonus
        const now = Date.now();
        if (now - this.lastMatchTime < 3000) { // If match within 3 seconds of last match
            this.streak++;
            if (this.streak > this.maxStreak) {
                this.maxStreak = this.streak;
            }
            this.showStreakEffect(this.streak);
        } else {
            this.streak = 1;
        }
        this.lastMatchTime = now;
        
        this.updateStats();
        
        // Play match sound
        this.playSound('match');
        
        // Add matched class for animation
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // After card shrink animation, move to pile
        setTimeout(() => {
            this.moveCardToPile(firstCard);
            this.moveCardToPile(secondCard);
            
            // Remove cards from board after animation
            setTimeout(() => {
                firstCard.style.visibility = 'hidden';
                secondCard.style.visibility = 'hidden';
            }, 500);
        }, 600);
    }
    
    showStreakEffect(streak) {
        // Create streak notification
        const streakEl = document.createElement('div');
        streakEl.className = 'streak-notification';
        streakEl.textContent = `${streak}x Streak!`;
        
        // Add to game container
        document.querySelector('.game-container').appendChild(streakEl);
        
        // Remove after animation
        setTimeout(() => {
            streakEl.remove();
        }, 1500);
    }
    
    moveCardToPile(card) {
        // Get pile position
        const pileRect = this.matchedPileElement.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        // Calculate translation values
        const tx = pileRect.left - cardRect.left + (Math.random() * 10 - 5);
        const ty = pileRect.top - cardRect.top + (Math.random() * 10 - 5);
        const rot = (Math.random() * 40 - 20);
        
        // Apply animation with custom properties
        card.style.setProperty('--tx', `${tx}px`);
        card.style.setProperty('--ty', `${ty}px`);
        card.style.setProperty('--rot', `${rot}deg`);
        card.style.animation = 'card-to-pile 0.5s forwards';
        
        // Create a visual card in the pile
        const pileCard = document.createElement('div');
        pileCard.className = 'card';
        pileCard.style.position = 'absolute';
        pileCard.style.width = '100%';
        pileCard.style.height = '100%';
        pileCard.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
        pileCard.style.top = `${this.matchedPairs * -2}px`;
        pileCard.style.backgroundColor = 'var(--card-front)';
        pileCard.style.zIndex = this.matchedPairs;
        
        this.matchedPileElement.appendChild(pileCard);
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        this.elapsedTime = Date.now() - this.startTime;
        
        // Update final stats
        document.getElementById('final-time').textContent = this.formatTime(this.elapsedTime);
        document.getElementById('final-moves').textContent = this.moves;
        
        // Calculate accuracy
        const accuracy = Math.floor((this.totalPairs / this.moves) * 100);
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        
        // Update player stats
        this.updatePlayerStats();
        
        // Show completion modal
        setTimeout(() => {
            this.updateCompletionModal();
            document.getElementById('complete-modal').classList.add('active');
        }, 1500);
    }
    
    updatePlayerStats() {
        const timeInSeconds = Math.floor(this.elapsedTime / 1000);
        const difficulty = this.options.difficulty;
        
        // Update games played
        this.playerStats.gamesPlayed++;
        
        // Update best times
        if (timeInSeconds < this.playerStats.bestTimes[difficulty]) {
            this.playerStats.bestTimes[difficulty] = timeInSeconds;
        }
        
        // Update best moves
        if (this.moves < this.playerStats.bestMoves[difficulty]) {
            this.playerStats.bestMoves[difficulty] = this.moves;
        }
        
        // Track themes played
        if (!this.playerStats.themesPlayed.includes(this.options.theme)) {
            this.playerStats.themesPlayed.push(this.options.theme);
        }
        
        // Track difficulties completed
        if (!this.playerStats.difficultiesCompleted.includes(difficulty)) {
            this.playerStats.difficultiesCompleted.push(difficulty);
        }
        
        // Check for achievements
        this.checkAchievements(timeInSeconds);
        
        // Save to local storage
        this.savePlayerStats();
    }
    
    checkAchievements(timeInSeconds) {
        const achievements = this.playerStats.achievements;
        let newAchievements = [];
        
        // First win
        if (!achievements.firstWin) {
            achievements.firstWin = true;
            newAchievements.push('First Victory!');
        }
        
        // Speed demon (under 30 seconds)
        if (!achievements.speedDemon && timeInSeconds < 30) {
            achievements.speedDemon = true;
            newAchievements.push('Speed Demon!');
        }
        
        // Perfect memory (minimum possible moves)
        const minPossibleMoves = this.totalPairs;
        if (!achievements.perfectMemory && this.moves === minPossibleMoves) {
            achievements.perfectMemory = true;
            newAchievements.push('Perfect Memory!');
        }
        
        // Theme explorer (all themes)
        if (!achievements.themeExplorer && this.playerStats.themesPlayed.length === Object.keys(this.symbols).length) {
            achievements.themeExplorer = true;
            newAchievements.push('Theme Explorer!');
        }
        
        // Difficulty master (all difficulties)
        if (!achievements.difficultyMaster && this.playerStats.difficultiesCompleted.length === Object.keys(this.gridConfig).length) {
            achievements.difficultyMaster = true;
            newAchievements.push('Difficulty Master!');
        }
        
        // Display new achievements
        if (newAchievements.length > 0) {
            this.displayAchievements(newAchievements);
        }
    }
    
    displayAchievements(achievements) {
        // Store achievements to display in completion modal
        this.newAchievements = achievements;
    }
    
    updateCompletionModal() {
        const modalTitle = document.querySelector('#complete-modal h2');
        const statsDiv = document.querySelector('#complete-modal .stats');
        
        // Update title based on theme
        const themeTitles = {
            'space': 'Cosmic Victory!',
            'animals': 'Wild Victory!',
            'vehicles': 'Racing Victory!',
            'tools': 'Crafty Victory!',
            'flags': 'Global Victory!',
            'fruits': 'Juicy Victory!',
            'sports': 'Champion Victory!'
        };
        
        modalTitle.textContent = themeTitles[this.options.theme] || 'Victory!';
        
        // Add high score info
        const difficulty = this.options.difficulty;
        const bestTimeEl = document.getElementById('best-time');
        const bestMovesEl = document.getElementById('best-moves');
        
        if (bestTimeEl && bestMovesEl) {
            const bestTime = this.playerStats.bestTimes[difficulty];
            bestTimeEl.textContent = bestTime === Infinity ? 'N/A' : this.formatTime(bestTime * 1000);
            bestMovesEl.textContent = this.playerStats.bestMoves[difficulty] === Infinity ? 'N/A' : this.playerStats.bestMoves[difficulty];
        }
        
        // Display new achievements
        const achievementsEl = document.getElementById('achievements');
        if (achievementsEl && this.newAchievements && this.newAchievements.length > 0) {
            achievementsEl.innerHTML = '';
            achievementsEl.style.display = 'block';
            
            const header = document.createElement('h3');
            header.textContent = 'Achievements Unlocked!';
            achievementsEl.appendChild(header);
            
            this.newAchievements.forEach(achievement => {
                const p = document.createElement('p');
                p.textContent = achievement;
                p.className = 'achievement';
                achievementsEl.appendChild(p);
            });
        } else if (achievementsEl) {
            achievementsEl.style.display = 'none';
        }
    }
    resetGame() {
        // Clear the board
        this.boardElement.innerHTML = '';
        
        // Reset the matched pile
        while (this.matchedPileElement.children.length > 1) {
            this.matchedPileElement.removeChild(this.matchedPileElement.lastChild);
        }
        
        // Reset timer
        clearInterval(this.timerInterval);
        this.gameStarted = false;
        this.minutesElement.textContent = '00';
        this.secondsElement.textContent = '00';
        
        // Initialize new game
        this.init();
    }
    
    updateStats() {
        this.matchesElement.textContent = this.matchedPairs;
        this.moveCountElement.textContent = this.moves;
    }
    
    updateTheme(theme) {
        this.options.theme = theme;
        
        // Apply theme colors to CSS variables
        const colors = this.themeColors[theme];
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
        document.documentElement.style.setProperty('--highlight-color', colors.highlight);
        document.documentElement.style.setProperty('--text-color', colors.text);
    }
    
    updateTimer() {
        const currentTime = Date.now() - this.startTime;
        const formattedTime = this.formatTime(currentTime);
        
        const [minutes, seconds] = formattedTime.split(':');
        this.minutesElement.textContent = minutes;
        this.secondsElement.textContent = seconds;
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
    
    playSound(type) {
        // Create sound effect (can be replaced with actual audio files)
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        if (type === 'flip') {
            oscillator.type = 'sine';
            oscillator.frequency.value = 300;
            gainNode.gain.value = 0.1;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
            oscillator.stop(context.currentTime + 0.3);
        } else if (type === 'match') {
            oscillator.type = 'sine';
            oscillator.frequency.value = 500;
            gainNode.gain.value = 0.1;
            oscillator.start();
            
            setTimeout(() => {
                oscillator.frequency.value = 700;
            }, 100);
            
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
            oscillator.stop(context.currentTime + 0.5);
        }
    }
    
    setDifficulty(difficulty) {
        this.options.difficulty = difficulty;
    }
    
    setTheme(theme) {
        this.options.theme = theme;
        this.updateTheme(theme);
    }
    
    loadPlayerStats() {
        const defaultStats = {
            gamesPlayed: 0,
            bestTimes: {
                easy: Infinity,
                medium: Infinity,
                hard: Infinity
            },
            bestMoves: {
                easy: Infinity,
                medium: Infinity,
                hard: Infinity
            },
            achievements: {
                firstWin: false,
                speedDemon: false,  // Complete in under 30 seconds
                perfectMemory: false, // Complete with minimum possible moves
                themeExplorer: false, // Play with all themes
                difficultyMaster: false // Complete all difficulties
            },
            themesPlayed: [],
            difficultiesCompleted: []
        };
        
        try {
            const savedStats = JSON.parse(localStorage.getItem('memoryGameStats'));
            return savedStats ? {...defaultStats, ...savedStats} : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    }
    
    savePlayerStats() {
        localStorage.setItem('memoryGameStats', JSON.stringify(this.playerStats));
    }
}