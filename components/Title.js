import styled, { css } from 'styled-components';

const StyledTitle = styled.h1`
  ${(props) =>
    props.marginTopLess &&
    css`
      margin-top: 0;
    `}
  ${(props) =>
    props.marginverticaless &&
    css`
      margin: 0;
    `}
  font-size: 1.5em;
  
`;

const Title = (props) => {
  return <StyledTitle {...props} />;
};

export default Title;
