import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Built on Solana
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Automated SOL staking.
              <br />
              <span className="gradient-text italic">Earn More, Stay in Control.</span>
            </h1>

            <p className="mb-8 max-w-lg text-base text-muted-foreground leading-relaxed">
              Stake via VaultSol's non-custodial vault and unlock top-tier APY across Jito, Marinade, Sanctum, and more. One deposit, optimized yield.
            </p>

            {/* Inline stats like Marinade */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
              <div>
                <p className="text-2xl font-bold text-primary">8.72%</p>
                <p className="text-xs text-muted-foreground mt-0.5">APY</p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div>
                <p className="text-2xl font-bold text-foreground">$12.4M</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Value Locked</p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div>
                <p className="text-2xl font-bold text-foreground">3,241</p>
                <p className="text-xs text-muted-foreground mt-0.5">Users</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
              >
                Stake Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/abdigaliarsen/solvault-optimizer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-7 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>

          {/* Right — Interactive yield widget (Marinade-style) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Amount to stake</p>
                <p className="text-4xl font-bold text-foreground">1,000 <span className="text-lg text-muted-foreground font-normal">SOL</span></p>
              </div>

              {/* Slider visual */}
              <div className="relative mb-8">
                <div className="h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary w-2/5" />
                </div>
                <div className="absolute top-1/2 left-[40%] -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-2 border-background shadow-lg" />
              </div>

              {/* Protocol comparison */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">V</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">VaultSol</p>
                      <p className="text-xs text-muted-foreground">Auto-optimized</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">8.72% APY</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">J</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Jito (JitoSOL)</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">5.92% APY</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">M</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Marinade</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">6.50% APY</p>
                </div>
              </div>

              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-sm text-muted-foreground">You would earn extra</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  <span className="text-primary">+22.0 SOL</span> annually
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partner logos — Jito style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-20 pt-10 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground text-center mb-5">Routing yield across leading Solana protocols</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {["Jito", "Marinade", "Sanctum", "marginfi", "Kamino"].map((name) => (
              <span key={name} className="rounded-full border border-border/50 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">{name}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
