import { Router } from 'express';
import { FeedbackType } from '@prisma/client';
import { z } from 'zod';
import { FEEDBACK_TYPE_FROM_INPUT } from '../constants/mappings.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    model: z.string().trim().min(1),
    hardware: z.string().trim().min(1),
    type: z.string().optional(),
    description: z.string().trim().min(1)
});

const updateSchema = z.object({
    model: z.string().trim().min(1).optional(),
    hardware: z.string().trim().min(1).optional(),
    type: z.string().optional(),
    description: z.string().trim().min(1).optional()
});

export const feedbacksRouter = Router();

feedbacksRouter.get('/', asyncHandler(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, unknown>);

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.feedback.findMany({
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.feedback.count()
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

    const items = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: items });
}));

feedbacksRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.feedback.create({
        data: {
            model: payload.model,
            hardware: payload.hardware,
            type: FEEDBACK_TYPE_FROM_INPUT(payload.type),
            description: payload.description
        }
    });

    res.status(201).json({ data: created });
}));

feedbacksRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const data: {
        model?: string;
        hardware?: string;
        type?: FeedbackType;
        description?: string;
    } = {};

    if (payload.model !== undefined) data.model = payload.model;
    if (payload.hardware !== undefined) data.hardware = payload.hardware;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.type !== undefined) data.type = FEEDBACK_TYPE_FROM_INPUT(payload.type);

    const updated = await prisma.feedback.update({
        where: { id },
        data
    });
    res.json({ data: updated });
}));

feedbacksRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.feedback.delete({ where: { id } });
    res.status(204).send();
}));
