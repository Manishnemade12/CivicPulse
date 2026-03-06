"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { RefreshCw, FileText } from "lucide-react";
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  FunnelIcon,
  InboxIcon,
} from "@heroicons/react/20/solid";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { type AreaDto, type AdminComplaint, formatArea } from "@/lib/types";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAreaId, setFilterAreaId] = useState("");

  // Status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterAreaId) params.set("areaId", filterAreaId);

      const [complaintsRes, areasRes] = await Promise.all([
        fetch(`/api/admin/complaints?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/areas", { cache: "no-store" }), // Fixed: was /api/ref/areas
      ]);

      if (!complaintsRes.ok) throw new Error("Failed to load complaints");
      setComplaints((await complaintsRes.json()) as AdminComplaint[]);

      if (areasRes.ok) setAreas((await areasRes.json()) as AreaDto[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [filterStatus, filterAreaId]);

  async function onUpdateStatus(id: string) {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment: comment.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated!", { description: `Complaint set to ${newStatus}` });
      setUpdatingId(null);
      setNewStatus("");
      setComment("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setUpdating(false);
    }
  }

  const raised = complaints.filter((c) => c.status === "RAISED").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Complaints</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and resolve citizen complaints</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={<InboxIcon className="h-5 w-5" />}
          label="Total"
          value={complaints.length}
          className="bg-slate-900 border-slate-800 [&>div:last-child>div:first-child]:text-white"
        />
        <StatsCard
          icon={<ClockIcon className="h-5 w-5" />}
          label="Raised"
          value={raised}
          className="bg-slate-900 border-slate-800 [&>div:first-child]:bg-amber-500/10 [&>div:first-child]:text-amber-400 [&>div:last-child>div:first-child]:text-white"
        />
        <StatsCard
          icon={<ArrowPathIcon className="h-5 w-5" />}
          label="In Progress"
          value={inProgress}
          className="bg-slate-900 border-slate-800 [&>div:first-child]:bg-sky-500/10 [&>div:first-child]:text-sky-400 [&>div:last-child>div:first-child]:text-white"
        />
        <StatsCard
          icon={<CheckCircleIcon className="h-5 w-5" />}
          label="Resolved"
          value={resolved}
          className="bg-slate-900 border-slate-800 [&>div:first-child]:bg-emerald-500/10 [&>div:first-child]:text-emerald-400 [&>div:last-child>div:first-child]:text-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
          <FunnelIcon className="h-4 w-4" />
          Filters
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white h-9 text-xs w-40"
        >
          <option value="">All Statuses</option>
          <option value="RAISED">Raised</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </Select>
        <Select
          value={filterAreaId}
          onChange={(e) => setFilterAreaId(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white h-9 text-xs w-48"
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{formatArea(a)}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="h-5 w-2/5 rounded-lg bg-slate-800 animate-shimmer" />
              <div className="h-3 w-3/5 rounded-lg bg-slate-800 animate-shimmer" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No complaints found"
          description="Try adjusting your filters to see more results."
        />
      ) : (
        <div className="space-y-3">
          {complaints.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 transition-all hover:border-slate-700 group">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{c.title}</h3>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                      {/* Fixed: now shows real names from backend */}
                      <span>{c.areaName || "—"}</span>
                      <span>•</span>
                      <span>{c.categoryName || "—"}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {updatingId === c.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white h-8 text-xs w-32"
                        >
                          <option value="">Status...</option>
                          <option value="RAISED">Raised</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </Select>
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Comment (optional)"
                          className="h-8 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 w-40"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          loading={updating}
                          onClick={() => void onUpdateStatus(c.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400"
                          onClick={() => { setUpdatingId(null); setNewStatus(""); setComment(""); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setUpdatingId(c.id)}
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
