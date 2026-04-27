import Link from 'next/link';
import React from 'react';
import moment from 'moment';
import { FaFacebookF, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { AiOutlineArrowRight } from 'react-icons/ai';
import styled from 'styled-components';
const PostCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 100%;
  width: 100%;
  overflow-wrap: break-word;

  .postcard_img {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin-bottom: 2em;
    aspect-ratio: 16/9;
  }
  .postcard_header {
    background-color: #222;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
    padding: 20px;
    overflow-wrap: break-word;
    max-width: 100%;
  }
  .postcard_header_arrangement {
    width: 100%;
    overflow-wrap: break-word;
    margin-bottom: 1.2em;
    line-height: 1.4;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    a {
      color: #fff;
      cursor: pointer;
      overflow-wrap: inherit;

      text-decoration: none;
      transition: all 0.2s ease;
    }
    a:hover{
      color: #aaa;
    }
    a:nth-child(2):before {
      background-color: white;
      content: ' ';
      display: inline-block;
      margin: -2px 10px 0;
      letter-spacing: inherit;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      border-top-left-radius: 50%;
      border-top-right-radius: 50%;
      border-bottom-right-radius: 50%;
      border-bottom-left-radius: 50%;
      line-height: inherit;
      vertical-align: middle;
    }
  }

  .postcard_header_title {
    font-weight: 700;
    font-size: 1.95rem;
    line-height: 1.4em;
    overflow-wrap: inherit;
    text-align: center;
    max-width: 100%;
    transition: all 0.2s ease;
    cursor: unset;
    overflow-wrap: break-word;
    max-width: 100%;
    box-sizing: border-box;
    color: white;
  }
  .postcard_header_title:hover {
    color: #aaa;
  }
  .postcard_header_title::after {
    content: ' ';
    display: block;
    margin: 0.55em 0 0.8em;
    border-style: solid;
    border-width: 0 0 2px;
    width: 1.5em;
    pointer-events: none;
  }
  .postcard_header_title:not(:hover)::after {
    color: white;
  }
  .postcard_header_title:hover::after {
    color: #aaa;
  }
  .postcard_dateAuth {
    font-size: 1.1rem;
    line-height: 1.6;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    margin-top: 1em;
    margin-bottom: 2em;
    overflow-wrap: break-word;
  }
  .postcard_dateAuth_date::after {
    content: ' / ';
    padding: 0 0.5em;
  }
  .postcard_excerpt {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.8em;
    margin: 0 0 1em;
    margin-bottom: 2em;
    overflow-wrap: break-word;
  }

  @media (max-width: 780px) {
    .postcard_header_title {
      font-size: 1.5rem;
    }

    .postcard_header_arrangement,
    .postcard_dateAuth {
      font-size: 0.9rem;
    }

    .postcard_excerpt {
      font-size: 0.77em;
    }
  }
  @media (max-width: 450px) {
    .postcard_header_title {
      font-size: 1rem;
    }

    .postcard_header_arrangement,
    .postcard_dateAuth {
      font-size: 0.6rem;
    }

    .postcard_excerpt {
      font-size: 0.57em;
    }
  }
`;
const Postcard = ({
  featuredImage,
  categories,
  subcategories,
  title,
  createdAt,
  author,
  excerpt,
  slug,
}) => {
  return (
    <PostCard>
      <div className='postcard_img'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={featuredImage.url}
          alt={title}
          loading='lazy'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      <div className='postcard_header'>
        <div className='postcard_header_arrangement'>
          <Link href={`/blog/category/${categories[0].slug}`}>
            {categories[0].name}
          </Link>
          <Link
            href={`/blog/category/${categories[0].slug}/${subcategories[0].slug}`}
          >
            {subcategories[0].name}
          </Link>
        </div>
        <h2 className='postcard_header_title'>{title}</h2>
      </div>
      <div className='postcard_dateAuth'>
        <span className='postcard_dateAuth_date'>
          {moment(createdAt).format('MMM DD, YYYY')}
        </span>
        <span className='postcard_dateAuth_author'>by {author.name}</span>
      </div>
      <div className='postcard_excerpt'>{excerpt}</div>
      <div className='postcard_sharing'>
        <div className='postcard_sharing_socialMedia'>
          <div className='postcard_sharing_socialMedia_icon postcard_sharing_socialMedia_facebook'>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://www.cheatswala.net/blog/${slug}`}
              target='_self'
              title='Share on Facebook'
              className='icon icon-expand socialmedia_icon_holder '
            >
              <FaFacebookF />
            </a>
          </div>
          <div className='postcard_sharing_socialMedia_icon postcard_sharing_socialMedia_twitter'>
            <a
              href={`https://twitter.com/intent/tweet?text=https://www.cheatswala.net/blog/${slug}`}
              target='_self'
              title='Share on Twitter'
              className='icon icon-expand socialmedia_icon_holder '
            >
              <FaTwitter />
            </a>
          </div>
          <div className='postcard_sharing_socialMedia_icon postcard_sharing_socialMedia_linkedin'>
            <a
              href={`https://www.linkedin.com/shareArticle?url=https://www.cheatswala.net/blog/${slug}`}
              target='_self'
              title='Share on Linkedin'
              className='icon icon-expand socialmedia_icon_holder'
            >
              <FaLinkedin />
            </a>
          </div>
          <div className='postcard_sharing_socialMedia_icon postcard_sharing_socialMedia_whatsapp'>
            <a
              href={`https://api.whatsapp.com/send?text=https://www.cheatswala.net/blog/${slug}`}
              target='_self'
              title='Share on WhatsApp'
              className='icon icon-expand socialmedia_icon_holder'
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
        <div className='right_contactus_form_inputs_button postcard_sharing_button'>
          <Link href={`/blog/${slug}`}>
            <button className='grow_box jootbol'>
              CONTINUE READING <AiOutlineArrowRight />
            </button>
          </Link>
        </div>
      </div>
    </PostCard>
  );
};

export default Postcard;
