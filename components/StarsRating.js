import styled, { css } from 'styled-components';
import StarOutline from './icons/StarOutlne';
import { useState } from 'react';
import StarSolid from './icons/StarSolid';
import { primary } from '@/lib/colors';
const StarsWrapper = styled.div`
  display: flex;
  gap: 3px;

  align-items: center;
`;
const StarWrapper = styled.button`
  display: inline-block;
  height: 1.3rem;
  width: 1.3rem;
  cursor: pointer;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: rgba(255, 164, 28, 255);
  @media screen and (max-width: 768px) {
    height: 1rem;
    width: 1rem;
  }
  ${(props) =>
    props.disabled &&
    css`
      cursor: default;
    `}
  ${(props) =>
    props.size === 'sm' &&
    css`
      height: 1.1rem;
      width: 1.1rem;
      @media screen and (max-width: 768px) {
        height: 0.9rem;
        width: 0.9rem;
      }
    `}
`;
const StarsRating = ({ rating, setRating, disabled, size }) => {
  const five = [1, 2, 3, 4, 5];
  const handleStarClick = (n) => {
    if (!disabled) {
      setRating(n);
    }
  };
  return (
    <StarsWrapper>
      {five.map((n, i) => (
        <StarWrapper
          size={size}
          disabled={disabled}
          key={i}
          onClick={() => handleStarClick(n)}
          aria-label='star'
        >
          {rating >= n ? <StarSolid /> : <StarOutline />}
        </StarWrapper>
      ))}
    </StarsWrapper>
  );
};

export default StarsRating;
