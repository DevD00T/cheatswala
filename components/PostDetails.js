import React, { useEffect } from 'react';
import { RichText } from '@graphcms/rich-text-react-renderer';
import { FaFacebookF, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import SyntaxHighlighter from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/monokai';
import styled from 'styled-components';

//all headings - h2
//subheading - h3
//button - className:button with a tagged text inside
//productLink - for product links
//productPrice - code inside cuts
//dogPawsList - for listing
const Code = styled.code`
  font-family: 'Courier New', Courier, monospace;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  color: #333;
`
const TableContainer = styled.div`
  max-width: 100%;
  overflow-x: scroll;
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:window-inactive {
    background-color: rgba(0, 0, 0, 0.15);
  }
  .table {
    margin-top: 20px;
    width: 100%;
    background-color: white;
    border-radius: 0.125rem;
    overflow-x: auto;
    border: 1px solid black;
    tbody tr:first-child td,tbody tr:not(:first-child,:last-child) td:first-child {
      color: gray;
      font-size: 1.1rem /* 14px */;
      line-height: 1.25rem /* 20px */;
      border-bottom-width: 1px;
      border-color: gray;
      padding-left: 1rem/* 16px */;
    padding-right: 1rem/* 16px */;
    padding-top: 0.5rem/* 8px */;
    padding-bottom: 0.5rem/* 8px */;
    border-bottom: 1px solid gray;
    }
    tbody tr:not(:first-child) td:first-child{
      font-size: 0.8rem;
    }
    tr td{
      padding-left: 1rem/* 16px */;
    padding-right: 1rem/* 16px */;
    padding-top: 0.25rem/* 4px */;
    padding-bottom: 0.25rem/* 4px */;
    border-bottom: 1px solid gray;
    }
    tr td:nth-child(-n+2) {
   border-right: 1px solid gray;
}
tbody tr:last-child td {
  border-bottom: 0px;
}
tbody tr:not(:first-child) td:not(:first-child) {
  text-align: center;
}
  }
`;
const PostDetailsDiv = styled.div`
  *:not(li, ul, ol) {
    margin: 0;
    padding: 0;
  }
  * {
    box-sizing: border-box;
    outline: none;
  }
  max-width: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  color: rgb(79, 85, 117);
  font-weight: 400;
  font-size: 15px;
  line-height: 28px;
  box-sizing: border-box;
  a {
    color: inherit;
    text-decoration: none;
  }
  .whiteColor {
    color: white !important;
  }
  .postDetails_img {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin-bottom: 1em;
  }
  .postDetails_cover_img {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin-bottom: 1em;
    aspect-ratio: 16/9;
  }
  .postDetails_title,
  h2 {
    color: rgb(17, 34, 104);
    font-weight: 800;
    line-height: 30px;
  }
  h2 {
    margin-top: 10px;
    padding-bottom: 10px;
  }
  h3 {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  .postDetails_excerpt {
    margin: 8px 0px;
    text-align: left;
    font-size: 17px;
  }
  p {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  p a:not(.has-image),
  div li a,
  li a {
    cursor: pointer;
    text-decoration: none;
    border-bottom: 2px solid #aaa;
    transition: all 400ms ease-out 0s;
  }
  p a:not(.has-image):hover,
  div li a:hover,
  li a:hover {
    border-bottom: none;
    color: #aaa;
  }
  .button {
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    line-height: 18px;
    background: black;
    border: none;
    color: white;
    padding: 12px 20px;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 500px;
    cursor: pointer;
    transition: all 200ms ease-out 0s;
    height: 48px;
  }
  .button:hover {
    background: #c78005;
  }
  .button p a {
    border: 0;
    transition: none;
  }
  .button p a:hover {
    color: white;
  }
  .productPrice {
    display: inline-block;
    font-size: 24px;
    text-align: left;
    color: rgb(17, 34, 104);
    font-weight: 700;

    line-height: 32px;
  }
  .productPrice p {
    margin-top: 0;
    margin-bottom: 0px;
  }
  .productPrice p code {
    text-decoration: line-through;
    color: rgb(79, 85, 117);
    margin-left: 4px;
  }
  .productLink p {
    margin-bottom: 0;
  }
  .productLink p a {
    color: rgb(17, 34, 104);
    font-size: 24px;
    line-height: 28px;
    font-weight: 800;
    font-family: 'Lexend', sans-serif;
    border-bottom: 2px solid rgb(17, 34, 104) !important;
  }
  .productLink p a:hover {
    color: black !important;
    border: none !important;
  }
  .dogPawsList ul li {
    position: relative;
    list-style-type: none;
    padding-left: 24px;
  }
  .dogPawsList ul li::before {
    content: ' ';
    position: absolute;
    top: 6px;
    left: 0px;
    width: 16px;
    height: 16px;
    background: url('/dogPaws.svg') left top no-repeat;
  }
  .productEmbed {
    background-image: url('/productBackGround.svg');
    width: 100%;
    background-repeat: no-repeat;
    padding: 16px 20px 30px;
    box-sizing: border-box;
  }
  .productEmbed_img {
    position: relative;
    width: 100%;
    float: left;
    padding: 12px;
    margin-bottom: 30px;
    background-color: white;
    border-radius: 8px;
    box-shadow: rgb(0 124 193 / 8%) 0px 4px 20px;
    aspect-ratio: 1/1;
    box-sizing: border-box;
    max-width: 100%;
    overflow: hidden;

    cursor: pointer;
    max-height: 100%;
  }
  .productEmbed_details_title {
    font-size: 24px;
    line-height: 32px;
    text-align: left;
    font-weight: 800;

    margin-bottom: 20px;
    color: rgb(17, 34, 104);
  }
  .productEmbed_details_usage_title {
    font-size: 18px !important;
    line-height: 20px !important;
    text-align: left;
    color: #aaa !important;
    font-weight: 700 !important;

    margin-bottom: 8px;
    margin-top: 0px !important;
    padding-bottom: 0px !important;
  }
  .productEmbed_details_usage {
    font-size: 18px;
    line-height: 28px;
    text-align: left;
    color: rgb(79, 85, 117);
    font-weight: 400;

    margin-bottom: 24px;
  }
  .iframe {
    width: 100%;
    aspect-ratio: 16/9;
  }
  .postcard_sharing .postcard_sharing_socialMedia.alignRight {
    text-align: right;
  }
  .postcard_sharing .postcard_sharing_socialMedia.darkColor {
    color: rgb(17, 34, 104);
    font-weight: 700;
  }
  .postcard_sharing .postcard_sharing_socialMedia.whiteColor {
    color: rgb(177, 183, 208);
    font-weight: 700;
  }
  @media (min-width: 1024px) {
    .productEmbed {
      background-position: left 60px;
      background-size: 380px;
    }
    .productEmbed_img {
      width: 222px;
      margin-right: 24px;
    }
  }
  @media (min-width: 768px) {
    .productEmbed {
      padding: 16px 25px 30px;
    }
    .productEmbed_img {
      width: 229px;
      margin-right: 20px;
    }
  }
`;
const PostDetails = ({ post }) => {
  const slug = post.slug;

  return (
    <PostDetailsDiv>
      {post.videoPost ? (
        <>
          <RichText
            content={post.content.raw}
            references={post.content.references}
            renderers={{
              embed: {
                Product: ({ name, usage, photo, price, url, market }) => {
                  return (
                    <div className='productEmbed'>
                      <div className='productEmbed_img'>
                        <a href={url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={name}
                            loading='lazy'
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </a>
                      </div>
                      <div className='productEmbed_details'>
                        <a href={url}>
                          <div className='productEmbed_details_title'>
                            {name}
                          </div>
                        </a>
                        <h2 className='productEmbed_details_usage_title'>
                          Why We Love It:
                        </h2>
                        <div className='productEmbed_details_usage'>
                          {usage}
                        </div>
                        <div className='button'>
                          <p>
                            <a
                              href={url}
                            >{`Buy from ${market} for Rs.${price}`}</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                },
              },
              code_block: ({ children }) => {
                return (
                  <SyntaxHighlighter
                    lineProps={{
                      style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                    }}
                    wrapLines={true}
                    language='javascript'
                    style={docco}
                  >
                    {children.text}
                  </SyntaxHighlighter>
                );
              },
              img: ({ src, title, width, height }) => {
                return (
                  <div
                    style={{ aspectRatio: width / height }}
                    className='postDetails_img'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={title}
                      loading='lazy'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                );
              },
              table: ({ children }) => {
                return (
                  <TableContainer>
                    <table className='table'>{children}</table>
                  </TableContainer>
                );
              },
              bold: ({ children }) => {
                return <b style={{color:'black',background:'yellow'}}>{children}</b>;
              }
            }}
          />
          <h1 className='postDetails_title whiteColor'>{post.title}</h1>
          <h2 className='postDetails_excerpt whiteColor'>{post.excerpt}</h2>
        </>
      ) : (
        <>
          <h1 className='postDetails_title'>{post.title}</h1>
          <h2 className='postDetails_excerpt'>{post.excerpt}</h2>
          {!post.featuredPost && (
            <div className='postDetails_cover_img'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage.url}
                alt={post.title}
                loading='lazy'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )}
          <RichText
            content={post.content.raw}
            references={post.content.references}
            renderers={{
              embed: {
                Product: ({ name, usage, photo, price, url, market }) => {
                  return (
                    <div className='productEmbed'>
                      <div className='productEmbed_img'>
                        <a href={url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={name}
                            loading='lazy'
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </a>
                      </div>
                      <div className='productEmbed_details'>
                        <a href={url}>
                          <div className='productEmbed_details_title'>
                            {name}
                          </div>
                        </a>
                        <h2 className='productEmbed_details_usage_title'>
                          Why We Love It:
                        </h2>
                        <div className='productEmbed_details_usage'>
                          {usage}
                        </div>
                        <div className='button'>
                          <p>
                            <a
                              href={url}
                            >{`Buy from ${market} for Rs.${price}`}</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                },
              },
              code_block: ({ children }) => {
                return (
                  <SyntaxHighlighter
                    lineProps={{
                      style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                    }}
                    wrapLines={true}
                    language='javascript'
                    style={docco}
                  >
                    {children.props.content[0].text}
                  </SyntaxHighlighter>
                );
              },
              img: ({ src, title, width, height }) => {
                return (
                  <div
                    style={{ aspectRatio: width / height }}
                    className='postDetails_img'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={title}
                      loading='lazy'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                );
              },
              table: ({ children }) => {
                return (
                  <TableContainer>
                    <table className='table'>{children}</table>
                  </TableContainer>
                );
              },
              code: ({ children }) => {
                return <Code>{children}</Code>;
              },
              bold: ({ children }) => {
                return <b style={{color:'black',background:'yellow'}}>{children}</b>;
              }
            }}
          />
        </>
      )}
      <div className='postcard_sharing'>
        <div
          className={`postcard_sharing_socialMedia ${
            post.videoPost ? 'whiteColor' : 'darkColor'
          }`}
        >
          SHARE THIS POST
        </div>
        <div className='postcard_sharing_socialMedia alignRight'>
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
      </div>
    </PostDetailsDiv>
  );
};

export default PostDetails;
