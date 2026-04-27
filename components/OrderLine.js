import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CircularProgress,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from './Button';
import RetryIcon from './icons/Retry';
import axios from 'axios';
import TruckIcon from './icons/Truck';

const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "sans-serif"',
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  fontFamily: theme.typography.fontFamily,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#eee',
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(1),
  },
  wordBreak: 'break-all',
}));

const PaidText = styled(Typography)(({ theme }) => ({
  color: 'red',
  marginTop: theme.spacing(1),
  margin: theme.spacing(1, 0),
  fontWeight: '600',
}));

export const OrderStatusText = styled(PaidText)(({ theme }) => ({
  color: '#19a572',
}));

const AWBStatusText = styled(PaidText)(({ theme }) => ({
  color: '#222',
  fontWeight: '100',
}));

const PaidButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  margin: theme.spacing(1, 0),
}));

const CardContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  flexGrow: 1,
  paddingBottom: theme.spacing(2),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  marginBottom: theme.spacing(2),

  hyphens: 'auto',
}));

const ItemBox = styled(Box)(({ theme, waiting }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: waiting ? 'center' : 'start',
  justifyContent: 'center',
  borderBottom: '1px solid #ddd',
  padding: theme.spacing(1, 0),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: waiting ? 'center' : 'space-between',
    alignItems: 'center',
  },

  hyphens: 'auto',
}));

const TotalBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: '1px solid #ddd',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  hyphens: 'auto',
}));

const UserDetailsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  padding: theme.spacing(1, 1),
  marginBottom: theme.spacing(2),
  backgroundColor: '#fff',
  boxShadow: '0 0 10px rgba(0,0,0,0.15)',
  borderRadius: '10px',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  maxWidth: '100%',

  hyphens: 'auto',
}));

const SingleOrder = ({ line_items = [], createdAt, email, status, awbCode, totalAmount }) => {
  const isExtraSmallScreen = useMediaQuery('(max-width:768px)');

  const itemsTotal = useMemo(() => {
    return line_items.reduce((total, item) => {
      const quantity = Number(item?.quantity) || 0;
      const unitAmount = Number(item?.price_data?.unit_amount) || 0;
      return total + quantity * unitAmount;
    }, 0);
  }, [line_items]);

  const payableTotal = useMemo(() => {
    if (typeof totalAmount === 'number') {
      return totalAmount;
    }
    const parsedAmount = Number(totalAmount);
    if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
      return parsedAmount;
    }
    return itemsTotal;
  }, [itemsTotal, totalAmount]);

  const fontSizeAdjust = useMemo(() => {
    return isExtraSmallScreen ? '0.7rem' : '1rem';
  }, [isExtraSmallScreen]);

  return (
    <ThemeProvider theme={theme}>
      <StyledPaper>
        <Header>
          <Typography
            variant='h6'
            color='#222'
            style={{ fontSize: fontSizeAdjust }}
          >
            Order
          </Typography>
          <Typography
            variant='body2'
            color='#555'
            style={{ fontSize: fontSizeAdjust }}
          >
            {new Date(createdAt).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            ,{' '}
            {new Date(createdAt).toLocaleString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Header>
        {line_items.map((item, i) => (
          <div key={i}>
            <ItemBox>
              <Typography
                variant='body2'
                color='#444'
                style={{ fontSize: fontSizeAdjust, fontWeight: '600' }}
              >
                {item.price_data.product_data.name} (Qty: {item.quantity})
              </Typography>
              <Typography
                variant='body2'
                color='#19a572'
                style={{ fontSize: fontSizeAdjust }}
              >
                ₹ {item.price_data.unit_amount.toFixed(2)}
              </Typography>
            </ItemBox>
            <UserDetailsBox>
              {item.keyList && (
                <>
                  <Typography
                    variant='body2'
                    color='#444'
                    style={{
                      fontSize: fontSizeAdjust,
                      fontWeight: '600',
                    }}
                  >
                    Key(s)
                  </Typography>
                  {item.keyList.map((key, i) => (
                    <Typography
                      variant='body2'
                      color='red'
                      key={key}
                      style={{
                        fontSize: fontSizeAdjust,
                      }}
                    >
                      {key}
                    </Typography>
                  ))}
                </>
              )}
              {item.secret && (
                <>
                  <Typography
                    variant='body2'
                    color='#444'
                    style={{
                      fontSize: fontSizeAdjust,

                      fontWeight: '600',
                    }}
                  >
                    Secret
                  </Typography>

                  <Typography
                    variant='body2'
                    color='red'
                    style={{
                      fontSize: fontSizeAdjust,
                    }}
                  >
                    {item.secret}
                  </Typography>
                </>
              )}
            </UserDetailsBox>
          </div>
        ))}
        <UserDetailsBox>
          <Typography
            variant='body2'
            color='#444'
            style={{
              fontSize: fontSizeAdjust,
              fontWeight: '600',
            }}
          >
            Email for Delivery
          </Typography>
          <Typography
            variant='body2'
            color='#444'
            style={{
              fontSize: fontSizeAdjust,
            }}
          >
            {email}
          </Typography>
        </UserDetailsBox>

        <TotalBox>
          <Typography
            variant='body2'
            color='#444'
            style={{ fontSize: fontSizeAdjust }}
          >
            Total
          </Typography>
          <Typography
            variant='body2'
            color='#19a572'
            style={{ fontSize: fontSizeAdjust }}
          >
            ₹ {payableTotal.toFixed(2)}
          </Typography>
        </TotalBox>
        {awbCode && (
          <ItemBox>
            <AWBStatusText style={{ fontSize: fontSizeAdjust, fontWeight: '600' }} variant='body2'>
              Tracking ID: {awbCode}
            </AWBStatusText>
          </ItemBox>
        )}
        {status === 'Waiting for payment' ? (
          <>
            <ItemBox waiting={1}>
              <OrderStatusText
                style={{
                  fontSize: fontSizeAdjust,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'black',
                }}
                variant='body2'
              >
                <CircularProgress
                  size={isExtraSmallScreen ? 20 : 40}
                  style={{ color: 'black' }}
                />
                {status}
              </OrderStatusText>
            </ItemBox>
          </>
        ) : (
          <ItemBox>
            <OrderStatusText
              style={{ fontSize: fontSizeAdjust }}
              variant='body2'
            >
              {status}
            </OrderStatusText>
          </ItemBox>
        )}
      </StyledPaper>
    </ThemeProvider>
  );
};

export default SingleOrder;
