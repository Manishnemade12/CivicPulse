"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, PlayCircle, CheckCircle2, Eye, FileText, Search, MapPin, Tag } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useRequireAuth } from "@/lib/useRequireAuth";

type Complaint = {
  id: string;
  title: string;
  status: string;
  areaName?: string;
  categoryName?: string;
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

export default function AllComplaintsPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public-complaints", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load complaints: HTTP ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as Complaint[];
      setComplaints(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void load();
  }, [checking]);

  const filteredComplaints = useMemo(() => {
    const s = search.toLowerCase();
    return complaints.filter((c) =>
      c.title.toLowerCase().includes(s) ||
      c.areaName?.toLowerCase().includes(s) ||
      c.categoryName?.toLowerCase().includes(s)
    );
  }, [complaints, search]);

  const groupedComplaints = useMemo(() => {
    return {
      pending: filteredComplaints.filter((c) => c.status === "RAISED"),
      inProgress: filteredComplaints.filter((c) => c.status === "IN_PROGRESS"),
      completed: filteredComplaints.filter((c) => c.status === "RESOLVED"),
    };
  }, [filteredComplaints]);

  if (checking) return null;

  const renderSection = (title: string, icon: React.ReactNode, list: Complaint[], color: string) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className={`p-2 rounded-xl ${color} bg-opacity-10 shadow-sm border border-current border-opacity-10`}>
            {icon}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
          <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {list.length} item{list.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid gap-4">
          {list.map((c, i) => (
            <motion.div
              key={c.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {c.title}
                      </h3>
                      <StatusBadge status={c.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-3">
                      {c.areaName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <MapPin size={12} className="text-slate-400" />
                          {c.areaName}
                        </div>
                      )}
                      {c.categoryName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Tag size={12} className="text-slate-400" />
                          {c.categoryName}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        #{c.id.slice(0, 8)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/complaints/${c.id}`} className="block">
                      <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl font-bold bg-white hover:bg-slate-50 border-slate-200">
                        <Eye size={16} className="mr-2" />
                        View
                      </Button>
                    </Link>
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
    <div className="animate-fade-in pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Public Complaints</h1>
          <p className="text-slate-500 mt-1.5 text-lg">Browse all active and resolved community issues</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search title, area, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-5 flex items-center gap-3 text-sm text-red-600 font-bold overflow-hidden">
          <span className="text-xl shrink-0">⚠️</span>
          <div className="truncate">{error}</div>
          <Button variant="ghost" size="sm" className="ml-auto text-red-600 hover:bg-red-100" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <SkeletonList count={6} />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-slate-300" />}
          title="No complaints in the system"
          description="The platform is currently clean with no reports. Be the first to raise an issue!"
          action="Report Incident"
          onAction={() => router.push("/complaints/new")}
        />
      ) : filteredComplaints.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-4 border border-slate-100">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search terms</p>
          <Button variant="ghost" className="mt-4 text-indigo-600 hover:bg-indigo-50" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <>
          {renderSection(
            "In Progress",
            <PlayCircle size={22} className="text-blue-500" />,
            groupedComplaints.inProgress,
            "bg-blue-500"
          )}
          {renderSection(
            "Pending",
            <Clock size={22} className="text-amber-500" />,
            groupedComplaints.pending,
            "bg-amber-500"
          )}
          {renderSection(
            "Completed",
            <CheckCircle2 size={22} className="text-emerald-500" />,
            groupedComplaints.completed,
            "bg-emerald-500"
          )}
        </>
      )}
    </div>
  );
}
