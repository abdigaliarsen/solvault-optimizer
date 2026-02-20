import { ShieldCheck, Code, FileCheck, Eye } from "lucide-react";

const Security = () => {
  return (
    <section id="security" className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-10 sm:p-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              <ShieldCheck className="h-3.5 w-3.5" /> Security First
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">Built for Safety</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Security is not an afterthought — it's the foundation of VaultSol.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <Code className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Open Source</h3>
              <p className="text-sm text-muted-foreground">Anchor programs fully open source and verifiable on-chain.</p>
            </div>
            <div className="text-center">
              <FileCheck className="h-8 w-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Professional Audit</h3>
              <p className="text-sm text-muted-foreground">Undergoing audit through the Solana Audit Subsidy Program.</p>
            </div>
            <div className="text-center">
              <Eye className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Formal Verification</h3>
              <p className="text-sm text-muted-foreground">Formal verification of critical program logic planned for v2.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
