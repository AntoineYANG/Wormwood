/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 16:45:10 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 19:38:39
*/

import Bullet from "./Bullet";
import { Tower, Invator, Adam } from "./Living";
import React, { Component } from "react";

var System: Game | null = null;

export enum Game_State {
    going, end
}

const map: Array<props_game> = [
    {
        map_pic: '',
        map_arr: 6,
        map_cor: 12,
        margin: [180, 0, 100, 0],
        padding: [240, 120]
    }
];

export interface state_game {
    gameState: Game_State;

    towers: Array<Tower>;
    enemies: Array<Invator>;
    flyingItems: Array<Bullet>;
}

export interface props_game {
    map_pic: string;
    map_arr: number;
    map_cor: number;
    margin: Array<number>;
    padding: Array<number>;
}

export class Game extends Component<props_game, state_game, any> {
    public readonly state: state_game = {
        gameState: Game_State.going,

        towers: [],
        enemies: [],
        flyingItems: []
    };

    public getArr: () => number = () => this.props.map_arr;
    public getCor: () => number = () => this.props.map_cor;
    public getMargin: (idx: number) => number = (idx: number) => this.props.margin[idx];
    public getPadding: (idx: number) => number = (idx: number) => this.props.padding[idx];
    public getSpan: () => number = () => {
        return (1536 - this.props.margin[1] - this.props.margin[3] - this.props.padding[0] - this.props.padding[1])
            / this.props.map_cor;
    }

    private init: () => void
        = () => {
            this.setState({
                gameState: Game_State.going,
                towers: [],
                enemies: [],
                flyingItems: []
            });
        }
    
    private constructor(props: props_game) {
        super(props);
    }

    public static start(): Game {
        if (System === null) {
            System = new Game(map[0]);
        }
        return System!;
    }

    public append(item: Tower | Invator | Bullet): boolean {
        switch (true) {
            case item instanceof Tower:
                let towers_update: Array<Tower> = this.state.towers;
                if (item instanceof Tower) {
                    towers_update.push(item);
                }
                this.setState({
                    towers: towers_update
                });
                break;
            case item instanceof Invator:
                let enemies_update: Array<Invator> = this.state.enemies;
                if (item instanceof Invator) {
                    enemies_update.push(item);
                }
                this.setState({
                    enemies: enemies_update
                });
                break;
            case item instanceof Bullet:
                let flyingItems_update: Array<Bullet> = this.state.flyingItems;
                if (item instanceof Bullet) {
                    flyingItems_update.push(item);
                }
                this.setState({
                    flyingItems: flyingItems_update
                });
                break;
        }
        return true;
    }

    public render(): JSX.Element {
        let rect: Array< Array<number> > = [];
        let span_width: number = (1536 - this.props.margin[1] - this.props.margin[3] - this.props.padding[0] - this.props.padding[1])
            / this.props.map_cor;
        let span_height: number = (864 - this.props.margin[0] - this.props.margin[2]) / this.props.map_arr;
        for (let i: number = 0; i < this.props.map_arr; i++) {
            for (let j: number = 0; j < this.props.map_cor; j++) {
                rect.push([i, j]);
            }
        }
        return (
            <svg xmlns={`http://www.w3.org/2000/svg`} width={`1534px`} height={`862px`} style={{border: `1px solid black`}}>
                <image xmlns={`http://www.w3.org/2000/svg`} x={0} y={-1} width={`1536px`} height={`864px`}
                    xlinkHref={require(`../pic/wastedland.jpg`)} key={`background`} />
                <rect x={this.props.margin[3]} width={1536 - this.props.margin[1] - this.props.margin[3]}
                    y={this.props.margin[0]} height={864 - this.props.margin[0] - this.props.margin[2]}
                    style={{fill: `none`, stroke: `rgba(225, 225, 225, 0.8)`}} key={`area`} />
                {
                    rect.map(e => {
                        return (
                            <rect x={this.props.margin[3] + this.props.padding[0] + e[1] * span_width}
                                y={this.props.margin[0] + e[0] * span_height}
                                width={span_width} height={span_height}
                                style={{fill: `rgba(225, 100, 100, ${Math.random() * 0.1 + 0.1})`,
                                    stroke: `rgba(225, 225, 100, 0.8)`}} key={`rect${e[0]}-${e[1]}`}
                            />
                        );
                    })
                }
                {
                    this.state.towers.map(e => {
                        return (
                            <circle
                                cx={this.props.margin[3] + this.props.padding[0] + (e.getPosition()[1] + 0.5) * span_width}
                                cy={this.props.margin[0] + (e.getPosition()[0] + 0.5) * span_height}
                                r={20} key={`tower${e.getPosition()[0]}-${e.getPosition()[1]}`}
                                style={{fill: `rgba(225, 100, 225, ${Math.random() * 0.3 + 0.6})`}}
                            />
                        )
                    })
                }
                {
                    this.state.enemies.map(e => {
                        return (
                            <circle
                                cx={this.props.margin[3] + this.props.padding[0] + (e.getPosition()[1] + 0.5) * span_width}
                                cy={this.props.margin[0] + (e.getPosition()[0] + 0.5) * span_height}
                                r={20} key={`enemy${parseInt((Math.random() * 1e5).toString())}`}
                                style={{fill: `rgba(100, 225, 225, ${Math.random() * 0.3 + 0.6})`}}
                            />
                        )
                    })
                }
                {
                    this.state.flyingItems.map(e => {
                        return (
                            <circle
                                cx={this.props.margin[3] + this.props.padding[0] + (e.getPosition()[1] + 0.5) * span_width}
                                cy={this.props.margin[0] + (e.getPosition()[0] + 0.5) * span_height}
                                r={5} key={`flying${parseInt((Math.random() * 1e5).toString())}`}
                                style={{fill: `rgba(225, 100, 225, ${Math.random() * 0.3 + 0.6})`}}
                            />
                        )
                    })
                }
            </svg>
        );
    }

    public componentDidMount(): void {
        this.init();
        setTimeout(this.tick, 20);
        this.append(new Adam(0, 0, 3));
    }

    private tick: () => void
        = () => {
            let towers_update: Array<Tower> = [];
            this.state.towers.forEach(e => {
                e.tick();
                if (e.alive()) {
                    towers_update.push(e);
                }
            });
            let enemies_update: Array<Invator> = [];
            this.state.enemies.forEach(e => {
                if (e.move()) {
                    enemies_update.push(e);
                }
            });
            let flyingItems_update: Array<Bullet> = [];
            this.state.flyingItems.forEach(e => {
                if (e.move() && e.hit()) {
                    flyingItems_update.push(e);
                }
            });

            this.setState({
                towers: towers_update,
                enemies: enemies_update,
                flyingItems: flyingItems_update
            });

            if (this.state.gameState === Game_State.going) {
                setTimeout(this.tick, 20);
            }
        }
}
