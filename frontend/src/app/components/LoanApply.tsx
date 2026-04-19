import { useState, useEffect } from "react";
import { motion } from "motion/react";
import FarmerLayout from "./FarmerLayout";
import { FileText, CheckCircle2, ArrowRight, Loader2, Clock, XCircle, AlertTriangle, IndianRupee } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { loans as loansApi } from "../services/api";
import { t, type Language } from "../i18n/translations";

const PURPOSES = [
  { value: "seeds", label: "Seeds & Seedlings", icon: "🌱" },
  { value: "fertilizer", label: "Fertilizer & Pesticides", icon: "🧪" },
  { value: "equipment", label: "Farm Equipment", icon: "🚜" },
  { value: "irrigation", label: "Irrigation Systems", icon: "💧" },
  { value: "livestock", label: "Livestock", icon: "🐄" },
  { value: "other", label: "Other", icon: "📦" },
];

export default function LoanApply() {
  const { farmerUser } = useAuth();
  const lang = (farmerUser?.language || "english") as Language;

  const [step, setStep] = useState<"form" | "submitting" | "done">("form");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [cropType, setCropType] = useState(farmerUser?.cropTypes?.[0] || "");
  const [error, setError] = useState("");

  // Existing applications
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    loansApi.getMyApplications()
      .then((data) => setApplications(data.applications || []))
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, [step]);

  const handleSubmit = async () => {
    if (!amount || !purpose) {
      setError("Please fill in amount and purpose");
      return;
    }
    setStep("submitting");
    setError("");
    try {
      await loansApi.apply({
        amountRequested: parseFloat(amount),
        purpose,
        description,
        cropType,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
      setStep("form");
    }
  };

  const hasPending = applications.some((a) => a.status === "pending");
  const scoreValue = farmerUser?.agriTrustScore ?? 0;
  const maxLoan = scoreValue >= 700 ? 50000 : scoreValue >= 400 ? 25000 : 10000;

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle2 size={14} className="text-[#27AE60]" />;
    if (s === "rejected") return <XCircle size={14} className="text-[#C0392B]" />;
    if (s === "under_review") return <AlertTriangle size={14} className="text-[#F39C12]" />;
    return <Clock size={14} className="text-[#6B7B5E]" />;
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20";
    if (s === "rejected") return "bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/20";
    if (s === "under_review") return "bg-[#F39C12]/10 text-[#F39C12] border-[#F39C12]/20";
    return "bg-[#6B7B5E]/10 text-[#6B7B5E] border-[#6B7B5E]/20";
  };

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-8 pb-20 md:pb-0 max-w-[700px] mx-auto">
        <header>
          <h1 className="font-heading text-[32px] text-[#1A3A1A] dark:text-white leading-tight">Apply for Loan</h1>
          <p className="text-[14px] text-[#6B7B5E] dark:text-[#A4B598] mt-1">
            Based on your Agri-Trust Score of <strong className="text-[#64B43C]">{scoreValue}</strong>, you're eligible for up to <strong className="text-[#1A3A1A] dark:text-white">₹{maxLoan.toLocaleString()}</strong>
          </p>
        </header>

        {step === "done" ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#E8F5E0] dark:bg-[#64B43C]/10 rounded-[14px] border border-[#64B43C]/20 p-8 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#64B43C] flex items-center justify-center text-white">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-heading text-[24px] text-[#1A3A1A] dark:text-white">Application Submitted!</h2>
            <p className="text-[14px] text-[#6B7B5E] dark:text-white/70 max-w-[400px]">
              Your loan application for ₹{parseFloat(amount).toLocaleString()} has been submitted. Lenders will review your profile and Agri-Trust score. You'll be notified when a lender responds.
            </p>
            <button onClick={() => { setStep("form"); setAmount(""); setPurpose(""); setDescription(""); }} className="mt-4 px-6 py-2.5 rounded-[10px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] font-medium text-[14px] hover:scale-[1.02] transition-transform">
              Done
            </button>
          </motion.div>
        ) : (
          <>
            {/* APPLICATION FORM */}
            {!hasPending ? (
              <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm flex flex-col gap-6 transition-colors duration-500">
                {/* Amount */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium uppercase tracking-wide">Loan Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7B5E]" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      max={maxLoan}
                      className="w-full h-12 pl-10 pr-4 rounded-[10px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[16px] font-medium outline-none focus:border-[#64B43C] transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-[#6B7B5E] dark:text-white/40">Maximum eligible: ₹{maxLoan.toLocaleString()}</span>
                </div>

                {/* Purpose */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium uppercase tracking-wide">Purpose</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PURPOSES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPurpose(p.value)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-[10px] border text-[13px] transition-all ${
                          purpose === p.value
                            ? "bg-[#E8F5E0] dark:bg-[#64B43C]/20 border-[#64B43C] text-[#1A3A1A] dark:text-white font-medium"
                            : "bg-[#FAFBF7] dark:bg-[#111E11] border-[#C5D5B5] dark:border-white/10 text-[#6B7B5E] dark:text-white/60 hover:border-[#64B43C]"
                        }`}
                      >
                        <span className="text-[18px]">{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium uppercase tracking-wide">Crop Type</label>
                  <input
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g. Rice, Wheat, Cotton"
                    className="w-full h-10 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[14px] outline-none focus:border-[#64B43C] transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium uppercase tracking-wide">Details (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe why you need this loan..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[14px] outline-none focus:border-[#64B43C] transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-[8px] text-[13px]">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={step === "submitting"}
                  className="w-full h-[48px] rounded-[10px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] font-medium text-[16px] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {step === "submitting" ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  ) : (
                    <>Submit Application <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[#F39C12]/10 border border-[#F39C12]/20 rounded-[14px] p-6 text-center">
                <Clock size={32} className="mx-auto mb-3 text-[#F39C12]" />
                <p className="text-[14px] text-[#1A3A1A] dark:text-white font-medium">You already have a pending application</p>
                <p className="text-[12px] text-[#6B7B5E] dark:text-white/60 mt-1">Wait for lenders to review it before applying again.</p>
              </div>
            )}
          </>
        )}

        {/* EXISTING APPLICATIONS */}
        {applications.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white">My Applications</h2>
            {applications.map((app) => (
              <div key={app._id} className="bg-white dark:bg-[#1A3A1A] rounded-[12px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-5 flex items-center justify-between shadow-sm transition-colors duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center text-[#1A3A1A] dark:text-white">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-[18px] text-[#1A3A1A] dark:text-white">₹{app.amountRequested?.toLocaleString()}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusColor(app.status)}`}>
                        {app.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#6B7B5E] dark:text-white/50 mt-1">
                      <span>{app.purpose}</span>
                      <span>·</span>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      {app.lender && <><span>·</span><span>{app.lender.organizationName}</span></>}
                    </div>
                    {app.lenderNote && (
                      <p className="text-[12px] text-[#1A3A1A]/70 dark:text-white/60 mt-1 italic">"{app.lenderNote}"</p>
                    )}
                  </div>
                </div>
                <div className="shrink-0">{statusIcon(app.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
