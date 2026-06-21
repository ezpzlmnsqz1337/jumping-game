import * as BABYLON from '@babylonjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ShadowGenerator } from './shadows';

describe('ShadowGenerator', () => {
  it('low tier sets shadowEnabled to false and creates null generator', () => {
    const mockLight = { shadowEnabled: true } as BABYLON.IShadowLight;
    const wrapper = new ShadowGenerator('low', mockLight, [], []);
    expect(mockLight.shadowEnabled).toBe(false);
    expect(wrapper.shadowGenerator).toBeNull();
  });

  it('dispose calls internal generator dispose and nulls reference', () => {
    const mockDispose = vi.fn();
    const mockLight = { shadowEnabled: true } as BABYLON.IShadowLight;
    const wrapper = new ShadowGenerator('low', mockLight, [], []);
    wrapper.shadowGenerator = { dispose: mockDispose } as unknown as BABYLON.ShadowGenerator;

    wrapper.dispose();

    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(wrapper.shadowGenerator).toBeNull();
  });

  it('dispose is a no-op when generator is null (low tier)', () => {
    const mockLight = { shadowEnabled: true } as BABYLON.IShadowLight;
    const wrapper = new ShadowGenerator('low', mockLight, [], []);
    expect(wrapper.shadowGenerator).toBeNull();
    wrapper.dispose();
    expect(wrapper.shadowGenerator).toBeNull();
  });

  it('addShadowCaster delegates to Babylon generator when present', () => {
    const mockAdd = vi.fn();
    const mockLight = { shadowEnabled: true } as BABYLON.IShadowLight;
    const wrapper = new ShadowGenerator('low', mockLight, [], []);
    wrapper.shadowGenerator = {
      addShadowCaster: mockAdd,
    } as unknown as BABYLON.ShadowGenerator;
    const mesh = { name: 'wall' } as BABYLON.Mesh;

    wrapper.addShadowCaster(mesh);

    expect(mockAdd).toHaveBeenCalledWith(mesh);
  });

  it('addShadowCaster is a no-op when generator is null', () => {
    const mockLight = { shadowEnabled: true } as BABYLON.IShadowLight;
    const wrapper = new ShadowGenerator('low', mockLight, [], []);
    const mesh = { name: 'player-body' } as BABYLON.Mesh;
    wrapper.addShadowCaster(mesh);
  });
});
