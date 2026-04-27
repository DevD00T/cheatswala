import React from 'react';
import DropdownSlider from './DropdownSlider';
import styled from 'styled-components';

  const BoardingServices = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 2em;
    box-sizing: border-box;
    .boardingServices_title {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #222;
      width: 100%;
      color: #fff;
      text-align: center;
      font-size: 1.8em;
      font-weight: 600;
      padding: 1.2em;
      box-sizing: border-box;
    }
    .boardingServices_productList {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 4em;
      padding-top: 2em;
      width: 100%;
      max-width: calc(100% - 60px);
      flex-wrap: wrap;
      margin-left: -20px;
      margin-right: -20px;
    }
    @media (max-width: 1000px) {
      .boardingServices_productList {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        padding-bottom: 4em;
        padding-top: 2em;
        width: 100%;
        max-width: calc(100% - 60px);
        flex-wrap: wrap;
        margin-left: -20px;
        margin-right: -20px;
      }
    }
    @media (max-width: 320px) {
      .boardingServices_title {
        font-size: 1.4em;
      }
    }
    .dropdown_qlist {
      padding-bottom: 4em;
      padding-top: 4em;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
      color: #181818;
      max-width: calc(100% - 60px);
    }
  `;
const FaqServices = ({ faqCategory, qanda }) => {
  return (
    <BoardingServices
      id={faqCategory?.replace(/ /g, '').replace('/', '').toLowerCase()}
    >
      <div className='boardingServices_title'>{faqCategory}</div>
      <section className='boardingServices_productList dropdown_qlist'>
        {qanda.map((q) => (
          <DropdownSlider
            key={q.question}
            question={q.question}
            answer={q.answer}
          />
        ))}
      </section>
    </BoardingServices>
  );
};

export default FaqServices;
