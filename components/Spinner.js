import styled, { css } from 'styled-components';

const { SyncLoader } = require('react-spinners');

const Wrapper = styled.div`
  ${(props) => (props.fullWidth ? css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 160px;
    width: 100%;
  ` : css``)}
  ${(props) => (props.smaller ? css`
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 100%;
    height: 100%;
    width: 100%;
    padding: 10px 0px;
  ` : css``)}
  ${(props) => (props.justifyend ? css`
    justify-content: end;
    padding: 0;
  ` : css``)}
  
`;

const Spinner = ({ fullWidth,smaller,color,justifyend }) => {
  return (
    <Wrapper fullWidth={fullWidth} smaller={smaller} justifyend={justifyend}>
      <SyncLoader speedMultiplier={1}  color={color ? color:'#555'} size={smaller?4:15}/>
    </Wrapper>
  );
};

export default Spinner;
