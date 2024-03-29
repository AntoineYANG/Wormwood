import { TowerProps, InvatorProps } from "./Living";
import { Game } from "./Game";

/*
 * @Author: Antoine YANG 
 * @Date: 2019-09-01 00:44:12 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-09-01 03:08:23
 */


export enum TowerDict {
    Adam, Eve
}

export enum InvatorDict {
    Mechanical, MechanicalPain, MechanicalShooter, MechanicalHuge
}


export default class Dict {
    private constructor() {}

    public static getTowerInstance(item: TowerDict, level: number, arr: number = -1, col: number = -1): TowerProps | null {
        arr = arr === -1 ? parseInt((Math.random() * Game.start().getArr()).toString()) : arr;
        col = col === -1 ? parseInt((Math.random() * Game.start().getCor()).toString()) : col;
        let base: {id: number, level: number, arr: number, physical_dec: number, fire_resist: number, cold_resist: number,
                electric_resist: number, magic_dec: number, update: (out: number) => void}
            = {
                id: Math.random(),
                level: level,
                arr: arr,
                physical_dec: 0,
                fire_resist: 0,
                cold_resist: 0,
                electric_resist: 0,
                magic_dec: 0,
                update: Game.start().update
            };
        switch (item) {
            case TowerDict.Adam:
                return {
                    ...base,
                    name: 'Adam',
                    life: 400,
                    armor: 40,
                    cor: col
                };
            case TowerDict.Eve:
                return {
                    ...base,
                    name: 'Eve',
                    life: 300,
                    armor: 200,
                    fire_resist: 10,
                    cold_resist: 10,
                    electric_resist: 25,
                    cor: col
                };
        }
        return null;
    }

    public static getInvatorInstance(item: InvatorDict, arr: number = -1, col: number = -1): InvatorProps | null {
        arr = arr === -1 ? parseInt((Math.random() * Game.start().getArr()).toString()) : arr;
        col = col === -1 ? parseInt((Math.random() * Game.start().getCor()).toString()) : col;
        let base: {id: number, arr: number, physical_dec: number, fire_resist: number, cold_resist: number,
                electric_resist: number, magic_dec: number, update: (out: number) => void, speed: number}
            = {
                id: Math.random(),
                arr: arr,
                physical_dec: 0,
                fire_resist: 0,
                cold_resist: 0,
                electric_resist: 0,
                magic_dec: 0,
                update: Game.start().update,
                speed: 1
            };
        switch (item) {
            case InvatorDict.Mechanical:
                return {
                    ...base,
                    life: 500,
                    name: 'Mechanical',
                    armor: 60
                };
            case InvatorDict.MechanicalPain:
                return {
                    ...base,
                    life: 500,
                    name: 'MechanicalPain',
                    armor: 60
                };
            case InvatorDict.MechanicalShooter:
                return {
                    ...base,
                    life: 300,
                    name: 'MechanicalShooter',
                    armor: 30,
                    speed: 1.2
                };
            case InvatorDict.MechanicalHuge:
                return {
                    ...base,
                    life: 1500,
                    name: 'MechanicalHuge',
                    armor: 1000,
                    speed: 0.7
                };
        }
        return null;
    }
}

