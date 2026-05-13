const API_BASE_URL = 'http://localhost:5000/api';

// Update range slider values
document.getElementById('tempo').addEventListener('input', function (e) {
    document.getElementById('tempo-val').textContent = e.target.value;
});

document.getElementById('energy').addEventListener('input', function (e) {
    document.getElementById('energy-val').textContent = parseFloat(e.target.value).toFixed(1);
});

document.getElementById('danceability').addEventListener('input', function (e) {
    document.getElementById('danceability-val').textContent = parseFloat(e.target.value).toFixed(1);
});

document.getElementById('acousticness').addEventListener('input', function (e) {
    document.getElementById('acousticness-val').textContent = parseFloat(e.target.value).toFixed(1);
});

// Fetch Recommendations
async function getRecommendations(algorithm) {
    const genre = document.getElementById('genre').value;
    const mood = document.getElementById('mood').value;
    const tempo = document.getElementById('tempo').value;
    const energy = document.getElementById('energy').value;
    const danceability = document.getElementById('danceability').value;
    const acousticness = document.getElementById('acousticness').value;
    const strict_genre = document.getElementById('strict_genre').checked;

    const preferences = { genre, mood, tempo, energy, danceability, acousticness, strict_genre };

    const container = document.getElementById('recommendations-container');
    const loading = document.getElementById('loading');
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) chartContainer.style.display = 'none';

    loading.classList.remove('hidden');
    container.innerHTML = '';

    try {
        let url = `${API_BASE_URL}/recommend/${algorithm}`;
        let bodyPayload = JSON.stringify(preferences);
        
        if (algorithm === 'collab') {
            url = `${API_BASE_URL}/recommend/collab`;
            const playlist = JSON.parse(localStorage.getItem('aimusic_playlist')) || [];
            const liked_track_ids = playlist.map(t => t.id);
            bodyPayload = JSON.stringify({ liked_track_ids });
            if(liked_track_ids.length === 0) {
                loading.classList.add('hidden');
                alert("You need to add some songs to your Playlist first before we can use Collaborative Filtering!");
                return;
            }
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: bodyPayload
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const responseData = await response.json();
        const data = responseData.recommendations || responseData;
        const metrics = responseData.metrics;

        loading.classList.add('hidden');
        
        const metricsContainer = document.getElementById('metrics-container');
        if (metrics) {
            document.getElementById('metric-model').textContent = metrics.model;
            document.getElementById('metric-accuracy').textContent = metrics.accuracy + '%';
            document.getElementById('metric-precision').textContent = metrics.precision + '%';
            metricsContainer.style.display = 'flex';
        } else {
            if(metricsContainer) metricsContainer.style.display = 'none';
        }

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-face-frown"></i>
                    <p>No recommendations found for these preferences.</p>
                </div>
            `;
            return;
        }

        // Render tracks
        data.forEach(track => {
            const card = document.createElement('div');
            card.className = 'track-card';

            const matchPercentage = Math.round(track.score * 100);

            // Update track card to include Playlist button
            card.innerHTML = `
                <div class="score-badge">${matchPercentage}% Match</div>
                <img src="${track.cover_url}" alt="${track.title}" class="track-image">
                <div class="play-overlay">
                    <i class="fa-solid fa-circle-play"></i>
                </div>
                <h3 class="track-title">${track.title}</h3>
                <p class="track-artist">${track.artist}</p>
                <div class="track-tags">
                    <span class="tag">${track.genre}</span>
                    <span class="tag">${track.mood}</span>
                </div>
                <button class="add-playlist-btn" style="width: 100%; margin-top: 10px; padding: 6px; border-radius: 4px; background: rgba(255,255,255,0.1); border: none; color: white; cursor: pointer; transition: 0.2s;">
                    <i class="fa-solid fa-plus"></i> Add to Playlist
                </button>
            `;

            //  Click to play (update bottom bar)
            card.querySelector('.play-overlay').addEventListener('click', (e) => {
                e.stopPropagation();
                playTrack(track);
            });

            // Add to Playlist
            card.querySelector('.add-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                addToPlaylist(track);
            });

            container.appendChild(card);
        });

    } catch (error) {
        loading.classList.add('hidden');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ff7675;"></i>
                <p>Failed to connect to the server. Is the backend running?</p>
                <p style="font-size: 12px; margin-top: 8px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Chart instance tracker
let chartInstance = null;

async function compareModels() {
    const genre = document.getElementById('genre').value;
    const mood = document.getElementById('mood').value;
    const tempo = document.getElementById('tempo').value;
    const energy = document.getElementById('energy').value;
    const danceability = document.getElementById('danceability').value;
    const acousticness = document.getElementById('acousticness').value;
    const strict_genre = document.getElementById('strict_genre').checked;
    
    const preferences = { genre, mood, tempo, energy, danceability, acousticness, strict_genre };
    
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    
    const metricsContainer = document.getElementById('metrics-container');
    if(metricsContainer) metricsContainer.style.display = 'none';
    
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/compare_models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        loading.classList.add('hidden');
        
        const chartContainer = document.getElementById('chart-container');
        chartContainer.style.display = 'block';
        
        const ctx = document.getElementById('metricsChart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.models,
                datasets: [
                    {
                        label: 'Training Accuracy (%)',
                        data: data.accuracy,
                        backgroundColor: 'rgba(108, 92, 231, 0.7)',
                        borderColor: 'rgba(108, 92, 231, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Precision (%)',
                        data: data.precision,
                        backgroundColor: 'rgba(0, 206, 201, 0.7)',
                        borderColor: 'rgba(0, 206, 201, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: '#a0a0b0' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
        
    } catch (error) {
        loading.classList.add('hidden');
        alert("Failed to compare models: " + error.message);
    }
}

// Update bottom player
let isPlaying = false;
let playInterval;
let currentAudio = new Audio(); // Create a global audio element
currentAudio.crossOrigin = "anonymous"; // Important for visualizer

// Audio Visualizer Setup
let audioCtx;
let analyser;
let source;

function initVisualizer() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaElementSource(currentAudio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        drawVisualizer();
    }
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    const canvas = document.getElementById('audio-visualizer');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 50}, 92, 231)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

// Set default volume
currentAudio.volume = 0.5;
document.addEventListener("DOMContentLoaded", () => {
    const volumeProgress = document.querySelector('.volume-progress');
    if (volumeProgress) volumeProgress.style.width = '50%';
});

// RL Feedback
async function sendFeedback(trackId, isLiked) {
    try {
        await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({track_id: trackId, is_liked: isLiked})
        });
        const iconId = isLiked ? 'like-btn' : 'dislike-btn';
        const icon = document.getElementById(iconId);
        if(icon) {
            icon.style.color = isLiked ? '#00b894' : '#ff7675';
            setTimeout(() => icon.style.color = '#a0a0b0', 1000);
        }
    } catch(e) {
        console.error("Feedback error", e);
    }
}

async function playTrack(track) {
    // Update UI
    document.getElementById('now-playing-img').src = track.cover_url;
    document.getElementById('now-playing-title').textContent = track.title;
    document.getElementById('now-playing-artist').textContent = track.artist;
    
    const playBtnIcon = document.querySelector('.play-btn i');
    playBtnIcon.className = 'fa-solid fa-spinner fa-spin'; // Show loading
    
    // Pause current playing audio
    currentAudio.pause();
    currentAudio.currentTime = 0;
    
    // Setup lyrics
    document.getElementById('lyrics-panel').style.display = 'block';
    document.getElementById('lyrics-text').textContent = "Searching for lyrics...";
    try {
        const lyrRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`);
        if(lyrRes.ok) {
            const lyrData = await lyrRes.json();
            document.getElementById('lyrics-text').textContent = lyrData.lyrics || "No lyrics found for this track.";
        } else {
            document.getElementById('lyrics-text').textContent = "Lyrics not available for synthetic or unknown tracks.";
        }
    } catch(e) {
        document.getElementById('lyrics-text').textContent = "Lyrics service unavailable.";
    }
    
    // Setup RL feedback buttons
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    if(likeBtn) likeBtn.onclick = () => sendFeedback(track.id, true);
    if(dislikeBtn) dislikeBtn.onclick = () => sendFeedback(track.id, false);
    
    try {
        // Try to fetch real 30-second preview from iTunes API
        const query = encodeURIComponent(`${track.title} ${track.artist}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await response.json();
        
        let audioUrl = '';
        if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
            audioUrl = data.results[0].previewUrl;
            // Upgrade the cover image if iTunes found a better one
            document.getElementById('now-playing-img').src = data.results[0].artworkUrl100;
        } else {
            // Fallback royalty-free track for synthetic/generated songs
            audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        }
        
        currentAudio.src = audioUrl;
        await currentAudio.play();
        initVisualizer();
        
        playBtnIcon.className = 'fa-solid fa-circle-pause';
        isPlaying = true;
        
        // Sync progress bar
        clearInterval(playInterval);
        const progressBar = document.querySelector('.progress');
        const timeDisplays = document.querySelectorAll('.time');
        
        playInterval = setInterval(() => {
            if (currentAudio.duration) {
                const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
                progressBar.style.width = `${progress}%`;
                
                const mins = Math.floor(currentAudio.currentTime / 60);
                const secs = Math.floor(currentAudio.currentTime % 60).toString().padStart(2, '0');
                timeDisplays[0].textContent = `${mins}:${secs}`;
                
                const totalMins = Math.floor(currentAudio.duration / 60);
                const totalSecs = Math.floor(currentAudio.duration % 60).toString().padStart(2, '0');
                timeDisplays[1].textContent = `${totalMins}:${totalSecs}`;
            }
            
            if (currentAudio.ended) {
                playBtnIcon.className = 'fa-solid fa-circle-play';
                isPlaying = false;
                clearInterval(playInterval);
            }
        }, 500);
        
    } catch (e) {
        console.error("Audio playback error:", e);
        alert("Failed to load audio for this track.");
        playBtnIcon.className = 'fa-solid fa-circle-play';
        isPlaying = false;
    }
}

// Play/Pause button toggle
document.querySelector('.play-btn').addEventListener('click', () => {
    const playBtnIcon = document.querySelector('.play-btn i');
    if(isPlaying) {
        currentAudio.pause();
        playBtnIcon.className = 'fa-solid fa-circle-play';
    } else {
        if(currentAudio.src) {
            currentAudio.play();
            playBtnIcon.className = 'fa-solid fa-circle-pause';
        } else {
            alert("Please select a song from the list to play first!");
            return;
        }
    }
    isPlaying = !isPlaying;
});

// Volume control
document.querySelector('.volume-bar').addEventListener('click', (e) => {
    const volumeBar = document.querySelector('.volume-bar');
    const rect = volumeBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    currentAudio.volume = percent;
    document.querySelector('.volume-progress').style.width = `${percent * 100}%`;
});

// Playlist Management using LocalStorage
function addToPlaylist(track) {
    let playlist = JSON.parse(localStorage.getItem('aimusic_playlist')) || [];
    if(!playlist.some(t => t.id === track.id)) {
        playlist.push(track);
        localStorage.setItem('aimusic_playlist', JSON.stringify(playlist));
        alert(`"${track.title}" added to your playlist!`);
    } else {
        alert(`"${track.title}" is already in your playlist.`);
    }
}

// Show Playlists
document.querySelector('.nav-menu ul li:nth-child(4)').addEventListener('click', () => {
    let playlist = JSON.parse(localStorage.getItem('aimusic_playlist')) || [];
    const container = document.getElementById('recommendations-container');
    document.querySelector('.results-header h2').textContent = 'Your Playlist';
    
    if(playlist.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-list"></i><p>Your playlist is empty.</p></div>`;
        return;
    }
    
    container.innerHTML = '';
    playlist.forEach(track => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <img src="${track.cover_url}" alt="${track.title}" class="track-image">
            <div class="play-overlay">
                <i class="fa-solid fa-circle-play"></i>
            </div>
            <h3 class="track-title">${track.title}</h3>
            <p class="track-artist">${track.artist}</p>
        `;
        card.querySelector('.play-overlay').addEventListener('click', () => playTrack(track));
        container.appendChild(card);
    });
});