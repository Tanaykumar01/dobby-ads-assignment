//  Folder Schema  
// { _id, name, userId, parentId, path, createdAt }

import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    path: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
FolderSchema.index({ userId: 1, parentId: 1 });

const Folder = mongoose.model('Folder', FolderSchema);

export default Folder;
