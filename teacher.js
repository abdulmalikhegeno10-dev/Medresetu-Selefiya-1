// Wait for Firebase
let initAttempts = 0;
let currentUser = null;
let localStream = null;
let currentStreamId = null;
let streamStartTime = null;
let durationInterval = null;
let selectedCategory = '';
let streamMode = 'video';
let videoEnabled = true;
let audioEnabled = true;

function waitForFirebase() {
    if (window.auth && window.db) {
        console.log('✅ Firebase ready - Live Only Mode!');
        initTeacherPage();
    } else {
        initAttempts++;
        if (initAttempts < 10) {
            setTimeout(waitForFirebase, 500);
        } else {
            alert('Firebase connection failed!');
        }
    }
}

setTimeout(waitForFirebase, 500);

function initTeacherPage() {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            console.log('👤 Teacher logged in:', user.uid);
        }
    });

    // Mode selection
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.mode-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            streamMode = option.dataset.mode;
            document.getElementById('streamMode').value = streamMode;
        });
    });

    // Category selection
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.category-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            selectedCategory = option.dataset.category;
            document.getElementById('selectedCategory').value = selectedCategory;
        });
    });
}

// Prepare stream
async function prepareStream() {
    const teacherName = document.getElementById('teacherName').value.trim();
    const streamTitle = document.getElementById('streamTitle').value.trim();
    
    if (!teacherName || !streamTitle || !selectedCategory) {
        alert('እባክዎ ሁሉንም የሚያስፈልጉ መረጃዎች ያስገቡ!');
        return;
    }

    try {
        const constraints = {
            video: streamMode === 'video' ? {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } : false,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);

        const previewContainer = document.getElementById('previewContainer');
        const videoElement = document.getElementById('localVideo');
        
        if (streamMode === 'video') {
            videoElement.srcObject = localStream;
            videoElement.style.display = 'block';
        } else {
            videoElement.style.display = 'none';
            showAudioVisualizer(previewContainer);
        }

        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('livePreview').style.display = 'block';

        console.log(`✅ ${streamMode} mode ready!`);
    } catch (error) {
        console.error('Media error:', error);
        alert('ካሜራ/ማይክሮፎን መክፈት አልተቻለም። እባክዎ ፈቃድ ይስጡ።');
    }
}

function showAudioVisualizer(container) {
    const visualizer = document.createElement('div');
    visualizer.className = 'audio-visualizer';
    visualizer.innerHTML = `
        <div class="audio-icon">🎤</div>
        <div style="color: var(--accent); font-size: 20px; font-weight: bold;">
            የድምጽ ትምህርት ሁነታ
        </div>
        <div class="audio-bars">
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
        </div>
        <div style="color: #48bb78; font-size: 14px;">
            ✓ ማይክሮፎን እየሰራ ነው
        </div>
    `;
    container.insertBefore(visualizer, container.firstChild);
}

function toggleVideo() {
    if (streamMode === 'audio') return;
    
    videoEnabled = !videoEnabled;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = videoEnabled;
    }
    
    const btn = document.getElementById('videoToggle');
    btn.classList.toggle('active');
    btn.textContent = videoEnabled ? '📹' : '🚫';
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = audioEnabled;
    }
    
    const btn = document.getElementById('audioToggle');
    btn.classList.toggle('active');
    btn.textContent = audioEnabled ? '🎤' : '🔇';
}

// Go Live - NO RECORDING
async function goLive() {
    const teacherName = document.getElementById('teacherName').value.trim();
    const streamTitle = document.getElementById('streamTitle').value.trim();
    const streamDescription = document.getElementById('streamDescription').value.trim();

    if (!currentUser) {
        alert('እባክዎ ይጠብቁ...');
        return;
    }

    try {
        // Create live stream (metadata only - no recording)
        const streamData = {
            teacherId: currentUser.uid,
            teacherName: teacherName,
            title: streamTitle,
            description: streamDescription,
            category: selectedCategory,
            streamMode: streamMode,
            isLive: true,
            viewers: 0,
            createdAt: window.serverTimestamp(),
            startTime: new Date().toISOString(),
            // NO RECORDING FIELDS!
            recordingUrl: null, // Explicitly null
            hasRecording: false // Flag to show no recording
        };

        const docRef = await window.addDoc(
            window.collection(window.db, 'streams'),
            streamData
        );

        currentStreamId = docRef.id;
        streamStartTime = Date.now();

        console.log('✅ Live stream created (No Recording):', currentStreamId);

        // Switch UI
        document.getElementById('livePreview').style.display = 'none';
        document.getElementById('liveControls').classList.add('active');

        // Setup live view
        const liveContainer = document.getElementById('liveContainer');
        const liveVideo = document.getElementById('liveVideo');
        
        if (streamMode === 'video') {
            liveVideo.srcObject = localStream;
            liveVideo.style.display = 'block';
        } else {
            liveVideo.style.display = 'none';
            showAudioVisualizer(liveContainer);
        }

        startDurationCounter();
        listenToViewers();
        listenToMessages();

        alert('🎉 የቀጥታ ትምህርት ተጀምሯል!');
    } catch (error) {
        console.error('Error:', error);
        alert('ስህተት: ' + error.message);
    }
}

function startDurationCounter() {
    durationInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - streamStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('duration').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function listenToViewers() {
    const streamRef = window.doc(window.db, 'streams', currentStreamId);
    
    window.onSnapshot(streamRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            document.getElementById('viewerCount').textContent = data.viewers || 0;
        }
    });
}

function listenToMessages() {
    const messagesRef = window.collection(window.db, 'streams', currentStreamId, 'messages');
    const q = window.query(messagesRef, window.orderBy('timestamp', 'asc'));

    let messageCount = 0;
    
    window.onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                messageCount++;
                document.getElementById('messageCount').textContent = messageCount;
                
                const msg = change.doc.data();
                console.log('💬 New:', msg.userName, '-', msg.message);
            }
        });
    });
}

// End stream - NO RECORDING TO SAVE
async function endStream() {
    if (!confirm('ትምህርቱን ማብቃት ይፈልጋሉ?\n\n⚠️ ማስታወሻ: ይህ ትምህርት አይቀዳም!')) {
        return;
    }

    try {
        // Stop all media tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // Update stream - mark as ended (no recording)
        const streamRef = window.doc(window.db, 'streams', currentStreamId);
        await window.updateDoc(streamRef, {
            isLive: false,
            endTime: new Date().toISOString(),
            hasRecording: false // Confirm no recording
        });

        if (durationInterval) {
            clearInterval(durationInterval);
        }

        alert('✅ ትምህርቱ ተጠናቋል!\n\n💡 ማስታወሻ: Recording የለም - ትምህርቱ Live ላይ ብቻ ነበር።');
        
        setTimeout(() => {
            location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        alert('ስህተት: ' + error.message);
    }
}

// Cleanup
window.addEventListener('beforeunload', async () => {
    if (currentStreamId && localStream) {
        localStream.getTracks().forEach(track => track.stop());
        
        const streamRef = window.doc(window.db, 'streams', currentStreamId);
        await window.updateDoc(streamRef, {
            isLive: false,
            endTime: new Date().toISOString()
        });
    }
});

// Global functions
window.prepareStream = prepareStream;
window.toggleVideo = toggleVideo;
window.toggleAudio = toggleAudio;
window.goLive = goLive;
window.endStream = endStream;