import styled from 'styled-components';
import Center from './Center';
import Button from './Button';
import ButtonLink from './ButtonLink';
import CartIcon from './icons/CartIcon';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from './CartContext';
import TickIcon from './icons/Tick';
import { RevealWrapper } from 'next-reveal';
import axios from 'axios';

const Bg = styled.div`
  background-color: #222;
  color: #fff;
  padding: 50px 0;
  margin-top: 50px;
`;
const Title = styled.h1`
  margin: 0;
  font-weight: normal;
  font-size: 1.5rem;
  @media screen and (min-width: 768px) {
    font-size: 3rem;
  }
  @media screen and (max-width: 350px) {
    font-size: 1rem;
  }
`;
const Desc = styled.p`
  color: #aaa;
  font-size: 0.8rem;
`;
const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  gap: 40px;
  img {
    max-width: 100%;
    max-height: 250px;
    
    margin: auto;
  }
  div:nth-child(1) {
    order: 1;
  }
  @media screen and (min-width: 768px) {
    grid-template-columns: 1.1fr 0.9fr;
    div:nth-child(1) {
      order: 0;
    }
    img {
      max-width: 100%;
      max-height: 350px;
    }
  }
`;

const Column = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ButtonsWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 25px;
`;

const Featured = ({ product }) => {
  const { cartProducts,addProduct } =
    useContext(CartContext);
    const productId = product?._id || '';
    const quantity = productId
      ? cartProducts.filter((id) => id === productId).length
      : 0;
    const [stock, setStock] = useState(product?.stock || 0);

    useEffect(() => {
      setStock(product?.stock || 0);
    }, [productId, product?.stock]);

    useEffect(() => {
      if (!productId) {
        return;
      }

      // Here you could fetch the updated stock for the product
      // For example:
      const source = axios.CancelToken.source();
      async function fetchStock() {
        try {
          const response = await axios.get(`/api/stock?id=${productId}`,{
            cancelToken: source.token,
          });
          const updatedStock = response.data?.stock;
          if (updatedStock !== undefined) {
            setStock(updatedStock);
          }
        } catch (error) {
          console.log(error);
        }
      }
      fetchStock();
      return ()=>{
        source.cancel();
      }
    }, [quantity, productId]);

    if (!productId) {
      return null;
    }

  return (
    <Bg>
      <Center>
        <ColumnsWrapper>
          <Column>
            <div>
              <RevealWrapper origin='left' delay={0}>
                <Title>{product.title}</Title>
                <Desc>{String(product.description || '').substring(0, 470)}</Desc>
                <ButtonsWrapper>
                  <ButtonLink
                    href={`/product/${product.slug}`}
                    outline={1}
                    white={1}
                    reducesizescreennormal={1}
                  >
                    Read more
                  </ButtonLink>
                  {stock>0 ? (quantity>0 ? (
                    <ButtonLink
                      href={'/'}
                      green={1}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      added={1}
                      reducesizescreennormal={1}
                    >
                      <TickIcon />
                      Added
                    </ButtonLink>
                  ) : (
                    <ButtonLink
                      href={'/'}
                      white={1}
                      onClick={async(e) => {
                        e.preventDefault();
                        const updatedStock = await addProduct(productId,stock);
                  setStock(updatedStock);
                      }}
                      reducesizescreennormal={1}
                    >
                      <CartIcon />
                      Add to cart
                    </ButtonLink>
                  )) : (
                      <ButtonLink href={'#'} white={1} disabled={1} reducesizescreennormal={1} onClick={(e)=>e.preventDefault()}>
                        Sold Out
                      </ButtonLink>
                  )}
                 
                  
                </ButtonsWrapper>
              </RevealWrapper>
            </div>
          </Column>
          <RevealWrapper delay={0}>
            <Column>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.title || 'Product'}
                loading='lazy'
              />
            </Column>
          </RevealWrapper>
        </ColumnsWrapper>
      </Center>
    </Bg>
  );
};

export default Featured;
