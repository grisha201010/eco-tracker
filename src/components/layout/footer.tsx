import Link from 'next/link';
import { BarChart2, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row md:py-8 ml-8">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          <span className="text-lg font-bold">Эко Трекер</span>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            О проекте
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Условия использования
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Эко Трекер
          </span>
        </div>
      </div>
    </footer>
  );
}
