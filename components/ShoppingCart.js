import styled, { css } from 'styled-components';
import SubTitle from './SubTitle';
import Link from 'next/link';
import { limitLength } from '@/lib/common';
const Button = styled.button`
  width: 30px;
  height: 30px;
  background-color: #e1e8ee;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  ${(props) =>
    props.green &&
    props.outline &&
    css`
      background-color: transparent;
      color: #19a572;
      border: 1px solid #dadada;
    `}
    ${(props) =>
    props.green &&
    !props.outline &&
    css`
      background-color: #19a572;
      color: #fff;
      border: 1px solid transparent;
      border-radius: 0;
      cursor: default;
    `}
`;
const ItemBox = styled.div`
  padding: 20px 30px;
  height: 120px;
  display: flex;
  border-bottom: 1px solid #e1e8ee;
  @media screen and (max-width: 900px) {
    height: auto;
    flex-wrap: wrap;
    justify-content: center;
  }
`;
const ProductImageBox = styled(Link)`
  margin-right: 50px;
  img {
    width: 120px;
  height: auto;
  }
  @media screen and (max-width: 900px) {
    img {
    width: 50%;
    height: auto;
  }
    width: 100%;
    text-align: center;
    margin: 6px 0;
  }
`;
const ProductTitle = styled.div`
  padding-top: 10px;
  margin-right: 60px;
  width: 115px;
  @media screen and (max-width: 900px) {
    width: 100%;
    text-align: center;
    margin: 6px 0;
  }
`;
const TitleLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;
const TotalPriceBox = styled.div`
  width: 83px;
  padding-top: 27px;
  text-align: center;
  color: #43484d;
  font-weight: 300;
`;
const ButtonContainer = styled.div`
  padding-top: 20px;
  margin-right: 60px;
  @media screen and (max-width: 900px) {
    width: 100%;
    text-align: center;
    margin: 6px 0;
  }
`;
const ShoppingCart = ({
  product,
  cartProducts,
  lessOfThisProduct,
  moreOfThisProduct,
}) => {
  return (
    <ItemBox>
      <ProductImageBox href={`/product/${product.slug}`}>
        <img src={product.images[0]} alt={product.title} />
      </ProductImageBox>

      <ProductTitle>
        <TitleLink href={`/product/${product.slug}`}>
          {limitLength(product.title)}
        </TitleLink>
      </ProductTitle>

      <ButtonContainer>
        <Button
          green
          outline
          removeRightBorder
          onClick={() => lessOfThisProduct(product._id)}
        >
          -
        </Button>
        <Button green>
          {cartProducts.filter((id) => id === product._id).length}
        </Button>
        <Button
          green
          outline
          removeLeftBorder
          onClick={() => moreOfThisProduct(product._id)}
        >
          +
        </Button>
      </ButtonContainer>

      <TotalPriceBox>
        ₹
        {cartProducts.filter((id) => id === product._id).length * product.price}
      </TotalPriceBox>
    </ItemBox>
  );
};

export default ShoppingCart;
