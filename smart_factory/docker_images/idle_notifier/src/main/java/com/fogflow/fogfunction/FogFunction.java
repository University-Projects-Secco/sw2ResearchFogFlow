package com.fogflow.fogfunction;


import org.jetbrains.annotations.NotNull;

import java.util.*;

public class FogFunction {
    private static final String RESULT_ID_PREFIX = "Result.statusTime.";
    private static final String ERROR_TYPE = "Error";
    private static final String TIME_ATTRIBUTE = "time";
    private static final String STATUS_ATTRIBUTE = "status";
    private static final String LAST_RESULT_ATTRIBUTE = "last_interval";
    private static final int ERROR_LIMIT = 3 * 1000;   //ms
    private static final boolean LOG = false;
    public static void function(@NotNull ContextObject entity, @NotNull RestHandler restHandler) {
        restHandler.publishLog("Enter idle notifier");
        final String originalEntityId = entity.id.replace(RESULT_ID_PREFIX,"");
        if(((String)entity.attributes.get(STATUS_ATTRIBUTE).value).equalsIgnoreCase("idle") && ((int)entity.attributes.get(LAST_RESULT_ATTRIBUTE).value)>ERROR_LIMIT){
            restHandler.publishLog("IDLE ERROR: "+entity.id.replace(RESULT_ID_PREFIX,""));
            ContextObject error = new ContextObject();
            error.id = "ERROR: "+originalEntityId;
            error.type = ERROR_TYPE;
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
            time.value = new Date(Long.parseLong(entity.attributes.get(TIME_ATTRIBUTE).value.toString()));
            error.attributes.put("description",description);
            error.attributes.put("interval",interval);
            error.domainMetadata.put("time",time);
            restHandler.publishResult(error,false);
        }
    }
}
