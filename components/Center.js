import styled, { css } from "styled-components"

const StyledDiv = styled.div`
    margin:0 auto;
    padding: 0 20px;
    ${props=>css`
      max-width: ${props.maxwidth ? props.maxwidth : '800px'};
      padding: ${props.nopadding && '0'}};
    `}
`;

const Center = ({children,maxwidth,nopadding}) => {
  return (
    <StyledDiv maxwidth={maxwidth} nopadding={nopadding}>
        {children}
    </StyledDiv>
  )
}

export default Center