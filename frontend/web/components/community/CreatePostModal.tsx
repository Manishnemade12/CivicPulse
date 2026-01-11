"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { clientPost } from "@/lib/clientApi";

type CreatePostResponse = {
    id: string;
};

function parseMediaUrls(text: string): string[] {
    return text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function CreatePostModal({ isOpen, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaUrlsText, setMediaUrlsText] = useState("");
    const mediaUrls = useMemo(() => parseMediaUrls(mediaUrlsText), [mediaUrlsText]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            setError("Content is required.");
            return;
        }

        setSubmitting(true);
        try {
            // Using direct fetch as in original page, but clientPost helper would be consistent.
            // Original used fetch directly for better error handling in try/catch block or just preference?
            // Let's use fetch consistent with original page logic but absolute path.
            // Actually, let's use clientPost if possible, but manual fetch is fine too.
            // I'll stick to the fetch pattern from the original page to minimize risk.

            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim() ? title.trim() : null,
                    content: trimmedContent,
                    mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
                }),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Request failed (HTTP ${res.status})`);
            }

            // Reset form
            setTitle("");
            setContent("");
            setMediaUrlsText("");

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create post");
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {error ? <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">{error}</div> : null}

                    <form onSubmit={onSubmit} className="grid gap-5">
                        <FieldLabel label="Title (optional)">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. New park opening"
                                maxLength={200}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                autoFocus
                            />
                        </FieldLabel>

                        <FieldLabel label="Content">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={5}
                                maxLength={5000}
                                className="min-h-[120px] bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </FieldLabel>

                        <FieldLabel label="Media URLs (optional, one per line)">
                            <Textarea
                                value={mediaUrlsText}
                                onChange={(e) => setMediaUrlsText(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                rows={3}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </FieldLabel>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? "Posting…" : "Post"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
