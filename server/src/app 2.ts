import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { HttpError } from './utils/http.js';
import { activitiesRouter } from './routes/activities.js';
import { coursesRouter } from './routes/courses.js';
import { feedbacksRouter } from './routes/feedbacks.js';
import { newsRouter } from './routes/news.js';
import { productsRouter } from './routes/products.js';
import { usersRouter } from './routes/users.js';

const resolveCorsOrigin = () => {
    const configured = process.env.CORS_ORIGIN;
    if (!configured) {
        return true;
    }

    if (configured === '*') {
        return true;
    }
    const values = configured.split(',').map(item => item.trim()).filter(Boolean);
    const expanded = new Set<string>(values);

    for (const value of values) {
        try {
            const url = new URL(value);
            if (url.hostname === 'localhost') {
                expanded.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ''}`);
                expanded.add(`${url.protocol}//0.0.0.0${url.port ? `:${url.port}` : ''}`);
            }
        } catch {
            // Ignore invalid origin format from env.
        }
    }

    return Array.from(expanded);
};

const apiV1 = express.Router();

apiV1.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});
apiV1.use('/news', newsRouter);
apiV1.use('/courses', coursesRouter);
apiV1.use('/activities', activitiesRouter);
apiV1.use('/products', productsRouter);
apiV1.use('/feedbacks', feedbacksRouter);
apiV1.use('/users', usersRouter);

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: resolveCorsOrigin() }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/v1', apiV1);

const resolveFrontendDistDir = () => {
    if (process.env.FRONTEND_DIST_DIR) {
        return path.resolve(process.cwd(), process.env.FRONTEND_DIST_DIR);
    }

    return path.resolve(__dirname, '../../dist');
};

const frontendDistDir = resolveFrontendDistDir();
const frontendIndexPath = path.join(frontendDistDir, 'index.html');
const hasFrontendAssets = existsSync(frontendIndexPath);

if (hasFrontendAssets) {
    app.use(express.static(frontendDistDir));

    app.get(/^(?!\/api\/).*/, (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            next();
            return;
        }

        res.sendFile(frontendIndexPath);
    });
}

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: 'Not Found' });
        return;
    }

    if (!hasFrontendAssets) {
        res.status(404).send('Frontend build not found. Run `npm run build` in project root.');
        return;
    }

    res.status(404).send('Not Found');
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            message: 'Validation failed',
            issues: error.issues
        });
        return;
    }

    if (error instanceof HttpError) {
        res.status(error.status).json({ message: error.message });
        return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Record not found' });
            return;
        }
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
};

app.use(errorHandler);
