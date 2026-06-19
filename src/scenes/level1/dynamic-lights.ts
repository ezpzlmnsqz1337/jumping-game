import * as BABYLON from '@babylonjs/core';

/** A patrol light that moves back and forth along a path */
interface PatrolLightDef {
  /** Waypoints the light travels between */
  waypoints: BABYLON.Vector3[];
  /** Speed in units per second */
  speed: number;
  /** Height offset above the path (added to each waypoint's Y) */
  heightOffset: number;
}

const PATROL_LIGHTS: PatrolLightDef[] = [
  // Spawn area — sweeps across the spawn corridor
  {
    waypoints: [new BABYLON.Vector3(-16, 0, -6), new BABYLON.Vector3(-16, 0, 4)],
    speed: 4,
    heightOffset: 3,
  },
  // Stage 1-2 corridor — along the side of the platforms
  {
    waypoints: [new BABYLON.Vector3(6, 0, -6), new BABYLON.Vector3(6, 0, 4)],
    speed: 5,
    heightOffset: 4,
  },
  // Stage 3-4 area — between the towers
  {
    waypoints: [new BABYLON.Vector3(10, 0, -9), new BABYLON.Vector3(10, 0, -15)],
    speed: 3,
    heightOffset: 5,
  },
  // Stage 5-6 — along the back of the map
  {
    waypoints: [new BABYLON.Vector3(-10, 0, -10), new BABYLON.Vector3(-10, 0, 10)],
    speed: 6,
    heightOffset: 6,
  },
  // Long jump corridor — sweeps along the jump line
  {
    waypoints: [new BABYLON.Vector3(35, 0, -45), new BABYLON.Vector3(35, 0, 45)],
    speed: 8,
    heightOffset: 5,
  },
  // Slide zone — across the entrance
  {
    waypoints: [new BABYLON.Vector3(-30, 0, 12), new BABYLON.Vector3(-20, 0, 12)],
    speed: 3,
    heightOffset: 4,
  },
];

export function createDynamicLights(scene: BABYLON.Scene): BABYLON.PointLight[] {
  const lights: BABYLON.PointLight[] = [];

  for (let i = 0; i < PATROL_LIGHTS.length; i++) {
    const def = PATROL_LIGHTS[i];
    const startPos = def.waypoints[0].clone();
    startPos.y += def.heightOffset;

    const light = new BABYLON.PointLight(`patrolLight-${i}`, startPos, scene);
    light.diffuse = new BABYLON.Color3(1, 0.9, 0.1); // yellow
    light.intensity = 0.6;

    // Attach animation data for use in render loop
    light.metadata = {
      patrol: {
        waypoints: def.waypoints,
        totalDistance: calculatePathLength(def.waypoints),
        speed: def.speed,
        elapsed: Math.random() * 100, // random start offset
        heightOffset: def.heightOffset,
      },
    };

    lights.push(light);
  }

  return lights;
}

function calculatePathLength(waypoints: BABYLON.Vector3[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i++) {
    total += BABYLON.Vector3.Distance(waypoints[i - 1], waypoints[i]);
  }
  return total;
}

export function updateDynamicLights(lights: BABYLON.PointLight[], deltaTime: number): void {
  for (const light of lights) {
    const patrol = light.metadata?.patrol as
      | {
          waypoints: BABYLON.Vector3[];
          totalDistance: number;
          speed: number;
          elapsed: number;
          heightOffset: number;
        }
      | undefined;
    if (!patrol) continue;

    patrol.elapsed += deltaTime;

    // Ping-pong position along the path using sin
    const t =
      (Math.sin(((patrol.elapsed * patrol.speed) / patrol.totalDistance) * Math.PI) + 1) / 2;

    const pos = lerpPath(patrol.waypoints, t);
    pos.y += patrol.heightOffset;
    light.position = pos;
  }
}

/** Linearly interpolate along a path of waypoints */
function lerpPath(waypoints: BABYLON.Vector3[], t: number): BABYLON.Vector3 {
  if (waypoints.length === 1) return waypoints[0].clone();

  const totalLength = calculatePathLength(waypoints);
  const targetDist = t * totalLength;

  let accumulated = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const segmentLen = BABYLON.Vector3.Distance(waypoints[i - 1], waypoints[i]);
    if (accumulated + segmentLen >= targetDist || i === waypoints.length - 1) {
      const segT = (targetDist - accumulated) / segmentLen;
      return BABYLON.Vector3.Lerp(waypoints[i - 1], waypoints[i], Math.min(1, Math.max(0, segT)));
    }
    accumulated += segmentLen;
  }

  return waypoints[waypoints.length - 1].clone();
}
