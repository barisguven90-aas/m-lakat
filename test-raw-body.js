const crypto = require('crypto');
const http = require('http');
const https = require('https');

async function testWebhook() {
  const payload = JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test',
        customer: 'cus_test',
        mode: 'subscription',
        subscription: 'sub_test',
        metadata: { userId: '123' },
        status: 'active',
        current_period_end: 1234567,
        items: { data: [{ price: { id: 'price_test' } }] }
      }
    }
  });

  const secret = 'whsec_dummy'; 
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature}`;

  console.log("Sending payload...");
  const options = {
    hostname: 'intervioai.com',
    port: 443,
    path: '/api/stripe/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': stripeSignature,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
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
