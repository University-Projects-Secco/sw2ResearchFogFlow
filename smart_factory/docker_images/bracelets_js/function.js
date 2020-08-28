const MIN_DISTANCE = 20;

exports.handler = function(contextEntity, publish, query, subscribe, log)
{

    log("enter bracelets")

    query({
            entities: [
                {
                    type: 'Robot',
                    isPattern: true
                }
            ]
        },
        function (entityList){
            const distances = new Map()
            entityList.forEach(robot=>distances.set(robot,distance(robot,contextEntity)))
            entityList.filter(robot=>distances.get(robot)<MIN_DISTANCE)
                .forEach(robot=>publish({
                    entityId: {
                        id: `Error.${contextEntity.id}-${robot.id}.${new Date().toISOString()}`,
                        type: 'Error'
                    },
                    attributes: {
                        description: {
                            type: 'string',
                            value: `Robot ${robot.entityId.id} and human ${contextEntity.entityId.id} was too close: ${distances.get(robot)}`
                        },
                        robot_position:{
                            type: 'point',
                            value: robot.attributes.position.value
                        },
                        human_position:{
                            type: 'point',
                            value: contextEntity.attributes.position.value
                        }
                    },
                    metadata:{
                        time: {
                            type: 'number',
                            value: new Date().getTime()
                        }
                    }
                }))
        })

    function distance(robot,bracelet){
        const robotPos = robot.attributes.position.value
        const braceletPos = bracelet.attributes.position.value
        return Math.sqrt(Math.pow(robotPos.latitude-braceletPos.latitude,2)+Math.pow(robotPos.longitude-braceletPos.longitude,2))
    }

};

