import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

const allocations = [
  { protocol: "Jito", pct: 35, color: "hsl(155, 90%, 51%)" },
  { protocol: "Marinade", pct: 25, color: "hsl(30, 90%, 55%)" },
  { protocol: "Sanctum", pct: 20, color: "hsl(200, 80%, 60%)" },
  { protocol: "marginfi", pct: 12, color: "hsl(264, 100%, 64%)" },
  { protocol: "Kamino", pct: 8, color: "hsl(340, 80%, 60%)" },
];

const transactions = [
  { type: "Deposit", amount: "100.00 SOL", date: "2026-02-18", status: "Confirmed" },
  { type: "Rebalance", amount: "—", date: "2026-02-17", status: "Confirmed" },
  { type: "Yield", amount: "+0.23 SOL", date: "2026-02-16", status: "Confirmed" },
  { type: "Deposit", amount: "50.00 SOL", date: "2026-02-14", status: "Confirmed" },
  { type: "Yield", amount: "+0.11 SOL", date: "2026-02-12", status: "Confirmed" },
];

const AppDashboard = () => {
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border glass">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg">VaultSol</span>
          </Link>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Overview + Deposit */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Your Deposit</p>
                <p className="text-2xl font-bold">150.00 <span className="text-base text-muted-foreground">SOL</span></p>
              </div>
              <div className="glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Current APY</p>
                <p className="text-2xl font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" /> 8.72%
                </p>
              </div>
              <div className="glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Earned Yield</p>
                <p className="text-2xl font-bold text-primary">+0.34 <span className="text-base text-muted-foreground">SOL</span></p>
              </div>
            </div>

            {/* Deposit / Withdraw */}
            <div className="glass rounded-xl p-6">
              <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTab("deposit")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    tab === "deposit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDown className="h-4 w-4" /> Deposit
                </button>
                <button
                  onClick={() => setTab("withdraw")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    tab === "withdraw" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUp className="h-4 w-4" /> Withdraw
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount (SOL)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button className="w-full rounded-lg bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-green">
                  {tab === "deposit" ? "Deposit SOL" : "Withdraw SOL"}
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-3 text-left font-medium">Type</th>
                      <th className="pb-3 text-left font-medium">Amount</th>
                      <th className="pb-3 text-left font-medium">Date</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3">{tx.type}</td>
                        <td className="py-3 font-medium">{tx.amount}</td>
                        <td className="py-3 text-muted-foreground">{tx.date}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Allocation */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-6">Allocation Breakdown</h3>
              <div className="space-y-4">
                {allocations.map((a) => (
                  <div key={a.protocol}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: a.color }} />
                        <span>{a.protocol}</span>
                      </div>
                      <span className="font-medium">{a.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini pie visual */}
              <div className="mt-8 flex justify-center">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {allocations.reduce<{ elements: JSX.Element[]; offset: number }>((acc, a) => {
                      const circumference = Math.PI * 80;
                      const dash = (a.pct / 100) * circumference;
                      acc.elements.push(
                        <circle
                          key={a.protocol}
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={a.color}
                          strokeWidth="12"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={-acc.offset}
                        />
                      );
                      acc.offset += dash;
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold">5</p>
                      <p className="text-xs text-muted-foreground">Protocols</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
