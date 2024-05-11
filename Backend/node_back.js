const express = require('express');
const cors = require('cors')
const AccessToken = require('twilio').jwt.AccessToken;

const app = express();
app.use(cors());

const VideoGrant = AccessToken.VideoGrant;

app.get('/api/token', (req, res) => {
  try {
    const identity = req.query.identity; // Get the user identity from request (e.g., query parameter)

    if (!identity) {
      return res.status(400).send('Identity is required');
    }
    const token = new AccessToken(
      'account_sid',
      'api_key_sid',
      'Api_secret_key', {
        identity: identity // Set the identity of the user
      }    
    );
    console.log(token)
  
    // token.identity = 'user123'; // Set unique identity for the user
  
    const grant = new VideoGrant();
    token.addGrant(grant);
  
      // Set CORS headers in the response
      res.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow requests from localhost:3000
      res.set('Access-Control-Allow-Methods', 'GET, POST'); // Allow GET and POST methods
      res.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
  
    res.json({ token: token.toJwt() });
    
  } catch (error) {
    console.log(error)
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
