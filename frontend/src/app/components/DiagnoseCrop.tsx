import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import FarmerLayout from "./FarmerLayout";
import { Camera, MapPin, Search, ChevronDown, CheckCircle2, ShieldAlert, AlertTriangle, ChevronRight, Activity, Bell, SplitSquareHorizontal, ArrowRight, TrendingUp, Clock, Upload, Loader2 } from "lucide-react";
import { diagnosis as diagnosisApi, fields as fieldsApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { t, type Language } from "../i18n/translations";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function DiagnoseCrop() {
  const { refreshFarmerProfile, farmerUser } = useAuth();
  const lang = (farmerUser?.language || "english") as Language;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<"ready" | "analyzing" | "results">("ready");
  const [analyzingText, setAnalyzingText] = useState("Identifying disease markers...");
  const [error, setError] = useState("");

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<"detecting" | "found" | "failed">("detecting");
  const [userFields, setUserFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [cropType, setCropType] = useState("");

  // Results state
  const [result, setResult] = useState<any>(null);

  // Get GPS on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLocationStatus("found");
        },
        () => setLocationStatus("failed"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("failed");
    }
  }, []);

  // Fetch fields on mount
  useEffect(() => {
    fieldsApi.getAll().then((data) => {
      const list = data.fields || data || [];
      setUserFields(Array.isArray(list) ? list : []);
      if (list.length > 0) {
        setSelectedFieldId(list[0]._id);
        if (list[0].currentCrop) setCropType(list[0].currentCrop);
      }
    }).catch(() => {});
  }, []);

  // Analyzing text animation
  useEffect(() => {
    if (state === "analyzing") {
      const texts = ["Identifying disease markers...", "Checking regional outbreak data...", "Preparing your treatment plan..."];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setAnalyzingText(texts[i]);
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [state]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }
    if (!cropType) {
      setError("Please select a crop type");
      return;
    }

    setError("");
    setState("analyzing");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("cropType", cropType);
      
      if (selectedFieldId) formData.append("fieldId", selectedFieldId);
      if (location) {
        formData.append("location", JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }));
      }

      const data = await diagnosisApi.create(formData);
      setResult(data.diagnosis || data);
      setState("results");

      // Refresh profile to update score in sidebar
      refreshFarmerProfile().catch(() => {});
    } catch (err: any) {
      setError(err.message || "Diagnosis failed. Please try again.");
      setState("ready");
    }
  };

  const fieldDropdownLabel = () => {
    if (userFields.length === 0) return "No fields registered";
    const f = userFields.find(f => f._id === selectedFieldId);
    return f ? `🌾 ${f.fieldName || "Field"} — ${f.currentCrop || ""}` : "Select field";
  };

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-6 pb-20 md:pb-0 max-w-[800px] mx-auto relative">
        
        <AnimatePresence mode="wait">
          {state === "ready" && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6">
              
              <div className="bg-[#FAFBF7] dark:bg-[#1A3A1A] border border-[rgba(26,58,26,0.1)] dark:border-white/10 rounded-[14px] p-6 text-center flex flex-col items-center gap-4 shadow-sm transition-colors duration-500">
                <div className="w-16 h-16 bg-[#E8F5E0] dark:bg-white/10 rounded-full flex items-center justify-center text-[#1A3A1A] dark:text-white mb-2">
                  <Camera size={32} />
                </div>
                <h3 className="font-heading text-[24px] text-[#1A3A1A] dark:text-white">Take a close photo of the sick leaf</h3>
                <p className="text-[13px] text-[#6B7B5E] dark:text-white/60 max-w-[300px]">Ensure the leaf is well lit. Your GPS location is being captured automatically for verification.</p>
              </div>

              {/* Location Status */}
              <div className="flex items-center justify-between text-[12px] bg-white dark:bg-[#1A3A1A] px-4 py-2.5 rounded-[8px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-sm transition-colors duration-500">
                <div className="flex items-center gap-2 text-[#1A3A1A] dark:text-white">
                  <div className={`w-2 h-2 rounded-full ${locationStatus === "found" ? "bg-[#27AE60] animate-pulse" : locationStatus === "detecting" ? "bg-[#F39C12] animate-pulse" : "bg-[#C0392B]"}`} />
                  <span className="font-medium">
                    {locationStatus === "found" && `Location verified: ${location?.accuracy ? `${Math.round(location.accuracy)}m accuracy` : "OK"}`}
                    {locationStatus === "detecting" && "Detecting location..."}
                    {locationStatus === "failed" && "Location unavailable — GPS disabled"}
                  </span>
                </div>
                <MapPin size={14} className="text-[#64B43C]" />
              </div>

              {/* Crop Type Selector */}
              <div className="bg-white dark:bg-[#1A3A1A] p-4 rounded-[10px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-sm transition-colors duration-500">
                <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium mb-2 block">Crop Type</label>
                <select
                  value={cropType}
                  onChange={e => setCropType(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[14px] outline-none focus:border-[#64B43C] transition-colors"
                >
                  <option value="">Select crop type</option>
                  {["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Tomato", "Grapes", "Vegetables"].map(c => (
                    <option key={c} value={c.toLowerCase()}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative h-[300px] border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                  previewUrl 
                    ? "border-[#64B43C] bg-[#E8F5E0]/30 dark:bg-white/5" 
                    : "border-[#C5D5B5] dark:border-white/20 hover:border-[#64B43C] hover:bg-[#E8F5E0]/50 dark:hover:bg-white/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[12px]" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#FAFBF7] dark:bg-[#1A3A1A] flex items-center justify-center text-[#6B7B5E] dark:text-white/50 group-hover:text-[#64B43C] dark:group-hover:text-[#64B43C] transition-colors border border-[rgba(26,58,26,0.05)] shadow-sm">
                      <Camera size={28} />
                    </div>
                    <span className="text-[16px] text-[#1A3A1A] dark:text-white font-medium">Tap to photograph or upload</span>
                    <span className="text-[13px] text-[#6B7B5E] dark:text-[#A4B598]">Accepts JPG, PNG</span>
                  </>
                )}
              </div>

              {/* Field Selector */}
              {userFields.length > 0 && (
                <div className="bg-white dark:bg-[#1A3A1A] p-4 rounded-[10px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-sm transition-colors duration-500">
                  <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium mb-2 block">Uploading for field:</label>
                  <select
                    value={selectedFieldId}
                    onChange={e => {
                      setSelectedFieldId(e.target.value);
                      const f = userFields.find(f => f._id === e.target.value);
                      if (f?.currentCrop) setCropType(f.currentCrop);
                    }}
                    className="w-full h-10 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[14px] outline-none focus:border-[#64B43C] transition-colors"
                  >
                    {userFields.map(f => (
                      <option key={f._id} value={f._id}>🌾 {f.fieldName || "Field"} — {f.currentCrop || ""}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-[8px] text-[13px]">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !cropType}
                className="w-full h-[48px] rounded-[10px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] font-medium text-[16px] hover:scale-[1.02] hover:bg-[#2A4A2A] dark:hover:bg-[#539630] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Upload size={20} /> Analyze Crop
              </button>
            </motion.div>
          )}

          {state === "analyzing" && (
            <motion.div key="s2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              <div className="relative h-[400px] w-full rounded-[14px] overflow-hidden border border-[#1A3A1A]/10 shadow-[0_4px_16px_rgba(26,58,26,0.1)]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Crop" className="w-full h-full object-cover grayscale" />
                ) : (
                  <div className="w-full h-full bg-[#E8F5E0] dark:bg-[#1A3A1A]" />
                )}
                
                {/* Overlay & Scanning Line */}
                <div className="absolute inset-0 bg-[#1A3A1A]/80 z-10 flex flex-col items-center justify-center gap-6">
                  <motion.div 
                    className="absolute top-0 left-0 right-0 h-1 bg-[#64B43C] shadow-[0_0_20px_4px_rgba(100,180,60,0.8)] z-20"
                    animate={{ y: [0, 400, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="w-16 h-16 rounded-full border-4 border-[#1A3A1A] border-t-[#64B43C] border-r-[#64B43C] animate-spin flex items-center justify-center relative">
                    <div className="w-8 h-8 rounded-full bg-[#1A3A1A] absolute inset-0 m-auto flex items-center justify-center">
                      <Search size={16} className="text-[#FAFBF7]" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center px-4">
                    <h3 className="font-heading text-[24px] text-[#FAFBF7] mb-2">{t("Analyzing your crop...", lang)}</h3>
                    <motion.p 
                      key={analyzingText}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[14px] text-[#E8F5E0]/80"
                    >
                      {analyzingText}
                    </motion.p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 z-30 bg-white p-2 rounded-[8px] text-[10px] text-[#1A3A1A] font-bold flex items-center gap-1.5 shadow-lg max-w-[120px]">
                  <Activity size={12} className="text-[#64B43C] shrink-0" />
                  This diagnosis will add to your Agri-Trust Score
                </div>
              </div>
            </motion.div>
          )}

          {state === "results" && result && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-6">
              
              {/* Score Impact Strip */}
              <div className="bg-[#1A3A1A] dark:bg-[#64B43C] text-[#FAFBF7] dark:text-[#1A3A1A] rounded-[14px] p-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_4px_16px_rgba(26,58,26,0.1)] overflow-hidden relative transition-colors duration-500">
                <motion.div 
                  className="absolute inset-0 bg-[#64B43C]/20 dark:bg-white/10"
                  animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <div className="flex items-center gap-3 z-10">
                  <div className="w-8 h-8 rounded-full bg-[#64B43C] dark:bg-[#1A3A1A] flex items-center justify-center text-[#1A3A1A] dark:text-white">
                    <span className="font-bold text-[14px]">✓</span>
                  </div>
                  <span className="text-[14px] font-medium">{t("Diagnosis complete — score updated!", lang)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DISEASE CARD */}
                <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] overflow-hidden relative flex flex-col transition-colors duration-500">
                  <div className={`h-1 w-full ${result.severity === "high" ? "bg-[#C0392B]" : result.severity === "medium" ? "bg-[#F39C12]" : "bg-[#27AE60]"}`} />
                  <div className="p-6 flex flex-col gap-4 relative">
                    {result.imageUrl && (
                      <img src={result.imageUrl} alt="Thumb" className="absolute top-6 right-6 w-16 h-16 rounded-[8px] object-cover border border-[#1A3A1A]/10 shadow-sm" />
                    )}
                    
                    <div>
                      {result.confidence && (
                        <div className="bg-[#1A3A1A]/5 dark:bg-white/10 text-[#1A3A1A] dark:text-white px-2.5 py-1 rounded-[6px] text-[11px] font-bold inline-flex items-center gap-1 mb-3 border border-[#1A3A1A]/10 dark:border-white/5">
                          <CheckCircle2 size={10} className="text-[#27AE60]" /> {Math.round(result.confidence || 0)}% confident
                        </div>
                      )}
                      <h2 className="font-heading text-[28px] text-[#1A3A1A] dark:text-white leading-tight pr-20">{result.diseaseDetected || "Unknown Disease"}</h2>
                      <div className={`px-2.5 py-1 rounded-full text-[12px] font-bold inline-flex mt-2 items-center gap-1 ${
                        result.severity === "high" ? "bg-[#C0392B]/10 text-[#C0392B]" : 
                        result.severity === "medium" ? "bg-[#F39C12]/10 text-[#D68910]" : 
                        "bg-[#27AE60]/10 text-[#27AE60]"
                      }`}>
                        <ShieldAlert size={12} /> {result.severity ? `${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} Severity` : ""}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1A3A1A]/10 dark:border-white/10 text-[13px] text-[#1A3A1A]/80 dark:text-white/80 leading-relaxed">
                      <strong className="text-[#1A3A1A] dark:text-white">{t("Treatment Plan", lang)}:</strong><br/>
                      {result.treatmentPlan || "Consult a local agricultural expert for specific treatment."}
                    </div>
                  </div>
                </div>

                {/* TREATMENT STEPS */}
                <div className="bg-[#FAFBF7] dark:bg-[#111e11] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm flex flex-col transition-colors duration-500">
                  <h3 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white mb-6">{t("Recommended Actions", lang)}</h3>

                  <div className="flex flex-col gap-4">
                    {(result.recommendedAction || []).map((action: string, i: number) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-[10px] transition-colors duration-500 ${i === (result.recommendedAction?.length || 1) - 1 ? 'bg-[#E8F5E0] dark:bg-[#64B43C]/20 border border-[#64B43C]/20' : 'bg-white dark:bg-[#1A3A1A] border border-[#1A3A1A]/5 dark:border-white/5'}`}>
                        <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors duration-500 ${i === (result.recommendedAction?.length || 1) - 1 ? 'bg-[#64B43C] text-white' : 'bg-[#1A3A1A]/10 dark:bg-white/10 text-[#1A3A1A] dark:text-white'}`}>
                          {i + 1}
                        </div>
                        <span className="text-[13px] font-medium text-[#1A3A1A]/90 dark:text-white/90">{action}</span>
                      </div>
                    ))}
                  </div>

                  {result.followupDate && (
                    <div className="mt-auto pt-6">
                      <div className="bg-white dark:bg-[#1A3A1A] p-3 rounded-[10px] border border-[#1A3A1A]/10 dark:border-white/10 flex items-center justify-between transition-colors duration-500">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-[#64B43C]" />
                          <span className="text-[12px] font-medium text-[#1A3A1A] dark:text-white">Follow up by {new Date(result.followupDate).toLocaleDateString()}</span>
                        </div>
                        <Clock size={14} className="text-[#6B7B5E]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnose Another */}
              <button
                onClick={() => { setState("ready"); setResult(null); setSelectedFile(null); setPreviewUrl(null); setError(""); }}
                className="w-full h-[44px] rounded-[10px] bg-white dark:bg-[#1A3A1A] text-[#1A3A1A] dark:text-white border border-[#1A3A1A]/10 dark:border-white/10 font-medium text-[14px] hover:bg-[#FAFBF7] dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Camera size={16} /> {t("Diagnose Another Crop", lang)}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </FarmerLayout>
  );
}
