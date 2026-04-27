import Button from '@/components/Button';
import Center from '@/components/Center';
import Header from '@/components/Header';
import ProductsGrid from '@/components/ProductsGrid';
import Spinner from '@/components/Spinner';
import mongooseConnect from '@/lib/mongoose';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BottomFilter from '@/components/BottomFilter';
import { Backdrop } from '@mui/material';
import DropIcon from '@/components/icons/DropIcon';
import { MarginWrapper } from '@/components/MarginWrapper';
import Title from '@/components/Title';
import { WishedProduct } from '@/models/WishedProduct';
import { useUser } from '@clerk/nextjs';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  ${(props) =>
    props.marginbottomless &&
    css`
      margin-bottom: 0px;
    `}
`;
const FiltersWrapper = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;
const Filter = styled.div`
  background-color: #ddd;
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  gap: 5px;
  color: #444;
  select {
    background-color: transparent;
    border: 0;
    font-size: inherit;
    color: #444;
  }
`;
const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 10px;
`;
const Sidebar = styled.div`
  flex: 2;
  border-right: 1px solid #ddd;
`;
const Content = styled.div`
  flex: 3;
  padding-left: 10px;
`;
const BottomFilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const SidebarLabel = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  position: relative;
  padding-right:1em;
  ${(props) =>
    props.active &&
    css`
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      font-weight: 500;
      color: #19a572;
      ::after {
        content: '';
        height: 100%;
        position: absolute;
        width: 4px;
        background-color: green;
        right: 0px;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
    `}
  ${(props) =>
    props.pointed &&
    css`
      cursor: pointer;
    `}
    input[type=checkbox] {
    accent-color: #19a572;
  }
`;
const BottomFilterTitle = styled.div`
  font-weight: 600;
  padding-left: 5px;
`;
const CategoryPage = ({
  category,
  subCategories,
  products: originalProducts,
  wishedProducts: originalWishedProducts,
}) => {
  const { isSignedIn } = useUser();
  const defaultFilterValues = category.properties.map((p) => ({
    name: p.name,
    value: 'all',
  }));
  const defaultSorting = '_id-desc';
  const [filterValues, setFilterValues] = useState(defaultFilterValues);
  const [products, setProducts] = useState(originalProducts);
  const [sort, setSort] = useState(defaultSorting);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [bottomFilter, setBottomFilter] = useState(false);
  const [selectedSideOption, setselectedSideOption] = useState('sort');
  const [wishedProducts, setWishedProducts] = useState(
    originalWishedProducts || []
  );
  useEffect(() => {
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (!hasMounted) {
      return;
    }
    const source = axios.CancelToken.source();
    const sourceWish = axios.CancelToken.source();

    const filterProducts = async () => {
      setLoadingProducts(true);
      const catIds = [
        category._id,
        ...(subCategories?.map((sub) => sub._id) || []),
      ];
      const params = new URLSearchParams();
      params.set('categories', catIds.join(','));
      params.set('sort', sort);
      filterValues.forEach((f) => {
        if (f.value !== 'all') {
          params.set(f.name, f.value);
        }
      });
      const url = `/api/products?${params.toString()}`;

      try {
        const response = await axios.get(url, { cancelToken: source.token });
        if (isSignedIn) {
          const wishResponse = await axios.get('/api/wishlist', {
            cancelToken: sourceWish.token,
          });
          const wishListFetched = wishResponse.data;
          setWishedProducts(
            wishListFetched.map((i) => i.product._id.toString())
          );
        }
        setProducts(response.data);

        setLoadingProducts(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };

    filterProducts();

    return () => {
      source.cancel();
      sourceWish.cancel();
    };
  }, [filterValues, sort, isSignedIn, hasMounted, category, subCategories]);

  const handleOnChange = (name, value) => {
    setFilterValues((prev) => {
      return prev.map((filter) => {
        if (filter.name === name) {
          return { ...filter, value };
        } else {
          return filter;
        }
      });
    });
  };
  const openBottomFilter = () => {
    setBottomFilter(true);
  };
  const closeBottomFilter = () => {
    setBottomFilter(false);
  };
  const addProductJsonLd = (products) => {
    const productListItems = products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item:{
        '@type': 'Product',
        sku: product._id,
        name: product.title,
        image: product.images, // Add the URL of the product image
        description: product.description.toString().replace(/\n/g, ' '),
        url: `https://www.cheatswala.net/product/${product.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `https://www.cheatswala.net/product/${product.slug}`,
          seller: {
            '@type': 'Organization',
            name: 'cheatswala',
          },
        },

      }
    }));

    return {
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: productListItems,
      }),
    };
  };
  return (
    <>
    <Head>
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd(originalProducts)}
          key={'category-jsonld'}
         />
      </Head>
      <SEO
        title={`${category.name.charAt(0).toUpperCase() + category.name.slice(1)} - cheatswala`}
        description={`Explore a wide range of ${category.name} on cheatswala. Discover high-quality ${category.name} and indulge in a delightful shopping experience.`}
        keywords={[category.name, ...subCategories.map((s) => s.name),...originalProducts.map((p) => p.title)]}
      />
      <Header />
      <Center>
        <MarginWrapper>
          <CategoryHeader>
            <Title marginverticaless>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</Title>
            <Button white outline shadow onClick={openBottomFilter}>
              Filter
              <DropIcon />
            </Button>
          </CategoryHeader>
          {!loadingProducts ? (
            <div>
              {products.length > 0 ? (
                <ProductsGrid
                  products={products}
                  wishedProducts={wishedProducts}
                />
              ) : (
                <div>Sorry, no products found</div>
              )}
            </div>
          ) : (
            <Spinner fullWidth />
          )}
        </MarginWrapper>
      </Center>
      <Backdrop
        sx={{ color: '#fff', zIndex: 4 }}
        open={bottomFilter}
        onClick={closeBottomFilter}
      >
        <BottomFilter showHide={bottomFilter} handleClose={closeBottomFilter}>
          <BottomFilterWrapper onClick={(event) => event.stopPropagation()}>
            <BottomFilterTitle>Filters</BottomFilterTitle>
            <SidebarWrapper>
              <Sidebar>
                {category.properties.map((prop) => (
                  <SidebarLabel
                    key={prop.name}
                    pointed
                    active={selectedSideOption === prop.name}
                    onClick={() => setselectedSideOption(prop.name)}
                  >
                    {prop.name}
                  </SidebarLabel>
                ))}
                <SidebarLabel
                  active={selectedSideOption === 'sort'}
                  pointed
                  onClick={() => setselectedSideOption('sort')}
                >
                  Sort
                </SidebarLabel>
              </Sidebar>
              <Content>
                {category.properties.map((prop) => {
                  if (prop.name === selectedSideOption) {
                    return (
                      <div key={prop.name}>
                        <SidebarLabel>
                          <input
                            type='checkbox'
                            name={prop.name}
                            value='all'
                            checked={
                              filterValues.find(
                                (filter) => filter.name === prop.name
                              ).value === 'all'
                            }
                            onChange={() => handleOnChange(prop.name, 'all')}
                          />
                          <label>All</label>
                        </SidebarLabel>
                        {prop.values.map((val) => (
                          <SidebarLabel key={val}>
                            <input
                              type='checkbox'
                              name={prop.name}
                              value={val}
                              checked={
                                filterValues.find(
                                  (filter) => filter.name === prop.name
                                ).value === val
                              }
                              onChange={() => handleOnChange(prop.name, val)}
                            />
                            <label>{val}</label>
                          </SidebarLabel>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })}
                {selectedSideOption === 'sort' && (
                  <div>
                    <SidebarLabel>
                      <input
                        type='checkbox'
                        name='price-asc'
                        value='price-asc'
                        checked={sort === 'price-asc'}
                        onChange={(e) => {
                          setSort(e.target.value);
                        }}
                      />
                      <label>price, lowest first</label>
                    </SidebarLabel>
                    <SidebarLabel>
                      <input
                        type='checkbox'
                        name='price-desc'
                        value='price-desc'
                        checked={sort === 'price-desc'}
                        onChange={(e) => {
                          setSort(e.target.value);
                        }}
                      />
                      <label>price, highest first</label>
                    </SidebarLabel>
                    <SidebarLabel>
                      <input
                        type='checkbox'
                        name='_id-desc'
                        value='_id-desc'
                        checked={sort === '_id-desc'}
                        onChange={(e) => {
                          setSort(e.target.value);
                        }}
                      />
                      <label>newest first</label>
                    </SidebarLabel>
                    <SidebarLabel>
                      <input
                        type='checkbox'
                        name='_id-asc'
                        value='_id-asc'
                        checked={sort === '_id-asc'}
                        onChange={(e) => {
                          setSort(e.target.value);
                        }}
                      />
                      <label>oldest first</label>
                    </SidebarLabel>
                  </div>
                )}
              </Content>
            </SidebarWrapper>
          </BottomFilterWrapper>
        </BottomFilter>
      </Backdrop>
    </>
  );
};

export default CategoryPage;

export const getServerSideProps = async (context) => {
  const { getSessionUser } = await import('@/lib/api/auth');
  await mongooseConnect();
  const category = await Category.findOne({name:context.query.name});
  const subCategories = await Category.find({ parent: category._id });
  const catIds = [category._id, ...subCategories.map((sub) => sub._id)];
  const products = await Product.find({ category: catIds }, null, {
    sort: { _id: -1 },
  }).select('-keyList -secret');
  const sessionUser = await getSessionUser(context.req);
  let wishedProducts = [];
  if (sessionUser?.email) {
    wishedProducts = await WishedProduct.find({
      userEmail: sessionUser.email,
      product: products.map((p) => p._id.toString()),
    });
  }
  return {
    props: {
      category: JSON.parse(JSON.stringify(category)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
};
