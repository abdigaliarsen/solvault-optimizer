import { ArrowDown, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ArrowDown,
    num: "01",
    title: "Deposit SOL",
    description: "Connect your wallet and deposit any amount of SOL into the VaultSol smart contract.",
  },
  {
    icon: Zap,
    num: "02",
    title: "Smart Routing",
    description: "Our on-chain program automatically allocates your deposit across the highest-yielding protocols.",
  },
  {
    icon: TrendingUp,
    num: "03",
    title: "Earn Optimized Yield",
    description: "Yield is auto-compounded and rebalanced in real-time. Withdraw anytime.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 relative">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-3xl font-bold sm:text-4xl max-w-md">Three steps to optimized yield.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden max-w-5xl">
          {steps.map((step) => (
            <div key={step.title} className="bg-background p-8 lg:p-10 group hover:bg-muted/20 transition-colors">
              <span className="text-3xl font-bold text-border/50 group-hover:text-primary/30 transition-colors mb-6 block">{step.num}</span>
              <step.icon className="h-6 w-6 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
