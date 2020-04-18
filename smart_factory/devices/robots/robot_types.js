// @flow

import type {POSITION} from "utils/FogFlow_Types";

type FACTORY_PROFILE = {
    location: POSITION,
    id: number,
    size: number[]
}

type ROBOT_PROFILE = {
    moving_speed: number,
    working_speed: number,
    job_size: number,
    status_change_chance: number
}

export type ROBOT_CONFIGURATION = {
    factory: FACTORY_PROFILE,
    robot: ROBOT_PROFILE
}