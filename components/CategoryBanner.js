import React from 'react'
import { ParallaxProvider } from 'react-scroll-parallax';
import { BlogBannerDiv } from './BlogBanner';
import Link from 'next/link';


const CategoryBanner = ({ category,speedY,parent }) => {
    return (
        <ParallaxProvider>
          <BlogBannerDiv
            style={{ aspectRatio: '2 / 1' }}
            layers={[
              { image: `${category.photo.url}`, speed: speedY  }
            ]}
            >
            <div className="header-heading">
              {parent &&   <Link href={`/blog/category/${parent.slug}`}>
              <h3 className='blogBanner_category'>{parent.name}</h3>
              </Link>}
           
              <h1><span>{category.name}</span></h1>
            </div>
          </BlogBannerDiv>
        </ParallaxProvider>
      )
}

export default CategoryBanner