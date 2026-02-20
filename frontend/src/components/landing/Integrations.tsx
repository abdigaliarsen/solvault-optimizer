import { PROTOCOL_ICONS } from "../icons/ProtocolIcons";

const protocols = [
  { name: "Jito", color: "hsl(270 80% 65%)" },
  { name: "Marinade", color: "hsl(185 90% 55%)" },
  { name: "Sanctum", color: "hsl(215 85% 60%)" },
  { name: "marginfi", color: "hsl(300 70% 60%)" },
  { name: "Kamino", color: "hsl(40 85% 55%)" },
];

const Integrations = () => {
  return (
    <section id="integrations" className="py-16 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Integrations</p>
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Routing across the best</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            VaultSol dynamically allocates across Solana's leading staking and lending protocols.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {protocols.map((p) => {
            const Icon = PROTOCOL_ICONS[p.name];
            return (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-6 py-4 hover:border-primary/20 transition-colors"
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: p.color, color: "hsl(230 35% 7%)" }}
                >
                  {Icon && <Icon size={18} />}
                </div>
                <span className="font-semibold text-sm">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
