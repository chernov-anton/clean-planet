import * as THREE from 'three';
import markersData from './markersData.json';
import memoize from 'lodash/memoize';

export function getDisplayPosition(
  vector: THREE.Vector3,
  container: HTMLElement
): { x: number; y: number } {
  return {
    x: Math.round(vector.x * (container.clientWidth / 2) + container.clientWidth / 2),
    y: Math.round((0 - vector.y) * (container.clientHeight / 2) + container.clientHeight / 2),
  };
}

export function getCameraProjection(vec3: THREE.Vector3, camera: THREE.Camera): THREE.Vector3 {
  return vec3.clone().project(camera);
}

export function getDistance(vector1: THREE.Vector3, vector2: THREE.Vector3): number {
  let dx = vector1.x - vector2.x;
  let dy = vector1.y - vector2.y;
  let dz = vector1.z - vector2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isKeyof<T extends object>(obj: T, possibleKey: keyof any): possibleKey is keyof T {
  return possibleKey in obj;
}

interface MarkerModel {
  lat: string;
  lon: string;
  countryName: string;
  center: {
    x: number;
    y: number;
    z: number;
  };
}

function getRawMarkerData(countryCode: string): MarkerModel {
  if (!isKeyof(markersData, countryCode)) {
    throw new Error('Country code is invalid');
  }
  return markersData[countryCode];
}

export const getMarkerData = memoize(getRawMarkerData);
