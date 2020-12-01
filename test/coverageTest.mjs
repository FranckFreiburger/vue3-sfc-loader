import { dirname } from 'path';
import { fileURLToPath } from 'url';

import path from 'path'
import fs from 'fs'
import express from 'express'
import serveStatic from 'serve-static'
import open from 'open'

import fetch from 'node-fetch'
import puppeteer from 'puppeteer'
import SourceMapExplorer from 'source-map-explorer'
const { default: explore } = SourceMapExplorer;


const __dirname = dirname(fileURLToPath(import.meta.url));


const LF = '\n';
const CR_LF = '\r\n';

export function detectEOL(content) {
  return content.includes(CR_LF) ? CR_LF : LF;
}

// src: https://github.com/danvk/source-map-explorer/blob/master/src/lib/coverage.ts
function convertRangesToLinesRanges(coverage) {
  const { ranges, text } = coverage;

  const eol = detectEOL(text);
  const eolLength = eol.length;
  const lines = text.split(eol);

  // Current line offset
  let offset = 0;

  const lineRanges = lines.map((line) => {
    const lineLength = line.length;

    if (lineLength === 0) {
      return [];
    }

    // Exclusive line start/end
    const lineStart = offset;
    const lineEnd = offset + lineLength;

    const lineRanges = ranges.reduce((result, { start, end }) => {
      // Inclusive range start/end within the line
      const startIndex = start - lineStart;
      const endIndex = end - lineStart - 1;
      const lineEndIndex = lineLength - 1;

      if (start <= lineStart && lineEnd <= end) {
        // Range includes line range
        result.push({ start: 0, end: lineEndIndex });
      } else if (lineStart <= start && end <= lineEnd) {
        // Line range includes range
        result.push({ start: startIndex, end: endIndex });
      } else if (lineStart <= start && start <= lineEnd) {
        // Range starts within line range
        result.push({ start: startIndex, end: lineEndIndex });
      } else if (lineStart <= end && end <= lineEnd) {
        // Range ends within line range
        result.push({ start: 0, end: endIndex });
      }

      return result;
    }, []);

    // Move to next line jumping over EOL character
    offset = lineEnd + eolLength;

    return lineRanges;
  });

  return lineRanges;
}


;(async () => {

	const app = express();
	app.use(serveStatic(path.resolve(__dirname, '../dist')));
	app.use(serveStatic(__dirname, { 'index': ['index.html'] } ));

	const server = app.listen(8182);

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.coverage.startJSCoverage();
	await page.goto('http://127.0.0.1:8182/coverageTest.html');

	// doc: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#coveragestopjscoverage
	const coverageData = await page.coverage.stopJSCoverage();

	const bundle = {
		code: await fetch('http://127.0.0.1:8182/vue3-sfc-loader.js').then(res => res.buffer()),
		map: await fetch('http://127.0.0.1:8182/vue3-sfc-loader.js.map').then(res => res.buffer()),
		coverageRanges: convertRangesToLinesRanges(coverageData.find(e => e.url === 'http://127.0.0.1:8182/vue3-sfc-loader.js')),
	}

	await browser.close();
	server.close();

	const result = await explore(bundle, {
		output: { format: 'html' },
	});

	fs.writeFileSync('exploreOutput.html', result.output);


})()
.catch(ex => console.error(ex));

