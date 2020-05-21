package com.fogflow.fogfunction;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class Config {
    Map<String, String> details = new LinkedHashMap<>();

    @JsonAnySetter
    void setDetail(String key, String value) {
        details.put(key, value);
    }
}

class StatusCode {
    public int code;
    public String reasonPhrase;
    public String details;

    public StatusCode() {

    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getReasonPhrase() {
        return reasonPhrase;
    }

    public void setReasonPhrase(String reasonPhrase) {
        this.reasonPhrase = reasonPhrase;
    }

    public String getDetails() {
        return details;
    }

    public void setDetailsn(String details) {
        this.details = details;
    }
}

class EntityId {
    public String id;
    public String type;
    public boolean isPattern;

    public EntityId(String id, String type, boolean isPattern) {
        this.id = id;
        this.type = type;
        this.isPattern = isPattern;
    }

    public EntityId() {

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean getIsPattern() {
        return isPattern;
    }

    public void setIsPattern(boolean isPattern) {
        this.isPattern = isPattern;
    }
}

class ContextMetadata {
    public String name;
    public String type;
    public Object value;

    public ContextMetadata() {

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}

class ContextAttribute {
    public String name;
    public String type;
    public Object value;

    @JsonProperty("metadata")
    public List<ContextMetadata> metadata;

    public ContextAttribute() {

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    @JsonIgnore
    public List<ContextMetadata> getMetadata() {
        if (metadata == null) {
            metadata = new ArrayList<ContextMetadata>();
        }

        return metadata;
    }

    @JsonIgnore
    public void setMetadata(List<ContextMetadata> metadata) {
        this.metadata = metadata;
    }
}

class ContextElement {
    public EntityId entityId;

    @JsonProperty("attributes")
    public List<ContextAttribute> attributes;

    @JsonProperty("domainMetadata")
    public List<ContextMetadata> domainMetadata;

    public ContextElement() {
        attributes = new ArrayList<ContextAttribute>();
        domainMetadata = new ArrayList<ContextMetadata>();
    }

    public ContextElement(ContextObject obj) {
        entityId = new EntityId();

        entityId.id = obj.id;
        entityId.type = obj.type;
        entityId.isPattern = false;

        for (Map.Entry<String, ContextAttribute> entry : obj.attributes.entrySet()) {
            if (attributes == null) {
                attributes = new ArrayList<ContextAttribute>();
            }
            attributes.add(entry.getValue());
        }

        for (Map.Entry<String, ContextMetadata> entry : obj.domainMetadata.entrySet()) {
            if (domainMetadata == null) {
                domainMetadata = new ArrayList<ContextMetadata>();
            }
            domainMetadata.add(entry.getValue());
        }
    }

    public EntityId getEntityId() {
        return entityId;
    }

    public void setEntityId(EntityId entityId) {
        this.entityId = entityId;
    }

    @JsonIgnore
    public List<ContextAttribute> getAttributes() {
        return attributes;
    }

    @JsonIgnore
    public void setAttributes(List<ContextAttribute> attributes) {
        this.attributes = attributes;
    }

    @JsonIgnore
    public List<ContextMetadata> getDomainMetadata() {
        return domainMetadata;
    }

    @JsonIgnore
    public void setDomainMetadata(List<ContextMetadata> domainMetadata) {
        this.domainMetadata = domainMetadata;
    }
}

class ContextElementResponse {
    public ContextElement contextElement;
    public StatusCode statusCode;

    public ContextElementResponse() {

    }

    public ContextElement getContextElement() {
        return contextElement;
    }

    public void setContextElement(ContextElement contextElement) {
        this.contextElement = contextElement;
    }

    public StatusCode getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(StatusCode statusCode) {
        this.statusCode = statusCode;
    }
}

class Notification {
    public String subscriptionId;
    public String originator;

    @JsonProperty("contextResponses")
    public List<ContextElementResponse> contextResponses;

    public Notification() {
        contextResponses = new ArrayList<ContextElementResponse>();
    }

    public String getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(String subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public String getOriginator() {
        return originator;
    }

    public void setOriginator(String originator) {
        this.originator = originator;
    }

    @JsonIgnore
    public List<ContextElementResponse> getResponse() {
        return contextResponses;
    }

    @JsonIgnore
    public void setResponse(List<ContextElementResponse> contextResponses) {
        this.contextResponses = contextResponses;
    }
}

class ContextObject {
    public String id;
    public String type;

    public Map<String, ContextAttribute> attributes = new LinkedHashMap<>();

    public Map<String, ContextMetadata> domainMetadata = new LinkedHashMap<>();

    public ContextObject() {

    }

    public ContextObject(ContextElement element) {
        id = element.entityId.id;
        type = element.entityId.type;

        for (ContextAttribute attr : element.attributes) {
            attributes.put(attr.name, attr);
        }

        for (ContextMetadata meta : element.domainMetadata) {
            domainMetadata.put(meta.name, meta);
        }
    }
}

class UpdateContextRequest {
    public String updateAction;

    @JsonProperty("contextElements")
    public List<ContextElement> contextElements;

    public UpdateContextRequest() {
        contextElements = new ArrayList<>();
    }

    @JsonIgnore
    public List<ContextElement> getContextElements() {
        return contextElements;
    }

    @JsonIgnore
    public void setContextElements(List<ContextElement> contextElements) {
        this.contextElements = contextElements;
    }

    public void addContextElement(ContextElement element) {
        this.contextElements.add(element);
    }

    public String getUpdateAction() {
        return updateAction;
    }

    public void setUpdateAction(String updateAction) {
        this.updateAction = updateAction;
    }
}

abstract class Scope {
    static class StringQuery extends Scope {
        final String scopeType = "stringQuery";
        String scopeValue;

        public StringQuery(String scopeValue) {
            this.scopeValue = scopeValue;
        }
    }
}

class QueryContextRequest {
    @JsonProperty("entities")
    List<EntityId> entities = new ArrayList<>();
    @JsonProperty("restriction")
    Map<String, ArrayList<Scope>> restriction = new LinkedHashMap<>();

    public QueryContextRequest() {
        restriction.put("scopes", new ArrayList<>());
    }

    @JsonIgnore
    public ArrayList<Scope> getScopes() {
        return restriction.get("scopes");
    }
}

class ContextResponse {
    @JsonProperty("contextResponses")
    List<ContextElementResponse> contextResponses;
    @JsonProperty("errorCode")
    StatusCode errorCode;

    public ContextResponse() {
        contextResponses = new ArrayList<ContextElementResponse>();
    }

    @JsonIgnore
    public List<ContextElementResponse> getContextResponses() {
        return contextResponses;
    }

    @JsonIgnore
    public void setContextResponses(List<ContextElementResponse> contextResponses) {
        this.contextResponses = contextResponses;
    }

    public StatusCode getStatusCode() {
        return errorCode;
    }

    public void setStatusCode(StatusCode errorCode) {
        this.errorCode = errorCode;
    }
}
