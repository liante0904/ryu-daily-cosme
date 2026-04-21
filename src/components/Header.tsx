import { Sun, Moon, Menu, X } from 'lucide-react';

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Header({ isMenuOpen, toggleMenu, isDarkMode, toggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger-button" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="logo">RYU_ROUTINE</div>
      </div>
      
      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
