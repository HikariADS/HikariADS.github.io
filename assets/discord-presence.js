/**
 * Discord Presence using Lanyard WebSocket API
 * Author: Quang (HikariADS)
 * Integrated realtime presence with optional backend proxy
 */

class DiscordPresence {
    constructor(userId = '949681622825975868') {
        this.userId = userId;
        this.wsUrl = 'wss://api.lanyard.rest/socket'; // ✅ Lanyard WS (public, realtime)
        this.proxyUrl = ''; // optional: set to your backend if you use a proxy (Cách 2)
        this.ws = null;
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;

        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            userAvatar: document.getElementById('userAvatar'),
            username: document.getElementById('username'),
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

            if (status === 'connected') {
                setTimeout(() => {
                    this.elements.connectionStatus.style.display = 'none';
                }, 3000);
            }
        }
    }

    connectWebSocket() {
        this.updateConnectionStatus('connecting', 'Connecting to Discord...');

        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to Lanyard WebSocket');
                this.subscribeToUser();
            };

            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onclose = () => this.reconnect();
            this.ws.onerror = (err) => {
                console.error('❌ WS Error:', err);
                this.reconnect();
            };
        } catch (err) {
            console.error('❌ Failed to connect WebSocket:', err);
            this.reconnect();
        }
    }

    subscribeToUser() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const subscribePayload = {
            op: 2,
            d: { subscribe_to_id: this.userId }
        };
        this.ws.send(JSON.stringify(subscribePayload));
        console.log(`📡 Subscribed to Lanyard user ${this.userId}`);
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);

            switch (data.op) {
                case 1: // Hello
                    this.startHeartbeat(data.d.heartbeat_interval);
                    break;
                case 0: // Event
                    if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                        this.updatePresence(data.d);
                    }
                    break;
            }
        } catch (err) {
            console.error('❌ JSON error:', err);
        }
    }

    startHeartbeat(interval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 3 }));
            }
        }, interval);
        this.updateConnectionStatus('connected', 'Connected!');
    }

    updatePresence(data) {
        if (!data || !data.discord_user) return;

        const user = data.discord_user;
        const status = data.discord_status;
        const activities = data.activities || [];

        this.updateUserInfo(user);
        this.updateStatus(status);
        this.updateActivities(activities);
    }

    updateUserInfo(user) {
    if (!user) return;

    // ✅ Lấy avatar trực tiếp từ Discord CDN
    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=512`
        : `https://cdn.discordapp.com/embed/avatars/0.png`; // fallback nếu user chưa có ảnh

    if (this.elements.userAvatar) {
        this.elements.userAvatar.src = avatarUrl;
        this.elements.userAvatar.alt = `${user.username}'s Discord Avatar`;
    }

    // Cập nhật tên Discord
    const displayName = user.global_name || user.username || "Unknown";
    if (document.querySelector(".status-text")) {
        document.querySelector(".status-text").textContent = displayName;
    }

    console.log(`🖼 Avatar loaded from Discord CDN: ${avatarUrl}`);
}

    updateStatus(status) {
        const statusMap = {
            online: 'Online 🟢',
            idle: 'Idle 🌙',
            dnd: 'Do Not Disturb 🔴',
            offline: 'Offline ⚫'
        };
        const current = status || 'offline';

        if (this.elements.statusIndicator)
            this.elements.statusIndicator.className = `status-indicator ${current}`;
        if (this.elements.statusText)
            this.elements.statusText.textContent = statusMap[current] || 'Offline';
    }

    updateActivities(activities) {
        if (!this.elements.activitiesContainer) return;
        this.elements.activitiesContainer.innerHTML = '';

        const spotify = activities.find((a) => a.name === 'Spotify');
        if (spotify) {
            const html = `
                <div class="activity spotify">
                    <img src="https://i.scdn.co/image/${spotify.assets.large_image.replace('spotify:', '')}"
                        alt="Spotify Album Art" class="spotify-art">
                    <div class="activity-info">
                        <div class="activity-name">🎵 Listening to Spotify</div>
                        <div class="activity-details"><strong>${spotify.details}</strong></div>
                        <div class="activity-state">by ${spotify.state}</div>
                    </div>
                </div>`;
            this.elements.activitiesContainer.innerHTML = html;
            return;
        }

        if (activities.length === 0) {
            this.elements.activitiesContainer.innerHTML = `<p>No active Discord activities</p>`;
        } else {
            activities.forEach((a) => {
                const html = `
                    <div class="activity">
                        <div class="activity-name">${a.name}</div>
                        <div class="activity-details">${a.details || ''}</div>
                        <div class="activity-state">${a.state || ''}</div>
                    </div>`;
                this.elements.activitiesContainer.innerHTML += html;
            });
        }
    }

    reconnect() {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;

        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, 30000);

        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            console.log(`🔄 Reconnecting in ${delay / 1000}s...`);
            setTimeout(() => this.connectWebSocket(), delay);
        } else {
            this.updateConnectionStatus('disconnected', 'Connection failed');
        }
    }

    cleanup() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
        console.log('🧹 Cleaned up Discord WS');
    }
}

// Initialize automatically
document.addEventListener('DOMContentLoaded', () => {
    new DiscordPresence('949681622825975868');
});

const DISCORD_ID = "949681622825975868"; // 🔹 Thay bằng ID Discord thật của bạn

async function updatePresence() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const { data } = await res.json();

    const card = document.getElementById("activity-card");
    const cover = document.getElementById("cover");
    const platform = document.getElementById("platform");
    const title = document.getElementById("title");
    const artist = document.getElementById("artist");
    const progress = document.getElementById("progress");

    if (!card) return; // tránh lỗi nếu chưa có phần tử trong DOM

    // Nếu đang nghe Spotify
    if (data.listening_to_spotify) {
      platform.textContent = "Listening to Spotify";
      title.textContent = data.spotify.song;
      artist.textContent = `${data.spotify.artist}`;
      cover.src = data.spotify.album_art_url;

      const start = data.spotify.timestamps.start;
      const end = data.spotify.timestamps.end;
      const now = Date.now();
      const percent = ((now - start) / (end - start)) * 100;
      progress.style.width = `${percent}%`;
    }
    // Nếu đang dùng app khác (VD: VSCode)
    else if (data.activities.length > 0) {
      const vscode = data.activities.find(a => a.name === "Visual Studio Code");
      if (vscode) {
        platform.textContent = "Using Visual Studio Code";
        title.textContent = vscode.details || "Editing project";
        artist.textContent = vscode.state || "";
        cover.src = "https://code.visualstudio.com/assets/images/code-stable.png";
        progress.style.width = "100%";
      } else {
        platform.textContent = "Online on Discord";
        title.textContent = "";
        artist.textContent = "";
        cover.src = "https://cdn-icons-png.flaticon.com/512/906/906361.png";
        progress.style.width = "0%";
      }
    } else {
      platform.textContent = "Offline";
      title.textContent = "";
      artist.textContent = "";
      cover.src = "https://cdn-icons-png.flaticon.com/512/906/906361.png";
      progress.style.width = "0%";
    }
  } catch (error) {
    console.error("Lỗi khi tải Discord presence:", error);
  }
}

// cập nhật mỗi 15 giây
updatePresence();
setInterval(updatePresence, 15000);

window.DiscordPresence = DiscordPresence;
