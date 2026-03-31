console.log('1. Loading dotenv');
import dotenv from 'dotenv';
console.log('2. Loading app');
import { app } from './app.js';
console.log('3. Loading prisma');
import { prisma } from './lib/prisma.js';

console.log('4. Calling dotenv.config()');
dotenv.config();


console.log('5. Resolving port');
const port = Number(process.env.PORT ?? 4000);

console.log('6. Calling app.listen');
const server = app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});
console.log('7. app.listen returned');

const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
};

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});
