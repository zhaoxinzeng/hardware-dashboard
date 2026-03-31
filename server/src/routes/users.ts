import { Router } from 'express';
import { z } from 'zod';
import { USER_ROLE_FROM_INPUT } from '../constants/mappings.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    username: z.string().trim().min(1),
    passwordHash: z.string().trim().min(1),
    role: z.string().optional().default('USER')
});

const updateSchema = createSchema.partial();

export const usersRouter = Router();

usersRouter.get('/', asyncHandler(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, unknown>);

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.user.count()
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

    const items = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: items });
}));

usersRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.user.create({
        data: {
            username: payload.username,
            passwordHash: payload.passwordHash,
            role: USER_ROLE_FROM_INPUT(payload.role)
        }
    });
    res.status(201).json({ data: created });
}));

usersRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const data: Record<string, unknown> = {};

    if (payload.username !== undefined) data.username = payload.username;
    if (payload.passwordHash !== undefined) data.passwordHash = payload.passwordHash;
    if (payload.role !== undefined) data.role = USER_ROLE_FROM_INPUT(payload.role);

    const updated = await prisma.user.update({
        where: { id },
        data
    });
    res.json({ data: updated });
}));

usersRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
}));
