import type { NextFunction, Request, RequestHandler, Response } from 'express';

export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

export const parsePagination = (query: Record<string, unknown>) => {
    const page = Number(query.page);
    const pageSize = Number(query.pageSize);

    if (Number.isFinite(page) && Number.isFinite(pageSize) && page > 0 && pageSize > 0) {
        return {
            enabled: true,
            page,
            pageSize,
            skip: (page - 1) * pageSize,
            take: pageSize
        };
    }

    return { enabled: false };
};

export const parsePathId = (value: unknown) => {
    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0];
    }

    return '';
};
