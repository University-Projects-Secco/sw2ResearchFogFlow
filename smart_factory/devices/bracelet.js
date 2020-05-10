const log = require('loglevel');
const AbstractDevice = require('./AbstractDevice');

class Bracelet extends AbstractDevice {

    /**
     * @type {number}
     */
    jobProgression = 0;

    /**
     * @param {Bracelet.profile} profile
     */
    constructor() {
        super();
        this.position = [this.profile.location.latitude, this.profile.location.longitude];
    };

    /**
     *
     * @returns {{latitude, longitude}}
     */
    getPosition(){
        return {
            latitude: this.position[0],
            longitude: this.position[1]
        }
    }

    /**
     * @returns {void}
     */
    update() {
        this._move();
    }

    /**
     * @returns {{entityId: {id: string, type: string, isPattern: boolean}, attributes: $ObjMap<{type: string, value: Object}>, metadata: $ObjMap<{type: string, value: Object}>}}
     */
    fillAttributes() {
        const attributes = super.fillAttributes();
        attributes.attributes = {
            position: {
                type: 'point',
                value: this.getPosition()
            },
            factory: {
                type: 'string',
                value: this.profile.id
            },
            iconURL: {
                type: 'string',
                value: this.profile.iconURL
            }
        }
        attributes.metadata = {
            location: {
                type: 'point',
                value: this.profile.location
            },
            factory: {
                type: 'string',
                value: this.profile.id
            },
            time: {
                type: 'number',
                value: Date.now()
            }
        };
        return attributes;
    }

    /**
     * @returns {void}
     */
    _move(){
        const movingDirection = Math.floor(Math.random()*this.position.length);
        const speed = this.profile.braceletParams.movingSpeed;
        let movingSign;
        const sizes = this.profile.size;

        if(this.position[movingDirection] + speed > sizes[movingDirection]) movingSign = -1;
        else if(this.position[movingDirection] - speed < 0) movingSign = 1;
        else movingSign = Math.sign(Math.random()-.5); //Eventually this will be 0, no problem

        if (Math.random() > 0.5) {
            this.position[movingDirection] += (speed * movingSign);
            log.info('Moved to ' + this.position);
        } else {
            log.info('movement skipped');
        }
    }

    /**
     * @returns {void}
     */
    _work(){
        this.jobProgression += this.profile.braceletParams.workingSpeed;
        if(this.jobProgression >= this.profile.braceletParams.jobSize) {
            this.jobProgression = 0;
        }
        log.info('Working progression: '+this.jobProgression);
    }


}

/**
 * @type {{factorySizes: [*, *], braceletParams: {jobSize: undefined, workingSpeed: undefined, movingSpeed: undefined}, id: undefined, iconURL: undefined, factoryLocation: {latitude: undefined, longitude: undefined}}}
 */
Bracelet.prototype.profile = {
    location: {
        latitude: 0,
        longitude: 0
    },
    factorySizes: [100,100],
    braceletParams: {
        movingSpeed: 5,
        jobSize: 100,
        workingSpeed: 5
    }
}
;

Object.defineProperty(Bracelet.prototype,'type',{value: 'Bracelet', writable: false})
module.exports = Bracelet;