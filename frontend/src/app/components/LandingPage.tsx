import { Link } from "react-router";
import { Leaf, Shield, Star, Camera, Brain, TrendingUp, CheckCircle2, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import Particles from "../../components/Particles";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "./Navbar";

export default function LandingPage() {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FAFBF7] overflow-x-hidden font-sans relative">
      <div className={`relative w-full overflow-hidden rounded-b-[40px] transition-colors duration-700 ${isDarkTheme ? "bg-[#1A3A1A]" : "bg-[#FAFBF7]"}`}>
        
        {/* Background Dot Pattern & Particles */}
        <div 
          className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${isDarkTheme ? "opacity-20" : "opacity-[0.03]"}`} 
          style={{ backgroundImage: `radial-gradient(${isDarkTheme ? "#64B43C" : "#1A3A1A"} 1.5px, transparent 1.5px)`, backgroundSize: "32px 32px" }} 
        />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -z-0 pointer-events-none flex justify-center transition-opacity duration-700 ${isDarkTheme ? "opacity-80 mix-blend-screen" : "opacity-30 mix-blend-multiply"}`}>
          <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
            <Particles
              key={isDarkTheme ? 'dark' : 'light'}
              particleCount={430}
              particleSpread={9}
              speed={0.14}
              particleColors={isDarkTheme ? ["#ffffff","#ffffff","#ffffff"] : ["#64B43C","#1A3A1A","#A4E08B"]}
              moveParticlesOnHover={false}
              particleHoverFactor={1.4}
              alphaParticles={false}
              particleBaseSize={120}
              sizeRandomness={1}
              cameraDistance={28}
              disableRotation={false}
            />
          </div>
        </div>

        {/* FLOATING NAVBAR */}
        <Navbar />

        {/* HERO SECTION */}
        <section className="relative z-10 w-full pt-28 pb-28 px-4 flex flex-col max-w-[1000px] mx-auto items-center justify-center text-center">
          <h1 className={`text-[52px] md:text-[68px] font-bold leading-[1.15] tracking-tight transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#1A3A1A]"}`}>
            From Field to Finance<br />
            Your Farm Builds<br />
            Your <span className="relative inline-block mt-2">
              <span className={`relative z-10 transition-colors duration-500 ${isDarkTheme ? "text-[#1A3A1A]" : "text-[#1A3A1A]"}`}>Credit Score</span>
              {/* Highlight */}
              <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -z-10" preserveAspectRatio="none" viewBox="0 0 200 40" fill="none">
                <path d="M5,10 C40,5 160,2 195,15 C190,25 60,35 10,25 Z" fill={isDarkTheme ? "#64B43C" : "#FFF2C6"} className="transform scale-x-[1.05] translate-y-1 transition-colors duration-500" />
              </svg>
              <div className={`absolute inset-0 rounded-[8px] transform -rotate-1 -z-10 scale-[1.02] transition-colors duration-500 ${isDarkTheme ? "bg-[#64B43C]" : "bg-[#FFF2C6]"}`} />
            </span>
          </h1>
          
          <p className={`text-[18px] max-w-[600px] mt-8 leading-relaxed transition-colors duration-500 ${isDarkTheme ? "text-white/70" : "text-[#1A3A1A]/70"}`}>
            Upload a crop photo. Get instant AI diagnosis in your language. Watch your Agri-Trust Score grow with every harvest you protect.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 mt-10">
            <Link to="/register" className={`px-8 py-4 w-full max-w-[300px] rounded-full transition-all text-[16px] font-bold shadow-[0_8px_20px_rgba(100,180,60,0.3)] flex items-center justify-center ${isDarkTheme ? "bg-[#64B43C] text-[#1A3A1A] hover:bg-[#5AA44E]" : "bg-[#64B43C] text-white hover:bg-[#5AA44E]"}`}>
              Start Diagnosing Free
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {[
              { icon: Leaf, text: "No app download needed" },
              { icon: Shield, text: "GPS-verified data" },
              { icon: Star, text: "Scores accepted by 12+ lenders" },
            ].map((badge, i) => (
              <div key={i} className={`flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-full backdrop-blur-sm shadow-sm transition-colors duration-500 ${isDarkTheme ? "text-white/80 bg-[#111E11]/50 border border-white/10" : "text-[#1A3A1A]/70 bg-white border border-[#1A3A1A]/10"}`}>
                <badge.icon size={16} className="text-[#64B43C]" /> {badge.text}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PROBLEM STATEMENT STRIP (Restored content, updated style) */}
      <section className="bg-white border-y border-gray-100 py-12 px-8">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex flex-col items-center py-4 md:py-0">
            <span className="font-heading font-bold text-[40px] text-[#64B43C] mb-2 leading-none">70%</span>
            <span className="text-[14px] text-gray-500 max-w-[200px] font-medium">Farmers denied credit due to no financial history</span>
          </div>
          <div className="flex flex-col items-center py-4 md:py-0">
            <span className="font-heading font-bold text-[40px] text-[#64B43C] mb-2 leading-none">45 min</span>
            <span className="text-[14px] text-gray-500 max-w-[200px] font-medium">Average time to reach an agronomist in rural India</span>
          </div>
          <div className="flex flex-col items-center py-4 md:py-0">
            <span className="font-heading font-bold text-[40px] text-[#64B43C] mb-2 leading-none">₹0</span>
            <span className="text-[14px] text-gray-500 max-w-[200px] font-medium">Cost to use KisanTrust</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (Restored content, light/soft style) */}
      <section id="how-it-works" className="py-24 px-8 bg-[#FCFCFA]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[36px] font-bold text-center text-[#4B5241] mb-16">Three steps. Zero friction.</h2>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Dashed line connector (desktop only) */}
            <div className="hidden md:block absolute top-[80px] left-[15%] right-[15%] h-[1.5px] border-t-[1.5px] border-dashed border-gray-200 z-0" />
            
            <motion.div whileHover={{ translateY: -4 }} className="relative bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF6EB] flex items-center justify-center text-[#64B43C] mb-6">
                <Camera size={32} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white text-[#4B5241] flex items-center justify-center font-bold text-sm absolute -top-4 -right-2 border border-gray-100 shadow-sm">1</div>
              <h3 className="font-bold text-[20px] text-[#4B5241] mb-3">Photograph your crop</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed">Any browser, any phone. No download needed.</p>
            </motion.div>

            <motion.div whileHover={{ translateY: -4 }} className="relative bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF6EB] flex items-center justify-center text-[#64B43C] mb-6">
                <Brain size={32} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white text-[#4B5241] flex items-center justify-center font-bold text-sm absolute -top-4 -right-2 border border-gray-100 shadow-sm">2</div>
              <h3 className="font-bold text-[20px] text-[#4B5241] mb-3">AI identifies the disease</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed">Location-verified diagnosis in your language within seconds.</p>
            </motion.div>

            <motion.div whileHover={{ translateY: -4 }} className="relative bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF6EB] flex items-center justify-center text-[#64B43C] mb-6">
                <TrendingUp size={32} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white text-[#4B5241] flex items-center justify-center font-bold text-sm absolute -top-4 -right-2 border border-gray-100 shadow-sm">3</div>
              <h3 className="font-bold text-[20px] text-[#4B5241] mb-3">Your score grows</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed">Every diagnosis becomes data. Data becomes credit access.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AGRI-TRUST SCORE EXPLAINER (Restored, updated style) */}
      <section className="flex flex-col md:flex-row min-h-[600px] border-t border-gray-100">
        <div className="w-full md:w-1/2 bg-white p-12 md:p-24 flex items-center justify-end">
          <div className="max-w-[450px] w-full flex flex-col items-center">
            {/* Circular Gauge SVG */}
            <div className="relative w-64 h-32 overflow-hidden mb-8">
              <svg viewBox="0 0 200 100" className="w-full h-full transform translate-y-2">
                <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#F4F4F4" strokeWidth="16" strokeLinecap="round" />
                <motion.path 
                  d="M 20 90 A 80 80 0 0 1 180 90" 
                  fill="none" 
                  stroke="#64B43C" 
                  strokeWidth="16" 
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  whileInView={{ strokeDashoffset: 251.2 * (1 - 748/850) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                <span className="text-[52px] font-bold text-[#4B5241] leading-none">748</span>
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-4">
              {[
                { label: "Location Consistency", val: 95 },
                { label: "Diagnosis Frequency", val: 80 },
                { label: "Crop Improvement", val: 75 },
                { label: "Seasonal Management", val: 90 },
                { label: "Response Time", val: 85 }
              ].map((factor, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[13px] text-[#4B5241] font-medium">
                    <span>{factor.label}</span>
                    <span className="text-gray-500">{factor.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#64B43C] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${factor.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 bg-[#4B5241] p-12 md:p-24 flex items-center justify-start">
          <div className="max-w-[450px] w-full">
            <h3 className="italic font-medium text-[24px] text-white/90 mb-12">
              "A score that banks trust, built from the land you tend."
            </h3>
            
            <div className="flex flex-col gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white/10 p-5 rounded-[16px] border border-white/5 flex gap-4 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-[#8B5E3C] flex-shrink-0 flex items-center justify-center text-white font-bold">
                  RK
                </div>
                <div>
                  <div className="text-white font-medium text-[16px]">Ramesh Kumar</div>
                  <div className="text-white/60 text-[13px] mb-2">Rohtak, Haryana</div>
                  <div className="flex gap-3 text-[13px]">
                    <span className="text-[#A4E08B] font-medium">Score: 780</span>
                    <span className="text-white/80">Loan: ₹45,000 approved</span>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white/10 p-5 rounded-[16px] border border-white/5 flex gap-4 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-[#5B88CD] flex-shrink-0 flex items-center justify-center text-white font-bold">
                  SP
                </div>
                <div>
                  <div className="text-white font-medium text-[16px]">Suresh Patel</div>
                  <div className="text-white/60 text-[13px] mb-2">Nashik, Maharashtra</div>
                  <div className="flex gap-3 text-[13px]">
                    <span className="text-[#A4E08B] font-medium">Score: 690</span>
                    <span className="text-white/80">Loan: ₹30,000 approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER (Restored, styled) */}
      <footer className="bg-white border-t border-gray-100 text-gray-500 pt-16 pb-8 px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="flex flex-col gap-4 w-full max-w-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="KisanTrust Logo" className="w-10 h-10 object-contain" />
              <span className="font-bold text-[20px] text-[#4B5241]">KisanTrust</span>
            </div>
              <p className="text-[14px]">Grow with Purpose. Build your credit history directly from the soil.</p>
              <div className="mt-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full inline-flex items-center gap-2 text-[12px] text-gray-600 max-w-fit">
                <Shield size={14} className="text-[#64B43C]"/> Data encrypted end-to-end
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 text-[14px] w-full max-w-[600px]">
              <div className="flex flex-col gap-3">
                <div className="font-bold text-[#4B5241] mb-2 text-[15px]">Platform</div>
                <Link to="/how-it-works" className="hover:text-[#64B43C] transition-colors">How it works</Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="font-bold text-[#4B5241] mb-2 text-[15px]">Company</div>
                <a href="#" className="hover:text-[#64B43C] transition-colors">Contact</a>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="text-[20px] text-[#4B5241] font-medium">किसान का विश्वास, हमारी ताकत</div>
            </div>
          </div>
          
          <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between text-[13px] text-gray-500 dark:text-white/50 gap-4 text-center md:text-left transition-colors duration-500">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-500">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors duration-500">Terms of Service</a>
            </div>
            <div>© 2026 KisanTrust. Built with purpose at HackElite · Team HackElite</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
