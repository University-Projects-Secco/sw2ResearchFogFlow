exports.handler = function(contextEntity, publish){
    if (contextEntity == null) {
        return;
    } 
    
    if (contextEntity.attributes == null) {
        return;
    }
    
    console.log("------------begin-------------");
    console.log("received content entity ", contextEntity)
    console.log("------------end-------------");

    function queryCallback(results) {
        const updateEntity = {
            entityId: contextEntity.entityId,
            attributes: {
                queryResultSize: {
                    type: 'number',
                    value: results.length
                }
            }
        }

        updateEntity.entityId.id = 'Log.Query.'+updateEntity.entityId.id+Date.now();
        updateEntity.entityId.type = 'Log';

        publish(updateEntity);

    }
    const updateEntity = {
        entityId: contextEntity.entityId,
        attributes: {
            message: {
                type: 'string',
                value: 'test publish of converter'
            }
        },
        metadata: {}
    };

    updateEntity.entityId.id = 'Log.Publish.'+updateEntity.entityId.id+'.'+Date.now();
    updateEntity.entityId.type = 'Log';

    publish(updateEntity);

    query({entityId: {type: 'Robot',isPattern: true}},queryCallback);

    console.log("publish: ", updateEntity);     
};

