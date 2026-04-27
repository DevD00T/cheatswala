import BottomCart from '@/components/BottomCart';
import Center from '@/components/Center';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import ProductBox from '@/components/ProductBox';
import mongooseConnect from '@/lib/mongoose';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { WishedProduct } from '@/models/WishedProduct';
import { RevealWrapper } from 'next-reveal';
import Link from 'next/link';
import styled from 'styled-components';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media screen and (max-width: 300px) {
    grid-template-columns: 1fr;
  }
`;
const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 16px;
  a {
    color: #555;
  }
  h2 {
    margin: 0;
  }
`;

const ShowAllSquare = styled(Link)`
  background-color: #ddd;
  height: 160px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  text-decoration: none;
`;

const Categories = ({ mainCategories, categoriesProducts,wishedProducts=[] }) => {
  const addProductJsonLd = (categoriesProducts) => {
    const itemListElements = [];
  
    Object.values(categoriesProducts).forEach((products) => {
      products.forEach((product, index) => {
        const itemListElement = {
          '@type': 'ListItem',
          position: itemListElements.length + 1,
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
                name: 'Cheatswala',
              },
            },

          }
          
          
        };
        itemListElements.push(itemListElement);
      });
    });
  
    return {
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: itemListElements,
      }),
    };
  };
  
  return (
    <Layout>
    <Head>
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd(categoriesProducts)}
          key={'categoryProducts-jsonld'}
         />
      </Head>
      <SEO
        title={`Categories - Cheatswala`}
        description='Explore your favorite cheat needs by category.'
        keywords={[...mainCategories.map((cat) => cat.name),...Object.keys(categoriesProducts).reduce((acc,cat)=>[...acc,...categoriesProducts[cat].map((prod)=>prod.title)],[])]}
      />
      <Header />
      <MarginWrapper>
        <Center>
          {mainCategories.map((cat, i) => (categoriesProducts[cat._id].length > 0) && (
            <div key={cat._id}>
              <CategoryTitle>
                <h2>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</h2>
                <div>
                  <Link href={`/category/${cat.name}`}>Show all</Link>
                </div>
              </CategoryTitle>
              <CategoryGrid>
                {categoriesProducts[cat._id].map((product, index) => (
                  <ProductBox key={product._id} {...product} index={index} wished={wishedProducts.includes(product._id)}/>
                ))}
                <RevealWrapper delay={categoriesProducts[cat._id].length * 50}>
                  <ShowAllSquare href={`/category/${cat.name}`}>
                    Show all &rarr;
                  </ShowAllSquare>
                </RevealWrapper>
              </CategoryGrid>
            </div>
          ))}
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default Categories;

export const getServerSideProps = async (ctx) => {
  const { getSessionUser } = await import('@/lib/api/auth');
  await mongooseConnect();
  const categories = await Category.find(); //finding all categories
  const mainCategories = [...categories] //finding main category as they dont have parent
  const categoriesProducts = {};

  for (const mainCat of mainCategories) {
    const mainCatId = mainCat._id.toString(); //current main category
    const childCatIds = categories
      .filter((category) => category?.parent?.toString() === mainCatId)
      .map((c) => c._id.toString()); //finding all child category ids of current main category

    const categoriesIds = [mainCatId, ...childCatIds]; //combining child ids of current main category and current main category id
    const products = await Product.find({ category: categoriesIds }, null, {
      limit: 3,
      sort: { _id: -1 },
    }).select('-keyList -secret'); //find products with main category
    
    categoriesProducts[mainCat._id] = products; //mapping each main category id and the products in them in an object
  }

  const sessionUser = await getSessionUser(ctx.req);
  let wishedProducts = [];
  if (sessionUser?.email) {
    wishedProducts = await WishedProduct.find({
      userEmail: sessionUser.email,
      product: Object.values(categoriesProducts).reduce((acc,val)=>[...acc, ...val],[]).map((p) => p._id.toString()),
    });
  }
  return {
    props: {
      mainCategories: JSON.parse(JSON.stringify(mainCategories)),
      categoriesProducts: JSON.parse(JSON.stringify(categoriesProducts)),
      wishedProducts:wishedProducts.map(i=>i.product.toString())
    },
  };
};
