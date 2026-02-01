// Moderation System
let currentStreamId = null;
let currentUser = null;
let localStream = null;
let students = [];
let questions = [];
let moderationSettings = {
    chatEnabled: true,
    questionsOnly: false,
    allMuted: false
};

setTimeout(initModerationSystem, 1000);

function initModerationSystem() {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            currentUser = user;
            startTeacherStream();
        }
    });
}

async function startTeacherStream() {
    try {
        // Get camera and mic
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        document.getElementById('teacherVideo').srcObject = localStream;

        // Create stream in Firestore
        const streamData = {
            teacherId: currentUser.uid,
            teacherName: 'መምህር አህመድ',
            title: 'የሱራ አል-ባቃራህ ትርጉም',
            category: 'quran',
            isLive: true,
            viewers: 0,
            createdAt: window.serverTimestamp(),
            moderation: moderationSettings
        };

        const docRef = await window.addDoc(
            window.collection(window.db, 'streams'),
            streamData
        );

        currentStreamId = docRef.id;
        console.log('✅ Stream created:', currentStreamId);

        listenToStudents();
        listenToQuestions();
        startDurationCounter();

    } catch (error) {
        console.error('Error:', error);
        alert('Camera/Mic access failed!');
    }
}

// Listen to students
function listenToStudents() {
    const viewersRef = window.collection(window.db, 'viewers');
    const q = window.query(viewersRef, window.where('streamId', '==', currentStreamId));

    window.onSnapshot(q, (snapshot) => {
        students = [];
        let handsRaised = 0;

        snapshot.forEach((doc) => {
            const student = { id: doc.id, ...doc.data() };
            students.push(student);
            if (student.handRaised) handsRaised++;
        });

        document.getElementById('viewerCount').textContent = students.length;
        document.getElementById('handsRaised').textContent = handsRaised;
        
        displayStudents();
    });
}

// Display students
function displayStudents() {
    const list = document.getElementById('studentsList');
    list.innerHTML = '';

    students.forEach(student => {
        const item = document.createElement('div');
        item.className = 'student-item';
        item.innerHTML = `
            <div class="student-avatar">👤</div>
            <div class="student-info">
                <div class="student-name">${student.userName}</div>
                <div class="student-status">
                    ${student.isMuted ? '🔇 Muted' : '🎤 Active'}
                </div>
            </div>
            ${student.handRaised ? '<div class="hand-raised">✋</div>' : ''}
            <div class="student-actions">
                <button class="action-btn" onclick="muteStudent('${student.id}')" title="Mute">
                    ${student.isMuted ? '🔊' : '🔇'}
                </button>
                <button class="action-btn danger" onclick="removeStudent('${student.id}')" title="Remove">
                    🚫
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Listen to questions
function listenToQuestions() {
    const questionsRef = window.collection(window.db, 'questions');
    const q = window.query(
        questionsRef,
        window.where('streamId', '==', currentStreamId),
        window.where('status', '==', 'pending')
    );

    window.onSnapshot(q, (snapshot) => {
        questions = [];
        snapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });
        displayQuestions();
    });
}

// Display questions
function displayQuestions() {
    const list = document.getElementById('questionsList');
    list.innerHTML = '';

    if (questions.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">ምንም ጥያቄ የለም</div>';
        return;
    }

    questions.forEach(question => {
        const item = document.createElement('div');
        item.className = 'question-item';
        item.innerHTML = `
            <div class="question-header">
                <span class="question-user">${question.userName}</span>
                <span class="question-time">${getTimeAgo(question.timestamp)}</span>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="question-actions">
                <button class="question-btn approve" onclick="approveQuestion('${question.id}')">
                    ✓ Approve
                </button>
                <button class="question-btn reject" onclick="rejectQuestion('${question.id}')">
                    ✕ Reject
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Moderation Actions
async function muteStudent(studentId) {
    const studentRef = window.doc(window.db, 'viewers', studentId);
    const student = students.find(s => s.id === studentId);
    
    await window.updateDoc(studentRef, {
        isMuted: !student.isMuted
    });
}

async function removeStudent(studentId) {
    showConfirmModal(
        'ተማሪ አስወግድ',
        'ይህን ተማሪ ከትምህርት ማስወገድ ይፈልጋሉ?',
        async () => {
            await window.deleteDoc(window.doc(window.db, 'viewers', studentId));
            closeModal();
        }
    );
}

async function muteAll() {
    showConfirmModal(
        'Mute All',
        'ሁሉንም ተማሪዎች mute ማድረግ ይፈልጋሉ?',
        async () => {
            for (let student of students) {
                await window.updateDoc(window.doc(window.db, 'viewers', student.id), {
                    isMuted: true
                });
            }
            closeModal();
        }
    );
}

async function clearChat() {
    showConfirmModal(
        'Clear Chat',
        'Chat history ሙሉ በሙሉ መሰረዝ ይፈልጋሉ?',
        async () => {
            const messagesRef = window.collection(window.db, 'streams', currentStreamId, 'messages');
            const snapshot = await window.getDocs(messagesRef);
            
            snapshot.forEach(async (doc) => {
                await window.deleteDoc(doc.ref);
            });
            
            closeModal();
        }
    );
}

async function toggleChat() {
    const enabled = document.getElementById('chatToggle').checked;
    moderationSettings.chatEnabled = enabled;
    
    await window.updateDoc(window.doc(window.db, 'streams', currentStreamId), {
        'moderation.chatEnabled': enabled
    });
}

async function toggleQuestionsOnly() {
    const enabled = document.getElementById('questionsOnlyToggle').checked;
    moderationSettings.questionsOnly = enabled;
    
    await window.updateDoc(window.doc(window.db, 'streams', currentStreamId), {
        'moderation.questionsOnly': enabled
    });
}

async function approveQuestion(questionId) {
    await window.updateDoc(window.doc(window.db, 'questions', questionId), {
        status: 'approved'
    });
    
    // Add to chat
    const question = questions.find(q => q.id === questionId);
    await window.addDoc(window.collection(window.db, 'streams', currentStreamId, 'messages'), {
        userId: question.userId,
        userName: question.userName,
        message: '✋ ጥያቄ: ' + question.text,
        timestamp: window.serverTimestamp(),
        isQuestion: true
    });
}

async function rejectQuestion(questionId) {
    await window.updateDoc(window.doc(window.db, 'questions', questionId), {
        status: 'rejected'
    });
}

// UI Functions
function toggleVideo() {
    const enabled = document.getElementById('videoToggle').checked;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = enabled;
    }
    
    document.getElementById('teacherVideo').style.display = enabled ? 'block' : 'none';
    document.getElementById('audioMode').style.display = enabled ? 'none' : 'flex';
}

function toggleAudio() {
    const enabled = document.getElementById('audioToggle').checked;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = enabled;
    }
}

function toggleVideoUI() {
    document.getElementById('videoToggle').click();
}

function toggleAudioUI() {
    document.getElementById('audioToggle').click();
}

function shareScreen() {
    alert('Screen sharing በቅርቡ ይጨመራል!');
}

function openWhiteboard() {
    window.open('whiteboard.html?stream=' + currentStreamId, '_blank');
}

function openGenderRooms() {
    window.open('gender-rooms.html?stream=' + currentStreamId, '_blank');
}

function viewMaleRoom() {
    alert('የወንዶች ክፍል በቅርቡ!');
}

function viewFemaleRoom() {
    alert('የሴቶች ክፍል በቅርቡ!');
}

function createPoll() {
    window.open('polls.html?stream=' + currentStreamId, '_blank');
}

function createQuiz() {
    alert('Quiz feature በቅርቡ!');
}

function openSettings() {
    alert('Settings በቅርቡ!');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('studentsTab').style.display = tab === 'students' ? 'block' : 'none';
    document.getElementById('questionsTab').style.display = tab === 'questions' ? 'block' : 'none';
}

async function endStream() {
    showConfirmModal(
        'ትምህርት አብቃ',
        'ትምህርቱን ማብቃት እና stream መዝጋት ይፈልጋሉ?',
        async () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            
            await window.updateDoc(window.doc(window.db, 'streams', currentStreamId), {
                isLive: false,
                endTime: new Date().toISOString()
            });
            
            alert('✅ ትምህርቱ ተጠናቋል!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    );
}

// Modal Functions
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmBtn').onclick = onConfirm;
    document.getElementById('confirmModal').classList.add('active');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// Duration Counter
let startTime = Date.now();
function startDurationCounter() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('duration').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'አሁን';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'አሁን';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' ደቂቃ በፊት';
    return Math.floor(seconds / 3600) + ' ሰዓት በፊት';
}

// Global functions
window.toggleVideo = toggleVideo;
window.toggleAudio = toggleAudio;
window.toggleVideoUI = toggleVideoUI;
window.toggleAudioUI = toggleAudioUI;
window.shareScreen = shareScreen;
window.openWhiteboard = openWhiteboard;
window.openGenderRooms = openGenderRooms;
window.viewMaleRoom = viewMaleRoom;
window.viewFemaleRoom = viewFemaleRoom;
window.createPoll = createPoll;
window.createQuiz = createQuiz;
window.openSettings = openSettings;
window.muteStudent = muteStudent;
window.removeStudent = removeStudent;
window.muteAll = muteAll;
window.clearChat = clearChat;
window.toggleChat = toggleChat;
window.toggleQuestionsOnly = toggleQuestionsOnly;
window.approveQuestion = approveQuestion;
window.rejectQuestion = rejectQuestion;
window.switchTab = switchTab;
window.endStream = endStream;
window.closeModal = closeModal;