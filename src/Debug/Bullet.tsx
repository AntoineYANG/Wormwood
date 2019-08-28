/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 16:15:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 19:06:14
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
            <circle
                cx={this.state.pos}
                cy={this.props.arr}
                r={10}
                style={{fill: this.getPic(), stroke: `black`}}
            />
        )
    }

    public hit: () => boolean
        = () => {
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
            <ellipse
                cx={this.state.pos}
                cy={this.props.arr}
                rx={30}
                ry={6}
                style={{fill: this.getPic()}}
            />
        )
    }

    public hit: () => boolean
        = () => {
            return false;
        }
}

export default Bullet;
