const https = require('https');

export default function grab(callback) {
  https.get('https://en.wikipedia.org/w/api.php?&origin=*&action=query&format=json&list=random&rnnamespace=0', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    resp.on('end', () => { callback(JSON.parse(data).query.random[0].title); });
  }).on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
}
