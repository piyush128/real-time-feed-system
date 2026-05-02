import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'api-service',
    brokers: [process.env.KAFKA_BROKER]
})

const producer = kafka.producer();

export async function connectProducer() {
    await producer.connect();
}

export async function publishEvent(topic, message) {
    await producer.send({
        topic,
        messages: [{
            key: String(message.userId),
            value: JSON.stringify(message),
        }]
    })
}