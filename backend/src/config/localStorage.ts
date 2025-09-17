import path from 'path';
import fs from 'fs';
import { logger } from '@/utils/logger';

export const saveImageLocally = async (
    file: Express.Multer.File,
    folder: string = 'general'
): Promise<string> => {
    try {
        // Create folder if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        const filename = `${timestamp}_${randomString}${extension}`;

        const filePath = path.join(uploadDir, filename);

        // Move file from temp location to permanent location
        fs.renameSync(file.path, filePath);

        // Return URL path (relative to server)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const imageUrl = `${baseUrl}/uploads/${folder}/${filename}`;

        logger.info(`Image saved locally: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        logger.error('Local storage error:', error);
        throw new Error('Failed to save image locally');
    }
};

export const saveMultipleImagesLocally = async (
    files: Express.Multer.File[],
    folder: string = 'general'
): Promise<string[]> => {
    try {
        const savePromises = files.map(file => saveImageLocally(file, folder));
        const urls = await Promise.all(savePromises);
        return urls;
    } catch (error) {
        logger.error('Multiple images local storage error:', error);
        throw new Error('Failed to save images locally');
    }
};