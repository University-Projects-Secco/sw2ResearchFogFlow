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
        final String id = RESULT_ID_PREFIX + entity.id;
        List<ContextElement> queryResults = restHandler.queryContext(Collections.singletonList(
                new EntityId( id , RESULT_TYPE,true)),
                Collections.emptyList());

        if(queryResults.size()>1){
            restHandler.publishLog("Too many results for one device!");
            return;
        }
        final ContextObject newResult = new ContextObject();
        newResult.id = id;
        newResult.type = RESULT_TYPE;
        Map<String, ContextAttribute> attributes = new HashMap<>();
        attributes.put(TIME_ATTRIBUTE,new ContextAttribute());
        attributes.put(LAST_RESULT_ATTRIBUTE,new ContextAttribute());
        attributes.put(STATUS_ATTRIBUTE,entity.attributes.get(STATUS_ATTRIBUTE));
        attributes.get(TIME_ATTRIBUTE).name = TIME_ATTRIBUTE;
        attributes.get(TIME_ATTRIBUTE).type = "number";
        attributes.get(TIME_ATTRIBUTE).value = new Date().getTime();
        attributes.get(LAST_RESULT_ATTRIBUTE).name = LAST_RESULT_ATTRIBUTE;
        attributes.get(LAST_RESULT_ATTRIBUTE).type = "number";
        attributes.get(LAST_RESULT_ATTRIBUTE).value = 0;
        if(!queryResults.isEmpty() ){
            final ContextObject lastResult = new ContextObject(queryResults.get(0));
            if(lastResult.attributes.get(STATUS_ATTRIBUTE).value.equals(entity.attributes.get(STATUS_ATTRIBUTE).value))
                attributes.get(LAST_RESULT_ATTRIBUTE).value =
                        (Long.parseLong(lastResult.attributes.get(LAST_RESULT_ATTRIBUTE).value.toString()) + //new interval = old interval + new time - old time
                        Long.parseLong(attributes.get(TIME_ATTRIBUTE).value.toString()) -
                        Long.parseLong(lastResult.attributes.get(TIME_ATTRIBUTE).value.toString()));
        }
        newResult.attributes = attributes;
        restHandler.publishResult(newResult,false);
    }

    
}
