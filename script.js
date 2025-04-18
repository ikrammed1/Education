
// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnWNBC23URGPrnmIyLrimx-YMFvkVM030",
  authDomain: "education-551fe.firebaseapp.com",
  projectId: "education-551fe",
  storageBucket: "education-551fe.appspot.com",
  messagingSenderId: "278726806848",
  appId: "1:278726806848:web:f2dbee4ed2fb3903e9fea5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
window.db = db;
window.auth = auth;

// ------------------------------------------- واجهة المستخدم
function showMessage(message, color = "red") {
  const msg = document.createElement("p");
  msg.innerText = message;
  msg.style.color = color;
  msg.style.marginTop = "10px";
  const loginForm = document.getElementById("login-form");
  loginForm.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

window.toggleLogin = function () {
  if (!auth.currentUser) {
    document.getElementById("loginBox").style.display = "flex";
    showLogin();
  }
};

window.closeLogin = function () {
  document.getElementById("loginBox").style.display = "none";
};

window.showRegister = function () {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
};

window.showLogin = function () {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
};

// ---------------- تسجيل جديد مع Firestore
window.register = async function () {
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !email || !password) {
    showMessage("يرجى ملء جميع الحقول.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), { username, email });
    alert("تم إنشاء الحساب بنجاح!");
    closeLogin();
    updateAccountIcon(user);
  } catch (error) {
    showMessage(error.message);
  }
};

// ---------------- تسجيل دخول رسمي
window.login = async function () {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    showMessage("يرجى ملء جميع الحقول.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert("تم تسجيل الدخول بنجاح!");
    closeLogin();
    updateAccountIcon(user);
  } catch (error) {
    showMessage("البريد أو كلمة المرور غير صحيحة.");
  }
};

// ---------------- تسجيل الخروج
window.logout = function () {
  signOut(auth).then(() => {
    document.getElementById("accountMenu").classList.add("hidden");
    const icon = document.getElementById("accountIcon");
    icon.innerHTML = "👤";
    icon.onclick = toggleLogin;
  });
};

// ---------------- تحديث بيانات الحساب من فايرستور
window.updateAccountIcon = async function (user) {
  const icon = document.getElementById("accountIcon");
  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=mp&s=200`;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("accountUsername").innerText = `اسم المستخدم: ${data.username}`;
    document.getElementById("accountEmail").innerText = `البريد الإلكتروني: ${data.email}`;
  }

  icon.innerHTML = `<img src="${gravatarUrl}" class="profile-image" alt="Profile" />`;
  icon.onclick = toggleAccountMenu;
};

window.toggleAccountMenu = function () {
  const menu = document.getElementById("accountMenu");
  menu.classList.toggle("hidden");
};

window.closeAccountMenu = function () {
  document.getElementById("accountMenu").classList.add("hidden");
};

window.scrollToSection = function (sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.scrollIntoView({ behavior: "smooth" });
};

function md5(string) {
  return CryptoJS.MD5(string).toString();
}

// ---------------- عند دخول الموقع نحاول استعادة الجلسة
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateAccountIcon(user);
  }
});





let studyDuration = 25 * 60; 
let breakDuration = 5 * 60;  
let currentTime = studyDuration; 
let isStudyTime = true; 
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const statusLabel = document.getElementById("status-label");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");


function updateTimerDisplay() {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// بدء المؤقت
function startTimer() {
  
  studyDuration = parseInt(document.getElementById("study-time").value) * 60;
  breakDuration = parseInt(document.getElementById("break-time").value) * 60;

  currentTime = isStudyTime ? studyDuration : breakDuration; 
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentTime > 0) {
      currentTime--;
      updateTimerDisplay();
    } else {
      isStudyTime = !isStudyTime;
      switchMode();
    }
  }, 1000);
  
  startBtn.disabled = true;
  stopBtn.disabled = false;
  resetBtn.disabled = false;
}


function stopTimer() {
  clearInterval(timerInterval);
  
  startBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = false;
}


function resetTimer() {
  clearInterval(timerInterval);
  isStudyTime = true;
  currentTime = studyDuration;
  switchMode();
  updateTimerDisplay();
  
  startBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = true;
}


function switchMode() {
  if (isStudyTime) {
    statusLabel.textContent = "🧠 وقت الدراسة";
    currentTime = studyDuration;
  } else {
    statusLabel.textContent = "⏸ وقت الراحة";
    currentTime = breakDuration;
  }
  updateTimerDisplay();
  startTimer(); 
}

startBtn.addEventListener("click", startTimer);

stopBtn.addEventListener("click", stopTimer);

resetBtn.addEventListener("click", resetTimer);




