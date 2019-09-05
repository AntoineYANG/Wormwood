/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 12:59:16 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-01 03:07:04
*/

import { Shield, PhysicalShield } from "./Shield";
import { Game, Game_State } from "./Game";
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
    shield: Shield | null;
    action: Action;
    pic: string;
}

export abstract class Tower extends Component<TowerProps, TowerState, any> {
    public constructor(props: TowerProps) {
        super(props);
        this.state = {
            level: 0,
            hp: this.props.life,
            armor: this.props.armor * (1 + Math.log(this.props.level + 1)),
            physical_dec: this.props.physical_dec,
            fire_resist: this.props.fire_resist + 15 * this.props.level,
            cold_resist: this.props.cold_resist + 15 * this.props.level,
            electric_resist: this.props.electric_resist + 15 * this.props.level,
            magic_dec: this.props.magic_dec,
            shield: null,
            action: Action.moving,
            pic: `rgba(255, 255, 255, 0.6)`
        };
        this.update = this.props.update.bind(this);
    }

    public setLevel(level: number): void {
        let hp: number = parseInt((this.state.hp + this.props.life * 0.25).toString());
        hp = hp > this.props.life ? this.props.life : hp;
        this.setState({
            level: level,
            hp: hp,
            armor: this.props.armor * (1 + Math.log(level + 1)),
            physical_dec: this.props.physical_dec,
            fire_resist: this.props.fire_resist + 15 * level,
            cold_resist: this.props.cold_resist + 15 * level,
            electric_resist: this.props.electric_resist + 15 * level,
            magic_dec: this.props.magic_dec
        });
    }

    protected update: (out: number) => void;

    public active(): boolean {
        for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
            if (Game.start().EnemyInstance[i].arr !== this.props.arr) {
                continue;
            }
            if (parseInt(((Game.start().EnemyInstance[i].pos - 4) / Game.start().getSpan()).toString()) >= this.props.cor
                && parseInt(((Game.start().EnemyInstance[i].pos - 44) / Game.start().getSpan()).toString()) < Game.start().getCor()) {
                return true;
            }
        }
        return false;
    }
    
    public alive: () => boolean
        = () => this.state.hp > 0;
    public getInfo: (level: number) => Array<string>
        = (level: number) => {
            switch (level) {
                case 0:
                    return [``];
                case 1:
                    return [`HP: ${this.state.hp}/${this.props.life} Lv${this.state.level}`];
                case 2:
                    return [`HP: ${this.state.hp}/${this.props.life} Lv${this.state.level}`,
                        `Resistance:     A ${this.state.armor}  F ${this.state.fire_resist}`
                        + `C ${this.state.cold_resist}  E ${this.state.electric_resist}`];
            }
            return [``];
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

    public hurt(physical: number, fire: number = 0, cold: number = 0, electric: number = 0): void {
        let p: number = (physical * this.props.life / (this.props.life + this.state.armor)) - this.state.physical_dec;
        p = p > 0 ? p : 0;
        let f: number = fire * (100 - this.state.fire_resist) / 100;
        f = f > this.state.magic_dec ? f - this.state.magic_dec : f;
        let c: number = cold * (100 - this.state.cold_resist) / 100;
        c = c > this.state.magic_dec ? c - this.state.magic_dec : c;
        let e: number = electric * (100 - this.state.electric_resist) / 100;
        e = e > this.state.magic_dec ? e - this.state.magic_dec : e;
        let hp: number = this.state.hp - (p + f + c + e);
        hp = hp >= 0 ? hp <= this.props.life ? parseInt((hp + 0.5).toString()) : this.props.life : 0;
        if (hp !== this.state.hp) {
            this.setState({
                hp: hp
            });
        }
        if (hp <= 0) {
            this.update(this.props.id);
            Game.start().unmount(this.props.arr, this.props.cor);
        }
    }

    public ignite(f: number, lasting: number, declineBySecond: number = 0): void {
        let damage: number = f;
        for (let t: number = 0; t < lasting; t += 250) {
            setTimeout(() => this.hurt(0, (damage - declineBySecond * t / 1000) / 4, 0, 0), t);
        }
    }


    public componentDidMount(): void {
        Game.start().mount(this, this.props.arr, this.props.cor);
        setInterval(this.tick, 40);
        Game.start().TowerInstance.push({...this.state, dom: this.refs.dom, uid: this.props.id, arr: this.props.arr, component: this,
            pos: Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()});
    }

    public componentWillUnmount(): void {
        Game.start().unmount(this.props.arr, this.props.cor);
    }

    protected animation: number = 0;
    protected waiting: number = 0;
    protected lasted: number = 0;
    public tick: () => void
        = () => {
            if (Game.start().state.gameState !== Game_State.going || !this.state || !this.alive()) {
                return;
            }
            this.lasted += 40;
            switch (this.lasted) {
                case 10000:
                    if (this.props.level >= 1) {
                        this.setLevel(1);
                    }
                    break;
                case 25000:
                    if (this.props.level >= 2) {
                        this.setLevel(2);
                    }
                    break;
                case 40000:
                    if (this.props.level >= 3) {
                        this.setLevel(3);
                    }
                    break;
            }
            if (this.loaded < this.CD) {
                this.loaded += 100;
            }
            if (this.animation >= this.waiting) {
                this.animation = 0;
                switch (this.state.action) {
                    case Action.moving:
                        if (!this.active()) {
                            break;
                        }
                        this.prepare();
                        if (this.promise) {
                            this.setState({
                                action: Action.pre_ani
                            });
                        }
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
                this.animation += 40;
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
    speed: number;
}

export interface InvatorState {
    hp: number;
    armor: number;
    physical_dec: number;
    fire_resist: number;
    cold_resist: number;
    electric_resist: number;
    magic_dec: number;
    action: Action;
    pos: number;
    speed: number;
}

export abstract class Invator extends Component<InvatorProps, InvatorState, any> {
    protected shield: Shield | null = null;

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
            action: Action.moving,
            pos: Game.start().getMargin(3) + Game.start().getPadding(0) + (Game.start().getCor() - 1) * Game.start().getSpan(),
            speed: this.props.speed
        }
        this.update = this.props.update.bind(this);
        this.move = this.move.bind(this);
        this.tick = this.tick.bind(this);
        this.update = this.update.bind(this);
    }

    public componentDidMount(): void {
        setInterval(this.tick, 40);
    }

    public alive: () => boolean
        = () => this.state.hp > 0;
    public getInfo: (level: number) => Array<string>
        = (level: number) => {
            switch (level) {
                case 0:
                    return [``];
                case 1:
                    return [`HP: ${this.state.hp}/${this.props.life}`];
                case 2:
                    return [`HP: ${this.state.hp}/${this.props.life}`,
                        `Resistance:     A ${this.state.armor}  F ${this.state.fire_resist}`
                        + `C ${this.state.cold_resist}  E ${this.state.electric_resist}`];
            }
            return [``];
        }
    public getPosition: () => Array<number>
        = () => {
            return [this.props.arr, this.state.pos];
        }

    protected promise: null | (() => void) = null;
    protected abstract prepare: () => void;
    protected animation: number = 0;
    protected waiting: number = 0;

    public active(): boolean {
        return (Game.start().set[this.props.arr][parseInt(((this.state.pos - 24) / Game.start().getSpan()).toString()) + 1] !== null
            && Game.start().set[this.props.arr][parseInt(((this.state.pos - 24) / Game.start().getSpan()).toString()) + 1] !== void 0)
            || (Game.start().set[this.props.arr][parseInt(((this.state.pos - 24) / Game.start().getSpan()).toString())] !== null
            && Game.start().set[this.props.arr][parseInt(((this.state.pos - 24) / Game.start().getSpan()).toString())] !== void 0);
    }

    public move: () => boolean
        = () => {
            if (this.active()) {
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
                            this.waiting = 200;
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
                    this.animation += 40;
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
                pos -= this.state.speed;
            }
            if (Game.start().state.gameState === Game_State.going && pos < 0) {
                alert(" --<  GAME OVER  >-- ");
                Game.start().end();
                return false;
            }
            this.setState({
                pos: pos
            });
            return true;
        }

    protected act: () => void
        = () => {
            if (this.promise === null) {
                return;
            }
            else {
                this.promise!();
            }
            return;
        }
    
    protected abstract hit: () => boolean;

    public hurt(physical: number, fire: number = 0, cold: number = 0, electric: number = 0): void {
        let damage: {physical: number, fire: number, cold: number, electric: number}
            = {physical: physical, fire: fire, cold: cold, electric: electric};
        if (this.shield) {
            this.shield = this.shield!.hurt(damage) ? this.shield : null;
        }
        let p: number = (damage.physical * this.props.life / (this.props.life + this.state.armor)) - this.state.physical_dec;
        p = p > 0 ? p : 0;
        let f: number = damage.fire * (100 - this.state.fire_resist) / 100;
        f = f > this.state.magic_dec ? f - this.state.magic_dec : f;
        let c: number = damage.cold * (100 - this.state.cold_resist) / 100;
        c = c > this.state.magic_dec ? c - this.state.magic_dec : c;
        let e: number = damage.electric * (100 - this.state.electric_resist) / 100;
        e = e > this.state.magic_dec ? e - this.state.magic_dec : e;
        let hp: number = this.state.hp - (p + f + c + e);
        hp = hp >= 0 ? hp <= this.props.life ? parseInt((hp + 0.5).toString()) : this.props.life : 0;
        if (hp !== this.state.hp) {
            this.setState({
                hp: hp
            });
            this.didHurt(p, f, c, e);
        }
        else if (hp <= 0) {
            this.willDie();
            this.willDie = () => {};
            setTimeout(() => this.update(this.props.id), 800);
        }
    }

    protected didHurt(p: number, f: number, c: number, e: number): void {}
    protected willDie(): void {}

    public ignite(f: number, lasting: number, declineBySecond: number = 0): void {
        let damage: number = f;
        for (let t: number = 0; t < lasting; t += 250, damage -= declineBySecond / 4) {
            setTimeout(() => this.hurt(0, damage / 4, 0, 0), t);
        }
    }

    protected update: (out: number) => void;

    public componentDidUpdate(): void {
        let flag: boolean = false;
        for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
            if (Game.start().EnemyInstance[i].uid === this.props.id) {
                Game.start().EnemyInstance[i].pos = this.state.pos;
                flag = true;
            }
        }
        if (!flag && this.refs.dom) {
            Game.start().EnemyInstance.push({...this.state, dom: this.refs.dom, uid: this.props.id, arr: this.props.arr, component: this});
        }
    }

    protected controlled: number = 0;
    protected controlling: number = 0;

    public control(time: number): void {
        if (time < this.controlling) {
            return;
        }
        this.controlling = time;
        this.controlled = 0;
        this.waiting = 0;
        this.animation = 0;
        this.setState({
            action: Action.controlled
        });
    }

    public tick(): void {
        if (Game.start().state.gameState !== Game_State.going || !this.state || !this.alive() || this.state.pos <= 0) {
            return;
        }
        for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
            if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                continue;
            }
            if (!Game.start().TowerInstance[i].component.alive()) {
                Game.start().TowerInstance[i].component.hurt(1, 0, 0, 0);
                break;
            }
        }
        if (this.controlling > 0) {
            if (this.controlled < this.controlling) {
                this.controlled += 40;
                return;
            }
            else {
                this.controlling = 0;
                this.controlled = 0;
                this.setState({
                    action: Action.moving
                });
            }
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
        let info: Array<string> = this.getInfo(2);
        switch (this.state.action) {
            case Action.moving:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`100px`} height={`100px`}
                            transform={`translate(-50, -60)`}
                            xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.pre_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`100px`} height={`100px`}
                            transform={`translate(-50, -60)`}
                            xlinkHref={require(`../pic/Adam/Adam_pre_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.dur_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`100px`} height={`100px`}
                            transform={`translate(-50, -60)`}
                            xlinkHref={require(`../pic/Adam/Adam_dur_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.aft_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`100px`} height={`100px`}
                            transform={`translate(-50, -60)`}
                            xlinkHref={require(`../pic/Adam/Adam_aft_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.controlled:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`100px`} height={`100px`}
                            xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
        }
        return (
            <>
                <image xmlns={`http://www.w3.org/2000/svg`}
                    x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`100px`} height={`100px`}
                    transform={`translate(-50, -60)`}
                    xlinkHref={require(`../pic/Adam/Adam_normal_0.png`)} />
                <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                    style={{
                        fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                    }}/>
                <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                    style={{
                        fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                    }}/>
                <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    dx={-34} dy={-70} style={{
                        fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                        WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                    }}>
                    { info[0] }
                </text>
            </>
        )
    }

    protected prepare = () => {
            if (this.state.level === 0) {
                this.promise = this.hit;
                this.waiting = 800;
                return;
            }
            let r: number = Math.random() * (1 + this.luck / 100);
            switch (this.state.level) {
                case 1:
                    if (r >= 0.8) {
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
                case 2:
                    if (r >= 0.88) {
                        this.promise = this.skill2;
                        this.waiting = 200;
                        return;
                    }
                    else if (r >= 0.64) {
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
                case 3:
                    if (r >= 0.92) {
                        this.promise = this.skill3;
                        this.waiting = 400;
                        return;
                    }
                    else if (r >= 0.76) {
                        this.promise = this.skill2;
                        this.waiting = 200;
                        return;
                    }
                    else if (r >= 0.52) {
                        this.promise = this.skill1;
                        this.waiting = 600;
                        return;
                    }
                    break;
            }
            this.promise = this.hit;
            this.waiting = 800;
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
                line: this.props.arr,
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
                physical: 80,
                fire: 0,
                cold: 0,
                electric: 0,
                debuff: null,
                speed: 30,
                arr: Game.start().getMargin(0) + (this.props.arr + 0.4) * Game.start().getLineHeight(),
                line: this.props.arr,
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

export class Eve extends Tower {
    public constructor(props: TowerProps) {
        super(props);
    }

    private targets: Array<InvatorState & {uid: number, dom: React.ReactInstance, arr: number, component: Invator}> = [];

    private attack(times: number, mode: string = 'normal'): void {
        if (this.targets.length === 0) {
            return;
        }
        for (let t: number = 0; t < times; t++) {
            if (mode === 'normal') {
                setTimeout(() => {
                    if (this.targets[t % this.targets.length]) {
                        this.targets[t % this.targets.length].component.hurt(64 / Math.sqrt(times), 0, 0, 4);
                    }
                }, 200 * t);
            }
            else if (mode === 'hard') {
                setTimeout(() => {
                    if (this.targets[t % this.targets.length]) {
                        this.targets[t % this.targets.length].component.hurt(128, 0, Math.random() * 12.8 + 12.8, 4);
                    }
                }, 200 * t);
            }
            else if (mode === 'possible') {
                if (Math.random() >= 0.6) {
                    setTimeout(() => {
                        if (this.targets[t % this.targets.length]) {
                            this.targets[t % this.targets.length].component.hurt(128, 0, Math.random() * 12.8 + 12.8, 4);
                        }
                    }, 200 * t);
                }
                else {
                    setTimeout(() => {
                        if (this.targets[t % this.targets.length]) {
                            this.targets[t % this.targets.length].component.hurt(64*(1+Math.random()*0.2) / Math.sqrt(times), 0, 0, 4);
                        }
                    }, 200 * t);
                }
            }
        }
    }

    public active(): boolean {
        this.targets = [];
        for (let i: number = 0; i < Game.start().EnemyInstance.length; i++) {
            if (Game.start().EnemyInstance[i].arr !== this.props.arr) {
                continue;
            }
            if (parseInt(((Game.start().EnemyInstance[i].pos - 4) / Game.start().getSpan()).toString()) >= this.props.cor - 1
                && parseInt(((Game.start().EnemyInstance[i].pos - 44) / Game.start().getSpan()).toString()) <= this.props.cor + 1) {
                this.targets.push(Game.start().EnemyInstance[i]);
            }
        }
        return this.targets.length > 0;
    }

    public render(): JSX.Element {
        let info: Array<string> = this.getInfo(2);
        switch (this.state.action) {
            case Action.moving:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`114px`} height={`140px`}
                            transform={`translate(-56, -76)`}
                            xlinkHref={require(`../pic/Adam/Eve_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.pre_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`114px`} height={`140px`}
                            transform={`translate(-56, -76)`}
                            xlinkHref={require(`../pic/Adam/Eve_pre_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.dur_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`114px`} height={`140px`}
                            transform={`translate(-56, -76)`}
                            xlinkHref={require(`../pic/Adam/Eve_dur_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.aft_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`114px`} height={`140px`}
                            transform={`translate(-56, -76)`}
                            xlinkHref={require(`../pic/Adam/Eve_aft_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.controlled:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`114px`} height={`140px`}
                            transform={`translate(-56, -76)`}
                            xlinkHref={require(`../pic/Adam/Eve_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-34} dy={-70} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
        }
        return (
            <>
                <image xmlns={`http://www.w3.org/2000/svg`}
                    x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`114px`} height={`140px`}
                    transform={`translate(-56, -76)`}
                    xlinkHref={require(`../pic/Adam/Eve_normal_0.png`)} />
                <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`50px`} height={`6px`} transform={`translate(-30, -66)`}
                    style={{
                        fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                    }}/>
                <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-29, -65)`}
                    style={{
                        fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                    }}/>
                <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + (this.props.cor + 0.5) * Game.start().getSpan()}
                    y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                    dx={-34} dy={-70} style={{
                        fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                        WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                    }}>
                    { info[0] }
                </text>
            </>
        )
    }

    protected prepare = () => {
            if (this.state.level === 0) {
                this.promise = this.hit;
                this.waiting = 200;
                return;
            }
            let r: number = Math.random() * (1 + this.luck / 100);
            switch (this.state.level) {
                case 1:
                    if (r >= 0.8) {
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
                case 2:
                    if (r >= 0.88) {
                        this.promise = this.skill2;
                        this.waiting = 100;
                        return;
                    }
                    else if (r >= 0.64) {
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
                case 3:
                    if (r >= 0.92) {
                        this.promise = this.skill3;
                        this.waiting = 200;
                        return;
                    }
                    else if (r >= 0.76) {
                        this.promise = this.skill2;
                        this.waiting = 100;
                        return;
                    }
                    else if (r >= 0.52) {
                        this.promise = this.skill1;
                        this.waiting = 300;
                        return;
                    }
                    break;
            }
            this.promise = this.hit;
            this.waiting = 200;
            return;
        }

    protected hit: () => boolean
        = () => {
            this.attack(this.state.level + 2);
            this.waiting = 200 * (this.state.level + 2);
            return true;
        };

    protected skill1: () => void
        = () => {
            this.attack(1, 'hard');
            this.waiting = 400;
            return true;
        };

    protected skill2: () => void
        = () => {
            this.attack(8, 'possible');
            this.waiting = 1600;
        };
        
    protected skill3: () => void
        = () => {
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
            for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                    continue;
                }
                if (Game.start().TowerInstance[i].pos >= this.state.pos + Game.start().getPadding(0) - Game.start().getSpan() - 20
                        && Game.start().TowerInstance[i].pos <= this.state.pos + Game.start().getPadding(0) + Game.start().getSpan()) {
                    Game.start().TowerInstance[i].component.hurt(80, 0, 0, 0);
                }
            }
            this.waiting = 500;
            return true;
        };
    
    public render(): JSX.Element {
        if (this.state.hp === 0) {
            return (
                <>
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`} ref={"dom"}
                        transform={`translate(-88, -72)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_die_0.png`)} />
                </>
            )
        }
        let info: Array<string> = this.getInfo(2);
        switch (this.state.action) {
            case Action.moving:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/Mechanical_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.pre_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`168px`} height={`168px`} ref={"dom"}
                            transform={`translate(-79, -130)`}
                            xlinkHref={require(`../pic/Invator/Mechanical_pre_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.dur_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`150px`} height={`150px`} ref={"dom"}
                            transform={`translate(-120, -90)`}
                            xlinkHref={require(`../pic/Invator/Mechanical_dur_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.aft_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`150px`} height={`150px`} ref={"dom"}
                            transform={`translate(-115, -96)`}
                            xlinkHref={require(`../pic/Invator/Mechanical_aft_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.controlled:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/Mechanical_controlled_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: '#e96', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
        }
        return (
            <></>
        )
    }
}

export class MechanicalPain extends Invator {
    protected prepare = () => {
            this.promise = this.hit;
            this.waiting = 600;
            return;
        }

    protected hit: () => boolean
        = () => {
            for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                    continue;
                }
                if (Game.start().TowerInstance[i].pos >= this.state.pos + Game.start().getPadding(0) - Game.start().getSpan() - 20
                        && Game.start().TowerInstance[i].pos <= this.state.pos + Game.start().getPadding(0) + Game.start().getSpan()) {
                    Game.start().TowerInstance[i].component.hurt(80, 0, 0, 0);
                }
            }
            this.waiting = 500;
            return true;
        };

    public componentDidMount(): void {
        setInterval(this.tick, 40);
        this.shieldTick = this.shieldTick.bind(this);
        setInterval(this.shieldTick, 100);
    }


    private shieldCD: number = 5000;
    private shieldLoaded: number = 0;

    private shieldTick(): void {
        if (this.shield && this.shield.alive()) {
            return;
        }
        if (this.shieldLoaded < this.shieldCD) {
            this.shieldLoaded += 100;
            return;
        }
        if (this.animation === Action.moving || this.animation === Action.aft_ani) {
            if (Math.random() >= 0.85) {
                this.shield = new PhysicalShield(this, 320, 5000);
                this.shieldLoaded = 0;
                this.setState({
                    speed: 0
                });
                setTimeout(() => {
                    this.setState({
                        speed: this.props.speed
                    });
                }, 1200);
            }
        }
    }
    
    public render(): JSX.Element {
        if (this.state.hp === 0) {
            return (
                <>
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`} ref={"dom"}
                        transform={`translate(-88, -72)`}
                        xlinkHref={require(`../pic/Invator/MechanicalPain_die_0.png`)} />
                </>
            )
        }
        let info: Array<string> = this.getInfo(2);
        if (this.shield) {
            let rate: number = this.shield.passed() >= 360 ? 1 : Math.sqrt(this.shield.passed() / 360);
            switch (this.state.action) {
                case Action.moving:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`140px`} height={`140px`} ref={"dom"}
                                transform={`translate(-70, -100)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_normal_0.png`)} />
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                                transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                                style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.pre_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`168px`} height={`168px`} ref={"dom"}
                                transform={`translate(-79, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_pre_0.png`)} />
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                                transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                                style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.dur_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`150px`} height={`150px`} ref={"dom"}
                                transform={`translate(-120, -90)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_dur_0.png`)} />
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                                transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                                style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.aft_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`150px`} height={`150px`} ref={"dom"}
                                transform={`translate(-115, -96)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_aft_0.png`)} />
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                                transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                                style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.controlled:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`140px`} height={`140px`} ref={"dom"}
                                transform={`translate(-70, -100)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_normal_0.png`)} />
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                                transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                                style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: '#e96', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
            }
            return (
                <>
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`} ref={"dom"}
                        transform={`translate(-70, -100)`}
                        xlinkHref={require(`../pic/Invator/Mechanical_normal_0.png`)} />
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`${50 + 100 * rate}px`} height={`${70 + 80 * rate}px`}
                        transform={`translate(${-20 - 50 * rate}, ${-65 - 40 * rate})`}
                        style={{ opacity: this.shield!.rate() * (rate + 0.3) / 1.3 }}
                        xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
                    <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                        style={{
                            fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                        }}/>
                    <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                        style={{
                            fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                        }}/>
                    <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        dx={-25} dy={-104} style={{
                            fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                            WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                        }}>
                        { info[0] }
                    </text>
                </>
            )
        }
        else {
            switch (this.state.action) {
                case Action.moving:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`140px`} height={`140px`} ref={"dom"}
                                transform={`translate(-70, -100)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_normal_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.pre_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`168px`} height={`168px`} ref={"dom"}
                                transform={`translate(-79, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_pre_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.dur_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`150px`} height={`150px`} ref={"dom"}
                                transform={`translate(-120, -90)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_dur_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.aft_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`150px`} height={`150px`} ref={"dom"}
                                transform={`translate(-115, -96)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_aft_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.controlled:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`140px`} height={`140px`} ref={"dom"}
                                transform={`translate(-70, -100)`}
                                xlinkHref={require(`../pic/Invator/MechanicalPain_controlled_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                                style={{
                                    fill: '#e96', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-104} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
            }
            return (
                <></>
            )
        }
    }
}

export class MechanicalShooter extends Invator {
    protected prepare = () => {
        this.promise = this.hit;
        this.waiting = 320;
        return;
    }

    public active(): boolean {
        let cor: number = parseInt(((this.state.pos - 24) / Game.start().getSpan()).toString());
        if (cor >= Game.start().getCor() - 1) {
            if (Game.start().set[this.props.arr][cor] || Game.start().set[this.props.arr][cor - 1]) {
                return true;
            }
            return false;
        }
        for (let idx: number = cor; idx >= cor - 5; idx--) {
            if (Game.start().set[this.props.arr][idx]) {
                return true;
            }
        }
        return false;
    }

    protected hit: () => boolean
        = () => {
            Game.start().appendBullet({
                id: Math.random(),
                type: 'BulletC',
                side: Side.invator,
                pic: 'white',
                physical: 33,
                fire: 0,
                cold: 0,
                electric: 0,
                debuff: null,
                speed: 10,
                arr: Game.start().getMargin(0) + (this.props.arr + 0.4) * Game.start().getLineHeight(),
                line: this.props.arr,
                pos: this.state.pos + Game.start().getPadding(0) - 50,
                update: this.update
            });
            this.waiting = 800;
            return true;
        };

    public render(): JSX.Element {
        if (this.state.hp === 0) {
            return (
                <>
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`140px`} height={`140px`} ref={"dom"}
                        transform={`translate(-88, -72)`}
                        xlinkHref={require(`../pic/Invator/MechanicalShooter_die_0.png`)} />
                </>
            )
        }
        let info: Array<string> = this.getInfo(2);
        switch (this.state.action) {
            case Action.moving:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/MechanicalShooter_normal_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.pre_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/MechanicalShooter_pre_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.dur_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/MechanicalShooter_dur_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.aft_ani:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/MechanicalShooter_aft_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: this.state.hp / this.props.life < 0.2 ? '#a60' : '#cc9', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
            case Action.controlled:
                return (
                    <>
                        <image xmlns={`http://www.w3.org/2000/svg`}
                            x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`140px`} height={`140px`} ref={"dom"}
                            transform={`translate(-70, -100)`}
                            xlinkHref={require(`../pic/Invator/MechanicalShooter_controlled_0.png`)} />
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`50px`} height={`6px`} transform={`translate(-20, -100)`}
                            style={{
                                fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                            }}/>
                        <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -99)`}
                            style={{
                                fill: '#e96', stroke: 'none'
                            }}/>
                        <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                            y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                            dx={-25} dy={-104} style={{
                                fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                            }}>
                            { info[0] }
                        </text>
                    </>
                )
        }
        return (
            <></>
        )
    }
}

export class MechanicalHuge extends Invator {
    protected prepare = () => {
        this.promise = this.hit;
        if (this.boomCD >= 15200) {
            this.waiting = 150;
        }
        else {
            this.waiting = 600;
        }
        return;
    }

    public move: () => boolean
        = () => {
            if (this.boomCD >= 14000 && this.boomCD < 15200) {
                return true;
            }
            let speed: number = this.boomCD >= 14000 ? this.state.speed * 3.6 : this.state.speed;
            if (this.active()) {
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
                            this.waiting = 200;
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
                    this.animation += 40;
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
                pos -= speed;
            }
            if (Game.start().state.gameState === Game_State.going && pos < 0) {
                alert(" --<  GAME OVER  >-- ");
                Game.start().end();
                return false;
            }
            this.setState({
                pos: pos
            });
            return true;
        }

    private boomCD: number = 2000;

    public tick(): void {
        if (Game.start().state.gameState !== Game_State.going || !this.state || !this.alive() || this.state.pos <= 0) {
            return;
        }
        for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
            if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                continue;
            }
            if (!Game.start().TowerInstance[i].component.alive()) {
                Game.start().TowerInstance[i].component.hurt(1, 0, 0, 0);
                break;
            }
        }
        if (this.controlling > 0) {
            if (this.controlled < this.controlling) {
                this.controlled += 100;
                return;
            }
            else {
                this.controlling = 0;
                this.controlled = 0;
                this.setState({
                    action: Action.moving
                });
            }
        }
        if (this.boomCD < 15200) {
            this.boomCD += 40;
        }
        let alive: boolean = this.move();
        if (!alive) {
            this.update(this.props.id);
        }
    }

    public hurt(physical: number, fire: number = 0, cold: number = 0, electric: number = 0): void {
        let damage: {physical: number, fire: number, cold: number, electric: number}
            = {physical: physical, fire: fire, cold: cold, electric: electric};
        if (this.shield) {
            this.shield = this.shield!.hurt(damage) ? this.shield : null;
        }
        let p: number = (damage.physical * this.props.life / (this.props.life + this.state.armor)) - this.state.physical_dec;
        p = p > 0 ? p : 0;
        let f: number = damage.fire * (100 - this.state.fire_resist) / 100;
        f = f > this.state.magic_dec ? f - this.state.magic_dec : f;
        let c: number = damage.cold * (100 - this.state.cold_resist) / 100;
        c = c > this.state.magic_dec ? c - this.state.magic_dec : c;
        let e: number = damage.electric * (100 - this.state.electric_resist) / 100;
        e = e > this.state.magic_dec ? e - this.state.magic_dec : e;
        let hp: number = this.state.hp - (p + f + c + e);
        hp = hp >= 0 ? hp <= this.props.life ? parseInt((hp + 0.5).toString()) : this.props.life : 0;
        if (hp !== this.state.hp) {
            this.setState({
                hp: hp
            });
            this.didHurt(p, f, c, e);
        }
        else if (hp <= 0) {
            this.willDie();
            this.willDie = () => {};
            setTimeout(() => this.update(this.props.id), 2000);
        }
    }

    protected didHurt(p: number, f: number, c: number, e: number): void {
        this.boomCD += 200;
    }

    protected willDie(): void {
        for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
            if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                continue;
            }
            if (Game.start().TowerInstance[i].pos >= this.state.pos + Game.start().getPadding(0) - Game.start().getSpan() * 1.5 - 20
                    && Game.start().TowerInstance[i].pos <= this.state.pos + Game.start().getPadding(0) + Game.start().getSpan()) {
                Game.start().TowerInstance[i].component.hurt(300, 0, 0, 0);
                Game.start().TowerInstance[i].component.ignite(50, 5000, 10);
            }
            else if (Game.start().TowerInstance[i].pos >= this.state.pos + Game.start().getPadding(0) - Game.start().getSpan() * 2.5 - 20
                    && Game.start().TowerInstance[i].pos <= this.state.pos + Game.start().getPadding(0) + Game.start().getSpan()) {
                Game.start().TowerInstance[i].component.hurt(60, 0, 0, 0);
                Game.start().TowerInstance[i].component.ignite(40, 4000, 10);
            }
        }
    }

    protected hit: () => boolean
        = () => {
            for (let i: number = 0; i < Game.start().TowerInstance.length; i++) {
                if (Game.start().TowerInstance[i].arr !== this.props.arr) {
                    continue;
                }
                if (Game.start().TowerInstance[i].pos >= this.state.pos + Game.start().getPadding(0) - Game.start().getSpan() - 20
                        && Game.start().TowerInstance[i].pos <= this.state.pos + Game.start().getPadding(0) + Game.start().getSpan()) {
                    if (this.boomCD >= 14000) {
                        Game.start().TowerInstance[i].component.hurt(500, 0, 0, 0);
                        Game.start().TowerInstance[i].component.ignite(50, 3000, 10);
                        this.boomCD = 0;
                        this.waiting = 1500;
                    }
                    else {
                        Game.start().TowerInstance[i].component.hurt(220, 0, 0, 0);
                        this.waiting = 800;
                    }
                }
            }
            return true;
        };

    public render(): JSX.Element {
        if (this.state.hp === 0) {
            return (
                <>
                    <image xmlns={`http://www.w3.org/2000/svg`}
                        x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                        y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                        width={`180px`} height={`150px`} ref={"dom"}
                        transform={`translate(-166, -84)`}
                        xlinkHref={require(`../pic/Invator/MechanicalHuge_die_0.png`)} />
                </>
            )
        }
        let info: Array<string> = this.getInfo(2);
        if (this.boomCD >= 14000) {
            switch (this.state.action) {
                case Action.moving:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`180px`} height={`180px`} ref={"dom"}
                                transform={`translate(-86, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_R_normal_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.pre_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`208px`} height={`208px`} ref={"dom"}
                                transform={`translate(-105, -158)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_R_pre_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.dur_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`164px`} height={`164px`} ref={"dom"}
                                transform={`translate(-102, -104)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_R_dur_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.aft_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`164px`} height={`164px`} ref={"dom"}
                                transform={`translate(-77, -119)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_aft_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.controlled:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`180px`} height={`180px`} ref={"dom"}
                                transform={`translate(-86, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_R_controlled_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: '#f60', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
            }
        }
        else {
            switch (this.state.action) {
                case Action.moving:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`180px`} height={`180px`} ref={"dom"}
                                transform={`translate(-86, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_normal_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.pre_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`208px`} height={`208px`} ref={"dom"}
                                transform={`translate(-105, -158)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_pre_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.dur_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`164px`} height={`164px`} ref={"dom"}
                                transform={`translate(-102, -104)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_dur_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.aft_ani:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`164px`} height={`164px`} ref={"dom"}
                                transform={`translate(-77, -119)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_aft_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: this.state.hp / this.props.life < 0.2 ? '#f60' : '#cc9', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
                case Action.controlled:
                    return (
                        <>
                            <image xmlns={`http://www.w3.org/2000/svg`}
                                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`180px`} height={`180px`} ref={"dom"}
                                transform={`translate(-86, -130)`}
                                xlinkHref={require(`../pic/Invator/MechanicalHuge_controlled_0.png`)} />
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`50px`} height={`6px`} transform={`translate(-20, -140)`}
                                style={{
                                    fill: 'none', stroke: '#cc9', strokeWidth: 0.6
                                }}/>
                            <rect x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                width={`${48 * this.state.hp / this.props.life}px`} height={`4px`} transform={`translate(-19, -139)`}
                                style={{
                                    fill: '#f60', stroke: 'none'
                                }}/>
                            <text x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                                dx={-25} dy={-144} style={{
                                    fill: `#aaa`, fillOpacity: 0.8, fontSize: 12, fontStyle: 'bold',
                                    WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none'
                                }}>
                                { info[0] }
                            </text>
                        </>
                    )
            }
        }
        return (
            <></>
        )
    }
}
