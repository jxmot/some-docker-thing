# some-docker-thing

AKA "Rule Engine REST API".

# Overview

A node application with the following characteristics:

* The "Rule Engine REST API" is an endpoint that accepts POST requests containing data used for updating "rules". 
* A second endpoint is provided for simulating sensor data used in testing the "rules".
* Sensors are known to this application by their ID. This ID takes the form of a GUID string.
* When a rule is triggered a notification is sent immediately. The service used for sending them is Twilio. However, the associated configuration code will allow for other/additional services.
* Can be run in Docker.

**NOTE:** Regarding Twilio, you will need your own API key from them to run this application. 

# Design Overview

A specification was used as the means to drive the development of this application. From that the initial parts were:

* Sensor rule data structure(s) - initially filled with "canned" rules for testing, removed later.
* Sensor data reception and rule checking - utilizes events to initiate rule tests and create/update rules.

The next part was the rule API. It utilizes a data structure similar to what was in the "canned" rules. The difference is that the API data only needs to specify one `unit` or the other.
