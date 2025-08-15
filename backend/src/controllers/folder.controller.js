import { validationResult } from 'express-validator';
import Folder from '../models/folder.model.js';
import Image from '../models/image.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get folders in a directory
const getFolders = asyncHandler(async (req, res) => {
    const { parentId } = req.query;

    const folders = await Folder.find({
      userId: req.user._id,
      parentId: parentId || null
    }).sort({ name: 1 });

    if (!folders){
      throw new ApiError(404, "No folders found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            folders,
            "Folders retrieved successfully"
        )
    );
});

// Create new folder
const createFolder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation error", errors.array());
  }
  
  const { name, parentId } = req.body;
  
  // Check if folder with same name exists in the same directory
  const existingFolder = await Folder.findOne({
    userId: req.user._id,
    name,
    parentId: parentId || null
  });
  
  if (existingFolder) {
    throw new ApiError(409, "Folder with this name already exists in the same directory");
  }

    // Build folder path
    let path = name;
    if (parentId) {
      const parentFolder = await Folder.findOne({
        _id: parentId,
        userId: req.user._id
      });
      if (!parentFolder) {
        throw new ApiError(404, "Parent folder not found");
      }
      // Replace spaces with dashes in the folder name
      const sanitizedName = name.trim().replace(/\s+/g, '-').toLowerCase();
      path = parentFolder.path ? `${parentFolder.path}/${sanitizedName}` : sanitizedName;
    }

    const folder = new Folder({
      name,
      userId: req.user._id,
      parentId: parentId || null,
      path
    });

    await folder.save();
    return res.status(201).json(new ApiResponse(201, folder, "Folder created successfully"));
});

// Delete folder and all its contents
const deleteFolder = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      throw new ApiError(404, "Folder not found");
    }

    // Recursive function to get all descendant folders
    const getAllDescendants = async (folderId) => {
      const children = await Folder.find({ parentId: folderId, userId: req.user._id });
      let allDescendants = [...children];

      for (const child of children) {
        const childDescendants = await getAllDescendants(child._id);
        allDescendants = [...allDescendants, ...childDescendants];
      }

      return allDescendants;
    };

    const descendantFolders = await getAllDescendants(folder._id);
    const folderIds = [folder._id, ...descendantFolders.map(f => f._id)];

    // Delete all images in these folders
    await Image.deleteMany({
      userId: req.user._id,
      folderId: { $in: folderIds }
    });

    // Delete all folders
    await Folder.deleteMany({
      _id: { $in: folderIds },
      userId: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, null, "Folder and its contents deleted successfully"));
});

export { getFolders, createFolder, deleteFolder };