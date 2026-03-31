import { Router } from 'express';
import { z } from 'zod';
import { COURSE_DIFFICULTY_TO_DB } from '../constants/mappings.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, HttpError, parsePagination, parsePathId } from '../utils/http.js';

const createSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional().default(''),
    url: z.string().optional().default(''),
    duration: z.string().trim().min(1),
    difficulty: z.string().trim().min(1)
});

const updateSchema = createSchema.partial().extend({
    isPinned: z.boolean().optional()
});

const mapDifficultyToDb = (difficulty: string) => {
    const mapped = COURSE_DIFFICULTY_TO_DB[difficulty];
    if (!mapped) {
        throw new HttpError(400, 'Invalid difficulty');
    }
    return mapped;
};

const generateInvalidCourseUrl = () => {
    const random = Math.random().toString(36).slice(2, 7);
    return `https://invalid.local/pending-course-${Date.now()}-${random}`;
};

export const coursesRouter = Router();

coursesRouter.get('/', asyncHandler(async (req, res) => {
    const paging = parsePagination(req.query as Record<string, unknown>);

    if (paging.enabled) {
        const [items, total] = await Promise.all([
            prisma.course.findMany({
                orderBy: { createdAt: 'desc' },
                skip: paging.skip,
                take: paging.take
            }),
            prisma.course.count()
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

    const items = await prisma.course.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: items });
}));

coursesRouter.post('/', asyncHandler(async (req, res) => {
    const payload = createSchema.parse(req.body);

    const created = await prisma.course.create({
        data: {
            title: payload.title,
            description: payload.description,
            url: payload.url.trim() || generateInvalidCourseUrl(),
            duration: payload.duration,
            difficulty: mapDifficultyToDb(payload.difficulty)
        }
    });

    res.status(201).json({ data: created });
}));

coursesRouter.put('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    const payload = updateSchema.parse(req.body);
    const data: Record<string, unknown> = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.url !== undefined) data.url = payload.url.trim() || generateInvalidCourseUrl();
    if (payload.duration !== undefined) data.duration = payload.duration;
    if (payload.difficulty !== undefined) data.difficulty = mapDifficultyToDb(payload.difficulty);
    if (payload.isPinned !== undefined) data.isPinned = payload.isPinned;

    const updated = await prisma.course.update({
        where: { id },
        data
    });

    res.json({ data: updated });
}));

coursesRouter.delete('/:id', asyncHandler(async (req, res) => {
    const id = parsePathId(req.params.id);
    if (!id) {
        throw new HttpError(400, 'Invalid id');
    }

    await prisma.course.delete({ where: { id } });
    res.status(204).send();
}));
