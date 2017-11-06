const superagent = require('superagent')
const fs = require('fs');
const request = require('request');
const readline = require('readline');
var requestSync = require('request-sync');
const winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'invalidUrls2.log' })
    ]
  });

const urls = [];
const rl = readline.createInterface({
    input: fs.createReadStream('invalidUrls.log'),
});

let counter = 0;
rl.on('line', (line) => {
    const jsonObj = JSON.parse(line);
    const foundUrls = jsonObj.message.split(',');
    let url = {
        shortUrl: foundUrls[1],
        originalUrl: foundUrls[0]
    };
    urls.push(url);
})
.on('close', () => {
    checkUrls();
});

function checkUrls() {
    const total = urls.length;
    console.log(total);
    // let counter = 0;
    urls.forEach(function(url) {
        checkUrl(url.shortUrl,url.originalUrl);
    });
}
function checkUrl2(shortUrl,originalUrl) {
    superagent.get(shortUrl).then((res)=> {
        let result = res.redirects[0]; 
        if (result === originalUrl)
            console.log(shortUrl + ': passed');
        else {
            console.log(shortUrl + ': failed');
        }

    }).catch((e)=> {
        console.log(shortUrl + ': error')
    });
}

function checkUrl(shortUrl,originalUrl) {
    superagent.get(shortUrl).retry(5).end((err, res)=> {
        counter +=1;
        console.log(counter);
        if (err) {
            logger.info(originalUrl +',' + shortUrl);
            return;
        }
        let result = res.redirects[0]; 
        if (result === originalUrl)
            console.log(shortUrl + ': passed');
        else {
            console.log(shortUrl + ': failed');
            logger.info(originalUrl +',' + shortUrl);
        }

    })
}
function checkUrl3(shortUrl,originalUrl) {
var r = request.get(shortUrl, function (err, res, body) {
    let result = res.request.href; 
    if (result === originalUrl)
        console.log(shortUrl + ': passed');
    else {
        console.log(shortUrl + ': failed');
    }
  });
}

function checkUrl4(shortUrl,originalUrl) {
    var res = requestSync( shortUrl, {method: 'GET'});
    let result = res.headers.location; 
    if (result === originalUrl)
        console.log(shortUrl + ': passed');
    else {
        console.log(shortUrl + ': failed');
    }
}