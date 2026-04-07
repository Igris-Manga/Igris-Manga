// استيراد الأدوات اللازمة من ملف الإعدادات
import { 
    db, auth, provider, ref, onValue, set, remove, push,
    onAuthStateChanged, signOut 
} from "./firebase-config.js";

// بريدك كمدير للموقع
const adminEmail = "almsmmalmhtrf22@gmail.com";

// دالة التوجيه لصفحة التسجيل (admin.html)
window.goToAuthPage = () => {
    window.location.href = 'admin.html';
};

// --- 1. مراقبة حالة تسجيل الدخول والربط الذكي ---
onAuthStateChanged(auth, user => {
    const side = document.getElementById('sideProfile');
    const userSection = document.getElementById('userSection');
    const logoutContainer = document.getElementById('logoutContainer');
    const adminLink = document.getElementById('adminLink'); 
    const adminFab = document.getElementById('adminFabContainer');

    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        
        // عرض بيانات المستخدم في القائمة الجانبية
        side.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <img src="${user.photoURL || 'https://ui-avatars.com/api/?name='+user.email}" 
                     style="width:70px; height:70px; border-radius:50%; border:2px solid var(--p); object-fit:cover;">
                <h4 style="margin:10px 0 0 0; color:var(--text);">${user.displayName || 'مستخدم أسطوري'}</h4>
            </div>
        `;
        
        if (userSection) userSection.style.display = 'block';
        if (logoutContainer) logoutContainer.style.display = 'block';

        // التحقق مما إذا كان المستخدم هو المدير
        if (user.email === adminEmail) {
            if (adminFab) adminFab.style.display = 'flex'; 
            if (adminLink) {
                adminLink.style.display = 'block';
                adminLink.href = 'admin.html'; 
            }

            side.style.cursor = 'pointer';
            side.onclick = () => window.location.href = 'admin.html';
            document.body.classList.add('is-admin'); 
        }
    } else {
        // واجهة الزائر (غير المسجل)
        localStorage.removeItem('isLoggedIn');
        side.onclick = window.goToAuthPage; 
        
        side.innerHTML = `
            <div style="cursor:pointer; text-align:center; padding:20px;">
                <i class="fas fa-user-circle" style="color:var(--p); font-size:3.5rem;"></i>
                <p style="margin-top:10px; color:var(--text);">اضغط لتسجيل الدخول</p>
            </div>
        `;
        
        if (userSection) userSection.style.display = 'none';
        if (adminFab) adminFab.style.display = 'none';
        if (logoutContainer) logoutContainer.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
});

// --- 2. وظائف الحساب (الدخول والخروج) ---
window.handleLogout = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }).catch(err => console.error(err));
};

window.handleLogin = () => {
    window.goToAuthPage();
};

// --- 3. جلب وعرض المانجا من Firebase ---
onValue(ref(db, 'manga'), snapshot => {
    const grid = document.getElementById('mangaGrid');
    const data = snapshot.val();
    if (!grid) return;
    grid.innerHTML = '';
    
    const isUserAdmin = auth.currentUser && auth.currentUser.email === adminEmail;

    if (data) {
        Object.keys(data).reverse().forEach(id => {
            const m = data[id];
            let chs = '';
            if (m.chapters) {
                Object.keys(m.chapters).sort((a,b) => b - a).slice(0, 2).forEach(ch => {
                    chs += `<a href="Viewer.html?id=${id}&ch=${ch}" class="chapter-node"><span>فصل ${ch}</span><i class="fas fa-play"></i></a>`;
                });
            }

            const deleteBtn = isUserAdmin ? `
                <div class="delete-overlay" onclick="window.confirmDelete('${id}')">
                    <i class="fas fa-trash"></i>
                </div>` : '';

            // بناء بطاقة المانجا مع سمة data-title للبحث
            grid.innerHTML += `
                <div class="manga-card" data-title="${m.title}">
                    ${deleteBtn}
                    <div class="manga-poster" onclick="location.href='reader.html?id=${id}'">
                        <img src="${m.cover}" alt="${m.title}">
                    </div>
                    <div class="manga-info">
                        <h3 class="manga-title">${m.title}</h3>
                        <div class="manga-tags">
                            <span class="tag-item">${m.type || 'مانهوا'}</span>
                            <span class="tag-item" style="color:var(--p)">${m.status || 'مستمرة'}</span>
                        </div>
                        <div class="latest-chapters-list">${chs}</div>
                    </div>
                </div>`;
        });
    } else {
        grid.innerHTML = '<p style="text-align:center; width:100%; color:#555;">المكتبة فارغة حالياً..</p>';
    }
});

// --- 4. وظائف الإدارة (إضافة وحذف) ---
window.confirmAddManga = async function() {
    const id = document.getElementById('newMangaId')?.value.trim();
    const title = document.getElementById('newMangaTitle')?.value;
    const cover = document.getElementById('newMangaCover')?.value;
    
    if(!id || !title || !cover) return alert("اكمل البيانات الأساسية!");
    
    try {
        await set(ref(db, `manga/${id}`), {
            title, cover,
            type: document.getElementById('newMangaType')?.value || 'مانهوا',
            status: document.getElementById('newMangaStatus')?.value || 'مستمرة',
            description: document.getElementById('newMangaDesc')?.value || '',
            createdAt: Date.now()
        });
        alert("تم النشر بنجاح! 🚀");
        location.reload(); 
    } catch (error) { alert("خطأ: " + error.message); }
};

window.confirmDelete = (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العمل نهائياً؟")) {
        remove(ref(db, `manga/${id}`)).then(() => alert("تم الحذف")).catch(err => alert(err.message));
    }
};

window.toggleUserLists = function() {
    const list = document.getElementById('userLists');
    const arrow = document.getElementById('listArrow');
    if(list) list.classList.toggle('open');
    if(arrow) arrow.classList.toggle('rotate');
};

// --- 5. وظيفة البحث الذكي (نسخة الإصلاح النهائي) ---
window.searchManga = () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const mangaCards = document.querySelectorAll('.manga-card');

    mangaCards.forEach(card => {
        // استخراج العنوان من السمة data-title لضمان الدقة
        const title = card.getAttribute('data-title') ? card.getAttribute('data-title').toLowerCase() : "";
        
        if (title.includes(searchTerm)) {
            // إظهار الكرت مع إجبارية ظهور المحتوى الداخلي (الاسم والصورة)
            card.style.display = 'block'; 
            card.style.visibility = 'visible'; 
            card.style.opacity = '1';
        } else {
            // إخفاء الكروت التي لا تطابق البحث
            card.style.display = 'none';
        }
    });
};
