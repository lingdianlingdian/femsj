export type ScreenAssetStatus = 'PENDING_EDITOR_GENERATION' | 'READY';

export interface ScreenPrefabContract {
  screenId: string;
  name: string;
  route: string;
  prefabResourcePath: string;
  sourceContract: string;
  states: string[];
  componentTypes: string[];
  network: Record<string, unknown> | null;
  status: ScreenAssetStatus;
}

export interface SharedComponentContract {
  componentId: string;
  name: string;
  sourcePrefab: string;
  resourcePath: string;
  category: string;
  states: string[];
  minTouch: number | null;
  status: ScreenAssetStatus;
}

export interface ScreenPrefabManifest {
  version: string;
  engine: string;
  architecture: string;
  shellScene: string;
  designResolution: { width: number; height: number };
  tallResolution: { width: number; height: number };
  screens: ScreenPrefabContract[];
  sharedComponents: SharedComponentContract[];
}
