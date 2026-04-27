import styled from 'styled-components';
import ProductBox from './ProductBox';

const StyledProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @media screen and (max-width: 300px) {
    grid-template-columns: 1fr;
  }
`;

const ProductsGrid = ({ products, wishedProducts=[] }) => {
  return (
    <StyledProductsGrid>
      {products?.length > 0 &&
        products.map((product, index) => (
          <ProductBox
            key={product._id}
            {...product}
            index={index}
            wished={wishedProducts.includes(product._id)}
          />
        ))}
    </StyledProductsGrid>
  );
};

export default ProductsGrid;
