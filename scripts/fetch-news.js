import axios from 'axios';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// 初始化环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '../public/auto-news.json');

// ==========================================
// 1. 初始化与配置 (数据源字典)
// ==========================================

const RSS_SOURCES = [
    {
        vendorName: 'Hugging Face Blog',
        url: 'https://huggingface.co/blog/feed.xml'
    },
    {
        vendorName: 'NVIDIA Developer News',
        url: 'https://developer.nvidia.com/blog/feed/'
    }
];

const API_SOURCES = [
    {
        vendorName: "华为昇腾",
        apiUrl: "https://www.hiascend.com/ascendgateway/ascendservice/home/news?lang=zh&type=1",
        method: "GET",
        dataPath: "data",
        mapping: {
            title: "homeTitle",
            date: "publishTime",
            urlBuilder: (item) => 'https://www.hiascend.com/zh/news/detail/' + item.id
        }
    }
];

// 统一的请求头，模拟真实浏览器
const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

// ==========================================
// 2. 大模型客户端双引擎初始化
// ==========================================

// 主引擎 (Gemini 2.5 Flash)
let geminiClient = null;
if (process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
    console.warn("⚠️ 未配置 GEMINI_API_KEY，主引擎不可用。");
}

// 备引擎 (智谱 GLM-4-Flash)
let zhipuClient = null;
if (process.env.ZHIPU_API_KEY) {
    zhipuClient = new OpenAI({
        apiKey: process.env.ZHIPU_API_KEY,
        baseURL: "https://open.bigmodel.cn/api/paas/v4/"
    });
} else {
    console.warn("⚠️ 未配置 ZHIPU_API_KEY，备用引擎不可用。");
}

const SYSTEM_PROMPT = "你是我司的大模型与多硬件生态监控专家。请阅读以下新闻标题和原始摘要。判断该新闻是否实质性涉及'大模型(LLM)、深度学习框架在特定硬件(GPU/NPU)上的适配、训练优化、推理部署或硬核生态合作'。如果是普通的商业公关稿、线下活动（如训练营、大赛、全国行）或无关更新，严格仅输出单词：REJECT。如果相关，请用不超过30个字的精炼中文总结其核心业务价值。注意：如果输入没有摘要，强行用原标题推测业务价值即可，绝对不准回复'未提供摘要'等聊天内容，直接交出总结或抛出REJECT，输出不得包含任何多余文字。";

// ==========================================
// 3. 核心智能清洗函数 (双模型降级切换容灾)
// ==========================================
async function processWithAI(newsItem) {
    const prompt = `新闻标题：${newsItem.title}\n新闻摘要：${newsItem.summary || ''}`;

    // 【Plan A: Gemini】
    if (geminiClient) {
        try {
            const response = await geminiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_PROMPT
                }
            });
            const text = response.text || '';

            if (text.includes('REJECT')) {
                console.log(`❌ [AI 剔除] ${newsItem.vendor}: ${newsItem.title}`);
                return null;
            } else {
                newsItem.summary = text.replace(/\n/g, ' ').trim();
                console.log(`✅ [AI 提炼] ${newsItem.vendor}: ${newsItem.title}`);
                return newsItem;
            }
        } catch (error) {
            console.warn(`⚠️ [Gemini 限流/异常] 自动切换至智谱 GLM-4-Flash 处理: ${newsItem.title}`);
        }
    }

    // 【Plan B: Zhipu Fallback】
    if (zhipuClient) {
        try {
            const response = await zhipuClient.chat.completions.create({
                model: "glm-4-flash",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ]
            });
            const text = response.choices[0]?.message?.content || '';

            if (text.includes('REJECT')) {
                console.log(`❌ [AI 剔除 (智谱)] ${newsItem.vendor}: ${newsItem.title}`);
                return null;
            } else {
                newsItem.summary = text.replace(/\n/g, ' ').trim();
                console.log(`✅ [AI 提炼 (智谱)] ${newsItem.vendor}: ${newsItem.title}`);
                return newsItem;
            }
        } catch (error) {
            console.error(`❌ [智谱 异常] Plan B 彻底失效，备库同告失败: ${error.message}`);
        }
    }

    // 【Plan C: 彻底兜底】
    newsItem.summary = "暂无智能摘要（双引擎均超时）";
    return newsItem;
}

// ==========================================
// 数据通道处理辅助函数
// ==========================================

function resolveUrl(baseUrl, targetUrl) {
    if (!targetUrl) return '';
    if (targetUrl.startsWith('http')) return targetUrl;
    try {
        const urlObj = new URL(targetUrl, baseUrl);
        return urlObj.href;
    } catch (e) {
        return targetUrl;
    }
}

const parser = new Parser();

// 抓取 RSS 通道
async function fetchRssNews() {
    let results = [];
    for (const config of RSS_SOURCES) {
        try {
            console.log(`[RSS 抓取] 正在处理: ${config.vendorName}`);
            const feed = await parser.parseURL(config.url);

            // 提取前 5-10 条 (统一设为提取前 10 条上限保证覆盖面)
            const items = feed.items.slice(0, 10).map(item => {
                const absoluteUrl = resolveUrl(config.url, item.link);
                return {
                    id: crypto.createHash('md5').update(absoluteUrl || Date.now().toString()).digest('hex'),
                    vendor: config.vendorName,
                    title: item.title,
                    url: absoluteUrl,
                    date: item.isoDate ? new Date(item.isoDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    sourceType: 'RSS',
                    isManual: false,
                    summary: (item.contentSnippet || item.content || '').substring(0, 120) + '...',
                    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
                    link: absoluteUrl
                };
            });
            results = [...results, ...items];
            console.log(`[RSS 抓取] 成功提取 ${items.length} 条来自 ${config.vendorName}`);
        } catch (error) {
            console.error(`[RSS 抓取] 失败 ${config.vendorName}:`, error.message);
        }
    }
    return results;
}

// 抓取 API 通道
async function fetchApiNews() {
    let results = [];
    for (const config of API_SOURCES) {
        try {
            console.log(`[API 抓取] 正在处理: ${config.vendorName}`);

            const customHeaders = { ...REQUEST_HEADERS, ...(config.headers || { 'Referer': 'https://www.hiascend.com/' }) };
            const response = await axios({
                method: config.method || 'GET',
                url: config.apiUrl,
                headers: customHeaders,
                timeout: 10000
            });

            let dataList = response.data;
            if (config.dataPath && dataList[config.dataPath]) {
                dataList = dataList[config.dataPath];
            }

            if (!Array.isArray(dataList)) {
                console.warn(`[API 抓取] 返回格式非数组，跳过 ${config.vendorName}`);
                continue;
            }

            let count = 0;
            // 提取前 10 条
            for (const item of dataList) {
                if (count >= 10) break;

                const titleStr = item[config.mapping.title];
                let dateStr = item[config.mapping.date] || new Date().toISOString().split('T')[0];
                if (dateStr.includes('T')) {
                    dateStr = dateStr.split('T')[0];
                }

                const absoluteUrl = config.mapping.urlBuilder ? config.mapping.urlBuilder(item) : undefined;
                if (!titleStr || !absoluteUrl) continue;

                let imageUrl = item[config.mapping.cover] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop';
                imageUrl = resolveUrl(config.apiUrl, imageUrl);

                results.push({
                    id: crypto.createHash('md5').update(absoluteUrl || Date.now().toString()).digest('hex'),
                    vendor: config.vendorName,
                    title: titleStr,
                    url: absoluteUrl,
                    date: dateStr,
                    sourceType: 'API',
                    isManual: false,
                    imageUrl: imageUrl,
                    summary: item[config.mapping.summary] ? String(item[config.mapping.summary]).substring(0, 120) + '...' : '',
                    link: absoluteUrl
                });
                count++;
            }
            console.log(`[API 抓取] 成功提取 ${count} 条来自 ${config.vendorName}`);
        } catch (error) {
            console.error(`[API 抓取] 失败 ${config.vendorName}:`, error.message);
        }
    }
    return results;
}

// ==========================================
// 4. 整合主干流程 fetchAllNews()
// ==========================================
async function fetchAllNews() {
    console.log("=== 开始获取原始新闻数据 ===");
    const rssNews = await fetchRssNews();
    const apiNews = await fetchApiNews();

    const rawCombinedNews = [...rssNews, ...apiNews];

    // 按日期全局倒序排列
    rawCombinedNews.sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });

    console.log(`\n=== 原始数据合并完成，共计 ${rawCombinedNews.length} 条。开始智能清洗与摘要（双模型容灾） ===\n`);

    const finalNews = [];

    // 串行遍历大模型处理池
    for (const item of rawCombinedNews) {
        const processed = await processWithAI(item);
        if (processed !== null) {
            finalNews.push(processed);
        }
    }

    try {
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(finalNews, null, 2), 'utf-8');
        console.log(`\n🎉 [成功] 已将 ${finalNews.length} 条清洗后的优质新闻写入 ${OUTPUT_PATH} (过滤掉了 ${rawCombinedNews.length - finalNews.length} 条无关废稿)`);
    } catch (err) {
        console.error('\n❌ [严重错误] 写入 JSON 文件失败:', err);
    }
}

// 开始执行
fetchAllNews();
