import axios from 'axios';
import * as cheerio from 'cheerio';

async function testPaddle() {
    try {
        const response = await axios.get('https://news.baidu.com/ns?word=百度飞桨', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const $ = cheerio.load(response.data);
        console.log("Paddle News Baidu links:", $('.result-op.c-container a').length);
        
    } catch (e) {
        console.error(e.message);
    }
}

async function testAscend() {
     try {
        const response = await axios.get('https://news.baidu.com/ns?word=华为昇腾', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const $ = cheerio.load(response.data);
        console.log("Ascend News Baidu links", $('.result-op.c-container a').length);
    } catch (e) {}
}

testPaddle();
testAscend();
