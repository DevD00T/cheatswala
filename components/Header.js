import Link from 'next/link';
import styled, { css } from 'styled-components';
import Center from './Center';
import { useContext } from 'react';
import { CartContext } from './CartContext';
import BarsIcon from './icons/Bars';
import CloseIcon from './icons/Close';
import { NavActiveContext } from './NavActiveContext';
import SearchIcon from './icons/Search';
import { useRouter } from 'next/router';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import ModeToggle from './mode-toggle';

const StyledHeader = styled.header`
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
`;

const Logo = styled(Link)`
  color: var(--header-text);
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.03em;
  font-size: 1.05rem;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  align-items: center;
  gap: 16px;
`;

const StyledNav = styled.nav`
  ${(props) =>
    props.mobileNavActive
      ? css`
          display: flex;
        `
      : css`
          display: none;
        `}
  flex-direction: column;
  gap: 14px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 84px 24px 24px;
  background: var(--mobile-nav-bg);

  @media screen and (min-width: 768px) {
    display: flex;
    flex-direction: row;
    position: static;
    padding: 0;
    background: transparent;
    gap: 6px;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${(props) => (props.$active ? 'var(--header-text)' : 'var(--header-link)')};
  text-decoration: none;
  padding: 9px 12px;
  min-width: 30px;
  border-radius: 999px;
  font-size: 0.95rem;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: var(--header-text);
    background: var(--header-link-hover-bg);
  }

  ${(props) =>
    props.$active &&
    css`
      border-color: var(--header-link-active-border);
      background: var(--header-link-active-bg);
    `}

  svg {
    height: 20px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  width: 32px;
  height: 32px;
  border: 0;
  color: var(--header-text);
  cursor: pointer;
  position: relative;
  z-index: 3;
  padding: 0;

  @media screen and (min-width: 768px) {
    display: ${(props) => (props.reducesize ? 'flex' : 'none')};
  }

  svg {
    width: auto;
    height: 100%;
  }
`;

const SideIcons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AuthControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AuthActionButton = styled.button`
  border: 1px solid var(--auth-btn-border);
  background: var(--auth-btn-bg);
  color: var(--auth-btn-text);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
`;

const AuthPrimaryButton = styled(AuthActionButton)`
  border-color: var(--auth-primary-border);
  background: var(--auth-primary-bg);
  color: var(--auth-primary-text);
`;

const navItems = [
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/account', label: 'Account' },
  { href: '/track-order', label: 'Track' },
];

const Header = () => {
  const { cartProducts } = useContext(CartContext);
  const { mobileNavActive, setMobileNavActive } = useContext(NavActiveContext);
  const router = useRouter();

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`);

  return (
    <StyledHeader>
      <Center>
        <Wrapper>
          <Logo href='/' onClick={() => setMobileNavActive(false)}>
            Cheatswala
          </Logo>
          <StyledNav mobileNavActive={mobileNavActive}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                $active={isActive(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setMobileNavActive(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              href='/cart'
              $active={isActive('/cart')}
              aria-current={isActive('/cart') ? 'page' : undefined}
              onClick={() => setMobileNavActive(false)}
            >
              Cart ({cartProducts.length})
            </NavLink>
            <AuthControls>
              <SignedOut>
                <SignInButton mode='modal'>
                  <AuthActionButton type='button'>Sign In</AuthActionButton>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <AuthPrimaryButton type='button'>Sign Up</AuthPrimaryButton>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl='/' />
              </SignedIn>
            </AuthControls>
          </StyledNav>
          <SideIcons>
            <ModeToggle />
            <NavButton
              aria-label='Search products'
              reducesize
              onClick={() => router.push('/search')}
            >
              <SearchIcon />
            </NavButton>
            <NavButton
              aria-label='Open navigation menu'
              onClick={() => setMobileNavActive((prev) => !prev)}
            >
              {mobileNavActive ? <CloseIcon /> : <BarsIcon />}
            </NavButton>
          </SideIcons>
        </Wrapper>
      </Center>
    </StyledHeader>
  );
};

export default Header;
