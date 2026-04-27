import Center from '@/components/Center';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import React, { useContext, useEffect, useState } from 'react';
import { CategoryHeader } from './category/[name]';
import Title from '@/components/Title';
import BottomCart from '@/components/BottomCart';
import { Box, CheckWrapper } from './cart';
import Input from '@/components/Input';
import Button from '@/components/Button';
import styled from 'styled-components';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { SnackBarContext } from '@/components/SnackbarContext';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
import SingleOrder from '@/components/OrderLine';
import { OrdersGrid } from './account';
import { useRouter } from 'next/router';
import { Order } from '@/models/Order';
import mongooseConnect from '@/lib/mongoose';
import WhiteBox from '@/components/WhiteBox';
import RetryIcon from '@/components/icons/Retry';
const CheckTitle = styled.h2`
  font-weight: 400;
  font-size: 1.1rem;
  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
  }
`;
const TrackingPage = ({order:oldOrder,awbCode:oldawb}) => {
  
  const router = useRouter();
  

const {snackBarOpen}=useContext(SnackBarContext);
  const [awbCode, setAwbCode] = useState(oldawb || '');
  const [awbLoading, setAwbLoading] = useState(false);
  const [order, setOrder] = useState(oldOrder || undefined);
  const getAWBInfo = async (awbCode) => {
    if(!awbCode){
      setOrder(undefined)
        snackBarOpen('Please enter a valid Tracking ID','error');
        return;
    }
    try {
      setAwbLoading(true);
      const response = await axios.get(`/api/track-order/${awbCode}`);
      if (response.data.order) {
        setOrder(response.data.order);
        setAwbLoading(false);
      }else{
          setAwbLoading(false);
          snackBarOpen('Invalid Tracking ID','error');
      }
    } catch (error) {
      console.log(error)
        if (error.response && error.response.data && error.response.data.message) {
            snackBarOpen(error.response.data.message, 'error');
          } else {
            snackBarOpen(error.message, 'error');
          }
      setAwbLoading(false);
    }
  };

  
  return (
    <Layout>
    <Head>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Track Your Order - Cheatswala',
            description: 'Track Your Order Using Your Tracking Code',
            url: 'https://www.cheatswala.net/track-order',
          }),
        }}
        key="tracking-jsonld"
      />
    </Head>
    <SEO
        title='Track Your Order - Cheatswala'
        description='Track Your Order Using Your Tracking Code'
        keywords={['track order', 'track order cheatswala','awb code','track order awb code','track order cheatswala awb code']}
    />
      <Header />
      <MarginWrapper>
        <Center>
          <CategoryHeader>
            <Title marginverticaless>Track Your Order</Title>
          </CategoryHeader>
          {awbLoading ? <Spinner fullWidth/> : (

          <Box>
            <CheckTitle>Enter Your Tracking ID</CheckTitle>
            <CheckWrapper>
              <Input
                name='awbCode'
                value={awbCode || ''}
                onChange={(e) => setAwbCode(e.target.value)}
                type='text'
                placeholder='Enter Your Tracking ID'
              />
              <Button
                black
                reduceSizeScreenOnlyFont
                onClick={async () => {
                  await getAWBInfo(awbCode);
                  setAwbCode('');
                }}
              >
                Get Quote
              </Button>
            </CheckWrapper>
            {order && order!==undefined && (
              <div style={{marginTop:'10px'}}>
              <OrdersGrid>
                <SingleOrder {...order}/>
              </OrdersGrid>
              {order.status === 'Waiting for payment' && (
                <Button
                reducesizescreennormal
                black
                onClick={() => {
                  router.push(`/checkout/${order._id}`);
                }}
                >
                  <RetryIcon />
                   Retry Payment
                </Button>
              )}
              </div>
            )}
          </Box>
          )}
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default TrackingPage;

export const getServerSideProps = async (context) => {
  const data = context.query;
  let awbCode = null;
  let order = null;
  await mongooseConnect();
  if (data && data.awbcode) {
    awbCode = data.awbcode;
    console.log(awbCode)
    try {
       const findOrder = await Order.findOne({ awbCode: awbCode });
       console.log(findOrder)
      if (findOrder) {
        order = findOrder;
        if(!order.paid){
          order.line_items = order.line_items.map((item)=>{
            item.keyList=undefined;
            item.secret=undefined;
            return item;
          })
        }
      }
    } catch (error) {
      
    }
  }
  
  return {
    props: {
      awbCode,
      order:JSON.parse(JSON.stringify(order)),
    },
  };

}
