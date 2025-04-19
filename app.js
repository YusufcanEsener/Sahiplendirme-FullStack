import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './models/User.js';
import dotenv from 'dotenv';
import Ad from './models/Ad.js';
import Blog from './models/Blog.js';
import swaggerUi from 'swagger-ui-express';
import specs from './docs/swagger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Bağlantısı
mongoose.connect('mongodb://localhost:27017/sahiplendirme-backend')
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'blog.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'register.html'));
});

app.get('/pets', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'pets.html'));
});

app.get('/shelters', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'shelters.html'));
});
app.get('/maps', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'maps.html'));
});
app.get('/donate', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'donate.html'));
});
// JWT doğrulama middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'gizlianahtar', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Geçersiz token' });
        }
        
        req.user = user;
        next();
    });
};

// Profil bilgilerini getir
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Şifre değiştirme
app.post('/api/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Mevcut şifre gerekli'),
    body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        // Kullanıcıyı bul
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        
        // Mevcut şifreyi kontrol et
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Mevcut şifre yanlış' });
        }
        
        // Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Şifreyi güncelle
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Register endpoint
app.post('/api/register', [
    body('firstName').notEmpty().withMessage('Ad alanı boş bırakılamaz').trim(),
    body('lastName').notEmpty().withMessage('Soyad alanı boş bırakılamaz').trim(),
    body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
    body('birthDate').notEmpty().withMessage('Doğum tarihi boş bırakılamaz')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, birthDate } = req.body;

        // Email kontrolü
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
        }

        // Şifre hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluşturma
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthDate: new Date(birthDate)
        });

        await user.save();

        // JWT token oluşturma
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'gizlianahtar',
            { expiresIn: '1h' }
        );

        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Admin middleware
const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme token\'ı gerekli' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Geçersiz token' });
    }
};

// Kullanıcının kendi ilanlarını getir
app.get('/api/ads/my-ads', authenticateToken, async (req, res) => {
    try {
        const ads = await Ad.find({ olusturan: req.user.email }).sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Tüm ilanları getir
app.get('/api/ads', async (req, res) => {
    try {
        const ads = await Ad.find().sort({ olusturma_tarihi: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tekil ilan detaylarını getir
app.get('/api/ads/:ilan_no', async (req, res) => {
    try {
        const ad = await Ad.findOne({ ilan_no: req.params.ilan_no });
        if (!ad) {
            return res.status(404).json({ message: 'İlan bulunamadı' });
        }
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// İlan oluşturma
app.post('/api/ads', authenticateToken, async (req, res) => {
    try {
        console.log('İlan oluşturma isteği:', req.body);
        console.log('Kullanıcı bilgileri:', req.user);

        // Kullanıcı bilgilerini veritabanından al
        const userData = await User.findById(req.user.userId).select('firstName lastName email');
        
        if (!userData) {
            return res.status(404).json({ 
                message: 'Kullanıcı bulunamadı',
                error: 'Kullanıcı bilgileri alınamadı'
            });
        }

        const ad = new Ad({
            ...req.body,
            userId: req.user.userId,
            olusturan: userData.email,
            olusturanAd: `${userData.firstName} ${userData.lastName}`
        });

        console.log('Oluşturulan ilan:', ad);

        const savedAd = await ad.save();
        console.log('Kaydedilen ilan:', savedAd);

        res.status(201).json(savedAd);
    } catch (error) {
        console.error('İlan oluşturma hatası:', error);
        res.status(400).json({ 
            message: 'İlan oluşturulurken bir hata oluştu',
            error: error.message 
        });
    }
});

// İlan güncelleme
app.put('/api/ads/:ilan_no', authenticateToken, async (req, res) => {
    try {
        const ad = await Ad.findOne({ ilan_no: req.params.ilan_no });
        if (!ad) {
            return res.status(404).json({ message: 'İlan bulunamadı' });
        }

        // Sadece oluşturan kişi düzenleyebilir
        if (ad.olusturan !== req.user.email) {
            return res.status(403).json({ message: 'Bu ilanı düzenleme yetkiniz yok' });
        }

        const updatedAd = await Ad.findOneAndUpdate(
            { ilan_no: req.params.ilan_no },
            {
                cins: req.body.cins,
                yas: req.body.yas,
                cinsiyet: req.body.cinsiyet,
                saglik_durumu: req.body.saglik_durumu,
                karakter_ozellikleri: req.body.karakter_ozellikleri,
                bulundugu_yer: req.body.bulundugu_yer,
                iletisim_no: req.body.iletisim_no,
                hikaye: req.body.hikaye,
                resim_url: req.body.resim_url
            },
            { new: true }
        );

        res.json(updatedAd);
    } catch (error) {
        console.error('İlan güncelleme hatası:', error);
        res.status(500).json({ message: 'İlan güncellenirken bir hata oluştu' });
    }
});

// İlan silme
app.delete('/api/ads/:ilan_no', authenticateToken, async (req, res) => {
    try {
        const ad = await Ad.findOne({ ilan_no: req.params.ilan_no });
        if (!ad) {
            return res.status(404).json({ message: 'İlan bulunamadı' });
        }

        // Sadece oluşturan kişi silebilir
        if (ad.olusturan !== req.user.email) {
            return res.status(403).json({ message: 'Bu ilanı silme yetkiniz yok' });
        }

        await ad.deleteOne();
        res.json({ message: 'İlan başarıyla silindi' });
    } catch (error) {
        console.error('İlan silme hatası:', error);
        res.status(500).json({ message: 'İlan silinirken bir hata oluştu' });
    }
});

// Login işlemini güncelle
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        // Kullanıcı bilgilerini veritabanından al
        const userData = await User.findById(user._id).select('-password');

        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'pawfinder_gizli_anahtar_123',
            { expiresIn: '24h' }
        );

        // Kullanıcı bilgilerini gönder
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ message: error.message });
    }
});

// Blog API'leri
app.post('/api/blogs', authenticateToken, async (req, res) => {
    try {
        console.log('Blog oluşturma isteği:', req.body);
        
        const { title, description, content, imageUrl } = req.body;
        
        const blog = new Blog({
            title,
            description,
            content,
            imageUrl,
            olusturan: `${req.user.firstName} ${req.user.lastName}`
        });
        
        console.log('Oluşturulan blog:', blog);
        
        const savedBlog = await blog.save();
        console.log('Kaydedilen blog:', savedBlog);
        
        res.status(201).json(savedBlog);
    } catch (error) {
        console.error('Blog oluşturma hatası:', error);
        res.status(500).json({ 
            message: 'Blog oluşturulurken bir hata oluştu',
            error: error.message 
        });
    }
});

app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error('Blog listeleme hatası:', error);
        res.status(500).json({ message: 'Bloglar listelenirken bir hata oluştu' });
    }
});

app.get('/api/blogs/:blogNo', async (req, res) => {
    try {
        const blog = await Blog.findOne({ blogNo: req.params.blogNo });
        if (!blog) {
            return res.status(404).json({ message: 'Blog bulunamadı' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Blog detay hatası:', error);
        res.status(500).json({ message: 'Blog detayı alınırken bir hata oluştu' });
    }
});

// Blog güncelleme
app.put('/api/blogs/:blogNo', authenticateToken, async (req, res) => {
    try {
        const blog = await Blog.findOne({ blogNo: req.params.blogNo });
        if (!blog) {
            return res.status(404).json({ message: 'Blog bulunamadı' });
        }

        // Sadece oluşturan kişi düzenleyebilir
        if (blog.olusturan !== req.user.email) {
            return res.status(403).json({ message: 'Bu blog yazısını düzenleme yetkiniz yok' });
        }

        const updatedBlog = await Blog.findOneAndUpdate(
            { blogNo: req.params.blogNo },
            {
                title: req.body.title,
                description: req.body.description,
                content: req.body.content,
                imageUrl: req.body.imageUrl
            },
            { new: true }
        );

        res.json(updatedBlog);
    } catch (error) {
        console.error('Blog güncelleme hatası:', error);
        res.status(500).json({ message: 'Blog güncellenirken bir hata oluştu' });
    }
});

// Blog silme
app.delete('/api/blogs/:blogNo', authenticateToken, async (req, res) => {
    try {
        const blog = await Blog.findOne({ blogNo: req.params.blogNo });
        if (!blog) {
            return res.status(404).json({ message: 'Blog bulunamadı' });
        }

        // Sadece oluşturan kişi silebilir
        if (blog.olusturan !== req.user.email) {
            return res.status(403).json({ message: 'Bu blog yazısını silme yetkiniz yok' });
        }

        await blog.deleteOne();
        res.json({ message: 'Blog başarıyla silindi' });
    } catch (error) {
        console.error('Blog silme hatası:', error);
        res.status(500).json({ message: 'Blog silinirken bir hata oluştu' });
    }
});

// Kullanıcı güncelleme
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, email, birthDate } = req.body;
        
        // Kullanıcının kendisini veya adminin başka kullanıcıyı güncellemesine izin ver
        if (req.user.userId !== req.params.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Email değişikliği varsa ve başka bir kullanıcı tarafından kullanılıyorsa kontrol et
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
            }
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.birthDate = birthDate ? new Date(birthDate) : user.birthDate;

        await user.save();
        res.json({ message: 'Kullanıcı başarıyla güncellendi', user });
    } catch (error) {
        console.error('Kullanıcı güncelleme hatası:', error);
        res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu' });
    }
});

// Kullanıcı silme
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        // Sadece admin veya kullanıcının kendisi silebilir
        if (req.user.userId !== req.params.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        await user.deleteOne();
        res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu' });
    }
});

// Tüm kullanıcıları getir (Sadece admin erişebilir)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Kullanıcının admin olup olmadığını kontrol et
        const adminUser = await User.findById(req.user.userId);
        if (!adminUser.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        // Tüm kullanıcıları getir (şifre hariç)
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Kullanıcıları getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Kullanıcı yetkilendirme endpoint'i
app.put('/api/users/:userId/authorize', authenticateToken, async (req, res) => {
    try {
        // Admin kontrolü
        const adminUser = await User.findById(req.user.userId);
        if (!adminUser.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }

        const { userId } = req.params;
        const { role } = req.body;

        // Kullanıcıyı bul ve rolünü güncelle
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Admin kullanıcıların rolü değiştirilemez
        if (user.isAdmin) {
            return res.status(403).json({ message: 'Admin kullanıcıların rolü değiştirilemez' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'Kullanıcı rolü başarıyla güncellendi' });
    } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Sunucuyu başlat
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Dökümanı http://localhost:${PORT}/api-docs`);
})