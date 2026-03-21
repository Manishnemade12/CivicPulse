"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  RefreshCw, 
  FileText, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Calendar,
  MapPin,
  Tag,
  ChevronRight,
  MoreVertical,
  X
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Select, Input, Textarea } from "@/components/ui/Field";
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
  const [searchQuery, setSearchQuery] = useState("");

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
        fetch("/api/areas", { cache: "no-store" }),
      ]);

      if (!complaintsRes.ok) throw new Error("Failed to load complaints");
      let data = (await complaintsRes.json()) as AdminComplaint[];
      
      // Local filtering for search
      if (searchQuery) {
        data = data.filter(c => 
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.areaName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setComplaints(data);
      if (areasRes.ok) setAreas((await areasRes.json()) as AreaDto[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [filterStatus, filterAreaId, searchQuery]);

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
      toast.success("Status updated successfully!", { 
        description: `Complaint status changed to ${newStatus.replace('_', ' ')}` 
      });
      setUpdatingId(null);
      setNewStatus("");
      setComment("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  const raised = complaints.filter((c) => c.status === "RAISED").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="relative min-h-[calc(100vh-120px)] animate-fade-in pb-20">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Page Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
            <BarChart3 size={14} />
            Management Dashboard
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Complaints <span className="text-slate-600">Hub</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-lg">
            Monitor and process citizen reports in real-time. High impact issues are prioritized automatically.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Sync Data</span>
          </Button>
          <div className="h-8 w-px bg-slate-800 mx-2" />
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Last Refreshed</div>
            <div className="text-xs font-mono text-slate-400 mt-1">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatsCard
          variant="glass"
          accentColor="indigo"
          icon={<Inbox size={20} />}
          label="Total Reports"
          value={complaints.length}
        />
        <StatsCard
          variant="glass"
          accentColor="amber"
          icon={<Clock size={20} />}
          label="Awaiting Action"
          value={raised}
        />
        <StatsCard
          variant="glass"
          accentColor="sky"
          icon={<RefreshCw size={20} />}
          label="In Resolution"
          value={inProgress}
        />
        <StatsCard
          variant="glass"
          accentColor="emerald"
          icon={<CheckCircle2 size={20} />}
          label="Resolved Cases"
          value={resolved}
        />
      </div>

      {/* Action Bar — Filters & Search */}
      <div className="relative mb-8 p-1 rounded-[22px] bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by title or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent text-white placeholder:text-slate-500 text-sm font-medium outline-none"
            />
          </div>
          
          <div className="hidden lg:block w-px h-8 bg-slate-800" />
          
          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto p-1 py-1.5 lg:p-1">
            <div className="flex items-center gap-2 px-3 text-slate-500 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              <Filter size={14} />
              Filter By
            </div>
            <Select
              variant="dark"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 text-xs w-full sm:w-40 !rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="RAISED">Raised</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </Select>
            <Select
              variant="dark"
              value={filterAreaId}
              onChange={(e) => setFilterAreaId(e.target.value)}
              className="h-10 text-xs w-full sm:w-56 !rounded-xl"
            >
              <option value="">Specific Area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{formatArea(a)}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 p-5 flex items-center gap-4 text-red-200"
        >
          <AlertCircle className="shrink-0" size={20} />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <Button onClick={() => void load()} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">Retry</Button>
        </motion.div>
      )}

      {/* Complaints List */}
      <div className="relative space-y-4">
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20">
            <EmptyState
              icon={<FileText className="h-12 w-12 text-slate-700" />}
              title="No active reports"
              description="Your filters didn't return any results. Try a broader search."
              className="glass-dark border-slate-800/50"
            />
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {complaints.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800/80 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                  {/* Subtle hover accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                    <div className="flex-1 flex gap-5">
                      {/* Status Indicator Bar */}
                      <div className={`w-1.5 rounded-full ${
                        c.status === 'RAISED' ? 'bg-amber-500' :
                        c.status === 'IN_PROGRESS' ? 'bg-sky-500' : 'bg-emerald-500'
                      } shadow-[0_0_10px_currentColor] opacity-60`} />

                      <div className="min-w-0 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-white tracking-tight truncate">{c.title}</h3>
                          <StatusBadge status={c.status} size="sm" mode="glass" />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-600" />
                            <span className="text-slate-300">{c.areaName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-slate-600" />
                            <span className="text-slate-300">{c.categoryName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-600" />
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:min-w-[440px] bg-slate-800/20 p-5 rounded-[2rem] border border-white/5 transition-colors group-hover:bg-slate-800/40">
                      {updatingId === c.id ? (
                        <div className="flex flex-col gap-3 animate-scale-in">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Update Status</div>
                            <Select
                              variant="dark"
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="h-9 text-xs w-40 !rounded-xl"
                            >
                              <option value="">Select...</option>
                              <option value="RAISED">Raised</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                            </Select>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <Textarea
                                variant="dark"
                                rows={3}
                                value={comment}
                                onChange={(e: any) => setComment(e.target.value)}
                                placeholder="Add detailed action note (e.g. 'Technician assigned', 'Waiting for parts')..."
                                className="w-full !rounded-2xl text-xs font-medium leading-relaxed"
                              />
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 pr-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="!h-10 px-4 !rounded-xl text-slate-400 hover:text-slate-300 hover:bg-white/5 font-bold text-[10px] uppercase tracking-wider"
                                onClick={() => { setUpdatingId(null); setNewStatus(""); setComment(""); }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="!h-10 !rounded-xl bg-indigo-600 px-6 font-bold text-[10px] uppercase tracking-widest shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.5)]"
                                loading={updating}
                                onClick={() => void onUpdateStatus(c.id)}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 pl-1">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status Management</div>
                            <div className="text-[10px] text-slate-600 font-medium">Click to update progress</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="!h-11 px-5 font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-2xl group/btn border border-transparent hover:border-indigo-500/20 transition-all"
                            onClick={() => {
                              setUpdatingId(c.id);
                              setNewStatus(c.status);
                            }}
                          >
                            <span>Manage Case</span>
                            <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
