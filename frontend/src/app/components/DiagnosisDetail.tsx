import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import FarmerLayout from "./FarmerLayout";
import { ArrowLeft, CheckCircle2, ShieldAlert, MapPin, Clock, Camera, Leaf, Loader2, Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { diagnosis as diagnosisApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { t, type Language } from "../i18n/translations";

export default function DiagnosisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmerUser } = useAuth();
  const lang = (farmerUser?.language || "english") as Language;
  const [diag, setDiag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    diagnosisApi.getById(id)
      .then((data) => setDiag(data.diagnosis))
      .catch((err) => setError(err.message || "Failed to load diagnosis"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={32} className="animate-spin text-[#64B43C]" />
        </div>
      </FarmerLayout>
    );
  }

  if (error || !diag) {
    return (
      <FarmerLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <p className="text-red-500 dark:text-red-400 text-[14px]">{error || "Diagnosis not found"}</p>
          <Link to="/history" className="text-[#64B43C] font-medium flex items-center gap-1">
            <ArrowLeft size={16} /> {t("Back to My Log", lang)}
          </Link>
        </div>
      </FarmerLayout>
    );
  }

  const isHealthy = !diag.diseaseDetected || diag.diseaseDetected === "Healthy";
  const sevColor = diag.severity === "high" ? "#C0392B" : diag.severity === "medium" ? "#F39C12" : "#27AE60";
  const createdDate = new Date(diag.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const createdTime = new Date(diag.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-6 pb-20 md:pb-0 max-w-[900px] mx-auto">
        {/* BACK BUTTON */}
        <button onClick={() => navigate("/history")} className="flex items-center gap-2 text-[14px] text-[#6B7B5E] dark:text-[#A4B598] hover:text-[#1A3A1A] dark:hover:text-white transition-colors w-fit">
          <ArrowLeft size={18} /> {t("Back to My Log", lang)}
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image */}
          <div className="w-full sm:w-[280px] h-[200px] rounded-[14px] overflow-hidden border border-[#1A3A1A]/10 dark:border-white/10 shrink-0">
            <img src={diag.imageUrl} alt={diag.diseaseDetected || "Crop"} className="w-full h-full object-cover" />
          </div>

          {/* Disease Info */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {diag.confidence && (
                <div className="bg-[#1A3A1A]/5 dark:bg-white/10 text-[#1A3A1A] dark:text-white px-2.5 py-1 rounded-[6px] text-[11px] font-bold inline-flex items-center gap-1 border border-[#1A3A1A]/10 dark:border-white/5">
                  <CheckCircle2 size={10} className="text-[#27AE60]" /> {Math.round(diag.confidence)}% confident
                </div>
              )}
              {diag.isVerified && (
                <div className="bg-[#E8F5E0] dark:bg-[#64B43C]/20 text-[#1A3A1A] dark:text-[#64B43C] px-2.5 py-1 rounded-[6px] text-[11px] font-bold inline-flex items-center gap-1 border border-[#64B43C]/20">
                  <MapPin size={10} /> GPS Verified
                </div>
              )}
            </div>

            <h1 className="font-heading text-[32px] text-[#1A3A1A] dark:text-white leading-tight transition-colors duration-500">
              {diag.diseaseDetected || "Unknown Disease"}
            </h1>

            <div className={`px-3 py-1 rounded-full text-[12px] font-bold inline-flex items-center gap-1 w-fit`} style={{ backgroundColor: `${sevColor}15`, color: sevColor }}>
              <ShieldAlert size={12} /> {diag.severity ? `${diag.severity.charAt(0).toUpperCase() + diag.severity.slice(1)} Severity` : "N/A"}
            </div>

            <div className="flex items-center gap-4 text-[12px] text-[#6B7B5E] dark:text-white/50 mt-1">
              <span className="flex items-center gap-1"><Clock size={12} /> {createdDate} at {createdTime}</span>
              {diag.cropType && <span className="flex items-center gap-1"><Leaf size={12} /> {diag.cropType}</span>}
            </div>
          </div>
        </div>

        {/* TREATMENT PLAN */}
        <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm transition-colors duration-500">
          <h2 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white mb-4">{t("Treatment Plan", lang)}</h2>
          <p className="text-[14px] text-[#1A3A1A]/80 dark:text-white/80 leading-relaxed">
            {diag.treatmentPlan || "No treatment plan available. Consult a local agricultural expert."}
          </p>

          {diag.treatmentPlanTranslated && (
            <div className="mt-4 p-4 bg-[#E8F5E0] dark:bg-white/5 rounded-[10px] border border-[#64B43C]/20">
              <p className="text-[12px] text-[#64B43C] font-bold mb-1">🌐 Translated ({diag.translationLanguage || ""})</p>
              <p className="text-[14px] text-[#1A3A1A] dark:text-white/80 leading-relaxed">{diag.treatmentPlanTranslated}</p>
            </div>
          )}
        </div>

        {/* RECOMMENDED ACTIONS */}
        {diag.recommendedAction && diag.recommendedAction.length > 0 && (
          <div className="bg-[#FAFBF7] dark:bg-[#111e11] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm transition-colors duration-500">
            <h2 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white mb-4">{t("Recommended Actions", lang)}</h2>
            <div className="flex flex-col gap-3">
              {diag.recommendedAction.map((action: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[10px] bg-white dark:bg-[#1A3A1A] border border-[#1A3A1A]/5 dark:border-white/5 transition-colors duration-500">
                  <div className="w-6 h-6 rounded-full bg-[#1A3A1A]/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-[10px] font-bold text-[#1A3A1A] dark:text-white">
                    {i + 1}
                  </div>
                  <span className="text-[13px] font-medium text-[#1A3A1A]/90 dark:text-white/90">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEATHER + LOCATION ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weather */}
          {diag.weather && (
            <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-5 shadow-sm transition-colors duration-500">
              <h3 className="font-heading text-[16px] text-[#1A3A1A] dark:text-white mb-3 flex items-center gap-2">
                <Cloud size={16} className="text-[#64B43C]" /> {t("Weather at Diagnosis", lang)}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="flex items-center gap-2 text-[#6B7B5E] dark:text-white/60">
                  <Thermometer size={14} /> {Math.round(diag.weather.temperature || 0)}°C
                </div>
                <div className="flex items-center gap-2 text-[#6B7B5E] dark:text-white/60">
                  <Droplets size={14} /> {diag.weather.humidity || 0}% humidity
                </div>
                <div className="flex items-center gap-2 text-[#6B7B5E] dark:text-white/60">
                  <Wind size={14} /> {diag.weather.windSpeed || 0} m/s
                </div>
                <div className="flex items-center gap-2 text-[#6B7B5E] dark:text-white/60">
                  <Cloud size={14} /> {diag.weather.description || diag.weather.condition || "—"}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-5 shadow-sm transition-colors duration-500">
            <h3 className="font-heading text-[16px] text-[#1A3A1A] dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-[#64B43C]" /> {t("Location Details", lang)}
            </h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#6B7B5E] dark:text-white/60">
              <div>Lat: {diag.location?.latitude?.toFixed(4) || "—"}, Lng: {diag.location?.longitude?.toFixed(4) || "—"}</div>
              <div className="flex items-center gap-2">
                {diag.isVerified ? (
                  <span className="text-[#27AE60] font-medium flex items-center gap-1"><CheckCircle2 size={12} /> {t("Location Verified", lang)}</span>
                ) : (
                  <span className="text-[#F39C12] font-medium">⚠ Location Not Verified</span>
                )}
                {diag.distanceFromField > 0 && (
                  <span>· {diag.distanceFromField}m from field</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOLLOW-UP */}
        {diag.followupDate && (
          <div className="bg-[#E8F5E0] dark:bg-[#64B43C]/10 rounded-[14px] border border-[#64B43C]/20 p-5 flex items-center justify-between transition-colors duration-500">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-[#64B43C]" />
              <div>
                <p className="text-[14px] font-medium text-[#1A3A1A] dark:text-white">Follow-up Recommended</p>
                <p className="text-[12px] text-[#6B7B5E] dark:text-white/60">
                  By {new Date(diag.followupDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <Link to="/diagnose" className="px-4 py-2 rounded-[8px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] text-[13px] font-medium hover:scale-105 transition-transform">
              Upload Follow-up
            </Link>
          </div>
        )}

        {/* PREVIOUS DIAGNOSIS (if follow-up) */}
        {diag.previousDiagnosis && (
          <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-5 shadow-sm transition-colors duration-500">
            <h3 className="font-heading text-[16px] text-[#1A3A1A] dark:text-white mb-3">Compared to Previous Diagnosis</h3>
            <div className="flex items-center gap-4">
              {diag.previousDiagnosis.imageUrl && (
                <img src={diag.previousDiagnosis.imageUrl} alt="Previous" className="w-16 h-16 rounded-[8px] object-cover border border-[#1A3A1A]/10" />
              )}
              <div className="flex flex-col gap-1 text-[13px]">
                <span className="text-[#1A3A1A] dark:text-white font-medium">{diag.previousDiagnosis.diseaseDetected || "Unknown"}</span>
                <span className="text-[#6B7B5E] dark:text-white/50">{diag.previousDiagnosis.severity} severity · {new Date(diag.previousDiagnosis.createdAt).toLocaleDateString()}</span>
              </div>
              {diag.growthScore !== undefined && diag.growthScore !== null && (
                <div className="ml-auto text-center">
                  <span className={`font-heading text-[24px] ${diag.growthScore > 50 ? 'text-[#27AE60]' : 'text-[#F39C12]'}`}>{diag.growthScore}%</span>
                  <p className="text-[10px] text-[#6B7B5E] dark:text-white/50">improvement</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
