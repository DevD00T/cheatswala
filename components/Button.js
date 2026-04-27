import { primary } from '@/lib/colors';
import styled, { css } from 'styled-components';
export const ButtonStyle = css`
  border: 0;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  text-decoration: none;
  font-weight: 500;
  svg {
    height: 16px;
    margin-right: 5px;
  }
  ${(props) =>
    props.reduceSizeScreen &&
    css`
      width: 30%;
      max-width: 30%;
      justify-content: center;
      padding: 1% 0px;
      @media screen and (max-width: 768px) {
        font-size: 0.7rem;
      }
      @media screen and (max-width: 500px) {
        font-size: 0.6rem;
      }
      @media screen and (max-width: 350px) {
        font-size: 0.5rem;
      }
    `}
  ${(props) =>
    props.reduceSizeScreenOnlyFont &&
    css`
      padding: 2px 7px;
      @media screen and (max-width: 768px) {
        font-size: 0.7rem;
      }
      @media screen and (max-width: 500px) {
        font-size: 0.6rem;
      }
      @media screen and (max-width: 350px) {
        font-size: 0.5rem;
      }
    `}
  ${(props) =>
    props.reducesizescreennormal &&
    css`
      @media screen and (max-width: 768px) {
      }
      @media screen and (max-width: 500px) {
      }
      @media screen and (max-width: 350px) {
        font-size: 0.8rem;
      }
    `}

  ${(props) =>
    props.block &&
    css`
      display: block;
      width: 100%;
    `}
  ${(props) =>
    props.blockOnlyMobileScreen &&
    css`
      @media screen and (max-width: 768px) {
        display: block;
        width: 100%;
      }
    `}
  ${(props) =>
    props.white &&
    !props.outline &&
    css`
      background-color: #fff;
      color: #000;
    `}
  ${(props) =>
    props.white &&
    props.outline &&
    css`
      background-color: transparent;
      color: #fff;
      border: 1px solid white;
    `}
  ${(props) =>
    props.white &&
    props.outline &&
    props.shadow &&
    !props.disabled &&
    css`
      background-color: white;
      color: #000;
      -webkit-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      -moz-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
      padding: 2px 5px;
      justify-content: space-between;
      
    `}
  ${(props) =>
    props.white &&
    props.outline &&
    props.shadow &&
    props.disabled &&
    css`
      background-color: white;
      color: #000;
      -webkit-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      -moz-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
      justify-content: space-between;
      
    `}
  ${(props) =>
    props.paddingreset &&
    css`
      padding: 5px 15px; ;
      
    `}
  ${(props) =>
    props.white &&
    props.disabled &&
    css`
      background-color: #fff;
      color: #000;
      opacity: 0.6;
      font-weight: 300;
      cursor: not-allowed !important;
      -webkit-box-shadow: 0px 1px 2px 0px rgba(255, 255, 255, 0.5);
      -moz-box-shadow: 0px 1px 2px 0px rgba(255, 255, 255, 0.5);
      box-shadow: 0px 0px 2px 0px rgba(255, 255, 255, 0.5);
    `}
  ${(props) =>
    props.white &&
    props.outline &&
    props.shadow &&
    props.disabled &&
    css`
    background-color: transparent;
      color: #000;
      opacity: 0.6;
      font-weight: 300;
      cursor: not-allowed !important;
      -webkit-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      -moz-box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.5);
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
    `}
  
  ${(props) =>
    props.removeRightBorder &&
    css`
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    `}
  ${(props) =>
    props.removeLeftBorder &&
    css`
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    `}
  ${(props) =>
    props.black &&
    !props.outline &&
    css`
      background-color: #000;
      color: #fff;
    `}
  ${(props) =>
    props.black &&
    props.outline &&
    css`
      background-color: transparent;
      color: #000;
      border: 1px solid #000;
    `}
    ${(props) =>
    props.green &&
    props.added &&
    !props.outline &&
    css`
      background-color: #19a572;
      color: #fff;
      transition: 0.3s all ease;
    `}
  ${(props) =>
    props.green &&
    props.outline &&
    css`
      background-color: transparent;
      color: #19a572;
      border: 1px solid #dadada;
    `}
  
  ${(props) =>
    props.red &&
    props.outline &&
    css`
      background-color: transparent;
      color: red;
      border: 1px solid red;
      font-size: 1rem;
    `}
  ${(props) =>
    props.green &&
    !props.added &&
    !props.outline &&
    css`
      background-color: #19a572;
      color: #fff;
      border: 1px solid transparent;
      border-radius: 0;
      cursor: default;
    `}
  ${(props) =>
    props.primary &&
    !props.outline &&
    css`
      background-color: ${primary};
      color: #fff;
      border: 1px solid ${primary};
    `}
  ${(props) =>
    props.primary &&
    props.outline &&
    css`
      background-color: transparent;
      color: ${primary};
      border: 1px solid ${primary};
    `}
  ${(props) =>
    props.size === 'l' &&
    css`
      font-size: 1.2rem;
      padding: 10px 20px;
      svg {
        height: 20px;
      }
    `}
  ${(props) =>
    props.disabledbutton &&
    css`
      opacity: 0.6;
    `}
`;
const StyledButton = styled.button`
  ${ButtonStyle}
`;

const Button = ({ children, ...rest }) => {
  return <StyledButton {...rest}>{children}</StyledButton>;
};

export default Button;
