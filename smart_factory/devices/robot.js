const log = require('loglevel');

class Robot {
    constructor(initialStatus,simulation) {
        if(!Robot.initialized)
            Robot.initClass(simulation);
        if(!initialStatus)
            initialStatus = 0;
        switch (typeof initialStatus) {
            case "number": this.status = initialStatus; break;
            case "string": this.status = Robot.statusEnum[initialStatus]; break;
            default: throw 'Invalid constructor parameter';
        }
        this.position = [this.profile.factoryLocation.latitude, this.profile.factoryLocation.longitude];
        this.jobProgression = 0;
        this.id = Robot.nextId;
        Robot.nextId++;
    };

    static initClass(profile){
        Robot.statusEnum = Object.freeze({'idle':0,'working':1,'moving':2});
        Robot.prototype.profile = profile;
        Robot.prototype.type = 'Robot';
        Robot.nextId=0;
        Robot.initialized = true;
    }

    //noinspection JSUnfilteredForInLoop
    getStatus(){
        for(let statusString in Robot.statusEnum)
            //noinspection JSUnfilteredForInLoop
            if(Robot.statusEnum[statusString] === this.status)
                //noinspection JSUnfilteredForInLoop
                return statusString;
        throw 'Unexpected status index: '+this.status;

    }

    getPosition(){
        return {
            "latitude": this.position[0],
            "longitude": this.position[1]
        }
    }

    update(){
        switch (this.status) {
            case Robot.statusEnum.moving: this.#move(); break;
            case Robot.statusEnum.idle: this.#idle(); break;
            case Robot.statusEnum.working: this.#work(); break;
        }
    }

    //OPT: move to a superclass
    fillAttributes(){
        return {
            entityId: this.getAsEntity(),
            attributes: {
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
            },
            metadata: {
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
            }
        };
    }


    //OPT: move to a superclass
    getAsEntity(){
        return {
            id: 'Device.' + this.type + '.' + this.id,
            type: this.type,
            isPattern: false
        }
    }

    #updateStatus(){
        if(Math.random()<this.profile[`changeStatusProb`]) {
            const keys = Object.keys(Robot.statusEnum);
            this.status = Robot.statusEnum[keys[Math.floor(Math.random() * keys.length)]];
            log.info('Status changed to '+ this.getStatus())
        }
    }

    #move(){
        const movingDirection = Math.floor(Math.random()*this.position.length);
        const speed = this.profile.robotParams.movingSpeed;
        let movingSign;
        const sizes = this.profile.factorySizes;

        if(this.position[movingDirection] + speed > sizes[movingDirection]) movingSign = -1;
        else if(this.position[movingDirection] - speed < 0) movingSign = 1;
        else movingSign = Math.sign(Math.random()-.5); //Eventually this will be 0, no problem

        this.position[movingDirection] += (speed * movingSign);

        log.info('Moved to ' + this.position);

        this.#updateStatus();
    }

    #work(){
        this.jobProgression += this.profile.robotParams.workingSpeed;
        if(this.jobProgression >= this.profile.robotParams.jobSize) {
            this.jobProgression = 0;
            this.#updateStatus();
        }
        log.info('Working progression: '+this.jobProgression);
    }

    #idle(){
        this.#updateStatus();
    }

}

module.exports = Robot;