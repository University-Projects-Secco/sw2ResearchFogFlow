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
            publishLog("Too many results for one device!",restHandler);
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
            publishLog("last status: "+lastResult.attributes.get(STATUS_ATTRIBUTE).value,restHandler);
            publishLog("new status: "+entity.attributes.get(STATUS_ATTRIBUTE).value,restHandler);
            publishLog("Evaluating 'if': old status: "+lastResult.attributes.get(STATUS_ATTRIBUTE).value+" new status: "+attributes.get(STATUS_ATTRIBUTE).value+
                    "expected new interval: "+( ( long ) lastResult.attributes.get(LAST_RESULT_ATTRIBUTE).value + //new interval = old interval + new time - old time
                                            ( long ) attributes.get(TIME_ATTRIBUTE).value -
                                            ( long ) lastResult.attributes.get(TIME_ATTRIBUTE).value),restHandler);
            if(lastResult.attributes.get(STATUS_ATTRIBUTE).value.equals(entity.attributes.get(STATUS_ATTRIBUTE).value)) {
                attributes.get(LAST_RESULT_ATTRIBUTE).value =
                        ( long ) lastResult.attributes.get(LAST_RESULT_ATTRIBUTE).value + //new interval = old interval + new time - old time
                        ( long ) attributes.get(TIME_ATTRIBUTE).value -
                        ( long ) lastResult.attributes.get(TIME_ATTRIBUTE).value;
                publishLog("Update time\nNew value: "+ attributes.get(LAST_RESULT_ATTRIBUTE).value,restHandler);
            }
        }
        newResult.attributes = attributes;
        restHandler.publishResult(newResult,false);
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
