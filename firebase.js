import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaosiZQoPCo4wdlSDy6UYs0b2PWbkkWXs",
  authDomain: "igrismanga-db.firebaseapp.com",
  databaseURL: "https://igrismanga-db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "igrismanga-db",
  storageBucket: "igrismanga-db.appspot.com",
  appId: "1:40861137290:web:03cd9be7175620d4e23073"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, ref, onValue, set, remove, push, onAuthStateChanged, signOut, signInWithPopup };
