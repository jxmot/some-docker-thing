# some-docker-thing

AKA "Rule Engine REST API".

# Overview

A node application with the following characteristics:

* The "Rule Engine REST API" is an endpoint that accepts POST requests containing data used for updating "rules". 
* A second endpoint is provided for simulating sensor data used in testing the "rules".
* Sensors are known to this application by their ID. This ID takes the form of a GUID string.
* When a rule is triggered a notification is sent immediately. The service used for sending them is Twilio. However, the associated configuration code will allow for other/additional services.

**NOTE:** Regarding Twilio, you will need your own API key from them to run this application. 

# Design Process

A specification was used as the means to drive the development of this application. 