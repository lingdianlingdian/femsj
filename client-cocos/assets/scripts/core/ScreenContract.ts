export type ScreenAssetStatus = 'PENDING_EDITOR_GENERATION' | 'READY';

export interface ScreenNetworkContract {
  policy: string;
  timeoutMs: number;
  retry: string;
}

export interface ScreenComponentContract {
  id: string;
  type: string;
  minTouch: number;
  visibleWhen?: string;
}

export interface ScreenLayoutRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  role: string;
}

export interface ScreenPrefabContract {
  screenId: string;
  name: string;
  route: string;
  prefabResourcePath: string;
  sourceContract: string;
  states: string[];
  componentTypes: string[];
  components: ScreenComponentContract[];
  layout: Record<string, ScreenLayoutRegion>;
  interactionRules: string[];
  network: ScreenNetworkContract | null;
  analytics: string[];
  acceptance: string[];
  status: ScreenAssetStatus;
}

export interface ScreenRouteResolution {
  requestedRoute: string;
  contract: ScreenPrefabContract;
  params: Record<string, string>;
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
