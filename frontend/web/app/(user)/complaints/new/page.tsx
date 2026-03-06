"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MapPin,
  FileText,
  AlignLeft,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FieldLabel, Input, Textarea, Select } from "@/components/ui/Field";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getOrCreateAnonymousUserHash } from "@/lib/anon";
import { type AreaDto, type CategoryDto, formatArea } from "@/lib/types";

export default function NewComplaintPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  // Form state
  const [areaId, setAreaId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fixed: use correct backend endpoints
    Promise.all([
      fetch("/api/areas").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/complaint-categories").then((r) => (r.ok ? r.json() : [])),
    ]).then(([a, c]) => {
      setAreas(a as AreaDto[]);
      setCategories(c as CategoryDto[]);
    });
  }, []);

  const imageUrls = imageUrlsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  function canProceed(): boolean {
    if (step === 1) return !!areaId && !!categoryId;
    if (step === 2) return !!title.trim() && !!description.trim();
    return true;
  }

  async function onSubmit() {
    setError(null);
    if (!areaId || !categoryId || !title.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const hash = getOrCreateAnonymousUserHash();
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          areaId,
          categoryId,
          title: title.trim(),
          description: description.trim(),
          images: imageUrls.length > 0 ? imageUrls : undefined, // Fixed: was "imageUrls"
          anonymousUserHash: hash,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Failed (HTTP ${res.status})`);
      }

      const { id } = (await res.json()) as { id: string };
      toast.success("Complaint submitted!", {
        description: `ID: ${id.slice(0, 8)}… — Track it in My Complaints`,
      });
      router.push("/complaints/my");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null;

  const selectedArea = areas.find((a) => a.id === areaId);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const steps = [
    { num: 1, label: "Location", icon: MapPin },
    { num: 2, label: "Details", icon: FileText },
    { num: 3, label: "Review", icon: Check },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raise a Complaint</h1>
        <p className="text-sm text-slate-500 mt-1">Your identity stays anonymous throughout the process</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <div key={s.num} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`h-0.5 w-8 rounded-full ${isDone ? "bg-indigo-500" : "bg-slate-200"}`} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : isDone
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:block ${isActive ? "text-slate-900" : "text-slate-400"
                    }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm max-w-2xl"
      >
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MapPin size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Location & Category</h2>
                <p className="text-xs text-slate-400">Select where the issue is and its type</p>
              </div>
            </div>

            <FieldLabel label="Area">
              <Select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
                <option value="">Select area...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatArea(a)}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel label="Category">
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FieldLabel>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <AlignLeft size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Complaint Details</h2>
                <p className="text-xs text-slate-400">Describe the issue you want to report</p>
              </div>
            </div>

            <FieldLabel label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of the issue"
                maxLength={200}
              />
            </FieldLabel>

            <FieldLabel label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={5}
                maxLength={5000}
                className="min-h-[120px]"
              />
            </FieldLabel>

            <FieldLabel label="Image URLs" hint="Optional, one per line">
              <Textarea
                value={imageUrlsText}
                onChange={(e) => setImageUrlsText(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                rows={2}
              />
            </FieldLabel>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Check size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review & Submit</h2>
                <p className="text-xs text-slate-400">Confirm your complaint details</p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { label: "Area", value: selectedArea ? formatArea(selectedArea) : "—" },
                { label: "Category", value: selectedCategory?.name || "—" },
                { label: "Title", value: title || "—" },
                { label: "Description", value: description || "—" },
                { label: "Images", value: imageUrls.length > 0 ? `${imageUrls.length} attached` : "None" },
              ].map((field) => (
                <div key={field.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{field.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-700 font-medium">
                🔒 Your identity is completely anonymous. We use a hashed identifier to track your complaints.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={16} />
                Back
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button variant="gradient" loading={submitting} onClick={() => void onSubmit()}>
                <Send size={15} />
                {submitting ? "Submitting…" : "Submit Complaint"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
