import { dirname } from 'path';
import { fileURLToPath } from 'url';

import path from 'path'
import fs from 'fs'

import mime from 'mime-types'

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





const files = {
  '/coverageTest.html': path.join(__dirname, 'coverageTest.html'),
  '/vue3-sfc-loader.js': path.join(__dirname, '..\\dist\\vue3-sfc-loader.js'),
  '/vue3-sfc-loader.js.map': path.join(__dirname, '..\\dist\\vue3-sfc-loader.js.map'),
}


async function getFile(url, encoding) {

  const { protocol, pathname } = new URL(url);

  if ( protocol !== 'file:' )
    return null

  const res = {
    contentType: mime.lookup(path.extname(pathname)) || '',
    body: fs.readFileSync(files[pathname], { encoding }),
  };

  return res;
}


function sorted(list, key) {

  let dir = 1;
  if ( key[0] === '-' ) {

    key = key.slice(1);
    dir = -1;
  }

  return list.slice().sort( (a, b) => dir * (a[key] - b[key]) );
}

function allignRight(str, width) {

  return ' '.repeat(Math.max(width - str.length, 0)) + str;
}


;(async () => {

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', async interceptedRequest => {

    try {

      const file = await getFile(interceptedRequest.url(), 'utf-8');

      if ( file !== null ) {

        return void interceptedRequest.respond({
          ...file,
          contentType: file.contentType + '; charset=utf-8',
        });
      }

      interceptedRequest.continue();

    } catch (ex) {

      page.emit('error', ex)
    }
  });

//  page.on('console', async msg => console.log('CONSOLE', await Promise.all( msg.args().map(e => e.jsonValue()) ) ));
  page.on('pageerror', async msg => console.log('PAGE ERROR', msg));
  page.on('error', async msg => console.log('ERROR', msg));

  //const donePromise = new Promise(resolve => page.exposeFunction('_done', resolve));

  await page.coverage.startJSCoverage();
	await page.goto('file:///coverageTest.html');
	const coverageData = await page.coverage.stopJSCoverage(); // doc: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#coveragestopjscoverage
  await browser.close();

	const bundle = {
		code: await getFile('file:///vue3-sfc-loader.js').then(res => res.body),
    map: await getFile('file:///vue3-sfc-loader.js.map').then(res => res.body),
		coverageRanges: convertRangesToLinesRanges(coverageData.find(e => e.url === 'file:///vue3-sfc-loader.js')),
	}

	const result = await explore(bundle, {
    onlyMapped: true,
    // output: { format: 'html' },
	});

  console.error('errors:', result.errors);

  //console.log( result.bundles.map(e => e.bundleName) );

  //  "bundleName": "Buffer",
  //  "totalBytes": 1674800,
  //  "mappedBytes": 1674071,
  //  "eolBytes": 23,
  //  "sourceMapCommentBytes": 43,
  //  "files": {
  //    "webpack://vue3-sfc-loader/webpack/universalModuleDefinition": {
  //      "size": 240,
  //      "coveredSize": 140
  //    },
  //    ...

  const files = result.bundles[0].files;
  let fileList = Object.entries(files).map( ([url, data]) => ({ url, ...data }) );
  fileList.forEach(e => { e.ratio = e.coveredSize / e.size });
  fileList = fileList.filter(e => e.coveredSize < 100);
  fileList = fileList.filter(e => e.size > 100);
//  fileList = fileList.filter(e => e.ratio < 0.1);
  fileList = sorted(fileList, 'ratio');

  for ( const e of fileList.slice(0, 50) ) {

    console.log(allignRight(`${ e.coveredSize } / ${ e.size }`, 12), allignRight(`(${ (e.ratio*100).toFixed(1) }%)`, 7),  e.url);
  }

	//fs.writeFileSync('exploreOutput.html', result.output);


})()
.catch(ex => console.error(ex));

