import styled, { css } from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
  

  ${(props) =>
    props.normal &&
    css`
      font-size: inherit;
      @media screen and (max-width: 768px) {
        font-size: inherit;
      }
      @media screen and (max-width: 500px) {
        font-size: inherit;
      }
      @media screen and (max-width: 350px) {
        font-size: inherit;
      }
    `}
`;

const Input = (props) => {
  return <StyledInput {...props} />;
};

export default Input;
