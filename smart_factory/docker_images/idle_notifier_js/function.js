const ERROR_LIMIT = 3 * 1000 //ms

exports.handler = function(contextEntity, publish, query, subscribe, log)
{

    log("enter idle notifier")

    const deviceId = contextEntity.entityId.id.replace("Result.statusTime",'')

    if(contextEntity.attributes.status.value.toLowerCase()  === 'idle' && contextEntity.attributes.last_interval>ERROR_LIMIT){
        const error = {
            entityId: {
                id: `Error.${deviceId}.${new Date().toISOString()}`,
                type: "Error"
            },
            attributes: {
                description: {
                    type: 'string',
                    value: `Entity ${deviceId} was idle for more than ${ERROR_LIMIT}ms`
                },
                idle_time: {
                    type: 'number',
                    value: contextEntity.attributes.last_interval.value
                }
            },
            metadata: {
                time: {
                    type: 'string',
                    value: contextEntity.attributes.time.value
                }
            }
        }
        publish(error)
    }
};

