/**
 * Minimal Prometheus text-format parser.
 * Handles: # HELP, # TYPE, metric{labels} value [timestamp]
 */
export interface PrometheusMetric {
  name: string
  help: string
  type: string
  values: PrometheusValue[]
}

export interface PrometheusValue {
  labels: Record<string, string>
  value: number
  timestamp?: number
}

export function parsePrometheus(text: string): PrometheusMetric[] {
  const lines = text.split('\n')
  const metrics: Map<string, PrometheusMetric> = new Map()
  let currentName = ''

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('# HELP ')) {
      const parts = line.slice(7).split(' ')
      currentName = parts[0]
      if (!metrics.has(currentName)) {
        metrics.set(currentName, { name: currentName, help: parts.slice(1).join(' '), type: '', values: [] })
      } else {
        metrics.get(currentName)!.help = parts.slice(1).join(' ')
      }
      continue
    }

    if (line.startsWith('# TYPE ')) {
      const parts = line.slice(7).split(' ')
      const name = parts[0]
      const type = parts[1]
      if (!metrics.has(name)) {
        metrics.set(name, { name, help: '', type, values: [] })
      } else {
        metrics.get(name)!.type = type
      }
      currentName = name
      continue
    }

    if (line.startsWith('#')) continue

    // Parse: metric_name{label="val",...} value [timestamp]
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*?)(\{[^}]*\})?\s+([\d.eE+\-]+|NaN|Inf|-Inf)(\s+(\d+))?$/)
    if (!match) continue

    const name = match[1]
    const labelsStr = match[2] || ''
    const rawValue = match[3]
    const rawTs = match[5]

    const labels: Record<string, string> = {}
    if (labelsStr) {
      const labelMatches = labelsStr.slice(1, -1).matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g)
      for (const lm of labelMatches) {
        labels[lm[1]] = lm[2]
      }
    }

    const value = parseFloat(rawValue)
    const timestamp = rawTs ? parseInt(rawTs, 10) : undefined

    if (!metrics.has(name)) {
      metrics.set(name, { name, help: '', type: '', values: [] })
    }
    metrics.get(name)!.values.push({ labels, value, timestamp })
  }

  return Array.from(metrics.values())
}

/** Extract a single scalar metric value by name */
export function extractScalar(metrics: PrometheusMetric[], name: string): number {
  const m = metrics.find((x) => x.name === name)
  if (!m || !m.values.length) return 0
  return m.values.reduce((sum, v) => sum + v.value, 0)
}

/** Extract a per-second rate from a counter metric */
export function extractRate(metrics: PrometheusMetric[], name: string): number {
  return extractScalar(metrics, name)
}
