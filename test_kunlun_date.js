import axios from 'axios';
import * as cheerio from 'cheerio';

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

const url = 'https://www.kunlunxin.com/news';

async function test() {
    try {
        const response = await axios.get(url, { headers: REQUEST_HEADERS, timeout: 10000 });
        const $ = cheerio.load(response.data);
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/news/')) {
                const title = $(el).text().replace(/\s+/g, ' ').trim();
                const parent1Text = $(el).parent().text().replace(/\s+/g, ' ').trim();
                const parent2Text = $(el).parent().parent().text().replace(/\s+/g, ' ').trim();
                const closestLi = $(el).closest('li,article,div').text().replace(/\s+/g, ' ').trim();

                console.log(`\nLink: ${href}`);
                console.log(`Title: ${title}`);
                console.log(`Parent1: ${parent1Text}`);
                console.log(`Parent2: ${parent2Text}`);
                console.log(`Closest: ${closestLi.substring(0, 100)}...`);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
test();
