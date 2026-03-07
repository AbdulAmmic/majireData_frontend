const https = require('https');

https.get('https://client.peyflex.com.ng/api/data/plans/?network=mtn_gifting_data', (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        console.log(data);
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
