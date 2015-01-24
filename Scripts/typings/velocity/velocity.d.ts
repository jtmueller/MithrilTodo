// Type definitions for Velocity 0.0.22
// Project: http://velocityjs.org/
// Definitions by: Greg Smith <https://github.com/smrq/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped



declare function Velocity(element: HTMLElement, options: { properties: Object; options: velocity.VelocityOptions }): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, options: velocity.VelocityOptions): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, duration?: number, easing?: string, complete?: velocity.ElementCallback): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, duration?: number, easing?: number[], complete?: velocity.ElementCallback): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, duration?: number, complete?: velocity.ElementCallback): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, easing?: string, complete?: velocity.ElementCallback): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, easing?: number[], complete?: velocity.ElementCallback): velocity.VelocityStatic;
declare function Velocity(element: HTMLElement, properties: Object, complete?: velocity.ElementCallback): velocity.VelocityStatic;


declare module velocity {
    interface ElementCallback {
        (elements: NodeListOf<HTMLElement>): void;
    }

    interface ProgressCallback {
        (elements: NodeListOf<HTMLElement>, percentComplete: number, timeRemaining: number, timeStart: number): void;
    }

    interface VelocityStatic {
        Sequences: any;
        animate(options: { elements: NodeListOf<HTMLElement>; properties: Object; options: VelocityOptions }): void;
        animate(elements: NodeListOf<HTMLElement>, properties: Object, options: VelocityOptions): void;
        animate(element: HTMLElement, properties: Object, options: VelocityOptions): void;
    }

    interface VelocityOptions {
        queue?: any;
        duration?: any;
        easing?: any;
        begin?: ElementCallback;
        complete?: ElementCallback;
        progress?: ProgressCallback;
        display?: any;
        loop?: any;
        delay?: any;
        mobileHA?: boolean;
        _cacheValues?: boolean;
    }
}
