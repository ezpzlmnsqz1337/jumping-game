import * as BABYLON from '@babylonjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { MockShadowGenerator, shadowGeneratorCtorSpy } = vi.hoisted(() => {
  const shadowGeneratorCtorSpy = vi.fn();
  class MockShadowGenerator {
    addShadowCaster = vi.fn();
    dispose = vi.fn();
    constructor(...args: unknown[]) {
      shadowGeneratorCtorSpy(...args);
    }
  }
  return { MockShadowGenerator, shadowGeneratorCtorSpy };
});

vi.mock('../../shadows', () => ({ ShadowGenerator: MockShadowGenerator }));

import { Level1 } from './level1';

function makeFakePointLight() {
  const fake = Object.create(BABYLON.PointLight.prototype);
  let shadowEnabledVal = false;
  Object.defineProperty(fake, 'shadowEnabled', {
    get: () => shadowEnabledVal,
    set: (v: boolean) => {
      shadowEnabledVal = v;
    },
    configurable: true,
  });
  return fake;
}

interface FakeLevel {
  level: Level1;
  pointLight: ReturnType<typeof makeFakePointLight>;
  playerMesh: { name: string };
  ground: { name: string };
  wallMeshes: { name: string }[];
  scene: { meshes: { name: string }[] };
  initialGenerators: { dispose: ReturnType<typeof vi.fn> }[];
}

function setupLevel(): FakeLevel {
  const level = new Level1('test');
  const pointLight = makeFakePointLight();
  const playerMesh = { name: 'player-local' };
  const ground = { name: 'ground' };
  const wallMeshes = [{ name: 'wall-1' }, { name: 'wall-2' }];
  const playerBodyMesh = { name: 'player-body' };
  const scene = { meshes: [playerMesh, ground, ...wallMeshes, playerBodyMesh] };

  level.lights = [pointLight];
  level.player = { mesh: playerMesh } as never;
  level.ground = ground as never;
  level.walls = wallMeshes.map(m => ({ mesh: m })) as never;
  level.scene = scene as never;
  level.shadowGenerators = [
    { dispose: vi.fn(), addShadowCaster: vi.fn(), shadowGenerator: null } as never,
    { dispose: vi.fn(), addShadowCaster: vi.fn(), shadowGenerator: null } as never,
  ];

  return {
    level,
    pointLight,
    playerMesh,
    ground,
    wallMeshes,
    scene,
    initialGenerators: level.shadowGenerators as unknown as { dispose: ReturnType<typeof vi.fn> }[],
  };
}

describe('Level1.recreateShadowsForTier', () => {
  beforeEach(() => {
    shadowGeneratorCtorSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disposes existing shadow generators before rebuilding', () => {
    const { level, initialGenerators } = setupLevel();
    level.recreateShadowsForTier('high');
    expect(initialGenerators[0].dispose).toHaveBeenCalledTimes(1);
    expect(initialGenerators[1].dispose).toHaveBeenCalledTimes(1);
  });

  it('low tier disables point light shadows and creates no new generator', () => {
    const { level, pointLight } = setupLevel();
    expect(level.shadowGenerators.length).toBeGreaterThan(0);
    level.recreateShadowsForTier('low');
    expect((pointLight as { shadowEnabled: boolean }).shadowEnabled).toBe(false);
    expect(level.shadowGenerators).toEqual([]);
    expect(shadowGeneratorCtorSpy).not.toHaveBeenCalled();
  });

  it('medium tier creates a ShadowGenerator with tier medium', () => {
    const { level } = setupLevel();
    level.recreateShadowsForTier('medium');
    expect(shadowGeneratorCtorSpy).toHaveBeenCalledTimes(1);
    expect(shadowGeneratorCtorSpy.mock.calls[0][0]).toBe('medium');
  });

  it('high tier creates a ShadowGenerator with tier high', () => {
    const { level } = setupLevel();
    level.recreateShadowsForTier('high');
    expect(shadowGeneratorCtorSpy).toHaveBeenCalledTimes(1);
    expect(shadowGeneratorCtorSpy.mock.calls[0][0]).toBe('high');
  });

  it('re-scans scene.meshes for player-body and adds them as casters', () => {
    const { level, scene } = setupLevel();
    level.recreateShadowsForTier('high');
    const newGenerators = level.shadowGenerators as unknown as {
      addShadowCaster: ReturnType<typeof vi.fn>;
    }[];
    expect(newGenerators).toHaveLength(1);
    const playerBodyMesh = scene.meshes.find(m => m.name === 'player-body');
    expect(playerBodyMesh).toBeDefined();
    expect(newGenerators[0].addShadowCaster).toHaveBeenCalledWith(playerBodyMesh);
  });

  it('warns and returns when player mesh is not ready', () => {
    const { level, initialGenerators } = setupLevel();
    (level.player as unknown as { mesh: undefined }).mesh = undefined;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    level.recreateShadowsForTier('high');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('recreateShadowsForTier'));
    expect(level.shadowGenerators).toEqual([]);
    expect(initialGenerators[0].dispose).toHaveBeenCalled();
    expect(shadowGeneratorCtorSpy).not.toHaveBeenCalled();
  });

  it('warns and returns when ground is not ready', () => {
    const { level } = setupLevel();
    (level as { ground: null }).ground = null;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    level.recreateShadowsForTier('high');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('recreateShadowsForTier'));
    expect(level.shadowGenerators).toEqual([]);
    expect(shadowGeneratorCtorSpy).not.toHaveBeenCalled();
  });

  it('warns and returns when no point light is configured', () => {
    const { level } = setupLevel();
    level.lights = [];
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    level.recreateShadowsForTier('high');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('recreateShadowsForTier'));
    expect(level.shadowGenerators).toEqual([]);
    expect(shadowGeneratorCtorSpy).not.toHaveBeenCalled();
  });

  it('new generators have a stable list (exactly one) after a single rebuild', () => {
    const { level } = setupLevel();
    level.recreateShadowsForTier('high');
    expect(level.shadowGenerators).toHaveLength(1);
    const newGenerators = level.shadowGenerators as unknown as {
      addShadowCaster: ReturnType<typeof vi.fn>;
    }[];
    expect(newGenerators[0].addShadowCaster).toHaveBeenCalled();
  });

  it('onNewMeshAddedObservable-style handler still adds new player-body meshes to new generators', () => {
    const { level } = setupLevel();
    level.recreateShadowsForTier('high');
    const newGenerators = level.shadowGenerators as unknown as {
      addShadowCaster: ReturnType<typeof vi.fn>;
    }[];
    const observers: ((mesh: { name: string }) => void)[] = [];
    const observable = {
      add: (cb: (mesh: { name: string }) => void) => observers.push(cb),
    };
    (level as { scene: unknown }).scene = {
      meshes: [],
      onNewMeshAddedObservable: observable,
    };
    observers.push(mesh => {
      if (mesh.name === 'player-body') {
        newGenerators.forEach(sg => sg.addShadowCaster(mesh as never));
      }
    });
    const newlyAdded = { name: 'player-body' };
    observers[0](newlyAdded);
    expect(newGenerators[0].addShadowCaster).toHaveBeenCalledWith(newlyAdded);
  });
});
