import 'dotenv/config';
import app from './src/app.js';
import { connectProducer } from '../../shared/kafka/producer.js';

const PORT = process.env.PORT || 3000;

async function start() {
    await connectProducer();

    app.listen(PORT, () => {
    console.log(`API Service running on port ${PORT}`);
    });
}

start();