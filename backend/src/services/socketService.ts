import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: '*', // Allow all origins for development
            methods: ['GET', 'POST'],
        },
    });

    console.log('Socket.io initialized');

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Join a room based on business ID (for managers/kitchens)
        socket.on('join_business', (businessId: string) => {
            socket.join(businessId);
            console.log(`Client ${socket.id} joined business room: ${businessId}`);
        });

        // Join a room for a specific user (for customer notifications)
        socket.on('join_user', (userId: string) => {
            socket.join(userId);
            console.log(`Client ${socket.id} joined user room: ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Helper to emit events to specific rooms
 */
export const emitToRoom = (room: string, event: string, data: any) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};
