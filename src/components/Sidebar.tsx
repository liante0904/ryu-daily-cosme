interface SidebarProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export function Sidebar({ isOpen, toggleMenu }: SidebarProps) {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="nav-mobile">
          <a href="#" className="active" onClick={toggleMenu}>Mafia (Naver)</a>
          <a href="#" onClick={toggleMenu}>Routine 2</a>
          <a href="#" onClick={toggleMenu}>Routine 3</a>
        </nav>
      </div>
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
}
