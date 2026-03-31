import { createServer } from 'vite';

async function test() {
    console.log('1. Starting test script');
    try {
        console.log('2. Calling createServer()');
        const server = await createServer({
            configFile: false,
            server: { host: '0.0.0.0', port: 5173, strictPort: true, watch: { ignored: ['**'] } }
        });
        console.log('3. Server created, calling listen()');
        await server.listen();
        console.log('4. Server listening on port 5173');
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

test();
