import plrz from 'pluralize'

export function normalizeToKebabOrSnakeCase(str: string) {
  const STRING_DASHERIZE_REGEXP = /\s/g
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g
  return str
    .replace(STRING_DECAMELIZE_REGEXP, '$1-$2')
    .toLowerCase()
    .replace(STRING_DASHERIZE_REGEXP, '-')
}

export function pluralize(str: string) {
  return plrz.plural(str)
}

export function singularize(str: string) {
  return plrz.singular(str)
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
