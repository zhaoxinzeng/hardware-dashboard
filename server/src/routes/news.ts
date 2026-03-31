import { Router } from 'express';
import { z } from 'zod';
import { NEWS_TYPE_FROM_INPUT } from '../constants/mappings.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    title: z.string().trim().min(1),
    url: z.string().optional().default(''),
    source: z.string().trim().optional().default('unknown'),
    coverImage: z.string().optional().default(''),
    summary: z.string().optional().default(''),
    publishedDate: z.string().optional().default(''),
    type: z.string().optional().default('manual')
});

const updateSchema = createSchema.partial().extend({
    isDeleted: z.boolean().optional()
});

export const newsRouter = Router();

newsRouter.get('/', asyncHandler(async (req, res) => {
    const includeDeleted = req.query.includeDeleted === 'true';
    const paging = parsePagination(req.query as Record<string, unknown>);
    const where = includeDeleted ? {} : { isDeleted: false };

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.news.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.news.count({ where })
        ]);

        res.json({
            data: items,
            pagination: {
                page: paging.page,
                pageSize: paging.pageSize,
                total
            }
        });
        return;
    }

    const items = await prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    res.json({ data: items });
}));

newsRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);

    const created = await prisma.news.create({
        data: {
            title: payload.title,
            url: payload.url.trim(),
            source: payload.source,
            coverImage: payload.coverImage,
            summary: payload.summary,
            publishedDate: payload.publishedDate,
            type: NEWS_TYPE_FROM_INPUT(payload.type)
        }
    });

    res.status(201).json({ data: created });
}));

newsRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const data: Record<string, unknown> = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.url !== undefined) data.url = payload.url.trim();
    if (payload.source !== undefined) data.source = payload.source;
    if (payload.coverImage !== undefined) data.coverImage = payload.coverImage;
    if (payload.summary !== undefined) data.summary = payload.summary;
    if (payload.publishedDate !== undefined) data.publishedDate = payload.publishedDate;
    if (payload.type !== undefined) data.type = NEWS_TYPE_FROM_INPUT(payload.type);
    if (payload.isDeleted !== undefined) data.isDeleted = payload.isDeleted;

    const updated = await prisma.news.update({
        where: { id },
        data
    });

    res.json({ data: updated });
}));

newsRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.news.update({
        where: { id },
        data: { isDeleted: true }
    });

    res.status(204).send();
}));
