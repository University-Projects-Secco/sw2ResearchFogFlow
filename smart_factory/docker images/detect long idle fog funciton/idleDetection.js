const Robot = require('../../devices/robot.js');
exports.handler = function(robotUpdate, publish, query, subscribe) {
    console.log("enter into the user-defined fog function");

    const entityID = robotUpdate.entityId.id;
    const status = robotUpdate.entityId.attributes.status;

    if (robotUpdate.attributes == null ||
        robotUpdate.attributes.entityId.type !== "Robot")
        return;

    //TODO: manage no previous time saved
    //TODO: manage entering end exiting idle

    //Filter by factory
    const queryRequest = {
        entities: [
            {
                type: 'Robot',
                id: entityID}
        ]
    };

    //Always one only
    const updateIdleTime = function (idleTimeList) {
        const previousTimeInIdle = idleTimeList[0];
        const lastAbsoluteTime = previousTimeInIdle.attributes.time.value;
        const newIdleTime = {
            attributes:{
                interval:{
                    type: 'number',
                    value: previousTimeInIdle.attributes.interval.value + (robotUpdate.metadata.time.value - lastAbsoluteTime)
                },
                time:{
                    type: 'number',
                    value: robotUpdate.metadata.time.value
                }
            }
        };
        //Delete old idle time in the framework
        newIdleTime.entityID= {
            id: 'IdleTime'+entityID,
            type: 'result',
            isPattern: false
        };
        //OPT: metadata
        console.log("publish: ", newIdleTime);
        publish(newIdleTime);
    };

    query(queryRequest,updateIdleTime);

};