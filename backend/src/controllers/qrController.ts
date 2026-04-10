import { Request, Response } from 'express';
import QRCode from 'qrcode';

interface AuthRequest extends Request {
    user?: any;
}

/**
 * Generate a QR code for a specific table or room.
 * The QR code contains a deep link: bookbite://business/:businessId?table=:tableId
 */
export const generateLocationQR = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, locationId, type } = req.query; // type can be 'TABLE' or 'ROOM'

        if (!businessId || !locationId) {
            res.status(400).json({ message: 'businessId and locationId are required' });
            return;
        }

        // Create the deep link URL
        // Example: bookbite://details/123-456?table=A1
        const deepLink = `bookbite://details/${businessId}?l=${locationId}&t=${type || 'TABLE'}`;

        // Generate the QR code as a data URL (Base64)
        const qrDataUrl = await QRCode.toDataURL(deepLink, {
            errorCorrectionLevel: 'H',
            margin: 4,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        res.status(200).json({
            qrCode: qrDataUrl,
            deepLink
        });
    } catch (error) {
        console.error('QR Generation Error:', error);
        res.status(500).json({ message: 'Error generating QR code', error });
    }
};
