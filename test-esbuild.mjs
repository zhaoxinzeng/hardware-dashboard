import * as esbuild from 'esbuild';

async function test() {
    console.log('1. Starting esbuild JS API test');
    try {
        const result = await esbuild.transform('let x = 1;', { loader: 'ts' });
        console.log('2. Success!', result.code);
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

test();
