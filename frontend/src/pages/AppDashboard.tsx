import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  ExternalLink,
  ChevronDown,
  Activity,
  Lock,
  Info,
  ArrowLeft,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────

const ALLOCATIONS = [
  { protocol: "Jito", pct: 35, color: "hsl(155, 90%, 51%)", abbr: "JTO", apy: "7.12%" },
  { protocol: "Marinade", pct: 25, color: "hsl(30, 90%, 55%)", abbr: "MND", apy: "6.50%" },
  { protocol: "Sanctum", pct: 20, color: "hsl(200, 80%, 60%)", abbr: "SCT", apy: "6.88%" },
  { protocol: "marginfi", pct: 12, color: "hsl(264, 100%, 64%)", abbr: "MFI", apy: "5.41%" },
  { protocol: "Kamino", pct: 8, color: "hsl(340, 80%, 60%)", abbr: "KMN", apy: "4.95%" },
];

const TRANSACTIONS = [
  { type: "deposit" as const, amount: 100.0, date: "2026-02-18T14:23:00Z", sig: "5xK9...mR7q" },
  { type: "rebalance" as const, amount: 0, date: "2026-02-17T09:00:00Z", sig: "3bNf...pW2a" },
  { type: "yield" as const, amount: 0.23, date: "2026-02-16T09:00:00Z", sig: "8cYt...kL5d" },
  { type: "deposit" as const, amount: 50.0, date: "2026-02-14T11:05:00Z", sig: "2dRm...vN4e" },
  { type: "yield" as const, amount: 0.11, date: "2026-02-12T09:00:00Z", sig: "9fBx...jQ8h" },
  { type: "deposit" as const, amount: 25.0, date: "2026-02-10T16:44:00Z", sig: "7gWn...cT3s" },
];

const TX_META = {
  deposit: { label: "Deposit", icon: ArrowDownToLine, color: "text-primary" },
  withdraw: { label: "Withdraw", icon: ArrowUpFromLine, color: "text-orange-400" },
  rebalance: { label: "Rebalance", icon: Activity, color: "text-[hsl(264,100%,64%)]" },
  yield: { label: "Yield", icon: TrendingUp, color: "text-primary" },
};

// ─── Helpers ─────────────────────────────────────────────────

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Donut Chart ─────────────────────────────────────────────

function DonutChart({ size = 180, stroke = 18 }: { size?: number; stroke?: number }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    let offset = 0;
    return ALLOCATIONS.map((a, i) => {
      const dash = (a.pct / 100) * circumference;
      const seg = { ...a, dash, offset, index: i };
      offset += dash;
      return seg;
    });
  }, [circumference]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(222 30% 14%)"
          strokeWidth={stroke}
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.protocol}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={hovered === seg.index ? stroke + 4 : stroke}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
            className="transition-all duration-300"
            style={{ filter: hovered === seg.index ? `drop-shadow(0 0 8px ${seg.color})` : undefined }}
            onMouseEnter={() => setHovered(seg.index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {hovered !== null ? (
            <motion.div
              key={ALLOCATIONS[hovered].protocol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="text-center"
            >
              <p className="text-2xl font-bold" style={{ color: ALLOCATIONS[hovered].color }}>
                {ALLOCATIONS[hovered].pct}%
              </p>
              <p className="text-xs text-muted-foreground">{ALLOCATIONS[hovered].protocol}</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-[11px] text-muted-foreground">Protocols</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────

const AppDashboard = () => {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [showAllTx, setShowAllTx] = useState(false);

  const visibleTx = showAllTx ? TRANSACTIONS : TRANSACTIONS.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient glow — matches landing page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/[0.03] blur-[130px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-7xl">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                <span className="text-primary-foreground font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-lg tracking-tight">VaultSol</span>
            </Link>
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground">Devnet</span>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <motion.div variants={stagger} initial="hidden" animate="show">
          {/* ── Vault Headline ── */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Vault Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Auto-optimized yield across 5 Solana protocols
            </p>
          </motion.div>

          {/* ── Metrics Row ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Value Locked", value: "$12.4M", sub: "92,847 SOL", icon: Lock },
              { label: "Blended APY", value: "8.72%", sub: "+0.14% this week", icon: TrendingUp, accent: true },
              { label: "Your Position", value: "150.00", unit: "SOL", sub: "$22,350 USD", icon: Wallet },
              { label: "Earned Yield", value: "+0.34", unit: "SOL", sub: "$50.49 USD", icon: Zap, accent: true },
            ].map((m) => (
              <div
                key={m.label}
                className="group relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 hover:border-border/70 transition-colors overflow-hidden"
              >
                {m.accent && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <m.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
                <p className={`text-2xl font-bold tracking-tight ${m.accent ? "text-primary" : "text-foreground"}`}>
                  {m.value}
                  {m.unit && <span className="text-sm text-muted-foreground font-normal ml-1">{m.unit}</span>}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">{m.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* ── Left Column ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Deposit / Withdraw Panel */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex border-b border-border/40">
                  {(["deposit", "withdraw"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                        tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                      }`}
                    >
                      {t === "deposit" ? (
                        <ArrowDownToLine className="h-4 w-4" />
                      ) : (
                        <ArrowUpFromLine className="h-4 w-4" />
                      )}
                      {t === "deposit" ? "Deposit" : "Withdraw"}
                      {tab === t && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-muted-foreground">
                          {tab === "deposit" ? "You deposit" : "Shares to burn"}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          Balance: <span className="text-foreground font-medium">432.50 SOL</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-border/60 bg-background/60 pl-4 pr-20 py-4 text-xl font-semibold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            onClick={() => setAmount(tab === "deposit" ? "432.50" : "150.00")}
                            className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                          >
                            MAX
                          </button>
                          <span className="text-sm font-medium text-muted-foreground">SOL</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2">
                      {(tab === "deposit" ? ["1", "10", "50", "100"] : ["25%", "50%", "75%", "100%"]).map(
                        (v) => (
                          <button
                            key={v}
                            onClick={() => {
                              if (tab === "deposit") {
                                setAmount(v);
                              } else {
                                const pct = parseInt(v) / 100;
                                setAmount((150 * pct).toFixed(2));
                              }
                            }}
                            className="flex-1 rounded-lg border border-border/40 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors"
                          >
                            {tab === "deposit" ? `${v} SOL` : v}
                          </button>
                        )
                      )}
                    </div>

                    {/* Info row */}
                    {amount && Number(amount) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-lg bg-muted/30 border border-border/30 p-3 space-y-2"
                      >
                        {tab === "deposit" ? (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">You receive</span>
                              <span className="font-medium">
                                {(Number(amount) * 1_000_000 / 1_000_000_000 * 1_000_000).toLocaleString()} shares
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Performance fee</span>
                              <span className="font-medium">5% on yield only</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">You receive</span>
                              <span className="font-medium">{Number(amount).toFixed(2)} SOL</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Yield earned</span>
                              <span className="font-medium text-primary">
                                +{(Number(amount) * 0.0023).toFixed(4)} SOL
                              </span>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {/* CTA */}
                    <button
                      className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
                        amount && Number(amount) > 0
                          ? "bg-primary text-primary-foreground glow-green hover:brightness-110"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                      disabled={!amount || Number(amount) <= 0}
                    >
                      {tab === "deposit" ? "Deposit SOL" : "Withdraw SOL"}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Transaction History */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                  <h3 className="text-sm font-semibold">Recent Activity</h3>
                  <span className="text-[11px] text-muted-foreground">{TRANSACTIONS.length} transactions</span>
                </div>
                <div className="divide-y divide-border/20">
                  <AnimatePresence initial={false}>
                    {visibleTx.map((tx, i) => {
                      const meta = TX_META[tx.type];
                      const Icon = meta.icon;
                      return (
                        <motion.div
                          key={`${tx.sig}-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                              <Icon className={`h-4 w-4 ${meta.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{meta.label}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{tx.sig}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${tx.type === "yield" ? "text-primary" : ""}`}>
                              {tx.amount > 0
                                ? `${tx.type === "yield" ? "+" : ""}${tx.amount.toFixed(2)} SOL`
                                : "—"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{relativeDate(tx.date)}</p>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors ml-2" />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {TRANSACTIONS.length > 4 && (
                  <button
                    onClick={() => setShowAllTx(!showAllTx)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-foreground border-t border-border/20 transition-colors"
                  >
                    {showAllTx ? "Show less" : `Show all ${TRANSACTIONS.length}`}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${showAllTx ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </motion.div>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Allocation Breakdown */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
              >
                <h3 className="text-sm font-semibold mb-5">Allocation Breakdown</h3>

                <div className="flex justify-center mb-6">
                  <DonutChart />
                </div>

                <div className="space-y-3">
                  {ALLOCATIONS.map((a) => (
                    <div
                      key={a.protocol}
                      className="flex items-center gap-3 rounded-lg hover:bg-muted/20 p-2 -mx-2 transition-colors group"
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          backgroundColor: `${a.color}15`,
                          color: a.color,
                        }}
                      >
                        {a.abbr}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{a.protocol}</span>
                          <span className="text-sm font-semibold" style={{ color: a.color }}>
                            {a.pct}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${a.pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: a.color }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0 w-12 text-right">
                        {a.apy}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Vault Info */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6"
              >
                <h3 className="text-sm font-semibold mb-4">Vault Details</h3>
                <div className="space-y-3">
                  {[
                    { label: "Performance Fee", value: "5%", sub: "on yield only", icon: Info },
                    { label: "Deposit Cap", value: "1,000 SOL", sub: "per vault", icon: Lock },
                    { label: "Status", value: "Active", sub: "accepting deposits", icon: Shield, isActive: true },
                    { label: "Last Rebalance", value: "17 Feb", sub: "09:00 UTC", icon: Clock },
                    { label: "Total Depositors", value: "3,241", sub: "unique wallets", icon: Wallet },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1.5 justify-end">
                          {item.isActive && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                            </span>
                          )}
                          {item.value}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Program link */}
                <a
                  href="https://explorer.solana.com/address/HjFqznCR9NYr3mxYYyhYqYLrm3xNiu71EAz5qHARjWrd?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border/40 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors"
                >
                  View on Solana Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AppDashboard;
