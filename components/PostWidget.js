import React, { useState } from 'react';
import Link from 'next/link';

import Image from 'next/image';
import styled from 'styled-components';
const Postwidget = styled.div`
  font-weight: 400;
  line-height: 1.8em;
  margin-bottom: 4em;
  flex-basis: 100%;
  max-width: 100%;
  width: 100%;
  padding: 0;
  .postwidget_heading {
    font-size: 1.3em;
    margin-bottom: 1em;
    padding-bottom: 0;
    display: inline-block;
    width: 100%;
    overflow-wrap: break-word;
    font-weight: 700;
    margin-block-start: 1.33em;
    margin-block-end: 1.33em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
  }
  .postwidget_posts {
    overflow-wrap: break-word;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
  .postwidget_post {
    border-bottom: 1px solid rgba(0, 0, 0, 0.17);
    margin: 0;
    list-style: none;
    overflow-wrap: break-word;
    padding: 0.8em 0;
    position: relative;
    text-align: -webkit-match-parent;
    display: block;
    width: auto;
    max-width: 100%;
  }
  .postwidget_post_imageWidget {
    display: flex;
    align-items: center;
    overflow-wrap: break-word;
    width: 100%;
    max-width: 100%;
  }
  .postwidget_post_imageWidget_image {
    flex-basis: 30%;
    min-width: 30%;
    overflow-wrap: break-word;
    margin-right: 10px;
    position: relative;
  }
  .postwidget_post_imageWidget_image {
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    max-width: 30%;
    object-fit: cover;
  }
  .postwidget_post_imageWidget_title {
    flex-basis: 70%;
    max-width: 70%;
    overflow-wrap: break-word;
    font-size: 0.8em;
    font-weight: 700;
    overflow: hidden;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-height: 1.2em;
    max-height: 2.4em;
    transition: all 0.2s ease;
    cursor: pointer;
    overflow-wrap: break-word;
  }
  .postwidget_post_imageWidget_title:hover {
    color: #aaa;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  @media (max-width: 1000px) {
    .postwidget_post_imageWidget_title {
      font-size: 0.7em;
    }
  }
`;
const PostWidget = ({
  slug,

  posts,
}) => {
  const [relatedPosts, setRelatedPosts] = useState(posts);

  return (
    <Postwidget>
      <h4 className='postwidget_heading'>
        {slug ? 'Related Posts' : 'Recent Posts'}
      </h4>
      <ul className='postwidget_posts'>
        {relatedPosts.map((post) => (
          <li key={post.title} className='postwidget_post'>
            <div className='postwidget_post_imageWidget'>
              <div className='postwidget_post_imageWidget_image'>
                <Image
                  fill
                  style={{ objectFit: 'cover' }}
                  src={post.featuredImage.url}
                  alt={post.title}
                />
              </div>

              <h4 className='postwidget_post_imageWidget_title'>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h4>
            </div>
          </li>
        ))}
      </ul>
    </Postwidget>
  );
};

export default PostWidget;
