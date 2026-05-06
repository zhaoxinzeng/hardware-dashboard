import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const INBOX_DIR = path.join(PROJECT_ROOT, 'data/ruliu-kb/inbox');
const RAW_DIR = path.join(PROJECT_ROOT, 'data/ruliu-kb/raw');
const WECHAT_NEWS_DIR = path.join(PROJECT_ROOT, 'data/wechat-news');
const WECHAT_NEWS_LIBRARY_PATH = path.join(WECHAT_NEWS_DIR, 'articles.json');
const AUTO_NEWS_PATH = path.join(PROJECT_ROOT, 'public/auto-news.json');

const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop';
const DASHBOARD_NEWS_LIMIT = 100;

const ensureDir = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
};

const readJsonArray = async (filePath) => {
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};

const writeJsonArray = async (filePath, data) => {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
};

const md5 = (text) => crypto.createHash('md5').update(text).digest('hex');

const normalizeUrl = (rawUrl) => {
    const trimmed = String(rawUrl || '').trim();
    if (!trimmed) {
        return '';
    }

    // 公众号链接在导出中常见 http://mp.weixin.qq.com，统一成 https，避免公网 HTTPS 页面出现混合内容提示。
    return trimmed.replace(/^http:\/\/mp\.weixin\.qq\.com/i, 'https://mp.weixin.qq.com');
};

const cleanText = (text) => String(text || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const extractReportDate = (content, filePath) => {
    const candidates = [
        content,
        path.basename(filePath)
    ];

    for (const candidate of candidates) {
        const match = String(candidate || '').match(/20\d{2}[-./]\d{1,2}[-./]\d{1,2}/);
        if (match) {
            const [year, month, day] = match[0].replace(/[./]/g, '-').split('-');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }

    return new Date().toISOString().split('T')[0];
};

const findMarkdownFiles = async (dir) => {
    const results = [];

    const walk = async (currentDir) => {
        let entries = [];
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (error) {
            if (error.code === 'ENOENT') {
                return;
            }
            throw error;
        }

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                results.push(fullPath);
            }
        }
    };

    await walk(dir);
    return results.sort();
};

const parseRuliuDailyHardwareNews = (content, filePath) => {
    const reportDate = extractReportDate(content, filePath);
    const headingRegex = /^###\s*文章[^：:\n]*[：:]\s*(.+?)\s*$/gm;
    const matches = [...content.matchAll(headingRegex)];
    const articles = [];
    const failed = [];

    for (let index = 0; index < matches.length; index++) {
        const match = matches[index];
        const title = cleanText(match[1]);
        const blockStart = match.index ?? 0;
        const blockEnd = index + 1 < matches.length ? matches[index + 1].index : content.length;
        const block = content.slice(blockStart, blockEnd);

        const summaryMatch = block.match(/>\s*\*\*摘要\*\*[：:]\s*([\s\S]*?)(?=\n\s*-\s*作者[：:]|\n\s*-\s*原文链接[：:]|\n---|\n###|$)/);
        const authorMatch = block.match(/-\s*作者[：:]\s*(.+)/);
        const urlMatch = block.match(/-\s*原文链接[：:]\s*(\S+)/);

        const url = normalizeUrl(urlMatch?.[1]);
        if (!title || !url) {
            failed.push({
                title,
                reason: !title ? '缺少文章标题' : '缺少原文链接',
                file: filePath
            });
            continue;
        }

        const vendor = cleanText(authorMatch?.[1]) || '如流知识库';
        const summary = cleanText(summaryMatch?.[1]);
        const id = md5(url);

        articles.push({
            id,
            vendor,
            title,
            url,
            date: reportDate,
            sourceType: 'WeChat',
            isManual: false,
            summary,
            imageUrl: DEFAULT_IMAGE_URL,
            link: url,
            sourceFile: path.basename(filePath),
            importedAt: new Date().toISOString()
        });
    }

    return { reportDate, articles, failed };
};

const mergeById = (existing, incoming) => {
    const byId = new Map();

    for (const item of existing) {
        if (item?.id) {
            byId.set(item.id, item);
        }
    }

    for (const item of incoming) {
        const current = byId.get(item.id);
        byId.set(item.id, {
            ...(current || {}),
            ...item,
            // 保持幂等：同一篇文章重复导入时，不因为导入时间变化产生无意义 diff。
            importedAt: current?.importedAt || item.importedAt,
            // 如果后续你在 articles.json 中手动替换过封面图，新的默认图不会覆盖它。
            imageUrl:
                current?.imageUrl && item.imageUrl === DEFAULT_IMAGE_URL
                    ? current.imageUrl
                    : item.imageUrl
        });
    }

    return [...byId.values()].sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });
};

const archiveSourceFile = async (filePath, reportDate) => {
    const targetDir = path.join(RAW_DIR, reportDate);
    await ensureDir(targetDir);
    const targetPath = path.join(targetDir, path.basename(filePath));
    await fs.copyFile(filePath, targetPath);
    return targetPath;
};

const main = async () => {
    await ensureDir(INBOX_DIR);
    await ensureDir(RAW_DIR);
    await ensureDir(WECHAT_NEWS_DIR);

    const argFiles = process.argv.slice(2).filter((item) => !item.startsWith('-'));
    const sourceFiles = argFiles.length > 0
        ? argFiles.map((item) => path.resolve(process.cwd(), item))
        : await findMarkdownFiles(INBOX_DIR);

    if (sourceFiles.length === 0) {
        console.log(`未找到待导入 Markdown。请将如流下载文件放到 ${INBOX_DIR}，或执行：npm run import:ruliu-news -- /path/to/file.md`);
        return;
    }

    const importedArticles = [];
    const failedItems = [];

    for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        const { reportDate, articles, failed } = parseRuliuDailyHardwareNews(content, filePath);
        const archivedPath = await archiveSourceFile(filePath, reportDate);

        const archivedRelativePath = path.relative(PROJECT_ROOT, archivedPath);
        importedArticles.push(...articles.map((item) => ({
            ...item,
            sourceFile: archivedRelativePath,
            archivedFile: archivedRelativePath
        })));
        failedItems.push(...failed);

        console.log(`已解析 ${path.basename(filePath)}：${articles.length} 条文章，归档到 ${path.relative(PROJECT_ROOT, archivedPath)}`);
    }

    const existingWechatArticles = await readJsonArray(WECHAT_NEWS_LIBRARY_PATH);
    const mergedWechatArticles = mergeById(existingWechatArticles, importedArticles);
    await writeJsonArray(WECHAT_NEWS_LIBRARY_PATH, mergedWechatArticles);

    const existingAutoNews = await readJsonArray(AUTO_NEWS_PATH);
    const mergedAutoNews = mergeById(existingAutoNews, importedArticles).slice(0, DASHBOARD_NEWS_LIMIT);
    await writeJsonArray(AUTO_NEWS_PATH, mergedAutoNews);

    if (failedItems.length > 0) {
        const failedPath = path.join(WECHAT_NEWS_DIR, 'failed.json');
        await writeJsonArray(failedPath, failedItems);
        console.warn(`有 ${failedItems.length} 条内容解析失败，详情见 ${path.relative(PROJECT_ROOT, failedPath)}`);
    }

    console.log(`导入完成：本次新增/更新 ${importedArticles.length} 条；本地公众号新闻库共 ${mergedWechatArticles.length} 条；看板新闻共 ${mergedAutoNews.length} 条。`);
};

main().catch((error) => {
    console.error('导入如流硬件新闻失败：', error);
    process.exitCode = 1;
});
