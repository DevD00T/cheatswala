import { useRouter } from 'next/router';

const { createContext, useState, useEffect } = require('react');

export const NavActiveContext = createContext(false);

export const NavActiveContextProvider = ({ children }) => {
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
  }, []);
  return (
    <NavActiveContext.Provider value={{ mobileNavActive, setMobileNavActive }}>
      {children}
    </NavActiveContext.Provider>
  );
};
