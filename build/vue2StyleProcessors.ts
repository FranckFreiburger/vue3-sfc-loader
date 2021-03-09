/**
 * This is customized version of styleProcessors defined in @vue/component-compiler-utils to bring customRequire
 * support.
 *
 * https://github.com/vuejs/component-compiler-utils/blob/master/lib/styleProcessors/index.ts
 */

const merge = require('merge-source-map')

export interface StylePreprocessor {
  render(
    source: string,
    map: any | null,
    options: any
  ): StylePreprocessorResults
}

export interface StylePreprocessorResults {
  code: string
  map?: any
  errors: Array<Error>
}

const customRequire = (name: string, options?: any) => {
  const requireFn = options?.preprocessOptions?.customRequire
  if (requireFn) {
    return requireFn(name)
  }
  return require(name)
}

// .scss/.sass processor
const scss: StylePreprocessor = {
  render(
    source: string,
    map: any | null,
    options: any
  ): StylePreprocessorResults {
    const nodeSass = customRequire('sass', options)
    const finalOptions = Object.assign({}, options, {
      data: source,
      file: options.filename,
      outFile: options.filename,
      sourceMap: !!map
    })

    try {
      const result = nodeSass.renderSync(finalOptions)

      if (map) {
        return {
          code: result.css.toString(),
          map: merge(map, JSON.parse(result.map.toString())),
          errors: []
        }
      }

      return { code: result.css.toString(), errors: [] }
    } catch (e) {
      return { code: '', errors: [e] }
    }
  }
}

const sass = {
  render(
    source: string,
    map: any | null,
    options: any,
  ): StylePreprocessorResults {
    return scss.render(
      source,
      map,
      Object.assign({}, options, { indentedSyntax: true })
    )
  }
}

// .less
const less = {
  render(
    source: string,
    map: any | null,
    options: any
  ): StylePreprocessorResults {
    const nodeLess = customRequire('less', options)

    let result: any
    let error: Error | null = null
    nodeLess.render(
      source,
      Object.assign({}, options, { syncImport: true }),
      (err: Error | null, output: any) => {
        error = err
        result = output
      }
    )

    if (error) return { code: '', errors: [error] }

    if (map) {
      return {
        code: result.css.toString(),
        map: merge(map, result.map),
        errors: []
      }
    }

    return { code: result.css.toString(), errors: [] }
  }
}

// .styl
const styl = {
  render(
    source: string,
    map: any | null,
    options: any
  ): StylePreprocessorResults {
    const nodeStylus = customRequire('stylus', options)
    try {
      const ref = nodeStylus(source)
      Object.keys(options).forEach(key => ref.set(key, options[key]))
      if (map) ref.set('sourcemap', { inline: false, comment: false })

      const result = ref.render()
      if (map) {
        return {
          code: result,
          map: merge(map, ref.sourcemap),
          errors: []
        }
      }

      return { code: result, errors: [] }
    } catch (e) {
      return { code: '', errors: [e] }
    }
  }
}

export const processors: { [key: string]: StylePreprocessor } = {
  less,
  sass,
  scss,
  styl,
  stylus: styl
}