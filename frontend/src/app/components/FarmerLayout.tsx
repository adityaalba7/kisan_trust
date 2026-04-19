import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Camera, History, BarChart2, Settings, Globe, Bell, Menu, Sun, Moon, LogOut, FileText } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { diagnosis as diagnosisApi } from "../services/api";
import { t, getLangLabel, type Language } from "../i18n/translations";
import ChatWidget from "./ChatWidget";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { isDarkTheme, toggleTheme } = useTheme();
  const { farmerUser, farmerLogout } = useAuth();

  const displayName = farmerUser?.name || "Farmer";
  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const village = farmerUser?.village || "";
  const state = farmerUser?.state ? farmerUser.state.slice(0, 2).toUpperCase() : "";
  const scoreValue = farmerUser?.agriTrustScore ?? 0;
  const lang = (farmerUser?.language || "english") as Language;

  // Fetch latest weather from most recent diagnosis
  const [weather, setWeather] = useState<{temperature?: number; condition?: string} | null>(null);
  useEffect(() => {
    diagnosisApi.getAll().then((data) => {
      const list = data.diagnoses || data || [];
      if (Array.isArray(list) && list.length > 0 && list[0].weather) {
        setWeather(list[0].weather);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await farmerLogout();
    navigate("/login");
  };

  const navItems = [
    { id: "/dashboard", label: t("Dashboard", lang), icon: LayoutDashboard },
    { id: "/diagnose", label: t("Diagnose Crop", lang), icon: Camera },
    { id: "/history", label: t("My Log", lang), icon: History },
    { id: "/loan-apply", label: "Apply for Loan", icon: FileText },
    { id: "/score", label: t("Score Details", lang), icon: BarChart2 },
    { id: "/settings", label: t("Settings", lang), icon: Settings },
  ];

  // Determine greeting by hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("Good morning", lang) : hour < 17 ? t("Good afternoon", lang) : t("Good evening", lang);

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${isDarkTheme ? "bg-[#111E11]" : "bg-[#FAFBF7]"}`}>
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#1A3A1A] shrink-0 h-full relative z-20">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8B5E3C] flex items-center justify-center text-[#E8F5E0] font-heading text-[16px]">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-[#FAFBF7] font-medium text-[14px]">{displayName}</span>
            <span className="text-white/60 text-[12px]">{village}{state ? `, ${state}` : ""}</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-2 relative">
          {navItems.map((item) => {
            const isActive = path === item.id;
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] transition-colors ${
                  isActive ? "text-[#E8F5E0]" : "text-white/60 hover:text-white/90"
                }`}
              >
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-white/10 rounded-[8px] border-l-[3px] border-[#64B43C]"
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-4">
          <Link to="/settings" className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-[6px] text-white/70 text-[12px] hover:bg-white/10 transition-colors border border-white/10">
            <span className="flex items-center gap-2"><Globe size={14} /> {t("Language Preference", lang)}</span>
            <span className="font-bold text-[#64B43C]">{getLangLabel(lang)}</span>
          </Link>
          
          <div className="bg-[#111E11] p-3 rounded-[10px] border border-white/5 flex items-center justify-between">
            <span className="text-[12px] text-white/60">{t("Agri-Trust Score", lang)}</span>
            <span className="text-[#64B43C] font-heading font-bold text-[18px]">{scoreValue}</span>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-white/50 text-[12px] hover:bg-white/10 hover:text-white/90 transition-colors">
            <LogOut size={14} /> {t("Logout", lang)}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP GREETING BAR */}
        <header className={`h-[72px] shrink-0 flex items-center justify-between px-6 lg:px-8 z-10 border-b transition-colors duration-500 ${isDarkTheme ? "bg-[#1A3A1A] border-white/5" : "bg-[#FAFBF7] border-[rgba(26,58,26,0.06)]"}`}>
          <div className="flex items-center gap-4">
            <button className={`md:hidden ${isDarkTheme ? "text-white" : "text-[#1A3A1A]"}`}>
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className={`font-heading text-[24px] leading-tight transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#1A3A1A]"}`}>{greeting}, {firstName} 🌱</h2>
              <p className={`text-[13px] hidden sm:block ${isDarkTheme ? "text-white/60" : "text-[#6B7B5E]"}`}>{t("Your crop health dashboard is ready.", lang)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-[10px] border shadow-[0_2px_8px_rgba(26,58,26,0.04)] text-[13px] font-medium transition-colors duration-500 ${isDarkTheme ? "bg-[#234523] border-white/5 text-white" : "bg-white border-[rgba(26,58,26,0.1)] text-[#1A3A1A]"}`}>
              <span className="text-[16px]">{weather?.condition?.includes("Rain") ? "🌧️" : weather?.condition?.includes("Cloud") ? "☁️" : "🌤️"}</span>
              {weather ? `${Math.round(weather.temperature || 0)}°C · ${weather.condition || "—"}` : t("Weather N/A", lang)}
            </div>
            
            <button onClick={toggleTheme} className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-500 ${isDarkTheme ? "bg-[#234523] border-white/5 text-white hover:bg-white/10" : "bg-white border-[rgba(26,58,26,0.1)] shadow-[0_2px_8px_rgba(26,58,26,0.04)] text-[#1A3A1A] hover:bg-[#FAFBF7]"}`}>
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className={`relative w-10 h-10 rounded-full border shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex items-center justify-center transition-colors duration-500 ${isDarkTheme ? "bg-[#234523] border-white/5 text-white hover:bg-white/10" : "bg-white border-[rgba(26,58,26,0.1)] text-[#1A3A1A] hover:bg-[#FAFBF7]"}`}>
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C0392B]" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-10 lg:py-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[#1A3A1A] border-t border-[#111E11] flex items-center justify-around px-2 z-50">
        {[
          { id: "/dashboard", icon: LayoutDashboard },
          { id: "/history", icon: History },
          { id: "/diagnose", icon: Camera, center: true },
          { id: "/score", icon: BarChart2 },
          { id: "/settings", icon: Settings },
        ].map((item, i) => (
          <Link key={i} to={item.id} className="relative flex flex-col items-center justify-center w-12 h-12">
            {item.center ? (
              <div className="absolute -top-6 w-14 h-14 rounded-full bg-[#64B43C] flex items-center justify-center text-[#1A3A1A] border-4 border-[#FAFBF7] shadow-lg hover:scale-105 transition-transform">
                <item.icon size={24} />
              </div>
            ) : (
              <item.icon size={22} className={path === item.id ? "text-[#64B43C]" : "text-white/50"} />
            )}
          </Link>
        ))}
      </div>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </div>
  );
}
