export interface HardwareProduct {
    id: string;
    title: string;
    subtitle: string;
    vendorTag: string;
    logoDataUrl: string;
    features: string[];
    isFeatured: boolean;
    createdAt: number;
}

export interface CreateHardwareProductInput {
    title: string;
    subtitle: string;
    vendorTag: string;
    logoDataUrl: string;
    features: string[];
    isFeatured: boolean;
}
