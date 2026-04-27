import styled, { css } from 'styled-components';

const StyledSub = styled.small`
  color: #aaa;
  ${(props)=>props.smallest && css`
  @media screen and (max-width: 768px) {
    font-size: x-small;
  }
  `}
  ${(props) =>
    props.flex &&
    css`
      display: flex;
      align-items: center;
    `}
  ${(props) =>
    props.input &&
    css`
      margin: 5px 0px 10px 0px;
      @media screen and (max-width: 768px) {
        font-size: 0.7rem;
      }

      input {
        margin-left: 0;
        @media screen and (max-width: 768px) {
          height: 0.7rem;
        }
      }
    `}
  ${(props) =>
  props.bold &&
  css`
    font-weight: bold;
    color:black;
  `}
`;

const SubTitle = (props) => {
  return <StyledSub {...props} />;
};

export default SubTitle;
