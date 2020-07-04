(function() {

    function CtxElement2JSONObject(e) {
        const jsonObj = {
            entityId: e.entityId,
            attributes: {},
            metadata: {}
        };

        if(e.attributes)
            e.attributes.forEach(attr =>
                jsonObj.attributes[attr.name] = {
                    type: attr.type,
                    value: attr.value
                })

        if(e.domainMetadata)
            e.domainMetadata.forEach(meta=>
                jsonObj.metadata[meta.name] = {
                    type: meta.type,
                    value: meta.value
                })

        return jsonObj;
    }

    /**
     * @param {{entityId: *, attributes: Object.<string,attribute>, metadata: Object.<string,attribute>}} ob
     * @returns {{entityId: *, attributes: [], domainMetadata: []}}
     * @constructor
     */
    function JSONObject2CtxElement(ob) {
        const contextElement = {
            entityId: ob.entityId,
            attributes: [],
            domainMetadata: []
        };

        if (ob.attributes) {
            for (let key in ob.attributes) {
                let attr = ob.attributes[key];
                contextElement.attributes.push({name: key, type: attr.type, value: attr.value});
            }
        }

        if(ob.metadata) {
            for(let key in ob.metadata ) {
                let meta = ob.metadata[key];
                contextElement.domainMetadata.push({name: key, type: meta.type, value: meta.value});
            }
        }

        return contextElement;
    }

    const NGSI10Client = (function () {
        // initialized with the broker URL
        const NGSI10Client = function (url) {
            this.brokerURL = url;
        };

        // update context
        NGSI10Client.prototype.updateContext = function updateContext(ctxObj) {
            return axios({
                method: 'post',
                url: this.brokerURL + '/updateContext',
                data: {
                    contextElements: [JSONObject2CtxElement(ctxObj)],
                    updateAction: 'UPDATE'
                }
            }).then(response => response.status === 200 ? response.data : null);
        };

        // delete context
        NGSI10Client.prototype.deleteContext = function deleteContext(entityId) {
            return axios({
                method: 'post',
                url: this.brokerURL + '/updateContext',
                data: {
                    contextElement: [{
                        entityId: entityId
                    }],
                    updateAction: 'DELETE'
                }
            }).then(response => response.status === 200 ? response.data : null);
        };

        // query context
        NGSI10Client.prototype.queryContext = function queryContext(queryCtxReq) {

            return axios({
                method: 'post',
                url: this.brokerURL + '/queryContext',
                data: queryCtxReq
                /**
                 * @param {{data: {contextResponses: {contextElement}[]}}} response
                 */
            }).then(response =>
                response.status === 200 ?
                    response.data.contextResponses
                        .map(e => CtxElement2JSONObject(e.contextElement)) :
                    null
            );
        };

        // subscribe context
        NGSI10Client.prototype.subscribeContext = function subscribeContext(subscribeCtxReq) {
            return axios({
                method: 'post',
                url: this.brokerURL + '/subscribeContext',
                data: subscribeCtxReq
            }).then(response => response.status === 200 ? response.data.subscribeResponse.subscriptionId : null);
        };

        // unsubscribe context
        NGSI10Client.prototype.unsubscribeContext = function unsubscribeContext(sid) {
            return axios({
                method: 'post',
                url: this.brokerURL + '/unsubscribeContext',
                data: {
                    subscriptionId: sid
                }
            }).then(response => response.status === 200 ? response.data : null);
        };

        return NGSI10Client;
    })();

    const NGSI9Client = (function () {
        // initialized with the address of IoT Discovery
        const NGSI9Client = function (url) {
            this.discoveryURL = url;
        };

        NGSI9Client.prototype.findNearbyIoTBroker = function findNearbyIoTBroker(my_location, num) {
            const discoveryReq = {
                entities: [{type: 'IoTBroker', isPattern: true}],
                restriction: {
                    scopes: [{
                        scopeType: 'nearby',
                        scopeValue: {
                            latitude: my_location.latitude,
                            longitude: my_location.longitude,
                            limit: num
                        }
                    }]
                }
            };
            /**
             * @param {{contextRegistrationResponses: {contextRegistration: {providingApplication}}[]}} response
             */
            return this.discoverContextAvailability(discoveryReq).then(response=>
                response.errorCode.code === 200?
                    response.contextRegistrationResponses
                        .map(response => response.contextRegistration.providingApplication)
                        .filter(url => url !== ''):
                    null
            );
        };

        // discover availability
        NGSI9Client.prototype.discoverContextAvailability = function discoverContextAvailability(discoverReq) {
            return axios({
                method: 'post',
                url: this.discoveryURL + '/discoverContextAvailability',
                data: discoverReq
            }).then(response=>response.status===200?response.data:null);
        };

        return NGSI9Client;
    })();

// initialize the exported object for this module, both for nodejs and browsers
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
        this.axios = require('axios');
        module.exports.NGSI10Client = NGSI10Client;
        module.exports.NGSI9Client = NGSI9Client;
        module.exports.CtxElement2JSONObject = CtxElement2JSONObject;
        module.exports.JSONObject2CtxElement = JSONObject2CtxElement;
    } else {
        window.NGSI10Client = NGSI10Client;
        window.NGSI9Client = NGSI9Client;
        window.CtxElement2JSONObject = CtxElement2JSONObject;
        window.JSONObject2CtxElement = JSONObject2CtxElement;
    }

})();


