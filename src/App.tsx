import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  Check, Download, ArrowRight, Zap, Users, Star, ArrowLeft, 
  Target, ShieldCheck, Clock, AlertCircle, Sparkles, BookOpen,
  Layout, Building, MessageSquare, ChevronLeft, Lock, FileText, Gift,
  PenTool, Monitor, Trophy, GraduationCap, Share2, X
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar?: string;
}

// --- Constants ---
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "ASGBi0TBZWnQe03aiB-IQ9vrqulSlJcdq-kkpG8RUwE17FNF8nHjOC21zzes0vqEapDCgXjHa_xdvgjo";

const TESTIMONIALS: Testimonial[] = [
  { name: "علي الزهراني", role: "طالب عمارة - جامعة الملك سعود", text: "الكتاب غير مفهومي تماماً عن الرندر. كنت أضيع ساعات في تجربة الإضاءة، الآن أحصل على نتائج مذهلة في دقائق." },
  { name: "نورة القحطاني", role: "مصممة داخلية", text: "أفضل استثمار قمت به. البرومبتات دقيقة جداً وتعطي تفاصيل خامات كنت أحلم بالوصول إليها عبر Midjourney." },
  { name: "م. فهد العتيبي", role: "مهندس معماري", text: "مبهر كيف أن سكيتش يدوي بسيط يتحول لعمل احترافي بفضل هذا الدليل. أنقذني في العديد من مواعيد التسليم." }
];

const CHAPTERS = [
  { title: "الفلل السكنية", count: 20, icon: Building },
  { title: "العمائر والناطحات", count: 20, icon: Layout },
  { title: "المباني العامة والمتاحف", count: 15, icon: Target },
  { title: "التصميم الداخلي والأثاث", count: 15, icon: PenTool },
  { title: "المرافق الخدمية", count: 30, icon: Monitor },
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative glass w-full max-w-lg rounded-[3rem] p-10 border-white/10 shadow-[0_0_100px_rgba(34,197,94,0.1)]"
        >
          <button onClick={onClose} className="absolute top-8 left-8 text-dim hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-black mb-6 text-right">{title}</h3>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-bold uppercase tracking-wider", className)}>
    {children}
  </span>
);

const Navbar = () => (
  <nav className="fixed top-0 w-full z-[100] px-4 md:px-12 py-5 flex justify-between items-center glass-dark border-b border-white/5">
    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-all duration-500 border border-white/20">
        <GraduationCap className="w-7 h-7 text-primary" strokeWidth={3} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black text-white tracking-tighter leading-none">رندر</span>
        <span className="text-[10px] font-bold text-secondary tracking-[2px] uppercase opacity-70">طالب عمارة</span>
      </div>
    </div>
    <div className="hidden lg:flex gap-8 text-[11px] font-bold text-dim">
      <a href="#about" className="hover:text-white transition-all">عن الكتاب</a>
      <a href="#comparison" className="hover:text-white transition-all">النتائج</a>
      <a href="#chapters" className="hover:text-white transition-all">الفصول</a>
      <a href="#pricing" className="hover:text-white transition-all">السعر</a>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden sm:block text-[10px] font-black text-secondary animate-pulse">عرض محدود: 35 ريال</div>
      <a href="#pricing" className="btn-premium px-5 py-2.5 text-[11px] shadow-secondary/10 rounded-lg">
        اشترِ الآن
      </a>
    </div>
  </nav>
);

const ComparisonWidget = ({ sketch, render, height = "h-[300px] md:h-[550px]" }: { sketch: string, render: string, height?: string }) => {
  const [pos, setPos] = useState(50);
  return (
    <div className={cn("relative rounded-[2rem] md:rounded-[3rem] overflow-hidden glass border-white/5 group shadow-2xl transition-all duration-500 w-full", height)}>
      <div className="absolute inset-0 select-none overflow-hidden">
        <img src={render} className="w-full h-full object-cover select-none pointer-events-none" alt="After" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
        <div className="absolute bottom-6 right-6 glass px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black z-20 flex items-center gap-2 backdrop-blur-xl border-white/20 select-none pointer-events-none">
          <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-secondary" /> الرندر الاحترافي
        </div>
      </div>
      <div className="absolute inset-0 z-10 select-none overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={sketch} className="w-full h-full object-cover select-none pointer-events-none" alt="Before" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
        <div className="absolute bottom-6 left-6 glass px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black flex items-center gap-2 backdrop-blur-xl border-white/20 select-none pointer-events-none">
          اسكتش يدوي <PenTool className="w-3 md:w-3.5 h-3 md:h-3.5 text-accent" />
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={pos} 
        onChange={(e) => setPos(parseInt(e.target.value))} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40" 
      />
      <div className="absolute top-0 bottom-0 w-1 bg-secondary z-20 pointer-events-none shadow-[0_0_20px_#F59E0B]" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-9 h-9 rounded-full bg-secondary border-4 border-primary flex items-center justify-center shadow-2xl">
          <motion.div 
            animate={{ x: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex gap-0.5"
          >
            {[1, 2].map(i => <div key={i} className="w-0.5 h-3.5 bg-primary rounded-full" />)}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const StickyCTA = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="lg:hidden fixed bottom-6 left-6 right-6 z-[101]"
        >
          <a href="#pricing" className="btn-premium w-full flex items-center justify-center gap-3 py-4 text-base italic shadow-secondary/40">
            🔥 حمّل الكتاب الآن (35 ريال)
            <ChevronLeft className="w-5 h-5" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PayPalCheckoutButton = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto">
      <PayPalButtons
        style={{
          color: "gold",
          shape: "pill",
          label: "pay",
          height: 55
        }}
        createOrder={async () => {
          try {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error("PayPal Create Order Server Error:", errorText);
              throw new Error("Failed to create order");
            }
            const data = await response.json();
            if (!data.id) throw new Error("No order ID returned");
            return data.id;
          } catch (error) {
            console.error("PayPal createOrder error:", error);
            return "";
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID })
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error("PayPal Capture Order Server Error:", errorText);
              throw new Error("Failed to capture order");
            }
            const orderData = await response.json();
            if (orderData.status === "COMPLETED") {
              navigate("/success");
            } else {
              console.error("PayPal Order not completed:", orderData);
            }
          } catch (error) {
            console.error("PayPal onApprove error:", error);
          }
        }}
        onError={(err) => {
          console.error("PayPal Buttons Component Error:", err);
        }}
      />
    </div>
  );
};

// --- Sections ---

const LandingPage = () => {
  const [downloadCount, setDownloadCount] = useState(1240);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.ok ? res.json() : Promise.reject("Stats fetch failed"))
      .then(data => {
        if (data && typeof data.downloadCount === 'number') {
          setDownloadCount(data.downloadCount);
        }
      })
      .catch(err => console.warn("Could not load download stats:", err));
  }, []);

  const handleShareTestimonial = (testimonial: Testimonial) => {
    const text = `شاهد ما يقوله ${testimonial.name} عن كتاب الرندر المعماري: "${testimonial.text}"`;
    if (navigator.share) {
      navigator.share({
        title: 'رندر معماري - آراء العملاء',
        text: text,
        url: window.location.href,
      }).catch(() => {
        // Fallback for failed share
        navigator.clipboard.writeText(text + " " + window.location.href);
      });
    } else {
      try {
        navigator.clipboard.writeText(text + " " + window.location.href);
      } catch (e) {
        console.warn("Clipboard access denied");
      }
    }
  };

  const handleConfirmDownload = () => {
    fetch("/api/stats/increment", { method: "POST" })
      .then(res => res.ok ? res.json() : Promise.reject("Increment failed"))
      .then(data => {
        if (data && typeof data.downloadCount === 'number') {
          setDownloadCount(data.downloadCount);
        }
      })
      .catch(err => console.warn("Could not update download stats:", err));
    
    // Using a direct location change to /api/download for better reliability in various environments
    window.location.href = '/api/download';
    
    setShowDownloadModal(false);
  };

  return (
    <div className="relative w-full overflow-x-hidden bg-deep">
      <div className="arch-grid"></div>
      <div className="floating-line top-1/4 opacity-10" />
      <Navbar />
      <StickyCTA />

      {/* Hero */}
      <section id="about" className="relative pt-32 lg:pt-48 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="glow-orange w-[500px] h-[500px] -top-24 -right-40 opacity-30 select-none pointer-events-none" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Badge className="mb-6">📖 دليل الـ 100 برومبت المعماري</Badge>
            <h1 className="text-[2.5rem] md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
              حوّل أي <span className="text-secondary italic underline decoration-secondary/30 underline-offset-8">اسكتش</span> معماري <br/> إلى رندر احترافي
            </h1>
            <p className="text-base md:text-xl text-dim mb-10 max-w-xl mx-auto lg:mr-0 leading-relaxed font-medium opacity-90">
              100 برومبت جاهزة للاستخدام تعطيك نتائج مذهلة وبكل واقعية دون الحاجة لخبرة لسنوات في برامج الرندر المعقدة.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <a href="#pricing" className="btn-premium py-5 px-12 text-xl font-black flex items-center gap-4">
                🔥 اشترِ الآن بـ 35 ريال
              </a>
              <div className="text-right flex flex-col gap-1">
                <span className="text-xs font-bold text-white/70 flex items-center gap-1"><Check className="w-3 h-3 text-secondary" /> تحميل فوري بصيغة PDF</span>
                <span className="text-xs font-bold text-white/70 flex items-center gap-1"><Check className="w-3 h-3 text-secondary" /> نسخة 2026 الأحدث</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
             <ComparisonWidget sketch="/sketch.webp" render="/render.webp" height="h-[450px] md:h-[650px]" />
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 px-6 relative border-y border-white/5 bg-white/[0.01] overflow-hidden w-full">
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <Badge className="mb-4">تحديات عانينا منها جميعاً</Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">لماذا تضيع أياماً في الرندر؟</h2>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
           {[
             { title: "تضيع وقتك؟", desc: "تستغرق ساعات في تعديل الإضاءة والخامات وفى النهاية النتيجة غير مرضية.", icon: Clock, color: "text-orange-400" },
             { title: "نتائج ضعيفة؟", desc: "المشاريع تحتاج جودة إظهار عالية لتبهر الدكاترة والعملاء والحصول على تقدير ممتاز.", icon: AlertCircle, color: "text-red-400" },
             { title: "برامج معقدة؟", desc: "تعلم V-Ray أو Lumion يتطلب أجهزة خارقة وشهوراً من التدريب الممل.", icon: Lock, color: "text-blue-400" }
           ].map((item, i) => (
             <div key={i} className="glass p-10 rounded-[3rem] border-white/5 hover:border-white/15 transition-all text-right group">
                <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", item.color)}>
                   <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-dim text-xs leading-relaxed font-medium">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Results / Comparison */}
      <section id="comparison" className="py-24 px-6 relative overflow-hidden w-full">
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <Badge className="mb-4">قبل وبعد الاستخدام</Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">شاهد السحر بنفسك</h2>
          <p className="text-dim text-sm max-w-lg mx-auto leading-relaxed">حوّل أفكارك الأولية إلى واقع ملموس في ثوانٍ معدودة.</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
           <ComparisonWidget sketch="/sketch.webp" render="/render.webp" height="h-[400px] md:h-[550px]" />
           <ComparisonWidget sketch="/sketch_1.webp" render="/render_1.webp" height="h-[400px] md:h-[550px]" />
        </div>
      </section>

      {/* Chapters (Visual) */}
      <section id="chapters" className="py-24 px-6 relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-right">
              <Badge className="mb-4">محتوى الكتاب</Badge>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase italic">جولة داخل الفصول</h2>
            </div>
            <p className="text-dim text-xs max-w-sm text-right leading-relaxed">قمنا بتقسيم الكتاب ليشمل كل أنواع المشاريع المعمارية التي قد تحتاجها في دراستك أو عملك.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {CHAPTERS.map((ch, i) => (
               <div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 hover:bg-secondary/5 transition-all group text-right flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <span className="text-white/10 text-5xl font-black italic">0{i+1}</span>
                     <ch.icon className="w-8 h-8 text-secondary/40 group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="text-xl font-black mb-3 text-white">{ch.title}</h3>
                  <div className="mt-auto flex items-center gap-2 text-dim text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 text-secondary" /> {ch.count} برومبت احترافي مجرب
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Free Sample */}
      <section className="py-20 px-6 relative overflow-hidden w-full">
         <div className="max-w-5xl mx-auto glass p-10 md:p-20 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 border-accent/20 relative overflow-hidden bg-gradient-to-br from-accent/5 to-transparent z-10">
            <div className="glow-blue w-96 h-96 -bottom-40 -left-40 opacity-20" />
            <div className="flex-1 text-center md:text-right">
               <h2 className="text-3xl md:text-5xl font-black mb-6 italic">عينة مجانية؟</h2>
               <p className="text-dim text-sm mb-6 leading-relaxed font-bold opacity-80">حمّل عينة من الكتاب الآن وجرب بنفسك كيف يمكن للأوامر النصية أن تصنع فرقاً شاسعاً في جودة عملك.</p>
               
               <div className="flex flex-col items-center md:items-end gap-6 mb-10">
                 <button 
                   onClick={() => setShowDownloadModal(true)}
                   className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-10 py-4 rounded-xl text-xs font-black hover:bg-white/10 transition-all uppercase tracking-[2px] cursor-pointer"
                 >
                    <Download className="w-5 h-5 text-accent" /> تحميل عينة مجانية
                 </button>
                 
                 <div className="flex items-center gap-2 text-dim text-[10px] font-bold">
                   <Users className="w-3.5 h-3.5 text-secondary" />
                   تم تحميل الكتاب <span className="text-white font-black">{downloadCount.toLocaleString()}</span> مرة حتى الآن
                 </div>
               </div>
            </div>
            <div className="relative">
               <div className="w-48 h-64 glass rounded-3xl shrink-0 rotate-12 flex items-center justify-center border-white/20 shadow-2xl relative z-10">
                  <BookOpen className="w-16 h-16 text-white/20" />
               </div>
               <div className="absolute inset-0 bg-accent/20 blur-[60px] -z-10" />
            </div>
         </div>
      </section>

      {/* Benefits Layout */}
      <section className="py-24 px-6 md:px-12 bg-white/[0.01] relative overflow-hidden w-full">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="lg:order-first">
               <img src="https://picsum.photos/seed/arch-focus/1000/1200" className="rounded-[4rem] shadow-2xl border border-white/5" alt="Benefits" referrerPolicy="no-referrer" />
            </div>
            <div className="text-right">
               <h2 className="text-3xl md:text-6xl font-black mb-10 leading-tight">لماذا هذا الكتاب هو <br/> <span className="text-secondary italic underline decoration-secondary/10 underline-offset-8">أفضل استثمار</span> لمستقبلك؟</h2>
               <div className="space-y-6">
                  {[
                    { text: "توفير 90% من وقت العمل على المشاريع المعقدة", icon: Zap },
                    { text: "تطوير بورتفوليو احترافي يبهر أي مكتب هندسي", icon: Trophy },
                    { text: "دقة متناهية في اختيار الخامات والإضاءات السينمائية", icon: Target },
                    { text: "تحديثات دورية مجانية تضمن لك البقاء في القمة", icon: Star }
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-5 group">
                       <span className="text-sm md:text-lg font-bold text-white/80 group-hover:text-white transition-colors">{b.text}</span>
                       <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-primary transition-all">
                          <b.icon className="w-5 h-5" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative overflow-hidden w-full">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
            {TESTIMONIALS.map((t, i) => (
               <div key={i} className="glass p-10 rounded-[3rem] border-white/5 relative flex flex-col items-center text-center group">
                  <div className="flex gap-1 text-secondary mb-6 scale-90">
                     {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-dim text-sm mb-10 leading-relaxed font-medium italic opacity-80">"{t.text}"</p>
                  <div className="mt-auto pt-8 border-t border-white/5 w-full flex flex-col gap-6">
                     <div>
                        <h4 className="font-bold text-white text-base">{t.name}</h4>
                        <p className="text-[10px] text-dim font-bold tracking-widest">{t.role}</p>
                     </div>
                     <button 
                        onClick={() => handleShareTestimonial(t)}
                        className="mx-auto flex items-center gap-3 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-secondary/10 text-dim hover:text-secondary transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
                     >
                        <Share2 className="w-4 h-4" /> مشاركة الرأي
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden w-full">
         <div className="max-w-3xl mx-auto relative z-10">
            <div className="glass p-10 md:p-24 rounded-[5rem] text-center border-secondary/20 relative shadow-[0_0_150px_rgba(245,158,11,0.08)] overflow-hidden">
               <div className="absolute top-0 right-0 bg-secondary text-primary px-8 py-3 rounded-bl-[2rem] text-xs font-black uppercase tracking-widest animate-pulse italic">Limited Offer</div>
               <h2 className="text-4xl md:text-6xl font-black mb-10">استثمر في مهارتك</h2>
               <div className="flex items-baseline justify-center gap-3 mb-16">
                  <span className="text-7xl md:text-9xl font-black text-secondary uppercase tracking-tighter shadow-secondary/10">35</span>
                  <div className="text-right">
                    <span className="block text-xl md:text-2xl font-black text-dim italic">SAR</span>
                    <span className="block text-[10px] line-through opacity-20 font-bold uppercase tracking-widest">70 SAR</span>
                  </div>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-dim mb-16 text-right max-w-md mx-auto">
                 {["أكثر من 100 برومبت دقيق", "تحميل PDF صنف فوري", "دعم فني متاح دائماً", "يوفر عليك آلاف الريالات"].map((f, i) => (
                   <div key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-secondary" /> {f}</div>
                 ))}
               </div>

               <PayPalCheckoutButton />
               
               <p className="mt-10 text-[10px] text-dim font-bold italic opacity-30 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> دفع آمن تماماً عبر بايبال - التحميل فوري
               </p>
            </div>

            {/* Trial Logic - Removal tomorrow */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-16 glass p-8 rounded-[3rem] border-green-500/20 bg-green-500/5 text-center">
               <Badge className="bg-green-500/20 border-green-500/30 text-green-400 mb-4 font-mono">TRIAL_24H_ACTIVE</Badge>
               <h3 className="text-2xl font-black mb-4">هدية تجريبية للجس النبض</h3>
               <p className="text-xs text-dim mb-8 font-medium leading-relaxed max-w-sm mx-auto opacity-70">لمدة 24 ساعة فقط، يمكنك تحميل نسخة مصغرة مجاناً بالكامل للتأكد من جودة المحتوى.</p>
               <button 
                 onClick={() => setShowDownloadModal(true)}
                 className="btn-premium !bg-green-600 shadow-green-600/30 text-[10px] py-3.5 px-10 rounded-full flex items-center justify-center gap-2 w-fit mx-auto cursor-pointer"
               >
                  <Gift className="w-4 h-4" /> حمّل النسخة التجريبية (مجاناً)
               </button>
            </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 items-center">
           <div className="text-center md:text-right">
              <h3 className="text-white font-black text-2xl mb-4 italic tracking-tighter uppercase">رندر معماري</h3>
              <p className="text-[10px] text-dim leading-relaxed max-w-xs mx-auto md:mr-0 opacity-50">نؤمن بأن الذكاء الاصطناعي هو الأداة الأعظم للمبدعين ليس لمنافستهم بل لتمكينهم من الوصول للمستحيل.</p>
           </div>
           <div className="flex gap-8 justify-center">
              {[MessageSquare, Building, BookOpen].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-dim hover:text-white transition-all hover:scale-110">
                   <Icon className="w-5 h-5" />
                </a>
              ))}
           </div>
           <div className="text-center md:text-left text-dim">
              <p className="text-[10px] font-black uppercase tracking-[3px] mb-4">M/ SLOMA - DESIGNS</p>
              <p className="text-[9px] opacity-20 uppercase tracking-widest italic">All rights reserved © 2026 Render Arch</p>
           </div>
        </div>
      </footer>

      <Modal 
        isOpen={showDownloadModal} 
        onClose={() => setShowDownloadModal(false)} 
        title="تأكيد التحميل"
      >
        <div className="text-right">
          <p className="text-dim text-sm mb-10 leading-relaxed font-bold opacity-80">
            هل أنت متأكد من رغبتك في تحميل العينة المجانية؟ ستحتوي العينة على نماذج مختارة من البرومبتات المعمارية الاحترافية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleConfirmDownload}
              className="flex-1 btn-premium py-4 text-xs font-black flex items-center justify-center gap-2 shadow-accent/20"
            >
              <Download className="w-4 h-4" /> تأكيد وتحميل
            </button>
            <button 
              onClick={() => setShowDownloadModal(false)}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-black hover:bg-white/10 transition-all text-white/50 hover:text-white"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SuccessPage = () => {
  useEffect(() => {
    // Increment count on server when payment is successful and download starts
    fetch("/api/stats/increment", { method: "POST" }).catch(() => {});

    // Redirect to download endpoint
    window.location.href = '/api/download';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-deep relative overflow-hidden w-full">
      <div className="arch-grid"></div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 md:p-24 rounded-[5rem] max-w-4xl text-center border-green-500/20 shadow-2xl relative">
        <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
          <Check className="w-12 h-12 text-white" strokeWidth={5} />
        </div>
        <h1 className="text-4xl md:text-7xl font-black mb-6 italic tracking-tighter">تم الدفع بنجاح!</h1>
        <p className="text-lg md:text-2xl text-white/60 mb-16 max-w-2xl mx-auto leading-relaxed font-bold">بدا التحميل الآن.. دليلك الشامل لـ 100 برومبت معماري جاهز لتغيير مسارك المهني.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href="/book.pdf" download className="btn-premium !bg-green-600 shadow-green-600/30 w-full sm:w-fit px-12 py-6 text-xl">
            <Download className="inline-block mr-3 w-6 h-6" /> تحميل الكتاب (PDF)
          </a>
          <Link to="/" className="text-dim hover:text-white transition-all text-xs font-black uppercase tracking-widest border-b border-white/10 pb-2">العودة للرئيسية</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD" }}>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </PayPalScriptProvider>
  );
}
