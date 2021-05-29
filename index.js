'use strict';

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
