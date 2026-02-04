import { defineStore } from "pinia";

interface ControlState {
    isCollapsed: boolean;
    isMobile: boolean;
}

const useControlStore = defineStore("control", {
    state: (): ControlState => ({
        isCollapsed: false,
        isMobile: false,
    }),

    actions: {
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        }
        ,
        setMobile(value: boolean) {
            this.isMobile = value;
        }
    },
});
export default useControlStore;