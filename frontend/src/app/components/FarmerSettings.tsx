import { useState } from "react";
import FarmerLayout from "./FarmerLayout";
import { Globe, User, Lock, Bell, ChevronRight, Check, Loader2 } from "lucide-react";
import { auth as authApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { t, type Language } from "../i18n/translations";

const LANGUAGES = [
  { code: "english", label: "English", native: "English" },
  { code: "hindi", label: "Hindi", native: "हिन्दी" },
  { code: "marathi", label: "Marathi", native: "मराठी" },
  { code: "punjabi", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "tamil", label: "Tamil", native: "தமிழ்" },
  { code: "telugu", label: "Telugu", native: "తెలుగు" },
  { code: "kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "gujarati", label: "Gujarati", native: "ગુજરાતી" },
];

export default function FarmerSettings() {
  const { farmerUser, refreshFarmerProfile } = useAuth();

  const [language, setLanguage] = useState(farmerUser?.language || "english");
  const lang = (farmerUser?.language || "english") as Language;
  const [name, setName] = useState(farmerUser?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await authApi.updateProfile({ name, language });
      await refreshFarmerProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FarmerLayout>
      <div className="flex flex-col gap-8 pb-20 md:pb-0 max-w-[600px] mx-auto">
        <header>
          <h1 className="font-heading text-[32px] text-[#1A3A1A] dark:text-white leading-tight transition-colors duration-500">{t("Settings", lang)}</h1>
          <p className="text-[14px] text-[#6B7B5E] dark:text-[#A4B598] mt-1 transition-colors duration-500">{t("Manage your profile and preferences", lang)}</p>
        </header>

        {/* PROFILE SECTION */}
        <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm transition-colors duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center text-[#1A3A1A] dark:text-white">
              <User size={18} />
            </div>
            <h2 className="font-heading text-[18px] text-[#1A3A1A] dark:text-white">{t("Profile", lang)}</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-10 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#1A3A1A] dark:text-white text-[14px] outline-none focus:border-[#64B43C] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#6B7B5E] dark:text-[#A4B598] font-medium">Phone Number</label>
              <div className="h-10 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#C5D5B5] dark:border-white/10 text-[#6B7B5E] dark:text-white/50 text-[14px] flex items-center">
                +91 {farmerUser?.phone || "—"}
              </div>
            </div>

            <div className="flex items-center justify-between text-[13px] text-[#6B7B5E] dark:text-white/50 py-2 border-t border-[#C5D5B5]/30 dark:border-white/5 mt-2">
              <span>Village: {farmerUser?.village || "—"} · State: {farmerUser?.state || "—"}</span>
              <span>Land: {farmerUser?.landsize || "—"} acres</span>
            </div>
          </div>
        </div>

        {/* LANGUAGE SECTION */}
        <div className="bg-white dark:bg-[#1A3A1A] rounded-[14px] border border-[rgba(26,58,26,0.1)] dark:border-white/10 p-6 shadow-sm transition-colors duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#E8F5E0] dark:bg-white/10 flex items-center justify-center text-[#1A3A1A] dark:text-white">
              <Globe size={18} />
            </div>
            <h2 className="font-heading text-[18px] text-[#1A3A1A] dark:text-white">{t("Language Preference", lang)}</h2>
          </div>

          <p className="text-[13px] text-[#6B7B5E] dark:text-white/60 mb-4">Diagnosis results and treatment plans will be translated to your preferred language.</p>

          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center justify-between px-4 py-3 rounded-[10px] border text-[14px] transition-all ${
                  language === lang.code
                    ? "bg-[#E8F5E0] dark:bg-[#64B43C]/20 border-[#64B43C] text-[#1A3A1A] dark:text-white"
                    : "bg-[#FAFBF7] dark:bg-[#111E11] border-[#C5D5B5] dark:border-white/10 text-[#6B7B5E] dark:text-white/60 hover:border-[#64B43C]"
                }`}
              >
                <span className="flex flex-col items-start">
                  <span className="font-medium">{lang.label}</span>
                  <span className="text-[11px] opacity-60">{lang.native}</span>
                </span>
                {language === lang.code && <Check size={16} className="text-[#64B43C]" />}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-[8px] text-[13px]">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-[#E8F5E0] dark:bg-[#64B43C]/20 border border-[#64B43C]/30 text-[#1A3A1A] dark:text-white px-4 py-3 rounded-[8px] text-[13px] flex items-center gap-2">
            <Check size={16} className="text-[#64B43C]" /> Settings saved successfully!
          </div>
        )}

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-[48px] rounded-[10px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] font-medium text-[16px] hover:scale-[1.02] hover:bg-[#2A4A2A] dark:hover:bg-[#539630] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : t("Save Changes", lang)}
        </button>
      </div>
    </FarmerLayout>
  );
}
