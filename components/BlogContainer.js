import styled from 'styled-components';
export const Blog = styled.div`
  &.videoDark {
    background-color: rgb(20, 20, 20);
  }
`;
export const BlogContainer = styled.div`
 
  padding: 2em 10px 2em;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  &.fullWidthMax {
    flex-basis: 100%;
    max-width: 100%;
    width: 100%;
  }
  .postcard_sharing {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 2em;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.8em;
    margin-bottom: 2em;
    max-width: 100%;
  }

  .postcard_sharing_socialMedia,
  .postcard_sharing_button {
    flex-basis: 50%;
    max-width: 50%;
    opacity: 0.4;
  }
  .postcard_sharing_button {
    text-align: right;
    opacity: 1;
    font-size: 0.8em;
  }
  .postcard_sharing_button button {
    font-weight: 400;
    max-width: 100%;
  }
  .postcard_sharing_socialMedia_icon {
    display: inline-block;
    line-height: 1;
    max-width: 100%;
    padding-right: 0em;
  }
  @media (max-width: 780px) {
    .postcard_sharing {
      flex-direction: column;
    }

    .postcard_sharing_socialMedia,
    .postcard_sharing_button {
      flex-basis: 100%;
      max-width: 100%;
    }
    .postcard_sharing_button button {
      font-size: 11px;
    }

    .postcard_sharing_socialMedia {
      padding-bottom: 1em;
    }
  }
  .icon {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 12px;
    margin-right: 12px;
    border-radius: 30px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon::before,
  .icon::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    transition: all 0.25s ease;
    border-radius: 30px;
  }
  .icon svg {
    position: relative;
    color: #ffffff;
    font-size: 20px;
    transition: all 0.25s ease;
  }
  .icon:hover svg {
    color: #2d2c3e;
  }
  .icon-expand::after {
    box-shadow: inset 0 0 0 1px #2d2c3e;
  }
  .icon-expand::before {
    background: #ffffff;
    box-shadow: inset 0 0 0 60px #2d2c3e;
  }
  .icon-expand:hover::before {
    box-shadow: inset 0 0 0 1px #2d2c3e;
  }
  @media (max-width: 360px) {
    .icon {
      width: 30px;
      height: 30px;
    }

    .icon svg {
      font-size: 14px;
    }
  }
`;
export const BlogContainerRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-basis: 100%;
  max-width: 100%;
  width: 100%;
  padding: 0;
`;
export const BlogContainerLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-basis: 100%;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  .right_contactus_form_inputs_button {
    border-radius: 3px;
  }
  .right_contactus_form_inputs_button button {
    background: black;
    padding: 0 3em;
    height: 3em;
    font-size: 1em;
    font-weight: 600;
    letter-spacing: 1px;

    border-radius: 3px;
    color: #fff;

    border: 0.2rem solid black;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  .right_contactus_form_inputs_button button:hover {
    color: black;
  }
  .right_contactus_form_inputs_button button::after {
    content: '';
    background: #ffffff;
    position: absolute;
    z-index: -1;
    padding: 0.85em 0.75em;
    display: block;
  }
  button[class^='grow']::after {
    transition: all 0.2s ease;
  }
  button[class^='grow']:hover::after {
    transition: all 0.2s ease-out;
  }
  button.grow_box::after {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    transform: scale(0, 0);
  }
  button.grow_box:hover::after {
    transform: scale(1, 1);
  }
  .jootbol {
    cursor: pointer;
  }
  @media (max-width: 360px) {
    .jootbol {
      padding: 0 1em !important;
    }
  }
`;
