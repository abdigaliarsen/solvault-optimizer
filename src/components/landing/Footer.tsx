import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">V</span>
            </div>
            <span className="font-bold text-foreground">VaultSol</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://twitter.com" className="hover:text-foreground transition-colors">X / Twitter</a>
            <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://docs.example.com" className="hover:text-foreground transition-colors">Docs</a>
            <a href="https://discord.com" className="hover:text-foreground transition-colors">Discord</a>
          </div>

          <p className="text-xs text-muted-foreground">© 2026 VaultSol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
