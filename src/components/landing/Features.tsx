import { RefreshCw, Shield, Layers, Activity, Coins } from "lucide-react";

const features = [
  { icon: RefreshCw, title: "Auto-Compounding", desc: "Yields are automatically reinvested to maximize returns without manual intervention." },
  { icon: Shield, title: "Risk-Adjusted Allocation", desc: "Smart risk scoring ensures your funds are distributed across vetted, audited protocols." },
  { icon: Layers, title: "Non-Custodial", desc: "Fully on-chain Anchor program. Your keys, your funds — always." },
  { icon: Activity, title: "Real-Time Rebalancing", desc: "Continuous monitoring and rebalancing to capture the best rates across DeFi." },
  { icon: Coins, title: "Single-Token Deposit", desc: "Deposit SOL and let VaultSol handle the rest. No wrapping, no swapping needed." },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for DeFi Natives</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Every feature designed around security, performance, and simplicity.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-xl p-6 hover:border-primary/30 transition-colors">
              <f.icon className="h-6 w-6 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
