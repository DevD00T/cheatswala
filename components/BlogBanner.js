import React from 'react'
import { ParallaxBanner } from 'react-scroll-parallax';
import { ParallaxProvider } from 'react-scroll-parallax';
import Link from 'next/link';
import styled from 'styled-components';
export const BlogBannerDiv = styled(ParallaxBanner)`
     width:100%;
    height:700px;
    position: relative;
    .header-heading{
    max-height: 768px;
   } 
   .header-heading h3 {
    
    
    margin: 0px;
    
}
.header-heading h1 {
    
    margin: 0px;
 
    
}
.header-heading a{
    outline: none;
    text-decoration: none;
}
   .header-heading h3{
    color: white;
    background-color: rgb(0, 0, 0);
    width: fit-content;
    padding: 0.2em;
}
.header-heading .header-btns a{
    color: white;
    
}
.header-heading h1{
    color: white;
    max-height: 100%;
}
.header-heading h1 span{
    color: black;
    background-color: white;
    padding: 0.01em 0.1em;
}
.blogBanner_category{
    cursor: pointer;
}
.header-heading{
    position: absolute;
    left: 25%;
    top: 55%;
    text-align: left;
    transform: translate(-25%,-55%);
}
@media(max-width:1190px){
    .header-heading{
        max-width: 100%;
    }
    .header-heading{
        position: absolute;
        left: 28%;
        top: 55%;
        text-align: left;
        transform: translate(-25%,-55%);
    }   
}
@media(max-width:970px){
     .header-heading{
        width: 90%;
    }
    .header-heading{
        position: absolute;
        left: 28%;
        top: 55%;
        text-align: left;
        transform: translate(-25%,-55%);
    }
    .header-heading .header-btns{
        justify-content: flex-start;
    }
}
@media(max-width:600px){
    .header-heading{
        width: 90%;
    }
    .header-heading .header-btns{
        justify-content: flex-start;
    }
    .header-heading h3{
        font-size: 1em;
    }
    .header-heading h1{
        font-size: 1.3em;
    }
     .header-heading h1 span{
        font-size: 1.6em;
    }
}
@media(max-width:450px){
    .header-heading h3{
        font-size: 1em;
    }
     .header-heading h1{
        font-size: 1.3em;
    }
    .header-heading h1 span{
        font-size: 1.3em;
    }
}
@media(max-width:300px){
    .header-heading h3{
        font-size: 0.7em;
    }
     .header-heading h1{
        font-size: 1.1em;
    }
     .header-heading h1 span{
        font-size: 1.1em;
    }
}
`
const BlogBanner = ({ image,category,title,createdAt,author,speedY }) => {
    return (
        <ParallaxProvider>
          <BlogBannerDiv
            style={{ aspectRatio: '2 / 1' }}
            layers={[
              { image: `${image}`, speed: speedY  }
            ]}
           >
            <div className="header-heading">
              <Link href={`/blog/category/${category.slug}`}>
              <h3 className='blogBanner_category'>{category.name}</h3>
              </Link>
              <h1><span>{title}</span></h1>
            </div>
          </BlogBannerDiv>
        </ParallaxProvider>
      )
}

export default BlogBanner