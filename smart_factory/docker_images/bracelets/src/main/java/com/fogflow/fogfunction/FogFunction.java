package com.fogflow.fogfunction;

import org.jetbrains.annotations.NotNull;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;

import java.util.*;
import java.util.stream.Collectors;

public class FogFunction {
    private static final String RESULT_ID_PREFIX = "Result.statusTime.";
    private static final String ROBOT_TYPE = "Robot";
    private static final double MIN_DISTANCE = 15;
    private static final String POSITION_ATTRIBUTE = "position";

    public static void function(@NotNull ContextObject entity, @NotNull RestHandler restHandler) {
        final List<ContextObject> robots = restHandler.queryContext(Collections.singletonList(
                new EntityId(null,ROBOT_TYPE,true)
        ),Collections.emptyList()).stream().map(ContextObject::new).collect(Collectors.toList());
        restHandler.publishLog("#Robots: "+robots.size());
        robots.stream()
                .filter(robot->distance(entity,robot,restHandler)<MIN_DISTANCE)
                .forEach(robot->restHandler.publishLog(
                        "Error: distance not respected. Robot ID: "+robot.id+
                                ", robot position: "+robot.attributes.get(POSITION_ATTRIBUTE).value+
                                ", human ID: "+entity.id+
                                ", human position: "+entity.attributes.get(POSITION_ATTRIBUTE).value
                ));
    }

    private static double distance(ContextObject bracelet, ContextObject robot, RestHandler restHandler){
        try {
            final JsonParser parser = JsonParserFactory.getJsonParser();
            final Map<String, Object> bracPosition = parser.parseMap(correctJsonFormat(bracelet.attributes.get(POSITION_ATTRIBUTE).value.toString()));
            final Map<String, Object> robotPosition = parser.parseMap(correctJsonFormat(robot.attributes.get(POSITION_ATTRIBUTE).value.toString()));
            final double x1 = ( double ) bracPosition.get("latitude");
            final double x2 = ( double ) robotPosition.get("latitude");
            final double y1 = ( double ) bracPosition.get("longitude");
            final double y2 = ( double ) robotPosition.get("longitude");
            return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
        }catch ( Exception e ){
            restHandler.publishLog("Error: "+e.getMessage());
            return 0;
        }
    }

    private static @NotNull String correctJsonFormat(@NotNull String in){
        return in.replaceAll("="," : ")
                .replaceAll("([a-zA-Z]+)","\"$0\" ");
    }
}
