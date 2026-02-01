// Wait for Firebase to load
setTimeout(initializeApp, 1000);

let currentUser = null;
let allStreams = [];
let currentCategory = 'all';

function initializeApp() {
    // Check auth state
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            console.log('User logged in:', user.uid);
            loadStreams();
            startPrayerTimes();
        }
    });

    // Category filters
    document.querySelectorAll('.category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            filterStreams();
        });
    });
}

// Load Live Streams from Firestore
function loadStreams() {
    const streamsRef = window.collection(window.db, 'streams');
    const q = window.query(streamsRef, window.orderBy('createdAt', 'desc'));

    window.onSnapshot(q, (snapshot) => {
        allStreams = [];
        snapshot.forEach((doc) => {
            allStreams.push({ id: doc.id, ...doc.data() });
        });
        filterStreams();
    });
}

function filterStreams() {
    const liveStreams = allStreams.filter(s => 
        s.isLive && (currentCategory === 'all' || s.category === currentCategory)
    );
    
    const upcomingStreams = allStreams.filter(s => 
        !s.isLive && (currentCategory === 'all' || s.category === currentCategory)
    );

    displayStreams('liveStreams', liveStreams);
    displayStreams('upcomingStreams', upcomingStreams);
}

function displayStreams(containerId, streams) {
    const container = document.getElementById(containerId);
    
    if (streams.length === 0) {
        container.innerHTML = '<div class="loading">ምንም ትምህርት የለም 😔</div>';
        return;
    }

    container.innerHTML = streams.map(stream => `
        <div class="stream-card" onclick="joinStream('${stream.id}')">
            <div class="stream-thumbnail">
                ${getCategoryEmoji(stream.category)}
                ${stream.isLive ? `
                    <div class="live-badge">
                        <span class="pulse-dot"></span>
                        LIVE
                    </div>
                    <div class="viewers-count">👥 ${stream.viewers || 0}</div>
                ` : ''}
            </div>
            <div class="stream-info">
                <div class="stream-title">${stream.title}</div>
                <div class="stream-teacher">👤 ${stream.teacherName}</div>
                <div class="stream-meta">
                    <span class="category-badge">${getCategoryName(stream.category)}</span>
                    <span>${formatTime(stream.createdAt)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryEmoji(category) {
    const emojis = {
        quran: '📖',
        hadith: '📚',
        fiqh: '⚖️',
        seerah: '👤',
        all: '🌟'
    };
    return emojis[category] || '🕌';
}

function getCategoryName(category) {
    const names = {
        quran: 'ቁርአን',
        hadith: 'ሃዲስ',
        fiqh: 'ፍቅህ',
        seerah: 'ሴራህ'
    };
    return names[category] || category;
}

function formatTime(timestamp) {
    if (!timestamp) return 'አሁን';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return 'አሁን';
    if (diff < 60) return `${diff} ደቂቃ በፊት`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ሰዓት በፊት`;
    return `${Math.floor(diff / 1440)} ቀን በፊት`;
}

function joinStream(streamId) {
    location.href = `stream.html?id=${streamId}`;
}

// Prayer Times (using local calculation)
function startPrayerTimes() {
    updatePrayerTime();
    setInterval(updatePrayerTime, 60000); // Update every minute
}

function updatePrayerTime() {
    const now = new Date();
    const prayers = [
        { name: 'ፋጅር', hour: 5, minute: 30 },
        { name: 'ድህር', hour: 12, minute: 30 },
        { name: 'አስር', hour: 15, minute: 45 },
        { name: 'መግረብ', hour: 18, minute: 15 },
        { name: 'ዕሻ', hour: 19, minute: 45 }
    ];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (let prayer of prayers) {
        const prayerMinutes = prayer.hour * 60 + prayer.minute;
        if (currentMinutes < prayerMinutes) {
            const diff = prayerMinutes - currentMinutes;
            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;
            
            document.getElementById('nextPrayer').textContent = prayer.name;
            document.getElementById('prayerTime').textContent = 
                hours > 0 ? `በ ${hours} ሰዓት ${minutes} ደቂቃ` : `በ ${minutes} ደቂቃ`;
            return;
        }
    }
    
    // If past all prayers, show tomorrow's Fajr
    document.getElementById('nextPrayer').textContent = 'ፋጅር (ነገ)';
    document.getElementById('prayerTime').textContent = 'የነገ 5:30';
}