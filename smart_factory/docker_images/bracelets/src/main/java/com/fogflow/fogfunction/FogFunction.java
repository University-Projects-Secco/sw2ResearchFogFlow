package com.fogflow.fogfunction;

import org.jetbrains.annotations.NotNull;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;

import java.util.*;
import java.util.stream.Collectors;

public class FogFunction {
    private static final String ROBOT_TYPE = "Robot";
    private static final String ERROR_TYPE = "Error";
    private static final double MIN_DISTANCE = 15;
    private static final String POSITION_ATTRIBUTE = "position";

    public static void function(@NotNull ContextObject entity, @NotNull RestHandler restHandler) {
        final List<ContextObject> robots = restHandler.queryContext(Collections.singletonList(
                new EntityId(null,ROBOT_TYPE,true)
        ),Collections.emptyList()).stream().map(ContextObject::new).collect(Collectors.toList());
        robots.stream()
                .filter(robot->distance(entity,robot,restHandler)<MIN_DISTANCE)
                .forEach(robot->{
                    final ContextObject error = new ContextObject();
                    error.id = "ERROR: "+entity.id;
                    error.type = ERROR_TYPE;
                    final ContextAttribute description = new ContextAttribute();
                    description.name = "error";
                    description.type = "string";
                    description.value = "Distance not respected. Robot: "+robot.id+". Bracelet: "+entity.id;
                    final ContextAttribute robot_position = new ContextAttribute();
                    robot_position.name = "robot_position";
                    robot_position.type = "point";
                    robot_position.value = robot.attributes.get(POSITION_ATTRIBUTE).value;
                    final ContextAttribute bracet_position = new ContextAttribute();
                    bracet_position.name = "bracelet_position";
                    bracet_position.type = "point";
                    bracet_position.value = entity.attributes.get(POSITION_ATTRIBUTE).value;
                    final ContextMetadata time = new ContextMetadata();
                    time.name = "time";
                    time.type = "string";
                    time.value = new Date().toString();

                    error.attributes.put("description",description);
                    error.attributes.put("robot_position",robot_position);
                    error.attributes.put("bracelet_position",bracet_position);
                    error.domainMetadata.put("time",time);
                    restHandler.publishResult(error,false);
                });
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
