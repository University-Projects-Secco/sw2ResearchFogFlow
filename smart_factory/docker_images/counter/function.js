const MIN_DISTANCE = 20;

exports.handler = function(contextEntity, publish, query, subscribe, log)
{

    query({
            entities: [
                {
                    type: 'Count',
                    id: 'Count.All_Errors',
                    isPattern: true
                }
            ]
        },
        function (entityList){
            log('counter: enter query callback. got '+entityList.length+' results')
            if(entityList.length>1){
                log('Too many counts!')
                return
            }

            const newResult = {
                entityId: {
                    id: 'Count.All_Errors',
                    type: "Count",
                    isPattern: false
                },
                attributes: {
                    count: {
                        type: 'number',
                        value: '0'
                    }
                },
                metadata: {
                    time: {
                        type: 'number',
                        value: new Date().getTime()
                    }
                }
            }

            log('counter: created response')

            if (entityList.length===1){
                const prevResult = entityList[0]
                newResult.attributes.count.value = prevResult.attributes.count.value +1
            }

            log('counter: publishing result')
            publish(newResult)
        })

};

