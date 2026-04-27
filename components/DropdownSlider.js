import React, { useState } from 'react';

import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import styled from 'styled-components';
const DropDownDiv = styled.div`
  position: relative;
  margin: 1em auto;
  width: 100%;
box-sizing: border-box;
  background: transparent;
  border-radius: 15px;
  color: #181818;
  overflow: hidden;
  margin-bottom: 0.3em;
  &.active {
    background: #dadada;
    .dropdown__items {
   visibility: visible;
  
    
  height: auto;
   max-height: 350px;
    opacity: 1;
   transition: max-height 0.7s, opacity 2s, visibility 4s ease;
  
  
  
  }
  }
  .dropdown__text {
    color: #181818;
    padding: 10px 16px;
    cursor: pointer;
    height: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-weight: normal !important;
    height: 100%;
   border: 1px solid #dadada;
    border-radius: 15px;
    
  }
  .dropdown__text svg,
  .separ {
    font-size: 1.2em;
    width: 1.5em;
    height: 1.5em;
    line-height: 1.5;
    margin-right: 0.3em;
  }
  .dropdown__text .dropdown_text_title{
    flex-basis: 90%;
    width: 90%;
    
  }
  .dropdown__text:hover{
    
    background: #dadada;
}
.dropdown__items {
   position: relative;
  visibility: hidden;
  opacity: 0;
   max-height: 0px;
   transition: max-height 0.3s ease;
   display: flex;
   align-items: center;
   justify-content: flex-start;
   padding: 0px 16px 10px 16px;
  }
 
  .dropdown__item {
    cursor: pointer;
   padding: 10px 0px;
   flex-basis: 90%;
   width: 90%;
    
  }
  .dropdown__item:not(:last-child) {
    border-bottom: 1px solid #666;
  
  }
  .dropdown_qlist{
    padding-bottom: 4em;
    padding-top: 4em;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1200px;
    font-family: "Source Sans Pro",Arial,Helvetica,sans-serif;
    color: #181818;
    max-width: calc(100% - 60px);
  }
  .dropdown_item_list li{
    padding:0.5em 0em;
  }
`;
const DropdownSlider = ({ question, answer }) => {
  const [isOpen, setisOpen] = useState(false);

  const handleClick = () => {
    setisOpen((prev) => !prev);
  };

  return (
    <DropDownDiv className={isOpen ? 'active' : ''} onClick={handleClick}>
      <div className='dropdown__text'>
        {isOpen ? <AiOutlineMinusCircle /> : <AiOutlinePlusCircle />}
        <span className='dropdown_text_title'>{question}</span>
      </div>
      <div className='dropdown__items'>
        <div className='separ'></div>
        <div className='dropdown__item'>
          {answer.includes('*') ? (
            <>
              {answer.split('*')[0]}
              <ul className='dropdown_item_list'>
                {answer
                  .split('*')[1]
                  .split(',')
                  .map((item, id) => (
                    <li key={id}>{item}</li>
                  ))}
              </ul>
            </>
          ) : (
            answer
          )}
        </div>
      </div>
    </DropDownDiv>
  );
};

export default DropdownSlider;