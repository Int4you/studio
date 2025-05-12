export default function LandingPageFooter() {
  return (
    <footer className="py-8 border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PromptForge. All rights reserved.
        </p>
        {/* Add any other footer links or info here if needed */}
      </div>
    </footer>
  );
}
