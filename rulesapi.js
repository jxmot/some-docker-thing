'use strict';
/*
    Rules API Endpoint
*/
module.exports = (function(apiev, apiport, log)  {

    const api_evts = apiev;
    const srv_port = apiport;
    const consolelog = log;

    const path = require('path');
    const scriptname = path.basename(__filename);

    const http = require('http');

    let rulesapi = {
    };

    let server = {};

    rulesapi.start = function() {
        server = http.createServer(handleRequest);
        // Starts the server.
        server.listen(srv_port, function() {
            consolelog(`${scriptname} - Server is listening on PORT: ${srv_port}`);
        });
    };

    function handleRequest(req, res) {
        if(req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                // buffer to string
                body += chunk.toString();
            });
            req.on('end', () => {
                /*
                    Incoming data:

                    {
                        "id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}",
                        "enable": true,
                        "trigger": 70.6,
                        "unit": "fahrenheit",
                        "delta": 0.0,
                        "check": "GLT"
                    }

                    NOTE: if "enable" is false the other fields
                    will be ignored. They can be absent from the
                    data.
                */
                consolelog(`${scriptname} - body : ${body}`);
                res.writeHead(200);
                res.end();
                // we've got sensor data, pass it on...
                api_evts.emit('SENSORRULE', JSON.parse(body));
            });
        } else {
            res.writeHead(405);
            res.end();
        }
    };
    return rulesapi;
});
