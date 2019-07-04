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
  const csv = await readFileAsync(path.join(__dirname, INPUT_FILE_NAME), ENCODING);
  console.log(csv);

  const json = papa.parse(csv);
  console.log(json);

  await writeFileAsync(path.join(__dirname, OUTPUT_FILE_NAME), JSON.stringify(json.data, null, 2), {
    encoding: ENCODING,
  });
}

main();
