const protocols = [
  { name: "Jito", color: "hsl(155, 90%, 51%)" },
  { name: "Marinade", color: "hsl(30, 90%, 55%)" },
  { name: "Sanctum", color: "hsl(200, 80%, 60%)" },
  { name: "marginfi", color: "hsl(264, 100%, 64%)" },
  { name: "Kamino", color: "hsl(340, 80%, 60%)" },
];

const Integrations = () => {
  return (
    <section id="integrations" className="py-24 bg-muted/20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">Protocol Integrations</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          VaultSol routes across the leading Solana staking and lending protocols.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {protocols.map((p) => (
            <div
              key={p.name}
              className="glass rounded-xl px-8 py-5 flex items-center gap-3 hover:border-primary/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: p.color, color: "#000" }}>
                {p.name[0]}
              </div>
              <span className="font-semibold">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
