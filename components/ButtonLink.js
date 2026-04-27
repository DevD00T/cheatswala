import Link from 'next/link';
import styled from 'styled-components';
import { ButtonStyle } from './Button';

const StyledLink = styled(Link)`
  ${ButtonStyle}
  border-radius: 5px;
  cursor: pointer;
`;
const ButtonLink = (props) => {
  return <StyledLink {...props} />;
};

export default ButtonLink;
