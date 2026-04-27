import React from 'react';
import styled from 'styled-components';
import Center from './Center';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
const Bg = styled.div`
  background-color: #222;
  color: #fff;
  padding-top: 30px;
  padding-bottom: 160px;
  margin-top: auto;
`;
const FooterDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const FooterLinks = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  @media (max-width: 400px) {
    flex-direction: column;
  }
  @media (max-width: 360px) {
    font-size: 14px;
  }
  a {
    text-decoration: none;
    color: #aaa;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      color: white;
    }
  }
  
`;
const EachList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  flex: 1;
`;
const SocialMediaLinks = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.8em;
  margin-top: 2em;
  max-width: 100%;
  a {
    text-decoration: none;
    outline: none;
    cursor: pointer;
  }
  .postcard_sharing_socialMedia {
    flex-basis: 100%;
    max-width: 100%;
    opacity: 0.4;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .postcard_sharing_socialMedia_icon {
    display: inline-block;
    line-height: 1;
    max-width: 100%;
    padding-right: 0em;
  }
  .icon {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 12px;
    margin-right: 12px;
    border-radius: 30px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon::before,
  .icon::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    transition: all 0.25s ease;
    border-radius: 30px;
  }
  .icon svg {
    position: relative;
    color: #ffffff;
    font-size: 20px;
    transition: all 0.25s ease;
  }
  .icon:hover svg {
    color: #2d2c3e;
  }
  .icon-expand::after {
    box-shadow: inset 0 0 0 1px #aaa;
  }
  .icon-expand::before {
    background: #ffffff;
    box-shadow: inset 0 0 0 60px #2d2c3e;
  }
  .icon-expand:hover::before {
    box-shadow: inset 0 0 0 1px #2d2c3e;
  }
  @media (max-width: 360px) {
    .icon {
      width: 30px;
      height: 30px;
    }

    .icon svg {
      font-size: 14px;
    }
  }
`;
const FooterNote = styled.div`
  margin-top: 1em;
  color: #aaa;
  cursor: default;
  user-select: none;
  text-align: center;
  @media (max-width: 360px) {
    font-size: 14px;
  }
`
const FooterLink =  styled(Link)`
${(props)=>props.$active && css`
    color: white !important;
  `}
`
const lists = [
  [
    { title: 'About Us', link: '/about-us' },
    { title: 'Terms & Conditions', link: '/terms-and-conditions' },
  ],
  [
    { title: 'Privacy Policy', link: '/privacy-policy' },
    { title: 'Refund Policy', link: '/refund-policy' },
  ],
];
const socialMediaLinks = [
  {
    title: 'Telegram',
    link: 'https://t.me/+h3NOISYqpiowNTJl',
    logo: <FaTelegram />,
  },
  {
    title: 'Instagram',
    link: 'https://www.instagram.com/cheatswala/',
    logo: <FaInstagram />,
  },
  {
    title: 'Youtube',
    link: 'https://www.youtube.com/channel/UCV3NTWFbL4esvAwu15DU6jA',
    logo: <FaYoutube />,
  },
];
const Footer = () => {
  return (
    <Bg>
      <Center>
        <FooterDiv>
          <FooterLinks>
            {lists.map((list, index) => (
              <EachList key={index}>
                {list.map((item, index) => (
                  <Link key={index} href={item.link}>
                    {item.title}
                  </Link>
                ))}
              </EachList>
            ))}
          </FooterLinks>
          <SocialMediaLinks>
            <div className='postcard_sharing_socialMedia'>
              {socialMediaLinks.map((item, index) => (
                <div
                  key={item.title + index}
                  className='postcard_sharing_socialMedia_icon'
                >
                  <a
                    href={item.link}
                    target='_self'
                    className='icon icon-expand socialmedia_icon_holder '
                  >
                    {item.logo}
                  </a>
                </div>
              ))}
            </div>
          </SocialMediaLinks>
          <FooterNote>
            © 2023 Cheatswala. All rights reserved.
          </FooterNote>
          <FooterNote>
            ✓ Secured Payments- UPI, CRYPTO.
          </FooterNote>
        </FooterDiv>
      </Center>
    </Bg>
  );
};

export default Footer;
