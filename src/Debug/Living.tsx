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
            let url: string = `../pic/${this.props.name}/${this.props.name}`;
            switch (this.state.action) {
                case Action.moving:
                    url += `_normal`;
                    break;
                case Action.pre_ani:
                    url += `_pre`;
                    break;
                case Action.dur_ani:
                    url += `_dur`;
                    break;
                case Action.aft_ani:
                    url += `_aft`;
                    break;
                case Action.controlled:
                    url += `_normal`;
                    break;
            }
            // url += `_${(new Date()).getMilliseconds() % 1000 / 200}`;
            url += `_0`;
            return url + `.png`;
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
        Game.start().mount(this, this.props.arr, this.props.cor);
        setInterval(this.tick, 20);
    }

    public componentWillUnmount(): void {
        Game.start().unmount(this.props.arr, this.props.cor);
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
    update: (out: number) => void;
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
        this.state = {
            hp: this.props.life,
            armor: this.props.armor,
            physical_dec: this.props.physical_dec,
            fire_resist: this.props.fire_resist,
            cold_resist: this.props.cold_resist,
            electric_resist: this.props.electric_resist,
            magic_dec: this.props.magic_dec,
            shield: null,
            action: Action.moving,
            pos: Game.start().getMargin(3) + Game.start().getPadding(0) + (Game.start().getCor() - 1) * Game.start().getSpan()
        }
        this.update = this.props.update.bind(this);
        this.move = this.move.bind(this);
        this.tick = this.tick.bind(this);
        this.update = this.update.bind(this);
    }

    public componentDidMount(): void {
        setInterval(this.tick, 20);
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
        
    protected speed: number = 0.6;
    protected speed_actual: number = 0.6;

    protected promise: null | (() => void) = null;
    protected abstract prepare: () => void;
    protected animation: number = 0;
    protected waiting: number = 0;

    public move: () => boolean
        = () => {
            if (Game.start().set[this.props.arr][parseInt((this.state.pos / Game.start().getSpan()).toString())]) {
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
                return true;
            }
            else {
                this.setState({
                    action: Action.moving
                });
                this.waiting = -1;
            }
            let pos: number = this.state.pos;
            if (this.state.action === Action.moving) {
                pos -= this.speed_actual;
            }
            if (pos < 0) {
                return false;
            }
            this.setState({
                pos: pos
            });
            return true;
        }

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
    
    protected abstract hit: () => boolean;

    protected update: (out: number) => void;

    public tick(): void {
        if (!this.state || !this.alive() || this.state.pos <= 0) {
            return;
        }
        let alive: boolean = this.move();
        if (!alive) {
            this.update(this.props.id);
        }
    }
}

export class Adam extends Tower {
    public constructor(props: TowerProps) {
        super(props);
    }

    public render(): JSX.Element {
        switch (this.state.action) {
            case Action.moving:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`100px`} height={`100px`}
                        transform={`translate(-50, -60)`}
                        xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
                )
            case Action.pre_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`100px`} height={`100px`}
                        transform={`translate(-50, -60)`}
                        xlinkHref={require(`../pic/Adam/Adam_pre_0.png`)} />
                )
            case Action.dur_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`100px`} height={`100px`}
                        transform={`translate(-50, -60)`}
                        xlinkHref={require(`../pic/Adam/Adam_dur_0.png`)} />
                )
            case Action.aft_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`100px`} height={`100px`}
                        transform={`translate(-50, -60)`}
                        xlinkHref={require(`../pic/Adam/Adam_aft_0.png`)} />
                )
            case Action.controlled:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`100px`} height={`100px`}
                        xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
                )
        }
        return (
            <image xmlns={`http://www.w3.org/2000/svg`}
                x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                width={`100px`} height={`100px`}
                transform={`translate(-50, -60)`}
                xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
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
                speed: 6,
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
                speed: 30,
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


export class Mechanical extends Invator {
    protected prepare = () => {
            this.promise = this.hit;
            this.waiting = 600;
            return;
        }

    protected hit: () => boolean
        = () => {
            Game.start().appendBullet({
                id: Math.random(),
                type: 'BulletB',
                side: Side.invator,
                pic: 'white',
                physical: 50,
                fire: 0,
                cold: 0,
                electric: 0,
                debuff: null,
                speed: 6,
                arr: Game.start().getMargin(0) + (this.props.arr + 0.3) * Game.start().getLineHeight(),
                pos: Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos - 72,
                update: this.update
            });
            this.waiting = 600;
            return true;
        };
    
    public render(): JSX.Element {
        switch (this.state.action) {
            case Action.moving:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_normal_0.png`)} />
                )
            case Action.pre_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_pre_0.png`)} />
                )
            case Action.dur_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_dur_0.png`)} />
                )
            case Action.aft_ani:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_aft_0.png`)} />
                )
            case Action.controlled:
                return (
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_normal_0.png`)} />
                )
        }
        return (
            <image xmlns={`http://www.w3.org/2000/svg`}
                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                width={`140px`} height={`140px`}
                transform={`translate(-70, -100)`}
                xlinkHref={require(`../pic/Invator/Mechanical_normal_0.png`)} />
        )
    }
}
