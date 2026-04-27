import React from 'react';
import { Link } from 'react-scroll';
import * as AiIcons from 'react-icons/ai';
import * as RiIcons from 'react-icons/ri';
import * as IoIcons from 'react-icons/io';
import styled from 'styled-components';
// import other libraries as needed

// Map the libraries to an object
const iconLibraries = {
  ai: AiIcons,
  ri: RiIcons,
  io: IoIcons,
  // add other libraries as needed
};

const ServiceNavBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
  text-transform: uppercase;
  padding: 0.7em 1.4em;
  flex-wrap: wrap;
box-sizing: border-box;
background-color: #fff;
  .service_navbar_item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
  }
  .service_navbar_item_logo,.service_navbar_item_title{
    display: flex;
    justify-content: center;
    align-items: center;
}
.service_navbar_item_title{
    padding-left: 0.5em;
    font-size: 1em;
    font-weight: 900;
}
.service_navbar_item_logo svg{
    color: #aaa;
    transition: 0.3s all ease;
    font-size: 1.4rem;
    text-align: center;
}
.service_navbar_item:hover .service_navbar_item_logo svg{
    color: #000;
    
}
@media(max-width:450px){
    .service_navbar_item_title{
        font-size: 0.8em;
    }
    .service_navbar_item_logo svg{
        font-size: 1em;
    }
}
@media(max-width:600px){
    .service_navbar_item{
        flex-basis: 50%;
    padding: 0.5em 0.5em;
    }
}
`;

const ServiceNavbar = ({ listoficons }) => {
  return (
    <ServiceNavBarDiv>
      {listoficons.map((item, id) => {
        // Split the icon name into library and icon
        const [library, iconName] = item.logo.split('/');
        // Get the correct library
        const IconLibrary = iconLibraries[library];
        // Get the icon component from the library
        const IconComponent = IconLibrary[iconName];
        return (
          <Link
            key={id}
            smooth={true}
            duration={2000}
            offset={-40}
            to={item.title?.replace(/ /g, '').replace('/', '').toLowerCase()}
          >
            <div className='service_navbar_item'>
              <div className='service_navbar_item_logo'>
                {' '}
                <IconComponent />
              </div>
              <div className='service_navbar_item_title'>{item.title}</div>
            </div>
          </Link>
        );
      })}
    </ServiceNavBarDiv>
  );
};

export default ServiceNavbar;
