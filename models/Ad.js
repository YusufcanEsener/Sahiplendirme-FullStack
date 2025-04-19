import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    ilan_no: {
        type: Number,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cins: {
        type: String,
        required: true
    },
    yas: {
        type: Number,
        required: true
    },
    cinsiyet: {
        type: String,
        enum: ['Erkek', 'Dişi'],
        required: true
    },
    saglik_durumu: {
        type: String,
        required: true
    },
    karakter_ozellikleri: {
        type: String,
        required: true
    },
    bulundugu_yer: {
        type: String,
        required: true
    },
    iletisim_no: {
        type: String,
        required: true
    },
    hikaye: {
        type: String,
        required: true
    },
    resim_url: {
        type: String,
        required: true
    },
    olusturan: {
        type: String,
        required: true
    },
    olusturanAd: {
        type: String,
        required: true
    },
    olusturma_tarihi: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// İlan numarasını otomatik artırmak için middleware
adSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastAd = await this.constructor.findOne({}, {}, { sort: { 'ilan_no': -1 } });
            this.ilan_no = lastAd ? lastAd.ilan_no + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Ad = mongoose.model('Ad', adSchema);
export default Ad; 