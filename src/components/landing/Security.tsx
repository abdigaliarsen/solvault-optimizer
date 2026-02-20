import { ShieldCheck, Code, FileCheck, Eye } from "lucide-react";

const items = [
  {
    icon: Code,
    title: "Open Source",
    desc: "Anchor programs fully open source and verifiable on-chain.",
    accent: "primary" as const,
  },
  {
    icon: FileCheck,
    title: "Professional Audit",
    desc: "Undergoing audit through the Solana Audit Subsidy Program.",
    accent: "secondary" as const,
  },
  {
    icon: Eye,
    title: "Formal Verification",
    desc: "Formal verification of critical program logic planned for v2.",
    accent: "primary" as const,
  },
];

const Security = () => {
  return (
    <section id="security" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border/40 bg-card/30 overflow-hidden">
          <div className="p-10 sm:p-14">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">Security</span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl mb-3">Built for Safety</h2>
            <p className="text-muted-foreground max-w-lg mb-12">
              Security is the foundation of VaultSol. Every line of code is designed with safety as the primary constraint.
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              {items.map((item) => (
                <div key={item.title}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${item.accent === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                    <item.icon className={`h-5 w-5 ${item.accent === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <h3 className="font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
