import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    title: z.string().trim().min(1),
    dateMonth: z.string().trim().min(1),
    dateDay: z.string().trim().min(1),
    location: z.string().trim().min(1),
    formatTag: z.string().trim().min(1),
    url: z.string().optional().default('')
});

const updateSchema = createSchema.partial().extend({
    isPinned: z.boolean().optional()
});

const generateInvalidActivityUrl = () => {
    const random = Math.random().toString(36).slice(2, 7);
    return `https://invalid.local/pending-activity-${Date.now()}-${random}`;
};

export const activitiesRouter = Router();

activitiesRouter.get('/', asyncHandler(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, unknown>);

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.activity.findMany({
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.activity.count()
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

    const items = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: items });
}));

activitiesRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.activity.create({
        data: {
            ...payload,
            url: payload.url.trim() || generateInvalidActivityUrl()
        }
    });
    res.status(201).json({ data: created });
}));

activitiesRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const data: Record<string, unknown> = { ...payload };
    if (payload.url !== undefined) {
        data.url = payload.url.trim() || generateInvalidActivityUrl();
    }

    const updated = await prisma.activity.update({
        where: { id },
        data
    });
    res.json({ data: updated });
}));

activitiesRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.activity.delete({ where: { id } });
    res.status(204).send();
}));
