// ==========================================================================
// 1. STATE & DATA INITIALIZATION (Using LocalStorage mock database)
// ==========================================================================
const DEFAULT_BIO_PAGES = [
    {
        name: "سارة الأحمد",
        title: "مطور واجهات مستخدم ومصممة تجربة مستخدم",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "شغوفة بتحويل الأفكار المعقدة إلى واجهات رقمية بسيطة، جذابة، وسهلة الاستخدام. أعمل على تطوير المواقع بأحدث التقنيات وبأعلى معايير الجودة.",
        email: "sara@example.com",
        phone: "+966500000000",
        x: "https://x.com",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        website: "https://example.com",
        theme: "theme-professional",
        views: 142
    },
    {
        name: "عبد الله الخالدي",
        title: "مهندس برمجيات ومطور كامل (Full-stack)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        bio: "مهندس برمجيات متخصص في بناء تطبيقات ويب قابلة للتوسع وآمنة باستخدام Node.js وReact.",
        email: "abdullah@example.com",
        phone: "+966555555555",
        x: "https://x.com",
        linkedin: "https://linkedin.com",
        github: "https://github",
        website: "https://example.com",
        theme: "theme-dark-tech",
        views: 89
    }
];

let appState = {
    isLoggedIn: false,
    currentUser: { name: "سارة الأحمد", email: "sara@example.com" },
    bioPages: [],
    currentLang: "ar",
    activeScreen: "auth", // Starts with login shield
    authTab: "login"
};

// Initial setup from storage
function loadStateFromStorage() {
    const savedPages = localStorage.getItem("bio_pages");
    if (savedPages) {
        appState.bioPages = JSON.parse(savedPages);
    } else {
        appState.bioPages = [...DEFAULT_BIO_PAGES];
        localStorage.setItem("bio_pages", JSON.stringify(appState.bioPages));
    }

    const savedAuth = localStorage.getItem("bio_is_logged");
    if (savedAuth === "true") {
        appState.isLoggedIn = true;
        appState.activeScreen = "dashboard";
    } else {
        appState.isLoggedIn = false;
        appState.activeScreen = "auth";
    }
}

// ==========================================================================
// 2. SYSTEM TRANSLATIONS DICTIONARY
// ==========================================================================
const translations = {
    ar: {
        dashboard: "لوحة التحكم",
        create: "إنشاء صفحة جديدة",
        profile: "الملف الشخصي",
        login: "تسجيل الدخول",
        register: "إنشاء حساب الجديد",
        logout: "تسجيل الخروج",
        themeText: "الوضع الليلي",
        save: "حفظ ونشر الصفحة",
        views: "مشاهدة"
    },
    en: {
        dashboard: "Dashboard",
        create: "Create Bio Link",
        profile: "Profile",
        login: "Log In",
        register: "Register",
        logout: "Sign Out",
        themeText: "Dark Mode",
        save: "Save & Publish Page",
        views: "Views"
    }
};

// ==========================================================================
// 3. INTERACTIVE NAVIGATION & SCREEN SWITCHER
// ==========================================================================
function switchScreen(screenId) {
    if (!appState.isLoggedIn && screenId !== 'auth') {
        screenId = 'auth';
    }

    appState.activeScreen = screenId;
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active-screen');
    });

    // Show selected screen
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active-screen');
    }

    // Toggle main frame elements based on Auth Shield
    const sidebar = document.getElementById('mainSidebar');
    const topBar = document.getElementById('mainTopBar');
    
    if (screenId === 'auth') {
        sidebar.style.display = 'none';
        topBar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
        topBar.style.display = 'flex';
        
        // Mark menu item active
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-screen') === screenId) {
                item.classList.add('active');
            }
        });

        // Set Topbar title dynamically
        setTopbarTitle(screenId);
    }

    // Render corresponding lists/forms
    if (screenId === 'dashboard') {
        renderDashboardPages();
    } else if (screenId === 'create') {
        resetCreateForm();
    } else if (screenId === 'profile') {
        updateProfileMetrics();
    }

    // Close mobile menu sidebar
    sidebar.classList.remove('active');
}

function setTopbarTitle(screenId) {
    const titleEl = document.getElementById('pageTitle');
    const lang = appState.currentLang;
    if (screenId === 'dashboard') titleEl.textContent = translations[lang].dashboard;
    else if (screenId === 'create') titleEl.textContent = translations[lang].create;
    else if (screenId === 'profile') titleEl.textContent = translations[lang].profile;
    else if (screenId === 'preview') titleEl.textContent = "معاينة الصفحة الشخصية";
}

// Toggle mobile sidebar Drawer menu
function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar');
    sidebar.classList.toggle('active');
}

// ==========================================================================
// 4. AUTHENTICATION CONTROLLER (SCREEN 1)
// ==========================================================================
function setAuthTab(tab) {
    appState.authTab = tab;
    
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const usernameGroup = document.getElementById('usernameGroup');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        usernameGroup.style.display = 'none';
        authTitle.textContent = "تسجيل الدخول";
        authSubtitle.textContent = "مرحباً بك مجدداً في صانع الصفحات الشخصية";
        authSubmitBtn.textContent = "تسجيل الدخول";
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        usernameGroup.style.display = 'block';
        authTitle.textContent = "إنشاء حساب جديد";
        authSubtitle.textContent = "ابدأ ببناء وتصميم صفحة الهوية الرقمية مجاناً";
        authSubmitBtn.textContent = "إنشاء حساب";
    }
}

function handleAuth(event) {
    event.preventDefault();
    
    // Simulate successful login/registration
    appState.isLoggedIn = true;
    localStorage.setItem("bio_is_logged", "true");
    showToast(appState.authTab === 'login' ? "مرحباً بك! تم تسجيل الدخول بنجاح." : "رائع! تم إنشاء الحساب بنجاح.");
    
    switchScreen('dashboard');
}

function logout() {
    appState.isLoggedIn = false;
    localStorage.setItem("bio_is_logged", "false");
    showToast("تم تسجيل الخروج بنجاح.");
    switchScreen('auth');
}

// ==========================================================================
// 5. DASHBOARD CONTROLLER (SCREEN 2)
// ==========================================================================
function renderDashboardPages() {
    const grid = document.getElementById('bioPagesGrid');
    grid.innerHTML = '';

    if (appState.bioPages.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 50px 20px;">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 15px;"></i>
                <h4>لا توجد صفحات شخصية حتى الآن</h4>
                <p style="color: var(--text-muted); margin-bottom: 20px;">ابدأ الآن وصمم أول صفحة هوية رقمية لك ولجمهورك.</p>
                <button class="btn btn-primary" onclick="switchScreen('create')">إنشاء أول صفحة</button>
            </div>
        `;
        return;
    }

    appState.bioPages.forEach((page, index) => {
        const card = document.createElement('div');
        card.className = 'bio-card';
        card.innerHTML = `
            <div class="bio-card-top">
                <img src="${page.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="Avatar">
                <div class="bio-card-info">
                    <h4>${page.name}</h4>
                    <p>${page.title}</p>
                </div>
            </div>
            <div class="bio-card-meta">
                <span><i class="fa-solid fa-eye"></i> ${page.views} ${appState.currentLang === 'ar' ? 'زيارة' : 'Views'}</span>
                <span style="margin-right: 15px;"><i class="fa-solid fa-palette"></i> ${getFriendlyThemeName(page.theme)}</span>
            </div>
            <div class="bio-card-actions">
                <button class="btn btn-secondary" onclick="previewBioPage(${index})"><i class="fa-solid fa-eye"></i> معاينة</button>
                <button class="btn btn-secondary" onclick="editBioPage(${index})"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="btn btn-danger" onclick="deleteBioPage(${index})"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function getFriendlyThemeName(themeKey) {
    switch (themeKey) {
        case 'theme-professional': return 'أزرق احترافي';
        case 'theme-dark-tech': return 'تقني مظلم';
        case 'theme-warm-sunset': return 'غروب دافئ';
        case 'theme-minimal-mono': return 'كلاسيكي هادئ';
        default: return 'أزرق احترافي';
    }
}

// ==========================================================================
// 6. CREATE & EDIT LOGIC (SCREEN 3 & 4)
// ==========================================================================
function resetCreateForm() {
    document.getElementById('bioPageForm').reset();
    document.getElementById('editPageIndex').value = "";
    document.getElementById('formScreenTitle').textContent = "بيانات الصفحة الشخصية الجديدة";
    document.getElementById('saveBioBtn').textContent = "حفظ ونشر الصفحة";
}

function useDefaultAvatar() {
    const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    ];
    const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
    document.getElementById('bioAvatar').value = defaultAvatars[randomIndex];
}

function handleSaveBioPage(event) {
    event.preventDefault();
    
    const editIndex = document.getElementById('editPageIndex').value;
    const pageData = {
        name: document.getElementById('bioName').value,
        title: document.getElementById('bioTitle').value,
        avatar: document.getElementById('bioAvatar').value || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        bio: document.getElementById('bioBio').value,
        email: document.getElementById('bioEmail').value,
        phone: document.getElementById('bioPhone').value,
        x: document.getElementById('bioX').value,
        linkedin: document.getElementById('bioLinkedin').value,
        github: document.getElementById('bioGithub').value,
        website: document.getElementById('bioWebsite').value,
        theme: editIndex !== "" ? appState.bioPages[editIndex].theme : "theme-professional",
        views: editIndex !== "" ? appState.bioPages[editIndex].views : 0
    };

    if (editIndex !== "") {
        // Edit Mode
        appState.bioPages[editIndex] = pageData;
        showToast("تم تحديث معلومات صفحتك بنجاح.");
    } else {
        // Create Mode
        appState.bioPages.push(pageData);
        showToast("مبروك! تم نشر صفحتك الشخصية الجديدة بنجاح.");
    }

    localStorage.setItem("bio_pages", JSON.stringify(appState.bioPages));
    switchScreen('dashboard');
}

function editBioPage(index) {
    const page = appState.bioPages[index];
    switchScreen('create');
    
    document.getElementById('editPageIndex').value = index;
    document.getElementById('formScreenTitle').textContent = "تعديل الصفحة الشخصية";
    document.getElementById('saveBioBtn').textContent = "حفظ التحديثات";

    document.getElementById('bioName').value = page.name;
    document.getElementById('bioTitle').value = page.title;
    document.getElementById('bioAvatar').value = page.avatar;
    document.getElementById('bioBio').value = page.bio;
    document.getElementById('bioEmail').value = page.email;
    document.getElementById('bioPhone').value = page.phone;
    document.getElementById('bioX').value = page.x;
    document.getElementById('bioLinkedin').value = page.linkedin;
    document.getElementById('bioGithub').value = page.github;
    document.getElementById('bioWebsite').value = page.website;
}

function deleteBioPage(index) {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه الصفحة نهائياً؟")) {
        appState.bioPages.splice(index, 1);
        localStorage.setItem("bio_pages", JSON.stringify(appState.bioPages));
        showToast("تم حذف الصفحة الشخصية.");
        renderDashboardPages();
    }
}

// ==========================================================================
// 7. PREVIEW & THEMES ENGINE (SCREEN 5)
// ==========================================================================
let currentPreviewIndex = null;

function previewBioPage(index) {
    currentPreviewIndex = index;
    const page = appState.bioPages[index];
    switchScreen('preview');

    // Populate the preview fields
    document.getElementById('prevName').textContent = page.name;
    document.getElementById('prevTitle').textContent = page.title;
    document.getElementById('prevAvatar').src = page.avatar;
    document.getElementById('prevBio').textContent = page.bio || "لا تتوفر نبذة تعريفية.";

    // Quick Action Contacts
    const emailBtn = document.getElementById('prevEmailBtn');
    if (page.email) {
        emailBtn.href = `mailto:${page.email}`;
        emailBtn.style.display = 'flex';
    } else {
        emailBtn.style.display = 'none';
    }

    const phoneBtn = document.getElementById('prevPhoneBtn');
    if (page.phone) {
        phoneBtn.href = `tel:${page.phone}`;
        phoneBtn.style.display = 'flex';
    } else {
        phoneBtn.style.display = 'none';
    }

    // Dynamic Social Links rendering inside Preview
    toggleSocialLink('linkX', page.x);
    toggleSocialLink('linkLinkedin', page.linkedin);
    toggleSocialLink('linkGithub', page.github);
    toggleSocialLink('linkWebsite', page.website);

    // Apply saved theme state
    document.getElementById('themeSelect').value = page.theme;
    applyPreviewTheme(page.theme);
}

function toggleSocialLink(id, value) {
    const el = document.getElementById(id);
    if (value) {
        el.href = value;
        el.style.display = 'flex';
    } else {
        el.style.display = 'none';
    }
}

// Theme Selector functionality inside preview screen
function applyPreviewTheme(themeClass) {
    const card = document.getElementById('liveProfileCard');
    
    // Clear old theme classes
    card.classList.remove('theme-professional', 'theme-dark-tech', 'theme-warm-sunset', 'theme-minimal-mono');
    
    // Inject selected theme layout
    card.classList.add(themeClass);

    // Persist selected theme in memory database
    if (currentPreviewIndex !== null) {
        appState.bioPages[currentPreviewIndex].theme = themeClass;
        localStorage.setItem("bio_pages", JSON.stringify(appState.bioPages));
    }
}

function copyShareUrl() {
    const mockUrl = window.location.origin + "?page=" + encodeURIComponent(appState.bioPages[currentPreviewIndex].name);
    navigator.clipboard.writeText(mockUrl).then(() => {
        showToast("🎉 تم نسخ رابط الصفحة الشخصية بنجاح لمشاركتها!");
    });
}

// ==========================================================================
// 8. SYSTEM-WIDE PROFILE SETTINGS (SCREEN 6)
// ==========================================================================
function updateProfileMetrics() {
    document.getElementById('profilePagesCount').textContent = appState.bioPages.length;
}

// ==========================================================================
// 9. SETTINGS & UTILITY WRAPPERS (Dark Mode, Language Toggle, Toasts)
// ==========================================================================
function toggleDarkMode() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.className = "fa-solid fa-moon";
        themeText.textContent = appState.currentLang === 'ar' ? "الوضع الليلي" : "Dark Mode";
    } else {
        body.classList.add('dark-mode');
        themeIcon.className = "fa-solid fa-sun";
        themeText.textContent = appState.currentLang === 'ar' ? "الوضع النهاري" : "Light Mode";
    }
}

function toggleLanguage() {
    const html = document.documentElement;
    const langText = document.getElementById('langText');
    const themeText = document.getElementById('themeText');
    const sidebar = document.getElementById('mainSidebar');

    if (appState.currentLang === 'ar') {
        appState.currentLang = 'en';
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        langText.textContent = "العربية";
        themeText.textContent = document.body.classList.contains('dark-mode') ? "Light Mode" : "Dark Mode";
    } else {
        appState.currentLang = 'ar';
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        langText.textContent = "English";
        themeText.textContent = document.body.classList.contains('dark-mode') ? "الوضع النهاري" : "الوضع الليلي";
    }

    setTopbarTitle(appState.activeScreen);
    if (appState.activeScreen === 'dashboard') renderDashboardPages();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================================================
// 10. INITIAL BOOTSTRAP
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    switchScreen(appState.activeScreen);
});
