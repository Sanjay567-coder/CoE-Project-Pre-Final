// auth.js
// --------------------------------------------------
// Import Firebase modules (must run inside <script type="module">)
// --------------------------------------------------
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  // 💡 FIX: Import setPersistence and a persistence type (e.g., Local)
  setPersistence, 
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

// --------------------------------------------------
// Initialize Firebase
// --------------------------------------------------
const auth = getAuth(app);
const db = getFirestore(app);

// --------------------------------------------------
// 🔑 FIX: Set Auth Persistence Mode
// This ensures the session is stored robustly before and after redirection.
// --------------------------------------------------
try {
  await setPersistence(auth, browserLocalPersistence);
  console.log("✅ Firebase Auth Persistence set to Local.");
} catch (error) {
  console.error("❌ Failed to set persistence:", error);
}

// --------------------------------------------------
// Elements
// --------------------------------------------------
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const logoutBtn = document.getElementById("logoutBtn"); // Moved up for completeness

// --------------------------------------------------
// Helper function for redirection
// --------------------------------------------------
function handleRedirect(role, email) {
    const rolesMap = {
        "student": "student.html",
        "teacher": "teacher.html",
        "hod": "hod.html",
        "warden": "warden.html",
        "security": "security.html"
    };

    const redirectPath = rolesMap[role];

    if (redirectPath) {
        console.log(`🚀 Redirecting user ${email} (${role}) to ${redirectPath}`);
        window.location.href = redirectPath;
    } else {
        alert(`Role '${role}' not assigned or supported. Contact admin.`);
        // Note: You should handle signOut here if this role should not be signed in
    }
}

// --------------------------------------------------
// Login Handler
// --------------------------------------------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    // Clear previous error message
    if (errorMsg) errorMsg.innerText = ""; 

    try {
      // 🔐 Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("✅ Logged in:", user.email);

      // 🔎 Fetch user data
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const role = userData.role;

        // 💾 Store session
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("name", userData.name || "");
        sessionStorage.setItem("email", user.email);
        
        // 🚀 Redirect using the dedicated function
        handleRedirect(role, user.email);

      } else {
        // If Firestore record is missing, sign out the user from Auth.
        errorMsg.innerText = "No user record found in Firestore. Logging out...";
        await signOut(auth);
      }
    } catch (error) {
      console.error("❌ Login failed:", error.code, error.message);
      // Display a more user-friendly message for common errors
      let displayMessage = "Login failed. Please check your email and password.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          displayMessage = "Invalid credentials.";
      }
      if (errorMsg) errorMsg.innerText = displayMessage;
    }
  });
}

// --------------------------------------------------
// Watch login state (optional debug)
// --------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 💡 Tip: On dashboard pages, this can be used to check if session data is still valid
    // and if not, redirect to login page.
    // console.log("👤 User currently signed in:", user.email);
    
    // Auto-redirect if user is logged in but on the index/login page
    if (loginForm && !sessionStorage.getItem("role")) {
        // Only attempt to read Firestore if the sessionStorage is missing (e.g., first load)
        // For a full app, you would check if the current page is the login page before redirecting.
    }
    
  } else {
    // console.log("🚪 No user signed in");
  }
});

// --------------------------------------------------
// Logout (for dashboard pages)
// --------------------------------------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        sessionStorage.clear();
        alert("You have been logged out.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Logout failed:", error);
    }
  });
}