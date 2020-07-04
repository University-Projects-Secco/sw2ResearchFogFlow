import type {ATTRIBUTE, ENTITY} from "utils/FogFlow_Types";

export type IDLE_DETECTION_RESULT =  {
    attributes: {
        status: ATTRIBUTE<string>,
        interval: ATTRIBUTE<number>,
        timestamp: ATTRIBUTE<number>
    }
} & ENTITY;