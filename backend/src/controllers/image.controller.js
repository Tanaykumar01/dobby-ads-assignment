import { validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Image from '../models/image.model.js';
import Folder from '../models/folder.model.js';
import { uploadResult } from '../utils/cloudinary.js';

// Get images in a folder
const getImages = asyncHandler(async (req, res) => {
    const { folderId } = req.query;
    const images = await Image.find({
      userId: req.user._id,
      folderId: folderId || null
    }).sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(
            200,
            images,
            "Images retrieved successfully"
        )
    );
});

// Upload image
const uploadImage = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation error", errors.array());
    }

    if (!req.files?.image) {
      throw new ApiError(400, "Image file is required");
    }

    const { name, folderId } = req.body;

    // Verify folder exists if folderId is provided
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id
      });
      if (!folder) {
        throw new ApiError(404, "Folder not found");
      }
    }
    const imageMetadata = await uploadResult(req.files?.image[0]?.path);
    const imageUrl = imageMetadata ? imageMetadata.secure_url : null;
    
    const image = new Image({
      name,
      filename: req.files?.image[0]?.originalname,
      url: imageUrl,
      userId: req.user._id,
      folderId: folderId || null,
      size: req.files?.image[0]?.size,
      mimetype: req.files?.image[0]?.mimetype
    });

    await image.save();
    return res.status(201).json(new ApiResponse(
        201,
        image,
        "Image uploaded successfully"
    ));
});

// Search images by name
const searchImages = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
      throw new ApiError(400, "Search query is required");
    }

    const images = await Image.find({
      userId: req.user._id,
      name: { $regex: q, $options: 'i' }
    }).populate('folderId', 'name path').sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            images,
            "Images searched successfully"
        )
    );
});

// Delete image
const deleteImage = asyncHandler(async (req, res) => {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!image) {
      throw new ApiError(404, "Image not found");
    }

    const urlParts = image.url.split("/");
    const fileName = urlParts[urlParts.length - 1]; 
    const publicId = fileName.split(".")[0];

    try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
    }

    // Delete from MongoDB
    await Image.findByIdAndDelete(image._id);

    return res.status(200).json(new ApiResponse(
      200,
      null,
      "image deleted succesfully"
    ));
});

export { getImages, uploadImage, searchImages, deleteImage };