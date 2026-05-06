import 'dotenv/config';
import { Kafka } from "kafkajs";
import pool from '../../shared/db/index.js';
import { redisClient } from '../../shared/redis/index.js';

const kafka = new Kafka({
    clientId: 'feed-service',
    brokers: [process.env.KAFKA_BROKER]
})

const consumer = kafka.consumer({ groupId: 'feed-service-group' });

export async function connectConsumer() {
    await consumer.connect();
}

export async function consumeEvent(topic) {
    await consumer.subscribe({
        topic: topic,
        fromBeginning: true
    })

    await consumer.run({
        eachMessage: async ({message}) => {
            const { userId, postId } = JSON.parse(message.value.toString());

            const isCelebrity = await pool.query('select is_celebrity from users where user_id = $1', [userId]);
            if(isCelebrity.rows[0].is_celebrity){
                console.log('User is celebrity, skipping fanout');
                return;
            }

            const { rows: followers } = await pool.query(
                'SELECT follower_id FROM followers WHERE following_id = $1 AND status = $2',
                [userId, 'accepted']
            );
            
            for (const follower of followers) {
                await pool.query(
                'INSERT INTO feed (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [follower.follower_id, postId]
                );
                const followerId = follower.follower_id;
                await redisClient.del(`feed:${followerId}`);
            }
        }
    })
}

async function start() {
    await connectConsumer();
    await consumeEvent('post_created');
}
  
start();
