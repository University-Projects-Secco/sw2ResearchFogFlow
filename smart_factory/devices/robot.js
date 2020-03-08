const log = require('loglevel');

class Robot {
    constructor(initialStatus) {
        if(!Robot.initialized) throw 'Class not initialized';
        if(!initialStatus) initialStatus = 0;
        switch (typeof initialStatus) {
            case "number": this.status = initialStatus; break;
            case "string": this.status = Robot.statusEnum[initialStatus]; break;
            default: throw 'Invalid constructor parameter';
        }
        this.position = [Robot.simulation.factoryLocation.latitude, Robot.simulation.factoryLocation.longitude];
        this.jobProgression = 0;
    };

    static initClass(simulation){
        Robot.statusEnum = Object.freeze({'idle':0,'working':1,'moving':2});
        Robot.simulation = simulation;
        Robot.initialized = true;
    }

    getStatus(){
        for(let statusString in Robot.statusEnum)
            if(Robot.statusEnum[statusString] === this.status)
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
            case Robot.statusEnum.moving: this.move(); break;
            case Robot.statusEnum.idle: this.idle(); break;
            case Robot.statusEnum.working: this.work(); break;
        }
    }

    updateStatus(){
        this.jobProgression = 0;
        const changeStatusProb = Robot.simulation.changeStatusProb;
        if(Math.random()>changeStatusProb) {
            const keys = Object.keys(Robot.statusEnum);
            this.status = Robot.statusEnum[keys[Math.floor(Math.random() * keys.length)]];
        }

        log.info('Status changed to '+ this.getStatus())
    }

    move(){
        const movingDirection = Math.floor(Math.random()*this.position.length);
        const speed = Robot.simulation.robotParams.movingSpeed;
        let movingSign;
        const sizes = Robot.simulation.factorySizes;

        if(this.position[movingDirection] + speed > sizes[movingDirection]) movingSign = -1;
        else if(this.position[movingDirection] - speed < 0) movingSign = 1;
        else movingSign = Math.sign(Math.random()-.5); //Eventually this will be 0, no problem

        this.position[movingDirection] += (speed * movingSign);

        log.info('Moved to ' + this.position);

        this.updateStatus();
    }

    work(){
        this.jobProgression += Robot.simulation.robotParams.workingSpeed;
        if(this.jobProgression >= Robot.simulation.robotParams.jobSize)
            this.updateStatus();

        log.info('Working progression: '+this.jobProgression);
    }

    idle(){
        this.updateStatus();
    }

}

module.exports = Robot;