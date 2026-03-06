"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Calendar, Clock, Image as ImageIcon, Hash } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getOrCreateAnonymousUserHash } from "@/lib/anon";
import { clientGet, clientDelete } from "@/lib/clientApi";

type ComplaintDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

export default function ComplaintDetailPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const complaintId = routeParams.id;

  const [data, setData] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const hash = getOrCreateAnonymousUserHash();
        const res = await clientGet<ComplaintDetail>(
          `/api/complaints/${encodeURIComponent(complaintId)}?anonymousUserHash=${encodeURIComponent(hash)}`
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (complaintId) void load();
    return () => { cancelled = true; };
  }, [complaintId]);

  async function onDelete() {
    if (!confirm("Delete this complaint? This cannot be undone.")) return;
    try {
      const hash = getOrCreateAnonymousUserHash();
      await clientDelete(
        `/api/complaints/${encodeURIComponent(complaintId)}?anonymousUserHash=${encodeURIComponent(hash)}`
      );
      toast.success("Complaint deleted");
      router.push("/complaints/my");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (checking || loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-6 w-40 rounded-lg animate-shimmer" />
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
          <div className="h-7 w-3/5 rounded-lg animate-shimmer" />
          <div className="h-4 w-1/3 rounded-lg animate-shimmer" />
          <div className="h-24 w-full rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back nav */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/complaints/my"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Complaints
        </Link>
        <Button variant="danger" size="sm" onClick={() => void onDelete()}>
          <Trash2 size={14} />
          Delete
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {data && (
        <div className="max-w-3xl space-y-6">
          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{data.title}</h1>
                  <div className="mt-2">
                    <StatusBadge status={data.status} />
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                {data.description}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {[
                {
                  label: "Created",
                  date: data.createdAt,
                  icon: Calendar,
                  color: "bg-indigo-100 text-indigo-600",
                  active: true,
                },
                {
                  label: "Last Updated",
                  date: data.updatedAt,
                  icon: Clock,
                  color: "bg-emerald-100 text-emerald-600",
                  active: data.createdAt !== data.updatedAt,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                    <item.icon size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-400">{formatDate(item.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Details</h2>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <Hash size={14} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Complaint ID</div>
                  <div className="text-sm text-slate-700 font-mono break-all">{data.id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {data.images?.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-400" />
                Attached Images
              </h2>
              <div className="grid gap-3">
                {data.images.map((u) => (
                  <div key={u} className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="w-full max-h-80 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
