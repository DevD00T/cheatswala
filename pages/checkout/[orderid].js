import Center from '@/components/Center';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { MarginWrapper } from '@/components/MarginWrapper';
import mongooseConnect from '@/lib/mongoose';
import { Order } from '@/models/Order';
import SEO from '@bradgarropy/next-seo';
import React, { useContext, useState, useCallback } from 'react';
import { CategoryHeader } from '../category/[name]';
import Title from '@/components/Title';
import { ColsWrapper, OrdersGrid } from '../account';
import SingleOrder, { OrderStatusText } from '@/components/OrderLine';
import WhiteBox from '@/components/WhiteBox';
import { H4Titles } from '../cart';
import SubTitle from '@/components/SubTitle';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { SyncLoader } from 'react-spinners';
import { SnackBarContext } from '@/components/SnackbarContext';
import axios from 'axios';
import { useRouter } from 'next/router';
import { PaymentMethod } from '@/models/PaymentMethods';
const Checkout = ({ order }) => {
 const router = useRouter();
  const [senderDetails, setSenderDetails] = useState(order.paymentMethod.senderDetailsRequired.map((detail)=>({name:detail,value:''})));
  const [saving, setSaving] = useState(false);
  const { snackBarOpen } = useContext(SnackBarContext);
  const confirmPaymentCallback = useCallback(async () => {
    try {
      setSaving(true);
      const response = await axios.post(`/api/confirm-payment/${order._id}`, { senderDetails });
      if (response.data.success) {
        setSaving(false);
        router.push('/cart?success=1&awbcode=' + response.data.awbCode);
      } else {
        setSaving(false);
      }
    } catch (error) {
      setSaving(false);
      if (error.response && error.response.data) {
        snackBarOpen(error.response.data.message, 'error');
      } else {
        snackBarOpen(error.message, 'error');
      }
    }
  }, [order._id, senderDetails, router, snackBarOpen]);
          
  return (
    <Layout>
      <SEO
        title={`${order.paymentMethod.name} Checkout`}
        description={`Checkout by ${order.paymentMethod.name}`}
        keywords={[
          'Cheatswala products',
          'Cheatswala snacks',
          'Cheatswala game keys',
          'Cheatswala',
          'Cheatswala online',
          'Cheatswala online store',
          'Cheatswala online seller',
        ]}
        facebook={{
          image: order.paymentMethod.image,
          url: `https://www.cheatswala.net/checkout/${order._id}`,
          type: 'website',
        }}
        twitter={{
          image: order.paymentMethod.image,
          site: '@cheatswala',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <CategoryHeader>
            <Title>{`Checkout by ${order.paymentMethod.name}`}</Title>
          </CategoryHeader>
          <ColsWrapper>
            <div>
              <WhiteBox white>
                <OrdersGrid>
                  <SingleOrder {...order} />
                </OrdersGrid>
              </WhiteBox>
            </div>
            <div>
                <WhiteBox white>
                    <H4Titles>Send Rs.{order.totalAmount} to following</H4Titles>
                    {order.paymentMethod.receiverDetailsRequired.map(({name,value})=>(
                        <div key={name}>
                            <SubTitle bold>{name}</SubTitle>
                            <div>
                            <SubTitle>{value}</SubTitle>
                                </div>
                            
                        </div>
                    ))}
                    </WhiteBox>
            </div>
            <div>
            <WhiteBox white>
    <H4Titles>Follow Order Note Instructions</H4Titles>
        <div>
            <SubTitle bold>Note{' '}:</SubTitle>{' '}
            <SubTitle>{order.paymentMethod.notes}</SubTitle>
        </div>
        <div>
            <SubTitle>* If the note instructions are not completed, the payment will be refunded, and the order will be cancelled.</SubTitle>
        </div>
</WhiteBox>

            </div>
            <div>
                <WhiteBox white>
                    <H4Titles>After payment is done, fill in the following details and click Confirm Payment button</H4Titles>
                    {order.paymentMethod.senderDetailsRequired.map((requiredDetail,id)=>(<div key={id}>
                    <SubTitle bold>{requiredDetail}</SubTitle>
                    <Input
                        name={requiredDetail}
                        type='text'
                        placeholder={requiredDetail}
                        value={senderDetails.find((detail)=>detail.name===requiredDetail).value}
                        onChange={(e)=>setSenderDetails(senderDetails.map((detail)=>detail.name===requiredDetail?{...detail,value:e.target.value}:detail))}
                    />
                    </div>))}
                    <Button
                        reducesizescreennormal
                        black
                        block
                        onClick={confirmPaymentCallback} // Use the callback here
                      >
                        {!saving ? (
                          'Confirm Payment'
                        ) : (
                          <SyncLoader
                            size={9}
                            speedMultiplier={1}
                            color={'#fff'}
                          />
                        )}
                      </Button>
                    </WhiteBox>
            </div>
          </ColsWrapper>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default Checkout;

export const getServerSideProps = async (context) => {
  const { orderid } = context.query;
  await mongooseConnect();
  const order = await Order.findById(orderid).populate('paymentMethod');

  if (order.paid) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      order: JSON.parse(JSON.stringify(order)),
    },
  };
};
