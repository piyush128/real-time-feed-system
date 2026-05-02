import { Redis } from 'ioredis';

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redisClient.on('connect', () =>{
    console.log('Redis Connected');
})

redisClient.on('error' , (err) => {
    console.error('Error in connecting redis', err);
})


export {redisClient};