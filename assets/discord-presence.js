/**
 * Discord Presence using Lanyard WebSocket API
 * Author: Quang (HikariADS)
 * Integrated realtime presence with Synced Lyrics (Fixed Center Scrolling)
 */

class DiscordPresence {
    constructor(userId = '949681622825975868') {
        this.userId = userId;
        this.wsUrl = 'wss://api.lanyard.rest/socket';
        this.ws = null;
        this.heartbeatInterval = null;
        this.reconnectAttempts = 0;

        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            userAvatar: document.getElementById('userAvatar'),
            statusText: document.querySelector('.status-text'),
            statusIndicator: document.getElementById('statusIndicator'),
            activitiesContainer: document.getElementById('activities')
        };

        this.init();
    }

    init() {
        this.connectWebSocket();
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    updateConnectionStatus(status, message) {
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.className = `connection-status ${status}`;
            this.elements.connectionStatus.textContent = message;
            this.elements.connectionStatus.style.display = 'block';
            if (status === 'connected') setTimeout(() => { this.elements.connectionStatus.style.display = 'none'; }, 3000);
        }
    }

    connectWebSocket() {
        this.updateConnectionStatus('connecting', 'Connecting...');
        try {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.onopen = () => {
                console.log('✅ Connected to Lanyard');
                this.subscribeToUser();
            };
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onclose = () => this.reconnect();
            this.ws.onerror = (err) => { console.error('WS Error', err); this.reconnect(); };
        } catch (err) { this.reconnect(); }
    }

    subscribeToUser() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: this.userId } }));
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.op === 1) this.startHeartbeat(data.d.heartbeat_interval);
            if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') this.updatePresence(data.d);
        } catch (e) {}
    }

    startHeartbeat(interval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ op: 3 }));
        }, interval);
        this.updateConnectionStatus('connected', 'Connected!');
    }

    updatePresence(data) {
        if (!data || !data.discord_user) return;
        const user = data.discord_user;
        const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=512` : `https://cdn.discordapp.com/embed/avatars/0.png`;
        if (this.elements.userAvatar) this.elements.userAvatar.src = avatarUrl;
        
        const statusMap = { online: 'Online 🟢', idle: 'Idle 🌙', dnd: 'Do Not Disturb 🔴', offline: 'Offline ⚫' };
        if (this.elements.statusIndicator) this.elements.statusIndicator.className = `status-indicator ${data.discord_status || 'offline'}`;
        if (this.elements.statusText) this.elements.statusText.textContent = statusMap[data.discord_status] || 'Offline';

        handleSpotifyUpdate(data);
    }

    reconnect() {
        clearInterval(this.heartbeatInterval);
        this.reconnectAttempts++;
        if (this.reconnectAttempts <= 5) setTimeout(() => this.connectWebSocket(), 5000);
    }

    cleanup() {
        if (this.ws) this.ws.close();
        clearInterval(this.heartbeatInterval);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DiscordPresence('949681622825975868');
});

// ==========================================
// 🎵 SPOTIFY SYNCED LYRICS LOGIC
// ==========================================

let currentTrackID = "";
let currentLyrics = []; 
let songStartTime = 0;  
let isSynced = false;   
let animationFrameId;
let lastActiveIndex = -1; 

function handleSpotifyUpdate(data) {
    const lyricsContainer = document.getElementById("lyrics-container");

    // Nếu không nghe nhạc
    if (!data.listening_to_spotify) {
        if (lyricsContainer) lyricsContainer.style.display = "none";
        cancelAnimationFrame(animationFrameId);
        updateCardContent(null, data.activities);
        return;
    }

    const spotify = data.spotify;
    updateCardContent(spotify);
    songStartTime = spotify.timestamps.start;

    // Nếu đổi bài hát -> Gọi API lấy Lyrics mới
    if (currentTrackID !== spotify.track_id) {
        currentTrackID = spotify.track_id;
        lastActiveIndex = -1; // Reset trạng thái
        fetchLyrics(spotify.song, spotify.artist);
    }

    // Bắt đầu vòng lặp sync nếu chưa chạy
    if (!animationFrameId) {
        syncLoop(); 
    }
}

function updateCardContent(spotify, activities = []) {
    const platform = document.getElementById("platform");
    const title = document.getElementById("title");
    const artist = document.getElementById("artist");
    const cover = document.getElementById("cover");
    const progress = document.getElementById("progress");

    if (spotify) {
        platform.textContent = "Listening to Spotify";
        title.textContent = spotify.song;
        artist.textContent = spotify.artist;
        cover.src = spotify.album_art_url;
        
        const totalDuration = spotify.timestamps.end - spotify.timestamps.start;
        const currentProgress = Date.now() - spotify.timestamps.start;
        const percentage = (currentProgress / totalDuration) * 100;
        if (progress) progress.style.width = `${Math.min(percentage, 100)}%`;

    } else if (activities.length > 0) {
        const vscode = activities.find(a => a.name === "Visual Studio Code");
        if (vscode) {
            platform.textContent = "Visual Studio Code";
            title.textContent = vscode.details || "Coding";
            artist.textContent = vscode.state || "";
            cover.src = "https://code.visualstudio.com/assets/images/code-stable.png";
            if (progress) progress.style.width = "100%";
        } else {
            platform.textContent = "Online";
            title.textContent = activities[0].name;
            artist.textContent = activities[0].state || "";
            cover.src = "https://cdn-icons-png.flaticon.com/512/906/906361.png";
            if (progress) progress.style.width = "0%";
        }
    } else {
        platform.textContent = "Offline";
        title.textContent = "";
        artist.textContent = "";
        cover.src = "https://cdn-icons-png.flaticon.com/512/906/906361.png";
        if (progress) progress.style.width = "0%";
    }
}

async function fetchLyrics(track, artist) {
    const lyricsContent = document.getElementById("lyrics-content");
    const lyricsContainer = document.getElementById("lyrics-container");
    
    lyricsContainer.style.display = "flex";
    lyricsContent.innerHTML = '<div class="lyric-line">Loading lyrics...</div>';
    
    try {
        const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();

        if (data.syncedLyrics) {
            currentLyrics = parseLRC(data.syncedLyrics);
            isSynced = true;
            renderLyrics(currentLyrics);
        } else if (data.plainLyrics) {
            isSynced = false;
            lyricsContent.innerHTML = `<div class="lyric-line active" style="white-space: pre-line;">${data.plainLyrics}</div>`;
        } else {
            throw new Error("No lyrics");
        }
    } catch (e) {
        isSynced = false;
        lyricsContent.innerHTML = '<div class="lyric-line">Lyrics not available</div>';
    }
}

function parseLRC(lrcString) {
    return lrcString.split('\n').map(line => {
        const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            return {
                time: minutes * 60 + seconds,
                text: match[3].trim()
            };
        }
        return null;
    }).filter(item => item !== null && item.text.length > 0);
}

function renderLyrics(lyrics) {
    const container = document.getElementById("lyrics-content");
    container.innerHTML = ""; 
    
    lyrics.forEach((line, index) => {
        const p = document.createElement("p");
        p.className = "lyric-line";
        p.id = `line-${index}`; 
        p.textContent = line.text;
        container.appendChild(p);
    });
}

function syncLoop() {
    if (document.getElementById("lyrics-container").style.display === "none") {
        animationFrameId = requestAnimationFrame(syncLoop);
        return;
    }

    const now = Date.now();
    const currentTime = (now - songStartTime) / 1000;

    if (isSynced && currentLyrics.length > 0) {
        let activeIndex = -1;
        
        for (let i = 0; i < currentLyrics.length; i++) {
            if (currentLyrics[i].time <= currentTime) {
                activeIndex = i;
            } else {
                break;
            }
        }

        if (activeIndex !== -1 && activeIndex !== lastActiveIndex) {
            highlightLine(activeIndex);
            lastActiveIndex = activeIndex;
        }
    }

    animationFrameId = requestAnimationFrame(syncLoop);
}

// 🟢 HÀM QUAN TRỌNG: CĂN GIỮA CHÍNH XÁC TUYỆT ĐỐI
function highlightLine(index) {
    // 1. Xóa active cũ
    const prevActive = document.querySelector(".lyric-line.active");
    if (prevActive) prevActive.classList.remove("active");

    // 2. Lấy dòng mới và container
    const currentLine = document.getElementById(`line-${index}`);
    const container = document.getElementById("lyrics-content");

    if (currentLine && container) {
        currentLine.classList.add("active");
        
        // 3. LOGIC TÍNH TOÁN MỚI (Dùng tọa độ màn hình - Bất chấp CSS)
        
        // Lấy vị trí hình học của dòng hát và khung chứa
        const lineRect = currentLine.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Tính khoảng cách từ đỉnh dòng hát đến đỉnh khung chứa
        const relativeOffset = lineRect.top - containerRect.top;

        // Tính toán vị trí cần cuộn tới:
        // Scroll hiện tại + Khoảng cách lệch - (Một nửa chiều cao khung) + (Một nửa chiều cao dòng)
        const targetScrollTop = container.scrollTop + relativeOffset - (container.clientHeight / 2) + (currentLine.clientHeight / 2);

        // 4. Thực hiện cuộn
        container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }
}

window.DiscordPresence = DiscordPresence;