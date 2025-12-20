import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Request, Response } from 'express';

const router = express.Router();

// Configure Multer (Using memory storage for easy Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert buffer to base64
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'book-bite',
        });

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

export default router;
