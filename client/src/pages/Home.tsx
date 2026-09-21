import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BatteryCharging,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Cpu,
  Database,
  Download,
  Filter,
  Gauge,
  HardDrive,
  Info,
  LayoutDashboard,
  Leaf,
  LineChart as LineChartIcon,
  MapPin,
  Menu,
  MoreHorizontal,
  Network,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Recycle,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Thermometer,
  TrendingUp,
  UserRound,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocation } from "wouter";
import type { Classification, Device, WasteType } from "@shared/types";
import {
  activityLog,
  apiNotes,
  classifications,
  deviceData,
  pendingRegistrations,
  systemStats,
  trendData,
  wasteDetections,
} from "@/lib/iot-service";

const navItems: { id: PageKey; label: string; icon: LucideIcon; section?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "devices", label: "Devices", icon: Cpu, section: "OPERATIONS" },
  { id: "monitoring", label: "Live monitoring", icon: Radio },
  { id: "classification", label: "Waste classification", icon: Recycle },
  { id: "analytics", label: "Analytics", icon: LineChartIcon, section: "INSIGHTS" },
  { id: "registration", label: "Device registration", icon: Plus, section: "SYSTEM" },
  { id: "settings", label: "Settings", icon: Settings },
];

type PageKey = "dashboard" | "devices" | "monitoring" | "classification" | "analytics" | "registration" | "settings";

type Tone = "lime" | "mint" | "amber" | "slate" | "blue";

const toneClasses: Record<Tone, string> = {
  lime: "bg-[#e8f8bc] text-[#466017]",
  mint: "bg-[#dff3e5] text-[#31724a]",
  amber: "bg-[#fff0ca] text-[#8a6414]",
  slate: "bg-[#e7ebed] text-[#52626b]",
  blue: "bg-[#e5eff8] text-[#476b8c]",
};

function getPageFromPath(path: string): PageKey {
  const page = path.replace(/^\//, "").split("/")[0] as PageKey;
  return navItems.some((item) => item.id === page) ? page : "dashboard";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatusPill({ status, label }: { status: "online" | "offline" | "warning" | "success" | "pending"; label?: string }) {
  const styles = {
    online: "bg-[#e6f6e8] text-[#2f7946]",
    success: "bg-[#e6f6e8] text-[#2f7946]",
    offline: "bg-[#eef0f0] text-[#647079]",
    warning: "bg-[#fff3d8] text-[#967019]",
    pending: "bg-[#fff3d8] text-[#967019]",
  };
  const dot = { online: "bg-[#48a65e]", success: "bg-[#48a65e]", offline: "bg-[#9ba6a9]", warning: "bg-[#d9a92f]", pending: "bg-[#d9a92f]" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {label ?? (status === "online" ? "Online" : status === "offline" ? "Offline" : status === "warning" ? "Attention" : "Pending")}
    </span>
  );
}

function WasteTag({ type }: { type: WasteType }) {
  const style: Record<WasteType, string> = {
    Plastic: "bg-[#e8eff8] text-[#4b6d8d]",
    Paper: "bg-[#fbf0dd] text-[#8b6f3d]",
    Glass: "bg-[#e1f3ef] text-[#347b72]",
    Metal: "bg-[#e9edef] text-[#5e6b70]",
    Organic: "bg-[#e7f5e0] text-[#497a39]",
    "E-Waste": "bg-[#eff8c8] text-[#586e19]",
    Other: "bg-[#eee8f4] text-[#6b5883]",
  };
  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${style[type]}`}>{type}</span>;
}

function CardShell({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <section onClick={onClick} className={`rounded-2xl border border-[#dde4df] bg-white shadow-[0_12px_30px_rgba(26,47,38,0.04)] ${className}`}>{children}</section>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a9891]">{eyebrow}</p>}
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#17251e]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function CameraThumbnail({ tone = "lime", size = "md" }: { tone?: Tone; size?: "sm" | "md" }) {
  return (
    <div className={`${size === "sm" ? "h-10 w-12" : "h-14 w-[72px]"} relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/60 ${toneClasses[tone]}`}>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,transparent_24%,currentColor_25%,currentColor_26%,transparent_27%,transparent_74%,currentColor_75%,currentColor_76%,transparent_77%)] [background-size:11px_11px]" />
      <Camera className="relative h-4 w-4 opacity-70" />
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    </div>
  );
}

function SparkBars({ positive = true }: { positive?: boolean }) {
  return (
    <div className="flex h-5 items-end gap-0.5">
      {[7, 10, 6, 13, 11, 17, 15, 19].map((height, index) => <span key={index} className={`w-1 rounded-t-sm ${positive ? "bg-[#c6e956]" : "bg-[#dce4e0]"}`} style={{ height }} />)}
    </div>
  );
}

function StatCard({ label, value, delta, detail, icon: Icon, tone, positive = true }: { label: string; value: string; delta: string; detail: string; icon: LucideIcon; tone: Tone; positive?: boolean }) {
  return (
    <CardShell className="min-h-[146px] p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}><Icon className="h-[17px] w-[17px]" /></div>
        <MoreHorizontal className="h-4 w-4 text-[#a6b1ac]" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#829089]">{label}</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.045em] text-[#17251e]">{value}</p>
        </div>
        <SparkBars positive={positive} />
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px]">
        {positive ? <ArrowUpRight className="h-3 w-3 text-[#4f9c61]" /> : <ArrowDownRight className="h-3 w-3 text-[#c39031]" />}
        <span className={positive ? "font-semibold text-[#4f9c61]" : "font-semibold text-[#c39031]"}>{delta}</span>
        <span className="text-[#9aa59f]">{detail}</span>
      </div>
    </CardShell>
  );
}

function Sidebar({ activePage, onNavigate, mobileOpen, onClose }: { activePage: PageKey; onNavigate: (page: PageKey) => void; mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-[#11261c]/30 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[#dce4df] bg-[#f8faf8] transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[82px] items-center justify-between border-b border-[#e2e8e4] px-5">
          <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-3 text-left">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#16281f] text-[#d2f35e] shadow-sm"><Recycle className="h-[18px] w-[18px]" /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#d2f35e]" /></span>
            <span><span className="block text-[14px] font-bold tracking-[-0.03em] text-[#1a2a21]">RE:CLASSIFY</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8b9991]">IoT Control Plane</span></span>
          </button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#829089] hover:bg-white lg:hidden"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-4 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9aa59f]">Workspace</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = item.id === activePage;
              return (
                <div key={item.id}>
                  {item.section && <p className="mb-2 mt-5 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#a6b1ac]">{item.section}</p>}
                  <button onClick={() => { onNavigate(item.id); onClose(); }} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition-all ${active ? "bg-[#e6f4c4] text-[#314d1c] shadow-[inset_3px_0_0_#9cc93a]" : "text-[#64736b] hover:bg-white hover:text-[#25352c]"}`}>
                    <item.icon className={`h-[16px] w-[16px] ${active ? "text-[#6c941c]" : "text-[#91a098] group-hover:text-[#4d6758]"}`} strokeWidth={active ? 2.3 : 1.8} />
                    <span>{item.label}</span>
                    {item.id === "registration" && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f0c44f] px-1.5 text-[10px] font-bold text-[#5e4812]">3</span>}
                  </button>
                </div>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-[#dce8d4] bg-[#edf6df] p-3.5">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#637f3e]">System health</span><span className="h-2 w-2 rounded-full bg-[#54aa69] shadow-[0_0_0_4px_rgba(84,170,105,0.14)]" /></div>
            <p className="mt-2 text-[13px] font-semibold text-[#304c2d]">All services operational</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dcebc7]"><div className="h-full w-[96%] rounded-full bg-[#7aa839]" /></div>
            <p className="mt-2 text-[10px] text-[#6c8458]">API sync · {apiNotes.lastSync}</p>
          </div>
        </div>
        <div className="border-t border-[#e2e8e4] p-3">
          <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7e4da] text-[11px] font-bold text-[#385544]">AK</div>
            <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#27372e]">Aarav Kulkarni</p><p className="truncate text-[10px] text-[#8a9891]">System operator</p></div>
            <ChevronDown className="h-3.5 w-3.5 text-[#96a39d]" />
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ activePage, onOpenMenu }: { activePage: PageKey; onOpenMenu: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const title = navItems.find((item) => item.id === activePage)?.label ?? "Dashboard";
  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#e4e9e6] bg-[#fbfcfb]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onOpenMenu} className="rounded-xl border border-[#e1e8e3] bg-white p-2.5 text-[#64736b] lg:hidden"><Menu className="h-4 w-4" /></button>
        <div className="min-w-0"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9aa59f]"><span>Workspace</span><ChevronRight className="h-3 w-3" /><span className="truncate text-[#607169]">{title}</span></div><h1 className="mt-1 truncate text-[20px] font-semibold tracking-[-0.04em] text-[#17251e] sm:text-[22px]">{activePage === "dashboard" ? "Good morning, Aarav" : title}</h1></div>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-[#dce7df] bg-white px-3 py-2 text-[10px] font-semibold text-[#5f7566] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#57aa68] shadow-[0_0_0_3px_rgba(87,170,104,0.12)]" />Live data stream</div>
        <button onClick={() => toast.success("All devices synced", { description: "Latest telemetry received 12 seconds ago." })} className="hidden rounded-xl border border-[#e1e8e3] bg-white p-2.5 text-[#708078] transition-colors hover:border-[#c9d7cb] hover:text-[#3e5b48] sm:block"><RefreshCw className="h-4 w-4" /></button>
        <div className="relative">
          <button aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-xl border border-[#e1e8e3] bg-white p-2.5 text-[#708078] transition-colors hover:border-[#c9d7cb] hover:text-[#3e5b48]"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#dd9f35] ring-2 ring-white" /></button>
          {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[#dfe7e1] bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><p className="text-[13px] font-semibold text-[#25382d]">Notifications</p><span className="rounded-full bg-[#eff6dc] px-2 py-0.5 text-[10px] font-bold text-[#66812d]">3 new</span></div><div className="mt-3 space-y-3"><p className="text-[11px] text-[#6b7d73]"><span className="font-semibold text-[#2d4435]">ESP32-CAM-003</span> is below 35% battery.</p><p className="text-[11px] text-[#6b7d73]">A new device is waiting for approval.</p><p className="text-[11px] text-[#6b7d73]">E-waste detection trend is up 12% this week.</p></div></div>}
        </div>
        <div className="hidden h-8 w-px bg-[#e1e8e3] sm:block" />
        <div className="hidden items-center gap-2.5 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7e4da] text-[10px] font-bold text-[#385544]">AK</div><div><p className="text-[11px] font-semibold text-[#283a30]">Aarav K.</p><p className="text-[10px] text-[#98a49e]">Admin</p></div></div>
      </div>
    </header>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Total devices" value={String(systemStats.totalDevices).padStart(2, "0")} delta="+1" detail="this month" icon={Cpu} tone="mint" />
        <StatCard label="Online devices" value={String(systemStats.onlineDevices).padStart(2, "0")} delta="80%" detail="availability" icon={Wifi} tone="lime" />
        <StatCard label="Offline devices" value={String(systemStats.offlineDevices).padStart(2, "0")} delta="-1" detail="vs yesterday" icon={WifiOff} tone="slate" positive={false} />
        <StatCard label="Classifications" value="2,050" delta="+14.8%" detail="vs last week" icon={Activity} tone="blue" />
        <StatCard label="E-waste detected" value="166" delta="+12.2%" detail="this week" icon={Zap} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <CardShell className="relative overflow-hidden !bg-[#17271f] p-6 text-white sm:p-7">
          <div className="absolute right-0 top-0 h-full w-2/5 opacity-40 [background-image:linear-gradient(135deg,transparent_25%,#304d3a_25%,#304d3a_26%,transparent_26%,transparent_49%,#304d3a_49%,#304d3a_50%,transparent_50%,transparent_74%,#304d3a_74%,#304d3a_75%,transparent_75%)] [background-size:28px_28px]" />
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#abc891]"><span className="h-2 w-2 rounded-full bg-[#d2f35e] shadow-[0_0_0_5px_rgba(210,243,94,0.15)]" />System overview</div><h2 className="mt-4 max-w-[520px] text-[29px] font-semibold leading-[1.06] tracking-[-0.05em] text-[#f5f8ee] sm:text-[35px]">Sorting smarter.<br /><span className="text-[#d2f35e]">Wasting less.</span></h2><p className="mt-4 max-w-[420px] text-[12px] leading-5 text-[#afc0b3]">Your sensor network has processed <strong className="font-semibold text-white">2,050 classifications</strong> across five devices. E-waste is trending above baseline.</p></div><div className="rounded-2xl border border-[#44614c] bg-[#243c2d]/80 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9fbb9f]">Network uptime</p><p className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-[#e8f9bf]">99.2%</p><p className="text-[10px] text-[#a5bda7]">last 30 days</p></div></div>
          <div className="relative z-10 mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#355041] pt-4 text-[11px]"><div><span className="block text-[#8da695]">Last data sync</span><span className="mt-1 block font-semibold text-[#eef7eb]">12 sec ago</span></div><div><span className="block text-[#8da695]">Avg. confidence</span><span className="mt-1 block font-semibold text-[#eef7eb]">{systemStats.averageConfidence}%</span></div><button onClick={() => onNavigate("monitoring")} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#d2f35e] px-3 py-2 font-semibold text-[#24341f] transition-transform hover:-translate-y-0.5">Open live view <ChevronRight className="h-3.5 w-3.5" /></button></div>
        </CardShell>
        <CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Classification mix" title="Waste distribution" action={<button onClick={() => onNavigate("analytics")} className="text-[11px] font-semibold text-[#6e8d3e] hover:text-[#426218]">View analytics <ChevronRight className="inline h-3 w-3" /></button>} /><div className="flex items-center gap-5"><div className="relative h-[150px] w-[150px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={wasteDetections} dataKey="share" nameKey="label" innerRadius={50} outerRadius={70} paddingAngle={2} stroke="none">{wasteDetections.map((entry) => <Cell key={entry.label} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[24px] font-semibold tracking-[-0.05em] text-[#1a2b21]">2,050</span><span className="text-[9px] uppercase tracking-[0.12em] text-[#8a9891]">items</span></div></div><div className="min-w-0 flex-1 space-y-2.5">{wasteDetections.slice(0, 5).map((item) => <div key={item.label} className="flex items-center justify-between gap-2 text-[11px]"><span className="flex items-center gap-2 text-[#66756c]"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-semibold text-[#34463b]">{item.share}%</span></div>)}</div></div></CardShell>
      </div>

      <CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Last 14 days" title="Detection activity" action={<div className="flex items-center gap-2"><span className="flex items-center gap-1.5 text-[10px] text-[#809087]"><span className="h-2 w-2 rounded-full bg-[#8dadc7]" /> All waste</span><span className="flex items-center gap-1.5 text-[10px] text-[#809087]"><span className="h-2 w-2 rounded-full bg-[#c7ee47]" /> E-waste</span><button onClick={() => toast.success("Analytics export queued")} className="ml-2 rounded-lg border border-[#e0e8e2] p-1.5 text-[#83918a] hover:bg-[#f6f9f6]"><Download className="h-3.5 w-3.5" /></button></div>} /><div className="h-[235px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9efeb" /><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ba8a1" }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fontSize: 10, fill: "#9ba8a1" }} axisLine={false} tickLine={false} tickCount={4} /><ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe8e1", boxShadow: "0 8px 25px rgba(25,50,35,.08)", fontSize: 11 }} /><Line type="monotone" dataKey="nonEWaste" name="All waste" stroke="#8dadc7" strokeWidth={2.2} dot={false} /><Line type="monotone" dataKey="eWaste" name="E-waste" stroke="#9bc52e" strokeWidth={2.2} dot={false} /></LineChart></ResponsiveContainer></div></CardShell>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <CardShell className="overflow-hidden"><div className="p-5 pb-2 sm:p-6 sm:pb-2"><SectionHeading eyebrow="Latest AI events" title="Recent classifications" action={<button onClick={() => onNavigate("classification")} className="text-[11px] font-semibold text-[#6e8d3e] hover:text-[#426218]">See all <ChevronRight className="inline h-3 w-3" /></button>} /></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-y border-[#edf1ee] text-[9px] font-bold uppercase tracking-[0.14em] text-[#9ca9a2]"><th className="px-5 py-3 font-semibold sm:px-6">Capture</th><th className="px-3 py-3 font-semibold">Device / location</th><th className="px-3 py-3 font-semibold">Waste type</th><th className="px-3 py-3 font-semibold">Confidence</th><th className="px-5 py-3 text-right font-semibold sm:px-6">Status</th></tr></thead><tbody>{classifications.slice(0, 5).map((item) => <tr key={item.id} className="border-b border-[#f0f3f1] last:border-0 hover:bg-[#fbfcfa]"><td className="px-5 py-3.5 sm:px-6"><div className="flex items-center gap-3"><CameraThumbnail tone={item.imageTone} size="sm" /><div><p className="text-[11px] font-semibold text-[#33463a]">{item.timestamp}</p><p className="mt-0.5 text-[10px] text-[#9ba8a1]">{item.id}</p></div></div></td><td className="px-3 py-3.5"><p className="font-mono text-[10px] font-semibold text-[#42564a]">{item.deviceId}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#93a098]"><MapPin className="h-2.5 w-2.5" />{item.location}</p></td><td className="px-3 py-3.5"><WasteTag type={item.wasteType} /></td><td className="px-3 py-3.5"><span className="text-[11px] font-semibold text-[#405448]">{item.confidence}%</span></td><td className="px-5 py-3.5 text-right sm:px-6">{item.isEWaste ? <StatusPill status="warning" label="E-waste" /> : <span className="text-[11px] text-[#899790]">—</span>}</td></tr>)}</tbody></table></div></CardShell>
        <CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Fleet snapshot" title="Device status" action={<button onClick={() => onNavigate("devices")} className="text-[11px] font-semibold text-[#6e8d3e]">Manage <ChevronRight className="inline h-3 w-3" /></button>} /><div className="space-y-3">{deviceData.slice(0, 4).map((device) => <button key={device.id} onClick={() => onNavigate("devices")} className="flex w-full items-center gap-3 rounded-xl border border-[#edf1ee] p-3 text-left transition-colors hover:border-[#cddbcf] hover:bg-[#fbfcfa]"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${device.status === "online" ? "bg-[#e9f5d7] text-[#6c8d2c]" : device.status === "warning" ? "bg-[#fff2d3] text-[#a98021]" : "bg-[#edf0f0] text-[#82908b]"}`}><Cpu className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-mono text-[10px] font-semibold text-[#405348]">{device.id}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#96a39c]"><MapPin className="h-2.5 w-2.5" />{device.location}</p></div><div className="text-right"><StatusPill status={device.status} /><p className="mt-1 text-[9px] text-[#a0aaa5]">{device.lastSeen}</p></div></button>)}</div><button onClick={() => onNavigate("devices")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d9e4dc] py-2.5 text-[10px] font-semibold text-[#799077] hover:bg-[#fafcf9]">View all devices <ChevronRight className="h-3 w-3" /></button></CardShell>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="System log" title="Recent activity" action={<button onClick={() => toast.info("Activity stream is live")} className="text-[11px] font-semibold text-[#6e8d3e]">Live stream <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#56aa69]" /></button>} /><div className="space-y-4">{activityLog.slice(0, 4).map((activity) => <div key={`${activity.time}-${activity.title}`} className="flex gap-3"><div className="relative flex w-7 justify-center"><div className={`z-10 flex h-6 w-6 items-center justify-center rounded-lg ${activity.type === "warning" ? "bg-[#fff2d4] text-[#aa7b18]" : activity.type === "signal" ? "bg-[#eff7d2] text-[#729429]" : "bg-[#e9f0ed] text-[#5f7a68]"}`}>{activity.type === "warning" ? <AlertTriangle className="h-3 w-3" /> : activity.type === "signal" ? <Zap className="h-3 w-3" /> : <Activity className="h-3 w-3" />}</div></div><div className="flex-1 border-b border-[#eef2ef] pb-3"><div className="flex items-start justify-between gap-3"><p className="text-[11px] font-semibold text-[#405448]">{activity.title}</p><span className="text-[10px] text-[#a0aaa4]">{activity.time}</span></div><p className="mt-1 text-[10px] text-[#8d9b93]">{activity.detail}</p></div></div>)}</div></CardShell>
        <CardShell className="relative overflow-hidden bg-[#eff7d5] p-5 sm:p-6"><div className="absolute -right-8 -top-10 h-40 w-40 rounded-full border-[22px] border-[#d8efa1] opacity-80" /><div className="relative"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d2f35e] text-[#425918]"><Zap className="h-5 w-5" /></div><span className="rounded-full bg-[#d7eda8] px-2.5 py-1 text-[10px] font-semibold text-[#648124]">Priority signal</span></div><h3 className="mt-5 text-[20px] font-semibold tracking-[-0.04em] text-[#2e451b]">E-waste needs your attention</h3><p className="mt-2 max-w-[360px] text-[11px] leading-5 text-[#718451]">166 items identified this week. That’s <strong className="text-[#4d651f]">12.2% higher</strong> than the previous period — mostly from the Computer Lab.</p><div className="mt-6 flex items-end justify-between"><div><p className="text-[32px] font-semibold tracking-[-0.06em] text-[#3c591c]">8.1%</p><p className="text-[10px] text-[#7a8b5c]">of all detections</p></div><button onClick={() => onNavigate("analytics")} className="inline-flex items-center gap-2 rounded-lg bg-[#253b1d] px-3 py-2 text-[10px] font-semibold text-[#e5f5b7] hover:bg-[#1c3017]">Explore insight <ChevronRight className="h-3 w-3" /></button></div></div></CardShell>
      </div>
    </div>
  );
}

function DevicesView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "online" | "warning" | "offline">("all");
  const [selected, setSelected] = useState<Device>(deviceData[0]);
  const filtered = useMemo(() => deviceData.filter((device) => (status === "all" || device.status === status) && `${device.id} ${device.location} ${device.macAddress}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  return <div className="space-y-6"><PageIntro eyebrow="Operations / device registry" title="Devices" description="Manage the ESP32-CAM fleet, inspect health telemetry, and trace each unit back to its physical location." action={<button onClick={() => toast.info("Registration flow opened", { description: "New devices are discovered automatically when they connect." })} className="inline-flex items-center gap-2 rounded-xl bg-[#243c2d] px-4 py-2.5 text-[11px] font-semibold text-[#e6f4c4] shadow-sm hover:bg-[#1b3023]"><Plus className="h-3.5 w-3.5" /> Register device</button>} /><div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]"><CardShell className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#edf1ee] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="relative flex-1 sm:max-w-[290px]"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa79f]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search devices..." className="h-9 w-full rounded-lg border border-[#e0e8e2] bg-[#fafcfb] pl-9 pr-3 text-[11px] text-[#415448] outline-none ring-[#d3e5b3] placeholder:text-[#a5afaa] focus:ring-2" /></div><div className="flex items-center gap-2"><div className="flex items-center gap-1 rounded-lg border border-[#e0e8e2] bg-white p-1">{(["all", "online", "warning", "offline"] as const).map((filter) => <button key={filter} onClick={() => setStatus(filter)} className={`rounded-md px-2 py-1.5 text-[10px] font-semibold capitalize ${status === filter ? "bg-[#edf6d9] text-[#58711f]" : "text-[#94a19a] hover:text-[#53675a]"}`}>{filter === "all" ? "All" : filter}</button>)}</div><button onClick={() => toast.info("Advanced filters", { description: "Location and firmware filters are ready for the API layer." })} className="rounded-lg border border-[#e0e8e2] p-2 text-[#87958d]"><Filter className="h-3.5 w-3.5" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-[#edf1ee] text-[9px] font-bold uppercase tracking-[0.14em] text-[#9ca9a2]"><th className="px-5 py-3 font-semibold sm:px-6">Device</th><th className="px-3 py-3 font-semibold">Location</th><th className="px-3 py-3 font-semibold">Sensors</th><th className="px-3 py-3 font-semibold">Power</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold sm:px-6">Last seen</th></tr></thead><tbody>{filtered.map((device) => <tr key={device.id} onClick={() => setSelected(device)} className={`cursor-pointer border-b border-[#f0f3f1] last:border-0 hover:bg-[#fbfcfa] ${selected.id === device.id ? "bg-[#f6faef]" : ""}`}><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9f2e7] text-[#61844a]"><Camera className="h-4 w-4" /></div><div><p className="font-mono text-[10px] font-semibold text-[#3e5245]">{device.id}</p><p className="mt-1 text-[10px] text-[#a0aaa5]">{device.macAddress}</p></div></div></td><td className="px-3 py-4 text-[11px] text-[#65766c]">{device.location}</td><td className="px-3 py-4"><span className="text-[10px] text-[#728179]">{device.sensors.join(" · ")}</span></td><td className="px-3 py-4 text-[10px] font-semibold text-[#607269]">{device.power}</td><td className="px-3 py-4"><StatusPill status={device.status} /></td><td className="px-5 py-4 text-right text-[10px] text-[#8b9991] sm:px-6">{device.lastSeen}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-10 text-center text-[12px] text-[#84928a]">No devices match your filters.</div>}</div></CardShell><DeviceDetail device={selected} /></div></div>;
}

function DeviceDetail({ device }: { device: Device }) {
  return <CardShell className="h-fit p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#94a19a]">Selected device</p><h2 className="mt-2 font-mono text-[15px] font-semibold text-[#263a2e]">{device.id}</h2></div><StatusPill status={device.status} /></div><div className="mt-5 rounded-xl bg-[#f2f7ef] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dceec1] text-[#668728]"><Cpu className="h-5 w-5" /></div><div><p className="text-[12px] font-semibold text-[#3e5544]">{device.location}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#829189]"><MapPin className="h-3 w-3" />Registered {device.registeredAt}</p></div></div></div><div className="mt-5 space-y-3">{[["MAC address", device.macAddress], ["Firmware", device.firmware], ["Camera", device.camera === "healthy" ? "Healthy" : "Needs attention"], ["Uptime", device.uptime]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-[#edf1ee] pb-3 text-[11px]"><span className="text-[#8a9891]">{label}</span><span className="font-mono font-semibold text-[#43564a]">{value}</span></div>)}</div><div className="mt-5"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8c9b92]">Health score</span><span className="text-[12px] font-semibold text-[#587a32]">{device.health}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e8eee8]"><div className={`h-full rounded-full ${device.health > 85 ? "bg-[#9bc84c]" : device.health > 50 ? "bg-[#e0b83f]" : "bg-[#cf8580]"}`} style={{ width: `${device.health}%` }} /></div></div><button onClick={() => toast.info("Device details", { description: "Configuration editor will connect to the device API." })} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce6df] py-2.5 text-[11px] font-semibold text-[#61766a] hover:bg-[#fafcf9]">Open configuration <ChevronRight className="h-3 w-3" /></button></CardShell>;
}

function LiveMonitoringView() {
  const [selectedId, setSelectedId] = useState(deviceData[0].id);
  const selected = deviceData.find((device) => device.id === selectedId) ?? deviceData[0];
  const latest = classifications.find((item) => item.deviceId === selected.id) ?? classifications[0];
  return <div className="space-y-6"><PageIntro eyebrow="Operations / real-time telemetry" title="Live monitoring" description="Inspect the camera stream, latest inference, and sensor health for any connected device." action={<div className="flex items-center gap-2 rounded-xl border border-[#dce9dd] bg-[#f0f7ec] px-3 py-2.5 text-[10px] font-semibold text-[#4d7a4e]"><span className="h-1.5 w-1.5 rounded-full bg-[#50a967] shadow-[0_0_0_3px_rgba(80,169,103,0.12)]" /> Connected to stream</div>} /><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dfe8e1] bg-white p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f4d9] text-[#6f902c]"><Radio className="h-4 w-4" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aa79f]">Monitoring device</p><p className="mt-1 text-[12px] font-semibold text-[#34483a]">{selected.id} <span className="ml-1 font-normal text-[#92a099]">· {selected.location}</span></p></div></div><select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-lg border border-[#dfe8e1] bg-[#fbfcfb] px-3 py-2 text-[11px] font-semibold text-[#53695a] outline-none"><option value="ESP32-CAM-001">ESP32-CAM-001</option><option value="ESP32-CAM-002">ESP32-CAM-002</option><option value="ESP32-CAM-003">ESP32-CAM-003</option><option value="ESP32-CAM-004">ESP32-CAM-004</option></select></div><div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]"><CardShell className="overflow-hidden bg-[#18241f] p-0"><div className="flex items-center justify-between border-b border-[#30413a] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#d2f35e]" /><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a3b7a8]">Camera feed / live</span></div><span className="font-mono text-[10px] text-[#81968a]">1280 × 720 · 24 FPS</span></div><div className="relative flex min-h-[375px] items-center justify-center overflow-hidden bg-[#23362c] [background-image:linear-gradient(rgba(188,235,133,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(188,235,133,.06)_1px,transparent_1px)] [background-size:38px_38px]"><div className="absolute inset-8 border border-dashed border-[#65816a]/50 sm:inset-14" /><div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9dbc75] bg-[#314c3c] text-[#d2f35e] shadow-[0_0_0_12px_rgba(172,216,98,0.08)]"><Play className="ml-1 h-6 w-6 fill-current" /></div><p className="mt-5 text-[12px] font-semibold text-[#deefd7]">Awaiting live frame</p><p className="mt-1 text-[10px] text-[#91aa97]">ESP32-CAM stream placeholder · ready for WebSocket / RTSP bridge</p></div><div className="absolute left-5 top-5 rounded-md border border-[#647c6c] bg-[#1b2e26]/80 px-2 py-1 font-mono text-[9px] text-[#b4c8b6]">REC ●</div><div className="absolute bottom-5 right-5 rounded-md border border-[#647c6c] bg-[#1b2e26]/80 px-2 py-1 font-mono text-[9px] text-[#b4c8b6]">{selected.lastSeen}</div></div></CardShell><div className="space-y-5"><CardShell className="p-5"><SectionHeading eyebrow="Latest inference" title="AI classification" /><div className="flex items-center gap-3"><CameraThumbnail tone={latest.imageTone} /><div><WasteTag type={latest.wasteType} /><p className="mt-2 text-[11px] text-[#84938a]">Captured {latest.timestamp}</p></div></div><div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.12em] text-[#98a59e]">Confidence score</p><p className="mt-1 text-[29px] font-semibold tracking-[-0.06em] text-[#294031]">{latest.confidence}<span className="text-[16px] text-[#6e8a73]">%</span></p></div>{latest.isEWaste && <StatusPill status="warning" label="E-waste detected" />}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1eb]"><div className="h-full rounded-full bg-[#a5cc40]" style={{ width: `${latest.confidence}%` }} /></div></CardShell><CardShell className="p-5"><SectionHeading eyebrow="Device telemetry" title="Sensor readings" /><div className="grid grid-cols-2 gap-3">{[{ icon: Thermometer, label: "Temperature", value: `${selected.reading.temperature}°C` }, { icon: Activity, label: "Humidity", value: `${selected.reading.humidity}%` }, { icon: BatteryCharging, label: "Battery", value: `${selected.reading.battery}%` }, { icon: Wifi, label: "Signal", value: `${selected.reading.signal}%` }].map(({ icon: Icon, label, value }) => <div key={label} className="rounded-xl bg-[#f6f9f5] p-3"><Icon className="h-4 w-4 text-[#78985b]" /><p className="mt-3 text-[10px] text-[#92a098]">{label}</p><p className="mt-1 text-[15px] font-semibold text-[#405548]">{value}</p></div>)}</div></CardShell></div></div></div>;
}

function ClassificationsView() {
  const [category, setCategory] = useState("All categories");
  const [onlyEWaste, setOnlyEWaste] = useState(false);
  const filtered = classifications.filter((item) => (category === "All categories" || item.wasteType === category) && (!onlyEWaste || item.isEWaste));
  return <div className="space-y-6"><PageIntro eyebrow="AI inference history" title="Waste classification" description="Review every captured frame and inference result across the network, including e-waste signals that need attention." action={<button onClick={() => toast.success("Classification report exported")} className="inline-flex items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#61766a] hover:bg-[#f7faf7]"><Download className="h-3.5 w-3.5" /> Export report</button>} /><CardShell className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ee] p-5 sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#93a199]">{filtered.length} records shown</p><p className="mt-1 text-[12px] text-[#73837a]">Latest captures from the AI inference pipeline</p></div><div className="flex flex-wrap items-center gap-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#dfe8e1] bg-white px-3 py-2 text-[10px] font-semibold text-[#607269] outline-none"><option>All categories</option>{["Plastic", "Paper", "Glass", "Metal", "Organic", "E-Waste"].map((type) => <option key={type}>{type}</option>)}</select><button onClick={() => setOnlyEWaste(!onlyEWaste)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold ${onlyEWaste ? "border-[#cadd98] bg-[#eff7d7] text-[#5e7d24]" : "border-[#dfe8e1] text-[#7d8c84]"}`}><span className={`h-3 w-3 rounded border ${onlyEWaste ? "border-[#89ad30] bg-[#a8ce42]" : "border-[#c6d1c9]"}`}>{onlyEWaste && <Check className="h-3 w-3 text-white" />}</span> E-waste only</button><button onClick={() => toast.info("More filters", { description: "Device, location, and date filters will map to the classification API." })} className="rounded-lg border border-[#dfe8e1] p-2 text-[#84928b]"><SlidersHorizontal className="h-3.5 w-3.5" /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-[#edf1ee] text-[9px] font-bold uppercase tracking-[0.14em] text-[#9ca9a2]"><th className="px-5 py-3 font-semibold sm:px-6">Captured frame</th><th className="px-3 py-3 font-semibold">Device</th><th className="px-3 py-3 font-semibold">Location</th><th className="px-3 py-3 font-semibold">Prediction</th><th className="px-3 py-3 font-semibold">Confidence</th><th className="px-5 py-3 text-right font-semibold sm:px-6">E-waste</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id} className="border-b border-[#f0f3f1] last:border-0 hover:bg-[#fbfcfa]"><td className="px-5 py-3.5 sm:px-6"><div className="flex items-center gap-3"><CameraThumbnail tone={item.imageTone} size="sm" /><div><p className="text-[11px] font-semibold text-[#405448]">{item.timestamp}</p><p className="mt-1 font-mono text-[10px] text-[#9aa7a0]">{item.id}</p></div></div></td><td className="px-3 py-3.5 font-mono text-[10px] font-semibold text-[#52665a]">{item.deviceId}</td><td className="px-3 py-3.5 text-[11px] text-[#76857c]">{item.location}</td><td className="px-3 py-3.5"><WasteTag type={item.wasteType} /></td><td className="px-3 py-3.5"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#edf1ec]"><div className="h-full rounded-full bg-[#9dc745]" style={{ width: `${item.confidence}%` }} /></div><span className="text-[10px] font-semibold text-[#607269]">{item.confidence}%</span></div></td><td className="px-5 py-3.5 text-right sm:px-6">{item.isEWaste ? <StatusPill status="warning" label="Detected" /> : <span className="text-[11px] text-[#9aa59f]">No</span>}</td></tr>)}</tbody></table></div></CardShell></div>;
}

function AnalyticsView() {
  const [range, setRange] = useState("Daily");
  return <div className="space-y-6"><PageIntro eyebrow="Insights / network performance" title="Analytics" description="Turn classification history into operational signals for collection planning and e-waste response." action={<div className="flex rounded-xl border border-[#dfe8e1] bg-white p-1">{["Daily", "Weekly", "Monthly"].map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${range === item ? "bg-[#e7f3c9] text-[#5d7925]" : "text-[#8b9992]"}`}>{item}</button>)}</div>} /><div className="grid gap-5 xl:grid-cols-2"><CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Volume trend" title={`${range} classification volume`} action={<span className="text-[10px] text-[#93a19a]">2,050 total</span>} /><div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}><CartesianGrid vertical={false} stroke="#ebf0ec" /><XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ba8a1" }} axisLine={false} tickLine={false} interval={1} /><YAxis tick={{ fontSize: 9, fill: "#9ba8a1" }} axisLine={false} tickLine={false} /><ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe8e1", fontSize: 11 }} /><Bar dataKey="nonEWaste" name="Non e-waste" stackId="a" fill="#b8cad9" radius={[3, 3, 0, 0]} /><Bar dataKey="eWaste" name="E-waste" stackId="a" fill="#c7ee47" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></CardShell><CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Category mix" title="Waste categories" action={<button onClick={() => toast.success("Category data exported")} className="text-[10px] font-semibold text-[#718f3c]">Export CSV</button>} /><div className="flex gap-6"><div className="h-[220px] w-1/2"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={wasteDetections} dataKey="count" nameKey="label" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">{wasteDetections.map((entry) => <Cell key={entry.label} fill={entry.color} />)}</Pie><ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe8e1", fontSize: 11 }} /></PieChart></ResponsiveContainer></div><div className="flex flex-1 flex-col justify-center gap-3">{wasteDetections.map((item) => <div key={item.label} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[10px] text-[#718079]"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span><span className="text-[10px] font-semibold text-[#42574a]">{formatNumber(item.count)}</span></div>)}</div></div></CardShell><CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Signal quality" title="AI confidence distribution" /><div className="h-[225px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ range: "<80%", count: 32 }, { range: "80–85%", count: 74 }, { range: "85–90%", count: 184 }, { range: "90–95%", count: 632 }, { range: "95–100%", count: 1128 }]} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}><CartesianGrid vertical={false} stroke="#ebf0ec" /><XAxis dataKey="range" tick={{ fontSize: 9, fill: "#9ba8a1" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: "#9ba8a1" }} axisLine={false} tickLine={false} /><ChartTooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe8e1", fontSize: 11 }} /><Bar dataKey="count" fill="#a9ca4a" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardShell><CardShell className="p-5 sm:p-6"><SectionHeading eyebrow="Device activity" title="Fleet throughput" action={<span className="text-[10px] text-[#93a19a]">Today</span>} /><div className="space-y-4">{deviceData.slice(0, 4).map((device, index) => <div key={device.id}><div className="mb-2 flex items-center justify-between text-[10px]"><span className="font-mono font-semibold text-[#52665a]">{device.id}</span><span className="text-[#8e9b94]">{device.classificationsToday} classifications</span></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1ec]"><div className={`h-full rounded-full ${index === 2 ? "bg-[#e3bb44]" : "bg-[#9dc745]"}`} style={{ width: `${Math.max(18, device.classificationsToday / 2)}%` }} /></div></div>)}</div></CardShell></div></div>;
}

function RegistrationView() {
  const [items, setItems] = useState(pendingRegistrations);
  const updateStatus = (id: string, status: "approved" | "rejected") => { setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item)); toast.success(status === "approved" ? `${id} approved` : `${id} rejected`, { description: "The device registry has been updated." }); };
  return <div className="space-y-6"><PageIntro eyebrow="System / onboarding" title="Device registration" description="New ESP32-CAM devices transmit their hardware metadata on first connection. Review the handshake, then approve them into the fleet." action={<div className="inline-flex items-center gap-2 rounded-xl border border-[#dce9dd] bg-[#f0f7ec] px-3 py-2.5 text-[10px] font-semibold text-[#4d7a4e]"><Network className="h-3.5 w-3.5" /> Listening for devices</div>} /><CardShell className="overflow-hidden"><div className="flex items-start gap-4 border-b border-[#e8efe9] bg-[#f4f9e9] p-5 sm:p-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d8eea6] text-[#5e7d21]"><Radio className="h-5 w-5" /></div><div><h2 className="text-[14px] font-semibold text-[#385127]">Automatic discovery is active</h2><p className="mt-1 max-w-[620px] text-[11px] leading-5 text-[#71845e]">Devices publish their MAC address, firmware, sensor capabilities, and optional location metadata to the registration endpoint on first heartbeat. Nothing is added to the production fleet until an operator approves it.</p></div></div><div className="divide-y divide-[#edf1ee]">{items.map((item) => <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f0ea] text-[#6b8771]"><Cpu className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[11px] font-semibold text-[#3c5143]">{item.id}</p>{item.status === "pending" ? <StatusPill status="pending" /> : <StatusPill status={item.status === "approved" ? "success" : "offline"} label={item.status === "approved" ? "Approved" : "Rejected"} />}</div><p className="mt-1 text-[10px] text-[#94a29a]">{item.macAddress} · discovered {item.discoveredAt}</p></div></div><div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] sm:min-w-[360px] sm:grid-cols-3"><div><span className="block text-[#a0aaa5]">Firmware</span><span className="mt-1 block font-mono font-semibold text-[#607268]">{item.firmware}</span></div><div><span className="block text-[#a0aaa5]">Sensors</span><span className="mt-1 block font-semibold text-[#607268]">{item.sensors.join(" · ")}</span></div><div><span className="block text-[#a0aaa5]">Location</span><span className="mt-1 block font-semibold text-[#607268]">{item.location}</span></div></div>{item.status === "pending" && <div className="flex shrink-0 items-center gap-2"><button onClick={() => updateStatus(item.id, "rejected")} className="rounded-lg border border-[#e1e8e3] px-3 py-2 text-[10px] font-semibold text-[#899790] hover:bg-[#fafcf9]">Reject</button><button onClick={() => updateStatus(item.id, "approved")} className="rounded-lg bg-[#253e2e] px-3 py-2 text-[10px] font-semibold text-[#e6f5bd] hover:bg-[#1b3023]">Approve device</button></div>}</div>)}</div></CardShell></div>;
}

function SettingsView() {
  const [settings, setSettings] = useState({ autoRegister: true, eWasteAlerts: true, streamHealth: true, weeklyDigest: false, confidenceReview: true });
  const toggle = (key: keyof typeof settings) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return <div className="space-y-6"><PageIntro eyebrow="System configuration" title="Settings" description="Tune how the control plane handles devices, inference review, and operational notifications." action={<button onClick={() => toast.success("Settings saved", { description: "Changes are ready to be applied to the API layer." })} className="rounded-xl bg-[#253e2e] px-4 py-2.5 text-[11px] font-semibold text-[#e7f5bd]">Save changes</button>} /><div className="grid gap-5 lg:grid-cols-2"><SettingsSection icon={Server} title="System settings" description="Core connection and data retention behavior"><SettingRow title="Live data stream" detail="Receive telemetry from REST, WebSocket, or MQTT transport" value={true} /><SettingRow title="Auto-register devices" detail="Queue first-seen ESP32-CAM hardware for approval" value={settings.autoRegister} onChange={() => toggle("autoRegister")} /></SettingsSection><SettingsSection icon={Recycle} title="Classification settings" description="Controls for the AI inference pipeline"><SettingRow title="E-waste alerts" detail="Raise an alert when e-waste confidence exceeds 85%" value={settings.eWasteAlerts} onChange={() => toggle("eWasteAlerts")} /><SettingRow title="Manual review queue" detail="Flag low-confidence predictions below 80%" value={settings.confidenceReview} onChange={() => toggle("confidenceReview")} /></SettingsSection><SettingsSection icon={Bell} title="Notifications" description="Where the operations team receives system signals"><SettingRow title="Device health alerts" detail="Notify on offline, low battery, or camera attention" value={settings.streamHealth} onChange={() => toggle("streamHealth")} /><SettingRow title="Weekly digest" detail="Send a Monday summary of waste and e-waste trends" value={settings.weeklyDigest} onChange={() => toggle("weeklyDigest")} /></SettingsSection><SettingsSection icon={ShieldCheck} title="User settings" description="Account and access controls"><div className="flex items-center justify-between gap-4 border-b border-[#edf1ee] py-3.5"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3ee] text-[#6f8978]"><UserRound className="h-4 w-4" /></div><div><p className="text-[11px] font-semibold text-[#46594c]">Aarav Kulkarni</p><p className="mt-1 text-[10px] text-[#94a199]">Admin · aarav@reclassify.local</p></div></div><button onClick={() => toast.info("Profile editor", { description: "User management will connect to the auth service." })} className="text-[10px] font-semibold text-[#718e3d]">Edit profile</button></div><div className="flex items-center justify-between py-3.5"><div><p className="text-[11px] font-semibold text-[#46594c]">Session security</p><p className="mt-1 text-[10px] text-[#94a199]">OAuth and signed session cookies are enabled</p></div><StatusPill status="success" label="Protected" /></div></SettingsSection></div></div>;
}

function SettingsSection({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: React.ReactNode }) {
  return <CardShell className="p-5 sm:p-6"><div className="flex items-start gap-3 border-b border-[#edf1ee] pb-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2e7] text-[#6d8b5a]"><Icon className="h-4 w-4" /></div><div><h2 className="text-[14px] font-semibold text-[#34483a]">{title}</h2><p className="mt-1 text-[10px] text-[#94a19a]">{description}</p></div></div><div className="mt-1">{children}</div></CardShell>;
}

function SettingRow({ title, detail, value, onChange = () => undefined }: { title: string; detail: string; value: boolean; onChange?: () => void }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#edf1ee] py-3.5 last:border-0"><div><p className="text-[11px] font-semibold text-[#46594c]">{title}</p><p className="mt-1 max-w-[270px] text-[10px] leading-4 text-[#94a199]">{detail}</p></div><button aria-label={`Toggle ${title}`} onClick={onChange} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${value ? "bg-[#98c640]" : "bg-[#d6dfd8]"}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} /></button></div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#93a199]">{eyebrow}</p><h2 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[#1d3025]">{title}</h2><p className="mt-2 max-w-[650px] text-[12px] leading-5 text-[#829088]">{description}</p></div>{action}</div>;
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activePage = getPageFromPath(location);
  const onNavigate = (page: PageKey) => setLocation(page === "dashboard" ? "/" : `/${page}`);
  const content = { dashboard: <DashboardView onNavigate={onNavigate} />, devices: <DevicesView />, monitoring: <LiveMonitoringView />, classification: <ClassificationsView />, analytics: <AnalyticsView />, registration: <RegistrationView />, settings: <SettingsView /> }[activePage];
  return <div className="min-h-screen bg-[#fbfcfb] text-[#17251e]"><Sidebar activePage={activePage} onNavigate={onNavigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><main className="min-h-screen lg:pl-[252px]"><TopBar activePage={activePage} onOpenMenu={() => setMobileOpen(true)} /><div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">{content}</div><footer className="mx-auto flex max-w-[1500px] items-center justify-between px-5 pb-8 text-[10px] text-[#a0aba5] sm:px-8 lg:px-10"><span>RE:CLASSIFY · IoT operations console</span><span className="hidden items-center gap-1.5 sm:flex"><Cloud className="h-3 w-3" /> {apiNotes.transport}</span></footer></main></div>;
}
