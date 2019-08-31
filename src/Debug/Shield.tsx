/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 13:39:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-01 02:27:58
 */

import { Invator, Tower } from "./Living";
import { Game_State, Game } from "./Game";


export interface ShieldState {
    hp: number
}

export abstract class Shield {
    protected life: number;
    protected lasting: number;
    protected hp: number;
    protected kept: number = 0;
    protected owner: Tower | Invator | null = null;

    public constructor(owner: Tower | Invator, life: number, lasting: number) {
        this.owner = owner;
        this.life = life;
        this.hp = this.life;
        this.lasting = lasting;
        this.tick = this.tick.bind(this);
        setInterval(this.tick, 50);
    }

    public abstract hurt: (damage: {physical: number, fire: number, cold: number, electric: number}) => boolean;
    public tick: () => boolean
        = () => {
            if (Game.start().state.gameState !== Game_State.going || !this.alive()) {
                return false;
            }
            this.kept += 50;
            return this.kept < this.lasting ? true : false;
        };
    public abstract getHP: () => string;
    public getTimer: () => string
        = () => {
            return `remaining time: ${this.lasting - this.kept}`;
        }
    public alive(): boolean {
        return this.hp > 0 && this.kept < this.lasting;
    }
    public rate(): number {
        let r: number = this.hp / this.life;
        r = r > 0.8 ? 1.0 : r < 0.2 ? 0.2 : r;
        return r;
    }
    public passed(): number {
        return this.kept;
    }
}

export class PhysicalShield extends Shield {
    public hurt: (damage: {physical: number, fire: number, cold: number, electric: number}) => boolean
        = (damage: {physical: number, fire: number, cold: number, electric: number}) => {
            if (damage.physical > this.hp) {
                damage.physical -= this.hp;
                this.hp = 0;
                return false;
            }
            else {
                this.hp -= damage.physical;
                damage.physical = 0;
                return true;
            }
        }
    public getHP: () => string
        = () => {
            return `Physical Shield: ${this.hp}/${this.life}`;
        }
}

export class InvalidationShield extends Shield {
    public hurt: (damage: {physical: number, fire: number, cold: number, electric: number}) => boolean
        = (damage: {physical: number, fire: number, cold: number, electric: number}) => {
            damage.physical = 1;
            damage.fire = 0;
            damage.cold = 0;
            damage.electric = 0;
            this.hp -= 1;
            return this.hp > 0 ? true : false;
        }
    public getHP: () => string
        = () => {
            return `Invalidation Shield: ${this.hp}/${this.life}`;
        }
}

export class HolyShield extends Shield {
    public hurt: (damage: {physical: number, fire: number, cold: number, electric: number}) => boolean
        = (damage: {physical: number, fire: number, cold: number, electric: number}) => {
            damage.physical = 0;
            damage.fire = 0;
            damage.cold = 0;
            damage.electric = 0;
            return true;
        }
    public getHP: () => string
        = () => {
            return `Invalidation Shield:  - infinity - `;
        }
}

export class MagicShield extends Shield {
    public hurt: (damage: {physical: number, fire: number, cold: number, electric: number}) => boolean
        = (damage: {physical: number, fire: number, cold: number, electric: number}) => {
            let hp: number = this.hp;
            if (damage.physical > hp) {
                damage.physical -= hp;
                this.hp = 0;
                return false;
            }
            else {
                hp -= damage.physical;
                damage.physical = 0;
            }
            if (damage.fire > hp) {
                damage.fire -= hp;
                this.hp = 0;
                return false;
            }
            else {
                hp -= damage.fire;
                damage.fire = 0;
            }
            if (damage.cold > hp) {
                damage.cold -= hp;
                this.hp = 0;
                return false;
            }
            else {
                hp -= damage.cold;
                damage.cold = 0;
            }
            if (damage.electric > hp) {
                damage.electric -= hp;
                this.hp = 0;
                return false;
            }
            else {
                hp -= damage.electric;
                damage.electric = 0;
                this.hp = hp;
                return true;
            }
        }
    public getHP: () => string
        = () => {
            return `Magic Shield: ${this.hp}/${this.life}`;
        }
}
