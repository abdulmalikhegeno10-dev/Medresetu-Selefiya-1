<!DOCTYPE html>
<html lang="am">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚪 የወንድ/ሴት ክፍል - መድረሰቱ ሰለፊያ</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .gender-selection {
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
        }

        .selection-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .selection-header h1 {
            font-size: 32px;
            color: #d4af37;
            margin-bottom: 10px;
        }

        .privacy-notice {
            background: rgba(72, 187, 120, 0.1);
            border: 2px solid #48bb78;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .privacy-notice h3 {
            color: #48bb78;
            margin-bottom: 10px;
        }

        .gender-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }

        .gender-card {
            background: linear-gradient(135deg, rgba(45,95,63,0.2), rgba(26,74,42,0.2));
            border: 3px solid var(--primary);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }

        .gender-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
            border-color: var(--accent);
        }

        .gender-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }

        .gender-title {
            font-size: 28px;
            font-weight: bold;
            color: var(--accent);
            margin-bottom: 10px;
        }

        .participant-count {
            font-size: 18px;
            color: #888;
        }

        /* Dual Rooms View (Teacher) */
        .dual-rooms {
            display: none;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
        }

        .dual-rooms.active {
            display: grid;
        }

        .room-panel {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 20px;
            border: 2px solid var(--primary);
        }

        .room-header {
            background: linear-gradient(135deg, var(--primary), #1a4a2a);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            text-align: center;
        }

        .room-title {
            font-size: 24px;
            font-weight: bold;
            color: var(--accent);
            margin-bottom: 10px;
        }

        .room-stats {
            display: flex;
            justify-content: space-around;
            color: #888;
            font-size: 14px;
        }

        .video-area {
            background: #000;
            border-radius: 15px;
            height: 300px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
        }

        .participants-list {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 15px;
        }

        .participant {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            margin-bottom: 8px;
        }

        .participant-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .chat-area {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 15px;
            height: 200px;
            overflow-y: auto;
            margin-bottom: 15px;
        }

        .chat-input {
            display: flex;
            gap: 10px;
        }

        .chat-input input {
            flex: 1;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            border: 2px solid var(--primary);
            border-radius: 10px;
            color: white;
        }

        .chat-input button {
            padding: 12px 24px;
            background: var(--primary);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            cursor: pointer;
        }

        .room-controls {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .control-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .control-btn:hover {
            background: var(--primary);
        }

        /* Error Page */
        .error-page {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--bg);
            z-index: 9999;
            justify-content: center;
            align-items: center;
        }

        .error-page.active {
            display: flex;
        }

        .error-content {
            background: var(--card-bg);
            padding: 50px;
            border-radius: 20px;
            border: 2px solid #e53e3e;
            text-align: center;
            max-width: 600px;
        }

        .error-content h2 {
            color: #e53e3e;
            margin-bottom: 20px;
            font-size: 32px;
        }

        .error-content p {
            color: white;
            margin-bottom: 15px;
            line-height: 1.8;
        }

        .error-steps {
            text-align: left;
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }

        .error-steps ol {
            color: white;
            margin-left: 20px;
        }

        .error-steps li {
            margin-bottom: 10px;
        }

        @media (max-width: 768px) {
            .dual-rooms {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Error Page -->
    <div class="error-page" id="errorPage">
        <div class="error-content">
            <h2>⚠️ Stream ID የለም!</h2>
            <p>የዚህን ገጽ ለመክፈት መምህር መጀመሪያ Live መጀመር አለበት።</p>
            
            <div class="error-steps">
                <h3 style="color: #d4af37; margin-bottom: 15px;">የትክክለኛው መንገድ:</h3>
                <ol>
                    <li>teacher-advanced.html ክፈት</li>
                    <li>የመምህር መረጃ አስገባ</li>
                    <li>"Live መጀመር" ጫን</li>
                    <li>"የተለየ ክፍል ክፈት" button ጫን</li>
                    <li>ወደዚህ ገጽ በራስ-ሰር ይገባሉ ✅</li>
                </ol>
            </div>

            <p style="color: #888; font-size: 14px; margin-bottom: 30px;">
                ወይም በindex.html ላይ "🧪 Test Gender Rooms" button ይጠቀሙ
            </p>

            <button onclick="location.href='index.html'" style="
                padding: 15px 40px;
                background: linear-gradient(135deg, #2d5f3f, #1a4a2a);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
            ">
                ⬅️ ወደ ዋና ገጽ ተመለስ
            </button>
        </div>
    </div>

    <!-- Gender Selection (Student View) -->
    <div class="gender-selection" id="genderSelection">
        <div class="selection-header">
            <h1>🚪 የክፍል ምርጫ</h1>
            <p>እባክዎ ወደሚፈልጉት ክፍል ይግቡ</p>
        </div>

        <div class="privacy-notice">
            <h3>🔒 ግላዊነት ማስታወቂያ</h3>
            <p>
                በእስልምና ትምህርት፣ የወንድና የሴት ተማሪዎች በተለየ ክፍል ውስጥ ይማራሉ።
                እያንዳንዱ ክፍል የራሱ የሆነ chat እና participants አሉት።
            </p>
        </div>

        <div class="gender-options">
            <div class="gender-card" onclick="joinRoom('male')">
                <div class="gender-icon">👨</div>
                <div class="gender-title">የወንዶች ክፍል</div>
                <div class="participant-count">
                    <span id="maleCount">0 ተማሪዎች</span>
                </div>
            </div>

            <div class="gender-card" onclick="joinRoom('female')">
                <div class="gender-icon">👩</div>
                <div class="gender-title">የሴቶች ክፍል</div>
                <div class="participant-count">
                    <span id="femaleCount">0 ተማሪዎች</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Dual Rooms View (Teacher) -->
    <div class="dual-rooms" id="dualRooms">
        <!-- Male Room -->
        <div class="room-panel">
            <div class="room-header">
                <div class="room-title">👨 የወንዶች ክፍል</div>
                <div class="room-stats">
                    <div>👥 <span id="maleViewers">0</span> viewers</div>
                    <div>✋ <span id="maleHands">0</span> hands</div>
                    <div>💬 <span id="maleMessages">0</span> messages</div>
                </div>
            </div>

            <div class="video-area">
                Teacher Video (Male Room)
            </div>

            <h4 style="color: var(--accent); margin-bottom: 10px;">Participants:</h4>
            <div class="participants-list" id="maleParticipants">
                <div style="text-align: center; color: #888; padding: 20px;">
                    No participants yet
                </div>
            </div>

            <h4 style="color: var(--accent); margin-bottom: 10px;">Chat:</h4>
            <div class="chat-area" id="maleChatMessages"></div>
            <div class="chat-input">
                <input type="text" id="maleInput" placeholder="መልእክት ወደ ወንዶች ክፍል..." onkeypress="if(event.key==='Enter') sendToMale()">
                <button onclick="sendToMale()">Send</button>
            </div>

            <div class="room-controls">
                <button class="control-btn" onclick="muteAllMale()">🔇 Mute All</button>
                <button class="control-btn" onclick="clearMaleChat()">🗑️ Clear Chat</button>
            </div>
        </div>

        <!-- Female Room -->
        <div class="room-panel">
            <div class="room-header">
                <div class="room-title">👩 የሴቶች ክፍል</div>
                <div class="room-stats">
                    <div>👥 <span id="femaleViewers">0</span> viewers</div>
                    <div>✋ <span id="femaleHands">0</span> hands</div>
                    <div>💬 <span id="femaleMessages">0</span> messages</div>
                </div>
            </div>

            <div class="video-area">
                Teacher Video (Female Room)
            </div>

            <h4 style="color: var(--accent); margin-bottom: 10px;">Participants:</h4>
            <div class="participants-list" id="femaleParticipants">
                <div style="text-align: center; color: #888; padding: 20px;">
                    No participants yet
                </div>
            </div>

            <h4 style="color: var(--accent); margin-bottom: 10px;">Chat:</h4>
            <div class="chat-area" id="femaleChatMessages"></div>
            <div class="chat-input">
                <input type="text" id="femaleInput" placeholder="መልእክት ወደ ሴቶች ክፍል..." onkeypress="if(event.key==='Enter') sendToFemale()">
                <button onclick="sendToFemale()">Send</button>
            </div>

            <div class="room-controls">
                <button class="control-btn" onclick="muteAllFemale()">🔇 Mute All</button>
                <button class="control-btn" onclick="clearFemaleChat()">🗑️ Clear Chat</button>
            </div>
        </div>
    </div>

    <script type="module" src="firebase-config.js"></script>
    <script type="module">
        // Get stream ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const streamId = urlParams.get('stream');
        
        let currentUser = null;
        let userRole = 'student';
        let maleParticipants = [];
        let femaleParticipants = [];

        // Wait for Firebase
        setTimeout(init, 1000);

        function init() {
            console.log('🚀 Initializing gender rooms...');
            console.log('Stream ID from URL:', streamId);

            // Check if streamId exists
            if (!streamId) {
                console.error('❌ No stream ID in URL');
                console.log('ℹ️ Expected URL format: gender-rooms.html?stream=STREAM_ID');
                
                // Show error page
                document.getElementById('errorPage').classList.add('active');
                return;
            }

            console.log('✅ Stream ID found:', streamId);

            window.onAuthStateChanged(window.auth, function(user) {
                if (user) {
                    currentUser = user;
                    console.log('👤 User logged in:', user.uid);
                    checkUserRole();
                } else {
                    console.log('⚠️ No user logged in');
                }
            });
        }

        async function checkUserRole() {
            try {
                const streamRef = window.doc(window.db, 'streams', streamId);
                const streamDoc = await window.getDoc(streamRef);
                
                if (streamDoc.exists()) {
                    const streamData = streamDoc.data();
                    userRole = streamData.teacherId === currentUser.uid ? 'teacher' : 'student';
                    
                    console.log('👤 User role:', userRole);
                    
                    if (userRole === 'teacher') {
                        showTeacherView();
                    } else {
                        showStudentView();
                    }
                    
                    listenToRooms();
                } else {
                    console.error('❌ Stream not found in Firestore');
                    alert('⚠️ Stream አልተገኘም! Stream ID: ' + streamId);
                }
            } catch (error) {
                console.error('❌ Error checking user role:', error);
                alert('ስህተት: ' + error.message);
            }
        }

        function showTeacherView() {
            const selection = document.getElementById('genderSelection');
            const dual = document.getElementById('dualRooms');
            
            if (selection) selection.style.display = 'none';
            if (dual) dual.classList.add('active');
            
            console.log('✅ Teacher view activated');
        }

        function showStudentView() {
            const selection = document.getElementById('genderSelection');
            const dual = document.getElementById('dualRooms');
            
            if (selection) selection.style.display = 'block';
            if (dual) dual.classList.remove('active');
            
            console.log('✅ Student view activated');
        }

        async function joinRoom(gender) {
            try {
                if (!currentUser) {
                    alert('⚠️ እባክዎ ይጠብቁ...');
                    return;
                }

                console.log('🚪 Joining', gender, 'room');

                const viewerRef = window.doc(window.db, 'gender-rooms', streamId + '_' + currentUser.uid);
                await window.setDoc(viewerRef, {
                    streamId: streamId,
                    userId: currentUser.uid,
                    userName: 'ተማሪ ' + currentUser.uid.substring(0, 4),
                    gender: gender,
                    joinedAt: window.serverTimestamp()
                });

                // Redirect to stream with room parameter
                window.location.href = 'stream.html?id=' + streamId + '&room=' + gender;

            } catch (error) {
                console.error('❌ Error joining room:', error);
                alert('ስህተት: ' + error.message);
            }
        }

        function listenToRooms() {
            try {
                const roomsRef = window.collection(window.db, 'gender-rooms');
                const q = window.query(roomsRef, window.where('streamId', '==', streamId));

                window.onSnapshot(q, function(snapshot) {
                    maleParticipants = [];
                    femaleParticipants = [];

                    snapshot.forEach(function(doc) {
                        const participant = doc.data();
                        if (participant.gender === 'male') {
                            maleParticipants.push(participant);
                        } else {
                            femaleParticipants.push(participant);
                        }
                    });

                    console.log('📊 Male:', maleParticipants.length, 'Female:', femaleParticipants.length);

                    updateRoomStats();
                    displayParticipants();
                });

                listenToChat('male');
                listenToChat('female');
            } catch (error) {
                console.error('❌ Error listening to rooms:', error);
            }
        }

        function updateRoomStats() {
            const maleCount = document.getElementById('maleCount');
            const femaleCount = document.getElementById('femaleCount');
            const maleViewers = document.getElementById('maleViewers');
            const femaleViewers = document.getElementById('femaleViewers');

            if (maleCount) maleCount.textContent = maleParticipants.length + ' ተማሪዎች';
            if (femaleCount) femaleCount.textContent = femaleParticipants.length + ' ተማሪዎች';
            if (maleViewers) maleViewers.textContent = maleParticipants.length;
            if (femaleViewers) femaleViewers.textContent = femaleParticipants.length;
        }

        function displayParticipants() {
            const maleList = document.getElementById('maleParticipants');
            const femaleList = document.getElementById('femaleParticipants');

            if (maleList) {
                if (maleParticipants.length === 0) {
                    maleList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No participants yet</div>';
                } else {
                    maleList.innerHTML = maleParticipants.map(p => `
                        <div class="participant">
                            <div class="participant-avatar">👨</div>
                            <div class="participant-info">
                                <div class="participant-name">${p.userName}</div>
                                <div class="participant-status">በማዳመጥ ላይ</div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            if (femaleList) {
                if (femaleParticipants.length === 0) {
                    femaleList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No participants yet</div>';
                } else {
                    femaleList.innerHTML = femaleParticipants.map(p => `
                        <div class="participant">
                            <div class="participant-avatar">👩</div>
                            <div class="participant-info">
                                <div class="participant-name">${p.userName}</div>
                                <div class="participant-status">በማዳመጥ ላይ</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        function listenToChat(gender) {
            try {
                const messagesRef = window.collection(window.db, 'gender-chat', streamId, gender);
                const q = window.query(messagesRef, window.orderBy('timestamp', 'asc'));

                window.onSnapshot(q, function(snapshot) {
                    const chatDiv = document.getElementById(gender + 'ChatMessages');
                    if (!chatDiv) return;

                    snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'added') {
                            const msg = change.doc.data();
                            const msgEl = document.createElement('div');
                            msgEl.style.cssText = 'padding: 8px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border-radius: 8px;';
                            msgEl.innerHTML = `
                                <div style="color: #d4af37; font-size: 12px; font-weight: bold;">${msg.userName}</div>
                                <div style="color: white; font-size: 14px;">${msg.message}</div>
                            `;
                            chatDiv.appendChild(msgEl);
                            chatDiv.scrollTop = chatDiv.scrollHeight;
                        }
                    });

                    const count = snapshot.size;
                    const countEl = document.getElementById(gender + 'Messages');
                    if (countEl) countEl.textContent = count;
                });
            } catch (error) {
                console.error('❌ Error listening to chat:', error);
            }
        }

        async function sendToMale() {
            const input = document.getElementById('maleInput');
            const message = input ? input.value.trim() : '';
            if (!message) return;

            try {
                await window.addDoc(window.collection(window.db, 'gender-chat', streamId, 'male'), {
                    userName: 'መምህር',
                    message: message,
                    timestamp: window.serverTimestamp()
                });
                if (input) input.value = '';
            } catch (error) {
                console.error('Error:', error);
            }
        }

        async function sendToFemale() {
            const input = document.getElementById('femaleInput');
            const message = input ? input.value.trim() : '';
            if (!message) return;

            try {
                await window.addDoc(window.collection(window.db, 'gender-chat', streamId, 'female'), {
                    userName: 'መምህር',
                    message: message,
                    timestamp: window.serverTimestamp()
                });
                if (input) input.value = '';
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function muteAllMale() {
            if (confirm('የወንዶች ክፍል ውስጥ ያሉትን ሁሉ mute ማድረግ ይፈልጋሉ?')) {
                alert('Mute feature በቅርቡ ይጨመራል!');
            }
        }

        function muteAllFemale() {
            if (confirm('የሴቶች ክፍል ውስጥ ያሉትን ሁሉ mute ማድረግ ይፈልጋሉ?')) {
                alert('Mute feature በቅርቡ ይጨመራል!');
            }
        }

        async function clearMaleChat() {
            if (confirm('የወንዶች chat ሙሉ በሙሉ መሰረዝ ይፈልጋሉ?')) {
                try {
                    const messagesRef = window.collection(window.db, 'gender-chat', streamId, 'male');
                    const snapshot = await window.getDocs(messagesRef);
                    snapshot.forEach(async function(doc) {
                        await window.deleteDoc(doc.ref);
                    });
                    alert('✅ Male chat cleared!');
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }

        async function clearFemaleChat() {
            if (confirm('የሴቶች chat ሙሉ በሙሉ መሰረዝ ይፈልጋሉ?')) {
                try {
                    const messagesRef = window.collection(window.db, 'gender-chat', streamId, 'female');
                    const snapshot = await window.getDocs(messagesRef);
                    snapshot.forEach(async function(doc) {
                        await window.deleteDoc(doc.ref);
                    });
                    alert('✅ Female chat cleared!');
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }

        // Global functions
        window.joinRoom = joinRoom;
        window.sendToMale = sendToMale;
        window.sendToFemale = sendToFemale;
        window.muteAllMale = muteAllMale;
        window.muteAllFemale = muteAllFemale;
        window.clearMaleChat = clearMaleChat;
        window.clearFemaleChat = clearFemaleChat;

        console.log('✅ Gender rooms script loaded');
    </script>
</body>
</html>
