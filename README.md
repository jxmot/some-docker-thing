# some-docker-thing

AKA "Rule Engine REST API".

# Overview

A node application with the following characteristics:

* The "Rule Engine REST API" is an endpoint that accepts POST requests containing data used for updating "rules". 
* A second endpoint is provided for simulating sensor data used in testing the "rules".
* Sensors are identified by their ID. This ID takes the form of a GUID string. Rules are associated with sendors via the same ID.
* When a rule is triggered a notification is sent immediately. The service used for sending them is Twilio. 

**NOTE:** Regarding Twilio, you will need your own API key from them to run this application. 

## Development Environment

OS: Windows 10 Pro 64bit

# Design Overview

A specification was used as the means to drive the development of this application. From that the initial parts were:

* Sensor rule data structure(s) - initially filled with "canned" rules for testing, removed later.
* Sensor data reception and rule checking - utilizes events to initiate rule tests and create/update rules.

The next part was the rule API. It utilizes a data structure similar to what was in the "canned" rules. The difference is that the API data only needs to specify one `unit` or the other. The code will calculate and populate the other `unit` data.

After the rules were working the "Rules API" was added and the canned rules were removed. The creation of rules was tested, and sensor data was successfully checked against the added rules.

Once the rules API and sensor rule tests were working I added the Twilio notification module. 

## Source Files

Source Code : 
* `index.js` : Application initialize and run. Run-time configuration is in `cfg.js`.
  * `sensorapi.js` : Endpoint for sensors, emits a `SENSORDATA` event when valid sensor data arrives.
  * `rulesapi.js` : Endpoint for POSTing rules, emits a `SENSORRULE` event when a rule arrives.
  * `sensorrules.js` : Event handlers for `SENSORDATA` and `SENSORRULE`.
    * `SENSORDATA` event : Sensor data is passed with the event, its ID is used to access any associated rule found in `rules.js`.
    * `SENSORRULE` event : Rule data is passed with the event, the sensor ID is used to access the rule list in `rules.js` and either create or overwrite in the list.
    * `rules.js` : Container for rules.
    * `notify.js` : The function `notify.send()` is called from `sensorrules.js`if a rule is triggered while handling the `SENSORDATA` event. Run-time configuration is in `_notifycfg.js`.

# Running the Application

## Configuration

### `cfg.js`

This file contains the port numbers for the API endpoints and the option to enable/disable console output.

```
'use strict';
module.exports = {
    // use this port with the sensors -
    sensport: '1234',
    // this port is for the rules API -
    ruleport: '8080',
    // enable/disable console output
    debug: false
};
```
### `notifycfg.js`

This file contains the necessary Twilio settings, edit it and add your own Twilio information: 

```
'use strict';
/*
    Twilio config data

    Fill in with your Twilio account 
    information,
*/
module.exports = {
    accountSid: '',
    authToken: '',
    maxlen: 150,
    phfrom: '',
    // all messages go to one number
    phto: ''
};
```

Your Twilio account will provide `accountSid`, `authToken` and `phfrom` (the phone number where the Twilio messages come from).

Edit `notifycfg.js`, add your account information and save the file as **`_notifycfg.js`**. The underscore (`_`) will hide the file from GitHub when using the `.gitignore` file found in this repository. This helps prevent accidental check-ins of this file and its sensitive information.

## Command Line

When ran from the command line with `node ./index.js` and `cfg.js:debug` is `true` then the following is an example of the output sent to the console:

**Application Start Up:**
```
sensorapi.js - Server is listening on PORT: 1234
rulesapi.js - Server is listening on PORT: 8080
```

**Write a Rule via the API:**
```
rulesapi.js - body : {"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","enable": true,"trigger": 70.6,"unit": "fahrenheit","delta": 0.0,"check": "GT"}
sensorrules.js - SENSORRULE = {"id":"{87c89411-55f7-4cab-9b54-6d0895b2bafc}","enable":true,"trigger":70.6,"unit":"fahrenheit","delta":0,"check":"GT"}
sensorrules.js - rule completed for {87c89411-55f7-4cab-9b54-6d0895b2bafc}
```

**Write Sensor Data via the API:**
```
sensorapi.js - body : {"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","value": 72.3,"unit": "fahrenheit"}
sensorrules.js - SENSORDATA = {"id":"{87c89411-55f7-4cab-9b54-6d0895b2bafc}","value":72.3,"unit":"fahrenheit"}
sensorrules.js - {87c89411-55f7-4cab-9b54-6d0895b2bafc}: {"check":"GT","trigger":70.6,"delta":0}
```
**When a rule is triggered:**
```
sensorrules.js - {87c89411-55f7-4cab-9b54-6d0895b2bafc}: 72.3 is "GT" than 70.6
```

**Rule Trigger SMS Notification:**
```
notify.js - notifying msg = {87c89411-55f7-4cab-9b54-6d0895b2bafc} - 72.3 "GT" 70.6 size = 55
notify.js - sending to +17735551212
notify.js - queued SM3da7cz4d1222327a9ab4c3ea8657821f
```

### Docker

**Build**
`docker build . -t [YOUR_USER_NAME]/some-docker-thing`

**Run** (*in the foreground*)
`docker run -p 18080:8080 -p 11234:1234 [YOUR_USER_NAME]/some-docker-thing`

NOTE: If `cfg.js:debug` is `true` then you will see output on the console similar to what was decribed above.

## Troubleshooting Notes

Initially when I was running the Docker container I was unable to reach the ports. I wasn't sure if it was listening or if something prevented it. I was able to use the Windows 10 *Powershell* and run this command: `Get-NetTCPConnection -State Listen`. It will show all of the ports that are currently in "listen" mode. And I was able to determine that the ports were not open. To fix the issue I had to correct my `Dockerfile` and use the correct command.

I also had "Docker Desktop" running so I could see the images I was building. Along the way I *thought* I was cleaning up by removing previous ones. But that didn't appear to be what actually happened. 

At one point I noticed a few things shortly after it was working. First, ports were still open even though the container was supposed to be stopped and *removed*. Second, there was a process running on Win10 called `Vmmem` and it was using almost a gig of memory. So I closed "Docker Desktop", it was still there.

I restarted "Docker Desktop" and now there were a number of images I *had built* and some were also running. The strange thing is that they were not visible before stopped and restarted "Docker Desktop".

## Sending Rules and Data

I recommend a utility like *Postman*. It makes it extremely easy to send POST API calls to the application. 

The file `data-samples.txt` contains GUID strings and sample JSON data for use in Postman or some other tool.

# Information Resources Used

* <https://www.twilio.com/docs/sms/quickstart/node>
* <https://www.docker.com/101-tutorial>
* <https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>
