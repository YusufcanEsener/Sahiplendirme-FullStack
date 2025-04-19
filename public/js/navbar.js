// Navbar oluşturma ve kullanıcı durumunu kontrol etme
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    let user = null;
    
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Kullanıcı bilgileri:', user); // Debug için
        console.log('Kullanıcı rolü:', user.role); // Role'ü özel olarak kontrol et
        console.log('Role shelter kontrolü:', user.role === 'shelter'); // Shelter kontrolünü debug et
    } catch (error) {
        console.error('Kullanıcı bilgileri parse edilemedi:', error);
        user = {};
    }

    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    // Role kontrolünü değişkende tutalım ve debug edelim
    const isShelter = user.role === 'shelter';
    console.log('İs Shelter:', isShelter);

    navbar.innerHTML = `
        <div class="navbar-container">
            <a href="/" class="navbar-brand">
                <i class="fas fa-paw"></i> PawFinder
            </a>
            <div class="navbar-menu">
                <a href="/shelters.html" class="navbar-item">İlanlar</a>
                <a href="/blog.html" class="navbar-item">Blog</a>
                <a href="/donate.html" class="navbar-item">Donate</a>
                <a href="/maps.html" class="navbar-item">Harita</a>
                
                ${token ? `
                    <div class="profile-dropdown">
                        <div class="profile-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="dropdown-content">
                            <div class="user-info">
                                <p>${user.firstName ? `${user.firstName} ${user.lastName}` : 'Kullanıcı'}</p>
                            </div>
                            
                            ${isShelter ? `
                                <a href="/profile.html" class="dropdown-item">
                                    <i class="fas fa-user"></i> Profilim
                                </a>   
                                    
                                <a href="/ads-dashboard.html" class="dropdown-item">
                                    <i class="fas fa-list"></i> İlanlarım
                                </a>
                            ` : `
                                <a href="/profile.html" class="dropdown-item">
                                    <i class="fas fa-user"></i> Profilim
                                </a>
                            `}
                            
                            ${user.isAdmin === 1 ? `
                                <a href="/role-management.html" class="dropdown-item">
                                    <i class="fas fa-user-shield"></i> Yetkilendirme
                                </a>
                            ` : ''}
                            
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