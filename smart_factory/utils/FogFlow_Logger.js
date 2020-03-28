// @flow
import log from "loglevel";

class FogFlow_Logger {

    publish: function;
    caller: string;
    level: number;
    stringSeparator=',';


    constructor(caller:string, publish: function) {
        this.publish = publish;
        this.caller = caller;
        FogFlow_Logger.prototype.level = log.levels.INFO;
        FogFlow_Logger.prototype.stringSeparator = ',';
    }

    setLevel(level:number): void{
        this.level = level;
    }

    setDefaultLevel(level:number): void{
        FogFlow_Logger.prototype.level = level;
    }

    setStringSeparator(separator:string): void{
        this.stringSeparator = separator;
    }

    setDefaultStringSeparator(separator:string): void{
        FogFlow_Logger.prototype.stringSeparator = separator;
    }

    trace(...message: any[]) :void{
        evaluateAndPublish(this,log.levels.TRACE,message);
    }

    debug(...message: any[]): void{
        evaluateAndPublish(this,log.levels.DEBUG,message);
    }

    info(...message: any[]): void{
        evaluateAndPublish(this,log.levels.INFO,message);
    }

    warn(...message: any[]): void{
        evaluateAndPublish(this,log.levels.WARN,message);
    }

    error(...message: any[]): void{
        evaluateAndPublish(this,log.levels.ERROR,message);
    }

    static levelToString(level:number): string|null{
        const LEVELS = log.levels;
        switch (level) {
            case LEVELS.TRACE:
                return 'trace';
            case LEVELS.DEBUG:
                return 'debug';
            case LEVELS.INFO:
                return 'info';
            case LEVELS.WARN:
                return 'warn';
            case LEVELS.ERROR:
                return 'error';
            case LEVELS.SILENT:
                return 'silent';
        }
        throw 'invalid level: '+level;
    }

    static levelToNumber(level:string): number {
        const LEVELS = log.levels;
        switch (level) {
            case 'trace':
                return LEVELS.TRACE;
            case 'debug':
                return LEVELS.DEBUG;
            case 'info' :
                return LEVELS.INFO;
            case 'warn' :
                return LEVELS.WARN;
            case 'error' :
                return LEVELS.ERROR;
            case 'silent' :
                return LEVELS.SILENT;
        }
        throw 'invalid level: '+level;
    }
}

function evaluateAndPublish(instance:FogFlow_Logger,level: number,...message: any[]): void{
    if(instance.level<level){
        const stringMsg = message.join(instance.stringSeparator);
        log.trace(instance.caller,stringMsg);
        instance.publish({
            entityID: {
                id: 'log.' + level + instance.caller + Date.now(),
                type: 'log',
                isPattern: false
            },
            attributes: {
                message: {
                    type: 'string',
                    value: message
                }
            }
        });
    }
}

module.exports = FogFlow_Logger;