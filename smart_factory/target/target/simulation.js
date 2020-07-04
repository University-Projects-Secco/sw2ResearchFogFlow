//      

                                                                                 

const NGSI = require('./ngsi/ngsiclient');
const fs = require('fs');
const Robot = require('./devices/robots/Robot');
const detector = require('./docker images/detect long idle fog funciton/idleDetection');
const FogFlow_Logger = require('./utils/FogFlow_Logger');
let published;

let log = new FogFlow_Logger('simulation',console.log);


log.setLevel(log.levels.DEBUG);

// read device profile from the configuration file
const args = process.argv.slice(2);
if(args.length < 3){
    const errorString = 'specify a profile for the simulation, the factory and the robots';
    log.error(errorString);
    throw errorString;
}

const simProfile = JSON.parse(
    fs.readFileSync(args[0]).toString()
);

const factoryProfile                  = JSON.parse(
    fs.readFileSync(args[1]).toString()
);

const robotProfile                = JSON.parse(
    fs.readFileSync(args[1]).toString()
);

let ngsi10client;
let contextTimer;
let clockTimer;
let robot = new Robot(null,{factory: factoryProfile, robot: robotProfile});

// find out the nearby IoT Broker according to my location
const discovery = new NGSI.NGSI9Client(simProfile.discoveryURL);
discovery.findNearbyIoTBroker(simProfile.location, 1)
    .then( function(brokers) {
    log.info('-------nearbybroker----------');
    log.info(brokers);
    log.info('------------end-----------');
    if(brokers && brokers.length > 0) {
        ngsi10client = new NGSI.NGSI10Client(brokers[0]);

        let newLog = new FogFlow_Logger('simulation',ngsi10client.updateContext);
        newLog.setDefaultLevel(log.getLevel());
        newLog.setLevel(log.getLevel());
        log = newLog;

        // generating data observations periodically
        contextTimer = setInterval(function(){
            updateContext();
        }, simProfile.updateContextTime);

        clockTimer = setInterval(function () {
            robot.update();
        },simProfile.updateClockTime);

        // register my device profile by sending a device update
        registerDevice();
    }
}).catch(function(error) {
    log.warn(error);
});

// register device with its device profile
function registerDevice() 
{
    const ctxObj = robot.getEntity();
   
    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function() {
        log.warn('failed to update context');
    });  
}

// update context for streams
function updateContext()
{
    const ctxObj = robot.getEntity();
    log.debug('update: '+JSON.stringify(ctxObj,null,'\t'));

    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function() {
        log.warn('failed to update context');
    });

    detector.handler(ctxObj,(data,save)=> save?published = data:log.info('data not persisted'),(data,func)=> func([published]))
}

process.on('SIGINT', function() 
{    
    if(ngsi10client) {
        clearInterval(contextTimer);
        clearInterval(clockTimer);
        
        // to delete the device
        ngsi10client.deleteContext(robot.getEntityId()).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function(error) {
            log.warn('failed to delete context');
        });
    }
});
