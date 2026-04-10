import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/api';

// Extract the base URL from API_URL (remove /api if present)
const SOCKET_URL = API_URL.replace('/api', '');

let socket: Socket;

export const initSocket = () => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        (socket as any) = null;
    }
};

/**
 * Join a business room to receive live order/booking notifications
 */
export const joinBusinessRoom = (businessId: string) => {
    const s = getSocket();
    s.emit('join_business', businessId);
};

/**
 * Join a user room to receive personal notifications
 */
export const joinUserRoom = (userId: string) => {
    const s = getSocket();
    s.emit('join_user', userId);
};
