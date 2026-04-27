import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { BsMoonStars, BsSun } from 'react-icons/bs';

const ToggleButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--header-link-active-border);
  background: var(--header-link-hover-bg);
  color: var(--header-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: var(--header-link-active-bg);
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ModeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <ToggleButton
      type='button'
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {!mounted ? <BsMoonStars /> : isDark ? <BsSun /> : <BsMoonStars />}
    </ToggleButton>
  );
};

export default ModeToggle;

