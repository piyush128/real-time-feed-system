import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

async function start() {
    app.listen(PORT, () => {
    console.log(`API Service running on port ${PORT}`);
    });
}

start();