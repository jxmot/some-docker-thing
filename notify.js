'use strict';

module.exports = (function(log)  {

    const consolelog = log;
    const path = require('path');
    const scriptname = path.basename(__filename);

    let notify = {
    };

    const cfg = require('./_notifycfg.js');
    const Twilio = (!cfg.nosms ? require('twilio') : null);
    const client = (!cfg.nosms ? new Twilio(cfg.accountSid, cfg.authToken) : null);
    
    notify.send = function(message) {
        consolelog(`${scriptname} - notifying msg = ${message} size = ${message.length} nosms = ${cfg.nosms}`);
        // for dev & debug SMS can be disabled
        if(cfg.nosms) {
            consolelog(`${scriptname} - SMS tranmission is disabled`);
            return;
        }
        if(message.length <= cfg.maxlen) {
            consolelog(`${scriptname} - sending to ${cfg.phto}`);
            client.messages
            .create({
                body: message,
                from: cfg.phfrom,
                to: cfg.phto
            })
            .then(message => consolelog(`${scriptname} - ${message.status} ${message.sid}`));
        }
    };

    return notify;
});
