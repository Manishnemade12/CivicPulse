"use client";

import { useMemo, useState } from "react";
import { X, Send, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

function parseMediaUrls(text: string): string[] {
    return text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

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
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "content-type": "application/json" },
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

            setTitle("");
            setContent("");
            setMediaUrlsText("");

            toast.success("Post created!", { description: "Your post is now visible in the community feed." });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create post");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200/80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Create Post</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Share with the community</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {error ? (
                                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium animate-slide-down">
                                    {error}
                                </div>
                            ) : null}

                            <form onSubmit={onSubmit} className="grid gap-5">
                                <FieldLabel label="Title" hint="Optional">
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Give your post a title..."
                                        maxLength={200}
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
                                        className="min-h-[120px]"
                                    />
                                    <div className="text-right text-xs text-slate-400 mt-1">
                                        {content.length}/5000
                                    </div>
                                </FieldLabel>

                                <FieldLabel label="Media URLs" hint="Optional, one per line">
                                    <Textarea
                                        value={mediaUrlsText}
                                        onChange={(e) => setMediaUrlsText(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        rows={2}
                                    />
                                </FieldLabel>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Image size={16} />
                                        <span className="text-xs font-medium">{mediaUrls.length} media attached</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" onClick={onClose} disabled={submitting}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="gradient" loading={submitting}>
                                            <Send size={15} />
                                            {submitting ? "Posting…" : "Post"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
