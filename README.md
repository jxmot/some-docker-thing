# some-docker-thing

AKA "Rule Engine REST API".

# Overview

A node application with the following characteristics:

* The "Rule Engine REST API" is an endpoint that accepts POST requests containing data used for updating "rules". 
* A second endpoint is provided for simulating sensor data used in testing the "rules".
* Sensors are identified by their ID. This ID takes the form of a GUID string. Rules are associated with sendors via the same ID.
* When a rule is triggered a notification is sent immediately. The service used for sending them is Twilio. 
* Rules can be create/overwritten via an API.
* When a rule is sent via the API it and any pre-existing rules are saved to a file. Upon application start-up that file is read.

**NOTE:** Regarding Twilio, you will need your own API key from them to run this application with SMS notifications. 

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
    phto: '',
    // for dev & debug, 'true' disables sending SMS
    nosms: true
};
```

Your Twilio account will provide `accountSid`, `authToken` and `phfrom` (the phone number where the Twilio messages come from).

Edit `notifycfg.js`, add your account information and save the file as **`_notifycfg.js`**. The underscore (`_`) will hide the file from GitHub when using the `.gitignore` file found in this repository. This helps prevent accidental check-ins of this file and its sensitive information.

It is possible to disable SMS transmission by setting **`nosms`** to `true`.

## POST/GET Operations

There are only two allowed HTTP requests, POST and GET. Any others will get a `405` response. 

The endpoints will respond to the following - 

* **`POST`** - Used for writing sensor data and rules. The POST body must contain JSON text formatted data. Port numbers are used for distinguishing between sensor data and rule data

Examples:
Sensor Data - `POST http://server:8080 body:{"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","value": 72.3,"unit": "fahrenheit"}`

Rule Data - `POST http://server:1234 body:{"id": "{87c89411-55f7-4cab-9b54-6d0895b2bafc}","enable": true,"trigger": 70.6,"unit": "fahrenheit","delta": 0.0,"check": "GT"}`

When successful the server respones will be `200 OK`.

* **`GET`** - Used for retrieving rules only. The response will be determined by the presence of the rule, and the correctness of the request.

Example:
Rule Data - `GET http://server:1234?rule={87c89411-55f7-4cab-9b54-6d0895b2bafc}`

If the rule exists the server will respond with `200` and return the rule formatted as JSON. The other possible responses are - 

* `204` - rule was not found
* `400` - bad GET parameter(s)
* `405` - invalid HTTP method

## Command Line Output

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

**Read a Rule via the API:**
This will be seen when a rule is requested via GET:

If the rule is found - 
```
sensorrules.js - SENSORRULE = "{87c89411-55f7-4cab-9b54-6d0895b2bafc}"
rulesapi.js - rule read response: {"enable":true,"checks":{"fahrenheit":{"check":"GT","trigger":70.6,"delta":0},"celsius":{"trigger":21.4,"check":"GT","delta":0}}}
```

If the rule does not exist - 
```
sensorrules.js - SENSORRULE = "{87c89411-doo-4cab-9b54-6d0895b2bafc}"
rulesapi.js - rule read response: not found
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

Initially when I was running the Docker container I was unable to reach the ports. I wasn't sure if it was listening or if something prevented it. I was able to use the Windows 10 *Powershell* and run this command: `Get-NetTCPConnection -State Listen`. It  shows all of the ports that are currently in "listen" mode. And I was able to determine that the ports were not open. To fix the issue I had to correct my `Dockerfile` and use the correct run command.

I also had "Docker Desktop" running so I could see the images I was building. Along the way I *thought* I was cleaning up by removing previous ones. But that didn't appear to be what actually happened. 

At one point I noticed a few things shortly after it was working. First, ports were still open even though the container was supposed to be stopped and *removed*. Second, there was a process running on Win10 called `Vmmem` and it was using almost a gig of memory. So I closed "Docker Desktop", it was still there.

I restarted "Docker Desktop" and now there were a number of images I *had built* and some were also running. The strange thing is that they were not visible before stopped and restarted "Docker Desktop".

## Sending & Requesting Rules and Data

I recommend a utility like *Postman*. It makes it extremely easy to send POST API calls to the application. 

The file `data-samples.txt` contains GUID strings and sample JSON data for use in Postman or some other tool.

# Using Visual Studio Code

## Prerequisites

The starting point should be "fresh", if any Docker images were previously built for this application delete them.

The following must be installed:

* Visual Studio Code - latest version
  * Extensions:
    * Docker >=1.15.0
    * Remote-Containers >=0.187.1
  * `launch.json` - a working example is provided below
  * `tasks.json` - a working example is provided below
  
## Build, Run and Debug

Use these steps (breakpoint usage is demonstrated):

1) The `.vscode` folder should contain `launch.json` and `tasks.json`. Use the examples below.
2) Open the project folder with Visual Studio Code.
3) Navigate to "Explorer"(Ctrl+Shift+E) and open `index.js`
4) Set a breakpoint on the first line of code.
5) Navigate to "Run & Debug"(Ctrl+Shift+D).
6) Hit F5("Start Debuging"), the Docker image will be built and execution will stop on the breakpoint.

The "Debug Console"(Ctrl+Shift+Y) will contain any console output from the application. 

## Visual Studio Code JSON Files

Both files should be placed in a folder named `.vscode` in the root of this project.

**`launch.json`**

This is a typical configuration:

```
{
    "configurations": [
        {
            "name": "Docker Node.js Launch",
            "type": "docker",
            "request": "launch",
            "preLaunchTask": "docker-run: debug",
            "platform": "node"
        }
    ]
}
```

**`tasks.json`**

This had to be modified to work properly, the modifcations and described below.

```
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "docker-build",
			"label": "docker-build",
			"platform": "node",
			"dockerBuild": {
				"dockerfile": "${workspaceFolder}/Dockerfile",
				"context": "${workspaceFolder}",
				"pull": true
			}
		},
		{
			"type": "docker-run",
			"label": "docker-run: release",
			"dependsOn": [
				"docker-build"
			],
			"platform": "node"
		},
		{
			"type": "docker-run",
			"label": "docker-run: debug",
			"dependsOn": [
				"docker-build"
			],
			"dockerRun": {
				"env": {
					"DEBUG": "*",
					"NODE_ENV": "development"
				},
				"ports": [ 
					{ "containerPort": 8080, "hostPort": 8080 },
					{ "containerPort": 1234, "hostPort": 1234 } 
				]
			},
			"node": {
				"inspectMode": "break",
				"enableDebugging": true
			}
		}
	]
}
```

The following was added to `"dockerRun": {}`:

```
				"ports": [ 
					{ "containerPort": 8080, "hostPort": 8080 },
					{ "containerPort": 1234, "hostPort": 1234 } 
				]
```

Without it VSCode would pick "random" port numbers.

The following was added to `"node": {}`:

```
				"inspectMode": "break",
```

This will cause VSCode to wait for the debugger to attach to the Docker image before running the application.

# Information Resources Used

* <https://www.twilio.com/docs/sms/quickstart/node>
* <https://www.docker.com/101-tutorial>
* <https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>

For Visual Studio Code: A number of sources were used, and information from them was combined to create the instructions in this document.

* https://github.com/microsoft/vscode-docker/issues/1765 - This had what I needed to see, the 2nd comment referenced `"dockerRun": { "ports": [ { "containerPort": 8000, "hostPort": 8000 } ], }`.
* https://code.visualstudio.com/docs/containers/quickstart-node#_debug-in-the-service-container - Provided information about `"inspectMode"`. 

## Other 

* <https://www.guidgenerator.com/> - used for creating the GUIDs used here.
