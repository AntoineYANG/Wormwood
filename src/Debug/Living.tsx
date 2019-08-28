/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 12:59:16 
* @Last Modified by: Antoine YANG
* @Last Modified time: 2019-08-27 18:34:20
*/

import { Shield } from "./Shield";
import { Game } from "./Game";
import React, { Component } from "react";

export enum Side {
    defencer, invator
}

export enum Action {
    moving, controlled, pre_ani, dur_ani, aft_ani
}

export interface TowerProps {
    id: number,
    level: number,
    name: string;
    life: number;
    armor: number;
    physical_dec: number;
    fire_resist: number;
    cold_resist: number;
    electric_resist: number;
    magic_dec: number;
    arr: number;
    cor: number;
    update: (out: number) => void;
}

export interface TowerState {
    hp: number;
    level: number;
    armor: number;
    physical_dec: number;
    fire_resist: number;
    cold_resist: number;
    electric_resist: number;
    magic_dec: number;
    shield: Shield.Shield | null;
    action: Action;
    pic: string;
}

export abstract class Tower extends Component<TowerProps, TowerState, any> {
    public constructor(props: TowerProps) {
        super(props);
        this.state = {
            level: this.props.level,
            hp: this.props.life,
            armor: this.props.armor,
            physical_dec: this.props.physical_dec,
            fire_resist: this.props.fire_resist,
            cold_resist: this.props.cold_resist,
            electric_resist: this.props.electric_resist,
            magic_dec: this.props.magic_dec,
            shield: null,
            action: Action.moving,
            pic: `rgba(255, 255, 255, 0.6)`
        };
        this.update = this.props.update.bind(this);
    }

    protected update: (out: number) => void;
    
    public alive: () => boolean
        = () => this.state.hp > 0;
    public getInfo: (level: number) => string
        = (level: number) => {
            switch (level) {
                case 0:
                    return ``;
                case 1:
                    return `${this.props.name}    HP: ${this.state.hp}/${this.props.life}`;
                case 2:
                    return `${this.props.name}    HP: ${this.state.hp}/${this.props.life}\n`
                        + `Resistance:     A ${this.state.armor}  F ${this.state.fire_resist}  C ${this.state.cold_resist}  E ${this.state.electric_resist}`;
            }
            return ``;
        }
    public getPosition: () => Array<number>
        = () => {
            return [this.props.arr, this.props.cor];
        }
    public getPic: () => string
        = () => {
            // let url: string = `../pic/Adam`;
            // switch (this.state.action) {
            //     case Action.moving:
            //         url += `_normal`;
            //         break;
            // }
            // url += `_${(new Date()).getMilliseconds() % 1000 / 200}`;
            // url = `../pic/Adam_normal_0`;
            // return url + `.png`;
            switch (this.state.action) {
                case Action.moving:
                    return `blue`;
                case Action.pre_ani:
                    return `purple`;
                case Action.dur_ani:
                    return `white`;
                case Action.aft_ani:
                    return `red`;
                case Action.controlled:
                    return `orange`;
            }
            return ``;
        }

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


    public componentDidMount(): void {
        setInterval(this.tick, 20);
    }

    protected animation: number = 0;
    protected waiting: number = 0;
    public tick: () => void
        = () => {
            if (!this.state) {
                return;
            }
            if (this.loaded < this.CD) {
                this.loaded += 20;
            }
            if (this.animation >= this.waiting) {
                this.animation = 0;
                switch (this.state.action) {
                    case Action.moving:
                        this.prepare();
                        this.setState({
                            action: Action.pre_ani
                        });
                        break;
                    case Action.pre_ani:
                        this.act();
                        this.setState({
                            action: Action.dur_ani
                        });
                        break;
                    case Action.dur_ani:
                        this.setState({
                            action: Action.aft_ani
                        });
                        this.waiting = 800;
                        break;
                    case Action.aft_ani:
                        this.setState({
                            action: Action.moving
                        });
                        this.waiting = -1;
                        break;
                }
                this.animation = 0;
            }
            else {
                this.animation += 20;
            }
            this.setState({
                pic: this.getPic()
            });
        };

    protected cost: number = 0;
    public getCost: () => {} = () => this.cost;

    protected CD: number = 0;
    protected loaded: number = 0;
    public getLoaded: () => boolean = () => this.loaded >= this.CD;
}


export interface InvatorProps {
    id: number;
    name: string;
    life: number;
    armor: number;
    physical_dec: number;
    fire_resist: number;
    cold_resist: number;
    electric_resist: number;
    magic_dec: number;
    arr: number;
}

export interface InvatorState {
    hp: number;
    armor: number;
    physical_dec: number;
    fire_resist: number;
    cold_resist: number;
    electric_resist: number;
    magic_dec: number;
    shield: Shield.Shield | null;
    action: Action;
    pos: number;
}

export abstract class Invator extends Component<InvatorProps, InvatorState, any> {
    public constructor(props: InvatorProps) {
        super(props);
    }

    public alive: () => boolean
        = () => this.state.hp > 0;
    public getInfo: (level: number) => string
        = (level: number) => {
            switch (level) {
                case 0:
                    return ``;
                case 1:
                    return `${this.props.name}    HP: ${this.state.hp}/${this.props.life}`;
                case 2:
                    return `${this.props.name}    HP: ${this.state.hp}/${this.props.life}\n`
                        + `Resistance:     A ${this.state.armor}  F ${this.state.fire_resist}`
                        + `C ${this.state.cold_resist}  E ${this.state.electric_resist}`;
            }
            return ``;
        }
    public getPosition: () => Array<number>
        = () => {
            return [this.props.arr, this.state.pos];
        }
        
    protected speed: number = 3.3;
    protected speed_actual: number = 3.3;
    public move: () => boolean
        = () => {
            let pos: number = this.state.pos;
            if (this.state.action === Action.moving) {
                pos -= this.speed_actual;
            }
            if (pos < Game.start().getMargin(3) + Game.start().getPadding(0)) {
                return false;
            }
            this.setState({
                pos: pos
            });
            return true;
        }
    protected abstract hit: () => boolean;
}

export class Adam extends Tower {
    public constructor(props: TowerProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <circle
                cx={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                cy={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                r={36}
                style={{fill: `${this.state.pic}`}}
            />
        )
    }

    protected prepare = () => {
            if (this.state.level === 0) {
                //>>console.log("Pre: hit");
                this.promise = this.hit;
                this.waiting = 600;
                return;
            }
            let r: number = Math.random() * (1 + this.luck / 100);
            switch (this.state.level) {
                case 1:
                    if (r >= 0.8) {
                        //>>console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
                case 2:
                    if (r >= 0.88) {
                        //>>console.log("Pre: 2");
                        this.promise = this.skill2;
                        this.waiting = 200;
                        return;
                    }
                    else if (r >= 0.64) {
                        //>>console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
                case 3:
                    if (r >= 0.92) {
                        //>>console.log("Pre: 3");
                        this.promise = this.skill3;
                        this.waiting = 400;
                        return;
                    }
                    else if (r >= 0.76) {
                        //>>console.log("Pre: 2");
                        this.promise = this.skill2;
                        this.waiting = 200;
                        return;
                    }
                    else if (r >= 0.52) {
                        //>>console.log("Pre: 1");
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
            }
            //>>console.log("Pre: hit");
            this.promise = this.hit;
            this.waiting = 600;
            return;
        }

    protected hit: () => boolean
        = () => {
            Game.start().appendBullet({
                id: Math.random(),
                type: 'BulletA',
                side: Side.defencer,
                pic: 'white',
                physical: 50,
                fire: 0,
                cold: 0,
                electric: 0,
                debuff: null,
                speed: 4.8,
                arr: Game.start().getMargin(0) + (this.props.arr + 0.4) * Game.start().getLineHeight(),
                pos: Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.7) * Game.start().getSpan(),
                update: this.update
            });
            this.waiting = 600;
            return true;
        };

    protected skill1: () => void
        = () => {
            Game.start().appendBullet({
                id: Math.random(),
                type: 'BulletB',
                side: Side.defencer,
                pic: 'orange',
                physical: 70,
                fire: 0,
                cold: 0,
                electric: 0,
                debuff: null,
                speed: 7.2,
                arr: Game.start().getMargin(0) + (this.props.arr + 0.4) * Game.start().getLineHeight(),
                pos: Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.7) * Game.start().getSpan(),
                update: this.update
            });
            this.waiting = 600;
            return true;
        };

    protected skill2: () => void
        = () => {
            //>>console.log("skill 2");
            this.waiting = 1000;
        };
        
    protected skill3: () => void
        = () => {
            //>>console.log("skill 3");
            this.waiting = 1600;
        };
}

