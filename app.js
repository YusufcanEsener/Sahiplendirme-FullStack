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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Bağlantısı
mongoose.connect('mongodb://localhost:27017/remzi_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
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

// İlan oluşturma
app.post('/api/ads', isAdmin, async (req, res) => {
    try {
        const ad = new Ad({
            ...req.body,
            olusturan: req.user._id
        });
        await ad.save();
        res.status(201).json(ad);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
app.get('/api/ads/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ message: 'İlan bulunamadı' });
        }
        res.json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'pawfinder_gizli_anahtar_123',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Blog API'leri
app.post('/api/blogs', authenticateToken, async (req, res) => {
    try {
        console.log('Blog oluşturma isteği:', req.body); // Hata ayıklama için

        const { title, description, content, imageUrl } = req.body;
        
        const blog = new Blog({
            title,
            description,
            content,
            imageUrl,
            createdAt: new Date()
        });
        
        console.log('Oluşturulan blog:', blog); // Hata ayıklama için
        
        const savedBlog = await blog.save();
        console.log('Kaydedilen blog:', savedBlog); // Hata ayıklama için
        
        res.status(201).json(savedBlog);
    } catch (error) {
        console.error('Blog oluşturma hatası:', error); // Detaylı hata bilgisi
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});