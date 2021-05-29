'use strict';
/*
    https://github.com/jxmot/some-docker-thing

    The best way to test this application (once it is 
    up and running) is to use something like Postman.

    Postman works very well for testing the APIs. Here 
    is some test data to use with it (in the POST 
    body) - 

    Sensor Data:
        {"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","value": 89,"unit": "fahrenheit"}

    Rule Data:
        {"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","enable": true,"trigger": 70.6,"unit": "fahrenheit","delta": 0.0,"check": "GT"}

    NOTE: "id" strings can be found in data-samples.txt
*/
// Events
const EventEmitter = require('events');
// incoming api events are sent here...
const api_evts = new EventEmitter();
// API server config
const cfg = require('./cfg.js');
// single logging function used by all modules
function consolelog(text) {
    if(cfg.debug) {
        console.log(text);
    }
};

// we'll receive incoming api events here 
// and process "rules"...
const sensrules = require('./sensorrules.js')(api_evts,consolelog);
// the server that listens to sensors...
const sensapi = require('./sensorapi.js')(api_evts,cfg.sensport,consolelog);
// start listening... (rules will be processed on incoming sensor data)
sensapi.start();
