// see: https://github.com/Nyalab/caniuse-api/tree/master/src

const memoize = require("lodash.memoize");
const browserslist = require("browserslist");
const {features, feature: featureUnpack} = require("caniuse-lite");
const uniq = require("lodash.uniq");

function contains(str, substr) {
  return !!~str.indexOf(substr)
}

function parseCaniuseData(feature, browsers) {
  var support = {}
  var letters
  var letter

  browsers.forEach(function(browser) {
    support[browser] = {}
    for (var info in feature.stats[browser]) {
      letters = feature.stats[browser][info].replace(/#\d+/, "").trim().split(" ")
      info = parseFloat(info.split("-")[0]) //if info is a range, take the left
      if (isNaN(info)) continue
      for (var i = 0; i < letters.length ; i++) {
        letter = letters[i]
        if (letter === "d") { // skip this letter, we don't support it yet
          continue
        } else if (letter === "y"){ // min support asked, need to find the min value
          if (typeof support[browser][letter] === "undefined" ||
              info < support[browser][letter]) {
            support[browser][letter] = info
          }
        } else { // any other support, need to find the max value
          if (typeof support[browser][letter] === "undefined" ||
              info > support[browser][letter]) {
            support[browser][letter] = info
          }
        }
      }
    }
  })

  return support
}

function cleanBrowsersList(browserList) {
  return uniq(browserslist(browserList).map((browser) => browser.split(" ")[0]))
}





const featuresList = Object.keys(features)

let browsers
function setBrowserScope(browserList) {
  browsers = cleanBrowsersList(browserList)
}


const parse = memoize(parseCaniuseData, function(feat, browsers) {
  return feat.title + browsers
})

function isSupported(feature, browsers) {
  let data
  try {
    data = featureUnpack(features[feature])
  } catch(e) {
    let res = find(feature)
    if (res.length === 1) {
      data = features[res[0]]
    } else {
      throw new ReferenceError(`Please provide a proper feature name. Cannot find ${feature}`)
    }
  }

  const browserList = browserslist(browsers, {ignoreUnknownVersions: true})

  if (browserList && browserList.length > 0) {
    return browserList.map((browser) => {
      return browser.split(" ")
    })
    .every((browser) => {
      return data.stats[browser[0]] &&
        data.stats[browser[0]][browser[1]] &&
        data.stats[browser[0]][browser[1]][0] === "y"
    })
  }

  throw new ReferenceError(`browser is an unknown version: ${browsers}`)
}

function find(query) {
  if (typeof query !== "string") {
    throw new TypeError("The `query` parameter should be a string.")
  }

  if (~featuresList.indexOf(query)) { // exact match
    return query
  }

  return featuresList.filter((file) => contains(file, query))
}


setBrowserScope()

module.exports = {
  isSupported,
}