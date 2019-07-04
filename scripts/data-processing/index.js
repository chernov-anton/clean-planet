/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const papa = require('papaparse');
const util = require('util');

const INPUT_FILE_NAME = 'data.csv';
const OUTPUT_FILE_NAME = 'data.json';
const ENCODING = 'utf8';

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function main() {
  try {
    const csv = await readFileAsync(path.join(__dirname, INPUT_FILE_NAME), ENCODING);

    const json = papa.parse(csv, { header: true });

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

    if (!result[Entity]) {
      result[Entity] = {};
    }

    result[Entity][Year] = data;

    return result;
  }, {});
}

main();
