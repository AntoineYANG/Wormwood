/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 16:15:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 19:06:14
 */

import { Side } from './Living';
import { Game } from './Game';

abstract class Bullet {
    side: Side;
    pic: string = 'null_pic';
    
    // damage
    physical: number = 0;
    fire: number = 0;
    cold: number = 0;
    electric: number = 0;

    debuff: null = null;

    arr: number;
    pos: number;
    speed: number = 50;

    public constructor(side: Side, arr: number, pos: number) {
        this.side = side;
        this.arr = arr;
        this.pos = pos;
    }

    public move(): boolean {
        if (this.side === Side.defencer) {
            this.pos += this.speed;
            return this.pos > Game.start().getMargin(3) + Game.start().getPadding(0) + Game.start().getCor() * Game.start().getSpan()
                ? false : true;
        }
        else {
            this.pos -= this.speed;
            return this.pos < Game.start().getMargin(3) + Game.start().getPadding(0) ? false : true;
        }
    }

    public getPic: () => string
        = () => {
            return this.pic;
        }
    
    public getPosition: () => Array<number>
        = () => {
            return [this.arr, this.pos];
        }

    public abstract hit: () => boolean;
}

export class Bullet_A extends Bullet {
    public hit: () => boolean
        = () => {
            return false;
        }
}

export default Bullet;
