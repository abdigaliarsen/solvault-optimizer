import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Built on Solana
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Maximize Your SOL Yield.
            <br />
            <span className="gradient-text">Automatically.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            VaultSol aggregates staking and lending yields across Solana DeFi — Jito, Marinade, Sanctum, and more — into a single optimized vault. Deposit SOL, earn more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-green"
            >
              Launch App
            </Link>
            <a
              href="https://docs.example.com"
              className="rounded-lg border border-border px-8 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Read Docs
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
