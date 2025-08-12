// State management
let selectedMood = '';
let currentTrack = null;
let isPlaying = false;
let currentHowl = null;
let currentAudioUrl = '';

// Map moods to arrays of song file paths
const playlists = {
  Happy: [
    'music/Alan_Walker.mp3',
    'music/Better-When_im-Dancing.mp3',
    // ... add more happy songs
  ],
  Sad: [
    'music/Die-With-A-Smile.mp3',
    'music/Love-Is-Gone.mp3',
    // ... add more sad songs
  ],
  Energetic: [
    'music/Unstoppable.mp3',
    // ...
  ],
  Chill: [
    'music/Timebelle-Apollo.mp3',
    // ...
  ],
  Romantic: [
    'music/Perfect.mp3',
    // ...
  ],
  Nostalgic: [
    'music/Attention.mp3',
    // ...
  ]
};

// Map moods to actual audio files present in /music (lowercase keys)
const audioPlaylists = {
  happy: [
    'music/Alan_Walker.mp3',
    'music/Better-When-Im-Dancing.mp3',
    'music/hymn-for-the-weekend.mp3',
    'music/Justin-Bieber-Eenie-Meenie.mp3',
    'music/Main-Tera-Boyfriend.mp3'
  ],
  sad: [
    'music/Die-With-A-Smile.mp3',
    'music/Love-Is-Gone.mp3',
    'music/Let Me Down Slowly.mp3',
    'music/At-My-Worst.mp3'
  ],
  energetic: [
    'music/Sia-Unstoppable.mp3',
    'music/Tu Meri.mp3',
    'music/Sooraj Dooba Hain.mp3',
    'music/Main-Tera-Boyfriend.mp3'
  ],
  chill: [
    'music/Timebelle - Apollo.mp3',
    'music/Thousand-Years.mp3',
    'music/Attention.mp3'
  ],
  romantic: [
    'music/Perfect.mp3',
    'music/Baaton Ko Teri - (Raag.Fm).mp3',
    'music/Tu Tu Hai Wahi - (Raag.Fm).mp3',
    'music/Thousand-Years.mp3'
  ],
  nostalgic: [
    'music/Tu Tu Hai Wahi - (Raag.Fm).mp3',
    'music/Galliyan - (Raag.Fm).mp3',
    'music/Alan_Walker.mp3'
  ]
};


// Music database
const musicDatabase = {
    happy: [
        { title: "Sunshine Vibes", artist: "Happy Beats", genre: "Pop" },
        { title: "Golden Days", artist: "Cheerful Sounds", genre: "Indie" },
        { title: "Bright Morning", artist: "Upbeat Collective", genre: "Electronic" }
    ],
    sad: [
        { title: "Rainy Thoughts", artist: "Melancholy Mood", genre: "Alternative" },
        { title: "Blue Memories", artist: "Emotional Waves", genre: "Blues" },
        { title: "Soft Tears", artist: "Gentle Hearts", genre: "Ambient" }
    ],
    energetic: [
        { title: "Power Surge", artist: "Electric Energy", genre: "Rock" },
        { title: "Lightning Bolt", artist: "High Voltage", genre: "Electronic" },
        { title: "Adrenaline Rush", artist: "Turbo Beats", genre: "EDM" }
    ],
    chill: [
        { title: "Ocean Breeze", artist: "Calm Collective", genre: "Lofi" },
        { title: "Sunset Dreams", artist: "Peaceful Vibes", genre: "Ambient" },
        { title: "Lazy Sunday", artist: "Relaxed Rhythms", genre: "Jazz" }
    ],
    romantic: [
        { title: "Heart Strings", artist: "Love Notes", genre: "R&B" },
        { title: "Moonlight Serenade", artist: "Romantic Souls", genre: "Jazz" },
        { title: "Sweet Whispers", artist: "Tender Moments", genre: "Pop" }
    ],
    angry: [
        { title: "Storm Break", artist: "Rage Against", genre: "Metal" },
        { title: "Fire Inside", artist: "Angry Spirits", genre: "Rock" },
        { title: "Breaking Point", artist: "Fury Unleashed", genre: "Punk" }
    ],
    nostalgic: [
        { title: "Yesterday's Echo", artist: "Memory Lane", genre: "Classic Rock" },
        { title: "Old School Vibes", artist: "Retro Beats", genre: "80s" },
        { title: "Time Machine", artist: "Vintage Sounds", genre: "Synthwave" }
    ],
    party: [
        { title: "Dance Floor Fire", artist: "Party Animals", genre: "Dance" },
        { title: "Club Anthem", artist: "Night Fever", genre: "House" },
        { title: "Celebration Time", artist: "Party Starters", genre: "Hip Hop" }
    ]
};

const moodAnalysis = {
    happy: "Detected pure joy! Upbeat melodies with major keys and infectious rhythms selected to amplify your happiness! 🎉",
    sad: "Sensing melancholy vibes. Gentle, emotional tracks with minor keys chosen to accompany your reflective mood 💙",
    energetic: "High energy detected! Powerful beats and driving rhythms selected to fuel your motivation! ⚡",
    chill: "Relaxed state identified. Smooth, laid-back tracks with mellow vibes chosen for your zen moment 😎",
    romantic: "Love is in the air! Smooth, intimate melodies selected to soundtrack your romantic feelings 💕",
    angry: "Intense emotions detected! Heavy, cathartic tracks chosen to help channel your energy 🔥",
    nostalgic: "Feeling reflective! Classic sounds and familiar melodies selected to transport you back in time 📻",
    party: "Party mode activated! High-energy dance tracks selected to get you moving! 🎉"
};

// DOM elements
const cards = {
    mood: document.getElementById('moodCard'),
    analysis: document.getElementById('analysisCard'),
    player: document.getElementById('playerCard')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showCard('mood');
});

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedMood = this.dataset.mood;
            showAnalysis(selectedMood);
        });
    });

    // Text input analysis
    document.getElementById('analyzeMoodBtn').addEventListener('click', function() {
        const moodText = document.getElementById('moodInput').value.trim();
        if (moodText) {
            const detectedMood = analyzeMoodFromText(moodText);
            showAnalysis(detectedMood);
        }
    });

    // Rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rating = this.dataset.rating;
            handleRating(rating);
        });
    });

    // Generate music button
    document.getElementById('generateMusicBtn').addEventListener('click', function() {
        generateMusic();
    });

    // Player controls
    document.querySelector('.play-btn').addEventListener('click', function() {
        togglePlay();
    });

    // Back to mood buttons
    document.getElementById('backToMoodBtn1').addEventListener('click', function() {
        showCard('mood');
        resetApp();
    });

    document.getElementById('backToMoodBtn2').addEventListener('click', function() {
        showCard('mood');
        resetApp();
    });

    // Enter key for text input
    document.getElementById('moodInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('analyzeMoodBtn').click();
        }
    });
}

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'text') {
        document.getElementById('textInputContent').classList.add('active');
        setTimeout(() => {
            document.getElementById('moodInput').focus();
        }, 100);
    } else {
        document.getElementById('moodButtonsContent').classList.add('active');
    }
}

function showCard(cardName) {
    // Hide all cards with animation
    Object.values(cards).forEach(card => {
        card.classList.add('hidden');
    });
    
    // Show target card after brief delay for smooth transition
    setTimeout(() => {
        cards[cardName].classList.remove('hidden');
    }, 200);
}

function analyzeMoodFromText(text) {
    const moodKeywords = {
        happy: ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'cheerful', 'glad', 'fantastic', 'amazing'],
        sad: ['sad', 'down', 'depressed', 'blue', 'upset', 'melancholy', 'gloomy', 'lonely', 'disappointed'],
        energetic: ['energetic', 'pumped', 'motivated', 'active', 'powerful', 'strong', 'hyped', 'charged'],
        chill: ['chill', 'relaxed', 'calm', 'peaceful', 'zen', 'mellow', 'easy', 'laid-back', 'tranquil'],
        romantic: ['love', 'romantic', 'heart', 'sweet', 'tender', 'intimate', 'passionate', 'affectionate'],
        nostalgic: ['nostalgic', 'memories', 'past', 'remember', 'old', 'vintage', 'childhood', 'yesterday']
    };

    const lowerText = text.toLowerCase();
    let bestMatch = 'happy';
    let maxMatches = 0;

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = mood;
        }
    }

    return bestMatch;
}

function showAnalysis(mood) {
    selectedMood = mood;
    const analysisText = document.getElementById('analysisText');
    analysisText.textContent = moodAnalysis[mood];
    
    // Animate the analysis card appearance
    showCard('analysis');
    
    // Reset rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
        btn.style.transform = 'none';
    });
}

function handleRating(rating) {
    // Visual feedback for rating
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
        btn.style.transform = 'none';
    });
    
    const selectedBtn = document.querySelector(`[data-rating="${rating}"]`);
    selectedBtn.classList.add('selected');
    selectedBtn.style.background = 'linear-gradient(45deg, #ff6b9d, #c44569)';
    selectedBtn.style.transform = 'scale(1.05)';
    
    console.log(`User rated mood analysis as: ${rating}`);
}

function generateMusic() {
    // Add loading state
    const generateBtn = document.getElementById('generateMusicBtn');
    generateBtn.classList.add('loading');
    generateBtn.textContent = '🔄 Generating...';
    
    setTimeout(() => {
        showCard('player');
        const tracks = musicDatabase[selectedMood];
        currentTrack = tracks[Math.floor(Math.random() * tracks.length)];
        
        // Update player UI
        document.getElementById('trackTitle').textContent = currentTrack.title;
        document.getElementById('trackArtist').textContent = currentTrack.artist;
        document.getElementById('trackGenre').textContent = currentTrack.genre;
        
        // Pick an audio file for this mood
        const moodPlaylist = audioPlaylists[selectedMood] || [];
        if (moodPlaylist.length > 0) {
            currentAudioUrl = moodPlaylist[Math.floor(Math.random() * moodPlaylist.length)];
        } else {
            currentAudioUrl = '';
        }
        
        // Reset generate button
        generateBtn.classList.remove('loading');
        generateBtn.textContent = '🎵 Generate Music';
        
        // Start playback
        startPlayback();
    }, 1500);
}

// Initialize and play audio
function loadAndPlayAudio(url) {
    if (!url) return;
    if (currentHowl) {
        try { currentHowl.unload(); } catch (e) {}
    }
    currentHowl = new Howl({
        src: [url],
        html5: true,
        volume: 0.75,
        onend: () => {
            const playBtn = document.querySelector('.play-btn');
            if (playBtn) {
                playBtn.textContent = '▶';
                playBtn.dataset.playing = 'false';
            }
            isPlaying = false;
        }
    });
    currentHowl.play();
}

function startPlayback() {
    const progressFill = document.querySelector('.progress-fill');
    const playBtn = document.querySelector('.play-btn');
    
    // Start real audio
    if (currentAudioUrl) {
        loadAndPlayAudio(currentAudioUrl);
    }
    
    // Animate progress bar
    progressFill.style.animation = 'progressMove 3s ease-in-out infinite';
    
    // Update play button
    playBtn.textContent = '⏸';
    playBtn.dataset.playing = 'true';
    isPlaying = true;
}

function togglePlay() {
    const playBtn = document.querySelector('.play-btn');
    const progressFill = document.querySelector('.progress-fill');
    
    if (isPlaying) {
        // Pause
        playBtn.textContent = '▶';
        playBtn.dataset.playing = 'false';
        progressFill.style.animationPlayState = 'paused';
        if (currentHowl && currentHowl.playing()) { currentHowl.pause(); }
        isPlaying = false;
    } else {
        // Play
        playBtn.textContent = '⏸';
        playBtn.dataset.playing = 'true';
        progressFill.style.animationPlayState = 'running';
        if (currentHowl && !currentHowl.playing()) { currentHowl.play(); }
        isPlaying = true;
    }
}

function resetApp() {
    selectedMood = '';
    currentTrack = null;
    isPlaying = false;
    
    // Stop and unload audio
    if (currentHowl) {
        try { currentHowl.stop(); currentHowl.unload(); } catch (e) {}
        currentHowl = null;
    }
    currentAudioUrl = '';
    
    // Reset text input
    document.getElementById('moodInput').value = '';
    
    // Reset tab selection
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="mood"]').classList.add('active');
    
    // Reset tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('moodButtonsContent').classList.add('active');
    
    // Reset rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
        btn.style.transform = 'none';
    });
    
    // Reset player
    const playBtn = document.querySelector('.play-btn');
    playBtn.textContent = '▶';
    playBtn.dataset.playing = 'false';
    
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.animation = 'none';
}

// Enhanced interactions
function addClickEffect(element, x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        pointer-events: none;
        width: 10px;
        height: 10px;
        left: ${x - 5}px;
        top: ${y - 5}px;
        animation: ripple 0.6s ease-out;
        z-index: 1000;
    `;
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple effect styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// Enhanced button interactions
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        // Add button press animation
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
        
        // Add ripple effect for mood buttons
        if (e.target.classList.contains('mood-btn')) {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addClickEffect(e.target, x, y);
        }
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'Escape':
            showCard('mood');
            resetApp();
            break;
        case ' ':
            if (!cards.mood.classList.contains('hidden')) {
                e.preventDefault();
                if (document.querySelector('.play-btn')) {
                    togglePlay();
                }
            }
            break;
        case 'ArrowLeft':
            // Previous functionality
            break;
        case 'ArrowRight':
            // Next functionality
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
            // Quick mood selection with number keys
            if (!cards.mood.classList.contains('hidden')) {
                const moodBtns = document.querySelectorAll('.mood-btn');
                const index = parseInt(e.key) - 1;
                if (moodBtns[index]) {
                    moodBtns[index].click();
                }
            }
            break;
    }
});

// Responsive card adjustments
function adjustCardsLayout() {
    const container = document.querySelector('.cards-container');
    const cards = document.querySelectorAll('.card:not(.hidden)');
    
    if (window.innerWidth >= 1200 && cards.length > 1) {
        container.style.gridTemplateColumns = `repeat(${Math.min(cards.length, 3)}, 1fr)`;
    } else if (window.innerWidth >= 1024 && cards.length > 1) {
        container.style.gridTemplateColumns = `repeat(${Math.min(cards.length, 2)}, 1fr)`;
    } else {
        container.style.gridTemplateColumns = '1fr';
    }
}

// Call on window resize
window.addEventListener('resize', adjustCardsLayout);

// Enhanced loading states
function showLoadingState(button, loadingText, originalText, duration = 1500) {
    button.classList.add('loading');
    button.textContent = loadingText;
    button.disabled = true;
    
    setTimeout(() => {
        button.classList.remove('loading');
        button.textContent = originalText;
        button.disabled = false;
    }, duration);
}

// Update analyze mood button with enhanced loading
document.getElementById('analyzeMoodBtn').addEventListener('click', function() {
    const moodText = document.getElementById('moodInput').value.trim();
    if (moodText) {
        showLoadingState(this, '🔄 Analyzing...', '💖 Analyze My Mood');
        
        setTimeout(() => {
            const detectedMood = analyzeMoodFromText(moodText);
            showAnalysis(detectedMood);
        }, 1500);
    }
});

// Volume control interaction
document.querySelector('.volume-slider').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    const volumeFill = this.querySelector('.volume-fill');
    volumeFill.style.width = Math.max(0, Math.min(100, percentage)) + '%';
    
    // Update volume display
    const volumeText = this.parentElement.querySelector('span:last-child');
    volumeText.textContent = Math.round(percentage) + '%';

    // Apply to audio
    if (currentHowl) {
        currentHowl.volume(Math.max(0, Math.min(1, percentage / 100)));
    }
});

// Progress bar interaction
document.querySelector('.progress').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    const progressFill = this.querySelector('.progress-fill');
    progressFill.style.width = Math.max(0, Math.min(100, percentage)) + '%';
    
    // Update time display and seek if audio duration available
    const leftTimeEl = document.querySelector('.time:first-child');
    const rightTimeEl = document.querySelector('.time:last-child');

    if (currentHowl && currentHowl.duration()) {
        const duration = currentHowl.duration();
        const newTime = (percentage / 100) * duration;
        try { currentHowl.seek(newTime); } catch (e) {}
        const minutes = Math.floor(newTime / 60);
        const seconds = Math.floor(newTime % 60);
        leftTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const durMin = Math.floor(duration / 60);
        const durSec = Math.floor(duration % 60);
        rightTimeEl.textContent = `${durMin}:${durSec.toString().padStart(2, '0')}`;
    } else {
        // Fallback simulated
        const currentTime = (percentage / 100) * 204; // 3:24 = 204 seconds
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        leftTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
});

// Card hover effects for desktop
if (window.innerWidth >= 768) {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Initialize layout
adjustCardsLayout();