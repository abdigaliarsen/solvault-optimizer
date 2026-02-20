import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <span className="font-bold text-lg text-foreground">VaultSol</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
          <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="https://docs.example.com" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </a>
          <Link
            to="/app"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
