import styled from 'styled-components';
import ProductsGrid from './ProductsGrid';


const Title = styled.h2`
  font-size: 2rem;
  margin: 30px 0 20px;
  font-weight: normal;
`;

const NewProducts = ({ products,wishedProducts }) => {
  
  return (
    
      <>
        <Title>Our Products</Title>
        <ProductsGrid products={products} wishedProducts={wishedProducts}/>
        
      </>
   
  );
};

export default NewProducts;
