"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Trash2, Eye, FileText, Clock, PlayCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getOrCreateAnonymousUserHash } from "@/lib/anon";
import { clientGet, clientDelete } from "@/lib/clientApi";

type Complaint = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function MyComplaintsPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const hash = getOrCreateAnonymousUserHash();
      const data = await clientGet<Complaint[]>(`/api/complaints/my?anonymousUserHash=${encodeURIComponent(hash)}`);
      setComplaints(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void load();
  }, [checking]);

  async function onDelete(id: string) {
    if (!confirm("Delete this complaint? This action cannot be undone.")) return;
    try {
      const hash = getOrCreateAnonymousUserHash();
      await clientDelete(`/api/complaints/${encodeURIComponent(id)}?anonymousUserHash=${encodeURIComponent(hash)}`);
      toast.success("Complaint deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const groupedComplaints = useMemo(() => {
    return {
      pending: complaints.filter(c => c.status === "RAISED"),
      inProgress: complaints.filter(c => c.status === "IN_PROGRESS"),
      completed: complaints.filter(c => c.status === "RESOLVED"),
    };
  }, [complaints]);

  if (checking) return null;

  const renderSection = (title: string, icon: React.ReactNode, list: Complaint[], color: string) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
            {icon}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {list.length}
          </span>
        </div>
        <div className="space-y-3">
          {list.map((c, i) => (
            <motion.div
              key={c.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">{c.title}</h3>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-slate-400 font-medium">
                      ID: {c.id.slice(0, 8)}… · {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/complaints/my/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => void onDelete(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Complaints</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your submitted complaints</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => router.push("/complaints/new")}>
          <Plus size={14} />
          Raise Complaint
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonList count={4} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No complaints yet"
          description="You haven't submitted any complaints. Report an issue to get started!"
          action="Raise a Complaint"
          onAction={() => router.push("/complaints/new")}
        />
      ) : (
        <>
          {renderSection(
            "In Progress",
            <PlayCircle size={18} className="text-blue-500" />,
            groupedComplaints.inProgress,
            "bg-blue-500"
          )}
          {renderSection(
            "Pending",
            <Clock size={18} className="text-amber-500" />,
            groupedComplaints.pending,
            "bg-amber-500"
          )}
          {renderSection(
            "Completed",
            <CheckCircle2 size={18} className="text-emerald-500" />,
            groupedComplaints.completed,
            "bg-emerald-500"
          )}

          {complaints.length > 0 &&
            groupedComplaints.pending.length === 0 &&
            groupedComplaints.inProgress.length === 0 &&
            groupedComplaints.completed.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">All complaints are processed.</p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
