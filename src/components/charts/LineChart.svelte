<script>
  import { scaleLinear } from 'd3-scale';
  import { extent, max } from 'd3-array';
  import { line } from 'd3-shape';
  import { format } from 'd3-format';
  import { onMount } from 'svelte';

  let {
    data = [],
    xKey = 'x',
    yKey = 'y',
    color = '#4A90E2',
    showDots = true,
    showArea = false
  } = $props();

  let container;
  let width = $state(600);
  let height = $state(400);

  const margin = { top: 20, right: 40, bottom: 40, left: 60 };

  const xScale = $derived(
    scaleLinear()
      .domain(extent(data, d => d[xKey]) || [0, 100])
      .range([margin.left, width - margin.right])
  );

  const yScale = $derived(
    scaleLinear()
      .domain([0, max(data, d => d[yKey]) || 100])
      .range([height - margin.bottom, margin.top])
      .nice()
  );

  const linePath = $derived(
    line()
      .x(d => xScale(d[xKey]))
      .y(d => yScale(d[yKey]))
      (data)
  );

  const areaPath = $derived(
    line()
      .x(d => xScale(d[xKey]))
      .y(d => yScale(d[yKey]))
      (data) + `L${width - margin.right},${height - margin.bottom}L${margin.left},${height - margin.bottom}Z`
  );

  const formatNumber = format(',');
  const xTicks = $derived(xScale.ticks(5));
  const yTicks = $derived(yScale.ticks(5));

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = entry.contentRect.width * 0.5;
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });
</script>

<div bind:this={container} class="chart-container">
  <svg {width} {height}>
    <!-- Area -->
    {#if showArea}
      <path
        d={areaPath}
        fill={color}
        opacity="0.1"
      />
    {/if}

    <!-- Line -->
    <path
      d={linePath}
      fill="none"
      stroke={color}
      stroke-width="3"
    />

    <!-- Dots -->
    {#if showDots}
      {#each data as d}
        <circle
          cx={xScale(d[xKey])}
          cy={yScale(d[yKey])}
          r="5"
          fill={color}
          stroke="white"
          stroke-width="2"
        />
      {/each}
    {/if}

    <!-- X Axis -->
    <g class="x-axis" transform="translate(0, {height - margin.bottom})">
      <line
        x1={margin.left}
        x2={width - margin.right}
        stroke="#ccc"
        stroke-width="1"
      />
      {#each xTicks as tick}
        <g transform="translate({xScale(tick)}, 0)">
          <line y2="6" stroke="#ccc" />
          <text
            y="20"
            text-anchor="middle"
            class="axis-label"
          >
            {tick}
          </text>
        </g>
      {/each}
    </g>

    <!-- Y Axis -->
    <g class="y-axis" transform="translate({margin.left}, 0)">
      <line
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="#ccc"
        stroke-width="1"
      />
      {#each yTicks as tick}
        <g transform="translate(0, {yScale(tick)})">
          <line x2="-6" stroke="#ccc" />
          <text
            x="-10"
            dy="0.32em"
            text-anchor="end"
            class="axis-label"
          >
            {formatNumber(tick)}
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

  .axis-label {
    font-size: 12px;
    fill: #666;
  }

  circle {
    transition: r 0.2s ease;
  }

  circle:hover {
    r: 7;
  }
</style>