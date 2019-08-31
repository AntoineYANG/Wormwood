/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 16:15:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-31 17:02:54
 */

import { Component } from 'react';
import { Side } from './Living';
import { Game } from './Game';
import React from 'react';

export interface Bullet_props {
    type: string,
    id: number,
    side: Side,
    pic: string,
    physical: number,
    fire: number,
    cold: number,
    electric: number,
    debuff: null,
    speed: number,
    line: number,
    arr: number,
    pos: number,
    update: (out: number) => void
}

export interface Bullet_state {
    pos: number,
    alive: boolean
}

abstract class Bullet extends Component<Bullet_props, Bullet_state, any> {
    public constructor(props: Bullet_props) {
        super(props);
        this.state = {
            pos: this.props.pos,
            alive: true
        };
        this.tick = this.tick.bind(this);
        this.update = this.props.update.bind(this);
    }

    public getProps(): Bullet_props {
        return {...this.props, pos: this.state.pos};
    }

    protected update: (out: number) => void;

    public move(): boolean {
        let pos: number = this.state.pos;
        if (this.props.side === Side.defencer) {
            pos += this.props.speed;
            this.setState({
                pos
            });
            return pos > Game.start().getMargin(3) + Game.start().getPadding(0) + Game.start().getPadding(1)
                    + Game.start().getCor() * Game.start().getSpan()
                ? false : true;
        }
        else {
            pos -= this.props.speed;
            this.setState({
                pos
            });
            return pos < 0 ? false : true;
        }
    }

    public abstract render(): JSX.Element;

    public getPic: () => string
        = () => {
            return this.props.pic;
        }

    public abstract hit: () => boolean;

    public tick(): void {
        if (!this.state || !this.state.alive) {
            return;
        }
        let alive: boolean = this.move() && !this.hit();
        if (!alive) {
            this.setState({
                alive: false
            });
            this.update(this.props.id);
        }
    }
}

export class NoBullet extends Bullet {
    public constructor(props: Bullet_props) {
        super(props);
        this.state = {
            pos: this.props.pos,
            alive: true
        };
    }

    public componentDidMount(): void {
        this.getPic = () => 'white';
        setInterval(this.tick, 20);
    }

    public render(): JSX.Element {
        return (
            <image xmlns={`http://www.w3.org/2000/svg`} xlinkHref={require(`../pic/Bullet/BulletA.png`)}
                x={this.state.pos} y={this.props.arr} width={0} height={0} opacity={0} />
        )
    }

    public hit: () => boolean
        = () => {
            if (this.props.side === Side.defencer) {
                for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
                    if (this.props.line !== Game.start().EnemyInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos >= Game.start().EnemyInstance[i].pos - 36 + Game.start().getMargin(3) + Game.start().getPadding(0)
                            && this.state.pos <= Game.start().getMargin(3) + Game.start().getPadding(0) + Game.start().EnemyInstance[i].pos) {
                        Game.start().EnemyInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                        return true;
                    }
                }
            }
            else {
                for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                    if (this.props.line !== Game.start().TowerInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos >= Game.start().TowerInstance[i].pos - 36
                            && this.state.pos <= Game.start().TowerInstance[i].pos) {
                        Game.start().TowerInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                        return true;
                    }
                }
            }
            return false;
        }
}

export class BulletA extends Bullet {
    public constructor(props: Bullet_props) {
        super(props);
        this.state = {
            pos: this.props.pos,
            alive: true
        };
    }

    public componentDidMount(): void {
        this.getPic = () => 'white';
        setInterval(this.tick, 20);
    }

    public render(): JSX.Element {
        return (
            <image xmlns={`http://www.w3.org/2000/svg`}
                x={this.state.pos} y={this.props.arr}
                width={`48px`} height={`40px`}
                transform={`translate(0, -42)`}
                xlinkHref={require(`../pic/Bullet/BulletA.png`)} />
        )
    }

    public hit: () => boolean
        = () => {
            if (this.props.side === Side.defencer) {
                for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
                    if (this.props.line !== Game.start().EnemyInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos >= Game.start().EnemyInstance[i].pos - 36 + Game.start().getMargin(3) + Game.start().getPadding(0)
                            && this.state.pos <= Game.start().getMargin(3) + Game.start().getPadding(0) + Game.start().EnemyInstance[i].pos) {
                        Game.start().EnemyInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                        return true;
                    }
                }
            }
            else {
                for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                    if (this.props.line !== Game.start().TowerInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos >= Game.start().TowerInstance[i].pos - 36
                            && this.state.pos <= Game.start().TowerInstance[i].pos) {
                        Game.start().TowerInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                        return true;
                    }
                }
            }
            return false;
        }
}

export class BulletB extends Bullet {
    public constructor(props: Bullet_props) {
        super(props);
        this.state = {
            pos: this.props.pos,
            alive: true
        };
    }

    public componentDidMount(): void {
        this.getPic = () => 'orange';
        setInterval(this.tick, 20);
    }

    public render(): JSX.Element {
        return (
            <image xmlns={`http://www.w3.org/2000/svg`}
                x={this.state.pos} y={this.props.arr}
                width={`80px`} height={`36px`}
                transform={`translate(0, -40)`}
                xlinkHref={require(`../pic/Bullet/BulletB.png`)} />
        )
    }

    public hit: () => boolean
        = () => {
            if (this.props.side === Side.defencer) {
                for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
                    if (this.props.line !== Game.start().EnemyInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos >= Game.start().EnemyInstance[i].pos - 36 + Game.start().getMargin(3) + Game.start().getPadding(0)
                            && this.state.pos <= Game.start().getMargin(3) + Game.start().getPadding(0) + Game.start().EnemyInstance[i].pos) {
                        Game.start().EnemyInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                    }
                }
            }
            else {
                for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                    if (this.props.line !== Game.start().TowerInstance[i].arr) {
                        continue;
                    }
                    if (this.state.pos + 50 >= Game.start().TowerInstance[i].pos - 8
                            && this.state.pos + 50 <= Game.start().TowerInstance[i].pos + 8) {
                        Game.start().TowerInstance[i].component.hurt(this.props.physical, this.props.fire, this.props.cold, this.props.electric);
                    }
                }
            }
            return false;
        }
}

export default Bullet;
