import { ParallaxProvider } from 'react-scroll-parallax';
import { createGlobalStyle } from 'styled-components';
import '../styles/global.css';
import { CartContextProvider } from '@/components/CartContext';
import Head from 'next/head';
import { NavActiveContextProvider } from '@/components/NavActiveContext';
import { SnackBarContextProvider } from '@/components/SnackbarContext';
import dynamic from 'next/dynamic';
import nProgress from 'nprogress';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SessionProvider } from 'next-auth/react';

const TawkMessengerReact = dynamic(
  () => import('@tawk.to/tawk-messenger-react'),
  { ssr: false }
);

const GlobalStyles = createGlobalStyle`
  :root {
    --page-bg: #ffffff;
    --text-main: #0f172a;
    --text-muted: #475569;
    --brand-accent: #17a16f;
    --surface-bg: #ffffff;
    --surface-border: rgba(15, 23, 42, 0.1);
    --header-bg: #ffffff;
    --mobile-nav-bg: #ffffff;
    --header-border: rgba(15, 23, 42, 0.12);
    --header-text: #0f172a;
    --header-link: #334155;
    --header-link-hover-bg: rgba(15, 23, 42, 0.06);
    --header-link-active-bg: rgba(15, 23, 42, 0.1);
    --header-link-active-border: rgba(15, 23, 42, 0.16);
    --auth-btn-border: rgba(15, 23, 42, 0.2);
    --auth-btn-bg: rgba(255, 255, 255, 0.72);
    --auth-btn-text: #0f172a;
    --auth-primary-border: rgba(23, 161, 111, 0.42);
    --auth-primary-bg: rgba(16, 185, 129, 0.18);
    --auth-primary-text: #065f46;
    --header-offset: 72px;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background: var(--page-bg);
    color: var(--text-main);
    padding: 0;
    margin: 0;
    font-family: 'Manrope', 'Poppins', sans-serif;
    line-height: 1.65;
    letter-spacing: 0.01em;
  }

  input, button, textarea, select {
    font-family: inherit;
  }

  #nprogress {
    --primary-color: var(--brand-accent);
    pointer-events: none;
  }

  #nprogress .bar {
    background: var(--primary-color);
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px var(--primary-color), 0 0 5px var(--primary-color);
    opacity: 1.0;
    transform: rotate(3deg) translate(0px, -4px);
  }

  #nprogress .spinner {
    display: none;
  }
`;

const RouteProgress = () => {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => nProgress.start();
    const handleStop = () => nProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router.events]);

  return null;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <meta name='theme-color' content='#ffffff' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link
          rel='manifest'
          crossOrigin='use-credentials'
          href='/manifest.json'
        />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#555555' />
        <meta name='msapplication-TileColor' content='#ffffff' />
      </Head>
      <GlobalStyles />
      <RouteProgress />
      <SessionProvider session={session}>
        <SnackBarContextProvider>
          <NavActiveContextProvider>
            <CartContextProvider>
              <TawkMessengerReact
                customStyle={{
                  visibility: {
                    desktop: {
                      yOffset: 70,
                      position: 'br',
                    },
                    mobile: {
                      yOffset: 70,
                      position: 'br',
                    },
                  },
                }}
                propertyId={process.env.NEXT_PUBLIC_TAWKTO_ID}
                widgetId={process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID}
              />
              <SpeedInsights />
              <ParallaxProvider>
                <Component {...pageProps} />
              </ParallaxProvider>
            </CartContextProvider>
          </NavActiveContextProvider>
        </SnackBarContextProvider>
      </SessionProvider>
    </>
  );
}
