import styled, { css } from "styled-components";

export const MarginWrapper = styled.div`
  margin-top: 90px;
  margin-bottom: 20px;
  ${props=>props.margintop && css`
      margin-top: ${props.margintop};
  `}
`;