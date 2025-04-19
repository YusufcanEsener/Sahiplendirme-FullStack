import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default : 'user',
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema); 