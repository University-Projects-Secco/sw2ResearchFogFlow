const NGSI = require('./ngsi/ngsiclient.js');
const fs = require('fs');
const Robot = require('./devices/robot.js');
let published;

let log = require('loglevel');

log.setLevel("debug",false);

// read device profile from the configuration file
const args = process.argv.slice(2);
if(args.length < 1){
    log.error('please specify the device profile');
    throw 'please specify the device profile';
}

const cfgFile = args[0];
const profile = JSON.parse(
    fs.readFileSync(cfgFile)
);

let ngsi10client;
let contextTimer;
let clockTimer;
let robot = new Robot(Robot.statusEnum.idle);

// find out the nearby IoT Broker according to my location
const discovery = new NGSI.NGSI9Client(profile.discoveryURL);
discovery.findNearbyIoTBroker(profile.location, 1)
    .then( function(brokers) {
    log.info('-------nearbybroker----------');
    log.info(brokers);
    log.info('------------end-----------');
    if(brokers && brokers.length > 0) {
        ngsi10client = new NGSI.NGSI10Client(brokers[0]);

        let newLog = new FogLogger('simulation',ngsi10client.updateContext);
        newLog.setDefaultLevel(log.getLevel());
        newLog.setLevel(log.getLevel());
        log = newLog;

        // generating data observations periodically
        contextTimer = setInterval(function(){
            updateContext();
        }, profile['updateContextTime']);

        clockTimer = setInterval(function () {
            robot.update();
        },profile['updateClockTime']);

        // register my device profile by sending a device update
        registerDevice();
    }
}).catch(function(error) {
    log.warn(error);
});

// register device with its device profile
function registerDevice() 
{
    const ctxObj = robot.fillAttributes();
   
    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function(error) {
        log.warn('failed to update context');
    });  
}

// update context for streams
function updateContext()
{
    const ctxObj = robot.fillAttributes();
    log.debug('update: '+JSON.stringify(ctxObj,null,'\t'));

    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function(error) {
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
        ngsi10client.deleteContext(robot.getAsEntity()).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function(error) {
            log.warn('failed to delete context');
        });        

    }
});
