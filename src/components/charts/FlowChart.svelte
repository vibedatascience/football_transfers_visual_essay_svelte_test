<script>
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  let {
    flows = [],
    leagues = []
  } = $props();

  let container;
  let width = $state(600);
  let height = $state(500);

  const margin = { top: 40, right: 150, bottom: 40, left: 150 };

  const colors = {
    'Premier League': '#3B1C85',
    'La Liga': '#FF6B00',
    'Bundesliga': '#E30613',
    'Serie A': '#00A0E3',
    'Ligue 1': '#00308F'
  };

  const yScale = $derived(
    scaleLinear()
      .domain([0, leagues.length])
      .range([margin.top, height - margin.bottom])
  );

  function getLeagueY(league) {
    const index = leagues.indexOf(league);
    return yScale(index + 0.5);
  }

  function getPath(source, target, value) {
    const sourceY = getLeagueY(source);
    const targetY = getLeagueY(target);
    const sourceX = margin.left;
    const targetX = width - margin.right;
    const midX = width / 2;

    return `M${sourceX},${sourceY} C${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`;
  }

  const maxFlow = $derived(Math.max(...flows.map(f => f.count), 1));

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = Math.max(400, leagues.length * 80);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });
</script>

<div bind:this={container} class="chart-container">
  <svg {width} {height}>
    <!-- Flow paths -->
    <g class="flows">
      {#each flows as flow}
        <path
          d={getPath(flow.source, flow.target, flow.count)}
          fill="none"
          stroke={colors[flow.source] || '#999'}
          stroke-width={Math.max(2, (flow.count / maxFlow) * 20)}
          opacity="0.3"
          class="flow-path"
        />
      {/each}
    </g>

    <!-- Source nodes (left) -->
    <g class="source-nodes">
      {#each leagues as league, i}
        <g transform="translate({margin.left}, {yScale(i + 0.5)})">
          <circle
            r="8"
            fill={colors[league] || '#666'}
          />
          <text
            x="-15"
            dy="0.32em"
            text-anchor="end"
            class="node-label"
          >
            {league}
          </text>
        </g>
      {/each}
    </g>

    <!-- Target nodes (right) -->
    <g class="target-nodes">
      {#each leagues as league, i}
        <g transform="translate({width - margin.right}, {yScale(i + 0.5)})">
          <circle
            r="8"
            fill={colors[league] || '#666'}
          />
          <text
            x="15"
            dy="0.32em"
            text-anchor="start"
            class="node-label"
          >
            {league}
          </text>
        </g>
      {/each}
    </g>

    <!-- Labels -->
    <text
      x={margin.left}
      y={margin.top - 15}
      text-anchor="middle"
      class="axis-title"
    >
      From
    </text>
    <text
      x={width - margin.right}
      y={margin.top - 15}
      text-anchor="middle"
      class="axis-title"
    >
      To
    </text>
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

  .flow-path {
    transition: opacity 0.3s ease, stroke-width 0.3s ease;
  }

  .flow-path:hover {
    opacity: 0.7;
  }

  .node-label {
    font-size: 13px;
    fill: #333;
    font-weight: 500;
  }

  .axis-title {
    font-size: 14px;
    fill: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  circle {
    transition: r 0.2s ease;
  }

  circle:hover {
    r: 10;
  }
</style>