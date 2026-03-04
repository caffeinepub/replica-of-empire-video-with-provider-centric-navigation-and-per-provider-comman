import { Link } from '@tanstack/react-router';

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <p>licensed and created by Seale's Empire</p>
          <nav className="flex gap-4">
            <Link 
              to="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
