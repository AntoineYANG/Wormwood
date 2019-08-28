/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 16:45:10 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 19:38:39
*/

import { Bullet_props, BulletA, BulletB } from "./Bullet";
import { TowerProps, InvatorProps, Adam } from "./Living";
import React, { Component } from "react";

var System: Game | null = null;

export enum Game_State {
    going, end
}

// const map: Array<props_game> = [
//     {
//         map_pic: '',
//         map_arr: 6,
//         map_cor: 12,
//         margin: [180, 0, 100, 0],
//         padding: [240, 120]
//     }
// ];

export interface state_game {
    gameState: Game_State;

    towers: Array<TowerProps>;
    enemies: Array<InvatorProps>;
    flyingItems: Array<Bullet_props>;
    set: Array< Array<boolean> >;
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
        flyingItems: [],
        set: [[false, false, false, false, false, false, false, false, false, false, false, false], 
            [false, false, false, false, false, false, false, false, false, false, false, false], 
            [false, false, false, false, false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false, false, false, false, false], 
            [false, false, false, false, false, false, false, false, false, false, false, false], 
            [false, false, false, false, false, false, false, false, false, false, false, false]]
    };

    public getArr: () => number = () => this.props.map_arr;
    public getCor: () => number = () => this.props.map_cor;
    public getMargin: (idx: number) => number = (idx: number) => this.props.margin[idx];
    public getPadding: (idx: number) => number = (idx: number) => this.props.padding[idx];
    public getSpan: () => number = () => {
        return (1536 - this.props.margin[1] - this.props.margin[3] - this.props.padding[0] - this.props.padding[1])
            / this.props.map_cor;
    }

    private tower_count: number = 0;
    private bullet_count: number = 0;

    public getLineHeight: () => number
        = () => (864 - this.props.margin[0] - this.props.margin[2]) / this.props.map_arr;

    private init: () => void
        = () => {
            this.setState({
                gameState: Game_State.going,
                towers: [],
                enemies: [],
                flyingItems: [],
                set: [[false, false, false, false, false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false, false, false, false, false],
                    [false, false, false, false, false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false, false, false, false, false]]
            });
        }
    
    private constructor(props: props_game) {
        super(props);
        this.state = {
            gameState: Game_State.going,
    
            towers: [],
            enemies: [],
            flyingItems: [],
            set: [[false, false, false, false, false, false, false, false, false, false, false, false], 
                [false, false, false, false, false, false, false, false, false, false, false, false], 
                [false, false, false, false, false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false, false, false, false, false], 
                [false, false, false, false, false, false, false, false, false, false, false, false], 
                [false, false, false, false, false, false, false, false, false, false, false, false]]
        };
        this.getArr = this.getArr.bind(this);
        this.getCor = this.getCor.bind(this);
        this.getMargin = this.getMargin.bind(this);
        this.getPadding = this.getPadding.bind(this);
        this.getSpan = this.getSpan.bind(this);
        this.init = this.init.bind(this);
        this.appendTower = this.appendTower.bind(this);
        this.appendInvator = this.appendInvator.bind(this);
        this.appendBullet = this.appendBullet.bind(this);
        this.update = this.update.bind(this);

        this.TEST_ADAM = this.TEST_ADAM.bind(this);

        System = this;
    }

    public static start(): Game {
        if (System === null) {
            System = new Game({map_pic: '', map_arr: 6, map_cor: 12, margin: [180, 0, 100, 0], padding: [240, 120]});
        }
        return System!;
    }

    public appendTower(item: TowerProps): boolean {
        let towers_update: Array<TowerProps> = this.state.towers;
        towers_update.push(item);
        this.setState({
            towers: towers_update
        });
        this.tower_count++;
        return true;
    }

    public appendInvator(item: InvatorProps): boolean {
        let enemies_update: Array<InvatorProps> = this.state.enemies;
        enemies_update.push(item);
        this.setState({
            enemies: enemies_update
        });
        return true;
    }

    public appendBullet(item: Bullet_props): boolean {
        let flyingItems_update: Array<Bullet_props> = this.state.flyingItems;
        flyingItems_update.push(item);
        this.setState({
            flyingItems: flyingItems_update
        });
        this.bullet_count++;
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

        // console.log(this.state.flyingItems);
        // this.state.flyingItems.forEach(e => {
        //     console.log(this.props.margin[3] + this.props.padding[0] + e.getPosition()[0],
        //         this.props.margin[0] + e.getPosition()[1] * span_height);
        // });
        // console.log(this.state.towers);

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
                                style={{fill: `rgba(225, 100, 100, 0.2)`,
                                    stroke: `rgba(225, 225, 100, 0.8)`}} key={`rect${e[0]}-${e[1]}`}
                                onClick={this.TEST_ADAM.bind(this, e[0], e[1])}
                            />
                        );
                    })
                }
                {
                    this.state.towers.map(e => {
                        return (
                            e.name === 'Adam'
                                ? <Adam name={'Adam'} life={e.life} armor={e.armor}
                                    physical_dec={e.physical_dec} fire_resist={e.fire_resist} cold_resist={e.cold_resist}
                                    electric_resist={e.electric_resist} magic_dec={e.magic_dec}
                                    arr={e.arr} cor={e.cor} key={e.id} level={e.level}
                                    update={this.update} id={Math.random()} />
                                : null
                        )
                    })
                }
                {
                    // this.state.enemies.map((e, index) => {
                    //     return (
                    //         <circle
                    //             cx={e.getPosition()[0]}
                    //             cy={e.getPosition()[1]}
                    //             r={36} key={`enemy${index}`}
                    //             style={{fill: `rgba(100, 225, 225, 1})`}}
                    //         />
                    //     )
                    // })
                }
                {
                    this.state.flyingItems.map(e => {
                        return (
                            e.type === 'BulletA'
                                ? <BulletA {...e} key={e.id} />
                                :
                            e.type === 'BulletB'
                                ? <BulletB {...e} key={e.id} />
                                : null
                        )
                    })
                }
            </svg>
        );
    }

    public componentDidMount(): void {
        this.init();
    }

    public componentWillUnmount(): void {
        System = null;
    }

    protected update(out: number): void {
        let towers_update: Array<TowerProps> = [];
        this.state.towers.forEach(e => {
            if (e.id !== out) {
                towers_update.push(e);
            }
        });
        let enemies_update: Array<InvatorProps> = [];
        this.state.enemies.forEach(e => {
            if (e.id !== out) {
                enemies_update.push(e);
            }
        });
        let flyingItems_update: Array<Bullet_props> = [];
        this.state.flyingItems.forEach(e => {
            if (e.id !== out) {
                flyingItems_update.push(e);
            }
        });
        
        this.setState({
            towers: towers_update,
            enemies: enemies_update,
            flyingItems: flyingItems_update
        });
    }

    public TEST_ADAM(a: number, b: number): void {
        if (this.state.set[a][b]) {
            return;
        }
        this.appendTower({
            id: Math.random(),
            level: 2,
            name: 'Adam',
            life: 400,
            armor: 40,
            physical_dec: 0,
            fire_resist: 0,
            cold_resist: 0,
            electric_resist: 0,
            magic_dec: 0,
            arr: a,
            cor: b,
            update: this.update
        });
    }
}
