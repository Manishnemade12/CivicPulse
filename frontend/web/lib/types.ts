// Shared TypeScript types — single source of truth
// Import from here instead of re-declaring in each page.

export type FeedItem = {
    id: string;
    type: string;
    title: string | null;
    content: string;
    mediaUrls?: string[];
    createdAt: string;
    authorName?: string;
    authorId?: string;
    likeCount?: number;
    commentCount?: number;
    likedByMe?: boolean;
};

export type CommentDto = {
    id: string;
    userId: string;
    comment: string;
    createdAt: string;
};

export type MeResponse = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
};

export type AreaDto = {
    id: string;
    city: string;
    zone: string | null;
    ward: string | null;
};

export function formatArea(a: AreaDto): string {
    const parts = [a.city, a.zone, a.ward].filter(Boolean);
    return parts.join(" — ");
}

export type CategoryDto = {
    id: string;
    name: string;
};

export type ComplaintSummary = {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export type ComplaintDetail = {
    id: string;
    title: string;
    description: string;
    status: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
};

export type AdminComplaint = {
    id: string;
    title: string;
    status: string;
    areaId: string;
    areaName: string;
    categoryId: string;
    categoryName: string;
    createdAt: string;
};
