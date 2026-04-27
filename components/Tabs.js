import styled, { css } from 'styled-components';

const StyledTabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 0.83em;
`;
const StyledTab = styled.span`
  font-size: 1.5em;
  @media (max-width: 400px) {
    font-size: 1em;
  }
  cursor: pointer;
  ${props=>props.active ? css`
  color: black;
  border-bottom: 2px solid black;
  `:css`
    color: #aaa;
  `}
`;
const Tabs = ({ tabs, active,onChange }) => {
  return (
    <StyledTabs>
      {tabs.map((tabName, i) => (
        <StyledTab onClick={()=>onChange(tabName)} active={tabName===active} key={i}>{tabName}</StyledTab>
      ))}
    </StyledTabs>
  );
};

export default Tabs;