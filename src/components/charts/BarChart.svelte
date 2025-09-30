<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max } from 'd3-array';
  import { format } from 'd3-format';
  import { onMount } from 'svelte';

  let {
    data = [],
    xKey = 'value',
    yKey = 'label',
    color = '#4A90E2',
    highlightColor = '#FF6B6B'
  } = $props();

  let container;
  let width = $state(600);
  let height = $state(400);

  const margin = { top: 20, right: 40, bottom: 40, left: 120 };

  const xScale = $derived(
    scaleLinear()
      .domain([0, max(data, d => d[xKey]) || 100])
      .range([margin.left, width - margin.right])
      .nice()
  );

  const yScale = $derived(
    scaleBand()
      .domain(data.map(d => d[yKey]))
      .range([margin.top, height - margin.bottom])
      .padding(0.2)
  );

  const formatNumber = format(',');

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = Math.min(entry.contentRect.width * 0.7, 500);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });
</script>

<div bind:this={container} class="chart-container">
  <svg {width} {height}>
    <!-- Bars -->
    <g class="bars">
      {#each data as d, i}
        <g class="bar-group" transform="translate(0, {yScale(d[yKey])})">
          <rect
            x={margin.left}
            y={0}
            width={xScale(d[xKey]) - margin.left}
            height={yScale.bandwidth()}
            fill={d.highlight ? highlightColor : color}
            opacity={0.9}
          />
          <text
            x={xScale(d[xKey]) + 8}
            y={yScale.bandwidth() / 2}
            dy="0.35em"
            class="value-label"
          >
            {formatNumber(d[xKey])}
          </text>
        </g>
      {/each}
    </g>

    <!-- Y Axis Labels -->
    <g class="y-axis">
      {#each data as d}
        <text
          x={margin.left - 10}
          y={yScale(d[yKey]) + yScale.bandwidth() / 2}
          dy="0.35em"
          text-anchor="end"
          class="axis-label"
        >
          {d[yKey]}
        </text>
      {/each}
    </g>
  </svg>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .value-label {
    font-size: 12px;
    fill: #666;
    font-weight: 500;
  }

  .axis-label {
    font-size: 13px;
    fill: #333;
    font-weight: 500;
  }

  rect {
    transition: opacity 0.3s ease;
  }

  rect:hover {
    opacity: 1;
  }
</style>