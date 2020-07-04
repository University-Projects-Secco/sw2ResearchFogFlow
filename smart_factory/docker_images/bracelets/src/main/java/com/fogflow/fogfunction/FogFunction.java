package com.fogflow.fogfunction;

import org.jetbrains.annotations.NotNull;

import java.util.*;
import java.util.stream.Collectors;

public class FogFunction {
    private static final String RESULT_ID_PREFIX = "Result.statusTime.";
    private static final String RESULT_TYPE = "Result";
    private static final String TIME_ATTRIBUTE = "time";
    private static final String STATUS_ATTRIBUTE = "status";
    private static final String LAST_RESULT_ATTRIBUTE = "last_interval";
    private static final String ROBOT_TYPE = "Robot";
    private static final double MIN_DISTANCE = 15;
    private static final String POSITION_ATTRIBUTE = "position";

    public static void function(@NotNull ContextObject entity, @NotNull RestHandler restHandler) {
        final String originalEntityId = entity.id.replace(RESULT_ID_PREFIX,"");
        if(((String)entity.attributes.get(STATUS_ATTRIBUTE).value).equalsIgnoreCase("idle") && ((int)entity.attributes.get(LAST_RESULT_ATTRIBUTE).value)>0){
            restHandler.publishLog("IDLE ERROR: "+entity.id.replace(RESULT_ID_PREFIX,""));
            final List<ContextObject> robots = restHandler.queryContext(Collections.singletonList(
                    new EntityId(null,ROBOT_TYPE,true)
            ),Collections.emptyList()).stream().map(ContextObject::new).collect(Collectors.toList());
            robots.stream()
                    .map(robot->"position: "+robot.attributes.get(POSITION_ATTRIBUTE).value.getClass().getName())
                    .forEach(restHandler::publishLog);
        }
    }
}
