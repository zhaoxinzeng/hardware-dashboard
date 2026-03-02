export const generateInvalidCourseUrl = () => {
    const random = Math.random().toString(36).slice(2, 9);
    return `https://invalid.local/pending-course-${Date.now()}-${random}`;
};

export const getSafeCourseUrl = (url: string, fallbackId?: string) => {
    const normalized = url.trim();
    if (normalized && normalized !== '#') {
        return normalized;
    }

    if (fallbackId) {
        return `https://invalid.local/pending-course-${fallbackId}`;
    }

    return generateInvalidCourseUrl();
};
