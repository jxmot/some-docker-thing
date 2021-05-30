'use strict';
module.exports = (function(apiev, log)  {

    // we're going to be listing for 'SENSORDATA'
    // events
    const api_evts = apiev;

    // the debugging messages will go here
    const consolelog = log;

    const fs = require('fs');

    const path = require('path');
    const scriptname = path.basename(__filename);

    let sensorrules = {
    };

    // not 'const, because we can modfiy sensor rules
    let rules = require('./rules.js');

    // SMS notification when a rule is triggered
    const notify = require('./notify.js')(log);

    // read saved rules from disk, if they exist
    try {
        fs.accessSync(rules.file, fs.constants.F_OK);
        consolelog(`${scriptname} - reading rules from ${rules.file}`);
        // the file rule data will overwrite any 
        // exising rules, intentional
        rules.sensors = JSON.parse(fs.readFileSync(rules.file, 'utf8'));
    } catch(err) {
        if(err.code === 'ENOENT') {
            consolelog(`${scriptname} - ${rules.file} does not exist`);
        }
    }

    /*
        Test rules against sensor data

        Returns:
            true - the rule was triggered
            false - the rule was not triggered
            undefined - the rule is unknown
    */
    function testRule(sensdat, rule, trigger, delta) {
        let result;
        switch(rule) {
            case 'GT':
                result = (sensdat.value > (trigger + delta));
                break;

            case 'LT':
                result = (sensdat.value < (trigger - delta));
                break;

            case 'GLT':
                result = ((sensdat.value < (trigger - delta)) || (sensdat.value > (trigger + delta)));
                break;

            default:
                consolelog(`${scriptname} - ${sensdat.id} unknown rule: ${rule}`);
                break;
        }
        return result;
    };

    /*
        Handle incoming sensor data...
    */
    api_evts.on('SENSORDATA', (sensdat) => {
        consolelog(`${scriptname} - SENSORDATA = ${JSON.stringify(sensdat)}`);
        // use the incoming sensor "id" to access the 
        // rules table, if enabled the perform the rule 
        // check...
        if(rules.sensors[sensdat.id] && rules.sensors[sensdat.id].enable === true) {
            consolelog(`${scriptname} - ${sensdat.id}: ${JSON.stringify(rules.sensors[sensdat.id].checks[sensdat.unit])}`);
            // if a rule matches then send a notification...
            const rule = rules.sensors[sensdat.id].checks[sensdat.unit].check;
            const trigger = rules.sensors[sensdat.id].checks[sensdat.unit].trigger;
            const delta = rules.sensors[sensdat.id].checks[sensdat.unit].delta;
            let tmp = testRule(sensdat, rule, trigger, delta);
            if(tmp) {
                consolelog(`${scriptname} - ${sensdat.id}: ${sensdat.value} is "${rule}" than ${(trigger + delta)}`);
                notify.send(`${sensdat.id} - ${sensdat.value} "${rule}" ${(trigger + delta)}`);
            } else {
                if(tmp === false) consolelog(`${scriptname} - ${sensdat.id}: ${sensdat.value} is NOT "${rule}"`);
                else consolelog(`${scriptname} - ${sensdat.id}: "${rule}" is unknown`);
            }
        } else {
            let state = (rules.sensors[sensdat.id] ? 'disabled' : 'unknown');
            consolelog(`${scriptname} - ${state} sensor: ${sensdat.id} `);
        }
    });

    /*
        Handle incoming rules...
    */
    api_evts.on('SENSORRULE', (sensrule, respfunc = null, res = null) => {
        consolelog(`${scriptname} - SENSORRULE = ${JSON.stringify(sensrule)}`);
        // the args 
        if(respfunc && res) {
            // a rule "read" has been requested,
            // find it and send it back via respfunc()
            if(rules.sensors[sensrule]) {
                respfunc(JSON.stringify(rules.sensors[sensrule]), res);
            } else {
                // rule was not found...
                respfunc(null, res);
            }
        } else {
            // create objects and overwrite any pre-existing rule
            rules.sensors[sensrule.id] = Object.create(null);
    
            if(!sensrule.enable) {
                // disable rules for the specified sensor
                rules.sensors[sensrule.id].enable = false;
                // all other rule data is ignored
            } else {
                rules.sensors[sensrule.id].enable = true;
                // create a rule check object
                rules.sensors[sensrule.id].checks = Object.create(null);
                // start with the specifed unit...
                rules.sensors[sensrule.id].checks[sensrule.unit] = Object.create(null);
                // then copy the rest of the rule data...
                rules.sensors[sensrule.id].checks[sensrule.unit].check = sensrule.check;
                rules.sensors[sensrule.id].checks[sensrule.unit].trigger = sensrule.trigger;
                rules.sensors[sensrule.id].checks[sensrule.unit].delta = sensrule.delta;
                // adjust the other unit trigger value...
                let unit = (sensrule.unit === 'fahrenheit' ? 'celsius' : 'fahrenheit');
                let trigger = (unit === 'fahrenheit' ? ((sensrule.trigger * 1.8) + 32) : ((sensrule.trigger - 32) * 0.55555555556));
                rules.sensors[sensrule.id].checks[unit] = Object.create(null);
                rules.sensors[sensrule.id].checks[unit].trigger = Number(trigger.toFixed(1));
                // the others will be the same, no conversion 
                // is done for the delta value
                rules.sensors[sensrule.id].checks[unit].check = sensrule.check;
                rules.sensors[sensrule.id].checks[unit].delta = sensrule.delta;
    
                consolelog(`${scriptname} - rule completed for ${sensrule.id}`);

                if(rules.file) {
                    fs.writeFileSync(rules.file, JSON.stringify(rules.sensors), 'utf8');
                    consolelog(`${scriptname} - all rules written to ${rules.file}`);
                }
            }
        }
    });
    return sensorrules;
});
