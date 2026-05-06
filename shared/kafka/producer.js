import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'api-service',
    brokers: [process.env.KAFKA_BROKER],
    retry: {
        retries: 10,
        initialRetryTime: 3000,
    }
});


const producer = kafka.producer();

let isConnected = false;

export async function connectProducer() {
    await producer.connect();
    isConnected = true;
}

export async function publishEvent(topic, message) {
    if (!isConnected) {
        await producer.connect();
        isConnected = true;
    }
    await producer.send({
        topic,
        messages: [{
            key: String(message.userId),
            value: JSON.stringify(message),
        }]
    })
}