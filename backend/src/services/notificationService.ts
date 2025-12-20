import axios from 'axios';

interface PushMessage {
    to: string | string[];
    sound?: string;
    title: string;
    body: string;
    data?: any;
}

export const sendPushNotification = async (expoPushToken: string | string[], title: string, body: string, data?: any) => {
    const message: PushMessage = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    try {
        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });
        console.log(`Notification sent to ${expoPushToken}: ${title} - ${body}`);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};
