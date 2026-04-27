import React from 'react';
import { ParallaxBanner } from 'react-scroll-parallax';
import { ParallaxProvider } from 'react-scroll-parallax';
import styled from 'styled-components';

const BoardingBanner = styled(ParallaxBanner)`
  width: 100%;
  height: 768px;
  position: relative;
  
  div:not(.header-heading, .lol) {
    filter: brightness(70%);
  }
  .header-heading {
    position: absolute;
    left: 25%;
    top: 55%;
    text-align: left;
    transform: translate(-25%, -55%);
    h3 {
      color: white;
      font-size: 1.6rem;
      margin: 0px;
    letter-spacing: 2px;
    }
    .header-btns {
      a {
        color: white;
      }
    }
    h1 {
      color: white;
      font-size: 3rem;
    margin: 0px;
    letter-spacing: 2px;
      span {
        color: black;
        background-color: white;
        
        padding: 0.01em 0.1em;
        border-bottom: 2px solid #3d2514;
      }
    }
    h2 {
        font-size: 1.5rem;
    }
    .lol {
      display: flex;
      margin-top: 20px;
      background-color: transparent;
    }
    .smallreview_button {
      a {
        background-color: white;
      }
    }
    @media (max-width: 1190px) {
      max-width: 100%;
      position: absolute;
      left: 38%;
      top: 55%;
      text-align: left;
      transform: translate(-25%, -55%);
      h2 {
        font-size: 1.5rem;
    }
    h1 {
        font-size: 3rem;
    }
    }
    @media (max-width: 970px) {
      position: absolute;
      left: 28%;
      top: 55%;
      text-align: left;
      transform: translate(-25%, -55%);
      .header-btns {
        justify-content: flex-start;
      }
    }
    @media (max-width: 600px) {
      .header-btns {
        justify-content: flex-start;
      }
      h3 {
        font-size: 1em;
      }
      h1 {
        font-size: 1.6em;
      }
      h1 span {
        font-size: 1.6em;
      }
    }
    @media (max-width: 450px) {
      h3 {
        font-size: 1em;
      }
      h1 {
        font-size: 1.3em;
      }
      h1 span {
        font-size: 1.3em;
      }
    }
    @media (max-width: 300px) {
      h3 {
        font-size: 0.7em;
      }
      h1 {
        font-size: 1.1em;
      }
      h1 span {
        font-size: 1.1em;
      }
    }
  }
`;

const Banner = ({ image, title1, title2, title3, speedY }) => {
  return (
    <ParallaxProvider>
      <BoardingBanner
        style={{ aspectRatio: '2 / 1' }}
        layers={[{ image: `/${image}`, speed: speedY }]}
      >
        <div className='header-heading'>
          <h3>{title1}</h3>
          <h1>
            <span>{title2}</span>
            <br /> {title3}
          </h1>
        </div>
      </BoardingBanner>
    </ParallaxProvider>
  );
};

export default Banner;
