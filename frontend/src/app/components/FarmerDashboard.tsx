import React, { useState, useEffect } from "react";
import FarmerLayout from "./FarmerLayout";
import { Link } from "react-router";
import { BarChart2, Camera, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Clock, ArrowRight, Sprout, Info, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { score as scoreApi, diagnosis as diagnosisApi } from "../services/api";
import { t, type Language } from "../i18n/translations";

export default function FarmerDashboard() {
  const { farmerUser, refreshFarmerProfile } = useAuth();
  const [scoreData, setScoreData] = useState<any>(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [scoreRes, diagRes] = await Promise.allSettled([
          scoreApi.getBreakdown(),
          diagnosisApi.getAll(),
        ]);
        if (!alive) return;

        if (scoreRes.status === "fulfilled") setScoreData(scoreRes.value);
        if (diagRes.status === "fulfilled") {
          const list = diagRes.value.diagnoses || diagRes.value || [];
          setRecentDiagnoses(Array.isArray(list) ? list.slice(0, 3) : []);
        }

        // Refresh profile to get latest score on sidebar
        await refreshFarmerProfile().catch(() => {});
      } catch {
        // Swallow — data will show empty states
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // Derive values
  const agriScore = farmerUser?.agriTrustScore ?? scoreData?.agriTrustScore ?? 0;
  const totalDiagnoses = scoreData?.features?.totalDiagnoses ?? recentDiagnoses.length;
  const uniqueDiseases = new Set(recentDiagnoses.filter(d => d.diseaseDetected && d.diseaseDetected !== "Healthy").map(d => d.diseaseDetected)).size;

  // Weather from latest diagnosis (if available)
  const latestWeather = recentDiagnoses.length > 0 ? recentDiagnoses[0].weather : null;
  const lang = (farmerUser?.language || "english") as Language;

  // Score breakdown factors (from API or fallback)
  const breakdown = scoreData?.breakdown;
  const factors = breakdown
    ? [
        { name: t("Diagnosis Frequency", lang), score: `${breakdown.diagnosisFrequency?.score ?? 0}/30`, perc: Math.round(((breakdown.diagnosisFrequency?.score ?? 0) / 30) * 100), icon: Camera },
        { name: t("Crop Improvement", lang), score: `${breakdown.improvementRate?.score ?? 0}/25`, perc: Math.round(((breakdown.improvementRate?.score ?? 0) / 25) * 100), icon: TrendingUp },
        { name: t("Location Consistency", lang), score: `${breakdown.locationConsistency?.score ?? 0}/15`, perc: Math.round(((breakdown.locationConsistency?.score ?? 0) / 15) * 100), icon: MapPin },
        { name: t("Seasonal Management", lang), score: `${breakdown.seasonalManagement?.score ?? 0}/20`, perc: Math.round(((breakdown.seasonalManagement?.score ?? 0) / 20) * 100), icon: Sprout },
        { name: t("Response Time", lang), score: `${breakdown.responseTime?.score ?? 0}/10`, perc: Math.round(((breakdown.responseTime?.score ?? 0) / 10) * 100), icon: Clock },
      ]
    : [
        { name: t("Diagnosis Frequency", lang), score: "0/30", perc: 0, icon: Camera },
        { name: t("Crop Improvement", lang), score: "0/25", perc: 0, icon: TrendingUp },
        { name: t("Location Consistency", lang), score: "0/15", perc: 0, icon: MapPin },
        { name: t("Seasonal Management", lang), score: "0/20", perc: 0, icon: Sprout },
        { name: t("Response Time", lang), score: "0/10", perc: 0, icon: Clock },
      ];

  // Score tier
  const scoreTier = agriScore >= 700 ? "Good Standing" : agriScore >= 400 ? "Building" : "Getting Started";

  // Estimated loan eligibility
  const loanEstimate = agriScore >= 700 ? "₹45,000" : agriScore >= 400 ? "₹20,000" : "₹5,000";

  const severityColor = (s: string) => {
    if (s === "high") return "#C0392B";
    if (s === "medium") return "#F39C12";
    return "#27AE60";
  };

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={32} className="animate-spin text-[#64B43C]" />
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-8 pb-20 md:pb-0">
        
        {/* TOP ROW: Score Card + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SCORE CARD */}
          <div 
            className="lg:col-span-5 bg-white dark:bg-[#1A3A1A] rounded-[14px] border-t-4 border-t-[#64B43C] border-x border-b border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.07)] p-6 relative overflow-hidden transition-colors duration-500"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="flex flex-col items-center flex-1">
                <div className="relative w-40 h-40 flex items-center justify-center mb-2">
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#E8F5E0" strokeWidth="12" />
                    <circle 
                      cx="100" cy="100" r="90" fill="none" stroke="#64B43C" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 * (1 - agriScore/850)}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span 
                      className="font-heading text-[56px] text-[#1A3A1A] dark:text-white leading-none transition-colors duration-500"
                    >
                      {agriScore}
                    </span>
                  </div>
                </div>
                <span className="text-[13px] text-[#6B7B5E] dark:text-white/70 font-medium uppercase tracking-wide transition-colors duration-500">{t("Agri-Trust Score", lang)}</span>
                <div className="mt-2 bg-[#E8F5E0] dark:bg-[#64B43C] text-[#1A3A1A] px-3 py-1 rounded-full text-[12px] font-bold border border-[#64B43C]/20 flex items-center gap-1 transition-colors duration-500">
                  <ShieldCheck size={14} className="text-[#64B43C] dark:text-[#1A3A1A]" /> {scoreTier}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 w-full">
                {factors.map((f, i) => (
                  <div key={i} className="flex flex-col gap-1 group relative">
                    <div className="flex items-center justify-between text-[12px] text-[#1A3A1A] dark:text-white font-medium transition-colors duration-500">
                      <div className="flex items-center gap-1.5">
                        <f.icon size={14} className="text-[#6B7B5E] dark:text-[#A4B598]" /> {f.name}
                      </div>
                      <span>{f.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#FAFBF7] dark:bg-[#111E11] rounded-full overflow-hidden border border-[rgba(26,58,26,0.05)] dark:border-white/5 transition-colors duration-500">
                      <div className="h-full bg-[#64B43C] rounded-full transition-all" style={{ width: `${f.perc}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(26,58,26,0.06)] dark:border-white/10 flex justify-between items-center text-[12px] transition-colors duration-500">
              <span className="text-[#6B7B5E] dark:text-white/50">Score updated recently</span>
              <Link to="/score" className="text-[#64B43C] font-medium flex items-center gap-1 hover:text-[#1A3A1A] dark:hover:text-white transition-colors">{t("View full breakdown", lang)} <ArrowRight size={14} /></Link>
            </div>
          </div>

          {/* STAT CARDS (4 grid) */}
          <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1A3A1A] p-5 rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex flex-col justify-between transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[13px] text-[#6B7B5E] dark:text-white/70 font-medium leading-snug">{t("Total Diagnoses", lang)}<br/>{t("uploaded", lang)}</span>
                <div className="w-8 h-8 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center"><Camera size={16} className="text-[#1A3A1A] dark:text-white" /></div>
              </div>
              <div className="flex items-end gap-2 mt-4">
                <span className="font-heading text-[36px] text-[#1A3A1A] dark:text-white leading-none">{totalDiagnoses}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A3A1A] p-5 rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex flex-col justify-between transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[13px] text-[#6B7B5E] dark:text-white/70 font-medium leading-snug">{t("Unique Diseases", lang)}<br/>{t("identified", lang)}</span>
                <div className="w-8 h-8 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center"><AlertTriangle size={16} className="text-[#1A3A1A] dark:text-white" /></div>
              </div>
              <div className="flex items-end gap-2 mt-4">
                <span className="font-heading text-[36px] text-[#1A3A1A] dark:text-white leading-none">{uniqueDiseases}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A3A1A] p-5 rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex flex-col justify-between transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[13px] text-[#6B7B5E] dark:text-white/70 font-medium leading-snug">{t("Follow-ups", lang)}<br/>{t("completed", lang)}</span>
                <div className="w-8 h-8 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center"><TrendingUp size={16} className="text-[#1A3A1A] dark:text-white" /></div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#E8F5E0" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#64B43C" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - (recentDiagnoses.filter(d => d.isFollowUp).length / Math.max(1, totalDiagnoses)))} strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] font-bold text-[#1A3A1A] dark:text-white z-10">
                    {totalDiagnoses > 0 ? Math.round((recentDiagnoses.filter(d => d.isFollowUp).length / totalDiagnoses) * 100) : 0}%
                  </span>
                </div>
                <span className="text-[#6B7B5E] dark:text-white/70 text-[12px] leading-tight max-w-[80px]">of treatments followed up</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A3A1A] p-5 rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex flex-col justify-between transition-colors duration-500">
              <div className="flex justify-between items-start">
                <span className="text-[13px] text-[#6B7B5E] dark:text-white/70 font-medium leading-snug">{t("Estimated Loan", lang)}<br/>{t("Eligibility", lang)}</span>
                <div className="w-8 h-8 rounded-full bg-[#1A3A1A] dark:bg-[#64B43C] flex items-center justify-center"><span className="text-white dark:text-[#1A3A1A] text-[14px] font-bold">₹</span></div>
              </div>
              <div className="flex flex-col mt-2">
                <span className="font-heading text-[32px] text-[#64B43C] leading-none">{loanEstimate}</span>
                <span className="text-[#6B7B5E] dark:text-white/50 text-[12px] mt-1">based on {agriScore} score</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Recent Diagnoses + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* RECENT DIAGNOSES */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <h3 className="font-heading text-[24px] text-[#1A3A1A] dark:text-white transition-colors duration-500">{t("Recent crop checks", lang)}</h3>
              <Link to="/history" className="text-[13px] text-[#64B43C] font-medium hover:text-[#1A3A1A] dark:hover:text-white flex items-center gap-1 transition-colors">{t("View all", lang)} <ArrowRight size={14} /></Link>
            </div>
            
            {recentDiagnoses.length === 0 ? (
              <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-8 text-center transition-colors duration-500">
                <Camera size={48} className="mx-auto mb-4 text-[#C5D5B5] dark:text-white/20" />
                <p className="text-[#6B7B5E] dark:text-white/60 text-[14px]">No diagnoses yet. Upload your first crop photo!</p>
                <Link to="/diagnose" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#1A3A1A] text-white rounded-[10px] text-[14px] font-medium hover:bg-[#2A4A2A] transition-colors">
                  {t("Diagnose now", lang)} <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentDiagnoses.map((diag, i) => {
                  const isHealthy = !diag.diseaseDetected || diag.diseaseDetected === "Healthy";
                  const color = isHealthy ? "#27AE60" : severityColor(diag.severity || "medium");
                  const timeAgo = diag.createdAt ? new Date(diag.createdAt).toLocaleDateString() : "";
                  return (
                    <div 
                      key={diag._id || i} 
                      className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] overflow-hidden flex flex-col cursor-pointer group transition-colors duration-500"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 z-10" />
                        <img src={diag.imageUrl || "https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?w=300&q=80"} alt="Crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {diag.followupDate && new Date(diag.followupDate) > new Date() && (
                          <div className="absolute top-2 left-2 z-20 bg-[#1A3A1A] text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                            <Clock size={10} /> Follow up due
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <span className="text-[12px] text-[#6B7B5E] dark:text-white/50">{timeAgo}</span>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[14px] text-[#1A3A1A] dark:text-white leading-tight">{diag.diseaseDetected || "Unknown"}</span>
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            {isHealthy ? t("No issues detected", lang) : `${diag.severity || "Medium"} ${t("Severity", lang)}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TREATMENT TIMELINE */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="font-heading text-[24px] text-[#1A3A1A] dark:text-white transition-colors duration-500">{t("Treatment Plan", lang)}</h3>
            
            <div className="bg-white dark:bg-[#1A3A1A] p-5 rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex-1 transition-colors duration-500">
              {recentDiagnoses.length > 0 && recentDiagnoses[0].treatmentPlan ? (
                <div className="flex flex-col gap-4">
                  <p className="text-[13px] text-[#1A3A1A] dark:text-white/80 leading-relaxed">{(typeof recentDiagnoses[0].treatmentPlan === 'string' ? recentDiagnoses[0].treatmentPlan : '').substring(0, 200) || "Follow your prescribed treatment plan."}</p>
                  {(recentDiagnoses[0].recommendedAction || []).slice(0, 4).map((action: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-[#6B7B5E] dark:text-[#A4B598]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#64B43C] mt-1.5 shrink-0" />
                      {action}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative pl-6 py-2 flex flex-col gap-6">
                  <div className="absolute left-[11px] top-4 bottom-4 w-px bg-[#C5D5B5] dark:bg-white/10" />
                  {[
                    { title: "Upload your first diagnosis", color: "bg-[#64B43C]", active: true },
                    { title: "Receive AI-powered treatment plan", color: "bg-[#6B7B5E]", active: false },
                    { title: "Follow treatment & upload follow-up", color: "bg-[#6B7B5E]", active: false },
                    { title: "Build your Agri-Trust Score", color: "bg-[#6B7B5E]", active: false },
                  ].map((event, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[30px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-white dark:border-[#1A3A1A] ${event.color} z-10 ${event.active ? 'animate-pulse' : ''}`} />
                      <span className={`text-[13px] ${event.active ? 'text-[#1A3A1A] dark:text-white font-bold' : 'text-[#6B7B5E] dark:text-[#A4B598]'}`}>{event.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: SMART TIPS CARD */}
        <div 
          className="bg-[#E8F5E0] dark:bg-[#1A3A1A] rounded-[14px] border border-[#64B43C]/20 dark:border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-sm transition-colors duration-500"
        >
          <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shrink-0 border border-[#64B43C]/20 dark:border-white/5 text-[#64B43C] dark:text-[#E8F5E0]">
            <Sprout size={24} />
          </div>
          <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
            <h4 className="font-heading text-[18px] text-[#1A3A1A] dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Info size={16} className="text-[#64B43C]" /> Regional Alert{farmerUser?.state ? `: ${farmerUser.state}` : ""}
            </h4>
            <p className="text-[14px] text-[#1A3A1A]/80 dark:text-white/80 leading-relaxed">
              Upload a check photo regularly to protect and grow your Agri-Trust Score. Each diagnosis helps build your credit history.
            </p>
          </div>
          <Link to="/diagnose" className="shrink-0 px-5 py-2.5 rounded-[10px] bg-[#1A3A1A] text-white font-medium text-[14px] hover:bg-[#2A4A2A] transition-colors flex items-center gap-2 mt-2 sm:mt-0">
            Diagnose now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </FarmerLayout>
  );
}
