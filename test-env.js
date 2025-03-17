require('dotenv').config();
console.log('Environment variables:');
console.log('REACT_APP_DISABLE_REGISTRATION:', process.env.REACT_APP_DISABLE_REGISTRATION);
console.log('FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? 'exists' : 'missing'); 