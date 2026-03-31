import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    title: z.string().trim().min(1),
    subtitle: z.string().trim().min(1),
    vendorTag: z.string().trim().min(1),
    logoDataUrl: z.string().optional().default(''),
    features: z.array(z.string().trim().min(1)).min(1),
    isFeatured: z.boolean().optional().default(false)
});

const updateSchema = createSchema.partial();

export const productsRouter = Router();

productsRouter.get('/', asyncHandler(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, unknown>);

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.hardwareProduct.findMany({
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.hardwareProduct.count()
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

    const items = await prisma.hardwareProduct.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: items });
}));

productsRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);
    const created = await prisma.hardwareProduct.create({
        data: {
            ...payload,
            features: payload.features
        }
    });
    res.status(201).json({ data: created });
}));

productsRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const updated = await prisma.hardwareProduct.update({
        where: { id },
        data: payload
    });
    res.json({ data: updated });
}));

productsRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.hardwareProduct.delete({ where: { id } });
    res.status(204).send();
}));
