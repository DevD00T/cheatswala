import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  
  th{
    text-align: left;
    text-transform: uppercase;
    color:#ccc;
    font-weight: 600;
    font-size: 0.7rem;
    @media screen and (max-width: 768px) {
      font-size: 0.6rem;
  }
    @media screen and (max-width: 350px) {
      font-size: 0.5rem;
  }
  }
  td{
    border-top: 1px solid rgba(0,0,0,0.1);
  }
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
  }
  @media screen and (max-width: 350px) {
    font-size: 0.5rem;
  }
`;
const Table = (props) => {
  return <StyledTable {...props} />;
};

export default Table;
