// Navbar oluşturma ve kullanıcı durumunu kontrol etme
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    navbar.innerHTML = `
        <div class="navbar-container">
            <a href="/" class="navbar-brand">
                <i class="fas fa-paw"></i> PawFinder
            </a>
            <div class="navbar-menu">
                <a href="/shelters.html" class="navbar-item">İlanlar</a>
                <a href="/blog.html" class="navbar-item">Blog</a>
                ${token ? `
                    <div class="profile-dropdown">
                        <div class="profile-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="dropdown-content">
    <div class="user-info">
        <p>${user.name || ''}</p>
    </div>
    
    ${user.isAdmin === 1 ? `
        <a href="/create-ad.html" class="dropdown-item">
            <i class="fas fa-plus-circle"></i> İlan Oluştur
        </a>
        <a href="/create-blog.html" class="dropdown-item">
            <i class="fas fa-blog"></i> Blog Oluştur
        </a>
    ` : `
        <a href="/profile.html" class="dropdown-item">
            <i class="fas fa-user"></i> Profilim
        </a>
    `}

    <a href="#" class="dropdown-item" id="logoutBtn">
        <i class="fas fa-sign-out-alt"></i> Çıkış Yap
    </a>
</div>

                    </div>
                ` : `
                    <a href="/login.html" class="navbar-item">Giriş Yap</a>
                    <a href="/register.html" class="navbar-item">Kayıt Ol</a>
                `}
            </div>
        </div>
    `;

    document.body.insertBefore(navbar, document.body.firstChild);

    // Çıkış yapma işlemi
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    }
}); 