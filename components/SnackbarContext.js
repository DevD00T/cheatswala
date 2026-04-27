import { Snackbar } from '@mui/material';
import React,{ createContext, useState } from 'react';
import emotstyled from '@emotion/styled';
import MuiAlert from '@mui/material/Alert';
const StyledMuiAlert = emotstyled(MuiAlert)`
display:flex;
align-items:center;

  max-width:fit-content;
  .MuiAlert-action{
    padding:0;
    margin-left:12px;
    button{
      padding-left:0;
      padding-right:0;
    }
  }
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
    svg {
      width: 20px; // Adjust as needed
      height: 20px; // Adjust as needed
    }
  }
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
    svg {
      width: 18px; // Adjust as needed
      height: 18px; // Adjust as needed
    }
  }
  @media screen and (max-width: 350px) {
    font-size: 0.5rem;
    svg {
      width: 16px; // Adjust as needed
      height: 16px; // Adjust as needed
    }
  }
`;
export const SnackBarContext = createContext({});
const Alert = React.forwardRef(function Alert(props, ref) {
  return <StyledMuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});
export const SnackBarContextProvider = ({ children }) => {
  const [snackbar, setsnackbar] = useState(false);
  const [snackbarmessage, setsnackbarmessage] = useState('');
  const [severity,setSeverity]=useState('');
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setsnackbar(false);
  };
  const snackBarOpen = (message,severity) => {
    setsnackbarmessage(message);
    setSeverity(severity);
    setsnackbar(true);
  };
  return (
    <SnackBarContext.Provider value={{snackBarOpen}}>
      {children}
      <Snackbar open={snackbar} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {snackbarmessage}
        </Alert>
      </Snackbar>
    </SnackBarContext.Provider>
  );
};
