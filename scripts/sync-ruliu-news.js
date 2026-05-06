import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const INBOX_DIR = path.join(PROJECT_ROOT, 'data/ruliu-kb/inbox');
const PROCESSED_DIR = path.join(PROJECT_ROOT, 'data/ruliu-kb/processed');

const args = new Set(process.argv.slice(2));
const shouldBuild = !args.has('--no-build');
const shouldCommit = !args.has('--no-commit');
const shouldPush = shouldCommit && !args.has('--no-push');
const shouldMoveInbox = !args.has('--keep-inbox');

const today = new Date().toISOString().split('T')[0];

const ensureDir = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
};

const run = (command, commandArgs, options = {}) =>
    new Promise((resolve, reject) => {
        console.log(`\n$ ${[command, ...commandArgs].join(' ')}`);
        const child = spawn(command, commandArgs, {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            shell: false,
            ...options
        });

        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} ${commandArgs.join(' ')} exited with code ${code}`));
        });
    });

const runQuiet = (command, commandArgs) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, commandArgs, {
            cwd: PROJECT_ROOT,
            stdio: 'ignore',
            shell: false
        });

        child.on('error', reject);
        child.on('close', (code) => resolve(code ?? 1));
    });

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

const uniqueTargetPath = async (targetPath) => {
    const parsed = path.parse(targetPath);
    let candidate = targetPath;
    let index = 1;

    while (true) {
        try {
            await fs.access(candidate);
            candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
            index += 1;
        } catch {
            return candidate;
        }
    }
};

const moveInboxFilesToProcessed = async (files) => {
    if (!shouldMoveInbox || files.length === 0) {
        return;
    }

    const targetDir = path.join(PROCESSED_DIR, today);
    await ensureDir(targetDir);

    for (const filePath of files) {
        const targetPath = await uniqueTargetPath(path.join(targetDir, path.basename(filePath)));
        await fs.rename(filePath, targetPath);
        console.log(`已清理 inbox：${path.relative(PROJECT_ROOT, filePath)} -> ${path.relative(PROJECT_ROOT, targetPath)}`);
    }
};

const stageDailyOutputs = async () => {
    await run('git', [
        'add',
        '-A',
        '--',
        'public/auto-news.json',
        'data/wechat-news',
        'data/ruliu-kb/raw'
    ]);
};

const hasStagedChanges = async () => {
    const code = await runQuiet('git', ['diff', '--cached', '--quiet']);
    return code !== 0;
};

const main = async () => {
    await ensureDir(INBOX_DIR);
    await ensureDir(PROCESSED_DIR);

    const markdownFiles = await findMarkdownFiles(INBOX_DIR);
    if (markdownFiles.length === 0) {
        console.log(`未发现待处理 Markdown。请先把如流下载的 .md 文件放入：${INBOX_DIR}`);
        return;
    }

    console.log(`发现 ${markdownFiles.length} 个待处理 Markdown：`);
    for (const filePath of markdownFiles) {
        console.log(`- ${path.relative(PROJECT_ROOT, filePath)}`);
    }

    await run('node', ['scripts/import-ruliu-news.js']);
    await moveInboxFilesToProcessed(markdownFiles);

    if (shouldBuild) {
        await run('npm', ['run', 'build']);
    }

    if (!shouldCommit) {
        console.log('\n已跳过 git commit / push。');
        return;
    }

    await stageDailyOutputs();

    if (!(await hasStagedChanges())) {
        console.log('\n没有需要提交的新闻更新。');
        return;
    }

    await run('git', ['commit', '-m', `Auto-update Ruliu hardware news ${today}`]);

    if (shouldPush) {
        await run('git', ['push']);
        console.log('\n已推送到远程仓库。Vercel 会在收到 GitHub 更新后自动重新部署。');
    } else {
        console.log('\n已完成本地提交；因使用 --no-push，未推送到远程仓库。');
    }
};

main().catch((error) => {
    console.error('\n自动同步如流硬件新闻失败：', error.message);
    process.exitCode = 1;
});
