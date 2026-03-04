const crypto = require('crypto');
const http = require('http');

async function testWebhook() {
  const payload = JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test',
        customer: 'cus_test',
        mode: 'subscription',
        subscription: 'sub_test'
      }
    }
  });

  // Create a dummy signature
  const secret = 'whsec_dummy'; 
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature}`;

  console.log("Sending payload...");
  const options = {
    hostname: 'intervioai.com', // local or prod
    port: 443,
    path: '/api/stripe/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': stripeSignature,
      'Content-Length': payload.length
    }
  };

  const req = require('https').request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`BODY: ${rawData}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

testWebhook();
