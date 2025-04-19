/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - birthDate
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         birthDate:
 *           type: string
 *           format: date
 *         isAdmin:
 *           type: number
 *           default: 0
 * 
 *     Ad:
 *       type: object
 *       required:
 *         - cins
 *         - yas
 *         - cinsiyet
 *         - saglik_durumu
 *         - karakter_ozellikleri
 *         - bulundugu_yer
 *         - iletisim_no
 *         - hikaye
 *         - resim_url
 *       properties:
 *         cins:
 *           type: string
 *         yas:
 *           type: number
 *         cinsiyet:
 *           type: string
 *           enum: [Erkek, Dişi]
 *         saglik_durumu:
 *           type: string
 *         karakter_ozellikleri:
 *           type: string
 *         bulundugu_yer:
 *           type: string
 *         iletisim_no:
 *           type: string
 *         hikaye:
 *           type: string
 *         resim_url:
 *           type: string
 * 
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - content
 *         - imageUrl
 *       properties:
 *         blogNo:
 *           type: number
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         imageUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Kullanıcı]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz giriş
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Kullanıcı]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Kullanıcı profil bilgilerini getir
 *     tags: [Kullanıcı]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri
 *       401:
 *         description: Yetkilendirme gerekli
 */

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Kullanıcı şifresini değiştir
 *     tags: [Kullanıcı]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Geçersiz giriş
 *       401:
 *         description: Yetkilendirme gerekli
 */

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Yeni ilan oluştur
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ad'
 *     responses:
 *       201:
 *         description: İlan başarıyla oluşturuldu
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Admin yetkisi gerekli
 */

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Tüm ilanları listele
 *     tags: [İlanlar]
 *     responses:
 *       200:
 *         description: İlanlar başarıyla listelendi
 */

/**
 * @swagger
 * /api/ads/{id}:
 *   get:
 *     summary: İlan detaylarını getir
 *     tags: [İlanlar]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: İlan ID
 *     responses:
 *       200:
 *         description: İlan detayları
 *       404:
 *         description: İlan bulunamadı
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Yeni blog yazısı oluştur
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Blog yazısı başarıyla oluşturuldu
 *       401:
 *         description: Yetkilendirme gerekli
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Tüm blog yazılarını listele
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Blog yazıları başarıyla listelendi
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   get:
 *     summary: Blog yazısı detaylarını getir
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog yazısı numarası
 *     responses:
 *       200:
 *         description: Blog yazısı detayları
 *       404:
 *         description: Blog yazısı bulunamadı
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Kullanıcı bilgilerini günceller
 *     tags: [Kullanıcı]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkisiz işlem
 *       404:
 *         description: Kullanıcı bulunamadı
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Kullanıcıyı siler
 *     tags: [Kullanıcı]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkisiz işlem
 *       404:
 *         description: Kullanıcı bulunamadı
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   put:
 *     summary: Blog yazısını günceller
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Blog bulunamadı
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   delete:
 *     summary: Blog yazısını siler
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Blog başarıyla silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Blog bulunamadı
 */

/**
 * @swagger
 * /api/ads/{ilan_no}:
 *   put:
 *     summary: İlan bilgilerini güncelle
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ilan_no
 *         required: true
 *         schema:
 *           type: string
 *         description: İlan numarası
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ad'
 *     responses:
 *       200:
 *         description: İlan başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Admin yetkisi gerekli
 *       404:
 *         description: İlan bulunamadı
 * 
 *   delete:
 *     summary: İlanı sil
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ilan_no
 *         required: true
 *         schema:
 *           type: string
 *         description: İlan numarası
 *     responses:
 *       200:
 *         description: İlan başarıyla silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Admin yetkisi gerekli
 *       404:
 *         description: İlan bulunamadı
 */

/**
 * @swagger
 * /api/ads/my-ads:
 *   get:
 *     summary: Kullanıcının kendi ilanlarını getirir
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İlanlar başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */

/**
 * @swagger
 * /api/ads/{ilan_no}:
 *   put:
 *     summary: Mevcut bir ilanı günceller
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ilan_no
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ad'
 *     responses:
 *       200:
 *         description: İlan başarıyla güncellendi
 *       403:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: İlan bulunamadı
 */

/**
 * @swagger
 * /api/ads/{ilan_no}:
 *   delete:
 *     summary: Bir ilanı siler
 *     tags: [İlanlar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ilan_no
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: İlan başarıyla silindi
 *       403:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: İlan bulunamadı
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Tüm blog yazılarını getirir
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Blog yazıları başarıyla getirildi
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   get:
 *     summary: Belirli bir blog yazısının detaylarını getirir
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog yazısı detayları başarıyla getirildi
 *       404:
 *         description: Blog yazısı bulunamadı
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   put:
 *     summary: Mevcut bir blog yazısını günceller
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog yazısı başarıyla güncellendi
 *       403:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Blog yazısı bulunamadı
 */

/**
 * @swagger
 * /api/blogs/{blogNo}:
 *   delete:
 *     summary: Bir blog yazısını siler
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogNo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog yazısı başarıyla silindi
 *       403:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Blog yazısı bulunamadı
 */ 