import argv from 'minimist'

// config này để chạy trên production
const options = argv(process.argv.slice(2))
export const isProduction = Boolean(options.production)
