const NGSI = require('./ngsi/ngsiclient.js');
const fs = require('fs');
const Robot = require('./devices/robot.js');
const Bracelet = require('./devices/bracelet.js');
const log = require('loglevel');

log.setLevel("debug",false);

// read device profile from the configuration file
const args = process.argv.slice(4);


switch (args.length){
    case 0:
        args.push('simulation_profile.json')
    case 1:
        args.push('factory_profile.json')
    case 2:
        args.push('robot_profile.json')
    case 3:
        args.push('bracelet_profile.json')


}

const sim_profile = JSON.parse(fs.readFileSync(args[0]));
const fact_profile = JSON.parse(fs.readFileSync(args[1]));
const robot_profile = JSON.parse(fs.readFileSync(args[2]));
const bracelet_profile = JSON.parse(fs.readFileSync(args[3]));

if(robot_profile){
    Robot.prototype.profile = fact_profile;
    Robot.prototype.profile.robotParams = robot_profile;
    Robot.prototype.profile.simulation = sim_profile;
}
if(bracelet_profile){
    Bracelet.prototype.profile = fact_profile;
    Bracelet.prototype.profile.braceletParams = bracelet_profile;
}
sim_profile.location = fact_profile.location;

let ngsi10client;
let contextTimer;
let clockTimer;
let robot = new Robot();
let bracelet = new Bracelet();


clockTimer = setInterval(function () {
    robot.update();
    bracelet.update();
},sim_profile['updateClockTime']);

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
        }, sim_profile.updateContextTime);

        // register my device profile by sending a device update
        registerDevice();
    }
}).catch(function(error) {
    log.error('ERROR: '+error);
});

// register device with its device profile
function registerDevice()
{
    const ctxObj = robot.fillAttributes();
    const ctxObj2 = bracelet.fillAttributes();

    ngsi10client.updateContext(ctxObj).then( function() {
        log.debug('registered: '+JSON.stringify(ctxObj));
    }).catch(function() {
        log.warn('failed to register: '+JSON.stringify(ctxObj));
    });

    ngsi10client.updateContext(ctxObj2).then( function() {
        log.debug('registered: '+JSON.stringify(ctxObj2));
    }).catch(function() {
        log.warn('failed to register: '+JSON.stringify(ctxObj2));
    });
}

// update context for streams
function updateContext()
{
    const ctxObj = robot.fillAttributes();
    const ctxObj2 = bracelet.fillAttributes();

    ngsi10client.updateContext(ctxObj).then( function() {
        log.debug('updated: '+JSON.stringify(ctxObj),null,' ');
    }).catch(function() {
        log.warn('failed to update: '+JSON.stringify(ctxObj));
    });

    ngsi10client.updateContext(ctxObj2).then( function() {
        log.debug('updated: '+JSON.stringify(ctxObj2),null,' ');
    }).catch(function() {
        log.warn('failed to update: '+JSON.stringify(ctxObj2));
    });
}

process.on('SIGINT', function()
{
    if(ngsi10client) {
        clearInterval(contextTimer);
        clearInterval(clockTimer);

        // to delete the device
        ngsi10client.deleteContext(robot.getAsEntity()).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function() {
            log.warn('failed to delete context');
        });

        // to delete the device
        ngsi10client.deleteContext(bracelet.getAsEntity()).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function() {
            log.warn('failed to delete context');
        });

    }
});
