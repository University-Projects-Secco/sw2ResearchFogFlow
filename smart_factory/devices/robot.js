const log = require('loglevel');
const AbstractDevice = require('./AbstractDevice');

class Robot extends AbstractDevice {

    /**
     * @type {number}
     */
    jobProgression = 0;
    /**
     * @type {number}
     */
    status;

    /**
     * @type {Readonly<{idle: number, working: number, moving: number}>}
     */
    static statusEnum = Object.freeze({'idle':0,'working':1,'moving':2});

    constructor() {
        super();
        this.status=Robot.statusEnum.idle;
        this.position = [this.profile.location.latitude, this.profile.location.longitude];
    };

    /**
     * @returns {string}
     */
    getStatus(){

        for(let statusString in Robot.statusEnum)
            if (Robot.statusEnum[statusString] === this.status)
                return statusString;
        throw 'Unexpected status index: '+this.status;

    }

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
        switch (this.status) {
            case Robot.statusEnum.moving:
                this._move();
                break;
            case Robot.statusEnum.idle:
                this._idle();
                break;
            case Robot.statusEnum.working:
                this._work();
                break;
        }
    }

    /**
     * @returns {{entityId: {id: string, type: string, isPattern: boolean}, attributes: $ObjMap<{type: string, value: Object}>, metadata: $ObjMap<{type: string, value: Object}>}}
     */
    fillAttributes() {
        const contextEntity = super.fillAttributes();
        contextEntity.attributes = {
            status: {
                type: 'string',
                value: this.getStatus()
            },
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
        contextEntity.metadata = {
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
        return contextEntity;
    }

    /**
     * @returns {void}
     */
    _updateStatus(){
        if(Math.random()<this.profile.simulation.changeStatusProb) {
            const keys = Object.keys(Robot.statusEnum);
            this.status = Robot.statusEnum[keys[Math.floor(Math.random() * keys.length)]];
        }
    }

    /**
     * @returns {void}
     */
    _move(){
        const movingDirection = Math.floor(Math.random()*this.position.length);
        const speed = this.profile.robotParams.movingSpeed;
        let movingSign;
        const sizes = this.profile.size;

        if(this.position[movingDirection] + speed > sizes[movingDirection]) movingSign = -1;
        else if(this.position[movingDirection] - speed < 0) movingSign = 1;
        else movingSign = Math.sign(Math.random()-.5); //Eventually this will be 0, no problem

        this.position[movingDirection] += (speed * movingSign);

        log.info('Moved to ' + this.position);

        this._updateStatus();
    }

    /**
     * @returns {void}
     */
    _work(){
        this.jobProgression += this.profile.robotParams.workingSpeed;
        if(this.jobProgression >= this.profile.robotParams.jobSize) {
            this.jobProgression = 0;
            this._updateStatus();
        }
        log.info('Working progression: '+this.jobProgression);
    }

    /**
     * @returns {void}
     */
    _idle(){
        this._updateStatus();
    }

}

/**
 * @type {{factorySizes: [*, *], robotParams: {jobSize: undefined, workingSpeed: undefined, movingSpeed: undefined}, id: undefined, iconURL: undefined, factoryLocation: {latitude: undefined, longitude: undefined}}}
 */
Robot.prototype.profile = {
    location: {
        latitude: 0,
        longitude: 0
    },
    changeStatusProb: 0.2,
    factorySizes: [100,100],
    robotParams: {
        movingSpeed: 5,
        jobSize: 100,
        workingSpeed: 5
    }
}

Object.defineProperty(Robot.prototype,'type',{value: 'Robot', writable: false})
module.exports = Robot;