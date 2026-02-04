// Get stream ID from URL
const urlParams = new URLSearchParams(window.location.search);
const streamId = urlParams.get('id');

let currentUser = null;
let streamData = null;

// Wait for Firebase
setTimeout(initStream, 1000);

function initStream() {
    if (!streamId) {
        alert('Stream ID not found!');
        location.href = 'index.html';
        return;
    }

    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            loadStreamData();
            listenToChat();
            listenToViewers();
            addViewer();
        }
    });

    // Chat input enter key
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Load stream data
async function loadStreamData() {
    try {
        const streamRef = window.doc(window.db, 'streams', streamId);
        const streamDoc = await window.getDoc(streamRef);
        
        if (streamDoc.exists()) {
            streamData = streamDoc.data();
            document.getElementById('streamTitle').textContent = streamData.title;
            document.getElementById('streamTeacher').textContent = '👤 ' + streamData.teacherName;
            
            // Hide loading
            document.getElementById('loadingScreen').style.display = 'none';
            
            // Start WebRTC connection (simplified for now)
            initializeVideo();
        } else {
            alert('Stream not found!');
            location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading stream:', error);
    }
}

// Initialize video (placeholder - real WebRTC would go here)
function initializeVideo() {
    const video = document.getElementById('remoteVideo');
    
    // For now, show placeholder
    // In real app, you'd use WebRTC peer connection here
    video.style.background = 'linear-gradient(135deg, #2d5f3f 0%, #8b7355 100%)';
    
    // Add text overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 24px;
        text-align: center;
    `;
    overlay.innerHTML = '🎥<br>Video Streaming<br><small style="font-size: 14px;">WebRTC connection would go here</small>';
    document.querySelector('.video-section').appendChild(overlay);
}

// Add viewer
async function addViewer() {
    try {
        const viewerRef = window.doc(window.db, 'viewers', `${streamId}_${currentUser.uid}`);
        await window.setDoc(viewerRef, {
            streamId: streamId,
            userId: currentUser.uid,
            joinedAt: window.serverTimestamp()
        });

        // Update viewer count in stream
        const streamRef = window.doc(window.db, 'streams', streamId);
        await window.updateDoc(streamRef, {
            viewers: window.increment(1)
        });
    } catch (error) {
        console.error('Error adding viewer:', error);
    }
}

// Listen to viewer count
function listenToViewers() {
    const streamRef = window.doc(window.db, 'streams', streamId);
    window.onSnapshot(streamRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            document.getElementById('viewerCount').textContent = `👥 ${data.viewers || 0}`;
        }
    });
}

// Listen to chat messages
function listenToChat() {
    const messagesRef = window.collection(window.db, 'streams', streamId, 'messages');
    const q = window.query(messagesRef, window.orderBy('timestamp', 'asc'));

    window.onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const msg = change.doc.data();
                addMessageToChat(msg);
            }
        });
    });
}

// Add message to chat UI
function addMessageToChat(msg) {
    const chatDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.innerHTML = `
        <div class="message-user">${msg.userName || 'Anonymous'}</div>
        <div class="message-text">${msg.message}</div>
    `;
    chatDiv.appendChild(messageEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Send message
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    try {
        const messagesRef = window.collection(window.db, 'streams', streamId, 'messages');
        await window.addDoc(messagesRef, {
            userId: currentUser.uid,
            userName: 'ተማሪ ' + currentUser.uid.substring(0, 4),
            message: message,
            timestamp: window.serverTimestamp()
        });

        input.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Send reaction
function sendReaction(emoji) {
    const reaction = document.createElement('div');
    reaction.className = 'floating-reaction';
    reaction.textContent = emoji;
    reaction.style.left = Math.random() * 80 + 10 + '%';
    reaction.style.bottom = '50%';
    document.body.appendChild(reaction);

    setTimeout(() => reaction.remove(), 3000);
}

// Remove viewer on page unload
window.addEventListener('beforeunload', async () => {
    try {
        const viewerRef = window.doc(window.db, 'viewers', `${streamId}_${currentUser.uid}`);
        await window.deleteDoc(viewerRef);

        const streamRef = window.doc(window.db, 'streams', streamId);
        await window.updateDoc(streamRef, {
            viewers: window.increment(-1)
        });
    } catch (error) {
        console.error('Error removing viewer:', error);
    }
});

// በstream.js ውስጥ addViewer() function አረጋግጥ:

async function addViewer() {
    try {
        const viewerRef = window.doc(window.db, 'viewers', `${streamId}_${currentUser.uid}`);
        await window.setDoc(viewerRef, {
            streamId: streamId,
            userId: currentUser.uid,
            userName: 'ተማሪ ' + currentUser.uid.substring(0, 4),
            joinedAt: window.serverTimestamp()
        });

        const streamRef = window.doc(window.db, 'streams', streamId);
        await window.updateDoc(streamRef, {
            viewers: window.increment(1)
        });
        
        console.log('✅ Viewer added!'); // Add this for debugging
    } catch (error) {
        console.error('❌ Error adding viewer:', error);
    }
}

// When new message arrives
function addMessageToChat(msg) {
    const chatDiv = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `
        <div class="chat-user">${msg.userName}</div>
        <div class="chat-text">${msg.message}</div>
    `;
    chatDiv.appendChild(messageEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    // Play sound notification
    if (window.notificationManager) {
        window.notificationManager.playSound('message');
    }
}