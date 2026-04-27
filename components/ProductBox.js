import styled, { css } from 'styled-components';
import Button from './Button';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CartContext } from './CartContext';
import SubTitle from './SubTitle';
import { PriceWeight } from './PriceWeight';
import { limitLength } from '@/lib/common';
import { RevealWrapper } from 'next-reveal';
import HeartOutlineIcon from './icons/HeartOutline';
import HeartSolidIcon from './icons/HeartSolid';
import axios from 'axios';
import { useSession } from 'next-auth/react';
const ProductWrapper = styled(RevealWrapper)`
  display: flex;
  flex-direction: column;
`;
const WhiteBox = styled(Link)`
  background-color: #fff;
  padding: 20px;
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  img {
    max-width: 100%;
    max-height: 100px;
  }
  ${(props) =>
    props.graybox &&
    css`
      background-color: #eee;
    `}
`;
const Title = styled(Link)`
  font-weight: normal;
  font-size: 0.9rem;
  color: inherit;
  text-decoration: none;
  margin: 0;
`;
const ProductInfoBox = styled.div`
  margin-top: 5px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const PriceRow = styled.div`
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;

  @media screen and (min-width: 500px) {
    display: flex;
    gap: 5px;
  }
`;
const CartBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
const WishListButton = styled.button`
  border: 0;
  width: 40px !important;
  height: 40px;
  padding: 10px;
  background-color: transparent;
  cursor: pointer;
  svg {
    width: 20px;
    padding: 0;
    margin: 0;
  }
  position: absolute;
  right: 0px;
  top: 0px;
  ${(props) =>
    props.wished
      ? css`
          color: red;
        `
      : css`
          color: black;
        `}
`;

const ProductBox = ({
  _id,
  title,
  description,
  slug,
  price,
  images,
  properties,
  index,
  stock:oldStock,
  wished = false,
  graybox = false,
  onRemoveFromWishList = () => {},
}) => {
  const { cartProducts, addProduct, removeProduct } = useContext(CartContext);
  const quantity = cartProducts.filter((id) => id === _id).length;
  const url = '/product/' + slug;
  const [isWished, setIsWished] = useState(wished);
  const [stock, setStock] = useState(oldStock || 0);
  const { data: session } = useSession();
  const isSignedIn = !!session?.user?.email;
  const router = useRouter();
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      router.push('/account');
      return;
    }
    const nextValue = !isWished;
    await axios.post('/api/wishlist', {
      product: _id,
    });
    setIsWished(nextValue);
    if (!nextValue && onRemoveFromWishList) {
      onRemoveFromWishList(_id);
    }
  };
  
  
  return (
    <ProductWrapper delay={index * 50}>
      <WhiteBox href={url} graybox={graybox ? 1 : 0}>
        <div>
          <WishListButton aria-label="wish" wished={isWished} onClick={toggleWishlist}>
            {isWished ? <HeartSolidIcon /> : <HeartOutlineIcon />}
          </WishListButton>
          <img src={images?.[0]} alt={title} />
        </div>
      </WhiteBox>
      <ProductInfoBox>
        <Title href={url}>{limitLength(title, 27)}</Title>
        <PriceRow>
          <PriceWeight>
            <Price>₹{price}</Price>
          </PriceWeight>
          <CartBox>
            {stock > 0 ? (
              quantity > 0 ? (
                <>
                  <Button
                    green
                    outline
                    removeRightBorder
                    onClick={async () => {
                      const updatedStock = await removeProduct(_id,stock);
                      setStock(updatedStock);
                    }}
                  >
                    -
                  </Button>
                  <Button green>{quantity}</Button>
                  <Button
                    green
                    outline
                    removeLeftBorder
                    onClick={async () => {
                      const updatedStock = await addProduct(_id,stock);
                      setStock(updatedStock);
                    }}
                  >
                    +
                  </Button>
                </>
              ) : (
                <Button block green outline onClick={async () => {
                  const updatedStock = await addProduct(_id,stock);
                  setStock(updatedStock);
                }}>
                  Add to cart
                </Button>
              )
            ) : (
              <Button block white outline shadow disabled>Sold Out</Button>
            )}
          </CartBox>
        </PriceRow>
      </ProductInfoBox>
    </ProductWrapper>
  );
};

export default ProductBox;
