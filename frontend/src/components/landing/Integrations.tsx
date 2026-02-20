const protocols = [
  { name: "Jito", letter: "J", color: "hsl(155 90% 51%)" },
  { name: "Marinade", letter: "M", color: "hsl(170 60% 45%)" },
  { name: "Sanctum", letter: "S", color: "hsl(200 80% 60%)" },
  { name: "marginfi", letter: "m", color: "hsl(264 100% 64%)" },
  { name: "Kamino", letter: "K", color: "hsl(210 70% 50%)" },
];

const Integrations = () => {
  return (
    <section id="integrations" className="py-24 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Integrations</p>
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Routing across the best</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            VaultSol dynamically allocates across Solana's leading staking and lending protocols.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
          {protocols.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-6 py-4 hover:border-primary/20 transition-colors"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: p.color, color: "hsl(222 47% 6%)" }}
              >
                {p.letter}
              </div>
              <span className="font-semibold text-sm">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
