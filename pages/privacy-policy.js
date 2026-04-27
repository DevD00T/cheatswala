import React, { useState, useEffect } from 'react';
import BoardingBanner from '../components/Banner';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import { AboutUsDiv } from './about-us';

const PrivacyPolicy = () => {
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
        title='Privacy Policy - Cheatswala'
        description='
     This Privacy Policy describes how your personal information is collected, used, and shared when you visit, submit information or make a purchase from cheatswala.net (the “Site”).'
        keywords={[
          'Cheatswala',
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
          <AboutUsDiv className='privacy'>
            <BoardingBanner
              image={'priv3.png'}
              title1={'OVERVIEW'}
              title2={'Privacy Policy'}
              buttonStat={false}
              speedY={innerWidth < 500 ? 0 : -24}
            />
            <div className='about_us_content'>
              <div className='about_us_content_left'>
                <div className='about_us_title'>OVERVIEW</div>
                <div className='about_us_titletwo'>
                  Privacy{' '}
                  <span className='about_us_titletwo_facilities'>Policy</span>
                </div>
                <div className='about_us_desc'>
                  <p></p>
                  <p>Cheatswala Privacy Policy</p>
                  <p>
                    Litecheats Technologies (litecheats.com) is the proprietor and owner of the Cheatswala entity.
                  </p>
                  <p>
                    This Privacy Policy describes how your personal information
                    is collected, used, and shared when you visit, submit
                    information or make a purchase from cheatswala.net
                    (the “Site”).
                  </p>
                  <p>PERSONAL INFORMATION WE COLLECT</p>
                  <p>
                    When you visit the Site, we automatically collect certain
                    information about your device, including information about
                    your web browser, IP address, time zone, and some of the
                    cookies that are installed on your device. Additionally, as
                    you browse the Site, we collect information about the
                    individual web pages or products that you view, what
                    websites or search terms referred you to the Site, and
                    information about how you interact with the Site. We refer
                    to this automatically-collected information as “Device
                    Information.”
                  </p>
                  <p>
                    We collect Device Information using the following
                    technologies:
                  </p>
                  <p>
                    – “Cookies” are data files that are placed on your device or
                    computer and often include an anonymous unique identifier.
                    For more information about cookies, and how to disable
                    cookies, visit http://www.allaboutcookies.org.
                    <br />– “Log files” track actions occurring on the Site, and
                    collect data including your IP address, browser type,
                    Internet service provider, referring/exit pages, and
                    date/time stamps.
                    <br />– “Web beacons,” “tags,” and “pixels” are electronic
                    files used to record information about how you browse the
                    Site.
                  </p>
                  <p>
                    Additionally when you submit information, request a quote,
                    make a purchase or attempt to make a purchase through the
                    Site, we collect certain information from you, including
                    your name, address, payment information (including credit
                    card numbers), email address, and phone number. We refer to
                    this information as “Order Information.”
                  </p>
                  <p>
                    When we talk about “Personal Information” in this Privacy
                    Policy, we are talking both about Device Information and
                    Order Information.
                  </p>
                  <p>HOW DO WE USE YOUR PERSONAL INFORMATION?</p>
                  <p>
                    We use the Order Information that we collect generally to
                    fulfill any requests placed through the Site (including
                    arranging your reservation, generating your quote,
                    processing payment information, arranging digital product delivery, and
                    providing you with invoices and/or order confirmations).
                    Additionally, we use this Order Information to:
                    <br />
                    Communicate with you;
                    <br />
                    Screen our orders for potential risk or fraud; and
                    <br />
                    When in line with the preferences you have shared with us,
                    provide you with information or advertising relating to our
                    products or services.
                  </p>
                  <p>
                    We use the Device Information that we collect to help us
                    screen for potential risk and fraud (in particular, your IP
                    address), and more generally to improve and optimize our
                    Site (for example, by generating analytics about how our
                    customers browse and interact with the Site, and to assess
                    the success of our marketing and advertising campaigns). We
                    also use Device Information and Order Information for
                    advertising purposes.
                  </p>
                  <p>SHARING YOUR PERSONAL INFORMATION</p>
                  <p>
                    We share your Personal Information with third parties to
                    help us use your Personal Information, as described above.
                    For example, we use Shopify to power our online store–you
                    can read more about how Shopify uses your Personal
                    Information here: https://www.shopify.com/legal/privacy. We
                    also use Google Analytics to help us understand how our
                    customers use the Site–you can read more about how Google
                    uses your Personal Information here:
                    https://www.google.com/intl/en/policies/privacy/. You can
                    also opt-out of Google Analytics here:
                    https://tools.google.com/dlpage/gaoptout.
                  </p>
                  <p>
                    Finally, we may also share your Personal Information to
                    comply with applicable laws and regulations, to respond to a
                    subpoena, search warrant or other lawful request for
                    information we receive, or to otherwise protect our rights.
                  </p>
                  <p>
                    BEHAVIORAL ADVERTISING
                    <br />
                    As described above, we use your Personal Information to
                    provide you with targeted advertisements or marketing
                    communications we believe may be of interest to you. For
                    more information about how targeted advertising works, you
                    can visit the Network Advertising Initiative’s (“NAI”)
                    educational page at
                    http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work.
                  </p>
                  <p>
                    You can opt out of targeted advertising by:
                    <br />
                    FACEBOOK – https://www.facebook.com/settings/?tab=ads
                    <br />
                    GOOGLE – https://www.google.com/settings/ads/anonymous
                    <br />
                    BING –
                    https://advertise.bingads.microsoft.com/en-us/resources/policies/personalized-ads
                  </p>
                  <p>
                    Additionally, you can opt out of some of these services by
                    visiting the Digital Advertising Alliance’s opt-out portal
                    at: http://optout.aboutads.info/.
                  </p>
                  <p>
                    DO NOT TRACK
                    <br />
                    Please note that we do not alter our Site’s data collection
                    and use practices when we see a Do Not Track signal from
                    your browser.
                  </p>
                  <p>
                    YOUR RIGHTS
                    <br />
                    If you are a European resident, you have the right to access
                    personal information we hold about you and to ask that your
                    personal information be corrected, updated, or deleted. If
                    you would like to exercise this right, please contact us
                    through the contact information below.
                  </p>
                  <p>
                    Additionally, if you are a European resident we note that we
                    are processing your information in order to fulfill
                    contracts we might have with you (for example if you make an
                    order through the Site), or otherwise to pursue our
                    legitimate business interests listed above. Additionally,
                    please note that your information will be transferred
                    outside of India.
                  </p>
                  <p>
                    If you are a West Bengal resident, you may request that we
                    disclose the personal information we collect, use, and
                    disclose about you and you may request to opt-out of the
                    “sale” of your personal data. We do not sell your
                    information in the traditional sense, but we do disclose it
                    to third parties like Google and Facebook for behavioral
                    advertising. If you would like to opt-out you may submit our
                    contact form or call us at 9037410318. We may request
                    additional personal information to verify your identity. We
                    will not discriminate against you for exercising any
                    requests related to the CCPA.
                  </p>
                  <p>
                    DATA RETENTION
                    <br />
                    When you place an order through the Site, we will maintain
                    your Order Information for our records unless and until you
                    ask us to delete this information.
                  </p>
                  <p>
                    MINORS
                    <br />
                    The Site is not intended for individuals under the age of
                    13.
                  </p>
                  <p>
                    CHANGES
                    <br />
                    We may update this privacy policy from time to time in order
                    to reflect, for example, changes to our practices or for
                    other operational, legal or regulatory reasons.
                  </p>
                  <p>
                    CONTACT US
                    <br />
                    For more information about our privacy practices, if you
                    have questions, or if you would like to make a complaint,
                    please contact us by e-mail at support@litecheats.com
                    or by mail using the details provided below:
                  </p>
                  <p>
                    Kolkata, West Bengal
                  </p>
                  <p></p>
                </div>
              </div>
            </div>
          </AboutUsDiv>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default PrivacyPolicy;
