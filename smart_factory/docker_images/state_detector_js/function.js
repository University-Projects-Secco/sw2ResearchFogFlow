const RANDOM_CONSTANT = 0

exports.handler = function(contextEntity, publish, query, subscribe,log)
{

	log("enter state detector");

	const id  = "Result.statusTime"+contextEntity.entityId.id

	query([{id:id, isPattern: false}],
        function (entityList){
	    log('measure status: enter query callback')
	        if(entityList.length>1){
                log('Too many results for one entity!')
                return
            }

	        const newResult = {
	            entityId: {
	                id: id,
                    type: "Result",
                    isPattern: false
                },
                attributes: {
	                time: {
	                    type: 'number',
                        value: new Date().getTime()
                    },
                    status: contextEntity.attributes.status,
                    last_interval:{
	                    type: 'number',
                        value: 0
                    }
                }
            }

            log('measure status: created response')

	        if (entityList.length===1){
	            const prevResult = entityList[0]
                newResult.attributes.last_interval.value =
                    prevResult.attributes.last_interval.value +
                    newResult.attributes.time.value -
                    prevResult.attributes.time.value
            }

	        log('measure status: publishing result')
	        publish(newResult)
        })
};

