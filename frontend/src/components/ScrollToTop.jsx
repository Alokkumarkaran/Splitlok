import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extracts pathname property (e.g., '/history', '/')
  const { pathname } = useLocation();

  // Automatically triggers whenever the pathname changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'smooth' if you want a sliding effect, but 'instant' feels more native for page loads
    });
  }, [pathname]);

  return null; // This component is invisible, it just runs logic!
};

export default ScrollToTop;