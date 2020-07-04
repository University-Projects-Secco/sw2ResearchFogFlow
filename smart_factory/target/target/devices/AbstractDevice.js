//      

                                                             

/**
 * @constructor
 * @abstract
 */
class AbstractDevice {
    type        ;
    id        ;

    constructor() {
        if(this.constructor === AbstractDevice){
            throw 'cannot instantiate abstract class!';
        }
    }

    getEntityId()          {
        return {
            id: 'Device.' + this.type + '.' + this.id,
            type: this.type,
            isPattern: false
        }
    }

    /**
     @abstract
     */
    getEntity()        {
        throw 'Abstract method called';
    }

    /**
     * @abstract
     */
    update()      {
        throw 'Abstract method called';
    }
}

module .exports = AbstractDevice;