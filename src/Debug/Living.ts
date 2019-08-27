/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 12:59:16 
* @Last Modified by: Antoine YANG
* @Last Modified time: 2019-08-27 18:34:20
*/

import { Shield } from "./Shield";
import { Game } from "./Game";
import { Bullet_A } from "./Bullet";

export enum Side {
    defencer, invator
}

interface Living {
    // HP system
    life: number; // all
    hp: number; // now

    // defence system
    armor: number; // defence of physical damage
    physical_dec: number; // slap of physical damage
    fire_resist: number; // resistance rate of fire damage
    cold_resist: number; // resistance rate of cold damage
    electric_resist: number; // resistance rate of electric damage
    magic_dec: number; // slap of fire, cold of magic damage

    shield: Shield.Shield | null; // shield

    getInfo: (level: number) => string;


    // position system
    arr: number;
    cor: number;
}

export enum Action {
    moving, controlled, pre_ani, dur_ani, aft_ani
}

export abstract class Tower {
    protected name: string = `NAME`;
    protected life: number = 0;
    protected hp: number = 0;
    protected armor: number = 0;
    protected physical_dec: number = 0;
    protected fire_resist: number = 0;
    protected cold_resist: number = 0;
    protected electric_resist: number = 0;
    protected magic_dec: number = 0;
    protected shield: Shield.Shield | null = null;
    protected arr: number;
    protected cor: number;
    protected action: Action;
    public constructor(arr: number, cor: number) {
        this.arr = arr;
        this.cor = cor;
        this.action = Action.moving;
        this.waiting = 0;
        this.animation = 0;
    }
    public alive: () => boolean
        = () => this.hp > 0;
    public getInfo: (level: number) => string
        = (level: number) => {
            switch (level) {
                case 0:
                    return ``;
                case 1:
                    return `${this.name}    HP: ${this.hp}/${this.life}`;
                case 2:
                    return `${this.name}    HP: ${this.hp}/${this.life}\n`
                        + `Resistance:     A ${this.armor}  F ${this.fire_resist}  C ${this.cold_resist}  E ${this.electric_resist}`;
            }
            return ``;
        }
    public getPosition: () => Array<number>
        = () => {
            return [this.arr, this.cor];
        }

    protected level: number = 1;
    protected luck: number = 0;
    protected promise: null | (() => void) = null;
    protected abstract prepare: () => void;
        
    protected act: () => void
        = () => {
            if (this.prepare === null) {
                return;
            }
            else {
                this.promise!();
            }
            return;
        }
    protected abstract hit: () => void;
    protected abstract skill1: () => void;
    protected abstract skill2: () => void;
    protected abstract skill3: () => void;

    protected animation: number;
    protected waiting: number;
    public tick: () => void
        = () => {
            if (this.loaded < this.CD) {
                this.loaded += 20;
            }
            if (this.animation >= this.waiting) {
                this.animation = 0;
                switch (this.action) {
                    case Action.moving:
                        this.prepare();
                        this.action = Action.pre_ani;
                        break;
                    case Action.pre_ani:
                        this.act();
                        this.action = Action.dur_ani;
                        break;
                    case Action.dur_ani:
                        this.action = Action.aft_ani;
                        this.waiting = 800;
                        break;
                    case Action.aft_ani:
                        this.action = Action.moving;
                        this.waiting = -1;
                        break;
                }
                this.animation = 0;
            }
            else {
                this.animation += 20;
            }
        };

    protected cost: number = 0;
    public getCost: () => {} = () => this.cost;

    protected CD: number = 0;
    protected loaded: number = 0;
    public getLoaded: () => boolean = () => this.loaded >= this.CD;
}

export abstract class Invator {
    protected name: string = `NAME`;
    protected life: number = 0;
    protected hp: number = 0;
    protected armor: number = 0;
    protected physical_dec: number = 0;
    protected fire_resist: number = 0;
    protected cold_resist: number = 0;
    protected electric_resist: number = 0;
    protected magic_dec: number = 0;
    protected shield: Shield.Shield | null = null;
    protected arr: number;
    protected pos: number;
    protected action: Action;
    public constructor(arr: number, pos: number) {
        this.arr = arr;
        this.pos = pos;
        this.action = Action.moving;
    }
    public alive: () => boolean
        = () => this.hp > 0;
    public getInfo: (level: number) => string
        = (level: number) => {
            switch (level) {
                case 0:
                    return ``;
                case 1:
                    return `${this.name}    HP: ${this.hp}/${this.life}`;
                case 2:
                    return `${this.name}    HP: ${this.hp}/${this.life}\n`
                        + `Resistance:     A ${this.armor}  F ${this.fire_resist}  C ${this.cold_resist}  E ${this.electric_resist}`;
            }
            return ``;
        }
    public getPosition: () => Array<number>
        = () => {
            return [this.arr, this.pos];
        }
        
    protected speed: number = 3.3;
    protected speed_actual: number = 3.3;
    public move: () => boolean
        = () => {
            if (this.action === Action.moving) {
                this.pos -= this.speed_actual;
            }
            if (this.pos < Game.start().getMargin(3) + Game.start().getPadding(0)) {
                return false;
            }
            return true;
        }
    protected abstract hit: () => boolean;
}

export class Adam extends Tower {
    public constructor(arr: number, cor: number, level: number = 0) {
        super(arr, cor);
        this.life = 100;
        this.hp = 100;
        this.armor = 40;
        this.physical_dec = 0;
        this.fire_resist = 5;
        this.cold_resist = 0;
        this.electric_resist = 0;
        this.magic_dec = 0;
        this.level = level;
    }

    protected prepare = () => {
            if (this.level === 0) {
                console.log("Pre: hit");
                this.promise = this.hit;
                this.waiting = 300;
                return;
            }
            let r: number = Math.random() * (1 + this.luck / 100);
            switch (this.level) {
                case 1:
                    if (r >= 0.8) {
                        console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
                case 2:
                    if (r >= 0.88) {
                        console.log("Pre: 2");
                        this.promise = this.skill2;
                        this.waiting = 50;
                        return;
                    }
                    else if (r >= 0.64) {
                        console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
                case 3:
                    if (r >= 0.92) {
                        console.log("Pre: 3");
                        this.promise = this.skill3;
                        this.waiting = 1000;
                        return;
                    }
                    else if (r >= 0.76) {
                        console.log("Pre: 2");
                        this.promise = this.skill2;
                        this.waiting = 50;
                        return;
                    }
                    else if (r >= 0.52) {
                        console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
            }
            console.log("Pre: hit");
            this.promise = this.hit;
            this.waiting = 300;
            return;
        }

    protected hit: () => boolean
        = () => {
            console.log("hit");
            Game.start().append(new Bullet_A(Side.defencer, this.cor, this.arr * Game.start().getSpan()));
            this.waiting = 100;
            return true;
        };

    protected skill1: () => void
        = () => {
            console.log("skill 1");
            this.waiting = 100;
        };

    protected skill2: () => void
        = () => {
            console.log("skill 2");
            this.waiting = 300;
        };
        
    protected skill3: () => void
        = () => {
            console.log("skill 3");
            this.waiting = 800;
        };
}

export default Living;
