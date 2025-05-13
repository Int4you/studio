
import Link from 'next/link';
import { Twitter, Github, Linkedin, Cpu } from 'lucide-react';

export default function LandingPageFooter() {
  return (
    <footer className="py-12 md:py-16 border-t border-border/40 bg-background text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
                <Cpu className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
                <h3 className="text-xl font-semibold text-foreground">
                Prompt<span className="text-primary">Forge</span>
                </h3>
            </Link>
            <p className="text-sm max-w-md">
              Turn ideas into reality. Generate application concepts, detailed proposals, visual mockups, and AI developer prompts with the power of AI.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li> 
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#terms" className="hover:text-primary transition-colors">Terms of Service</Link></li> {/* Placeholder */}
              <li><Link href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li> {/* Placeholder */}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border/20 pt-8">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} PromptForge. All rights reserved.
          </p>
          <div className="flex space-x-5 mt-4 md:mt-0">
            <Link href="#twitter" className="hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#github" className="hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#linkedin" className="hover:text-primary transition-colors" aria-label="LinkedIn">
             <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
