'use strict';

const NGSI = require('./ngsi/ngsiclient.js');
const fs = require('fs');
const Robot = require('./devices/robot.js');
const log = require('loglevel');
log.setLevel("INFO");

// read device profile from the configuration file
const args = process.argv.slice(2);
if(args.length < 1){
    log.error('please specify the device profile');
    return;
}
if(args.length<2){
    log.error('please specify the simulation parameters');
    return;
}

const cfgFile = args[0];
const profile = JSON.parse(
    fs.readFileSync(cfgFile)
);
const simulationSettingsFile = args[1];
const simulation = JSON.parse(
    fs.readFileSync(simulationSettingsFile)
);
Robot.initClass(simulation);

let ngsi10client;
let contextTimer;
let clockTimer;
let robot = new Robot();

// find out the nearby IoT Broker according to my location
const discovery = new NGSI.NGSI9Client(profile.discoveryURL);
discovery.findNearbyIoTBroker(profile.location, 1)
    .then( function(brokers) {
    log.info('-------nearbybroker----------');
    log.info(brokers);
    log.info('------------end-----------');
    if(brokers && brokers.length > 0) {
        ngsi10client = new NGSI.NGSI10Client(brokers[0]);

        // generating data observations periodically
        contextTimer = setInterval(function(){
            updateContext();
        }, simulation.updateContextTime);

        clockTimer = setInterval(function () {
            robot.update();
        },simulation.updateClockTime);

        // register my device profile by sending a device update
        registerDevice();
    }
}).catch(function(error) {
    log.warn(error);
});

// register device with its device profile
function registerDevice() 
{
    const ctxObj = {};
    ctxObj.entityId = {
        id: 'Device.' + profile.type + '.' + profile.id,
        type: profile.type,
        isPattern: false
    };
    
    ctxObj.attributes = {}; //OPT: move attributes definition into devices/robot.js

    ctxObj.attributes.status = {
        type: 'string',
        value: robot.getStatus()
    };

    ctxObj.attributes.position = {
        type: 'point',
        value: robot.getPosition()
    };

    ctxObj.attributes.factory = {
        type: 'string',
        value: profile.id
    };

    ctxObj.attributes.iconURL = {
        type: 'string',
        value: profile.iconURL
    };                   
    
    ctxObj.metadata = {};
    
    ctxObj.metadata.location = {
        type: 'point',
        value: simulation.factoryLocation
    };

    ctxObj.metadata.factory = {
        type: 'string',
        value: profile.id
    };      
   
    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function(error) {
        log.warn('failed to update context');
    });  
}

// update context for streams
function updateContext()
{
    const ctxObj = {};

    ctxObj.entityId = {
        id: 'Device.' + profile.type + '.' + profile.id,
        type: profile.type,
        isPattern: false
    };
    
    ctxObj.attributes = {}; //OPT: move attributes definition into devices/robot.js

    ctxObj.attributes.status = {
        type: 'string',
        value: robot.getStatus()
    };

    ctxObj.attributes.position = {
        type: 'point',
        value: robot.getPosition()
    };

    ngsi10client.updateContext(ctxObj).then( function(data) {
        log.debug('ngsi response: '+JSON.stringify(data),null,' ');
    }).catch(function(error) {
        log.warn('failed to update context');
    });    
}

process.on('SIGINT', function() 
{    
    if(ngsi10client) {
        clearInterval(contextTimer);
        clearInterval(clockTimer);
        
        // to delete the device
        const entity = {
            id: 'Device.' + profile.type + '.' + profile.id,
            type: 'Device',
            isPattern: false
        };
        ngsi10client.deleteContext(entity).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function(error) {
            log.warn('failed to delete context');
        });        

        ngsi10client.deleteContext(entity).then( function(data) {
            log.debug('ngsi response: '+JSON.stringify(data,null,' '));
        }).catch(function(error) {
            log.warn('failed to delete context');
        });        
    }
});
