import { RefreshCw, Shield, Layers, Activity, Coins } from "lucide-react";

const features = [
  { icon: RefreshCw, title: "Auto-Compounding", desc: "Yields are automatically reinvested to maximize returns without manual intervention." },
  { icon: Shield, title: "Risk-Adjusted Allocation", desc: "Smart risk scoring distributes funds across vetted, audited protocols." },
  { icon: Layers, title: "Non-Custodial", desc: "Fully on-chain Anchor program. Your keys, your funds — always." },
  { icon: Activity, title: "Real-Time Rebalancing", desc: "Continuous monitoring captures the best rates across DeFi." },
  { icon: Coins, title: "Single-Token Deposit", desc: "Deposit SOL and let VaultSol handle the rest. No wrapping needed." },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-3xl font-bold sm:text-4xl max-w-md">Built for DeFi natives.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border/40 bg-card/30 p-6 hover:border-primary/20 hover:bg-card/50 transition-all">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
