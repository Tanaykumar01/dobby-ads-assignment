import express from 'express';
import { body } from 'express-validator';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getFolders, createFolder, deleteFolder } from '../controllers/folder.controller.js';

const router = express.Router();

router.get('/', verifyJWT, getFolders);

router.post(
    '/',
    verifyJWT,
    [body('name').isLength({ min: 1 }).trim().escape()],
    createFolder
);

router.delete('/:id', verifyJWT, deleteFolder);

export default router;



