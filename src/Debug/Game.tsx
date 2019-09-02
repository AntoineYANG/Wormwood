/*
* @Author: Antoine YANG 
* @Date: 2019-08-27 16:45:10 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-01 03:07:46
*/

import { Bullet_props, BulletA, BulletB, BulletC } from "./Bullet";
import { TowerProps, InvatorProps, Adam, Mechanical, InvatorState, Invator, Tower, TowerState, MechanicalPain, Eve, MechanicalShooter } from "./Living";
import React, { Component, ReactInstance } from "react";
import Dict, { TowerDict, InvatorDict } from "./Dict";


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

    public set: Array< Array<object | null> > = [[null, null, null, null, null, null, null, null, null, null, null, null], 
        [null, null, null, null, null, null, null, null, null, null, null, null], 
        [null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null], 
        [null, null, null, null, null, null, null, null, null, null, null, null], 
        [null, null, null, null, null, null, null, null, null, null, null, null]];

    public getArr: () => number = () => this.props.map_arr;
    public getCor: () => number = () => this.props.map_cor;
    public getMargin: (idx: number) => number = (idx: number) => this.props.margin[idx];
    public getPadding: (idx: number) => number = (idx: number) => this.props.padding[idx];
    public getSpan: () => number = () => {
        return (1536 - this.props.margin[1] - this.props.margin[3] - this.props.padding[0] - this.props.padding[1])
            / this.props.map_cor;
    }

    public end(): void {
        this.setState({
            gameState: Game_State.end
        });
    }

    public win(): void {
        alert("VICTORY");
        this.end();
    }

    private tower_count: number = 0;
    private enemy_count: number = 0;
    private bullet_count: number = 0;

    public getLineHeight: () => number
        = () => (864 - this.props.margin[0] - this.props.margin[2]) / this.props.map_arr;

    private init: () => void
        = () => {
            this.setState({
                gameState: Game_State.going,
                towers: [],
                enemies: [],
                flyingItems: []
            });
            this.set = [[null, null, null, null, null, null, null, null, null, null, null, null], 
                [null, null, null, null, null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null, null, null, null, null]];
        }
    
    private constructor(props: props_game) {
        super(props);
        this.state = {
            gameState: Game_State.going,
    
            towers: [],
            enemies: [],
            flyingItems: []
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
        this.run = this.run.bind(this);

        this.TEST_ADAM = this.TEST_ADAM.bind(this);

        System = this;
    }

    public mount(obj: object, x: number, y: number): void {
        this.set[x][y] = obj;
    }

    public unmount(x: number, y: number): void {
        this.set[x][y] = null;
    }

    public EnemyInstance: Array<InvatorState & {uid: number, dom: ReactInstance, arr: number, component: Invator}> = [];
    public TowerInstance: Array<TowerState & {pos: number, uid: number, dom: ReactInstance, arr: number, component: Tower}> = [];

    public static start(): Game {
        if (System === null) {
            System = new Game({map_pic: '', map_arr: 6, map_cor: 12, margin: [180, 0, 100, 0], padding: [240, 120]});
        }
        return System!;
    }

    public appendTower(item: TowerDict, level: number, arr: number, cor: number): boolean {
        if (this.set[arr][cor]) {
            return false;
        }
        let towers_update: Array<TowerProps> = this.state.towers;
        towers_update.push(Dict.getTowerInstance(item, level, arr, cor)!);
        this.setState({
            towers: towers_update
        });
        this.tower_count++;
        return true;
    }

    public appendInvator(item: InvatorDict): boolean {
        let decay: number = 3000 * Math.random();
        setTimeout(() => {
            let enemies_update: Array<InvatorProps> = this.state.enemies;
            enemies_update.push(Dict.getInvatorInstance(item)!);
            this.setState({
                enemies: enemies_update
            });
            this.bullet_count++;
        }, decay);
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

        let towers: Array<TowerProps> = [];
        let enemies: Array<InvatorProps> = [];
        for (let i: number = 0; i < this.props.map_arr; i++) {
            this.state.towers.forEach(e => {
                if (e.arr === i) {
                    towers.push(e);
                }
            });
            this.state.enemies.forEach(e => {
                if (e.arr === i) {
                    enemies.push(e);
                }
            });
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
                                style={{fill: `rgba(225, 100, 100, 0.2)`,
                                    stroke: `rgba(225, 225, 100, 0.8)`}} key={`rect${e[0]}-${e[1]}`}
                                onClick={this.TEST_ADAM.bind(this, e[0], e[1])}
                            />
                        );
                    })
                }
                {
                    towers.map(e => {
                        return (
                            e.name === 'Eve'
                                ? <Eve name={'Eve'} life={e.life} armor={e.armor}
                                    physical_dec={e.physical_dec} fire_resist={e.fire_resist} cold_resist={e.cold_resist}
                                    electric_resist={e.electric_resist} magic_dec={e.magic_dec}
                                    arr={e.arr} cor={e.cor} key={e.id} level={e.level}
                                    update={this.update} id={e.id} />
                                : 
                            e.name === 'Adam'
                                ? <Adam name={'Adam'} life={e.life} armor={e.armor}
                                    physical_dec={e.physical_dec} fire_resist={e.fire_resist} cold_resist={e.cold_resist}
                                    electric_resist={e.electric_resist} magic_dec={e.magic_dec}
                                    arr={e.arr} cor={e.cor} key={e.id} level={e.level}
                                    update={this.update} id={e.id} />
                                : null
                        )
                    })
                }
                {
                    enemies.map(e => {
                        return (
                            e.name === 'MechanicalShooter'
                                ? <MechanicalShooter name={'MechanicalShooter'} key={e.id} id={e.id} life={e.life} armor={e.armor}
                                    fire_resist={e.fire_resist} cold_resist={e.cold_resist} electric_resist={e.electric_resist}
                                    update={this.update} physical_dec={e.physical_dec} magic_dec={e.magic_dec} arr={e.arr}
                                    speed={e.speed} />
                                :
                            e.name === 'MechanicalPain'
                                ? <MechanicalPain name={'MechanicalPain'} key={e.id} id={e.id} life={e.life} armor={e.armor}
                                    fire_resist={e.fire_resist} cold_resist={e.cold_resist} electric_resist={e.electric_resist}
                                    update={this.update} physical_dec={e.physical_dec} magic_dec={e.magic_dec} arr={e.arr}
                                    speed={e.speed} />
                                :
                            e.name === 'Mechanical'
                                ? <Mechanical name={'Mechanical'} key={e.id} id={e.id} life={e.life} armor={e.armor}
                                    fire_resist={e.fire_resist} cold_resist={e.cold_resist} electric_resist={e.electric_resist}
                                    update={this.update} physical_dec={e.physical_dec} magic_dec={e.magic_dec} arr={e.arr}
                                    speed={e.speed} />
                                : null
                        )
                    })
                }
                {
                    this.state.flyingItems.map(e => {
                        return (
                            e.type === 'BulletC'
                                ? <BulletC {...e} key={e.id} />
                                :
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
        setInterval(this.run, 2000);
    }

    public componentWillUnmount(): void {
        System = null;
    }

    public update(out: number): void {
        let towers_update: Array<TowerProps> = [];
        this.state.towers.forEach(e => {
            if (e.id !== out) {
                towers_update.push(e);
            }
            else {
                this.set[e.arr][e.cor] = null;
            }
        });

        let enemies_update: Array<InvatorProps> = [];
        let enemies: Array<InvatorState & {uid: number, dom: ReactInstance, arr: number, component: Invator}> = [];
        this.state.enemies.forEach(e => {
            if (e.id !== out) {
                enemies_update.push(e);
            }
        });
        this.EnemyInstance.forEach(e => {
            if (e.uid !== out) {
                enemies.push(e);
            }
        });
        this.EnemyInstance = enemies;

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
        if (this.tower_count % 2 === 0) {
            this.appendTower(TowerDict.Adam, 1, a, b);
        }
        else {
            this.appendTower(TowerDict.Eve, 2, a, b);
        }
    }


    private MB: any = {
        at6: () => {
            this.appendInvator(InvatorDict.Mechanical);
        },
        at10: () => {
            this.appendInvator(InvatorDict.Mechanical);
        },
        at14: () => {
            this.appendInvator(InvatorDict.Mechanical);
            this.appendInvator(InvatorDict.MechanicalShooter);
        },
        at18: () => {
            for (let i: number = 0; i < 2; i++) {
                this.appendInvator(InvatorDict.Mechanical);
            }
        },
        at26: () => {
            this.appendInvator(InvatorDict.MechanicalPain);
        },
        at32: () => {
            this.appendInvator(InvatorDict.Mechanical);
            this.appendInvator(InvatorDict.MechanicalShooter);
        },
        at38: () => {
            for (let i: number = 0; i < 2; i++) {
                this.appendInvator(InvatorDict.Mechanical);
            }
            for (let i: number = 0; i < 2; i++) {
                this.appendInvator(InvatorDict.MechanicalShooter);
            }
        },
        at44: () => {
            this.appendInvator(InvatorDict.MechanicalShooter);
            for (let i: number = 0; i < 3; i++) {
                this.appendInvator(InvatorDict.MechanicalPain);
            }
        },
        at50: () => {
            for (let i: number = 0; i < 3; i++) {
                this.appendInvator(InvatorDict.Mechanical);
            }
            for (let i: number = 0; i < 2; i++) {
                this.appendInvator(InvatorDict.MechanicalShooter);
            }
        },
        at70: () => {
            alert("FINAL WAVE ! ");
        },
        at74: () => {
            for (let i: number = 0; i < 4; i++) {
                this.appendInvator(InvatorDict.Mechanical);
            }
            for (let i: number = 0; i < 3; i++) {
                this.appendInvator(InvatorDict.MechanicalPain);
            }
        },
        at76: () => {
            for (let i: number = 0; i < 3; i++) {
                this.appendInvator(InvatorDict.MechanicalShooter);
            }
            let check: () => void
                = () => {
                    if (this.state.enemies.length > 0 || this.state.flyingItems.length > 0) {
                        setTimeout(() => {
                            check();
                        }, 1000);
                    }
                    else {
                        this.win();
                    }
                };
            check();
        }
    };

    private went: number = 0;

    public run(): void {
        this.went++;
        if (this.MB[`at${this.went}`]) {
            this.MB[`at${this.went}`]();
        }
    }
}

