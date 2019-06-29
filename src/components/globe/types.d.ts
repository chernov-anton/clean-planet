import * as THREE from 'three';

export interface Uniforms {
  [uniform: string]: { type: string; value: THREE.Texture | number };
}

export type CountryChangeCallback = (country: string) => void;
