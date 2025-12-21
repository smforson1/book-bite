import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaClient } from '@prisma/client';

const expo = new Expo();
const prisma = new PrismaClient();

interface NotificationData {
    userId: string;
    title: string;
    body: string;
    data?: any;
}

export const sendPushNotification = async ({ userId, title, body, data }: NotificationData): Promise<void> => {
    try {
        // Get user's push token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true },
        });

        if (!user || !user.pushToken) {
            console.log(`No push token found for user ${userId}`);
            return;
        }

        // Validate push token
        if (!Expo.isExpoPushToken(user.pushToken)) {
            console.error(`Invalid Expo push token: ${user.pushToken}`);
            return;
        }

        // Create notification message
        const message: ExpoPushMessage = {
            to: user.pushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        // Send notification
        const chunks = expo.chunkPushNotifications([message]);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending notification chunk:', error);
            }
        }

        // Save notification to database
        await prisma.notification.create({
            data: {
                userId,
                title,
                body,
                data: data || {},
            },
        });

        console.log(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

export const sendBulkNotifications = async (notifications: NotificationData[]): Promise<void> => {
    try {
        const messages: ExpoPushMessage[] = [];

        for (const notification of notifications) {
            const user = await prisma.user.findUnique({
                where: { id: notification.userId },
                select: { pushToken: true },
            });

            if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
                messages.push({
                    to: user.pushToken,
                    sound: 'default',
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                });

                // Save to database
                await prisma.notification.create({
                    data: {
                        userId: notification.userId,
                        title: notification.title,
                        body: notification.body,
                        data: notification.data || {},
                    },
                });
            }
        }

        // Send in chunks
        const chunks = expo.chunkPushNotifications(messages);

        for (const chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.error('Error sending bulk notification chunk:', error);
            }
        }

        console.log(`Sent ${messages.length} notifications`);
    } catch (error) {
        console.error('Error in sendBulkNotifications:', error);
    }
};

export const getUserNotifications = async (userId: string, limit: number = 20) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};

export const markNotificationAsRead = async (notificationId: string) => {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });
};
