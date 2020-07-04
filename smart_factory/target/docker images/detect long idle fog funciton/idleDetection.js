//      
import Robot from 'devices/robots/Robot';
import FogLogger from 'utils/FogFlow_Logger';
                                                
                                                           
                                    

exports.handler = function(robotUpdate        , publish          , query          , subscribe          ) {

    const log = new FogLogger('idleDetection',publish);

    log.debug("enter into the user-defined fog function");

    if((robotUpdate.entityId &&
        robotUpdate.entityId.type === Robot.prototype.type) &&
        (robotUpdate.attributes &&
            robotUpdate.attributes['status']) &&
        (robotUpdate.metadata &&
            robotUpdate.metadata['time'])) {

        const entityID = robotUpdate.entityId.id;
        const status = robotUpdate.attributes['status'].value;
        const newTimestamp = robotUpdate.metadata.time.value;
        const newData         = {
            entityId: {
                id: 'Result.StatusPermanence.' + entityID,
                type: 'data',
                isPattern: false
            },
            attributes: {
                status: {
                    type: 'string',
                    value: status
                },
                interval: {
                    type: 'number',
                    value: 0
                },
                timestamp: {
                    type: 'number',
                    value: newTimestamp
                }
            },
            metadata: null
        };

        const queryRequest = {
            entities: [
                {
                    type: 'data',
                    id: 'IdleTime' + entityID,
                    isPattern: false
                }
            ]
        };

        const sendUpdate = function (historicalDataList          ) {
            log.debug('query result: ' + historicalDataList.toString());
            if (!(historicalDataList.length === 0 ||
                historicalDataList[0] === undefined ||
                status !== historicalDataList[0].attributes.status.value))   //the stored item has a different status from the current one
            {
                const lastTimestamp = historicalDataList[0].attributes.timestamp.value;
                const lastInterval = historicalDataList[0].attributes.interval.value;
                newData.attributes.interval.value = lastInterval + (newTimestamp - lastTimestamp);    //Calculate new interval incrementally
                //Check if the old version is deleted
            }

            log.debug("publish: ", newData);
            publish(newData);
        };

        log.debug('query ' + query);
        query(queryRequest, sendUpdate);

    }
};