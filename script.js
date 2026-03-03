import GEMINI_API_KEY from './config.js';

// MoodiO - AI DJ Mood to Music Generator
class MoodiO {
    constructor() {
        // Music library organized by mood
        this.musicLibrary = {
            happy: [
                'assets/music/Alan_Walker.mp3',
                'assets/music/Better-When-Im-Dancing.mp3',
                'assets/music/hymn-for-the-weekend.mp3',
                'assets/music/Justin-Bieber-Eenie-Meenie.mp3',
                'assets/music/Main-Tera-Boyfriend.mp3'
            ],
            sad: [
                'assets/music/Die-With-A-Smile.mp3',
                'assets/music/Love-Is-Gone.mp3',
                'assets/music/Let Me Down Slowly.mp3',
                'assets/music/At-My-Worst.mp3'
            ],
            energetic: [
                'assets/music/Sia-Unstoppable.mp3',
                'assets/music/Tu Meri.mp3',
                'assets/music/Sooraj Dooba Hain.mp3',
                'assets/music/Main-Tera-Boyfriend.mp3'
            ],
            chill: [
                'assets/music/Timebelle - Apollo.mp3',
                'assets/music/Thousand-Years.mp3',
                'assets/music/Attention.mp3'
            ],
            romantic: [
                'assets/music/Perfect.mp3',
                'assets/music/Baaton Ko Teri - (Raag.Fm).mp3',
                'assets/music/Tu Tu Hai Wahi - (Raag.Fm).mp3',
                'assets/music/Thousand-Years.mp3'
            ],
            nostalgic: [
                'assets/music/Tu Tu Hai Wahi - (Raag.Fm).mp3',
                'assets/music/Galliyan - (Raag.Fm).mp3',
                'assets/music/Alan_Walker.mp3'
            ]
        };

        // Track info mapping
        this.trackInfo = {
            'Alan_Walker.mp3': { title: 'Faded', artist: 'Alan Walker', genre: 'Electronic' },
            'Better-When-Im-Dancing.mp3': { title: 'Better When I\'m Dancing', artist: 'Meghan Trainor', genre: 'Pop' },
            'hymn-for-the-weekend.mp3': { title: 'Hymn For The Weekend', artist: 'Coldplay', genre: 'Pop Rock' },
            'Justin-Bieber-Eenie-Meenie.mp3': { title: 'Eenie Meenie', artist: 'Justin Bieber', genre: 'Pop' },
            'Main-Tera-Boyfriend.mp3': { title: 'Main Tera Boyfriend', artist: 'Raabta', genre: 'Bollywood' },
            'Die-With-A-Smile.mp3': { title: 'Die With A Smile', artist: 'Bruno Mars', genre: 'Pop' },
            'Love-Is-Gone.mp3': { title: 'Love Is Gone', artist: 'SLANDER', genre: 'EDM' },
            'Let Me Down Slowly.mp3': { title: 'Let Me Down Slowly', artist: 'Alec Benjamin', genre: 'Pop' },
            'At-My-Worst.mp3': { title: 'At My Worst', artist: 'Pink Sweat$', genre: 'R&B' },
            'Sia-Unstoppable.mp3': { title: 'Unstoppable', artist: 'Sia', genre: 'Pop' },
            'Tu Meri.mp3': { title: 'Tu Meri', artist: 'Bang Bang', genre: 'Bollywood' },
            'Sooraj Dooba Hain.mp3': { title: 'Sooraj Dooba Hain', artist: 'Roy', genre: 'Bollywood' },
            'Timebelle - Apollo.mp3': { title: 'Apollo', artist: 'Timebelle', genre: 'Pop' },
            'Thousand-Years.mp3': { title: 'A Thousand Years', artist: 'Christina Perri', genre: 'Pop' },
            'Attention.mp3': { title: 'Attention', artist: 'Charlie Puth', genre: 'Pop' },
            'Perfect.mp3': { title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop' },
            'Baaton Ko Teri - (Raag.Fm).mp3': { title: 'Baaton Ko Teri', artist: 'All Is Well', genre: 'Bollywood' },
            'Tu Tu Hai Wahi - (Raag.Fm).mp3': { title: 'Tu Tu Hai Wahi', artist: 'Yeh Vaada Raha', genre: 'Bollywood' },
            'Galliyan - (Raag.Fm).mp3': { title: 'Galliyan', artist: 'Ek Villain', genre: 'Bollywood' }
        };

        // Mood analysis responses
        this.moodAnalysis = {
            happy: {
                text: "Detected pure joy! 🌟 Upbeat melodies with major keys and infectious rhythms selected to amplify your happiness! 🎉",
                icon: "😊"
            },
            sad: {
                text: "Feeling the blues... 💙 Gentle melodies and emotional ballads to help you process your feelings. Sometimes we need to feel it to heal it. 🤗",
                icon: "😢"
            },
            energetic: {
                text: "High energy vibes detected! ⚡ Pumping beats and driving rhythms to fuel your motivation and get you moving! 🔥",
                icon: "⚡"
            },
            chill: {
                text: "Cool and relaxed energy! 😎 Smooth, laid-back tracks perfect for unwinding and finding your zen. Time to breathe easy. 🌊",
                icon: "😎"
            },
            romantic: {
                text: "Love is in the air! 💕 Tender melodies and heartfelt lyrics to celebrate those special feelings and romantic moments. 💖",
                icon: "💕"
            },
            nostalgic: {
                text: "Taking a trip down memory lane! 📺 Classic tunes that bring back those golden moments and sweet memories. ✨",
                icon: "📺"
            }
        };

        // Current state
        this.currentMood = null;
        this.currentTrack = null;
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.currentVolume = 0.75;
        this.progressInterval = null;

        // Initialize the app
        this.init();
    }

    init() {
        console.log('🎵 MoodiO initializing...');
        this.bindEvents();
        this.initializeUI();
        console.log('🎵 MoodiO ready to rock!');
    }

    initializeUI() {
        // Reset generate button to disabled state
        const generateBtn = document.getElementById('generateMusicBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.6';
        }

        // Initialize volume UI
        this.updateVolumeUI();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Mood buttons - Main functionality!
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mood = e.target.dataset.mood;
                console.log('🎯 Mood selected:', mood);
                this.selectMood(mood);
            });
        });

        // Text input mood analysis
        const analyzeMoodBtn = document.getElementById('analyzeMoodBtn');
        const moodInput = document.getElementById('moodInput');

        if (analyzeMoodBtn) {
            analyzeMoodBtn.addEventListener('click', () => this.analyzeTextMood());
        }

        if (moodInput) {
            moodInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.analyzeTextMood();
            });
        }

        // Rating buttons
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.rateMoodAnalysis(e.target.dataset.rating));
        });

        // Navigation buttons
        const generateMusicBtn = document.getElementById('generateMusicBtn');
        const backToMoodBtn1 = document.getElementById('backToMoodBtn1');
        const backToMoodBtn2 = document.getElementById('backToMoodBtn2');

        if (generateMusicBtn) {
            generateMusicBtn.addEventListener('click', () => this.generateMusic());
        }

        if (backToMoodBtn1) {
            backToMoodBtn1.addEventListener('click', () => this.resetToMoodSelection());
        }

        if (backToMoodBtn2) {
            backToMoodBtn2.addEventListener('click', () => this.resetToMoodSelection());
        }

        // Player controls
        const playBtn = document.querySelector('.play-btn');
        const prevBtn = document.querySelector('.control-btn:first-child');
        const nextBtn = document.querySelector('.control-btn:last-child');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        // Volume control
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        if (tab === 'mood') {
            const moodContent = document.getElementById('moodButtonsContent');
            if (moodContent) {
                moodContent.classList.add('active');
            }
        } else if (tab === 'text') {
            const textContent = document.getElementById('textInputContent');
            if (textContent) {
                textContent.classList.add('active');
            }
        }
    }

    selectMood(mood) {
        console.log('🎯 Processing mood:', mood);
        this.currentMood = mood;
        this.showMoodAnalysis(mood);
    }

    async analyzeTextMood() {
        const moodInput = document.getElementById('moodInput');
        if (!moodInput) return;

        const input = moodInput.value.trim();
        if (!input) {
            this.showError('Please tell us how you\'re feeling! 😊');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeMoodBtn');
        const analyzeLoading = document.getElementById('analyzeLoading');

        // Show loading state
        if (analyzeBtn && analyzeLoading) {
            analyzeBtn.disabled = true;
            analyzeBtn.classList.add('opacity-70', 'cursor-not-allowed');
            analyzeBtn.querySelector('span').textContent = 'Analyzing...';
            analyzeLoading.classList.remove('hidden');
        }

        try {
            const prompt = `Analyze the following text and categorize the mood of the text into exactly one of these six categories: "happy", "sad", "energetic", "chill", "romantic", or "nostalgic". Reply ONLY with the exact single word of the category, nothing else, no punctuation.\n\nText: "${input}"`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                let detectedMood = data.candidates[0].content.parts[0].text.trim().toLowerCase();

                // Fallback handling if AI gives an unexpected response
                const validMoods = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'nostalgic'];
                if (!validMoods.includes(detectedMood)) {
                    console.warn('AI returned an unexpected mood:', detectedMood, '- falling back to chill.');
                    detectedMood = 'chill';
                }

                console.log('🤖 Gemini AI detected mood:', detectedMood, 'from text:', input);
                this.currentMood = detectedMood;
                this.showMoodAnalysis(detectedMood);
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            this.showError('Failed to analyze mood with AI. Please try again! 🤖');
        } finally {
            // Reset loading state
            if (analyzeBtn && analyzeLoading) {
                analyzeBtn.disabled = false;
                analyzeBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                analyzeBtn.querySelector('span').textContent = '✨ Analyze My Mood';
                analyzeLoading.classList.add('hidden');
            }
        }
    }

    showMoodAnalysis(mood) {
        console.log('🎭 Showing analysis for:', mood);

        const analysis = this.moodAnalysis[mood];
        if (!analysis) {
            this.showError('Mood analysis not found! 😅');
            return;
        }

        // Update analysis display
        const moodIcon = document.querySelector('.mood-icon');
        const analysisText = document.getElementById('analysisText');

        if (moodIcon) {
            moodIcon.textContent = analysis.icon;
        }

        if (analysisText) {
            analysisText.textContent = analysis.text;
        }

        // Show analysis card with smooth animation
        this.showCard('analysisCard');

        // Add bounce effect
        setTimeout(() => {
            const analysisResult = document.querySelector('.analysis-result');
            if (analysisResult) {
                analysisResult.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    analysisResult.style.transform = 'scale(1)';
                }, 300);
            }
        }, 150);
    }

    rateMoodAnalysis(rating) {
        console.log('⭐ User rating:', rating);

        // Visual feedback for rating
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('bg-gray-300', 'border-brand-pink');
            btn.classList.add('bg-gray-100');
        });
        const selectedBtn = document.querySelector(`[data-rating="${rating}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('bg-gray-100');
            selectedBtn.classList.add('bg-gray-300', 'border-brand-pink');
        }

        // Enable generate music button with animation
        const generateBtn = document.getElementById('generateMusicBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            generateBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                generateBtn.style.transform = 'scale(1)';
            }, 200);
        }

        // Provide encouraging feedback
        const messages = {
            perfect: 'Perfect! 🎯 Let\'s create your amazing playlist!',
            okay: 'Good enough! 👌 Music coming right up!',
            bad: 'No worries! 🎵 Let me surprise you with great tunes!'
        };

        if (messages[rating]) {
            this.showTemporaryMessage(messages[rating]);
        }
    }

    generateMusic() {
        if (!this.currentMood) {
            this.showError('Please select a mood first! 🎭');
            return;
        }

        console.log('🎵 Generating music for:', this.currentMood);

        // Get playlist for current mood
        this.currentPlaylist = [...this.musicLibrary[this.currentMood]];
        if (this.currentPlaylist.length === 0) {
            this.showError('No music available for this mood! 😅');
            return;
        }

        // Shuffle playlist for variety
        this.shuffleArray(this.currentPlaylist);
        this.currentTrackIndex = 0;

        console.log('🎶 Playlist ready:', this.currentPlaylist.length, 'tracks');

        // Show player with loading animation
        this.showCard('playerCard');
        this.loadAndPlayTrack();
    }

    loadAndPlayTrack() {
        // Stop current track if playing
        if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack.unload();
        }

        const trackPath = this.currentPlaylist[this.currentTrackIndex];
        const fileName = trackPath.split('/').pop();
        const info = this.trackInfo[fileName] || {
            title: fileName.replace('.mp3', ''),
            artist: 'Unknown Artist',
            genre: 'Music'
        };

        console.log('🎧 Loading track:', info.title, 'by', info.artist);

        // Update UI immediately
        this.updateTrackUI(info);
        this.showLoadingState();

        // Create new Howler instance with error handling
        this.currentTrack = new Howl({
            src: [trackPath],
            volume: this.currentVolume,
            html5: true, // Use HTML5 audio for better compatibility
            onload: () => {
                console.log('✅ Track loaded successfully');
                this.hideLoadingState();
                this.updateTrackDuration();
            },
            onplay: () => {
                console.log('▶️ Track started playing');
                this.isPlaying = true;
                this.updatePlayButton();
                this.startProgressUpdate();
            },
            onpause: () => {
                console.log('⏸️ Track paused');
                this.isPlaying = false;
                this.updatePlayButton();
            },
            onend: () => {
                console.log('⏭️ Track ended, playing next');
                this.nextTrack();
            },
            onloaderror: (id, error) => {
                console.error('❌ Failed to load:', trackPath, error);
                this.hideLoadingState();
                this.showError(`Cannot play "${info.title}". Check if the file exists!`);

                // Try next track if available
                if (this.currentPlaylist.length > 1) {
                    setTimeout(() => this.nextTrack(), 2000);
                }
            },
            onplayerror: (id, error) => {
                console.error('❌ Play error:', error);
                this.showError('Playback error! Trying next track...');
                setTimeout(() => this.nextTrack(), 1000);
            }
        });

        // Auto-play with small delay
        setTimeout(() => {
            if (this.currentTrack) {
                this.currentTrack.play();
            }
        }, 200);
    }

    updateTrackUI(info) {
        const trackTitle = document.getElementById('trackTitle');
        const trackArtist = document.getElementById('trackArtist');
        const trackGenre = document.getElementById('trackGenre');

        if (trackTitle) trackTitle.textContent = info.title;
        if (trackArtist) trackArtist.textContent = info.artist;
        if (trackGenre) trackGenre.textContent = info.genre;
    }

    togglePlayPause() {
        if (!this.currentTrack) {
            this.showError('No track loaded! 🎵');
            return;
        }

        if (this.isPlaying) {
            this.currentTrack.pause();
        } else {
            this.currentTrack.play();
        }
    }

    nextTrack() {
        if (this.currentPlaylist.length === 0) return;

        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        console.log('⏭️ Next track:', this.currentTrackIndex + 1, '/', this.currentPlaylist.length);
        this.loadAndPlayTrack();
    }

    previousTrack() {
        if (this.currentPlaylist.length === 0) return;

        this.currentTrackIndex = this.currentTrackIndex === 0 ?
            this.currentPlaylist.length - 1 : this.currentTrackIndex - 1;
        console.log('⏮️ Previous track:', this.currentTrackIndex + 1, '/', this.currentPlaylist.length);
        this.loadAndPlayTrack();
    }

    setVolume(e) {
        const slider = e.currentTarget;
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));

        this.currentVolume = percentage;

        if (this.currentTrack) {
            this.currentTrack.volume(this.currentVolume);
        }

        this.updateVolumeUI();
        console.log('🔊 Volume set to:', Math.round(percentage * 100) + '%');
    }

    updateVolumeUI() {
        const volumePercentage = Math.round(this.currentVolume * 100);
        const volumeFill = document.querySelector('.volume-fill');
        const volumeText = document.querySelector('.volume-control span:last-child');

        if (volumeFill) {
            volumeFill.style.width = `${volumePercentage}%`;
        }

        if (volumeText) {
            volumeText.textContent = `${volumePercentage}%`;
        }
    }

    updatePlayButton() {
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
            playBtn.style.transform = this.isPlaying ? 'scale(1.1)' : 'scale(1)';
        }
    }

    showLoadingState() {
        const albumArt = document.querySelector('.album-art');
        const loadingDots = document.querySelector('.loading-dots');

        if (albumArt) albumArt.classList.add('loading');
        if (loadingDots) loadingDots.style.display = 'block';
    }

    hideLoadingState() {
        const albumArt = document.querySelector('.album-art');
        const loadingDots = document.querySelector('.loading-dots');

        if (albumArt) albumArt.classList.remove('loading');
        if (loadingDots) loadingDots.style.display = 'none';
    }

    updateTrackDuration() {
        if (!this.currentTrack) return;

        const duration = this.currentTrack.duration();
        if (duration && duration > 0) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const timeElements = document.querySelectorAll('.time');
            if (timeElements[1]) {
                timeElements[1].textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    startProgressUpdate() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (!this.currentTrack || !this.isPlaying) return;

            const seek = this.currentTrack.seek() || 0;
            const duration = this.currentTrack.duration();

            if (duration > 0) {
                const progress = (seek / duration) * 100;
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }

                const minutes = Math.floor(seek / 60);
                const seconds = Math.floor(seek % 60);
                const timeElements = document.querySelectorAll('.time');
                if (timeElements[0]) {
                    timeElements[0].textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }

    showCard(cardId) {
        // Hide all cards first
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('hidden');
        });

        // Show target card with animation
        const targetCard = document.getElementById(cardId);
        if (targetCard) {
            targetCard.classList.remove('hidden');
            if (cardId === "playerCard") {
                targetCard.classList.add('block');
            } else {
                targetCard.classList.add('block', 'animate-slide-up');
            }
        }

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetToMoodSelection() {
        console.log('🔄 Resetting to mood selection');

        // Stop current track
        if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack.unload();
            this.currentTrack = null;
        }

        // Clear progress interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        // Reset state
        this.currentMood = null;
        this.isPlaying = false;
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;

        // Clear input
        const moodInput = document.getElementById('moodInput');
        if (moodInput) {
            moodInput.value = '';
        }

        // Reset rating buttons
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Reset generate button
        const generateBtn = document.getElementById('generateMusicBtn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
            generateBtn.style.transform = 'scale(1)';
        }

        // Hide other cards and show mood selection
        document.getElementById('analysisCard')?.classList.add('hidden');
        document.getElementById('playerCard')?.classList.add('hidden');
        document.getElementById('errorMessage')?.classList.add('hidden');

        this.showCard('moodCard');

        // Reset to mood buttons tab
        this.switchTab('mood');
    }

    // Utility functions
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.querySelector('p').textContent = message;
            errorElement.classList.remove('hidden');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
        console.error('❌ Error:', message);
    }

    showTemporaryMessage(message) {
        // Create temporary message element
        const msgElement = document.createElement('div');
        msgElement.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 25px;
                    z-index: 1000;
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
                    font-weight: bold;
                    transition: all 0.3s ease;
                `;
        msgElement.textContent = message;
        document.body.appendChild(msgElement);

        // Animate in
        setTimeout(() => {
            msgElement.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            msgElement.style.transform = 'translateX(-50%) translateY(-100px)';
            msgElement.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(msgElement);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting MoodiO...');
    window.moodiO = new MoodiO();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.moodiO?.currentTrack) return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            window.moodiO.togglePlayPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            window.moodiO.nextTrack();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            window.moodiO.previousTrack();
            break;
    }
});

// Prevent page unload during playback
window.addEventListener('beforeunload', (e) => {
    if (window.moodiO?.isPlaying) {
        e.preventDefault();
        e.returnValue = 'Music is currently playing. Are you sure you want to leave?';
    }
});