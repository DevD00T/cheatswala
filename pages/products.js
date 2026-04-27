import BottomCart from '@/components/BottomCart';
import Center from '@/components/Center';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import ProductsGrid from '@/components/ProductsGrid';
import Title from '@/components/Title';
import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { WishedProduct } from '@/models/WishedProduct';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Footer from '@/components/Footer';
import Layout from '@/components/Layout';
const ProductsPage = ({ products, wishedNewProducts }) => {
  console.log(products)
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
            name: 'Cheatswala',
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
    <Layout>
    <Head>
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd(products)}
          key={'products-jsonld'}
         />
      </Head>
      <SEO
        title='Products - Cheatswala'
        description='Cheatswala: Your Ultimate Destination for Software Keys, Game Keys, and Exclusive App Subscriptions at Unbeatable Prices!'
        keywords={[...products.map((prod) => prod.title)]}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <Title>All products</Title>
          <ProductsGrid
            products={products}
            wishedProducts={wishedNewProducts}
          />
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default ProductsPage;

export const getServerSideProps = async (ctx) => {
  const { getSessionUser } = await import('@/lib/api/auth');
  await mongooseConnect();
  const products = await Product.find({}, null, { sort: { _id: -1 } }).select('-keyList -secret');
  const sessionUser = await getSessionUser(ctx.req);
  let wishedNewProducts = [];
  if (sessionUser?.email) {
    wishedNewProducts = await WishedProduct.find({
      userEmail: sessionUser.email,
      product: products.map((p) => p._id.toString()),
    });
  }
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      wishedNewProducts: wishedNewProducts.map((i) => i.product.toString()),
    },
  };
};
