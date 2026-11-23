import { useState, type ReactNode } from "react";
import {
  Home, ArrowLeftRight, Wifi, Bell, Settings as Cog, ArrowDownLeft, ArrowUpRight, Phone, MessageSquare,
  Moon, ChevronLeft, ChevronRight, Search, ShieldCheck, Lock, Plus, FileText, AlertTriangle, Info,
  ShieldAlert, ClipboardPaste, Trash2, EyeOff, Building2, Smartphone, Signal, CheckCircle2, CircleDashed,
  RotateCcw, ShoppingBag, MessagesSquare, Sparkles,
} from "lucide-react";
import { transactions, resources, alerts as alertsData, messages, etb, type Tx, type Resource, type TxType } from "./data";
import { cn } from "@/lib/utils";

type Tab = "home" | "tx" | "packages" | "alerts" | "settings";
type View =
  | { k: "tab" }
  | { k: "tx"; tx: Tx }
  | { k: "res"; res: Resource }
  | { k: "messages" }
  | { k: "import" };

export function SmsInsightApp() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [view, setView] = useState<View>({ k: "tab" });
  const back = () => setView({ k: "tab" });

  let screen: ReactNode;
  if (!onboarded) screen = <Onboarding onDone={() => setOnboarded(true)} />;
  else if (view.k === "tx") screen = <TxDetail tx={view.tx} onBack={back} />;
  else if (view.k === "res") screen = <ResDetail res={view.res} onBack={back} />;
  else if (view.k === "messages") screen = <Messages onBack={back} />;
  else if (view.k === "import") screen = <Import onBack={back} />;
  else
    screen = {
      home: <HomeScreen go={setView} setTab={setTab} />,
      tx: <TxList open={(tx) => setView({ k: "tx", tx })} />,
      packages: <Packages open={(res) => setView({ k: "res", res })} />,
      alerts: <Alerts />,
      settings: <SettingsScreen go={setView} reset={() => setOnboarded(false)} />,
    }[tab];

  return (
    <div className="relative flex h-full flex-col bg-background">
      <StatusBar />
      <div className="no-scrollbar flex-1 overflow-y-auto">{screen}</div>
      {onboarded && view.k === "tab" && <BottomNav tab={tab} setTab={setTab} />}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-foreground">
      <span className="num">9:41</span>
      <div className="flex items-center gap-1.5"><Signal className="size-3.5" /><Wifi className="size-3.5" /><div className="h-2.5 w-5 rounded-sm border border-foreground/70 p-px"><div className="h-full w-3/4 rounded-[1px] bg-foreground" /></div></div>
    </div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "tx", label: "Money", icon: ArrowLeftRight },
    { id: "packages", label: "Packages", icon: Wifi },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Cog },
  ];
  return (
    <nav className="grid grid-cols-5 border-t border-border bg-card px-2 pt-2 pb-4">
      {items.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1" aria-label={label}>
            <span className={cn("relative flex h-8 w-14 items-center justify-center rounded-full transition-colors", active ? "bg-secondary text-primary" : "text-muted-foreground")}>
              <Icon className="size-5" />
              {id === "alerts" && <span className="absolute top-1 right-3 size-2 rounded-full bg-destructive" />}
            </span>
            <span className={cn("text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- shared bits ---------- */
function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-3 pb-4">
      {onBack && <button onClick={onBack} aria-label="Back" className="-ml-2 flex size-10 items-center justify-center rounded-full hover:bg-muted"><ChevronLeft className="size-5" /></button>}
      <div className="flex-1">
        {sub && <p className="text-xs font-medium text-muted-foreground">{sub}</p>}
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {right}
    </div>
  );
}
const Card = ({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) => (
  <div onClick={onClick} className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", onClick && "cursor-pointer transition-transform active:scale-[0.99]", className)}>{children}</div>
);
const SectionTitle = ({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) => (
  <div className="mb-2 mt-6 flex items-center justify-between px-5">
    <h2 className="text-sm font-bold">{children}</h2>
    {action && <button onClick={onAction} className="text-xs font-semibold text-primary">{action}</button>}
  </div>
);

const txMeta: Record<TxType, { icon: typeof Home; tone: "in" | "out"; label: string }> = {
  Received: { icon: ArrowDownLeft, tone: "in", label: "Received" },
  Refund: { icon: RotateCcw, tone: "in", label: "Refund" },
  Sent: { icon: ArrowUpRight, tone: "out", label: "Sent" },
  Debit: { icon: ArrowUpRight, tone: "out", label: "Debit" },
  Payment: { icon: ShoppingBag, tone: "out", label: "Payment" },
};

function TxRow({ tx, onClick }: { tx: Tx; onClick: () => void }) {
  const m = txMeta[tx.type];
  const Icon = m.icon;
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", m.tone === "in" ? "bg-success-soft text-success" : "bg-danger-soft text-destructive")}><Icon className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-semibold", tx.counterparty.startsWith("Unknown") && "italic text-muted-foreground")}>{tx.counterparty}</p>
        <p className="truncate text-xs text-muted-foreground">{m.label} · {tx.provider} · {tx.date}</p>
      </div>
      <div className="text-right">
        <p className={cn("num text-sm font-bold", m.tone === "in" ? "text-success" : "text-foreground")}>{m.tone === "in" ? "+" : "−"}{etb(tx.amount)}</p>
        <p className="text-[10px] text-muted-foreground">{tx.fee ? `ETB · fee ${etb(tx.fee)}` : "ETB"}</p>
      </div>
    </button>
  );
}

const resIcon = { Internet: Wifi, Voice: Phone, SMS: MessageSquare, "Night data": Moon } as const;

function Ring({ pct, size = 56, className }: { pct: number; size?: number; className?: string }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-muted" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="stroke-current transition-all" />
    </svg>
  );
}
const expTone = (d: number) => (d <= 1 ? "text-destructive" : d <= 3 ? "text-warning" : "text-primary");

/* ---------- Onboarding ---------- */
function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Sparkles, title: "Long SMS, made clear", body: "SMS Insight turns bank, Telebirr and Ethio Telecom messages into short, searchable summaries." },
    { icon: Building2, title: "Supported providers", body: "Transfers, payments, debits and balances from CBE and Telebirr. Data, voice and SMS packages from Ethio Telecom." },
    { icon: Lock, title: "Stays on your phone", body: "Everything is processed and stored on this device. No account, no cloud, no sharing." },
    { icon: ClipboardPaste, title: "How messages get in", body: "Paste or share an SMS into the app to read it. We only ask for permissions when a feature needs them." },
  ];
  const s = steps[step]!;
  const Icon = s.icon;
  return (
    <div className="flex h-full min-h-[640px] flex-col px-6 pt-10 pb-8">
      <div className="flex justify-between text-xs font-semibold text-muted-foreground"><span className="num">SMS Insight</span><button onClick={onDone}>Skip</button></div>
      <div className="flex flex-1 flex-col justify-center">
        <div className="bg-ink-gradient mb-8 flex size-20 items-center justify-center rounded-3xl text-ink-foreground shadow-card"><Icon className="size-9" /></div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">{s.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.body}</p>
        {step === 1 && (
          <div className="mt-6 flex gap-2">{["CBE", "Telebirr", "Ethio Telecom"].map((p) => <span key={p} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">{p}</span>)}</div>
        )}
      </div>
      <div className="mb-6 flex gap-1.5">{steps.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-8 bg-primary" : "w-1.5 bg-border")} />)}</div>
      <button onClick={() => (step < steps.length - 1 ? setStep(step + 1) : onDone())} className="h-14 rounded-2xl bg-primary text-base font-bold text-primary-foreground">
        {step < steps.length - 1 ? "Continue" : "Get started"}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">By continuing you accept the <u>privacy policy</u></p>
    </div>
  );
}

/* ---------- Home ---------- */
function HomeScreen({ go, setTab }: { go: (v: View) => void; setTab: (t: Tab) => void }) {
  const [period, setPeriod] = useState("Week");
  return (
    <div className="pb-6">
      <Header sub="Monday, 23 November" title="Selam, Meron" right={<button onClick={() => go({ k: "import" })} aria-label="Import SMS" className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary"><Plus className="size-5" /></button>} />
      <div className="px-5">
        <div className="bg-ink-gradient rounded-3xl p-5 text-ink-foreground shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium opacity-70">Money flow</p>
            <div className="flex rounded-full bg-ink-foreground/10 p-0.5 text-[11px] font-semibold">
              {["Today", "Week", "Month"].map((p) => <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-full px-2.5 py-1", period === p && "bg-ink-foreground text-ink")}>{p}</button>)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><p className="flex items-center gap-1 text-xs opacity-70"><ArrowDownLeft className="size-3.5" /> Received</p><p className="num mt-1 text-2xl font-bold">16,550<span className="text-sm opacity-60">.00</span></p></div>
            <div><p className="flex items-center gap-1 text-xs opacity-70"><ArrowUpRight className="size-3.5" /> Sent & debited</p><p className="num mt-1 text-2xl font-bold">4,415<span className="text-sm opacity-60">.40</span></p></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink-foreground/15 pt-3 text-xs">
            <span className="opacity-70">Last reported balance · Telebirr</span><span className="num font-semibold">ETB 18,230.50</span>
          </div>
          <p className="mt-1 text-[10px] opacity-50">From latest SMS, not a live balance</p>
        </div>
      </div>

      <SectionTitle action="All packages" onAction={() => setTab("packages")}>Packages</SectionTitle>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
        {resources.slice(0, 3).map((r) => {
          const Icon = resIcon[r.kind];
          return (
            <Card key={r.id} onClick={() => go({ k: "res", res: r })} className="w-36 shrink-0 p-3.5">
              <div className="flex items-center justify-between"><Icon className="size-4 text-primary" /><span className={cn("text-[10px] font-bold", expTone(r.expiresInDays))}>{r.expiresInDays}d left</span></div>
              <p className="num mt-3 text-2xl font-bold">{r.remaining}<span className="ml-0.5 text-xs font-semibold text-muted-foreground">{r.unit}</span></p>
              <p className="text-[11px] text-muted-foreground">{r.kind} remaining</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.remaining / r.total) * 100}%` }} /></div>
            </Card>
          );
        })}
      </div>

      <div className="mx-5 mt-4 flex items-start gap-3 rounded-2xl bg-warning-soft p-3.5">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex-1 text-xs"><p className="font-bold">Night bundle expires tomorrow</p><p className="text-muted-foreground">0.6 GB left · 24 Nov, 06:00</p></div>
        <button onClick={() => setTab("alerts")}><ChevronRight className="size-4 text-muted-foreground" /></button>
      </div>

      <SectionTitle action="See all" onAction={() => setTab("tx")}>Recent activity</SectionTitle>
      <Card className="mx-5 divide-y divide-border p-0 overflow-hidden">
        {transactions.slice(0, 4).map((t) => <TxRow key={t.id} tx={t} onClick={() => go({ k: "tx", tx: t })} />)}
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <button onClick={() => go({ k: "import" })} className="flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 p-3.5 text-sm font-semibold text-primary"><ClipboardPaste className="size-4" /> Paste SMS</button>
        <button onClick={() => go({ k: "messages" })} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-sm font-semibold"><MessagesSquare className="size-4" /> All messages</button>
      </div>
    </div>
  );
}

/* ---------- Transactions ---------- */
function TxList({ open }: { open: (t: Tx) => void }) {
  const [filter, setFilter] = useState<"All" | TxType>("All");
  const [q, setQ] = useState("");
  const list = transactions.filter((t) => (filter === "All" || t.type === filter) && (t.counterparty + t.ref).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="pb-6">
      <Header title="Transactions" sub="CBE · Telebirr" />
      <div className="px-5">
        <label className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or reference" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
        {(["All", "Received", "Sent", "Debit", "Payment", "Refund"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>{f}</button>
        ))}
      </div>
      <p className="mt-5 mb-2 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">November 2026</p>
      <Card className="mx-5 divide-y divide-border overflow-hidden p-0">
        {list.length ? list.map((t) => <TxRow key={t.id} tx={t} onClick={() => open(t)} />) : <p className="p-6 text-center text-sm text-muted-foreground">No matching transactions</p>}
      </Card>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("num text-right", strong && "font-bold", muted && "italic text-muted-foreground")}>{value}</span>
    </div>
  );
}

function TxDetail({ tx, onBack }: { tx: Tx; onBack: () => void }) {
  const [showSms, setShowSms] = useState(false);
  const m = txMeta[tx.type];
  const Icon = m.icon;
  const totalDebit = m.tone === "out" && tx.fee != null ? tx.amount + tx.fee + (tx.vat ?? 0) : null;
  return (
    <div className="pb-8">
      <Header title="" onBack={onBack} />
      <div className="flex flex-col items-center px-5 text-center">
        <span className={cn("flex size-14 items-center justify-center rounded-2xl", m.tone === "in" ? "bg-success-soft text-success" : "bg-danger-soft text-destructive")}><Icon className="size-7" /></span>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">{m.label} {m.tone === "in" ? "from" : "to"} {tx.counterparty}</p>
        <p className="num mt-1 text-4xl font-bold">{m.tone === "in" ? "+" : "−"}{etb(tx.amount)} <span className="text-lg text-muted-foreground">ETB</span></p>
        <span className={cn("mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", tx.status === "Parsed" ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>
          {tx.status === "Parsed" ? <CheckCircle2 className="size-3" /> : <CircleDashed className="size-3" />} {tx.status === "Parsed" ? "Fully parsed" : "Partially parsed"}
        </span>
      </div>
      <Card className="mx-5 mt-6 divide-y divide-border py-1">
        <Row label="Counterparty" value={tx.counterparty} muted={tx.counterparty.startsWith("Unknown")} />
        {tx.phone && <Row label="Phone" value={tx.phone} />}
        <Row label="Provider" value={tx.provider} />
        <Row label="Date & time" value={tx.date} />
        <Row label="Reference" value={tx.ref} />
      </Card>
      <Card className="mx-5 mt-3 divide-y divide-border py-1">
        <Row label="Transfer amount" value={`${etb(tx.amount)} ETB`} />
        <Row label="Service fee" value={tx.fee != null ? `${etb(tx.fee)} ETB` : "Not stated"} muted={tx.fee == null} />
        <Row label="VAT" value={tx.vat != null ? `${etb(tx.vat)} ETB` : "Not stated"} muted={tx.vat == null} />
        {totalDebit != null && <Row label="Total debited" value={`${etb(totalDebit)} ETB`} strong />}
        <Row label="Reported balance" value={tx.balance != null ? `${etb(tx.balance)} ETB` : "Not stated"} muted={tx.balance == null} />
      </Card>
      <div className="mx-5 mt-3">
        <button onClick={() => setShowSms(!showSms)} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm font-semibold">
          <span className="flex items-center gap-2"><FileText className="size-4 text-primary" /> {showSms ? "Hide" : "View"} original SMS</span>
          <ChevronRight className={cn("size-4 transition-transform", showSms && "rotate-90")} />
        </button>
        {showSms && <p className="mt-2 rounded-2xl bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground">{tx.sms}</p>}
      </div>
    </div>
  );
}

/* ---------- Packages ---------- */
function Packages({ open }: { open: (r: Resource) => void }) {
  return (
    <div className="pb-6">
      <Header title="Packages" sub="Ethio Telecom" />
      <div className="grid grid-cols-2 gap-3 px-5">
        {resources.map((r) => {
          const Icon = resIcon[r.kind];
          return (
            <Card key={r.id} onClick={() => open(r)} className="p-4">
              <div className="relative mx-auto w-fit text-primary">
                <Ring pct={r.remaining / r.total} size={84} />
                <Icon className="absolute inset-0 m-auto size-6" />
              </div>
              <p className="num mt-3 text-center text-2xl font-bold">{r.remaining}<span className="ml-0.5 text-xs text-muted-foreground">{r.unit}</span></p>
              <p className="text-center text-xs text-muted-foreground">of {r.total} {r.unit} · {r.kind}</p>
              <p className={cn("mt-2 text-center text-[11px] font-bold", expTone(r.expiresInDays))}>Expires in {r.expiresInDays} {r.expiresInDays === 1 ? "day" : "days"}</p>
            </Card>
          );
        })}
      </div>
      <p className="mx-5 mt-5 flex items-start gap-2 rounded-2xl bg-secondary p-3.5 text-xs text-secondary-foreground"><Info className="mt-0.5 size-4 shrink-0" /> Amounts show what Ethio Telecom last reported by SMS. Usage since then isn't tracked.</p>
    </div>
  );
}

function ResDetail({ res, onBack }: { res: Resource; onBack: () => void }) {
  const Icon = resIcon[res.kind];
  const history = [
    { t: res.observed, v: res.remaining },
    { t: "Yesterday, 19:12", v: +(res.remaining * 1.6).toFixed(1) },
    { t: "21 Nov, 08:40", v: +(res.remaining * 2.3).toFixed(1) },
    { t: "19 Nov, 12:00", v: res.total },
  ];
  return (
    <div className="pb-8">
      <Header title={res.kind} sub={res.name} onBack={onBack} />
      <Card className="mx-5 flex flex-col items-center py-6">
        <div className="relative text-primary"><Ring pct={res.remaining / res.total} size={160} /><div className="absolute inset-0 flex flex-col items-center justify-center"><Icon className="mb-1 size-5" /><p className="num text-4xl font-bold text-foreground">{res.remaining}</p><p className="text-xs text-muted-foreground">{res.unit} left of {res.total}</p></div></div>
        <div className="mt-5 grid w-full grid-cols-2 divide-x divide-border text-center">
          <div><p className="text-[11px] text-muted-foreground">Expires</p><p className={cn("text-sm font-bold", expTone(res.expiresInDays))}>{res.expiry}</p></div>
          <div><p className="text-[11px] text-muted-foreground">Last reported</p><p className="text-sm font-bold">{res.observed}</p></div>
        </div>
      </Card>
      <SectionTitle>Reported history</SectionTitle>
      <Card className="mx-5 py-2">
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <span className={cn("size-2.5 rounded-full", i === 0 ? "bg-primary" : "bg-border")} />
            <span className="flex-1 text-sm text-muted-foreground">{h.t}</span>
            <span className="num text-sm font-semibold">{h.v} {res.unit}</span>
          </div>
        ))}
      </Card>
      <button className="mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-semibold"><FileText className="size-4 text-primary" /> View source SMS</button>
    </div>
  );
}

/* ---------- Alerts ---------- */
function Alerts() {
  const [items, setItems] = useState(alertsData);
  const [f, setF] = useState<"All" | "Unread">("All");
  const sev = { critical: { icon: ShieldAlert, cls: "bg-danger-soft text-destructive", label: "Critical" }, warning: { icon: AlertTriangle, cls: "bg-warning-soft text-warning", label: "Warning" }, info: { icon: Info, cls: "bg-success-soft text-success", label: "Info" } } as const;
  const list = items.filter((a) => f === "All" || !a.read);
  return (
    <div className="pb-6">
      <Header title="Alerts" right={<button onClick={() => setItems(items.map((a) => ({ ...a, read: true })))} className="text-xs font-semibold text-primary">Mark all read</button>} />
      <div className="mb-3 flex gap-2 px-5">
        {(["All", "Unread"] as const).map((x) => <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold", f === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>{x}{x === "Unread" && ` · ${items.filter((a) => !a.read).length}`}</button>)}
      </div>
      <div className="space-y-2.5 px-5">
        {list.map((a) => {
          const s = sev[a.severity]; const Icon = s.icon;
          return (
            <Card key={a.id} onClick={() => setItems(items.map((x) => (x.id === a.id ? { ...x, read: !x.read } : x)))} className={cn("flex gap-3", a.read && "opacity-70")}>
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", s.cls)}><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{a.title}</p>{!a.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}</div>
                <p className="text-xs text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label} · {a.time}</p>
              </div>
            </Card>
          );
        })}
        {!list.length && <p className="py-10 text-center text-sm text-muted-foreground">You're all caught up</p>}
      </div>
    </div>
  );
}

/* ---------- Messages ---------- */
function Messages({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState("All");
  const list = messages.filter((m) => f === "All" || (f === "Unrecognized" ? m.status === "Unrecognized" : m.status !== "Unrecognized"));
  const tone: Record<string, string> = { Parsed: "bg-success-soft text-success", Partial: "bg-warning-soft text-warning", Unrecognized: "bg-muted text-muted-foreground" };
  return (
    <div className="pb-6">
      <Header title="Messages" sub="Original SMS archive" onBack={onBack} />
      <div className="mb-3 flex gap-2 px-5">{["All", "Recognized", "Unrecognized"].map((x) => <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold", f === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>{x}</button>)}</div>
      <Card className="mx-5 divide-y divide-border overflow-hidden p-0">
        {list.map((m) => (
          <div key={m.id} className="p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-bold">{m.sender} <span className="font-normal text-muted-foreground">· {m.provider}</span></p><span className="text-xs text-muted-foreground">{m.time}</span></div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.preview}</p>
            <div className="mt-2 flex gap-1.5"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", tone[m.status])}>{m.status}</span><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">{m.category}</span></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------- Import ---------- */
function Import({ onBack }: { onBack: () => void }) {
  const sample = transactions[0]!.sms;
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(false);
  return (
    <div className="pb-8">
      <Header title="Paste SMS" sub="Manual import" onBack={onBack} />
      <div className="px-5">
        <textarea value={text} onChange={(e) => { setText(e.target.value); setParsed(false); }} rows={6} placeholder="Paste a CBE, Telebirr or Ethio Telecom message here…" className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none focus:border-primary" />
        <div className="mt-2 flex gap-2">
          <button onClick={() => { setText(sample); setParsed(false); }} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Use example</button>
        </div>
        <button disabled={!text} onClick={() => setParsed(true)} className="mt-4 h-14 w-full rounded-2xl bg-primary font-bold text-primary-foreground disabled:opacity-40">Read message</button>
        {parsed && (
          <Card className="mt-5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-success"><CheckCircle2 className="size-3.5" /> Recognized · Telebirr transfer</p>
            <div className="divide-y divide-border">
              <Row label="Type" value="Received" />
              <Row label="Amount" value="4,500.00 ETB" strong />
              <Row label="From" value="Abebe Kebede" />
              <Row label="Reference" value="CKN7H2LQ9P" />
              <Row label="Balance" value="18,230.50 ETB" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={onBack} className="h-11 rounded-xl border border-border text-sm font-semibold">Discard</button>
              <button onClick={onBack} className="h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground">Save</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function Toggle({ on: init = false }: { on?: boolean }) {
  const [on, setOn] = useState(init);
  return <button onClick={() => setOn(!on)} role="switch" aria-checked={on} className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-border")}><span className={cn("absolute top-0.5 size-5 rounded-full bg-card shadow transition-all", on ? "left-[22px]" : "left-0.5")} /></button>;
}
function SettingsScreen({ go, reset }: { go: (v: View) => void; reset: () => void }) {
  const groups: { title: string; items: { icon: typeof Home; label: string; sub?: string; right?: ReactNode; onClick?: () => void; danger?: boolean }[] }[] = [
    { title: "Privacy & security", items: [
      { icon: Lock, label: "App lock", sub: "Fingerprint or PIN", right: <Toggle on /> },
      { icon: EyeOff, label: "Hide amounts on lock screen", right: <Toggle on /> },
    ] },
    { title: "Notifications", items: [
      { icon: Bell, label: "Transaction alerts", right: <Toggle on /> },
      { icon: Wifi, label: "Package expiry reminders", right: <Toggle on /> },
      { icon: Moon, label: "Quiet hours", sub: "22:00 – 07:00", right: <ChevronRight className="size-4 text-muted-foreground" /> },
    ] },
    { title: "Messages", items: [
      { icon: Building2, label: "Providers", sub: "CBE, Telebirr, Ethio Telecom", right: <ChevronRight className="size-4 text-muted-foreground" /> },
      { icon: Smartphone, label: "Import method", sub: "Paste & share", right: <ChevronRight className="size-4 text-muted-foreground" /> },
      { icon: MessagesSquare, label: "Original messages", onClick: () => go({ k: "messages" }), right: <ChevronRight className="size-4 text-muted-foreground" /> },
    ] },
    { title: "Data", items: [
      { icon: Trash2, label: "Clear all local data", danger: true, onClick: reset },
    ] },
  ];
  return (
    <div className="pb-6">
      <Header title="Settings" />
      <div className="mx-5 flex items-center gap-3 rounded-2xl bg-success-soft p-4">
        <ShieldCheck className="size-6 text-success" />
        <div className="text-xs"><p className="font-bold">All data stays on this phone</p><p className="text-muted-foreground">No account · No cloud sync</p></div>
      </div>
      {groups.map((g) => (
        <div key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <Card className="mx-5 divide-y divide-border p-0">
            {g.items.map((it) => { const Icon = it.icon; return (
              <div key={it.label} onClick={it.onClick} className={cn("flex items-center gap-3 px-4 py-3.5", it.onClick && "cursor-pointer")}>
                <Icon className={cn("size-5", it.danger ? "text-destructive" : "text-primary")} />
                <div className="flex-1"><p className={cn("text-sm font-semibold", it.danger && "text-destructive")}>{it.label}</p>{it.sub && <p className="text-xs text-muted-foreground">{it.sub}</p>}</div>
                {it.right}
              </div>
            ); })}
          </Card>
        </div>
      ))}
      <p className="mt-6 text-center text-xs text-muted-foreground">SMS Insight v1.0 · Privacy policy · Support</p>
    </div>
  );
}
