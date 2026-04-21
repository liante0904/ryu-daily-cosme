import { useState, useEffect } from 'react';

export function useScrollAtTop(threshold = 10) {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // 다양한 브라우저 환경 대응을 위해 scrollTop까지 체크
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setIsAtTop(scrollTop < threshold);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 즉시 실행
    
    // 리사이즈나 다른 요인으로 스크롤이 바뀔 수 있으므로 주기적으로 체크하는 안전장치
    const interval = setInterval(handleScroll, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [threshold]);

  return isAtTop;
}
