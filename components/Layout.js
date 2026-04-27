import React from 'react';
import Footer from './Footer';
import styled from 'styled-components';
const LayoutDiv = styled.div`
display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
const Layout = ({ children }) => (
  <LayoutDiv>
    {children}
    <Footer />
  </LayoutDiv>
);

export default Layout;