/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');

const input = '../data/raw/DrugtoDiseasePrediction-subset.json';
const output = '../data/drug-disease-mappings-subset.json';
const lowerScoreLimit = 0.5;
const prettyPrintJson = false;

const rawMaps = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, input), 'utf-8'),
);

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 * }} Node
 *
 * @typedef {{
 *   drug: Node,
 *   disease: Node,
 *   score: number,
 *   known: boolean,
 * }} DrugDiseaseMapping
 *
 * @type {DrugDiseaseMapping[]}
 */
const arrayOfMappings = Object.entries(rawMaps.Score)
  .filter(([, score]) => score >= lowerScoreLimit)
  .sort((a, b) => b[1] - a[1])
  .map(([id, score]) => ({
    drug: {
      id: rawMaps.DrugID[id],
      name: rawMaps.DrugName[id],
    },
    disease: {
      id: rawMaps.DiseaseID[id],
      name: rawMaps.DiseaseName[id],
    },
    score,
    known: rawMaps.Known[id] === '1',
  }));

fs.writeFileSync(
  path.resolve(__dirname, output),
  JSON.stringify(arrayOfMappings, null, prettyPrintJson ? 2 : 0),
);
