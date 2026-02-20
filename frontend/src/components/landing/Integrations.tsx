const protocols = [
  {
    name: "Jito",
    color: "hsl(155 90% 51%)",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
        <path d="M16 2L4 9v14l12 7 12-7V9L16 2zm0 3.5L25 11v10l-9 5.25L7 21V11l9-5.5z" />
        <path d="M16 10l-5 3v6l5 3 5-3v-6l-5-3z" />
      </svg>
    ),
  },
  {
    name: "Marinade",
    color: "hsl(170 60% 45%)",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
        <circle cx="16" cy="16" r="12" fillOpacity="0.3" />
        <path d="M10 20l6-12 6 12H10zm6-7.5L13 18h6l-3-5.5z" />
      </svg>
    ),
  },
  {
    name: "Sanctum",
    color: "hsl(200 80% 60%)",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
        <path d="M16 4l-2 8h-8l6.5 4.7L10 25l6-4.4 6 4.4-2.5-8.3L26 12h-8L16 4z" />
      </svg>
    ),
  },
  {
    name: "marginfi",
    color: "hsl(264 100% 64%)",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
        <rect x="6" y="14" width="4" height="12" rx="1" />
        <rect x="14" y="8" width="4" height="18" rx="1" />
        <rect x="22" y="6" width="4" height="20" rx="1" />
      </svg>
    ),
  },
  {
    name: "Kamino",
    color: "hsl(210 70% 50%)",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
        <path d="M16 4L6 10v12l10 6 10-6V10L16 4zm0 4l6 3.5v7L16 22l-6-3.5v-7L16 8z" />
      </svg>
    ),
  },
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
          {protocols.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-6 py-4 hover:border-primary/20 transition-colors"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${p.color}`, color: "hsl(222 47% 6%)" }}
              >
                {p.logo}
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
