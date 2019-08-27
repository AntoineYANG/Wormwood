/*
 * @Author: Antoine YANG 
 * @Date: 2019-08-27 14:02:00 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-08-27 16:24:54
 */

export namespace Damage {
    export class Damage {
        public physical: number = 0;
        public fire: number = 0;
        public cold: number = 0;
        public electric: number = 0;
        public invalidate: () => void
            = () => {
                this.physical = 0;
                this.fire = 0;
                this.cold = 0;
                this.electric = 0;
            }
    }
}