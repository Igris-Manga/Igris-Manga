import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const adminEmail = "almsmmalmhtrf22@gmail.com";

onAuthStateChanged(auth, user => {
    const adminFab = document.getElementById('adminFabContainer');
    const side = document.getElementById('sideProfile');
    if (user) {
        side.innerHTML = `<img src="${user.photoURL || 'https://ui-avatars.com/api/?name='+user.email}" style="width:70px; border-radius:50%; border:2px solid var(--p);"><h4 style="margin:10px 0 0 0;">${user.displayName || 'مستخدم'}</h4>`;
        if (user.email === adminEmail) adminFab.style.display = 'flex';
    } else {
        side.innerHTML = `<a href="admin.html" style="color:var(--p); font-size:3rem;"><i class="fas fa-user-circle"></i></a><p>سجل دخول</p>`;
    }
});

onValue(ref(db, 'manga'), snapshot => {
    const grid = document.getElementById('mangaGrid');
    const data = snapshot.val();
    grid.innerHTML = '';
    if (data) {
        Object.keys(data).reverse().forEach(id => {
            const m = data[id];
            let chs = '';
            if (m.chapters) {
                Object.keys(m.chapters).sort((a,b)=>b-a).slice(0,2).forEach(ch => {
                    chs += `<a href="Viewer.html?id=${id}&ch=${ch}" class="chapter-node"><span>فصل ${ch}</span><i class="fas fa-play"></i></a>`;
                });
            }
            grid.innerHTML += `
                <div class="manga-card" data-title="${m.title}">
                    <div class="delete-overlay" onclick="window.confirmDelete('${id}')"><i class="fas fa-trash"></i></div>
                    <div class="manga-poster" onclick="location.href='reader.html?id=${id}'"><img src="${m.cover}"></div>
                    <div class="manga-info">
                        <h3 class="manga-title">${m.title}</h3>
                        <div class="manga-tags">
                            <span class="tag-item">${m.type}</span>
                            <span class="tag-item" style="color:var(--p)">${m.status}</span>
                        </div>
                        <div class="latest-chapters-list">${chs}</div>
                    </div>
                </div>`;
        });
    }
});

window.confirmAddManga = async function() {
    const id = document.getElementById('newMangaId').value.trim();
    const title = document.getElementById('newMangaTitle').value;
    const selectedGenres = Array.from(document.querySelectorAll('.genre-item:checked')).map(cb => cb.value);
    
    if(!id || !title) return alert("أكمل البيانات الأساسية!");
    
    await set(ref(db, `manga/${id}`), {
        title, 
        cover: document.getElementById('newMangaCover').value,
        genres: selectedGenres,
        type: document.getElementById('newMangaType').value,
        status: document.getElementById('newMangaStatus').value,
        description: document.getElementById('newMangaDesc').value,
        createdAt: Date.now()
    });
    alert("تم النشر بنجاح!");
    closeAddModal();
};

window.confirmDelete = (id) => { if(confirm("حذف العمل؟")) remove(ref(db, `manga/${id}`)); };
window.handleLogout = () => signOut(auth).then(()=>location.reload());
