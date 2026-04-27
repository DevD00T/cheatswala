import styled, { css } from 'styled-components';
import Center from './Center';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import emotstyled from '@emotion/styled';

const Container = styled.div`
  position: fixed;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 99;
  ${(props) => css`
    display: ${props.mobileNavActive ? 'none' : 'block'};
  `}
  transform: translateY(${(props) => (props.showHide ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  color:black;
`;
const Wrapper = styled.div`
  position: relative; // add this
  display: flex;
  justify-content: flex-start;
  align-items: center;
  z-index: 99;
  border-radius: 5px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  padding: 10px;
  background-color: #eee;
  -webkit-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  @media screen and (max-width: 350px) {
    font-size: 0.75rem;
  }
`;
const IconButtonStyled = emotstyled(IconButton)`
  position: absolute;
  top: -80px; // adjust this value to fit your design
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7); // semi-transparent black background
  color: white;
  :hover{
    background-color: rgba(0, 0, 0, 0.5);
  }
`;
const BottomFilter = ({ children, handleClose,showHide }) => {
  return (
    <Container showHide={showHide}>
      <Center>
        <Wrapper>
          <IconButtonStyled onClick={handleClose}>
            <CloseIcon />
          </IconButtonStyled>
          {children}
        </Wrapper>
      </Center>
    </Container>
  );
};

export default BottomFilter;
