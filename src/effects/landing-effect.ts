import * as BABYLON from '@babylonjs/core';

/**
 * Trigger a landing effect using small animated sphere meshes.
 * Avoids BABYLON.ParticleSystem which has Vite shader loading issues.
 */
export function triggerLandingEffect(
  scene: BABYLON.Scene,
  position: BABYLON.Vector3,
  speed: number
): void {
  const particleCount = Math.min(Math.round(5 + speed * 0.8), 25);
  const lifespan = 400; // ms
  const burstRadius = 0.3;

  for (let i = 0; i < particleCount; i++) {
    // Random offset within a sphere around the landing point
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.random() * burstRadius;

    const particle = BABYLON.MeshBuilder.CreateSphere(
      `landingParticle_${Date.now()}_${i}`,
      { diameter: 0.04 + Math.random() * 0.06 },
      scene
    );
    particle.position = new BABYLON.Vector3(
      position.x + r * Math.sin(phi) * Math.cos(theta),
      position.y + 0.1,
      position.z + r * Math.sin(phi) * Math.sin(theta)
    );

    // White-ish material with slight randomness
    const material = new BABYLON.StandardMaterial(`landingMat_${Date.now()}_${i}`, scene);
    const brightness = 0.7 + Math.random() * 0.3;
    material.diffuseColor = new BABYLON.Color3(brightness, brightness, 1);
    material.alpha = 0.8;
    particle.material = material;

    // Animate upward and fade out
    const startTime = performance.now();
    const vy = 0.5 + Math.random() * 1.5; // upward velocity

    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed >= lifespan) {
        scene.removeMesh(particle, true);
        return;
      }
      const progress = elapsed / lifespan;
      // Move upward
      particle.position.y += vy * 0.02;
      // Fade out
      material.alpha = 0.8 * (1 - progress);
      // Scale down
      const scale = 1 - progress * 0.7;
      particle.scaling = new BABYLON.Vector3(scale, scale, scale);
      requestAnimationFrame(animate);
    };
    animate();
  }
}
