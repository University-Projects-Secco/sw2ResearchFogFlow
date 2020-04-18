const NGSI = require('./ngsi/ngsiclient.js');
const fs = require('fs');
const Robot = require('./devices/robot.js');
let published;

const log = require('loglevel');

log.setLevel("debug",false);

// read device profile from the configuration file
const args = process.argv.slice(2);
if(args.length < 1){
    log.error('please specify the device profile');
    throw 'please specify the device profile';
}

const sim_profile = JSON.parse(fs.readFileSync(args[0]));
const fact_profile = JSON.parse(fs.readFileSync(args[1]));
const robot_profile = JSON.parse(fs.readFileSync(args[2]));
if(robot_profile){
    Robot.prototype.profile = fact_profile;
    Robot.prototype.profile.robotParams = robot_profile;
}
sim_profile.location = fact_profile.location;

let ngsi10client;
let contextTimer;
let clockTimer;
let robot = new Robot(Robot.statusEnum.idle);

// find out the nearby IoT Broker according to my location
const discovery = new NGSI.NGSI9Client(sim_profile.discoveryURL);
discovery.findNearbyIoTBroker(sim_profile.location, 1)
    .then( function(brokers) {
    log.info('-------nearbybroker----------');
    log.info(brokers);
    log.info('------------end-----------');
    if(brokers && brokers.length > 0) {
        ngsi10client = new NGSI.NGSI10Client(brokers[0]);

        // generating data observations periodically
        contextTimer = setInterval(function(){
            updateContext();
        }, sim_profile['updateContextTime']);

        clockTimer = setInterval(function () {
            robot.update();
        },sim_profile['updateClockTime']);

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
