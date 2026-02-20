import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Jito-style stats ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto flex items-center justify-center gap-6 px-6 py-1.5 text-xs">
          <span className="text-muted-foreground">TVL <span className="text-primary font-semibold ml-1">$12.4M</span></span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">APY <span className="text-primary font-semibold ml-1">8.72%</span></span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground hidden sm:inline">Users <span className="text-foreground font-semibold ml-1">3,241</span></span>
          <span className="text-border hidden sm:inline">|</span>
          <span className="text-muted-foreground hidden sm:inline">Protocols <span className="text-foreground font-semibold ml-1">5</span></span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="fixed top-[33px] left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">VaultSol</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
            <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://github.com/abdigaliarsen/solvault-optimizer" target="_blank" rel="noopener noreferrer" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
            <Link
              to="/app"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
            >
              Launch App
            </Link>
            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#security" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Security</a>
            <a href="#integrations" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Integrations</a>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
