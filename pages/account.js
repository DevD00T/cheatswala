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
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  useClerk,
  useUser,
} from '@clerk/nextjs';

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

  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

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

    if (!isLoaded) {
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
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (router?.query?.ordercanceled === '1') {
      setActiveTab('Orders');
    }
  }, [router]);

  const logout = async () => {
    await signOut({ redirectUrl: '/account' });
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

          <SignedOut>
            <AuthCard className='auth-card' white>
              <h2>Login to your account</h2>
              <AuthCopy>
                Use secure Clerk authentication to access orders and wishlist.
              </AuthCopy>
              <AuthButtons>
                <SignInButton mode='modal'>
                  <AuthActionButton type='button'>Sign In</AuthActionButton>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <AuthPrimaryButton type='button'>Create account</AuthPrimaryButton>
                </SignUpButton>
              </AuthButtons>
            </AuthCard>
          </SignedOut>

          <ColsWrapper>
            <div>
              <WhiteBox white>
                <Tabs
                  tabs={['Orders', 'Wishlist']}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                {!isSignedIn && <div>Login to view your orders and wishlist.</div>}
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
