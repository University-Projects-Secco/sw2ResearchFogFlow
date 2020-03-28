// @flow

import type {ENTITY, ENTITYID} from '../utils/FogFlow_Types';

/**
 * @constructor
 * @abstract
 */
export default class AbstractDevice {
    type: string;
    id: number;

    constructor() {
        if(this.constructor === AbstractDevice){
            throw 'cannot instantiate abstract class!';
        }
    }

    getEntityId(): ENTITYID{
        return {
            id: 'Device.' + this.type + '.' + this.id,
            type: this.type,
            isPattern: false
        }
    }

    /**
     @abstract
     */
    getEntity(): ENTITY{
        throw 'Abstract method called';
    }

    /**
     * @abstract
     */
    update(): void{
        throw 'Abstract method called';
    }
}