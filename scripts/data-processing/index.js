/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const papa = require('papaparse');
const util = require('util');
const countryNames = require('./countryNames');
const { findKey } = require('lodash');

const INPUT_FILE_NAME = 'data.csv';
const OUTPUT_FILE_NAME = 'data.json';
const ENCODING = 'utf8';

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function main() {
  try {
    const csv = await readFileAsync(path.join(__dirname, INPUT_FILE_NAME), ENCODING);

    const json = papa.parse(csv, { header: true });

    console.log(Object.keys(json.data).length);
    console.log(Object.keys(countryNames).length);
    const dataToWrite = processJSON(json);

    await writeFileAsync(
      path.join(__dirname, OUTPUT_FILE_NAME),
      JSON.stringify(dataToWrite, null, 2),
      {
        encoding: ENCODING,
      }
    );
  } catch (e) {
    console.log(e);
  }
}

function processJSON(json) {
  return json.data.reduce((result, entry) => {
    const { Entity, Year, ...data } = entry;

    const key = findKey(countryNames, name => name === Entity.toUpperCase());

    if (!key) {
      throw new Error(`Can't find key! for ${Entity.toUpperCase()}`);
    }

    if (!result[key]) {
      result[key] = { name: Entity };
    }

    result[key][Year] = data;

    return result;
  }, {});
}

main();
