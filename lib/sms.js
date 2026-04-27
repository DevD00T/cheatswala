const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const formatMobileNumber = (mobileNumber) => {
  // Remove all non-digit characters
  let cleaned = ('' + mobileNumber).replace(/\D/g, '');

  // Check if the mobile number starts with '0' or '00', remove it
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Check if the mobile number already includes country code
  const match = cleaned.match(/^(\d{2})(\d{10})$/);
  if (match) {
    return '+91' + match[2];
  }

  return '+91' + cleaned;
};

export const sendTwilioSms = async (to, body) => {
  try {
    const message = await client.messages.create({
      body: body,
      to: formatMobileNumber(to), // The phone number you want to send to
      from: twilioPhoneNumber, // Your registered Twilio phone number
    });
    if(message.sid){
      return true;
    }else{
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
     } else {
       console.log(error);
     }
    return null;
  }
};
