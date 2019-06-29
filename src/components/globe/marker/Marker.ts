import { Country, getCountriesData } from './countryDataUtils';
import * as THREE from 'three';
import { Vector3 } from 'three';

const countryData = getCountriesData();

function getElement(selector: string, root?: HTMLElement): HTMLElement {
  let element;

  if (root) {
    element = root.querySelector(selector) as HTMLElement;
  } else {
    element = document.querySelector(selector) as HTMLElement;
  }

  if (!element) {
    throw new Error('Element is missing');
  }

  return element;
}

/*var projector = new THREE.Projector();
var vector = projector.projectVector( vec3.clone(), camera );
var result = new Object();
var windowWidth = window.innerWidth;
var minWidth = 1280;
if(windowWidth < minWidth) {
  windowWidth = minWidth;
}
console.log(vector);
result.x = Math.round( vector.x * (windowWidth/2) ) + windowWidth/2;
result.y = Math.round( (0-vector.y) * (window.innerHeight/2) ) + window.innerHeight/2;*/

function getDisplayPosition(vec3: THREE.Vector3, camera: THREE.Camera): { x: number; y: number } {
  const container = getElement('#main');
  let vector = vec3.clone().project(camera);
  return {
    x: Math.round(vector.x * (container.clientWidth / 2) + container.clientWidth / 2),
    y: Math.round((0 - vector.y) * (container.clientHeight / 2) + container.clientHeight / 2),
  };
}

function getDistance(vector1: THREE.Vector3, vector2: THREE.Vector3): number {
  let dx = vector1.x - vector2.x;
  let dy = vector1.y - vector2.y;
  let dz = vector1.z - vector2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export class Marker {
  public country: Country;
  public htmlElement: HTMLElement;
  public countryLayer: HTMLElement;
  public detailLayer: HTMLElement;

  public constructor(country: Country) {
    this.country = country;

    let template = getElement('#marker_template');
    this.htmlElement = template.cloneNode(true) as HTMLElement;

    this.countryLayer = getElement('#countryText', this.htmlElement);
    this.detailLayer = getElement('#detailText', this.htmlElement);

    let nameLayer = getElement('#countryText', this.htmlElement);
    nameLayer.innerHTML = country.countryName.replace(' ', '&nbsp;');
  }

  public setPosition(x: string, y: string, z: string): void {
    this.htmlElement.style.left = `${x}px`;
    this.htmlElement.style.top = `${y}px`;
    this.htmlElement.style.zIndex = z;
  }

  public setSize(size: number): void {
    let detailSize = Math.floor(2 + size * 0.5);
    this.detailLayer.style.fontSize = `${detailSize}pt`;
    let totalHeight = detailSize * 2;
    this.htmlElement.style.fontSize = `${totalHeight * 1.125}pt`;
    if (detailSize <= 8) {
      this.countryLayer.style.marginTop = '0px';
    } else {
      this.countryLayer.style.marginTop = '-1px';
    }
  }

  public update(camera: THREE.Camera): void {
    let screenPos = getDisplayPosition(this.country.center, camera);
    let s = 5 - getDistance(camera.position, new Vector3());

    this.setSize(s * 3);

    let zIndex = Math.floor(1000 - this.country.center.z + s);

    this.setPosition(screenPos.x.toString(), screenPos.y.toString(), zIndex.toString());
  }
}

function getCountry(countryCode: string): Country {
  countryCode = countryCode.toUpperCase();
  let country = countryData[countryCode];
  console.log(country);
  if (!country) {
    throw new Error('Can not find this country');
  }

  return country;
}

function getMarker(countryCode: string): Marker {
  //	look up the name to mesh
  const country = getCountry(countryCode);

  let container = getElement('#root');

  let marker = new Marker(country);
  container.appendChild(marker.htmlElement);
  return marker;
}

function removeMarker(marker: Marker): void {
  let container = getElement('#root');

  container.removeChild(marker.htmlElement);
}

export { getMarker, removeMarker };
