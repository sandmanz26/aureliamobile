// Re-exports `./data` (the catalogue's shape and its 26 records) and
// `./queries` (everything that reads or changes it) as one module, so every
// existing `import ... from '../lib/sessions'` keeps resolving here
// unchanged — this directory *is* `../lib/sessions` as far as a consumer is
// concerned. See `./data` for why the split.
export * from './data'
export * from './queries'
