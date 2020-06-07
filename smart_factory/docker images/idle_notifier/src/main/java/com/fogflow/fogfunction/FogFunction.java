package com.fogflow.fogfunction;


import org.jetbrains.annotations.NotNull;

import java.util.*;

public class FogFunction {
    private static final String RESULT_ID_PREFIX = "Result.statusTime.";
    private static final String RESULT_TYPE = "Result";
    private static final String TIME_ATTRIBUTE = "time";
    private static final String STATUS_ATTRIBUTE = "status";
    private static final String LAST_RESULT_ATTRIBUTE = "last_interval";
    public static void function(@NotNull ContextObject entity, @NotNull RestHandler restHandler) {
        final String originalEntityId = entity.id.replace(RESULT_ID_PREFIX,"");
        if(((String)entity.attributes.get(STATUS_ATTRIBUTE).value).equalsIgnoreCase("idle") && ((int)entity.attributes.get(LAST_RESULT_ATTRIBUTE).value)>10){
            publishLog("IDLE ERROR: "+entity.id.replace(RESULT_ID_PREFIX,""),restHandler);
            ContextObject error = new ContextObject();
            error.id = "ERROR: "+originalEntityId;
            error.type = "Error";
            ContextAttribute description = new ContextAttribute();
            description.name = "error";
            description.type = "string";
            description.value = "Entity "+originalEntityId+" was idle for too long";
            ContextAttribute interval = new ContextAttribute();
            interval.name = "time_passed";
            interval.type = "number";
            interval.value = entity.attributes.get(LAST_RESULT_ATTRIBUTE);
            ContextMetadata time = new ContextMetadata();
            time.name = "time";
            time.type = "string";
            time.value = new Date().toString();
        }
    }

    private static void publishLog(@NotNull String value, @NotNull RestHandler restHandler) {
        ContextObject resultEntity = new ContextObject();
        resultEntity.id = "Log "+new Date().toString();
        resultEntity.type = "Log";
        ContextAttribute attr = new ContextAttribute();
        attr.name = "text";
        attr.type = "string";
        attr.value = value;
        resultEntity.attributes.put("text", attr);
        restHandler.publishResult(resultEntity, false);
    }
}
