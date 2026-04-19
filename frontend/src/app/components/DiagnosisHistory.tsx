import { useState, useEffect } from "react";
import { motion } from "motion/react";
import FarmerLayout from "./FarmerLayout";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Search, LayoutGrid, List, ChevronRight, Clock, CheckCircle2, Leaf, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { diagnosis as diagnosisApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { t, type Language } from "../i18n/translations";

export default function DiagnosisHistory() {
  const navigate = useNavigate();
  const { farmerUser } = useAuth();
  const lang = (farmerUser?.language || "english") as Language;
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    diagnosisApi.getAll()
      .then((data) => {
        const list = data.diagnoses || data || [];
        setDiagnoses(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filtered = diagnoses.filter((d) => {
    const isHealthy = !d.diseaseDetected || d.diseaseDetected === "Healthy";
    if (filter === "Healthy" && !isHealthy) return false;
    if (filter === "Diseased" && isHealthy) return false;
    if (filter === "Follow-ups Pending" && !d.followupDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (d.diseaseDetected || "").toLowerCase().includes(q) || (d.cropType || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Group by month for list view
  const grouped: Record<string, any[]> = {};
  filtered.forEach((d) => {
    const date = new Date(d.createdAt);
    const key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  const severityToColor = (s: string) => {
    if (s === "high") return "red";
    if (s === "medium") return "amber";
    return "green";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
    return `${Math.floor(days / 30)} month(s) ago`;
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
      <div className="flex flex-col gap-8 pb-20 md:pb-0 h-full">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div>
            <h1 className="font-heading text-[32px] text-[#1A3A1A] dark:text-white leading-tight transition-colors duration-500">{t("Your Crop Journal", lang)}</h1>
            <p className="text-[14px] text-[#6B7B5E] dark:text-[#A4B598] mt-1 transition-colors duration-500">{diagnoses.length} {t("diagnoses recorded", lang)}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7B5E] dark:text-white/50" size={16} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("Search disease or crop...", lang)} className="w-full h-10 pl-9 pr-4 rounded-[8px] bg-white dark:bg-[#1A3A1A] dark:text-white border border-[#1A3A1A]/10 dark:border-white/10 text-[13px] outline-none focus:border-[#64B43C] transition-colors duration-500" />
            </div>

            <div className="flex bg-[#E8F5E0] dark:bg-black/30 p-1 rounded-[8px] border border-[#64B43C]/20 shrink-0 self-start transition-colors duration-500">
              <button onClick={() => setView("grid")} className={`px-3 py-1.5 rounded-[6px] flex items-center justify-center transition-colors duration-500 ${view === "grid" ? "bg-white dark:bg-[#64B43C] text-[#1A3A1A] dark:text-white shadow-sm" : "text-[#6B7B5E] dark:text-white/50 hover:text-[#1A3A1A] dark:hover:text-white"}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-[6px] flex items-center justify-center transition-colors duration-500 ${view === "list" ? "bg-white dark:bg-[#64B43C] text-[#1A3A1A] dark:text-white shadow-sm" : "text-[#6B7B5E] dark:text-white/50 hover:text-[#1A3A1A] dark:hover:text-white"}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar shrink-0">
          {["All", "Healthy", "Diseased", "Follow-ups Pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-colors duration-500 border ${filter === f ? "bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] border-[#1A3A1A] dark:border-[#64B43C]" : "bg-white dark:bg-[#1A3A1A] text-[#6B7B5E] dark:text-[#A4B598] border-[#1A3A1A]/10 dark:border-white/10 hover:border-[#64B43C] dark:hover:border-[#64B43C]"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Leaf size={64} className="text-[#E8F5E0] dark:text-[#A4B598] mb-6 transition-colors duration-500" />
              <h2 className="font-heading text-[28px] text-[#1A3A1A] dark:text-white mb-2 transition-colors duration-500">
                {diagnoses.length === 0 ? "Your crop journal is waiting" : "No matches found"}
              </h2>
              <p className="text-[16px] text-[#6B7B5E] dark:text-white/60 max-w-[400px] mb-8 transition-colors duration-500">
                {diagnoses.length === 0 ? "Every photo you upload tells the story of your farming. Start today." : "Try adjusting your filters or search query."}
              </p>
              {diagnoses.length === 0 && (
                <Link to="/diagnose" className="px-6 py-3 rounded-[10px] bg-[#1A3A1A] text-white flex items-center gap-2 font-medium hover:bg-[#2A4A2A] transition-colors">
                  Take your first photo <ArrowRight size={18} />
                </Link>
              )}
            </div>
          ) : view === "grid" ? (
            <ResponsiveMasonry columnsCountBreakPoints={{ 300: 1, 600: 2, 900: 3 }}>
              <Masonry gutter="16px">
                {filtered.map((item, i) => {
                  const isHealthy = !item.diseaseDetected || item.diseaseDetected === "Healthy";
                  const sevColor = item.severity === "high" ? "bg-[#C0392B]" : item.severity === "medium" ? "bg-[#F39C12]" : "bg-[#27AE60]";
                  return (
                    <motion.div 
                      key={item._id || i} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-[#1A3A1A] rounded-[14px] overflow-hidden border border-[#1A3A1A]/10 dark:border-white/10 shadow-[0_2px_8px_rgba(26,58,26,0.04)] relative group cursor-pointer transition-colors duration-500"
                      onClick={() => navigate(`/diagnosis/${item._id}`)}
                    >
                      {item.followupDate && (
                        <div className="absolute top-0 left-0 right-0 bg-[#F39C12] text-white text-[11px] font-bold py-1 px-3 text-center z-20 shadow-sm flex items-center justify-center gap-1">
                          <Clock size={12} /> Follow-up due
                        </div>
                      )}
                      {isHealthy && (
                        <div className="absolute top-3 right-3 bg-[#27AE60] text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-md">
                          <CheckCircle2 size={14} />
                        </div>
                      )}

                      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8F5E0]">
                        <img src={item.imageUrl || "https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?w=400&q=80"} alt={item.diseaseDetected || "Crop"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>

                      <div className="p-4 bg-white dark:bg-[#1A3A1A] relative z-10 transition-colors duration-500">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-[#6B7B5E] dark:text-white/50">{timeAgo(item.createdAt)} · {item.cropType || ""}</span>
                          <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${isHealthy ? "bg-[#27AE60]" : item.severity === "high" ? "bg-[#C0392B]" : "bg-[#F39C12]"}`} />
                        </div>
                        <h4 className="font-heading text-[18px] text-[#1A3A1A] dark:text-white">{item.diseaseDetected || "Unknown"}</h4>
                        
                        <div className="overflow-hidden h-0 group-hover:h-10 transition-all duration-300 flex items-end">
                          <span className="text-[#64B43C] text-[13px] font-medium flex items-center gap-1">{t("View full diagnosis", lang)} <ArrowRight size={14} /></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </Masonry>
            </ResponsiveMasonry>
          ) : (
            <div className="flex flex-col">
              {Object.entries(grouped).map(([month, items]) => (
                <div key={month} className="mb-8">
                  <div className="sticky top-0 bg-[#FAFBF7] dark:bg-[#111E11] py-2 z-10 transition-colors duration-500">
                    <span className="text-[13px] text-[#6B7B5E] dark:text-[#A4B598] uppercase tracking-wider font-medium">{month}</span>
                  </div>
                  
                  <div className="flex flex-col gap-0 relative">
                    <div className="absolute left-[38px] top-6 bottom-0 w-px bg-[#C5D5B5] dark:bg-white/10" />

                    {items.map((item, i) => {
                      const isHealthy = !item.diseaseDetected || item.diseaseDetected === "Healthy";
                      const dayOfMonth = new Date(item.createdAt).getDate();
                      return (
                        <motion.div key={item._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-6 py-4 relative group cursor-pointer" onClick={() => navigate(`/diagnosis/${item._id}`)}>
                          <div className="w-[80px] shrink-0 text-right pr-4 relative">
                            <span className="font-heading text-[28px] text-[#1A3A1A] dark:text-white leading-none group-hover:text-[#64B43C] dark:group-hover:text-[#64B43C] transition-colors">{dayOfMonth}</span>
                            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-white dark:border-[#111E11] bg-[#1A3A1A] dark:bg-white z-10 group-hover:bg-[#64B43C] dark:group-hover:bg-[#64B43C] transition-colors" />
                          </div>
                          
                          <div className="flex-1 bg-white dark:bg-[#1A3A1A] p-3 rounded-[12px] border border-[#1A3A1A]/10 dark:border-white/5 shadow-[0_2px_8px_rgba(26,58,26,0.04)] flex items-center gap-4 hover:border-[#64B43C]/40 transition-colors duration-500">
                            <img src={item.imageUrl || "https://images.unsplash.com/photo-1741874299706-2b8e16839aaa?w=400&q=80"} alt="Thumb" className="w-12 h-12 rounded-[6px] object-cover shrink-0" />
                            <div className="flex-1 flex flex-col">
                              <span className="font-heading text-[18px] text-[#1A3A1A] dark:text-white leading-tight">{item.diseaseDetected || "Unknown"}</span>
                              <span className="text-[12px] text-[#6B7B5E] dark:text-white/50">{item.cropType || ""}</span>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-[12px] font-bold transition-colors duration-500 ${isHealthy ? 'bg-[#E8F5E0] dark:bg-[#64B43C]/20 text-[#1A3A1A] dark:text-[#64B43C] border border-[#64B43C]/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#A4B598]'}`}>
                              {isHealthy ? '+ pts' : item.severity || 'Medium'}
                            </div>
                            
                            <ChevronRight size={18} className="text-[#6B7B5E] dark:text-white/50 group-hover:text-[#1A3A1A] dark:group-hover:text-white ml-2 transition-colors" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}
