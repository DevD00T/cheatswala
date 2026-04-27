import Button from '@/components/Button';
import Center from '@/components/Center';
import Header from '@/components/Header';
import Input from '@/components/Input';
import { MarginWrapper } from '@/components/MarginWrapper';
import WhiteBox from '@/components/WhiteBox';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CategoryHeader } from './category/[name]';
import Title from '@/components/Title';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { SyncLoader } from 'react-spinners';
import emotionStyled from '@emotion/styled';
import BottomCart from '@/components/BottomCart';
import ProductBox from '@/components/ProductBox';
import Tabs from '@/components/Tabs';
import SingleOrder from '@/components/OrderLine';
import { useRouter } from 'next/router';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { signIn, signOut, useSession } from 'next-auth/react';

export const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 40px;
`;

const StyledMuiAlert = emotionStyled(MuiAlert)`
  display:flex;
  align-items:center;
  max-width:fit-content;

  .MuiAlert-action{
    padding:0;
    margin-left:12px;
    button{
      padding-left:0;
      padding-right:0;
    }
  }
`;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <StyledMuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const WishedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const AccountActions = styled.div`
  display: flex;
  gap: 10px;
`;

const AuthCard = styled(WhiteBox)`
  &.auth-card {
    border: 1px solid #eceff5;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  }
`;

const AuthCopy = styled.p`
  margin: 0;
  color: #4b5563;
`;

const AuthButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const AuthActionButton = styled.button`
  border: 1px solid #d1d5db;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.95rem;
  cursor: pointer;
  background: #fff;
`;

const AuthPrimaryButton = styled(AuthActionButton)`
  border-color: #111827;
  background: #111827;
  color: #fff;
`;

const AuthNotice = styled.p`
  margin: 12px 0 0;
  font-size: 0.9rem;
  color: ${(props) => (props.$error ? '#b91c1c' : '#166534')};
`;

const PasswordRequirements = styled.div`
  margin-top: 10px;
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  color: #4b5563;
`;

const Requirement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span:first-child {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${(props) => (props.$met ? '#16a34a' : '#d1d5db')};
  }
`;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

const getClientPasswordError = (password = '') => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must include uppercase, lowercase, and a number.';
  }

  return '';
};

const AccountPage = () => {
  const [email, setEmail] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadedWish, setLoadedWish] = useState(false);
  const [loadedOrders, setLoadedOrders] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [wishedProducts, setWishedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Wishlist');
  const [orders, setOrders] = useState([]);

  const { data: session, status } = useSession();
  const isSignedIn = !!session?.user?.email;
  const sessionUserId = session?.user?.id || '';
  const router = useRouter();

  const [authTab, setAuthTab] = useState('Sign In');
  const [authNotice, setAuthNotice] = useState({ error: false, message: '' });
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const tab = typeof router.query.tab === 'string' ? router.query.tab : '';
    const token = typeof router.query.token === 'string' ? router.query.token : '';

    if (token) {
      setResetToken(token);
      setAuthTab('Reset Password');
      return;
    }

    if (tab === 'signup') {
      setAuthTab('Sign Up');
      return;
    }

    if (tab === 'reset') {
      setAuthTab('Reset Password');
      return;
    }

    if (tab === 'signin') {
      setAuthTab('Sign In');
      return;
    }
  }, [router.isReady, router.query.tab, router.query.token]);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const sourceWish = axios.CancelToken.source();
    const sourceOrders = axios.CancelToken.source();

    const getAddress = async () => {
      try {
        const response = await axios.get('/api/address', {
          cancelToken: source.token,
        });
        if (response.data) {
          setEmail(response.data.email || '');
        }
      } finally {
        setLoaded(true);
      }
    };

    const getWishList = async () => {
      try {
        const response = await axios.get('/api/wishlist', {
          cancelToken: sourceWish.token,
        });
        setWishedProducts(response.data.map((wp) => wp.product));
      } finally {
        setLoadedWish(true);
      }
    };

    const getOrdersList = async () => {
      try {
        const response = await axios.get('/api/orders', {
          cancelToken: sourceOrders.token,
        });
        setOrders(response.data);
      } finally {
        setLoadedOrders(true);
      }
    };

    if (status === 'loading') {
      return () => {
        source.cancel();
        sourceWish.cancel();
        sourceOrders.cancel();
      };
    }

    if (isSignedIn) {
      setLoaded(false);
      setLoadedWish(false);
      setLoadedOrders(false);
      getAddress();
      getWishList();
      getOrdersList();
    } else {
      setEmail('');
      setWishedProducts([]);
      setOrders([]);
      setLoaded(false);
      setLoadedWish(false);
      setLoadedOrders(false);
    }

    return () => {
      source.cancel();
      sourceWish.cancel();
      sourceOrders.cancel();
    };
  }, [isSignedIn, status]);

  useEffect(() => {
    if (router?.query?.ordercanceled === '1') {
      setActiveTab('Orders');
    }
  }, [router]);

  const logout = async () => {
    await signOut({ callbackUrl: '/account' });
  };

  const handleOrderInputChange = (e) => {
    const { value } = e.target;
    setEmail(value);
  };

  const openSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbar(true);
  };

  const saveAddress = async () => {
    setSaving(true);
    try {
      const response = await axios.put('/api/address', {
        email,
      });
      if (response.data) {
        setEmail(response.data.email || email);
        openSnackbar('Saved successfully!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar(false);
  };

  const productRemoved = (id) => {
    setWishedProducts((prev) => prev.filter((p) => p._id.toString() !== id));
  };

  const showAuthNotice = (message, error = false) => {
    setAuthNotice({ error, message });
  };

  const handleSignIn = async () => {
    showAuthNotice('');
    setAuthBusy(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: signInEmail,
        password: signInPassword,
      });

      if (result?.error) {
        showAuthNotice('Invalid email or password.', true);
        return;
      }

      showAuthNotice('Signed in successfully.');
      setSignInPassword('');
    } catch (error) {
      showAuthNotice('Unable to sign in right now.', true);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignUp = async () => {
    showAuthNotice('');
    const clientError = getClientPasswordError(signUpPassword);
    if (clientError) {
      showAuthNotice(clientError, true);
      return;
    }

    setAuthBusy(true);
    try {
      await axios.post('/api/auth/register', {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });

      const result = await signIn('credentials', {
        redirect: false,
        email: signUpEmail,
        password: signUpPassword,
      });

      if (result?.error) {
        showAuthNotice('Account created. Please sign in.', false);
        setAuthTab('Sign In');
        return;
      }

      showAuthNotice('Account created and signed in.');
      setSignUpPassword('');
    } catch (error) {
      showAuthNotice(
        error?.response?.data?.message || 'Unable to create account.',
        true
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSendResetEmail = async () => {
    showAuthNotice('');
    setAuthBusy(true);
    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: resetEmail,
      });
      showAuthNotice(
        response?.data?.message ||
          'If an account exists, a reset link has been emailed.',
        false
      );
    } catch (error) {
      showAuthNotice(
        error?.response?.data?.message ||
          'Unable to request password reset right now.',
        true
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleResetPassword = async () => {
    showAuthNotice('');
    const clientError = getClientPasswordError(resetPassword);
    if (clientError) {
      showAuthNotice(clientError, true);
      return;
    }

    setAuthBusy(true);
    try {
      const response = await axios.post('/api/auth/reset-password', {
        token: resetToken,
        password: resetPassword,
      });
      showAuthNotice(response?.data?.message || 'Password updated.', false);
      setResetPassword('');
      setResetToken('');
      await router.push('/account?tab=signin');
    } catch (error) {
      showAuthNotice(
        error?.response?.data?.message || 'Unable to reset password.',
        true
      );
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Account - Cheatswala',
              description:
                'Login and see your orders and wishlist on Cheatswala',
              url: 'https://www.cheatswala.net/account',
            }),
          }}
          key='account-jsonld'
        />
      </Head>
      <SEO
        title='Account - Cheatswala'
        description='Login and see your orders and wishlist on Cheatswala'
        keywords={[
          'Cheatswala',
          'Account',
          'Orders',
          'Wishlist',
          'Login',
          'Logout',
        ]}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <CategoryHeader>
            <Title marginverticaless>Account</Title>
            <AccountActions>
              {isSignedIn ? (
                <Button reducesizescreennormal black onClick={logout}>
                  Logout
                </Button>
              ) : null}
            </AccountActions>
          </CategoryHeader>

          {!isSignedIn ? (
            <AuthCard className='auth-card' white>
              <h2>Sign in</h2>
              <AuthCopy>
                Sign in to access your orders, wishlist, and delivery email.
              </AuthCopy>
              <Tabs
                tabs={['Sign In', 'Sign Up', 'Reset Password']}
                active={authTab}
                onChange={(tabName) => {
                  setAuthTab(tabName);
                  showAuthNotice('');
                }}
              />

              {authTab === 'Sign In' ? (
                <>
                  <Input
                    type='email'
                    placeholder='Email'
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                  />
                  <Input
                    type='password'
                    placeholder='Password'
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                  />
                  <AuthButtons>
                    <AuthPrimaryButton
                      type='button'
                      disabled={authBusy}
                      onClick={handleSignIn}
                    >
                      {authBusy ? 'Signing in...' : 'Sign In'}
                    </AuthPrimaryButton>
                    <AuthActionButton
                      type='button'
                      disabled={authBusy}
                      onClick={() => setAuthTab('Reset Password')}
                    >
                      Forgot password
                    </AuthActionButton>
                  </AuthButtons>
                </>
              ) : null}

              {authTab === 'Sign Up' ? (
                <>
                  <Input
                    type='text'
                    placeholder='Name (optional)'
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                  />
                  <Input
                    type='email'
                    placeholder='Email'
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                  />
                  <Input
                    type='password'
                    placeholder='Password'
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                  />
                  <PasswordRequirements>
                    <Requirement $met={signUpPassword.length >= 8}>
                      <span />
                      <span>At least 8 characters</span>
                    </Requirement>
                    <Requirement $met={/[a-z]/.test(signUpPassword)}>
                      <span />
                      <span>Lowercase letter</span>
                    </Requirement>
                    <Requirement $met={/[A-Z]/.test(signUpPassword)}>
                      <span />
                      <span>Uppercase letter</span>
                    </Requirement>
                    <Requirement $met={/\d/.test(signUpPassword)}>
                      <span />
                      <span>Number</span>
                    </Requirement>
                  </PasswordRequirements>
                  <AuthButtons>
                    <AuthPrimaryButton
                      type='button'
                      disabled={authBusy}
                      onClick={handleSignUp}
                    >
                      {authBusy ? 'Creating...' : 'Create account'}
                    </AuthPrimaryButton>
                  </AuthButtons>
                </>
              ) : null}

              {authTab === 'Reset Password' ? (
                <>
                  {resetToken ? (
                    <>
                      <Input
                        type='password'
                        placeholder='New password'
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                      />
                      <PasswordRequirements>
                        <Requirement $met={resetPassword.length >= 8}>
                          <span />
                          <span>At least 8 characters</span>
                        </Requirement>
                        <Requirement $met={/[a-z]/.test(resetPassword)}>
                          <span />
                          <span>Lowercase letter</span>
                        </Requirement>
                        <Requirement $met={/[A-Z]/.test(resetPassword)}>
                          <span />
                          <span>Uppercase letter</span>
                        </Requirement>
                        <Requirement $met={/\d/.test(resetPassword)}>
                          <span />
                          <span>Number</span>
                        </Requirement>
                      </PasswordRequirements>
                      <AuthButtons>
                        <AuthPrimaryButton
                          type='button'
                          disabled={authBusy}
                          onClick={handleResetPassword}
                        >
                          {authBusy ? 'Updating...' : 'Update password'}
                        </AuthPrimaryButton>
                      </AuthButtons>
                    </>
                  ) : (
                    <>
                      <Input
                        type='email'
                        placeholder='Email'
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      <AuthButtons>
                        <AuthPrimaryButton
                          type='button'
                          disabled={authBusy}
                          onClick={handleSendResetEmail}
                        >
                          {authBusy ? 'Sending...' : 'Send reset link'}
                        </AuthPrimaryButton>
                      </AuthButtons>
                    </>
                  )}
                </>
              ) : null}

              {authNotice.message ? (
                <AuthNotice $error={authNotice.error}>
                  {authNotice.message}
                </AuthNotice>
              ) : null}
            </AuthCard>
          ) : null}

          <ColsWrapper>
            <div>
              <WhiteBox white>
                <Tabs
                  tabs={['Orders', 'Wishlist']}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                {!isSignedIn && <div>Sign in to view your orders and wishlist.</div>}
                {activeTab === 'Wishlist' && (
                  <>
                    {loadedWish ? (
                      <WishedProductsGrid>
                        {wishedProducts.length > 0 ? (
                          wishedProducts.map((wp) => (
                            <ProductBox
                              {...wp}
                              key={wp._id}
                              wished
                              onRemoveFromWishList={productRemoved}
                              graybox
                            />
                          ))
                        ) : (
                          <div>Your wishlist is empty.</div>
                        )}
                      </WishedProductsGrid>
                    ) : isSignedIn ? (
                      <Spinner fullWidth />
                    ) : null}
                  </>
                )}
                {activeTab === 'Orders' && (
                  <>
                    {loadedOrders ? (
                      <OrdersGrid>
                        {orders.length > 0 ? (
                          orders.map((od) => <SingleOrder key={od._id} {...od} />)
                        ) : (
                          <div>No orders found.</div>
                        )}
                      </OrdersGrid>
                    ) : isSignedIn ? (
                      <Spinner fullWidth />
                    ) : null}
                  </>
                )}
              </WhiteBox>
            </div>
            {isSignedIn && (
              <div>
                <WhiteBox white>
                  <h2>Default Delivery Email</h2>
                  {sessionUserId ? (
                    <AuthCopy style={{ marginTop: 6 }}>
                      User ID: <b>{sessionUserId}</b>
                    </AuthCopy>
                  ) : null}
                  {loaded ? (
                    <>
                      <Input
                        name='email'
                        value={email}
                        onChange={handleOrderInputChange}
                        type='email'
                        placeholder='Email'
                      />

                      <Button
                        reducesizescreennormal
                        black
                        block
                        onClick={saveAddress}
                      >
                        {!saving ? (
                          'Save'
                        ) : (
                          <SyncLoader
                            size={9}
                            speedMultiplier={1}
                            color='#fff'
                          />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Spinner fullWidth />
                  )}
                </WhiteBox>
              </div>
            )}
          </ColsWrapper>
          <Snackbar
            open={snackbar}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity='success' sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default AccountPage;
