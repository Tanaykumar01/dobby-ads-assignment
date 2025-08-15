import express from 'express';
import { body } from 'express-validator';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadImage, getImages, searchImages, deleteImage } from '../controllers/image.controller.js';
import storage from '../middlewares/multer.middleware.js';
import multer from 'multer';

const upload = multer({ storage });
const router = express.Router();

router.get('/', verifyJWT, getImages);

router.post(
  '/',
  verifyJWT,
  upload.fields([{ name: 'image', maxCount: 10 }]),
  [body('name').isLength({ min: 1 }).trim().escape()],
  uploadImage
);

router.get('/search', verifyJWT, searchImages);

router.delete('/:id', verifyJWT, deleteImage);

export default router;
