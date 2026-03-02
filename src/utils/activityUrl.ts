export const generateInvalidActivityUrl = () => {
    const random = Math.random().toString(36).slice(2, 9);
    return `https://invalid.local/pending-activity-${Date.now()}-${random}`;
};

export const getSafeActivityUrl = (url: string, fallbackId?: string) => {
    const normalized = url.trim();
    if (normalized && normalized !== '#') {
        return normalized;
    }

    if (fallbackId) {
        return `https://invalid.local/pending-activity-${fallbackId}`;
    }

    return generateInvalidActivityUrl();
};
