import styled, { css } from 'styled-components';

const WhiteBox = styled.div`
  background-color: transparent;
  border-radius: 10px;
  padding: 30px;
  height: fit-content;
  ${(props) =>
    props.white &&
    css`
      background-color: white;
    `}
  @media screen and (max-width: 768px) {
    padding: 22px;
  }
`;

export default WhiteBox;
