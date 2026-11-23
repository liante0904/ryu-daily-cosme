import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export function Sidebar({ isOpen, toggleMenu }: SidebarProps) {
  const [openCategory, setOpenCategory] = useState<'personal' | 'company' | null>('company');

  const toggleCategory = (category: 'personal' | 'company') => {
    setOpenCategory((current) => current === category ? null : category);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="nav-mobile" aria-label="카테고리">
          <section className="nav-category">
            <button
              className="nav-category-button"
              aria-expanded={openCategory === 'personal'}
              onClick={() => toggleCategory('personal')}
            >
              <span>개인</span><span className="nav-category-chevron" aria-hidden="true">{openCategory === 'personal' ? '⌄' : '›'}</span>
            </button>
            {openCategory === 'personal' && <div className="nav-category-empty">등록된 카테고리가 없습니다.</div>}
          </section>

          <section className="nav-category">
            <button
              className="nav-category-button"
              aria-expanded={openCategory === 'company'}
              onClick={() => toggleCategory('company')}
            >
              <span>회사</span><span className="nav-category-chevron" aria-hidden="true">{openCategory === 'company' ? '⌄' : '›'}</span>
            </button>
            {openCategory === 'company' && (
              <div className="nav-category-items">
                <a href="#mafia" className="active" onClick={toggleMenu}>Mafia (Naver)</a>
              </div>
            )}
          </section>
        </nav>
      </div>
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </>
  );
}
