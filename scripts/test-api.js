import axios from 'axios';

const apiUrl = "https://www.hiascend.com/ascendgateway/ascendservice/home/news?lang=zh&type=1";

async function testApi() {
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log("Status:", response.status);
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            console.log("Success! Extracted", response.data.data.length, "items.");
            console.log("Sample 1st item keys:", Object.keys(response.data.data[0]));
            console.log("Sample 1st item id:", response.data.data[0].id);
        } else {
             console.log("Data structure:", Object.keys(response.data));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testApi();
