import BottomCart from '@/components/BottomCart';
import Featured from '@/components/Featured';
import Header from '@/components/Header';
import NewProducts from '@/components/NewProducts';
import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { WishedProduct } from '@/models/WishedProduct';
import { Setting } from '@/models/Setting';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';

import Center from '@/components/Center';
import { MarginWrapper } from '@/components/MarginWrapper';
import { RevealWrapper } from 'next-reveal';
import Footer from '@/components/Footer';
import Layout from '@/components/Layout';
const HomePage = ({
  featuredProduct,
  newProducts,
  wishedNewProducts,
  recentPosts,
}) => {
  const productsList = Array.isArray(newProducts) ? newProducts.filter(Boolean) : [];
  const featured = featuredProduct || productsList[0] || null;
  const breadcrumbList = [
    { name: 'Home', url: 'https://www.cheatswala.net' },
    { name: 'Categories', url: 'https://www.cheatswala.net/categories' },
    { name: 'Products', url: 'https://www.cheatswala.net/products' },
    { name: 'Account', url: 'https://www.cheatswala.net/account' },
    {
      name: 'Track Your Order',
      url: 'https://www.cheatswala.net/track-order',
    },
    { name: 'Cart', url: 'https://www.cheatswala.net/cart' },
    { name: 'Blog', url: 'https://www.cheatswala.net/blog' },
  ];
  const addProductJsonLd = (featuredData, products) => {
    const hasFeatured = !!featuredData;
    const productListItems = products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + (hasFeatured ? 2 : 1),
      name: product?.title || 'Product',
      item: `https://www.cheatswala.net/product/${product?.slug || ''}`,
    }));

    const featuredEntity = hasFeatured
      ? [
          {
            '@type': 'Product',
            name: featuredData.title,
            image: featuredData?.images?.[0] || '',
            description: String(featuredData?.description || '').replace(/\n/g, ' '),
            offers: {
              '@type': 'Offer',
              price: featuredData?.price || 0,
              priceCurrency: 'INR',
            },
          },
        ]
      : [];

    return {
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Cheatswala',
        description: 'Cheatswala: Unveiling the Art of Gaming Mastery!',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbList.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        },
        mainEntity: [...featuredEntity, ...productListItems],
      }),
    };
  };

  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={addProductJsonLd(featured, productsList)}
          key={'homepage-jsonld'}
        />
      </Head>
      <SEO
        title={`Cheatswala: Your Ultimate Destination for Software Keys, Game Keys, and Exclusive App Subscriptions at Unbeatable Prices!`}
        description='Why settle for the ordinary when you can embrace the extraordinary? At Cheatswala, we strive to exceed expectations by sourcing authentic, authorized keys directly from developers and publishers. Say goodbye to counterfeit or unreliable keys and embrace a seamless and secure purchasing experience.'
        keywords={[
          'Cheatswala',
          'App subscriptions',
          'Website subscription',
          'OTT Subscription',
          'Hoichoi premium',
          'Chatgpt plus',
          'Spotify premium',
          'Youtube premium',
          'VPN Subscription',
          'BGMI Cheats',
          'Pubg cheats',
          'Cheatswala ultimate',
          'Softwares of cheatswala',
          'Cheaters paradise',
        ]}
        facebook={{
          image: 'https://www.cheatswala.net/cheatswalakumar.png',
          url: 'https://www.cheatswala.net',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.cheatswala.net/cheatswalakumar.png',
          site: '@cheatswala',
          card: 'summary_large_image',
        }}
      />
      <Header />
      {featured ? <Featured product={featured} /> : null}
      <MarginWrapper margintop={'0'}>
        <Center>
          <NewProducts
            products={productsList}
            wishedProducts={wishedNewProducts}
          />
          
          
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default HomePage;

export const getServerSideProps = async (ctx) => {
  const { getSessionUser } = await import('@/lib/api/auth');
  await mongooseConnect();
  const recentPosts = await Setting.findOne({ name: 'recentPosts' });
  const featuredProductSetting = await Setting.findOne({ name: 'featuredProductId' });

  const newProducts = await Product.find({}, null, {
    sort: { _id: -1 },
    limit: 10,
  }).select('-keyList -secret');

  let featuredProduct = null;
  if (featuredProductSetting?.value) {
    featuredProduct = await Product.findById(featuredProductSetting.value).select(
      '-keyList -secret'
    );
  }
  if (!featuredProduct && newProducts.length > 0) {
    featuredProduct = newProducts[0];
  }

  const sessionUser = await getSessionUser(ctx.req);
  let wishedNewProducts = [];
  if (sessionUser?.email) {
    wishedNewProducts = await WishedProduct.find({
      userEmail: sessionUser.email,
      product: newProducts.map((p) => p._id.toString()),
    });
  }
  return {
    props: {
      featuredProduct: featuredProduct
        ? JSON.parse(JSON.stringify(featuredProduct))
        : null,
      newProducts: JSON.parse(JSON.stringify(newProducts)),
      wishedNewProducts: wishedNewProducts.map((i) => i.product.toString()),
      
    },
  };
};
