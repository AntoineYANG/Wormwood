/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 13:39:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 14:56:41
 */

import { Damage } from './Damage';

export namespace Shield {
    export abstract class Shield {
        protected life: number; // all
        protected hp: number; // now
        protected lasting: number; // lasting time
        protected kept: number; // lasted time
        protected constructor(life: number, lasting: number) {
            this.life = life;
            this.hp = this.life;
            this.lasting = lasting;
            this.kept = 0;
        }
        public abstract hurt: (damage: Damage.Damage) => boolean;
        public tick: () => boolean
            = () => {
                this.kept++;
                return this.kept < this.lasting ? true : false;
            };
        public abstract getHP: () => string;
        public getTimer: () => string
            = () => {
                return `remaining time: ${this.lasting - this.kept}`;
            }
    }

    export class PhysicalShield extends Shield {
        public hurt: (damage: Damage.Damage) => boolean
            = (damage: Damage.Damage) => {
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
        public hurt: (damage: Damage.Damage) => boolean
            = (damage: Damage.Damage) => {
                damage.invalidate();
                this.hp--;
                return this.hp > 0 ? true : false;
            }
        public getHP: () => string
            = () => {
                return `Invalidation Shield: ${this.hp}/${this.life}`;
            }
    }

    export class HolyShield extends Shield {
        public hurt: (damage: Damage.Damage) => boolean
            = (damage: Damage.Damage) => {
                damage.invalidate();
                return true;
            }
        public getHP: () => string
            = () => {
                return `Invalidation Shield:  - infinity - `;
            }
    }

    export class MagicShield extends Shield {
        public hurt: (damage: Damage.Damage) => boolean
            = (damage: Damage.Damage) => {
                if (damage.physical > this.hp) {
                    damage.physical -= this.hp;
                    this.hp = 0;
                    return false;
                }
                else {
                    this.hp -= damage.physical;
                    damage.physical = 0;
                }
                if (damage.fire > this.hp) {
                    damage.fire -= this.hp;
                    this.hp = 0;
                    return false;
                }
                else {
                    this.hp -= damage.fire;
                    damage.fire = 0;
                }
                if (damage.cold > this.hp) {
                    damage.cold -= this.hp;
                    this.hp = 0;
                    return false;
                }
                else {
                    this.hp -= damage.cold;
                    damage.cold = 0;
                }
                if (damage.electric > this.hp) {
                    damage.electric -= this.hp;
                    this.hp = 0;
                    return false;
                }
                else {
                    this.hp -= damage.electric;
                    damage.electric = 0;
                    return true;
                }
            }
        public getHP: () => string
            = () => {
                return `Magic Shield: ${this.hp}/${this.life}`;
            }
    }
}