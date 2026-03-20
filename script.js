/**
 * MoodiO – AI DJ: Mood-to-Music Generator
 * Uses Gemini AI for mood analysis (via a PHP backend proxy) and Howler.js for audio playback.
 * Free Creative Commons / royalty-free MP3 streams — no local files needed.
 */


// ---------------------------------------------------------------------------
// FREE STREAMING MUSIC LIBRARY (Creative Commons / Royalty-Free MP3 URLs)
// Sources: Pixabay, Free Music Archive, Bensound (free tier), ccMixter
// All tracks are freely usable for non-commercial/educational projects.
// ---------------------------------------------------------------------------
// iTunes Search API mood → search term mapping
const ITUNES_MAPPING = {
    happy: 'happy pop hits',
    sad: 'sad acoustic',
    energetic: 'workout dance',
    chill: 'lofi chill',
    romantic: 'romantic love songs',
    nostalgic: '80s classic hits'
};

// Gradient colors per mood (softer cyber-neon, match button style)
const MOOD_COLORS = {
    happy: 'linear-gradient(135deg, #fcd34d, #fbbf24)',
    sad: 'linear-gradient(135deg, #7dd3fc, #38bdf8)',
    energetic: 'linear-gradient(135deg, #fca5a5, #f87171)',
    chill: 'linear-gradient(135deg, #6ee7b7, #34d399)',
    romantic: 'linear-gradient(135deg, #fbcfe8, #f472b6)',
    nostalgic: 'linear-gradient(135deg, #c4b5fd, #818cf8)'
};

const MOOD_EMOJIS = {
    happy: '😊', sad: '😢', energetic: '⚡', chill: '😎', romantic: '💕', nostalgic: '📺'
};

// Mood descriptions shown in the analysis card
const MOOD_ANALYSIS = {
    happy: {
        text: "Detected pure joy! 🌟 Upbeat melodies with major keys and infectious rhythms selected to amplify your happiness! 🎉",
        icon: "😊",
        label: "Happy"
    },
    sad: {
        text: "Feeling the blues... 💙 Gentle melodies and emotional ballads to help you process your feelings. Sometimes we need to feel it to heal it. 🤗",
        icon: "😢",
        label: "Sad"
    },
    energetic: {
        text: "High energy vibes detected! ⚡ Pumping beats and driving rhythms to fuel your motivation and get you moving! 🔥",
        icon: "⚡",
        label: "Energetic"
    },
    chill: {
        text: "Cool and relaxed energy! 😎 Smooth, laid-back tracks perfect for unwinding and finding your zen. Time to breathe easy. 🌊",
        icon: "😎",
        label: "Chill"
    },
    romantic: {
        text: "Love is in the air! 💕 Tender melodies and heartfelt music to celebrate those special feelings and romantic moments. 💖",
        icon: "💕",
        label: "Romantic"
    },
    nostalgic: {
        text: "Taking a trip down memory lane! 📺 Classic cinematic tunes that bring back those golden moments and sweet memories. ✨",
        icon: "📺",
        label: "Nostalgic"
    }
};

// ---------------------------------------------------------------------------
// MAIN APP CLASS
// ---------------------------------------------------------------------------
class MoodiO {
    constructor() {
        this.currentMood = null;
        this.currentTrack = null;       // Howl instance
        this.currentPlaylist = [];      // array of track objects
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.isRepeat = false;
        this.isMuted = false;
        this.currentVolume = 0.75;
        this.progressInterval = null;
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
        this.currentIntensity = 3;       // 1-5 mood strength
        this.selectedGenre = '';        // '' = any, or pop/chillout/dance/rnb/indie/classical

        this.init();
    }

    init() {
        console.log('🎵 MoodiO initialising…');
        this.bindEvents();
        this.updateVolumeUI();
        console.log('🎵 MoodiO ready!');
    }

    // -------------------------------------------------------------------------
    // EVENT BINDING
    // -------------------------------------------------------------------------
    bindEvents() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn =>
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab))
        );

        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn =>
            btn.addEventListener('click', () => this.selectMood(btn.dataset.mood))
        );

        // Text analysis
        document.getElementById('analyzeMoodBtn')?.addEventListener('click', () => this.analyzeTextMood());
        document.getElementById('moodInput')?.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.analyzeTextMood();
            }
        });

        // Rating buttons
        document.querySelectorAll('.rating-btn').forEach(btn =>
            btn.addEventListener('click', () => this.rateMoodAnalysis(btn.dataset.rating))
        );

        // Refine (AI feedback loop)
        document.getElementById('refineBtn')?.addEventListener('click', () => this.refineWithAI());

        // Generate & back
        document.getElementById('generateMusicBtn')?.addEventListener('click', () => this.generateMusic());
        document.getElementById('backToMoodBtn1')?.addEventListener('click', () => this.resetToMoodSelection());
        document.getElementById('backToMoodBtn2')?.addEventListener('click', () => this.resetToMoodSelection());

        // Player controls
        document.getElementById('playPauseBtn')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousTrack());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextTrack());
        document.getElementById('shuffleBtn')?.addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeatBtn')?.addEventListener('click', () => this.toggleRepeat());
        document.getElementById('muteBtn')?.addEventListener('click', () => this.toggleMute());

        // Error close
        document.getElementById('errorCloseBtn')?.addEventListener('click', () => this.hideError());

        // Mood intensity slider
        const intensityEl = document.getElementById('moodIntensity');
        const intensityValueEl = document.getElementById('intensityValue');
        if (intensityEl && intensityValueEl) {
            intensityEl.addEventListener('input', () => {
                this.currentIntensity = parseInt(intensityEl.value, 10);
                intensityValueEl.textContent = intensityEl.value;
            });
        }

        // Genre filter chips
        document.querySelectorAll('.genre-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.selectedGenre = chip.dataset.genre || '';
            });
        });

        // Seekable progress bar
        this.bindProgressBar();

        // Draggable volume slider
        this.bindVolumeSlider();

        // Keyboard shortcuts
        document.addEventListener('keydown', e => this.handleKeydown(e));
    }

    bindProgressBar() {
        const bar = document.getElementById('progressBar');
        if (!bar) return;

        const seek = (e) => {
            if (!this.currentTrack) return;
            const rect = bar.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const duration = this.currentTrack.duration();
            if (duration > 0) {
                this.currentTrack.seek(x * duration);
                this.updateProgressUI(x * 100);
            }
        };

        bar.addEventListener('click', seek);

        bar.addEventListener('mousedown', () => { this.isDraggingProgress = true; });
        document.addEventListener('mousemove', e => {
            if (this.isDraggingProgress) seek(e);
        });
        document.addEventListener('mouseup', () => { this.isDraggingProgress = false; });

        // Touch support
        bar.addEventListener('touchstart', e => {
            this.isDraggingProgress = true;
            seek(e.touches[0]);
        }, { passive: true });
        document.addEventListener('touchmove', e => {
            if (this.isDraggingProgress) seek(e.touches[0]);
        }, { passive: true });
        document.addEventListener('touchend', () => { this.isDraggingProgress = false; });
    }

    bindVolumeSlider() {
        const slider = document.getElementById('volumeSlider');
        if (!slider) return;

        const setVol = (e) => {
            const rect = slider.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.currentVolume = pct;
            if (this.currentTrack) this.currentTrack.volume(pct);
            this.isMuted = false;
            this.updateVolumeUI();
        };

        slider.addEventListener('click', setVol);
        slider.addEventListener('mousedown', () => { this.isDraggingVolume = true; });
        document.addEventListener('mousemove', e => {
            if (this.isDraggingVolume) setVol(e);
        });
        document.addEventListener('mouseup', () => { this.isDraggingVolume = false; });

        // Touch
        slider.addEventListener('touchstart', e => {
            this.isDraggingVolume = true;
            setVol(e.touches[0]);
        }, { passive: true });
        document.addEventListener('touchmove', e => {
            if (this.isDraggingVolume) setVol(e.touches[0]);
        }, { passive: true });
        document.addEventListener('touchend', () => { this.isDraggingVolume = false; });
    }

    // -------------------------------------------------------------------------
    // TAB SWITCHING
    // -------------------------------------------------------------------------
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
            btn.setAttribute('aria-selected', btn.dataset.tab === tab ? 'true' : 'false');
        });
        document.getElementById('moodButtonsContent')?.classList.toggle('active', tab === 'mood');
        document.getElementById('textInputContent')?.classList.toggle('active', tab === 'text');
    }

    // -------------------------------------------------------------------------
    // MOOD SELECTION (button clicks)
    // -------------------------------------------------------------------------
    selectMood(mood) {
        if (mood === 'random') {
            const options = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'nostalgic'];
            mood = options[Math.floor(Math.random() * options.length)];
        }
        console.log('🎯 Mood selected:', mood);
        this.currentMood = mood;
        this.showMoodAnalysis(mood);
    }

    // -------------------------------------------------------------------------
    // AI MOOD ANALYSIS (text input → Gemini API)
    // -------------------------------------------------------------------------
    async analyzeTextMood(text) {
        const input = text || document.getElementById('moodInput')?.value.trim();
        if (!input) {
            this.showError("Please tell us how you're feeling! 😊");
            return;
        }

        const btn = document.getElementById('analyzeMoodBtn');
        const btnText = document.getElementById('analyzeBtnText');
        const spinner = document.getElementById('analyzeLoading');

        if (btn) btn.disabled = true;
        if (btnText) btnText.textContent = 'Analyzing…';
        if (spinner) spinner.classList.remove('hidden');

        try {
            // Call backend PHP proxy which talks to Gemini securely with the API key.
            const response = await fetch('analyze_mood.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input })
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const msg = data?.error || `API error: ${response.status}`;
                throw new Error(msg);
            }

            let detectedMood = (data && data.mood ? data.mood : '').trim().toLowerCase();

            const validMoods = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'nostalgic'];
            if (!validMoods.includes(detectedMood)) {
                console.warn('Unexpected mood from API:', detectedMood, '→ defaulting to chill');
                detectedMood = 'chill';
            }

            console.log('🤖 Gemini detected mood:', detectedMood);
            this.currentMood = detectedMood;
            this.showMoodAnalysis(detectedMood);

        } catch (err) {
            console.error('Gemini API error:', err);
            const msg =
                (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message.trim())
                    ? err.message.trim()
                    : 'Could not reach Gemini AI. Please check your API key or internet connection.';
            this.showError(msg);
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = '💖 Analyze My Mood';
            if (spinner) spinner.classList.add('hidden');
        }
    }

    // -------------------------------------------------------------------------
    // SHOW MOOD ANALYSIS CARD
    // -------------------------------------------------------------------------
    showMoodAnalysis(mood) {
        const analysis = MOOD_ANALYSIS[mood];
        if (!analysis) return;

        const icon = document.getElementById('moodIconDisplay');
        const text = document.getElementById('analysisText');

        if (icon) icon.textContent = analysis.icon;
        if (text) text.textContent = analysis.text;

        // Reset rating buttons
        document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));

        // Reset generate button
        const genBtn = document.getElementById('generateMusicBtn');
        if (genBtn) { genBtn.disabled = true; genBtn.style.opacity = '0.5'; }

        // Hide refine section
        document.getElementById('refineSection')?.classList.add('hidden');

        // Reset intensity and genre for this mood
        this.currentIntensity = 3;
        const intensitySlider = document.getElementById('moodIntensity');
        const intensityValue = document.getElementById('intensityValue');
        if (intensitySlider) intensitySlider.value = '3';
        if (intensityValue) intensityValue.textContent = '3';
        document.querySelectorAll('.genre-chip').forEach((c, i) => {
            c.classList.toggle('active', i === 0);
        });
        this.selectedGenre = '';

        this.applyMoodGlow(mood);
        this.showCard('analysisCard');

        // Bounce effect
        setTimeout(() => {
            const ar = document.getElementById('analysisResult');
            if (ar) {
                ar.style.transform = 'scale(1.05)';
                setTimeout(() => { ar.style.transform = 'scale(1)'; }, 300);
            }
        }, 150);
    }

    // -------------------------------------------------------------------------
    // RATING / AI FEEDBACK LOOP
    // -------------------------------------------------------------------------
    rateMoodAnalysis(rating) {
        console.log('⭐ Rating:', rating);

        document.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-rating="${rating}"]`)?.classList.add('selected');

        if (rating === 'bad') {
            // Show refine section — AI feedback loop
            document.getElementById('refineSection')?.classList.remove('hidden');
            document.getElementById('refineInput')?.focus();
            // Keep generate button disabled until they refine or we re-analyze
        } else if (rating === 'okay') {
            this.enableGenerateBtn();
            this.showTemporaryMessage("Good enough! 👌 Let's find you some music!");
        } else if (rating === 'perfect') {
            this.enableGenerateBtn();
            this.showTemporaryMessage("Perfect match! 🎯 Generating your playlist…");
        }
    }

    enableGenerateBtn() {
        const btn = document.getElementById('generateMusicBtn');
        if (!btn) return;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.05)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
    }

    // Refine with AI (feedback loop button)
    async refineWithAI() {
        const refineInput = document.getElementById('refineInput');
        const text = refineInput?.value.trim();
        if (!text) {
            this.showError('Please describe your feeling in more detail! 🎯');
            return;
        }
        await this.analyzeTextMood(text);
    }

    // -------------------------------------------------------------------------
    // GENERATE MUSIC → Load Player
    // -------------------------------------------------------------------------
    async generateMusic() {
        if (!this.currentMood) { this.showError('Please select a mood first! 🎭'); return; }

        const genBtn = document.getElementById('generateMusicBtn');
        const originalText = genBtn.textContent;
        genBtn.disabled = true;
        genBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding tracks...';

        try {
            // Genre filter overrides mood mapping when user picked a genre
            const searchTerm = this.selectedGenre || ITUNES_MAPPING[this.currentMood] || 'popular hits';

            let apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=30`;
            
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("Network error fetching from iTunes API");

            const data = await response.json();
            const tracks = data.results;

            if (!tracks || !tracks.length) {
                throw new Error("No tracks found for this mood");
            }

            // Map API response to our player format
            this.currentPlaylist = tracks
                .filter(t => t.previewUrl) // Ensure track has a preview URL
                .map(t => ({
                    url: t.previewUrl,
                    title: t.trackName,
                    artist: t.artistName,
                    genre: t.primaryGenreName || this.currentMood,
                    emoji: MOOD_EMOJIS[this.currentMood],
                    art: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '500x500bb') : null, // High-res artwork
                    color: MOOD_COLORS[this.currentMood]
                }));

            if (this.currentPlaylist.length === 0) {
                 throw new Error("Found tracks, but none had audio previews available.");
            }

            if (this.isShuffle) this.shuffleArray(this.currentPlaylist);
            this.currentTrackIndex = 0;

            this.showCard('playerCard');
            this.loadAndPlayTrack();
        } catch (error) {
            console.error('❌ Music fetch error:', error);
            this.showError("Could not stream music right now. Using fallback...");

            // Fallback would go here if we kept local files, but we're moving to API-only.
            // For now, let's just retry or show a better error.
        } finally {
            genBtn.disabled = false;
            genBtn.textContent = originalText;
        }
    }

    // -------------------------------------------------------------------------
    // HOWLER.JS PLAYBACK
    // -------------------------------------------------------------------------
    loadAndPlayTrack() {
        // Stop & unload previous
        if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack.unload();
            this.currentTrack = null;
        }
        if (this.progressInterval) clearInterval(this.progressInterval);

        const track = this.currentPlaylist[this.currentTrackIndex];
        if (!track) return;

        console.log('🎧 Loading:', track.title, 'by', track.artist, '|', track.url);

        // Update UI immediately
        this.updateTrackUI(track);
        this.showLoadingState(true);
        this.setWaveformPlaying(false);

        this.currentTrack = new Howl({
            src: [track.url],
            volume: this.isMuted ? 0 : this.currentVolume,
            html5: true,
            onload: () => {
                console.log('✅ Loaded:', track.title);
                this.showLoadingState(false);
                this.updateDuration();
            },
            onplay: () => {
                this.isPlaying = true;
                this.updatePlayButton();
                this.setWaveformPlaying(true);
                this.startProgressUpdate();
            },
            onpause: () => {
                this.isPlaying = false;
                this.updatePlayButton();
                this.setWaveformPlaying(false);
                if (this.progressInterval) clearInterval(this.progressInterval);
            },
            onstop: () => {
                this.isPlaying = false;
                this.updatePlayButton();
                this.setWaveformPlaying(false);
                if (this.progressInterval) clearInterval(this.progressInterval);
            },
            onend: () => {
                console.log('⏭️ Track ended');
                if (this.isRepeat) {
                    this.currentTrack.play();
                } else {
                    this.nextTrack();
                }
            },
            onloaderror: (id, err) => {
                console.error('❌ Load error:', track.url, err);
                this.showLoadingState(false);
                this.showError(`Could not load "${track.title}". Skipping to next track…`);
                if (this.currentPlaylist.length > 1) {
                    setTimeout(() => this.nextTrack(), 1500);
                }
            },
            onplayerror: (id, err) => {
                console.error('❌ Play error:', err);
                this.currentTrack?.once('unlock', () => { this.currentTrack?.play(); });
            }
        });

        setTimeout(() => this.currentTrack?.play(), 150);
    }

    // -------------------------------------------------------------------------
    // PLAYER CONTROLS
    // -------------------------------------------------------------------------
    togglePlayPause() {
        if (!this.currentTrack) return;
        if (this.isPlaying) {
            this.currentTrack.pause();
        } else {
            this.currentTrack.play();
        }
    }

    nextTrack() {
        if (!this.currentPlaylist.length) return;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        this.loadAndPlayTrack();
    }

    previousTrack() {
        if (!this.currentPlaylist.length) return;
        // If past 3 seconds, restart current track
        if (this.currentTrack && this.currentTrack.seek() > 3) {
            this.currentTrack.seek(0);
            return;
        }
        this.currentTrackIndex = this.currentTrackIndex === 0
            ? this.currentPlaylist.length - 1
            : this.currentTrackIndex - 1;
        this.loadAndPlayTrack();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        const btn = document.getElementById('shuffleBtn');
        if (btn) {
            btn.classList.toggle('active-toggle', this.isShuffle);
            btn.title = this.isShuffle ? 'Shuffle ON' : 'Shuffle OFF';
        }
        if (this.isShuffle && this.currentPlaylist.length) {
            this.shuffleArray(this.currentPlaylist);
            this.currentTrackIndex = 0;
        }
        this.showTemporaryMessage(this.isShuffle ? '🔀 Shuffle ON' : '🔀 Shuffle OFF');
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        const btn = document.getElementById('repeatBtn');
        if (btn) {
            btn.classList.toggle('active-toggle', this.isRepeat);
            btn.title = this.isRepeat ? 'Repeat ON' : 'Repeat OFF';
        }
        this.showTemporaryMessage(this.isRepeat ? '🔁 Repeat ON' : '🔁 Repeat OFF');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const vol = this.isMuted ? 0 : this.currentVolume;
        if (this.currentTrack) this.currentTrack.volume(vol);
        const btn = document.getElementById('muteBtn');
        if (btn) btn.textContent = this.isMuted ? '🔇' : '🔊';
        this.updateVolumeUI();
    }

    // -------------------------------------------------------------------------
    // UI UPDATE HELPERS
    // -------------------------------------------------------------------------
    updateTrackUI(track) {
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        document.getElementById('trackGenre').textContent = track.genre;
        document.getElementById('albumEmoji').textContent = track.emoji || '🎵';

        const art = document.getElementById('albumArt');
        if (art) {
            if (track.art) {
                art.style.background = `url('${track.art}') center/cover no-repeat`;
            } else {
                art.style.background = track.color || 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            }
        }

        this.updatePlaylistInfo();
    }

    updatePlaylistInfo() {
        const el = document.getElementById('playlistInfo');
        if (el) {
            el.textContent = `Track ${this.currentTrackIndex + 1} of ${this.currentPlaylist.length}`;
        }
    }

    updatePlayButton() {
        const btn = document.getElementById('playPauseBtn');
        if (btn) btn.textContent = this.isPlaying ? '⏸' : '▶';
    }

    setWaveformPlaying(playing) {
        const wf = document.getElementById('waveform');
        if (wf) wf.classList.toggle('playing', playing);
    }

    showLoadingState(show) {
        const art = document.getElementById('albumArt');
        const dots = document.getElementById('loadingDots');
        if (art) art.classList.toggle('loading', show);
        if (dots) dots.style.display = show ? 'flex' : 'none';
    }

    updateDuration() {
        if (!this.currentTrack) return;
        const dur = this.currentTrack.duration();
        if (dur > 0) {
            document.getElementById('timeDuration').textContent = this.formatTime(dur);
        }
    }

    startProgressUpdate() {
        if (this.progressInterval) clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
            if (!this.currentTrack || !this.isPlaying || this.isDraggingProgress) return;
            const seek = this.currentTrack.seek() || 0;
            const dur = this.currentTrack.duration() || 1;
            const pct = (seek / dur) * 100;
            this.updateProgressUI(pct);
            document.getElementById('timeElapsed').textContent = this.formatTime(seek);
        }, 500);
    }

    updateProgressUI(pct) {
        const fill = document.getElementById('progressFill');
        const thumb = document.getElementById('progressThumb');
        if (fill) fill.style.width = `${pct}%`;
        if (thumb) thumb.style.left = `${pct}%`;
        const bar = document.getElementById('progressBar');
        if (bar) bar.setAttribute('aria-valuenow', Math.round(pct));
    }

    updateVolumeUI() {
        const pct = this.isMuted ? 0 : Math.round(this.currentVolume * 100);
        const fill = document.getElementById('volumeFill');
        const thumb = document.getElementById('volumeThumb');
        const text = document.getElementById('volumeText');
        const slider = document.getElementById('volumeSlider');
        if (fill) fill.style.width = `${pct}%`;
        if (thumb) thumb.style.left = `${pct}%`;
        if (text) text.textContent = `${pct}%`;
        if (slider) slider.setAttribute('aria-valuenow', pct);
    }

    // -------------------------------------------------------------------------
    // CARD NAVIGATION & AMBIENT MOOD GLOW
    // -------------------------------------------------------------------------
    applyMoodGlow(mood) {
        if (!mood) return;
        document.body.classList.add('mood-glow');
        document.body.classList.remove('mood-glow--happy', 'mood-glow--sad', 'mood-glow--energetic', 'mood-glow--chill', 'mood-glow--romantic', 'mood-glow--nostalgic');
        document.body.classList.add(`mood-glow--${mood}`);
    }

    removeMoodGlow() {
        document.body.classList.remove('mood-glow', 'mood-glow--happy', 'mood-glow--sad', 'mood-glow--energetic', 'mood-glow--chill', 'mood-glow--romantic', 'mood-glow--nostalgic');
    }

    showCard(cardId) {
        document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
        if (cardId === 'moodCard') this.removeMoodGlow();
        else if (this.currentMood) this.applyMoodGlow(this.currentMood);
        const target = document.getElementById(cardId);
        if (target) {
            target.classList.remove('hidden');
            target.style.animation = 'none';
            requestAnimationFrame(() => {
                target.style.animation = '';
                target.classList.add('card-appear');
                setTimeout(() => target.classList.remove('card-appear'), 600);
            });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetToMoodSelection() {
        if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack.unload();
            this.currentTrack = null;
        }
        if (this.progressInterval) clearInterval(this.progressInterval);

        this.currentMood = null;
        this.isPlaying = false;
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.selectedGenre = '';

        document.getElementById('moodInput').value = '';
        document.getElementById('refineInput').value = '';
        document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.genre-chip').forEach((c, i) => c.classList.toggle('active', i === 0));

        const gen = document.getElementById('generateMusicBtn');
        if (gen) { gen.disabled = true; gen.style.opacity = '0.5'; }

        this.updateProgressUI(0);
        document.getElementById('timeElapsed').textContent = '0:00';
        document.getElementById('timeDuration').textContent = '0:00';
        this.setWaveformPlaying(false);
        this.removeMoodGlow();

        this.showCard('moodCard');
        this.switchTab('mood');
    }

    // -------------------------------------------------------------------------
    // ERROR / TOAST MESSAGES
    // -------------------------------------------------------------------------
    showError(msg) {
        const el = document.getElementById('errorMessage');
        const txt = document.getElementById('errorText');
        if (el && txt) {
            txt.textContent = msg;
            el.classList.remove('hidden');
            clearTimeout(this._errorTimer);
            this._errorTimer = setTimeout(() => this.hideError(), 6000);
        }
        console.error('❌', msg);
    }

    hideError() {
        document.getElementById('errorMessage')?.classList.add('hidden');
    }

    showTemporaryMessage(msg) {
        const el = document.createElement('div');
        el.className = 'toast-message';
        el.textContent = msg;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('toast-visible'));
        setTimeout(() => {
            el.classList.remove('toast-visible');
            setTimeout(() => el.remove(), 400);
        }, 2800);
    }

    // -------------------------------------------------------------------------
    // KEYBOARD SHORTCUTS
    // -------------------------------------------------------------------------
    handleKeydown(e) {
        if (!this.currentTrack) return;
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.currentVolume = Math.min(1, this.currentVolume + 0.1);
                if (this.currentTrack) this.currentTrack.volume(this.currentVolume);
                this.updateVolumeUI();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.currentVolume = Math.max(0, this.currentVolume - 0.1);
                if (this.currentTrack) this.currentTrack.volume(this.currentVolume);
                this.updateVolumeUI();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
        }
    }

    // -------------------------------------------------------------------------
    // UTILITIES
    // -------------------------------------------------------------------------
    formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}

// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting MoodiO…');
    window.moodiO = new MoodiO();
});

window.addEventListener('beforeunload', e => {
    if (window.moodiO?.isPlaying) {
        e.preventDefault();
        e.returnValue = 'Music is playing. Leave anyway?';
    }
});