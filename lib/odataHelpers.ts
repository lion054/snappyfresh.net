/**
 * Safely escape OData filter values to prevent SQL injection
 */
export function escapeODataValue(value: any) {
  if (value == null) return 'null'

  if (typeof value === 'string') {
    // Escape single quotes and remove potential injection characters
    return `'${value.replace(/'/g, "''").replace(/[<>]/g, '')}'`
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  throw new Error('Invalid OData value type')
}

/**
 * Build safe OData filter string
 */
export function buildODataFilter(filters: any) {
  if (!Array.isArray(filters) || filters.length === 0) {
    return ''
  }

  const filterParts = filters.map(({ field, operator, value }: any) => {
    // Validate field name (only alphanumeric and underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
      throw new Error(`Invalid field name: ${field}`)
    }

    // Validate operator
    const validOperators = ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'contains', 'startswith', 'endswith']
    if (!validOperators.includes(operator)) {
      throw new Error(`Invalid operator: ${operator}`)
    }

    const escapedValue = escapeODataValue(value)

    if (operator === 'contains' || operator === 'startswith' || operator === 'endswith') {
      return `${operator}(${field}, ${escapedValue})`
    }

    return `${field} ${operator} ${escapedValue}`
  })

  return `$filter=${filterParts.join(' and ')}`
}

/**
 * Build safe OData query string
 */
export function buildODataQuery({ filter, select, orderby, top, skip }: any) {
  const parts: any = []

  if (filter) {
    parts.push(buildODataFilter(filter))
  }

  if (select && Array.isArray(select)) {
    // Validate field names
    select.forEach((field: any) => {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
        throw new Error(`Invalid field name in select: ${field}`)
      }
    })
    parts.push(`$select=${select.join(',')}`)
  }

  if (orderby) {
    // Validate field name
    const field = orderby.replace(/ (asc|desc)$/i, '')
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
      throw new Error(`Invalid field name in orderby: ${field}`)
    }
    parts.push(`$orderby=${orderby}`)
  }

  if (typeof top === 'number' && top > 0) {
    parts.push(`$top=${Math.floor(top)}`)
  }

  if (typeof skip === 'number' && skip >= 0) {
    parts.push(`$skip=${Math.floor(skip)}`)
  }

  return parts.join('&')
}

/**
 * Safe search query builder (prevents injection in search strings)
 * Supports searching multiple fields with OR logic
 * @param {string} searchTerm
 * @param {string | string[]} fields
 * @returns {string}
 */
export function buildSafeSearchFilter(searchTerm: any, fields: any = 'ItemName') {
  // Normalize fields to array
  const fieldList = Array.isArray(fields) ? fields : [fields]

  // Validate all field names
  fieldList.forEach((field: any) => {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
      throw new Error(`Invalid field name: ${field}`)
    }
  })

  // Sanitize using the proper escape function (handles single quotes correctly)
  const sanitized = searchTerm.replace(/'/g, "''").replace(/[<>]/g, '')

  if (!sanitized) {
    return ''
  }

  const conditions = fieldList.map(field => `contains(${field}, '${sanitized}')`)
  return `$filter=${conditions.join(' or ')}`
}
