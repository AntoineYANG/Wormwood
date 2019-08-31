import { Component } from "react";
import { Invator, Tower } from "./Living";
import React from "react";
import { Game } from "./Game";

/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 13:39:48 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-31 19:53:46
 */


export interface ShieldProps {
    type: string,
    life: number,
    lasting: number
}

export interface ShieldState {
    hp: number
}

export abstract class Shield extends Component<ShieldProps, ShieldState, any> {
    protected kept: number = 0;
    protected owner: Tower | Invator | null = null;

    public constructor(props: ShieldProps) {
        super(props);
    }

    public bind(owner: Tower | Invator): void {
        this.owner = owner;
    }

    public abstract hurt: (physical: number, fire: number, cold: number, electric: number) => boolean;
    public tick: () => boolean
        = () => {
            this.kept += 20;
            return this.kept < this.props.lasting ? true : false;
        };
    public abstract getHP: () => string;
    public getTimer: () => string
        = () => {
            return `remaining time: ${this.props.lasting - this.kept}`;
        }
    public alive(): boolean {
        return this.state.hp > 0 && this.kept < this.props.lasting;
    }
}

export class PhysicalShield extends Shield {
    public hurt: (physical: number, fire: number, cold: number, electric: number) => boolean
        = (physical: number, fire: number = 0, cold: number = 0, electric: number = 0) => {
            if (physical > this.state.hp) {
                physical -= this.state.hp;
                this.setState({
                    hp: 0
                });
                return false;
            }
            else {
                this.setState({
                    hp: this.state.hp - physical
                });
                physical = 0;
                return true;
            }
        }
    public getHP: () => string
        = () => {
            return `Physical Shield: ${this.state.hp}/${this.props.life}`;
        }
    public render(): JSX.Element {
        return (
            <image xmlns={`http://www.w3.org/2000/svg`}
                x={Game.start().getMargin(3) + Game.start().getPadding(0) + this.state.pos}
                y={Game.start().getMargin(0) + (this.props.arr + 0.5) * Game.start().getLineHeight()}
                width={`140px`} height={`140px`} ref={"dom"}
                transform={`translate(-70, -100)`}
                xlinkHref={require(`../pic/Item/PhysicalShield.png`)} />
        )
    }
}

export class InvalidationShield extends Shield {
    public hurt: (physical: number, fire: number, cold: number, electric: number) => boolean
        = (physical: number, fire: number = 0, cold: number = 0, electric: number = 0) => {
            // invalidate();
            this.setState({
                hp: this.state.hp - 1
            });
            return this.state.hp > 0 ? true : false;
        }
    public getHP: () => string
        = () => {
            return `Invalidation Shield: ${this.state.hp}/${this.props.life}`;
        }
}

export class HolyShield extends Shield {
    public hurt: (physical: number, fire: number, cold: number, electric: number) => boolean
        = (physical: number, fire: number = 0, cold: number = 0, electric: number = 0) => {
            // invalidate();
            return true;
        }
    public getHP: () => string
        = () => {
            return `Invalidation Shield:  - infinity - `;
        }
}

export class MagicShield extends Shield {
    public hurt: (physical: number, fire: number, cold: number, electric: number) => boolean
        = (physical: number, fire: number = 0, cold: number = 0, electric: number = 0) => {
            let hp: number = this.state.hp;
            if (physical > hp) {
                physical -= hp;
                this.setState({
                    hp: 0
                });
                return false;
            }
            else {
                hp -= physical;
                physical = 0;
            }
            if (fire > hp) {
                fire -= hp;
                this.setState({
                    hp: 0
                });
                return false;
            }
            else {
                hp -= fire;
                fire = 0;
            }
            if (cold > hp) {
                cold -= hp;
                this.setState({
                    hp: 0
                });
                return false;
            }
            else {
                hp -= cold;
                cold = 0;
            }
            if (electric > hp) {
                electric -= hp;
                this.setState({
                    hp: 0
                });
                return false;
            }
            else {
                hp -= electric;
                electric = 0;
                this.setState({
                    hp: hp
                });
                return true;
            }
        }
    public getHP: () => string
        = () => {
            return `Magic Shield: ${this.state.hp}/${this.props.life}`;
        }
}
