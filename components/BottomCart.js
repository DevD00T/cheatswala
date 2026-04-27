import styled, { css } from 'styled-components';
import Center from './Center';
import ButtonLink from './ButtonLink';
import { PriceWeight } from './PriceWeight';
import SubTitle from './SubTitle';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from './CartContext';
import axios from 'axios';
import { NavActiveContext } from './NavActiveContext';
import Spinner from './Spinner';
import 'react-loading-skeleton/dist/skeleton.css'
const Container = styled.div`
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  height: 50px;
  ${(props) => css`
    display: ${props.mobileNavActive ? 'none' : 'block'};
  `}
  z-index:10;
`;
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-radius: 5px;
  padding: 10px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
background-color: #eee;
  -webkit-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
`;
const Price = styled.div`
  font-size: 1rem;
  font-weight: 400;
  text-align: right;
  @media screen and (min-width: 768px) {
    text-align: left;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;
const CartBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const BottomCart = () => {
  const { cartProducts } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const { mobileNavActive, setMobileNavActive } = useContext(NavActiveContext);
  useEffect(() => {
    const source = axios.CancelToken.source();

    const getAllProducts = async () => {
      try {
        const response = await axios.post(
          '/api/cart',
          { ids: cartProducts },
          { cancelToken: source.token }
        );
        setProducts(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };
    if (cartProducts.length > 0) {
      getAllProducts();
    } else {
      setProducts([]);
    }

    return () => {
      source.cancel();
    };
  }, [cartProducts]);
  let total = 0;
  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId)?.price || 0;
    total += price;
  }
  if (cartProducts.length <= 0) {
    return <></>;
  }
  return (
    <Container mobileNavActive={mobileNavActive}>
      <Center>
        <Wrapper>
          <PriceWeight>
            <SubTitle>
              {cartProducts.length} item{cartProducts.length > 1 && 's'} in cart
            </SubTitle>
            <Price>
            {total ? `₹${total}`:
            
            <Spinner/>}
            </Price>
          </PriceWeight>
          <CartBox>
            <ButtonLink href={'/cart'} green={1}>
              View Cart
            </ButtonLink>
          </CartBox>
        </Wrapper>
      </Center>
    </Container>
  );
};

export default BottomCart;
