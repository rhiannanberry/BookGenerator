const https = require('https');

export default function grab(callback) {
  /*
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
  });*/
  var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
  function doCORSRequest(options, printResult) {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
      printResult(
        (x.responseText || '')
      );
    };
    if (/^POST/i.test(options.method)) {
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    x.send(options.data);
  }

  doCORSRequest({
    method: 'GET',
    url: 'https://en.wikipedia.org/w/api.php?&origin=*&action=query&format=json&list=random&rnnamespace=0'
  }, function printResult(result) {
    callback(JSON.parse(result).query.random[0].title);
    //outputField.value = result;
  });
}
