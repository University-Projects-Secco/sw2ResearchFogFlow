/**
 *  @abstract
 */
class AbstractDevice {
    id;
    static nextId = 0;

    /**
     *  @abstract
     */
    update() {
    }

    /**
     *  @abstract
     */
    fillAttributes() {
        return {
            entityId: this.getAsEntity()
        }
    }


    //OPT: move to a superclass
    getAsEntity() {
        return {
            id: 'Device.' + this.type + '.' + this.id,
            type: this.type,
            isPattern: false
        }
    }
}

/**
 * @abstract
 * @type {undefined}
 */
AbstractDevice.prototype.type = undefined;