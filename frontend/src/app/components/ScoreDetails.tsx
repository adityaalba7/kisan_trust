import { useState, useEffect } from "react";
import FarmerLayout from "./FarmerLayout";
import { BarChart2, TrendingUp, MapPin, Leaf, Clock, Camera, Loader2, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { score as scoreApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { t, type Language } from "../i18n/translations";

interface Breakdown {
  diagnosisFrequency: { weight: string; detail: string };
  cropImprovement: { weight: string; detail: string };
  locationConsistency: { weight: string; detail: string };
  seasonalManagement: { weight: string; detail: string };
  responseTime: { weight: string; detail: string };
}

export default function ScoreDetails() {
  const { farmerUser } = useAuth();
  const lang = (farmerUser?.language || "english") as Language;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    scoreApi.getBreakdown()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load score"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={32} className="animate-spin text-[#64B43C]" />
        </div>
      </FarmerLayout>
    );
  }

  const scoreValue = data?.agriTrustScore ?? farmerUser?.agriTrustScore ?? 0;
  const maxScore = data?.maxScore ?? 850;
  const pct = Math.round((scoreValue / maxScore) * 100);
  const breakdown: Breakdown | null = data?.breakdown || null;

  const getScoreLabel = (pct: number) => {
    if (pct >= 80) return { label: "Excellent", color: "#27AE60", icon: CheckCircle2 };
    if (pct >= 60) return { label: "Good", color: "#64B43C", icon: TrendingUp };
    if (pct >= 40) return { label: "Fair", color: "#F39C12", icon: AlertTriangle };
    return { label: "Building", color: "#C0392B", icon: ShieldAlert };
  };

  const scoreLabel = getScoreLabel(pct);

  const categories = breakdown ? [
    { key: "diagnosisFrequency", label: t("Diagnosis Frequency", lang), icon: Camera, ...breakdown.diagnosisFrequency },
    { key: "cropImprovement", label: t("Crop Improvement", lang), icon: TrendingUp, ...breakdown.cropImprovement },
    { key: "locationConsistency", label: t("Location Consistency", lang), icon: MapPin, ...breakdown.locationConsistency },
    { key: "seasonalManagement", label: t("Seasonal Management", lang), icon: Leaf, ...breakdown.seasonalManagement },
    { key: "responseTime", label: t("Response Time", lang), icon: Clock, ...breakdown.responseTime },
  ] : [];

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-8 pb-20 md:pb-0 max-w-[800px] mx-auto">
        <header>
          <h1 className="font-heading text-[32px] text-[#1A3A1A] dark:text-white leading-tight transition-colors duration-500">{t("Your Agri-Trust Score", lang)}</h1>
          <p className="text-[14px] text-[#6B7B5E] dark:text-[#A4B598] mt-1 transition-colors duration-500">
            {data?.method === "ml-model" ? "Calculated using AI Model" : "Formula-based scoring"} · Updated live
          </p>
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-[8px] text-[13px]">
            {error}
          </div>
        )}

        {/* SCORE GAUGE */}
        <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-8 shadow-sm flex flex-col items-center gap-6 transition-colors duration-500">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#E8F5E0] dark:text-white/10" />
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke={scoreLabel.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${pct * 5.34} 534`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-[48px] text-[#1A3A1A] dark:text-white leading-none">{scoreValue}</span>
              <span className="text-[13px] text-[#6B7B5E] dark:text-white/60 mt-1">/ {maxScore}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scoreLabel.color }} />
            <span className="text-[16px] font-medium text-[#1A3A1A] dark:text-white">{scoreLabel.label}</span>
          </div>

          {data?.message && (
            <p className="text-[14px] text-[#6B7B5E] dark:text-white/60 text-center max-w-[400px]">{data.message}</p>
          )}
        </div>

        {/* BREAKDOWN */}
        {categories.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white transition-colors duration-500">{t("Score Breakdown", lang)}</h2>

            {categories.map((cat) => {
              const weightNum = parseInt(cat.weight);
              return (
                <div key={cat.key} className="bg-white dark:bg-[#1A3A1A] rounded-[12px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-5 flex items-start gap-4 shadow-sm transition-colors duration-500">
                  <div className="w-10 h-10 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center text-[#1A3A1A] dark:text-white shrink-0">
                    <cat.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[14px] text-[#1A3A1A] dark:text-white">{cat.label}</span>
                      <span className="text-[12px] text-[#64B43C] font-bold bg-[#E8F5E0] dark:bg-[#64B43C]/20 px-2 py-0.5 rounded-full">{cat.weight}</span>
                    </div>
                    <p className="text-[13px] text-[#6B7B5E] dark:text-white/60 mb-2">{cat.detail}</p>
                    <div className="h-2 w-full bg-[#E8F5E0] dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#64B43C] rounded-full transition-all duration-700"
                        style={{ width: `${weightNum}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DISCLAIMER */}
        <div className="bg-[#E8F5E0] dark:bg-white/5 p-4 rounded-[10px] border border-[#64B43C]/20 text-[13px] text-[#1A3A1A] dark:text-white/80 flex gap-3 transition-colors duration-500">
          <BarChart2 size={20} className="text-[#64B43C] shrink-0 mt-0.5" />
          <p>Your Agri-Trust Score rises with each diagnosis, follow-up, and consistent field management. Lenders use this to assess your creditworthiness — the higher your score, the better your loan terms.</p>
        </div>
      </div>
    </FarmerLayout>
  );
}
