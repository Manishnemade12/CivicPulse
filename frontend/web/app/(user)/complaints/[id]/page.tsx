"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Image as ImageIcon, Hash } from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRequireAuth } from "@/lib/useRequireAuth";

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

export default function PublicComplaintDetailPage() {
  const { checking } = useRequireAuth();
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
        const res = await fetch(`/api/public-complaints/${encodeURIComponent(complaintId)}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load: HTTP ${res.status}`);
        }
        const json = await res.json() as ComplaintDetail;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (complaintId) void load();
    return () => { cancelled = true; };
  }, [complaintId]);

  if (checking || loading) {
    return (
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
        <div className="h-6 w-40 rounded-lg animate-shimmer" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
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
      className="max-w-3xl mx-auto pb-12"
    >
      {/* Back nav */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-100 group-hover:bg-indigo-50 shadow-sm transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to All Complaints
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-5 flex items-center gap-3 text-sm text-red-600 font-bold overflow-hidden">
          <span className="text-xl">⚠️</span>
          <div className="truncate">{error}</div>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          {/* Main Card */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
                <div className="space-y-3">
                  <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {data.title}
                  </h1>
                  <StatusBadge status={data.status} size="lg" />
                </div>
              </div>

              <div className="prose prose-slate max-w-none bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {data.description}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Status Timeline */}
            <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-indigo-500" />
                Timeline
              </h2>
              <div className="space-y-6">
                {[
                  {
                    label: "Submission Received",
                    date: data.createdAt,
                    icon: Calendar,
                    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
                    active: true,
                  },
                  {
                    label: "Latest Engagement",
                    date: data.updatedAt,
                    icon: Clock,
                    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    active: data.createdAt !== data.updatedAt,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.color} shrink-0 shadow-sm`}>
                      <item.icon size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-400 font-medium">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Info */}
            <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
              <h2 className="text-lg font-black text-slate-900 mb-6">Reference</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Complaint ID</div>
                  <div className="group relative">
                    <div className="text-xs text-slate-700 font-mono break-all bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-indigo-200 transition-colors">
                      {data.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {data.images?.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-indigo-500" />
                Evidence & Attachments
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {data.images.map((u, i) => (
                  <motion.div
                    key={u}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="w-full h-auto object-contain max-h-[500px] hover:scale-[1.01] transition-transform duration-500" loading="lazy" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
