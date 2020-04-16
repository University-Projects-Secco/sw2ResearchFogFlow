package com.fogflow.fogfunction;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class FogFunction {
    public static void main(String[] args) {
        RestHandler restHandler = new RestHandler();
        restHandler.BrokerURL = "http://192.168.1.4:8070/ngsi10";
        List<ContextElement> queryResults = restHandler.queryContext(Collections.singletonList(
                new EntityId("PeopleCounter." + (Integer.parseInt("PeopleCounter.0".split("\\.")[1]) + 0), null, false)),
                Collections.emptyList());

        String results = queryResults.parallelStream().map(e -> e.entityId.id).collect(Collectors.joining(", "));
        System.out.println(results);

        ContextObject resultEntity = new ContextObject();
        resultEntity.id = "PeopleCounter.0".replace("PeopleCounter", "EBoard");
        resultEntity.type = "EBoard";

        ContextAttribute attr = new ContextAttribute();
        attr.name = "next";
        attr.type = "string";
        attr.value = queryResults.parallelStream().findAny().map(e -> e.entityId.id).orElse("Not found");

        resultEntity.attributes.put("next", attr);

        restHandler.publishResult(resultEntity, false);

    }

    public static void function(ContextObject entity, RestHandler restHandler) {
        System.out.println(entity.id);
        System.out.println(entity.type);

        //Collections.singletonList(new Scope.StringQuery(""))
        List<ContextElement> queryResults = restHandler.queryContext(Collections.singletonList(
                new EntityId("PeopleCounter." + (Integer.parseInt(entity.id.split("\\.")[1]) + 1), null, false)),
                Collections.emptyList());

        //String results = queryResults.parallelStream().map(e -> e.entityId.id).collect(Collectors.joining(", "));

        ContextObject resultEntity = new ContextObject();
        resultEntity.id = entity.id.replace("PeopleCounter", "EBoard");
        resultEntity.type = "EBoard";

        ContextAttribute attr = new ContextAttribute();
        attr.name = "next";
        attr.type = "command";
        attr.value = queryResults.parallelStream().findAny().map(e -> e.entityId.id).orElse("Not found");

        resultEntity.attributes.put("next", attr);

        restHandler.publishResult(resultEntity, true);

        resultEntity = new ContextObject();
        resultEntity.id = entity.id.replace("PeopleCounter", "EBoard");
        resultEntity.type = "Result";

        attr = new ContextAttribute();
        attr.name = "next_log";
        attr.type = "string";
        attr.value = queryResults.parallelStream().findAny().map(e -> e.entityId.id).orElse("Not found");;

        resultEntity.attributes.put("next", attr);

        restHandler.publishResult(resultEntity, false);
    }
}
