import Link from 'next/link';
import styled, { css } from 'styled-components';
import Center from './Center';
import { useContext, useEffect, useRef } from 'react';
import { CartContext } from './CartContext';
import BarsIcon from './icons/Bars';
import CloseIcon from './icons/Close';
import { NavActiveContext } from './NavActiveContext';
import SearchIcon from './icons/Search';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

const StyledHeader = styled.header`
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding-top: env(safe-area-inset-top);
`;

const Logo = styled(Link)`
  color: var(--header-text);
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.03em;
  font-size: 1.05rem;
`;

const LogoInner = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 0.03em;
  position: relative;
  padding: 2px 0;
`;

const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
`;

const LogoLetter = styled.span`
  display: inline-block;
  will-change: transform, opacity;
`;

const LogoUnderline = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 999px;
  transform-origin: left center;
  transform: scaleX(0);
  opacity: 0;
  background: linear-gradient(
    90deg,
    rgba(23, 161, 111, 0.95),
    rgba(59, 130, 246, 0.9)
  );
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
    props.$mobileNavActive
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
  padding: calc(84px + env(safe-area-inset-top)) 24px 24px;
  background: var(--mobile-nav-bg);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 2;

  @media screen and (min-width: 768px) {
    display: flex;
    flex-direction: row;
    position: static;
    padding: 0;
    background: transparent;
    gap: 6px;
    overflow: visible;
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
  const { data: session, status } = useSession();
  const isSignedIn = !!session?.user?.email;
  const logoScopeRef = useRef(null);

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`);

  useEffect(() => {
    // Close the mobile drawer whenever route changes.
    const handleRoute = () => setMobileNavActive(false);
    router.events.on('routeChangeStart', handleRoute);
    return () => {
      router.events.off('routeChangeStart', handleRoute);
    };
  }, [router.events, setMobileNavActive]);

  useEffect(() => {
    // Prevent background scrolling when the mobile menu is open.
    if (typeof document === 'undefined') return;
    if (mobileNavActive) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [mobileNavActive]);

  useEffect(() => {
    let ctx;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    (async () => {
      try {
        const mod = await import('gsap');
        const gsap = mod.gsap || mod.default || mod;

        if (!logoScopeRef.current) {
          return;
        }

        ctx = gsap.context(() => {
          const letters = gsap.utils.toArray('.cw-logo-letter');

          gsap.set(letters, { y: 10, opacity: 0 });
          gsap.set('.cw-logo-underline', { scaleX: 0, opacity: 0 });

          gsap.to(letters, {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.03,
            ease: 'power3.out',
          });

          gsap.to('.cw-logo-underline', {
            scaleX: 1,
            opacity: 1,
            duration: 0.45,
            ease: 'power3.out',
            delay: 0.08,
          });
        }, logoScopeRef);
      } catch (error) {
        // GSAP is optional. If it fails, keep header static.
      }
    })();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <StyledHeader>
      <Center>
        <Wrapper>
          <Logo href='/' onClick={() => setMobileNavActive(false)}>
            <LogoInner ref={logoScopeRef} aria-label='Cheatswala'>
              <VisuallyHidden>Cheatswala</VisuallyHidden>
              {Array.from('Cheatswala').map((char, index) => (
                <LogoLetter
                  key={`${char}-${index}`}
                  className='cw-logo-letter'
                  aria-hidden='true'
                >
                  {char}
                </LogoLetter>
              ))}
              <LogoUnderline className='cw-logo-underline' aria-hidden='true' />
            </LogoInner>
          </Logo>
          <StyledNav $mobileNavActive={mobileNavActive}>
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
              {status === 'loading' ? null : isSignedIn ? (
                <AuthActionButton
                  type='button'
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Logout
                </AuthActionButton>
              ) : (
                <>
                  <AuthActionButton as={Link} href='/account?tab=signin'>
                    Sign In
                  </AuthActionButton>
                  <AuthPrimaryButton as={Link} href='/account?tab=signup'>
                    Sign Up
                  </AuthPrimaryButton>
                </>
              )}
            </AuthControls>
          </StyledNav>
          <SideIcons>
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
