const log = require('loglevel');

(function() {

    function CtxElement2JSONObject(e) {
        let i;
        const jsonObj = {};
        jsonObj.entityId = e.entityId;

        jsonObj.attributes = {};
        for(i = 0; e.attributes && i<e.attributes.length; i++) {
            const attr = e.attributes[i];
            jsonObj.attributes[attr.name] = {
                type: attr.type,
                value: attr.value
            };
        }

        jsonObj.metadata = {};
        for(i = 0; e.domainMetadata && i<e.domainMetadata.length; i++) {
            const meta = e.domainMetadata[i];
            jsonObj.metadata[meta.name] = {
                type: meta.type,
                value: meta.value
            };
        }

        return jsonObj;
    }

    function JSONObject2CtxElement(ob) {
        log.debug('convert json object to context element');
        const contextElement = {};

        contextElement.entityId = ob.entityId;

        contextElement.attributes = [];
        if (ob.attributes) {
            for (let key in ob.attributes) {
                let attr = ob.attributes[key];
                contextElement.attributes.push({name: key, type: attr.type, value: attr.value});
            }
        }

        contextElement.domainMetadata = [];
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
            let contextElement = JSONObject2CtxElement(ctxObj);

            const updateCtxReq = {};
            updateCtxReq.contextElements = [];
            updateCtxReq.contextElements.push(contextElement);
            updateCtxReq.updateAction = 'UPDATE';

            log.debug(JSON.stringify(updateCtxReq,null,'  '));

            return axios({
                method: 'post',
                url: this.brokerURL + '/updateContext',
                data: updateCtxReq
            }).then(function (response) {
                if (response.status === 200) {
                    return response.data;
                } else {
                    return null;
                }
            });
        };

        // delete context
        NGSI10Client.prototype.deleteContext = function deleteContext(entityId) {
            const contextElement = {};
            contextElement.entityId = entityId;

            const updateCtxReq = {};
            updateCtxReq.contextElements = [];
            updateCtxReq.contextElements.push(contextElement);
            updateCtxReq.updateAction = 'DELETE';

            return axios({
                method: 'post',
                url: this.brokerURL + '/updateContext',
                data: updateCtxReq
            }).then(function (response) {
                if (response.status === 200) {
                    return response.data;
                } else {
                    return null;
                }
            });
        };

        // query context
        NGSI10Client.prototype.queryContext = function queryContext(queryCtxReq) {

            return axios({
                method: 'post',
                url: this.brokerURL + '/queryContext',
                data: queryCtxReq
            }).then(function (response) {
                if (response.status === 200) {
                    const objectList = [];
                    const ctxElements = response.data.contextResponses;
                    for (var i = 0; ctxElements && i < ctxElements.length; i++) {
                        log.debug(ctxElements[i].contextElement);
                        log.debug('===========context element=======');
                        log.debug(ctxElements[i].contextElement);
                        const obj = CtxElement2JSONObject(ctxElements[i].contextElement);
                        objectList.push(obj);
                    }
                    return objectList;
                } else {
                    return null;
                }
            });
        };

        // subscribe context
        NGSI10Client.prototype.subscribeContext = function subscribeContext(subscribeCtxReq) {
            return axios({
                method: 'post',
                url: this.brokerURL + '/subscribeContext',
                data: subscribeCtxReq
            }).then(function (response) {
                if (response.status === 200) {
                    return response.data.subscribeResponse.subscriptionId;
                } else {
                    return null;
                }
            });
        };

        // unsubscribe context
        NGSI10Client.prototype.unsubscribeContext = function unsubscribeContext(sid) {
            const unsubscribeCtxReq = {};
            unsubscribeCtxReq.subscriptionId = sid;

            return axios({
                method: 'post',
                url: this.brokerURL + '/unsubscribeContext',
                data: unsubscribeCtxReq
            }).then(function (response) {
                if (response.status === 200) {
                    return response.data;
                } else {
                    return null;
                }
            });
        };

        return NGSI10Client;
    })();

    const NGSI9Client = (function () {
        // initialized with the address of IoT Discovery
        const NGSI9Client = function (url) {
            this.discoveryURL = url;
        };

        NGSI9Client.prototype.findNearbyIoTBroker = function findNearbyIoTBroker(mylocation, num) {
            const discoveryReq = {};
            discoveryReq.entities = [{type: 'IoTBroker', isPattern: true}];

            const nearby = {};
            nearby.latitude = mylocation.latitude;
            nearby.longitude = mylocation.longitude;
            nearby.limit = num;

            discoveryReq.restriction = {
                scopes: [{
                    scopeType: 'nearby',
                    scopeValue: nearby
                }]
            };

            return this.discoverContextAvailability(discoveryReq).then(function (response) {
                if (response.errorCode.code === 200) {
                    const brokers = [];
                    for (let i in response.contextRegistrationResponses) {
                        const contextRegistrationResponse = response.contextRegistrationResponses[i];
                        const providerURL = contextRegistrationResponse.contextRegistration.providingApplication;
                        if (providerURL !== '') {
                            brokers.push(providerURL);
                        }
                    }
                    return brokers;
                } else {
                    return null;
                }
            });
        };

        // discover availability
        NGSI9Client.prototype.discoverContextAvailability = function discoverContextAvailability(discoverReq) {
            return axios({
                method: 'post',
                url: this.discoveryURL + '/discoverContextAvailability',
                data: discoverReq
            }).then(function (response) {
                if (response.status === 200) {
                    return response.data;
                } else {
                    return null;
                }
            });
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


