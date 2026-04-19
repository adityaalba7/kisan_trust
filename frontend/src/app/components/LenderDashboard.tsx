import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Bell, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, TrendingUp, Users, FileText, ArrowRight, X, Maximize2, MapPin, Sun, Moon, Loader2, LogOut, MessageCircle, Send, ArrowLeft } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { lender as lenderApi, loans as loansApi, chat as chatApi } from "../services/api";
import { connectSocket, sendMessage, emitTyping, emitStopTyping, disconnectSocket } from "../services/socket";

export default function LenderDashboard() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const { lenderUser, lenderLogout } = useAuth();
  const navigate = useNavigate();

  const [searchPhone, setSearchPhone] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFarmers, setSelectedFarmers] = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFarmer, setActiveFarmer] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Loan state
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanProcessing, setLoanProcessing] = useState(false);
  const [loanSuccess, setLoanSuccess] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"search" | "applications">("search");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState("");

  // Chat in drawer
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const handleSearch = async () => {
    if (!searchPhone.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const data = await lenderApi.viewFarmer(searchPhone.trim());
      if (data.farmer) {
        // Check if already in list
        const existing = searchResults.find(f => f.phone === data.farmer.phone);
        if (!existing) {
          setSearchResults(prev => [{ ...data.farmer, scoreBreakdown: data.scoreBreakdown, fields: data.fields, recentDiagnoses: data.recentDiagnoses }, ...prev]);
        }
      }
    } catch (err: any) {
      setSearchError(err.message || "Farmer not found");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleFarmer = (idx: number) => {
    setSelectedFarmers(prev => {
      if (prev.includes(idx)) return prev.filter(f => f !== idx);
      if (prev.length < 3) return [...prev, idx];
      return prev;
    });
  };

  const openProfile = (farmer: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFarmer(farmer);
    setDrawerOpen(true);
    setLoanSuccess("");
  };

  const handleLoan = async () => {
    if (!activeFarmer || !loanAmount) return;
    setLoanProcessing(true);
    try {
      await lenderApi.processLoan({
        farmerPhone: activeFarmer.phone,
        amountRequested: parseFloat(loanAmount),
        purpose: loanPurpose || "Agricultural loan",
        status: "approved",
      });
      setLoanSuccess(`Loan of ₹${loanAmount} approved for ${activeFarmer.name}!`);
    } catch (err: any) {
      setSearchError(err.message || "Loan processing failed");
    } finally {
      setLoanProcessing(false);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const data = await loansApi.getLeaderboard();
      setLeaderboard(data.applications || []);
    } catch { }
    setLeaderboardLoading(false);
  };

  // Review application
  const handleReview = async (appId: string, status: string) => {
    setReviewingId(appId);
    try {
      await loansApi.review(appId, { status });
      loadLeaderboard(); // refresh
    } catch { }
    setReviewingId("");
  };

  // Open chat with farmer in drawer
  const openChatInDrawer = async (farmerId: string) => {
    setChatOpen(true);
    setChatLoading(true);
    setChatMessages([]);
    try {
      const socket = connectSocket();
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("partner_typing");
      socket.off("partner_stop_typing");
      socket.on("receive_message", (msg: any) => setChatMessages(prev => [...prev, msg]));
      socket.on("message_sent", (msg: any) => {
        setChatMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
      });
      socket.on("partner_typing", () => setPartnerTyping(true));
      socket.on("partner_stop_typing", () => setPartnerTyping(false));

      const data = await chatApi.getMessages(farmerId, "lender");
      setChatMessages(data.messages || []);
    } catch { }
    setChatLoading(false);
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || !activeFarmer) return;
    const farmerId = activeFarmer._id || activeFarmer.id;
    sendMessage(farmerId, "farmer", chatInput.trim(), lenderUser?.organizationName || "Lender");
    setChatInput("");
    emitStopTyping(farmerId, "farmer");
  };

  const handleLogout = () => {
    lenderLogout();
    navigate("/lender-login");
  };

  // Generate radar chart data from selected farmers
  const chartData = [
    { subject: 'Location', A: 0, B: 0, fullMark: 100 },
    { subject: 'Frequency', A: 0, B: 0, fullMark: 100 },
    { subject: 'Improvement', A: 0, B: 0, fullMark: 100 },
    { subject: 'Seasonal', A: 0, B: 0, fullMark: 100 },
    { subject: 'Response', A: 0, B: 0, fullMark: 100 },
  ];

  // Fill chart data from selected farmers' score breakdowns
  selectedFarmers.forEach((idx, fi) => {
    const farmer = searchResults[idx];
    if (farmer?.scoreBreakdown) {
      const bd = farmer.scoreBreakdown;
      const key = fi === 0 ? "A" : "B";
      chartData[0][key] = Math.round(((bd.locationConsistency?.score || 0) / 15) * 100);
      chartData[1][key] = Math.round(((bd.diagnosisFrequency?.score || 0) / 30) * 100);
      chartData[2][key] = Math.round(((bd.improvementRate?.score || 0) / 25) * 100);
      chartData[3][key] = Math.round(((bd.seasonalManagement?.score || 0) / 20) * 100);
      chartData[4][key] = Math.round(((bd.responseTime?.score || 0) / 10) * 100);
    }
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B120B] flex flex-col font-sans transition-colors duration-500">
      {/* TOP BAR */}
      <header className="h-[64px] bg-white dark:bg-[#111E11] border-b border-[#E2E8F0] dark:border-white/10 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 transition-colors duration-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#1A3A1A] dark:bg-[#64B43C] flex items-center justify-center text-white dark:text-[#1A3A1A]"><ShieldCheck size={16} /></div>
            <span className="font-heading text-[18px] text-[#1A3A1A] dark:text-white">KisanTrust</span>
          </div>
          <div className="bg-[#F1F5F9] dark:bg-white/10 text-[#64748B] dark:text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide">Lender Portal</div>
        </div>

        <div className="flex-1 max-w-[500px] mx-8 relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/50" />
          <input
            type="text"
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search farmer by phone number..."
            className="w-full h-10 pl-9 pr-20 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1A3A1A] border border-[#E2E8F0] dark:border-white/10 focus:border-[#64B43C] focus:bg-white dark:focus:bg-[#1A3A1A] dark:text-white transition-colors outline-none text-[13px]"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] rounded-[4px] text-[11px] font-bold hover:bg-[#2A4A2A] dark:hover:bg-[#539630] transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#1A3A1A] dark:text-white hidden sm:block">{lenderUser?.organizationName || "Lender"}</span>
            <div className="bg-[#E8F5E0] dark:bg-[#1A3A1A] text-[#1A3A1A] dark:text-white px-2 py-1 rounded-[4px] text-[11px] font-bold flex items-center gap-1 border border-[#64B43C]/20 dark:border-white/10 transition-colors duration-500">
              <CheckCircle2 size={12} className="text-[#27AE60]" /> Verified
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full border transition-all flex items-center justify-center mr-2 ${isDarkTheme ? 'bg-[#1A3A1A] text-[#FAFBF7] border-[#64B43C]/30 hover:bg-[#64B43C]/20' : 'bg-[#E2E8F0] text-[#1A3A1A] border-[#CBD5E1] hover:bg-[#CBD5E1]'}`}
              title="Toggle Theme"
            >
              {isDarkTheme ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full border border-[#E2E8F0] dark:border-white/10 text-[#64748B] dark:text-white/70 hover:text-[#1A3A1A] dark:hover:text-white transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
        
        {searchError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-[8px] text-[13px] flex items-center gap-2">
            <AlertTriangle size={16} /> {searchError}
            <button onClick={() => setSearchError("")} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* TAB BAR */}
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setActiveTab("search")} className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all flex items-center gap-2 ${activeTab === "search" ? "bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A]" : "bg-white dark:bg-[#111E11] text-[#64748B] dark:text-white/60 border border-[#E2E8F0] dark:border-white/10 hover:border-[#64B43C]"}`}>
            <Search size={14} /> Search Farmers
          </button>
          <button onClick={() => { setActiveTab("applications"); loadLeaderboard(); }} className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all flex items-center gap-2 ${activeTab === "applications" ? "bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A]" : "bg-white dark:bg-[#111E11] text-[#64748B] dark:text-white/60 border border-[#E2E8F0] dark:border-white/10 hover:border-[#64B43C]"}`}>
            <FileText size={14} /> Loan Applications
            {leaderboard.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-[#C0392B] text-white text-[10px] font-bold flex items-center justify-center">{leaderboard.length}</span>}
          </button>
        </div>

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[20px] text-[#1A3A1A] dark:text-white">Loan Applications — Ranked by Agri-Trust Score</h2>
              <button onClick={loadLeaderboard} className="text-[12px] text-[#64B43C] font-medium hover:underline">Refresh</button>
            </div>

            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#64B43C]" /></div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText size={48} className="text-[#E2E8F0] dark:text-white/20 mb-4" />
                <p className="text-[14px] text-[#64748B] dark:text-white/60">No pending loan applications yet</p>
              </div>
            ) : (
              leaderboard.map((app, idx) => {
                const f = app.farmer;
                if (!f) return null;
                const scorePct = Math.round((f.agriTrustScore / 850) * 100);
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-[#111E11] rounded-[12px] border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm transition-colors duration-500"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${idx === 0 ? "bg-[#F39C12]/20 text-[#F39C12]" : idx === 1 ? "bg-[#95A5A6]/20 text-[#95A5A6]" : idx === 2 ? "bg-[#E67E22]/20 text-[#E67E22]" : "bg-[#E2E8F0] dark:bg-white/10 text-[#64748B] dark:text-white/60"}`}>
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading text-[16px] text-[#1A3A1A] dark:text-white">{f.name}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8F5E0] dark:bg-[#64B43C]/20 text-[#64B43C] font-bold">Score: {f.agriTrustScore}/850</span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-[#64748B] dark:text-white/50 mt-1 flex-wrap">
                            <span>{f.village}, {f.state}</span>
                            <span>·</span>
                            <span>{f.landsize} acres</span>
                            <span>·</span>
                            <span>📞 {f.phone}</span>
                            {app.stats && <><span>·</span><span>{app.stats.totalDiagnoses} diagnoses</span></>}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[14px] font-bold text-[#1A3A1A] dark:text-white">₹{app.amountRequested?.toLocaleString()}</span>
                            <span className="text-[12px] text-[#64748B] dark:text-white/40 capitalize">{app.purpose}</span>
                            {app.cropType && <span className="text-[12px] text-[#64748B] dark:text-white/40">· {app.cropType}</span>}
                          </div>
                          {app.description && <p className="text-[12px] text-[#64748B] dark:text-white/40 mt-1 italic">"{app.description}"</p>}
                          {/* Score bar */}
                          <div className="mt-3 h-2 w-full max-w-[200px] bg-[#E2E8F0] dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#64B43C] rounded-full transition-all" style={{ width: `${scorePct}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleReview(app._id, "approved")}
                          disabled={reviewingId === app._id}
                          className="px-4 py-2 rounded-[8px] bg-[#27AE60] text-white text-[12px] font-bold hover:bg-[#219653] transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReview(app._id, "rejected")}
                          disabled={reviewingId === app._id}
                          className="px-4 py-2 rounded-[8px] bg-white dark:bg-[#1A3A1A] text-[#C0392B] border border-[#C0392B]/20 text-[12px] font-bold hover:bg-[#C0392B]/10 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          onClick={() => {
                            setActiveFarmer({ _id: f._id, name: f.name, phone: f.phone, village: f.village, agriTrustScore: f.agriTrustScore });
                            setDrawerOpen(true);
                            openChatInDrawer(f._id);
                          }}
                          className="px-4 py-2 rounded-[8px] bg-[#E8F5E0] dark:bg-[#64B43C]/20 text-[#1A3A1A] dark:text-white text-[12px] font-bold hover:bg-[#64B43C]/30 transition-colors flex items-center gap-1"
                        >
                          <MessageCircle size={14} /> Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* SEARCH TAB (existing content) */}
        {activeTab === "search" && (<>
        {/* SUMMARY ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white dark:bg-[#111E11] p-4 rounded-[10px] border border-[#E2E8F0] dark:border-white/10 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[12px] font-medium text-[#64748B] dark:text-[#A4B598]">Farmers searched</span>
              <Users size={16} className="text-[#94A3B8] dark:text-white/50" />
            </div>
            <span className="text-[28px] font-bold text-[#1E293B] dark:text-white leading-none">{searchResults.length}</span>
          </div>
          
          <div className="bg-white dark:bg-[#111E11] p-4 rounded-[10px] border border-[#E2E8F0] dark:border-white/10 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[12px] font-medium text-[#64748B] dark:text-[#A4B598]">Selected for comparison</span>
              <FileText size={16} className="text-[#94A3B8] dark:text-white/50" />
            </div>
            <span className="text-[28px] font-bold text-[#1E293B] dark:text-white leading-none">{selectedFarmers.length}</span>
          </div>
          
          <div className="bg-white dark:bg-[#111E11] p-4 rounded-[10px] border border-[#E2E8F0] dark:border-white/10 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[12px] font-medium text-[#64748B] dark:text-[#A4B598]">Average Trust Score</span>
              <TrendingUp size={16} className="text-[#94A3B8] dark:text-white/50" />
            </div>
            <span className="text-[28px] font-heading text-[#1A3A1A] dark:text-white leading-none">
              {searchResults.length > 0 ? Math.round(searchResults.reduce((sum, f) => sum + (f.agriTrustScore || 0), 0) / searchResults.length) : "—"}
            </span>
          </div>
          
          <div className="bg-[#F0FDF4] dark:bg-[#1A3A1A] p-4 rounded-[10px] border border-[#BBF7D0] dark:border-[#64B43C]/20 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[12px] font-medium text-[#166534] dark:text-[#A4B598]">Search a farmer</span>
              <Search size={16} className="text-[#27AE60]" />
            </div>
            <span className="text-[13px] text-[#166534] dark:text-[#A4B598]">Enter phone number above to view verified farm data</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          
          {/* FARMER LIST (60%) */}
          <div className="lg:w-[60%] flex flex-col gap-4 bg-white dark:bg-[#111E11] border border-[#E2E8F0] dark:border-white/10 rounded-[12px] shadow-sm overflow-hidden flex-1 transition-colors duration-500">
            <div className="p-5 border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1A3A1A] transition-colors duration-500">
              <h2 className="font-heading text-[20px] text-[#1E293B] dark:text-white">Farmers Found</h2>
              <span className="text-[12px] text-[#64748B] dark:text-white/60">{searchResults.length} results</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] dark:text-white/50">
                  <Users size={48} className="mb-4 text-[#CBD5E1] dark:text-white/20" />
                  <p className="text-[14px]">Search for farmers by phone number</p>
                  <p className="text-[12px] mt-2">Data appears here after a search</p>
                </div>
              ) : (
                searchResults.map((farmer, i) => (
                  <div 
                    key={farmer._id || i} 
                    onClick={() => toggleFarmer(i)}
                    className={`relative p-3 rounded-[8px] border transition-all cursor-pointer group flex items-center gap-4 ${selectedFarmers.includes(i) ? 'border-[#64B43C] bg-[#F0FDF4] dark:bg-[#1A3A1A] dark:border-[#64B43C] shadow-sm' : 'border-[#E2E8F0] dark:border-white/5 hover:border-[#CBD5E1] dark:hover:border-white/20 hover:bg-[#F8FAFC] dark:hover:bg-[#1A3A1A]'}`}
                  >
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-3 w-[200px] shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-heading text-[14px]">
                        {(farmer.name || "?").split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1E293B] dark:text-white text-[14px] leading-tight transition-colors">{farmer.name}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#A4B598] transition-colors">{farmer.village || ""}{farmer.state ? `, ${farmer.state}` : ""}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 shrink-0 w-[100px]">
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke={isDarkTheme ? "#1A3A1A" : "#E2E8F0"} strokeWidth="12" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#64B43C" strokeWidth="12" strokeDasharray="251" strokeDashoffset={251 * (1 - (farmer.agriTrustScore || 0)/850)} strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="font-heading text-[18px] text-[#1E293B] dark:text-white transition-colors">{farmer.agriTrustScore || 0}</span>
                    </div>

                    {/* Crops */}
                    <div className="flex gap-1 flex-1 min-w-0">
                      {(farmer.cropTypes || []).slice(0, 3).map((c: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-[#1A3A1A] text-[#475569] dark:text-white rounded-[4px] text-[10px] font-medium border border-[#E2E8F0] dark:border-white/10 truncate max-w-[60px] transition-colors">{c}</span>
                      ))}
                    </div>

                    {/* Action Button (Hover) */}
                    <button 
                      onClick={(e) => openProfile(farmer, e)}
                      className="absolute right-4 opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white dark:bg-[#1A3A1A] border border-[#CBD5E1] dark:border-white/20 rounded-[6px] text-[12px] font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-all shadow-sm z-10"
                    >
                      View Profile
                    </button>

                    {selectedFarmers.includes(i) && (
                      <div className="absolute top-2 right-2 bg-[#64B43C] text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center z-10">
                        <CheckCircle2 size={10} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPARISON PANEL (40%) */}
          <div className="lg:w-[40%] bg-white dark:bg-[#111E11] border border-[#E2E8F0] dark:border-white/10 rounded-[12px] shadow-sm flex flex-col overflow-hidden transition-colors duration-500">
            <div className="p-5 border-b border-[#E2E8F0] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A3A1A] flex items-center justify-between transition-colors duration-500">
              <h2 className="font-heading text-[20px] text-[#1E293B] dark:text-white">Compare Farmers</h2>
              <span className="text-[12px] text-[#64748B] dark:text-white/60 font-medium">{selectedFarmers.length}/3 selected</span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#F8FAFC]/50 dark:bg-[#0B120B]">
              {selectedFarmers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#94A3B8] dark:text-white/50">
                  <Maximize2 size={48} className="mb-4 text-[#CBD5E1] dark:text-white/20" />
                  <p className="text-[14px]">Click any farmer row to add them to comparison.</p>
                  <p className="text-[12px] mt-2">Select up to 3 to compare radar charts.</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  
                  {/* Selected Chips */}
                  <div className="flex flex-wrap gap-2">
                    {selectedFarmers.map((idx, fi) => {
                      const f = searchResults[idx];
                      return (
                        <div key={idx} className="bg-white dark:bg-[#1A3A1A] border border-[#CBD5E1] dark:border-white/20 px-3 py-1.5 rounded-[6px] text-[12px] font-bold text-[#1E293B] dark:text-white flex items-center gap-2 shadow-sm transition-colors duration-500">
                          <div className={`w-2 h-2 rounded-full ${fi === 0 ? 'bg-[#3B82F6]' : fi === 1 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} />
                          {f.name}
                          <button onClick={() => toggleFarmer(idx)} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"><X size={12} /></button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Radar Chart */}
                  <div className="h-[250px] bg-white dark:bg-[#1A3A1A] rounded-[10px] border border-[#E2E8F0] dark:border-white/10 p-4 shadow-sm flex items-center justify-center transition-colors duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke={isDarkTheme ? "rgba(255,255,255,0.1)" : "#E2E8F0"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkTheme ? 'rgba(255,255,255,0.5)' : '#64748B', fontSize: 10, fontWeight: 600 }} />
                        <Radar name="Farmer 1" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                        {selectedFarmers.length > 1 && <Radar name="Farmer 2" dataKey="B" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-[#E0F2FE] dark:bg-[#1E3A8A]/20 border border-[#BFDBFE] dark:border-[#1E3A8A]/50 p-4 rounded-[10px] text-[13px] text-[#1E3A8A] dark:text-[#BFDBFE] transition-colors duration-500">
                    <strong className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={14} /> AI Recommendation:</strong>
                    {selectedFarmers.length > 0 && searchResults[selectedFarmers[0]] 
                      ? `${searchResults[selectedFarmers[0]].name} has an Agri-Trust score of ${searchResults[selectedFarmers[0]].agriTrustScore || 0}. Verified farm data is GPS-tagged and authenticated.`
                      : "Select farmers to see AI recommendation."
                    }
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button className="w-full h-10 rounded-[6px] bg-white dark:bg-[#1A3A1A] border border-[#CBD5E1] dark:border-white/20 text-[#1E293B] dark:text-white text-[13px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors">Request More Data</button>
                    <button 
                      onClick={() => {
                        if (selectedFarmers.length > 0) {
                          openProfile(searchResults[selectedFarmers[0]], { stopPropagation: () => {} } as any);
                        }
                      }}
                      className="w-full h-10 rounded-[6px] bg-[#1A3A1A] dark:bg-[#64B43C] text-[#FAFBF7] dark:text-[#1A3A1A] text-[13px] font-medium hover:bg-[#2A4A2A] dark:hover:bg-[#539630] shadow-md transition-colors duration-500"
                    >
                      Process Loan
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        </>)}
      </main>

      {/* FARMER PROFILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && activeFarmer && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-[#0B120B] shadow-2xl z-50 flex flex-col border-l border-[#E2E8F0] dark:border-white/10 transition-colors duration-500"
          >
            <div className="h-[200px] bg-[#1A3A1A] dark:bg-[#64B43C] relative shrink-0 overflow-hidden p-6 flex flex-col justify-between transition-colors duration-500">
              <div className="flex justify-between items-start relative z-10">
                <button onClick={() => setDrawerOpen(false)} className="text-white dark:text-[#1A3A1A] hover:bg-white/10 dark:hover:bg-black/10 p-1.5 rounded-[6px] transition-colors"><X size={20} /></button>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white dark:text-[#1A3A1A] px-3 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1 shadow-sm">
                  <ShieldCheck size={14} className="text-[#64B43C] dark:text-[#1A3A1A]" /> DPDP Act Compliant
                </div>
              </div>

              <div className="flex items-end justify-between relative z-10">
                <div className="flex items-end gap-4">
                  <div className="w-[72px] h-[72px] rounded-full border-4 border-[#1A3A1A] dark:border-[#64B43C] bg-[#8B5E3C] flex items-center justify-center text-white font-heading text-[24px] shadow-lg transition-colors duration-500">
                    {(activeFarmer.name || "?").split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex flex-col pb-1">
                    <h2 className="font-heading text-[28px] text-white dark:text-[#1A3A1A] leading-tight">{activeFarmer.name}</h2>
                    <span className="text-[#CBD5E1] dark:text-[#1A3A1A]/80 text-[13px]">{activeFarmer.village || ""}{activeFarmer.state ? `, ${activeFarmer.state}` : ""}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-heading text-[32px] text-[#64B43C] dark:text-white leading-none">{activeFarmer.agriTrustScore || 0}</span>
                  <span className="text-[#94A3B8] dark:text-white/80 text-[10px] uppercase tracking-wider font-bold">Agri-Trust</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F8FAFC] dark:bg-[#0B120B] transition-colors duration-500">
              
              <div className="bg-white dark:bg-[#111E11] rounded-[12px] border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm mb-6 flex flex-col gap-4 transition-colors duration-500">
                <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-white border-b border-[#E2E8F0] dark:border-white/10 pb-3">Farmer Details</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div><span className="text-[#64748B] dark:text-white/50">Phone:</span> <span className="text-[#1E293B] dark:text-white font-medium">{activeFarmer.phone}</span></div>
                  <div><span className="text-[#64748B] dark:text-white/50">Land:</span> <span className="text-[#1E293B] dark:text-white font-medium">{activeFarmer.landsize || "—"} acres</span></div>
                  <div><span className="text-[#64748B] dark:text-white/50">Crops:</span> <span className="text-[#1E293B] dark:text-white font-medium">{(activeFarmer.cropTypes || []).join(", ") || "—"}</span></div>
                  <div><span className="text-[#64748B] dark:text-white/50">Fields:</span> <span className="text-[#1E293B] dark:text-white font-medium">{activeFarmer.fields?.length || 0}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111E11] rounded-[12px] border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm mb-6 flex flex-col gap-4 transition-colors duration-500">
                <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-white border-b border-[#E2E8F0] dark:border-white/10 pb-3">Creditworthiness Estimate</h3>
                <p className="text-[13px] text-[#475569] dark:text-white/80 leading-relaxed">
                  Based on verified farm data, this farmer has an Agri-Trust Score of {activeFarmer.agriTrustScore || 0}. 
                  {(activeFarmer.agriTrustScore || 0) >= 700 ? " Excellent creditworthiness — recommended for lending." : (activeFarmer.agriTrustScore || 0) >= 400 ? " Moderate creditworthiness — standard risk." : " Building credit history."}
                </p>
                <div className="bg-[#F0FDF4] dark:bg-[#1A3A1A] border border-[#BBF7D0] dark:border-[#64B43C]/20 p-3 rounded-[8px] flex items-center justify-between transition-colors duration-500">
                  <span className="text-[12px] font-bold text-[#166534] dark:text-[#A4B598]">Recommended Credit Range:</span>
                  <span className="text-[16px] font-heading font-bold text-[#15803D] dark:text-[#64B43C]">
                    ₹{Math.max(5000, Math.round((activeFarmer.agriTrustScore || 0) * 50)).toLocaleString()} – ₹{Math.max(10000, Math.round((activeFarmer.agriTrustScore || 0) * 80)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Loan Form */}
              <div className="bg-white dark:bg-[#111E11] rounded-[12px] border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm mb-6 flex flex-col gap-4 transition-colors duration-500">
                <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-white border-b border-[#E2E8F0] dark:border-white/10 pb-3">Process Loan</h3>
                <div className="flex flex-col gap-3">
                  <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="Loan amount (₹)" className="h-10 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A3A1A] text-[#1E293B] dark:text-white text-[13px] outline-none focus:border-[#64B43C]" />
                  <input type="text" value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} placeholder="Purpose (e.g. Seeds, Equipment)" className="h-10 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A3A1A] text-[#1E293B] dark:text-white text-[13px] outline-none focus:border-[#64B43C]" />
                </div>
                {loanSuccess && (
                  <div className="bg-[#F0FDF4] dark:bg-[#1A3A1A] border border-[#BBF7D0] dark:border-[#64B43C]/20 text-[#166534] dark:text-[#64B43C] px-3 py-2 rounded-[6px] text-[13px] font-medium">
                    ✓ {loanSuccess}
                  </div>
                )}
              </div>

              {/* Map */}
              {activeFarmer.fields && activeFarmer.fields.length > 0 && activeFarmer.fields[0].location && (
                <div className="bg-white dark:bg-[#111E11] rounded-[12px] border border-[#E2E8F0] dark:border-white/10 p-5 shadow-sm transition-colors duration-500">
                  <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-white mb-4 flex items-center gap-2"><MapPin size={16} /> Verified Fields ({activeFarmer.fields.length})</h3>
                  <div className="h-[150px] bg-[#E2E8F0] rounded-[8px] relative overflow-hidden z-0 border border-[#E2E8F0]">
                    <MapContainer center={[activeFarmer.fields[0].location.latitude, activeFarmer.fields[0].location.longitude]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {activeFarmer.fields.map((f: any, i: number) => f.location && (
                        <Marker key={i} position={[f.location.latitude, f.location.longitude]} />
                      ))}
                    </MapContainer>
                    <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-[4px] text-[10px] font-bold shadow-sm z-[1000]">GPS Verified</div>
                  </div>
                </div>
              )}
            </div>

            {/* CHAT SECTION IN DRAWER */}
            {chatOpen && (
              <div className="flex flex-col border-t border-[#E2E8F0] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#0B120B] flex-1 min-h-0 transition-colors duration-500">
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/10 shrink-0">
                  <span className="text-[13px] font-medium text-[#1A3A1A] dark:text-white flex items-center gap-2">
                    <MessageCircle size={14} className="text-[#64B43C]" /> Chat with {activeFarmer?.name}
                  </span>
                  {partnerTyping && <span className="text-[11px] text-[#64B43C] animate-pulse">typing...</span>}
                  <button onClick={() => setChatOpen(false)} className="text-[#64748B] hover:text-[#1A3A1A] dark:hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[100px] max-h-[200px]">
                  {chatLoading ? (
                    <div className="flex items-center justify-center py-4"><Loader2 size={18} className="animate-spin text-[#64B43C]" /></div>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-[12px] text-[#64748B] dark:text-white/40 text-center py-4">No messages yet. Start the conversation!</p>
                  ) : (
                    chatMessages.map((msg: any) => {
                      const isLender = msg.sender?.role === "lender";
                      return (
                        <div key={msg._id} className={`flex ${isLender ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] px-3 py-2 rounded-[10px] text-[12px] ${isLender ? "bg-[#1A3A1A] text-white rounded-br-[4px]" : "bg-white dark:bg-[#111E11] text-[#1A3A1A] dark:text-white border border-[#E2E8F0] dark:border-white/10 rounded-bl-[4px]"}`}>
                            {msg.text}
                            <div className={`text-[9px] mt-0.5 ${isLender ? "text-white/40" : "text-[#64748B]"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-3 pb-3 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      if (activeFarmer) {
                        const fid = activeFarmer._id || activeFarmer.id;
                        if (e.target.value.trim()) emitTyping(fid, "farmer");
                        else emitStopTyping(fid, "farmer");
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    placeholder="Type a message..."
                    className="flex-1 h-9 px-3 rounded-[8px] bg-white dark:bg-[#111E11] border border-[#E2E8F0] dark:border-white/10 text-[12px] text-[#1A3A1A] dark:text-white outline-none focus:border-[#64B43C]"
                  />
                  <button onClick={handleChatSend} disabled={!chatInput.trim()} className="w-9 h-9 rounded-full bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 bg-white dark:bg-[#111E11] border-t border-[#E2E8F0] dark:border-white/10 shrink-0 transition-colors duration-500 flex flex-col gap-2">
              {!chatOpen && (
                <button
                  onClick={() => openChatInDrawer(activeFarmer?._id || activeFarmer?.id)}
                  className="w-full h-10 rounded-[8px] bg-[#E8F5E0] dark:bg-[#64B43C]/20 text-[#1A3A1A] dark:text-white font-medium text-[13px] hover:bg-[#64B43C]/30 transition-colors flex items-center justify-center gap-2 border border-[#64B43C]/20"
                >
                  <MessageCircle size={16} /> Chat with Farmer
                </button>
              )}
              <button 
                onClick={handleLoan}
                disabled={loanProcessing || !loanAmount}
                className="w-full h-12 rounded-[8px] bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] font-medium text-[14px] hover:bg-[#2A4A2A] dark:hover:bg-[#539630] shadow-lg flex items-center justify-center gap-2 transition-colors duration-500 disabled:opacity-50"
              >
                {loanProcessing ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Approve & Process Loan</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
