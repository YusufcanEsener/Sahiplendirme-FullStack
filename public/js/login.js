// Login başarılı olduğunda
const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
});

const data = await response.json();

if (response.ok) {
    // Token'ı kaydet
    localStorage.setItem('token', data.token);
    
    // Kullanıcı bilgilerini kaydet
    const user = {
        name: data.name,
        email: data.email,
        role: data.role,  // Önemli: role bilgisini mutlaka kaydet
        isAdmin: data.isAdmin
    };
    localStorage.setItem('user', JSON.stringify(user));
    
    window.location.href = '/';  // Ana sayfaya yönlendir
} 