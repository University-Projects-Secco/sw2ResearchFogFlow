// @flow
export type POSITION = {
    latitude: number,
    longitude: number
}

export type ENTITY = {
    entityId: ENTITYID,
    attributes: ?{[string]: ATTRIBUTE},
    metadata: ?{[string]:ATTRIBUTE}
}

export type ENTITYID = {
    id: string,
    type: string,
    isPattern: false
}

export type ATTRIBUTE = {
    type: string,
    value: any
}