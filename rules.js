'use strict';
/*
    Rule Settings - each sensor has its own rule.

    NOTE: This file was created primarily for 
    developing and testing how the rules would 
    work.

    The Rules API will use the same structure but
    it will only require one checks[], 'celsius'
    or 'fahrenheit'.

    {87c89411-55f7-4cab-9b54-6d0895b2bafc}' : {
        // rule checking can be disabled for 
        // individual sensors
        enable:true,
        // Each sensor will tell us the unit it's 
        // using, and the trigger value. The "check"
        // will indicate which test to use:
        //      sensor value < (LT) trigger value
        //      sensor value > (GT) trigger value
        //      sensor value > OR < (GLT) trigger value
        //
        // The delta (optional if not 0.0) is the amount of 
        // difference between the sensor value and the trigger.
        // For example: If the sensor is "50.5", and the 
        // trigger is "50.0", and the check is "GT" -
        //
        // If "delta" is 1.0 -  (50.5 > (50.0 + "delta") ? YES : NO)
        // the result is "NO".
        // 
        // If the check is "LT":
        //      (50.5 < (50.0 - "delta") ? YES : NO)
        // 
        // If the check is "GLT" it will do both tests.
        checks: {
            'fahrenheit': {
                trigger:90.0,
                delta:0.0,
                check:'GT'
            },
            'celsius': {
                trigger:32.2,
                delta:0.0,
                check:'GT'
            }
            // other "units" can easily be added, for 
            // example if other sensors transmitted 
            // "humidity" we could use this rule 
            // check -
            ,'%RH': {
                trigger: 60.0,
                delta: 0.0,
                check: "GLT"
            }
        }
    }

    Typically the values would arrive from some other 
    "source". During that process the trigger value 
    could be entered in either "fahrenheit" or "celsius"
    and the opposite would be calculated and save in the
    appropriate place.

    The "delta" is optional. Just leave it a 0.0 if you 
    don't want to use it. But it is handy when you want 
    to allow sensor values to be within a "range" and 
    not trigger the rule.
*/
module.exports = {
    sensors: {
/*
        '{87c89411-55f7-4cab-9b54-6d0895b2bafc}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GLT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GLT'
                }
            }
        },
        '{b6d920d5-382b-4b32-a7e9-0e906d9ccd38}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{10980385-ae81-48c7-ba07-bf94b30108fa}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{d420def6-7c8e-4301-b1a9-da9fe76fa034}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{9ee6be3e-7a80-47ed-aba4-20d2d5b45474}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{c2270309-cd55-4c83-83a0-7960dacd03bc}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{5fbf6c4b-ca24-42dc-a161-2e3d188f8420}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{edb8f578-7d85-429c-a4ce-7cca1cf1cde3}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{d9ab9140-d1e9-4bed-97c9-980bce943b63}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        },
        '{da272a5c-a645-4738-b763-5585e65aa27d}': {
            enable:true,
            checks: {
                'fahrenheit': {
                    trigger:90.0,
                    delta:0.0,
                    check:'GT'
                },
                'celsius': {
                    trigger:32.2,
                    delta:0.0,
                    check:'GT'
                }
            }
        }
*/
    }
};
