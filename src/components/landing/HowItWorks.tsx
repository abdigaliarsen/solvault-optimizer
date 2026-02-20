import { ArrowDown, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ArrowDown,
    title: "Deposit SOL",
    description: "Connect your wallet and deposit any amount of SOL into the VaultSol smart contract.",
  },
  {
    icon: Zap,
    title: "Smart Routing",
    description: "Our on-chain program automatically allocates your deposit across the highest-yielding protocols.",
  },
  {
    icon: TrendingUp,
    title: "Earn Optimized Yield",
    description: "Yield is auto-compounded and rebalanced in real-time. Withdraw anytime.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Three simple steps to start earning optimized yield on your SOL.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="glass rounded-xl p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="mb-3 text-xs font-semibold text-muted-foreground">STEP {i + 1}</div>
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
