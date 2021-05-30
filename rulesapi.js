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
    const url = require('url');

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

    /*
        Rule read response, called from the SENSORRULE
        event handler in sensorrules.js
    */
    function readResp(rule = null, res = null) {
        if(rule) {
            consolelog(`${scriptname} - rule read response: ${rule}`);
            res.writeHead(200);
            res.end(rule);
        } else {
            if(res) {
                consolelog(`${scriptname} - rule read response: not found`);
                res.writeHead(204);
                res.end();
            } else {
                consolelog(`${scriptname} - FATAL ERROR res is null`);
                process.exit(1);
            }
        }
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
                api_evts.emit('SENSORRULE', JSON.parse(body), null, null);
            });
        } else {
            // is this a rule read requst?
            if(req.method === 'GET') {
                let urlParts = url.parse(req.url, true);
                let urlQuery = urlParts.query;
                let ruleid = urlQuery.rule;
                // ask for the rule, this might be non-standard
                // but it works as expected. and by passing 'res'
                // to the event we'll be sure to have the one 
                // that's in context when the response is sent.
                if(ruleid) {
                    api_evts.emit('SENSORRULE', ruleid, readResp, res);
                } else {
                    consolelog(`${scriptname} - missing params in GET`);
                    res.writeHead(400);
                    res.end();
                }
            } else {
                // POST and GET only!
                res.writeHead(405);
                res.end();
            }
        }
    };
    return rulesapi;
});
