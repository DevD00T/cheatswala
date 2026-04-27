import BottomCart from '@/components/BottomCart';
import Button from '@/components/Button';
import { CartContext } from '@/components/CartContext';
import Center from '@/components/Center';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import { PriceWeight } from '@/components/PriceWeight';
import ProductImages from '@/components/ProductImages';
import ProductReviews from '@/components/ProductReviews';
import SubTitle from '@/components/SubTitle';
import Title from '@/components/Title';
import WhiteBox from '@/components/WhiteBox';
import CartIcon from '@/components/icons/CartIcon';
import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';

const ColWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.span`
  font-size: 1.4rem;
  @media screen and (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Description = styled.p`
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const ButtonWrapper = styled(Button)`
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ProductPage = ({ product }) => {
  const { cartProducts, addProduct, removeProduct } = useContext(CartContext);
  const quantity = cartProducts.filter((id) => id === product._id).length;
  const [stock, setStock] = useState(product.stock);

  useEffect(() => {
    // Ensure that 'product' is included in the dependencies array to update stock when 'product' changes.
    setStock(product.stock);
  }, [product]);

  return (
    <Layout>
     <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "${product.title}",
                "image": "${product.images[0]}",
                "description": "${product.description.toString().replace(/\n/g, ' ')}",
                "sku": "${product._id}",
                "mpn": "${product._id}",
                "review": {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "4.8",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Cheatswala"
                  }
                },
                "brand": {
                  "@type": "Brand",
                  "name": "${product.brand}"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "${product.price}",
                  "priceCurrency": "INR",
                  "availability": "${product.stock > 0 ? 'InStock' : 'OutOfStock'}",
                  "priceValidUntil": "2024-11-05",
                  "url": "https://www.cheatswala.net/product/${product.slug}"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "reviewCount": "12"
                },
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "returnFees": "Customer pays",
                  "returnPolicyCountry": "IN",
                  "returnPolicyCategory": "All"
                }
              }
            `,
          }}
          key={'product-jsonld'}
        />
      </Head>
      <SEO
        title={`${product.title} - Cheatswala`}
        description={product.description.substring(0, 120)}
        keywords={product?.tags}
        facebook={{
          image: product.images[0],
          url: `https://www.cheatswala.net/product/${product.slug}`,
          type: "website",
        }}
        twitter={{
          image: product.images[0],
          site: "@cheatswala",
          card: "summary_large_image",
        }}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <ColWrapper>
            <WhiteBox>
              <ProductImages images={product.images} />
            </WhiteBox>
            <div>
              <SubTitle smallest>{product.brand}</SubTitle>
              <Title marginTopLess>{product.title}</Title>
              <Description>{product.description}</Description>
              <PriceRow>
                <PriceWeight>
                  <Price>₹{product.price}</Price>
                </PriceWeight>
                <div>
                  {stock > 0 ? (
                    quantity > 0 ? (
                      <>
                        <ButtonWrapper
                          green
                          outline
                          removeRightBorder
                          onClick={async () => {
                            const updatedStock = await removeProduct(product._id, stock);
                            setStock(updatedStock);
                          }}
                        >
                          -
                        </ButtonWrapper>
                        <ButtonWrapper green>{quantity}</ButtonWrapper>
                        <ButtonWrapper
                          green
                          outline
                          removeLeftBorder
                          onClick={async () => {
                            const updatedStock = await addProduct(product._id, stock);
                            setStock(updatedStock);
                          }}
                        >
                          +
                        </ButtonWrapper>
                      </>
                    ) : (
                      <ButtonWrapper
                        green
                        outline
                        onClick={async () => {
                          const updatedStock = await addProduct(product._id, stock);
                          setStock(updatedStock);
                        }}
                      >
                        <CartIcon />
                        Add to cart
                      </ButtonWrapper>
                    )
                  ) : (
                    <ButtonWrapper block white outline shadow disabled paddingreset>
                      Sold Out
                    </ButtonWrapper>
                  )}
                </div>
              </PriceRow>
            </div>
          </ColWrapper>
          <ProductReviews product={product} />
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default ProductPage;

export const getServerSideProps = async (context) => {
  const { slug } = context.query;
  await mongooseConnect();
  const product = await Product.findOne({ slug }).select('-keyList -secret');
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
};
