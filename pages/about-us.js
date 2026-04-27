import React, { useState, useEffect } from 'react';
import { ParallaxProvider } from 'react-scroll-parallax'; 
import BoardingBanner from '../components/Banner';
import DropdownSlider from '../components/DropdownSlider';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import styled from 'styled-components';
export const AboutUsDiv = styled.div`
  * {
    box-sizing: border-box;
    max-width: 100%;
    overflow-wrap:break-word ;
    word-wrap: break-word;
  }
  box-sizing: border-box;
  overflow-wrap:break-word ;
    word-wrap: break-word;
  .about_us_content {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 3em 1em;
    color: #3d3a28;
    flex-direction: column;
    box-sizing: border-box;
  }
  .about_us_content_left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-right: 0em;
  }
  .about_us_title {
    font-size: 1rem;
    margin-bottom: 1.2em;
    line-height: 1.4;
    font-weight: 700;
  }
  .about_us_titletwo,
  .about_us_titletwo_facilities {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.4em;
  }
  .about_us_titletwo_facilities {
    color: red;
  }
  .about_us_desc {
    margin-top: 2em;
    width: 100%;
  }
  .about_us_desc p {
    font-size: 14px;
    max-width: none;
    color: #181818;

    font-weight: 400;
    line-height: 1.8em;
    margin-bottom: 1em;
  }
  .about_us_content_right {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .about_us_content_right [class^='dropdown'] span {
    font-weight: bolder;
    font-size: 14px !important;
  }
  .about_us_content_right [class^='dropdown'] svg {
    font-size: 16px !important;
  }
  .about_us_content_right [class^='dropdown'] {
    font-size: 14px !important;

    width: 100%;
  }
  &.privacy {
    .about_us_content .about_us_content_left .about_us_desc p {
      max-width: 1000px;
    }
  }
`;
const AboutUS = () => {
  const [innerWidth, setinnerWidth] = useState(0);

  useEffect(() => {
    setinnerWidth(window.innerWidth);
    window.addEventListener('resize', changeWidth);
  }, []);

  const changeWidth = () => {
    if (window) {
      setinnerWidth(window.innerWidth);
    }
  };
  const schemaData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Cheatswala',
    image: 'https://www.cheatswala.net/cheatswalakumar.png',
    '@id': 'https://www.cheatswala.net/',
    url: 'https://www.cheatswala.net/',
    telephone: '',
    priceRange: 'INR',
    
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '05:30',
      closes: '17:30',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '0',
      ratingCount: '128',
    },
  });
  const schemeData2 = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cheatswala',
    description:
      'Unlocking Boundless Potential: Cheatswala, Your Gateway to Gaming Supremacy!',
    url: 'https://www.cheatswala.net/',
  });
  return (
    <ParallaxProvider>
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: schemaData }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: schemeData2 }}
        />
      </Head>
      <SEO
        title='About Us - Cheatswala'
        description='Cheatswala: Your Ultimate Destination for Software Keys, Game Keys, and Exclusive App Subscriptions at Unbeatable Prices!'
        keywords={[
          'Cheats',
          'Cheatswala India',
          'OTT Subscriptions',
          'Premium Keys',
          'Game Keys',
          'Gaming Softwares',
          'Cheat paradise',
          'online store',
          'OG PRODUCTS',
        ]}
        facebook={{
          image: 'https://www.cheatswala.net/aboutus.png',
          url: 'https://www.cheatswala.net/about-us',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.cheatswala.net/aboutus.png',
          site: '@cheatswala',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <MarginWrapper margintop={'0'}>
        <Center nopadding>
          <AboutUsDiv>
            <BoardingBanner
              image={'aboutus.png'}
              title1={'ABOUT US'}
              title2={'Cheatswala'}
              title3={'For Keys,Subscription,Games'}
              buttonStat={false}
              speedY={innerWidth < 500 ? 0 : -24}
            />
            <div className='about_us_content'>
              <div className='about_us_content_left'>
                <div className='about_us_title'>WHO WE ARE</div>
                <div className='about_us_titletwo'>
                  Game changing softwares and products.{' '}
                  <span className='about_us_titletwo_facilities'>
                  Unlocking Boundless Potential: Cheatswala, Your Gateway to Gaming Supremacy!
                  </span>
                </div>
                <div className='about_us_desc'>
                  <p>
                  {'"'}Discover Cheatswala: Your One-Stop Shop for Cutting-Edge Software Keys, Game Keys, and Exclusive Subscriptions at Unmatched Value!{'"'}
                  </p>
                  <p>
                  Welcome to Cheatswala, the premier destination for all your software needs. 
                  We take pride in offering a vast array of software keys, game keys, and exclusive subscriptions to websites and apps, all meticulously curated to cater to your every digital desire.
                  </p>
                  <p>
                  With Cheatswala, unlocking the full potential of your digital experiences has never been easier. Whether you{"'"}re a passionate gamer seeking the latest game releases or an avid user of specialized software, we{"'"}ve got you covered. 
                  Our extensive collection boasts a wide range of options, from popular titles to niche applications, all at competitive prices that are hard to resist.
                  </p>
                </div>
              </div>
              <div className='about_us_content_right'>
                <DropdownSlider
                  question='SERVICE'
                  answer={`At Cheatswala, we believe in giving the best as always.`}
                />
                <DropdownSlider
                  question={'QUALITY'}
                  answer={`We prioritize quality in every product we offer, Best support and developers we have ready for your cheat needs always.`}
                />
              </div>
            </div>
          </AboutUsDiv>
        </Center>
      </MarginWrapper>
    </Layout>
    </ParallaxProvider>
  );
};

export default AboutUS;
