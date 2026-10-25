// প্রতিটি সুরক্ষিত পেজে (deshboard, search, report) এই ফাইল যোগ করুন।
// লগইন না থাকলে ইউজারকে লগইন পেজে (root এর index.html) পাঠিয়ে দেবে।
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBK_2UagTcClpVl2Wrmtbxz4MviBdhZ8gM",
  authDomain: "my-web-8526f.firebaseapp.com",
  projectId: "my-web-8526f",
  storageBucket: "my-web-8526f.firebasestorage.app",
  messagingSenderId: "971545805623",
  appId: "1:971545805623:web:0f7ef878d70fcbbeda10b2",
  measurementId: "G-ZCFTZX070Q"
};

// যাচাই শেষ না হওয়া পর্যন্ত পেজ লুকানো থাকবে
// পেজের <head> এ <style id="authHider">html{visibility:hidden}</style> থাকলে সেটাই ব্যবহার হবে (ঝলক এড়াতে)
let hider = document.getElementById("authHider");
if (!hider){
  hider = document.createElement("style");
  hider.id = "authHider";
  hider.textContent = "html{visibility:hidden}";
  document.head.appendChild(hider);
}

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// auth-guard.js যেখানে আছে (root), সেখান থেকে লগইন পেজের ঠিকানা
// লগইন পেজের ফিক্সড ঠিকানা (auth-guard.js কোথায় রাখা হয়েছে তার উপর নির্ভর করে না)
const LOGIN_URL = new URL("./login.html", import.meta.url).href;

export const logout = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (!user){ location.replace(LOGIN_URL); return; }
  hider.remove(); // লগইন আছে, পেজ দেখাও
  // পেজে window.currentUser এবং window.userCredit পাওয়া যাবে
  window.currentUser = user;
  // ইউজারের Firestore ডকুমেন্ট না থাকলে এখানেই বানিয়ে নেওয়া (ক্রেডিট ০ দিয়ে)
  (async () => {
    try {
      const ref = doc(db, "users", user.uid);
      if (!(await getDoc(ref)).exists()) {
        await setDoc(ref, { name: user.displayName || "", email: user.email || "",
          photoURL: user.photoURL || "", credit: 0, createdAt: serverTimestamp() });
      }
    } catch (e) { console.error("user doc:", e); }
  })();
  onSnapshot(doc(db, "users", user.uid), snap => {
    window.userCredit = snap.exists() ? (snap.data().credit || 0) : 0;
    window.dispatchEvent(new CustomEvent("credit-change", { detail: window.userCredit }));
  });
});
