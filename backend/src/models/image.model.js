// Image Schema
// { _id, name, filename, url, userId, folderId, size ,mimetype }

import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
ImageSchema.index({ userId: 1, folderId: 1 });
ImageSchema.index({ userId: 1, name: 'text' });

const Image = mongoose.model('Image', ImageSchema);

export default Image;