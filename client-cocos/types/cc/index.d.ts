declare module 'cc' {
  export class Node {
    destroy(): void;
    addChild(node: Node): void;
  }

  export class Prefab {}
  export class SpriteFrame {}

  export class JsonAsset {
    json: unknown;
  }

  export class Component {
    getComponent<T>(ctor: new (...args: any[]) => T): T | null;
    addComponent<T>(ctor: new (...args: any[]) => T): T;
  }

  export class SafeArea {
    updateArea(): void;
  }

  export class EventTarget {
    emit(type: string, ...args: any[]): void;
    on?(type: string, callback: (...args: any[]) => void, target?: unknown): void;
    off?(type: string, callback?: (...args: any[]) => void, target?: unknown): void;
  }

  export const resources: {
    load<T>(
      path: string,
      type: new (...args: any[]) => T,
      callback: (error: Error | null, asset: T) => void
    ): void;
  };

  export function instantiate(prefab: Prefab): Node;

  export const _decorator: {
    ccclass(name: string): ClassDecorator;
    property(type?: unknown): PropertyDecorator;
  };
}
