/**
 *  @abstract
 */
class AbstractDevice {
    /**
     * @type {number}
     */
    id;
    /**
     * @type {number}
     */
    static #nextId = 0;

    constructor() {
        this.id = AbstractDevice.#nextId;
        AbstractDevice.#nextId++;
    }

    /**
     *  @abstract
     *  @return {void}
     */
    update() {
    }

    /**
     *  @abstract
     *  @returns {{entityId: {id: string, type: string, isPattern: boolean},attributes: $ObjMap<{type: string, value: object}>, metadata: $ObjMap<{type:string,value:object}>}}
     */
    fillAttributes() {
        return {
            entityId: this.getAsEntity(),
            attributes: {},
            metadata: {}
        }
    }


    /**
     * @returns {{id: string, type: string, isPattern: boolean}}
     */
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
 * @type {string}
 */
AbstractDevice.prototype.type = undefined;

module.exports = AbstractDevice;