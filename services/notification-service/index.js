import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Kafka } from 'kafkajs';
import pool from '../../shared/db/index.js';

const httpServer = createServer();
const io = new Server(httpServer);

const onlineUsers = new Map();

io.on('connection', (socket) => {
    try {
        const token = socket.handshake.query.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        onlineUsers.set(decoded.user_id, socket.id);

        socket.on('disconnect', () => {
            onlineUsers.delete(decoded.user_id);
        });

    } catch (error) {
        socket.disconnect();
    }  
})

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({
    groupId: 'notification-service-group'
})

await consumer.connect();
await consumer.subscribe({
    topic: 'post_created',
    fromBeginning: true
})

await consumer.run({
    eachMessage: async ({message}) => {
        const { userId } = JSON.parse(message.value.toString());
        const result = await pool.query(`select follower_id from followers where following_id = $1 and status = 'accepted'`, [userId]);
        const followers = result.rows;
        for(const follower of followers){
            if(onlineUsers.has(follower.follower_id)){
                const socketId = onlineUsers.get(follower.follower_id);
                io.to(socketId).emit('notification', {
                    message: `New Post from user ${userId}`
                })
            }
        }
    }
})


const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));

