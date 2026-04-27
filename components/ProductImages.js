import { useState } from 'react';
import styled from 'styled-components';
import css from 'styled-jsx/css';

const Image = styled.img`
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
`;
const ImageButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-grow: 0;
  margin-top: 10px;
`;
const ImageButton = styled.div`
 border: 2px solid #ccc;
  ${(props) => (props.active ? css`
    border-color:#ccc;

  ` : css`
    border-color: transparent;
    
  `)}
  height: 50px;
  padding: 2px;
  cursor: pointer;
  border-radius: 5px;
  @media screen and (max-width: 768px) {
    height: 40px;
      }
`;
const BigImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  @media screen and (max-width: 768px) {
    max-height: 170px;
      }
`;
const BigImageWrapper = styled.div`
  text-align: center;
`;
const ProductImages = ({ images }) => {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <>
      <BigImageWrapper>
        <BigImage src={images?.[activeImage]} alt='main image'/>
      </BigImageWrapper>
      <ImageButtons>
        {images.map((image, index) => (
          <ImageButton
            active={index === activeImage}
            onClick={() => setActiveImage(index)}
            key={index}
          >
            <Image src={image} alt='other images' />
          </ImageButton>
        ))}
      </ImageButtons>
    </>
  );
};

export default ProductImages;
