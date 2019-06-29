import countryCoordinates from './countryCoordinates.json';
import countryLookup from './countryIso3166.json';
import * as THREE from 'three';
import forEach from 'lodash/forEach';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isKeyof<T extends object>(obj: T, possibleKey: keyof any): possibleKey is keyof T {
  return possibleKey in obj;
}

interface CountryCoordinates {
  lat: string;
  lon: string;
}

export interface Country extends CountryCoordinates {
  countryCode: string;
  countryName: string;
  center: THREE.Vector3;
}

interface CountryData {
  [country: string]: Country;
}

const RAD = 0.5;

function getCenter(country: CountryCoordinates): THREE.Vector3 {
  let lon = Number(country.lon) - 90;
  let lat = Number(country.lat);

  let phi = Math.PI / 2 - (lat * Math.PI) / 180 - Math.PI * 0.01;
  let theta = 2 * Math.PI - (lon * Math.PI) / 180 + Math.PI * 0.06;

  let center = new THREE.Vector3();
  center.y = Math.sin(phi) * Math.cos(theta) * RAD;
  center.x = Math.sin(phi) * Math.sin(theta) * RAD;
  center.z = Math.cos(phi) * RAD;

  return center;
}

function getCountriesData(): CountryData {
  const countryData: CountryData = {};
  forEach(
    countryCoordinates.countries,
    (countryCoordinates: CountryCoordinates, countryCode: string): void => {
      if (isKeyof(countryLookup, countryCode)) {
        const country: Country = {
          ...countryCoordinates,
          countryCode,
          countryName: countryLookup[countryCode],
          center: getCenter(countryCoordinates),
        };

        countryData[country.countryCode] = country;
      }
    }
  );

  return countryData;
}

export { getCountriesData };
