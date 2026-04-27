import React, { useState, useEffect } from 'react';
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
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  .about_us_content {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: flex-start;
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
  .about_us_desc p a {
    color: rgb(17, 34, 104);
    cursor: pointer;
    text-decoration: none;
    border-bottom: 2px solid #aaa;
    transition: all 400ms ease-out 0s;
  }
  .about_us_desc p a:hover {
    color: #aaa !important;
    border: none !important;
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
      'Cheatswala: Your Ultimate Destination for Software Keys, Game Keys, and Exclusive App Subscriptions at Unbeatable Prices!',
    url: 'https://www.cheatswala.net/',
  });
  return (
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
        title="Returns and Refunds Policy - Cheatswala"
        description="Understand Cheatswala's Returns and Refunds Policy. Learn how we handle returns and refunds to ensure a hassle-free shopping experience when you purchase from cheatswala.net (the 'Site')."
        keywords={[
          'Cheatswala',
          'Cheatswala Returns',
          'Cheatswala Refunds',
          'Easy Returns Cheatswala',
          'Hassle-Free Refunds Cheatswala',
          'Cheatswala Shopping',
          'Cheatswala Purchase Policy',
          'Online Shopping Returns',
          'E-commerce Refunds Policy'
        ]}
        facebook={{
          image: 'https://www.cheatswala.net/priv3.png',
          url: 'https://www.cheatswala.net',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.cheatswala.net/priv3.png',
          site: '@cheatswala',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <MarginWrapper margintop={'0'}>
        <Center nopadding>
          <AboutUsDiv>
            <BoardingBanner
              image={'thinking.png'}
              title1={'OUR ASSURANCE TO YOU'}
              title2={'Refund Policy'}
              buttonStat={false}
              speedY={innerWidth < 500 ? 0 : -24}
            />
            <div className='about_us_content'>
              <div className='about_us_content_left'>
                <div className='about_us_title'>OUR COMMITMENT TO YOU</div>
                <div className='about_us_titletwo'>
                  Refund{' '}
                  <span className='about_us_titletwo_facilities'>Policy</span>
                </div>
                <div className='about_us_desc'>
                  {/* Insert the new refund policy content here */}
                  <h3>Introduction</h3>
                  <p>Thank you for shopping at Cheatswala. We offer unique digital products that cater to a wide range of interests. Our refund policy is designed to ensure a transparent and fair process for our customers while considering the digital nature of our products.</p>
                  <h3>Delivery of Digital Products:</h3>
                  <p>- Upon successful payment, the digital product will be delivered to the email address provided during the checkout process or the email address associated with the customer&apos;s account.</p>
                  <p>- Please ensure the email address is correct as we cannot be responsible for digital products sent to incorrect email addresses due to customer error.</p>
                  <h3>Refund Eligibility:</h3>
                  <p>- We stand by the quality of our digital products. However, we understand that issues may arise. If you encounter any problem with the product or service, please raise a ticket through our support system. Our team will assist you in resolving the issue promptly.</p>
                  <p>- Direct refunds are available under specific circumstances. If you can provide valid proof that the service you purchased does not work as advertised, you may be eligible for a refund. Valid proof includes, but is not limited to, error messages, screenshots, or detailed descriptions of the issue encountered.</p>
                  <h3>Non-Refundable Circumstances:</h3>
                  <p>- Due to the digital nature of our products, we do not issue refunds for digital products once the order is confirmed and the product is sent.</p>
                  <p>- We do not issue refunds if you change your mind about a purchase or mistakenly purchase a digital product.</p>
                  <h3>Requesting a Refund:</h3>
                  <p>- To request a refund, please submit a ticket through our support system with detailed information about the issue and any valid proof of the problem. Our team will review your request and respond within 12-24 Hours.</p>
                  <p>- If your refund request is approved, the refund will be processed, and a credit will automatically be applied to your original method of payment within 12-24 Hours.</p>
                  <h3>Contact Us:</h3>
                  <p>- If you have any questions about our Refund Policy, please contact us through our support system or email us at support@litecheats.com.</p>
                </div>
              </div>
            </div>
          </AboutUsDiv>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default AboutUS;
