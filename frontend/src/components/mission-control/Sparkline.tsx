import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import type { MetricPoint } from '@/types'

interface SparklineProps {
  data: MetricPoint[]
  color?: string
  height?: number
  showArea?: boolean
}

export function Sparkline({ data, color = '#6366f1', height = 48, showArea = true }: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length < 2) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const bbox = svgRef.current.getBoundingClientRect()
    const W = bbox.width || 200
    const H = height

    const padding = 4

    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, W - padding])

    const yMin = d3.min(data, (d) => d.value) ?? 0
    const yMax = d3.max(data, (d) => d.value) ?? 1
    const yPadding = (yMax - yMin) * 0.15 || 1

    const yScale = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([H - padding, padding])

    const line = d3
      .line<MetricPoint>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5))

    const area = d3
      .area<MetricPoint>()
      .x((_, i) => xScale(i))
      .y0(H - padding)
      .y1((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Defs gradient
    const defs = svg.append('defs')
    const gradId = `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`
    const grad = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0').attr('y1', '0')
      .attr('x2', '0').attr('y2', '1')

    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.3)
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.01)

    // Area
    if (showArea) {
      svg
        .append('path')
        .datum(data)
        .attr('fill', `url(#${gradId})`)
        .attr('d', area)
    }

    // Line
    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    // Animate line draw
    const totalLength = (path.node() as SVGPathElement).getTotalLength()
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(600)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)

    // End dot
    const last = data[data.length - 1]
    const lx = xScale(data.length - 1)
    const ly = yScale(last.value)

    svg
      .append('circle')
      .attr('cx', lx)
      .attr('cy', ly)
      .attr('r', 3)
      .attr('fill', color)
      .attr('filter', `drop-shadow(0 0 4px ${color})`)
  }, [data, color, height, showArea])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
