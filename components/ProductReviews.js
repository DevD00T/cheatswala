import styled from 'styled-components';
import Input from './Input';
import WhiteBox from './WhiteBox';
import StarsRating from './StarsRating';
import TextArea from './Textarea';
import { ButtonWrapper } from '@/pages/product/[slug]';
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SnackBarContext } from './SnackbarContext';
import Spinner from './Spinner';
import Head from 'next/head';

const Title = styled.h2`
  font-size: 1.2rem;

  @media screen and (max-width: 768px) {
    font-size: 1rem;
  }
`;
const Subtitle = styled.h3`
  font-size: 1rem;
  margin-top: 5px;
  @media screen and (max-width: 768px) {
    font-size: 0.8rem;
  }
`;
const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const StarBox = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 5px;
`;
const RatingTitle = styled.div`
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
const ReviewWrapper = styled(RatingTitle)`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-radius: 5px;
  border: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  &:last-of-type {
    border-bottom: 0px;
  }
`;
const ButtonFlex = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  flex-direction: column;
  align-items: flex-start;

  time {
    font-weight: 600;
    color: #aaa;
    opacity: 0.7;
    font-size: 0.7rem;
    @media screen and (max-width: 768px) {
      font-size: 0.6rem;
    }
  }
`;
const TitleWrapper = styled.div`
  font-weight: 600;
  color: #333;
  line-height: 1rem;
  margin: 3px 0px;
`;
const DescriptionWrapper = styled.div`
  font-size: 0.8em;
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
  color: #555;
`;
const ReviewOuterWrapper = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;
const Userbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  word-wrap: break-word;
`;
const Imagebox = styled.div`
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  img {
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    object-fit: cover;
  }
  background-color: #eee;
  border: 1px solid #eee;
  @media screen and (max-width: 768px) {
    height: 29px;
  }
`;
const ProductReviews = ({ product }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const { snackBarOpen } = useContext(SnackBarContext);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');

  const getProductReviews = useCallback(
    async (source) => {
      try {
        setReviewsLoading(true);
        const response = await axios.get(
          `/api/reviews?product=${product._id}`,
          {
            cancelToken: source?.token,
          }
        );
        setReviews(response.data);
        setReviewsLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          const err = error?.response?.data?.message || error?.message;
          snackBarOpen(err, 'error');
        }
      }
    },
    [product, snackBarOpen]
  );

  const checkEligibility = useCallback(
    async (source) => {
      try {
        setEligibilityLoading(true);
        const response = await axios.get(
          `/api/eligibility?product=${product._id}`,
          {
            cancelToken: source?.token,
          }
        );
        setIsEligible(response.data.eligibility);
        setEligibilityMessage(response.data.message);
        setEligibilityLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          const err = error?.response?.data?.message || error?.message;
          snackBarOpen(err, 'error');
        }
      }
    },
    [product, snackBarOpen]
  );

  useEffect(() => {
    const source = axios.CancelToken.source();

    getProductReviews(source);

    return () => {
      source.cancel();
    };
  }, [getProductReviews]);
  useEffect(() => {
    const sourceEleg = axios.CancelToken.source();

    checkEligibility(sourceEleg);

    return () => {
      sourceEleg.cancel();
    };
  }, [checkEligibility]);
  const submitReview = async () => {
    const data = { title, description, rating, product: product._id };

    try {
      const review = await axios.post('/api/reviews', data);
      setTitle('');
      setDescription('');
      setRating(0);
      if (review) {
        snackBarOpen('Review posted successfully', 'success');
        await getProductReviews();
        await checkEligibility();
      }
    } catch (error) {
      const err = error?.response?.data?.message || error?.message;
      snackBarOpen(err, 'error');
    }
  };
  const addProductReviews = (reviews) => {
    const reviewItems = reviews.map((review) => ({
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Product',
        name: product.title,
        image: `${product.images[0]}`,
        description: `${product.description.toString().replace(/\n/g, ' ')}`,
        sku: `${product._id}`,
        brand: {
          '@type': 'Brand',
          name: `${product.brand}`,
        },
        offers: {
          '@type': 'Offer',
          price: `${product.price}`,
          priceCurrency: 'INR',
          availability: `${product.stock > 0 ? 'InStock' : 'OutOfStock'}`,
        },
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
      },
      author: {
        '@type': 'Person',
        name: review.user?.name,
      },
      datePublished: new Date(review.createdAt).toISOString(),
      description: review.description,
    }));

    return {
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: reviewItems,
      }),
    };
  };

  return (
    <div>
      {reviews.length > 0 && (
        <Head>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={addProductReviews(reviews)}
            key={'reviews-jsonld'}
          />
        </Head>
      )}
      <Title>Reviews</Title>
      <ColsWrapper>
        <WhiteBox white>
          <Subtitle>Add a review</Subtitle>
          {eligibilityLoading ? (
            <Spinner fullWidth />
          ) : isEligible ? (
            <>
              <StarBox>
                <RatingTitle>Rating:</RatingTitle>
                <StarsRating rating={rating} setRating={setRating} />
              </StarBox>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='One-Line Experience Summary'
              />
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={`Share your detailed experience. What benefits did you get from the product? Any drawbacks?`}
              />
              <hr />
              <ButtonFlex>
                <ButtonWrapper black onClick={submitReview}>
                  Submit
                </ButtonWrapper>
              </ButtonFlex>
            </>
          ) : (
            <RatingTitle>{eligibilityMessage}</RatingTitle>
          )}
        </WhiteBox>
        <WhiteBox white>
          <Subtitle>All reviews</Subtitle>

          <ReviewOuterWrapper>
            {reviewsLoading ? (
              <Spinner fullWidth />
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewWrapper key={review._id}>
                  {review.user && (
                    <Userbox>
                      <Imagebox>
                        <img
                          src={review?.user?.image}
                          alt={review?.user?.name}
                        />
                      </Imagebox>
                      <RatingTitle>{review?.user?.name}</RatingTitle>
                    </Userbox>
                  )}
                  <ReviewHeader>
                    <StarsRating
                      size='sm'
                      disabled={true}
                      rating={review.rating}
                    />
                  </ReviewHeader>
                  <div>
                    <ReviewHeader>
                      <TitleWrapper>{review.title}</TitleWrapper>
                      <time>
                        {new Date(review.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        ,{' '}
                        {new Date(review.createdAt).toLocaleString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </ReviewHeader>
                    <DescriptionWrapper>
                      {review.description}
                    </DescriptionWrapper>
                  </div>
                </ReviewWrapper>
              ))
            ) : (
              <RatingTitle>No reviews</RatingTitle>
            )}
          </ReviewOuterWrapper>
        </WhiteBox>
      </ColsWrapper>
    </div>
  );
};

export default ProductReviews;
