<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max } from 'd3-array';
  import { onMount } from 'svelte';

  let {
    data = [],
    xKey = 'year',
    keys = ['incoming', 'outgoing'],
    colors = ['#4A90E2', '#FF6B6B'],
    labels = ['Incoming', 'Outgoing']
  } = $props();

  let container;
  let width = $state(600);
  let height = $state(400);

  const margin = { top: 20, right: 100, bottom: 40, left: 60 };

  const xScale = $derived(
    scaleBand()
      .domain(data.map(d => d[xKey]))
      .range([margin.left, width - margin.right])
      .padding(0.3)
  );

  const innerScale = $derived(
    scaleBand()
      .domain(keys)
      .range([0, xScale.bandwidth()])
      .padding(0.1)
  );

  const yScale = $derived(
    scaleLinear()
      .domain([0, max(data, d => Math.max(...keys.map(k => d[k] || 0))) || 10])
      .range([height - margin.bottom, margin.top])
      .nice()
  );

  const yTicks = $derived(yScale.ticks(5));

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = Math.min(entry.contentRect.width * 0.5, 400);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });
</script>

<div bind:this={container} class="chart-container">
  <svg {width} {height}>
    <!-- Y Grid lines -->
    <g class="grid">
      {#each yTicks as tick}
        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={yScale(tick)}
          y2={yScale(tick)}
          stroke="#f0f0f0"
          stroke-width="1"
        />
      {/each}
    </g>

    <!-- Bars -->
    <g class="bars">
      {#each data as d}
        {#each keys as key, i}
          <rect
            x={xScale(d[xKey]) + innerScale(key)}
            y={yScale(d[key] || 0)}
            width={innerScale.bandwidth()}
            height={height - margin.bottom - yScale(d[key] || 0)}
            fill={colors[i]}
            opacity="0.9"
            class="bar"
          />
          {#if d[key] > 0}
            <text
              x={xScale(d[xKey]) + innerScale(key) + innerScale.bandwidth() / 2}
              y={yScale(d[key]) - 5}
              text-anchor="middle"
              class="value-label"
            >
              {d[key]}
            </text>
          {/if}
        {/each}
      {/each}
    </g>

    <!-- X Axis -->
    <g class="x-axis" transform="translate(0, {height - margin.bottom})">
      <line
        x1={margin.left}
        x2={width - margin.right}
        stroke="#ccc"
        stroke-width="2"
      />
      {#each data as d}
        <text
          x={xScale(d[xKey]) + xScale.bandwidth() / 2}
          y="25"
          text-anchor="middle"
          class="axis-label"
        >
          {d[xKey]}
        </text>
      {/each}
    </g>

    <!-- Y Axis -->
    <g class="y-axis" transform="translate({margin.left}, 0)">
      <line
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="#ccc"
        stroke-width="2"
      />
      {#each yTicks as tick}
        <text
          x="-10"
          y={yScale(tick)}
          dy="0.32em"
          text-anchor="end"
          class="axis-label"
        >
          {tick}
        </text>
      {/each}
    </g>

    <!-- Legend -->
    <g class="legend" transform="translate({width - margin.right + 20}, {margin.top})">
      {#each keys as key, i}
        <g transform="translate(0, {i * 25})">
          <rect
            width="15"
            height="15"
            fill={colors[i]}
            opacity="0.9"
          />
          <text
            x="20"
            y="12"
            class="legend-label"
          >
            {labels[i]}
          </text>
        </g>
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

  .bar {
    transition: opacity 0.2s ease;
  }

  .bar:hover {
    opacity: 1;
  }

  .value-label {
    font-size: 11px;
    fill: #666;
    font-weight: 500;
  }

  .axis-label {
    font-size: 12px;
    fill: #666;
  }

  .legend-label {
    font-size: 13px;
    fill: #333;
    font-weight: 500;
  }
</style>