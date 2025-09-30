================================================================================
CREATING PUDDING.COOL STYLE VISUALIZATIONS WITH SVELTE
================================================================================

A comprehensive guide FOR AI ASSISTANTS (like Claude Code) to build data-driven
visual stories inspired by The Pudding's design philosophy and technical approach.


All techniques and code patterns can be implemented using only:
- Standard web APIs (DOM, Intersection Observer, Canvas, etc.)
- Svelte 5 features ($state, $derived, $effect, actions, etc.)
- D3.js libraries (d3-scale, d3-array, d3-shape, etc.)
- You can look up external URLs and Documentations if needed

================================================================================
TABLE OF CONTENTS
================================================================================

1. Philosophy & Principles
2. Project Setup
3. Core Components
4. Scrollytelling Implementation
5. Data Visualization Patterns
6. Typography & Design System
7. Interactivity Patterns
8. Accessibility Best Practices
9. Performance Optimization
10. Deployment
11. Multi-Layer Chart Pattern (LayerCake-style)
12. Advanced Pudding Utilities (Implementable Actions & Utils)
13. Responsive Scrollytelling Best Practices
14. Complete Implementation Examples

================================================================================
1. PHILOSOPHY & PRINCIPLES
================================================================================

The Pudding's approach to visual essays follows these key principles:

NARRATIVE-FIRST DESIGN
- Every visualization tells a story
- Guide users through data with intentional pacing
- Use scrollytelling to control revelation of information
- Mix text, data, and visuals seamlessly

SIMPLICITY & CLARITY
- Clean, uncluttered layouts
- Generous white space
- Clear hierarchy
- Remove unnecessary decoration

ACCESSIBILITY
- Keyboard navigation support
- Screen reader friendly
- Focus states on all interactive elements
- Semantic HTML

MOBILE-FIRST RESPONSIVE
- Design works on all screen sizes
- Touch-friendly interactions
- Responsive typography
- Flexible layouts

================================================================================
2. PROJECT SETUP
================================================================================

INITIALIZE SVELTE 5 PROJECT
---------------------------
npm create vite@latest my-pudding-viz -- --template svelte
cd my-pudding-viz
npm install

ESSENTIAL DEPENDENCIES
---------------------
npm install d3-scale d3-array d3-format
npm install --save-dev @sveltejs/vite-plugin-svelte

OPTIONAL BUT RECOMMENDED
-----------------------
npm install layercake       # For complex charts
npm install d3-shape        # For path generation
npm install d3-time-format  # For date formatting

PROJECT STRUCTURE
----------------
src/
├── components/
│   ├── helpers/
│   │   ├── Scrolly.svelte      # Scrollytelling wrapper
│   │   ├── ButtonSet.svelte    # Button groups
│   │   └── Slider.svelte       # Range inputs
│   ├── charts/
│   │   ├── Scatterplot.svelte
│   │   ├── LineChart.svelte
│   │   └── BarChart.svelte
│   ├── sections/
│   │   ├── Header.svelte
│   │   ├── Introduction.svelte
│   │   ├── ScrollySection.svelte
│   │   └── Footer.svelte
│   └── App.svelte
├── data/
│   └── dataset.js
└── main.js

================================================================================
3. CORE COMPONENTS
================================================================================

SCROLLY COMPONENT (Intersection Observer-based)
----------------------------------------------
This is the foundation of scrollytelling. It tracks which element is most
in view and binds that index to a variable.

Usage:
<script>
  import Scrolly from './components/Scrolly.svelte';
  let currentStep = $state(0);
</script>

<Scrolly bind:value={currentStep}>
  <div class="step">Step 1 content</div>
  <div class="step">Step 2 content</div>
  <div class="step">Step 3 content</div>
</Scrolly>

Key Features:
- Uses Intersection Observer API for performance
- Configurable thresholds for trigger sensitivity
- Optional root margin for offset triggering
- Automatically tracks most visible element

Parameters:
- root: Container element (null = viewport)
- top: Top offset in pixels
- bottom: Bottom offset in pixels
- increments: Number of threshold steps (default 100)
- value: Bindable current step index

BUTTON SET COMPONENT (Accessible Toggles)
----------------------------------------
For filtering or switching between data views.

Usage:
<script>
  import ButtonSet from './components/ButtonSet.svelte';
  let selected = $state('option1');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ];
</script>

<ButtonSet {options} bind:value={selected} label="Choose option" />

Design principles:
- Clear active state with color and transform
- Hover states for feedback
- Focus-visible outlines for keyboard navigation
- aria-pressed for screen readers

STICKY VISUALIZATION COMPONENT
-----------------------------
Pairs with Scrolly for classic Pudding-style layouts.

CSS Pattern:
.sticky-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.sticky {
  position: sticky;
  top: 10vh;
  height: 80vh;
  align-self: start;
}

.steps {
  /* Steps scroll naturally */
}

.step {
  min-height: 80vh;
  display: flex;
  align-items: center;
}

================================================================================
4. SCROLLYTELLING IMPLEMENTATION
================================================================================

BASIC SCROLLYTELLING PATTERN
---------------------------
1. Create a sticky visualization area
2. Create scrollable text steps
3. Connect step index to visualization state
4. Update visualization based on current step

Example Structure:
<script>
  import Scrolly from './Scrolly.svelte';
  let currentStep = $state(0);

  const steps = [
    { text: "Introduction...", filter: 'all' },
    { text: "Focus on group A...", filter: 'groupA' },
    { text: "Focus on group B...", filter: 'groupB' }
  ];

  // Derive visualization data from current step
  const vizData = $derived(
    filterData(data, steps[currentStep]?.filter)
  );
</script>

<section class="scrolly-section">
  <!-- Sticky visualization -->
  <div class="sticky">
    <Chart data={vizData} />
  </div>

  <!-- Scrollable steps -->
  <Scrolly bind:value={currentStep}>
    {#each steps as step, i}
      <div class="step" class:active={currentStep === i}>
        <p>{step.text}</p>
      </div>
    {/each}
  </Scrolly>
</section>

ADVANCED PATTERNS
----------------

Multiple Sticky Elements:
- Use CSS position: sticky with different top values
- Create layered reveals
- Coordinate timing with scroll position

Animated Transitions:
- Use Svelte's built-in transitions
- CSS transitions for smooth property changes
- Consider using FLIP technique for complex animations

Step Opacity Pattern:
.step {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

================================================================================
5. DATA VISUALIZATION PATTERNS
================================================================================

SVELTE 5 REACTIVE PATTERNS
--------------------------
Use $state and $derived for reactivity:

<script>
  // Reactive state
  let selectedCategory = $state('all');
  let hoveredItem = $state(null);

  // Derived computed values
  const filteredData = $derived(
    data.filter(d =>
      selectedCategory === 'all' || d.category === selectedCategory
    )
  );

  const summary = $derived({
    count: filteredData.length,
    average: mean(filteredData, d => d.value)
  });
</script>

D3 SCALE INTEGRATION
-------------------
Create scales in derived values for reactivity:

<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { extent, max } from 'd3-array';

  let width = $state(600);
  let height = $state(400);
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  // Derived scales
  const xScale = $derived(
    scaleLinear()
      .domain(extent(data, d => d.x))
      .range([margin.left, width - margin.right])
  );

  const yScale = $derived(
    scaleLinear()
      .domain([0, max(data, d => d.y)])
      .range([height - margin.bottom, margin.top])
  );
</script>

RESPONSIVE SVG PATTERN
---------------------
<script>
  import { onMount } from 'svelte';

  let container;
  let width = $state(600);
  let height = $state(400);

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      width = entry.contentRect.width;
      height = entry.contentRect.width * 0.6; // Maintain aspect ratio
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  });
</script>

<div bind:this={container} class="chart-container">
  <svg {width} {height}>
    <!-- Chart elements -->
  </svg>
</div>

SCATTERPLOT PATTERN
------------------
<script>
  const circles = $derived(
    data.map(d => ({
      cx: xScale(d[xKey]),
      cy: yScale(d[yKey]),
      fill: colorScale(d.category),
      data: d
    }))
  );
</script>

<svg {width} {height}>
  <g class="circles">
    {#each circles as circle}
      <circle
        cx={circle.cx}
        cy={circle.cy}
        r="4"
        fill={circle.fill}
        stroke="white"
        stroke-width="1"
        onmouseenter={() => hoveredItem = circle.data}
        onmouseleave={() => hoveredItem = null}
      />
    {/each}
  </g>
</svg>

TOOLTIP PATTERN
--------------
<script>
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipData = $state(null);

  function handleMouseMove(event, data) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
    tooltipData = data;
  }
</script>

{#if tooltipData}
  <div
    class="tooltip"
    style="left: {tooltipX}px; top: {tooltipY}px;"
  >
    <strong>{tooltipData.label}</strong>
    <div>{tooltipData.value}</div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    pointer-events: none;
    transform: translate(-50%, -100%);
    margin-top: -10px;
  }
</style>

================================================================================
6. TYPOGRAPHY & DESIGN SYSTEM
================================================================================

THE PUDDING FONT STACK
----------------------
Primary: 'National 2' (custom font)
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

How to use National 2:
1. Purchase from Klim Type Foundry
2. Or use free alternatives:
   - 'Inter' (Google Fonts)
   - 'IBM Plex Sans' (Google Fonts)
   - System fonts only (fastest)

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

TYPOGRAPHY SCALE
---------------
:global(body) {
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 1rem 0;
}

h2 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 0.75rem 0;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

p {
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0 0 1rem 0;
  max-width: 65ch; /* Optimal reading width */
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
  font-weight: 400;
}

COLOR SYSTEM
-----------
/* Brand/Accent Color */
--color-primary: hsl(210, 70%, 50%);
--color-primary-dark: hsl(210, 70%, 40%);
--color-primary-light: hsl(210, 100%, 98%);

/* Grays */
--color-gray-50: #f9f9f9;
--color-gray-100: #f5f5f5;
--color-gray-200: #e5e5e5;
--color-gray-300: #d4d4d4;
--color-gray-600: #666;
--color-gray-900: #1a1a1a;

/* Semantic Colors */
--color-success: hsl(150, 60%, 45%);
--color-warning: hsl(45, 100%, 50%);
--color-error: hsl(0, 70%, 55%);

/* Data Visualization Palette */
--color-category-1: hsl(200, 70%, 50%);
--color-category-2: hsl(150, 60%, 45%);
--color-category-3: hsl(280, 65%, 55%);
--color-category-4: hsl(30, 85%, 55%);

SPACING SYSTEM
-------------
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */

LAYOUT PATTERNS
--------------
/* Full-width section */
.section {
  padding: var(--space-3xl) var(--space-lg);
  background: white;
}

/* Centered content */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

/* Card pattern */
.card {
  background: white;
  border-radius: 8px;
  padding: var(--space-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

================================================================================
7. INTERACTIVITY PATTERNS
================================================================================

HOVER STATES
-----------
Standard hover pattern:
.interactive-element {
  transition: all 0.2s ease;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

SVG hover pattern:
<circle
  class="data-point"
  r={hoveredId === d.id ? 6 : 4}
  opacity={hoveredId && hoveredId !== d.id ? 0.3 : 1}
/>

CLICK INTERACTIONS
-----------------
<script>
  let selectedItem = $state(null);

  function handleClick(item) {
    selectedItem = selectedItem === item ? null : item;
  }
</script>

<button
  class:active={selectedItem === item}
  onclick={() => handleClick(item)}
>
  {item.label}
</button>

DRAG INTERACTIONS
----------------
<script>
  let isDragging = $state(false);
  let dragValue = $state(50);

  function handleDragStart() {
    isDragging = true;
  }

  function handleDrag(event) {
    if (!isDragging) return;
    // Calculate new value based on mouse position
    dragValue = calculateValue(event.clientX);
  }

  function handleDragEnd() {
    isDragging = false;
  }
</script>

<svelte:window
  onmousemove={handleDrag}
  onmouseup={handleDragEnd}
/>

SLIDER COMPONENT
---------------
<script>
  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    label = ''
  } = $props();
</script>

<div class="slider-container">
  <label>{label}</label>
  <input
    type="range"
    bind:value
    {min}
    {max}
    {step}
  />
  <output>{value}</output>
</div>

<style>
  input[type="range"] {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: var(--color-gray-200);
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
  }
</style>

ANIMATION PATTERNS
-----------------
Svelte transitions:
<script>
  import { fade, fly, scale } from 'svelte/transition';
</script>

{#if visible}
  <div transition:fade={{ duration: 300 }}>
    Content
  </div>
{/if}

CSS animations:
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s ease-out;
}

Staggered animations:
{#each items as item, i}
  <div style="animation-delay: {i * 0.1}s;">
    {item}
  </div>
{/each}

================================================================================
8. ACCESSIBILITY BEST PRACTICES
================================================================================

KEYBOARD NAVIGATION
------------------
All interactive elements must be keyboard accessible:

<button
  onclick={handleClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</button>

FOCUS STATES
-----------
Always style focus-visible:

button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline */
button:focus {
  outline: none;
}

ARIA LABELS
----------
<button aria-label="Close dialog">
  <CloseIcon />
</button>

<nav aria-label="Main navigation">
  <!-- Nav items -->
</nav>

<section aria-labelledby="section-heading">
  <h2 id="section-heading">Section Title</h2>
</section>

SCREEN READER TEXT
-----------------
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

<span class="sr-only">Additional context for screen readers</span>

SEMANTIC HTML
------------
Use proper semantic elements:
- <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>
- <button> for actions, <a> for navigation
- <figure> and <figcaption> for visualizations
- Proper heading hierarchy (h1 -> h2 -> h3)

COLOR CONTRAST
-------------
Ensure WCAG AA compliance (4.5:1 for normal text):
- Test with browser dev tools
- Use tools like WebAIM Contrast Checker
- Never rely on color alone to convey information

ALTERNATIVE TEXT
---------------
<figure>
  <svg aria-labelledby="chart-title chart-desc">
    <title id="chart-title">Population by Age</title>
    <desc id="chart-desc">
      Bar chart showing population distribution across age groups,
      with the highest population in the 25-34 age range.
    </desc>
    <!-- Chart content -->
  </svg>
  <figcaption>
    Data source: Census Bureau 2023
  </figcaption>
</figure>

================================================================================
9. PERFORMANCE OPTIMIZATION
================================================================================

EFFICIENT REACTIVITY
-------------------
Use $derived for computed values instead of recalculating:

// Good
const total = $derived(items.reduce((sum, item) => sum + item.value, 0));

// Avoid
{items.reduce((sum, item) => sum + item.value, 0)}

LAZY LOADING DATA
----------------
<script>
  import { onMount } from 'svelte';

  let data = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const response = await fetch('/api/data');
    data = await response.json();
    loading = false;
  });
</script>

DEBOUNCING EXPENSIVE OPERATIONS
------------------------------
<script>
  let searchTerm = $state('');
  let debouncedSearch = $state('');
  let timeoutId;

  $effect(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debouncedSearch = searchTerm;
    }, 300);
  });

  const results = $derived(
    searchData(data, debouncedSearch)
  );
</script>

VIRTUAL SCROLLING
----------------
For large datasets, only render visible items:

npm install svelte-virtual-list

<script>
  import VirtualList from 'svelte-virtual-list';
  let items = [...Array(10000)]; // Large dataset
</script>

<VirtualList {items} let:item>
  <div class="item">{item}</div>
</VirtualList>

LAZY LOADING COMPONENTS
----------------------
const HeavyChart = lazy(() => import('./HeavyChart.svelte'));

<script>
  import { lazy } from 'svelte';

  let showChart = $state(false);
</script>

{#if showChart}
  {#await HeavyChart then Component}
    <Component />
  {/await}
{/if}

IMAGE OPTIMIZATION
-----------------
- Use WebP format with fallbacks
- Implement lazy loading with loading="lazy"
- Provide appropriate sizes with srcset
- Compress images before deployment

<img
  src="chart.webp"
  alt="Descriptive text"
  loading="lazy"
  width="800"
  height="600"
/>

================================================================================
10. DEPLOYMENT
================================================================================

BUILD FOR PRODUCTION
-------------------
npm run build

This creates optimized static files in the dist/ directory.

HOSTING OPTIONS
--------------
1. Netlify (Recommended)
   - Drag and drop dist/ folder
   - Or connect GitHub repo for continuous deployment
   - Free tier includes HTTPS and CDN

2. Vercel
   - Similar to Netlify
   - Excellent performance
   - Easy GitHub integration

3. GitHub Pages
   - Free hosting for static sites
   - Add to vite.config.js:
     export default {
       base: '/repo-name/'
     }

4. AWS S3 + CloudFront
   - More control, requires setup
   - Good for high-traffic sites

DEPLOYMENT CHECKLIST
-------------------
□ Test on multiple devices and browsers
□ Run accessibility audit (Lighthouse)
□ Optimize images and assets
□ Set up analytics (optional)
□ Add meta tags for social sharing
□ Test load time (aim for < 3s)
□ Verify all links work
□ Check mobile responsiveness
□ Test keyboard navigation
□ Validate HTML

META TAGS FOR SOCIAL SHARING
---------------------------
<head>
  <title>Your Visual Story Title</title>
  <meta name="description" content="Brief description" />

  <!-- Open Graph -->
  <meta property="og:title" content="Your Visual Story Title" />
  <meta property="og:description" content="Brief description" />
  <meta property="og:image" content="https://yoursite.com/preview.jpg" />
  <meta property="og:url" content="https://yoursite.com" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Your Visual Story Title" />
  <meta name="twitter:description" content="Brief description" />
  <meta name="twitter:image" content="https://yoursite.com/preview.jpg" />
</head>

================================================================================
11. MULTI-LAYER CHART PATTERN (LAYERCAKE-STYLE)
================================================================================

The Pudding often uses a pattern of composable, multi-layer charts where
SVG, Canvas, and HTML layers are combined. You can implement this pattern
without external libraries using the techniques below.

CORE CONCEPT
-----------
Create a chart system that:
- Measures container dimensions automatically
- Creates synchronized D3 scales
- Stays synced on layout changes
- Combines SVG, HTML, and Canvas layers
- Enables reusable chart components

This can be implemented entirely with Svelte 5 + D3 + standard web APIs.

IMPLEMENTATION PATTERN
---------------------
Instead of installing LayerCake, implement this pattern directly:

BASIC USAGE PATTERN
------------------
<script>
  import { LayerCake, Svg, Html, Canvas } from 'layercake';
  import Line from './components/Line.svelte';
  import AxisX from './components/AxisX.svelte';
  import AxisY from './components/AxisY.svelte';
  import Scatter from './components/Scatter.svelte';
  import Labels from './components/Labels.svelte';

  const data = [
    { x: 0, y: 10 },
    { x: 1, y: 20 },
    { x: 2, y: 15 }
  ];
</script>

<div class="chart-container">
  <LayerCake
    x='x'
    y='y'
    {data}
  >
    <!-- SVG Layer -->
    <Svg>
      <AxisX/>
      <AxisY/>
      <Line color='#f0c'/>
    </Svg>

    <!-- Canvas Layer -->
    <Canvas>
      <Scatter color='#0fc'/>
    </Canvas>

    <!-- HTML Layer -->
    <Html>
      <Labels/>
    </Html>
  </LayerCake>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 400px;
  }
</style>

LAYERCAKE CONTEXT
----------------
LayerCake provides context that child components can access:

<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, xScale, yScale, width, height } = getContext('LayerCake');
</script>

Available context properties:
- data: Your data array
- xGet, yGet: Functions that return scaled values
- xScale, yScale: D3 scale functions
- width, height: Current dimensions
- custom: Custom configuration object

CREATING A LINE COMPONENT
-------------------------
<!-- Line.svelte -->
<script>
  import { getContext } from 'svelte';
  import { line } from 'd3-shape';

  let { color = '#000' } = $props();

  const { data, xGet, yGet } = getContext('LayerCake');

  const path = $derived(
    line()
      .x(d => xGet(d))
      .y(d => yGet(d))
      (data)
  );
</script>

<path
  d={path}
  stroke={color}
  stroke-width="2"
  fill="none"
/>

CREATING AN AXIS COMPONENT
--------------------------
<!-- AxisX.svelte -->
<script>
  import { getContext } from 'svelte';

  const { width, height, xScale } = getContext('LayerCake');

  const ticks = $derived(xScale.ticks(5));
  const tickFormat = $derived(xScale.tickFormat());
</script>

<g class="axis x-axis">
  {#each ticks as tick}
    <g class="tick" transform="translate({xScale(tick)}, {height})">
      <line y2="6" stroke="currentColor" />
      <text
        y="9"
        dy="0.71em"
        text-anchor="middle"
      >
        {tickFormat(tick)}
      </text>
    </g>
  {/each}
</g>

MULTI-SERIES DATA
----------------
<script>
  const data = [
    { series: 'A', values: [{ x: 0, y: 1 }, { x: 1, y: 2 }] },
    { series: 'B', values: [{ x: 0, y: 2 }, { x: 1, y: 3 }] }
  ];
</script>

<LayerCake
  x={d => d.x}
  y={d => d.y}
  z='series'
  flatData={data.flatMap(d => d.values)}
  {data}
>
  <Svg>
    {#each data as series}
      <Line data={series.values} color={colorScale(series.series)} />
    {/each}
  </Svg>
</LayerCake>

RESPONSIVE CHARTS
----------------
LayerCake automatically handles responsive sizing:

<div class="chart-container">
  <LayerCake
    x='x'
    y='y'
    {data}
    padding={{ top: 20, right: 20, bottom: 40, left: 50 }}
  >
    <Svg>
      <AxisX/>
      <AxisY/>
      <Line/>
    </Svg>
  </LayerCake>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 400px;
    /* LayerCake adapts to container size */
  }

  @media (max-width: 768px) {
    .chart-container {
      height: 300px;
    }
  }
</style>

CANVAS RENDERING (for performance)
---------------------------------
<!-- ScatterCanvas.svelte -->
<script>
  import { getContext, onMount } from 'svelte';

  const { data, xGet, yGet } = getContext('LayerCake');
  let canvas;
  let ctx;

  onMount(() => {
    ctx = canvas.getContext('2d');
    draw();
  });

  function draw() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0fc';

    data.forEach(d => {
      ctx.beginPath();
      ctx.arc(xGet(d), yGet(d), 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  $effect(() => {
    if (data && ctx) draw();
  });
</script>

<canvas bind:this={canvas}></canvas>

PUDDING'S LAYERCAKE TEMPLATES
-----------------------------
The Pudding starter includes these LayerCake templates:
- Line charts
- Scatter plots
- Bar charts
- Area charts
- Multi-series visualizations

Located in: src/components/layercake/

BEST PRACTICES
-------------
1. Keep components small and focused
2. Use SVG for small datasets, Canvas for large datasets
3. Leverage LayerCake's responsive features
4. Create reusable axis components
5. Use the custom prop for component-specific config
6. Test on various screen sizes
7. Consider performance with large datasets

================================================================================
12. ARCHIEML & GOOGLE DOCS WORKFLOW
================================================================================

ArchieML enables non-technical team members to edit structured data in Google
Docs, which can then be pulled into your visualization. This is The Pudding's
secret weapon for collaborative, deadline-driven work.

WHAT IS ARCHIEML?
----------------
ArchieML (Archie Markup Language) is a text format that:
- Was created at The New York Times
- Optimized for human writing in Google Docs
- Converts to structured JSON
- Enables concurrent editing by reporters, editors, and developers
- Works with non-monospaced fonts

WHY USE IT?
----------
- Non-technical team members can edit data
- Real-time collaboration in Google Docs
- Version control through Google Docs history
- No need for developers to update code for content changes
- Perfect for deadline-driven journalism

SETUP IN PUDDING STARTER
------------------------
The Pudding svelte-starter includes ArchieML integration:

1. Create a Google Doc and make it public or accessible
2. Add the document ID to your config
3. Write ArchieML markup in the doc
4. Run: npm run gdoc

This fetches the latest content and converts it to JSON in your project.

ARCHIEML SYNTAX
--------------
Basic key-value:
```
title: My Story Title
subtitle: A fascinating exploration
```

Arrays:
```
[steps]
* First step text
* Second step text
* Third step text
[]
```

Objects in arrays:
```
[people]
name: Alice
age: 30
role: Developer
{}

name: Bob
age: 25
role: Designer
{}
[]
```

Nested objects:
```
{config}
colors.primary: #0066cc
colors.secondary: #ff6600
{}
```

Multi-line text:
```
description: This is a long description
that spans multiple lines.
It will be combined into a single string.
:end
```

Freeform objects:
```
{.steps}
[intro]
title: Introduction
text: Welcome to the story...
[]

[details]
title: The Details
text: Here's what happened...
[]
{}
```

GOOGLE DOCS INTEGRATION
-----------------------
Install the ArchieML Google Docs Add-on:
1. Open your Google Doc
2. Extensions → Add-ons → Get add-ons
3. Search for "ArchieML"
4. Install and authorize

Features:
- Live preview of JSON output
- Syntax validation
- Error highlighting

LOADING ARCHIEML IN SVELTE
--------------------------
After running `npm run gdoc`, your data is available:

<script>
  import data from '$data/doc.json';

  console.log(data.title);
  console.log(data.steps);
</script>

{#each data.steps as step}
  <div class="step">
    <h3>{step.title}</h3>
    <p>{step.text}</p>
  </div>
{/each}

GOOGLE SHEETS INTEGRATION
-------------------------
The Pudding starter also supports Google Sheets:

1. Create a Google Sheet
2. Make it public or accessible
3. Add sheet ID to config
4. Run: npm run gdoc

Access the data:
<script>
  import sheetData from '$data/sheet.json';
</script>

WORKFLOW EXAMPLE
---------------
1. Reporter writes story text in Google Doc with ArchieML markup
2. Data journalist adds data in Google Sheets
3. Developer runs `npm run gdoc` to fetch latest
4. Visualization updates automatically with new content
5. Repeat as needed during development

This enables:
- Quick iterations
- Non-developer content updates
- Last-minute changes on deadline
- Collaborative editing

BEST PRACTICES
-------------
1. Document your ArchieML structure for team members
2. Use consistent naming conventions
3. Keep complex data in Sheets, text in Docs
4. Run `npm run gdoc` frequently during development
5. Add comments in Google Docs to explain structure
6. Test with sample data first
7. Keep ArchieML syntax simple for non-technical users

EXAMPLE REAL-WORLD USE CASE
---------------------------
A typical Pudding project might use:
- Google Doc for intro text, step descriptions, and annotations
- Google Sheet for numerical data, dates, and categories
- Code for visualization logic
- ArchieML to connect content to code

This separation of concerns allows:
- Writers to focus on narrative
- Data journalists to focus on data
- Developers to focus on visualization
- Everyone to work simultaneously

================================================================================
13. ADVANCED PUDDING UTILITIES
================================================================================

The Pudding svelte-starter includes battle-tested utilities and custom Svelte
actions that solve common problems in data visualization projects.

CUSTOM SVELTE ACTIONS
---------------------

1. INVIEW.JS - Viewport Detection
---------------------------------
Detect when elements enter or exit the viewport.

Usage:
<script>
  import inView from '$actions/inView.js';

  function handleEnter(event) {
    console.log('Element entered viewport');
  }

  function handleExit(event) {
    console.log('Element exited viewport');
  }
</script>

<div
  use:inView={{ threshold: 0.5 }}
  on:enter={handleEnter}
  on:exit={handleExit}
>
  Content
</div>

Options:
- threshold: Percentage of element visible (0-1)
- root: Container element (null = viewport)
- rootMargin: Offset for trigger area

2. RESIZE.JS - Element Resize Detection
---------------------------------------
Detect when an element is resized.

<script>
  import resize from '$actions/resize.js';

  function handleResize(event) {
    console.log('New dimensions:', event.detail);
  }
</script>

<div use:resize on:resize={handleResize}>
  Resizable content
</div>

3. FOCUSTRAP.JS - Modal Focus Management
----------------------------------------
Trap keyboard focus within a modal or menu.

<script>
  import focusTrap from '$actions/focusTrap.js';
  let showModal = $state(false);
</script>

{#if showModal}
  <div class="modal" use:focusTrap>
    <button onclick={() => showModal = false}>Close</button>
    <input type="text" />
    <button>Submit</button>
  </div>
{/if}

4. CANTAB.JS - Disable Tab Navigation
-------------------------------------
Enable/disable tabbing on child elements.

<div use:canTab={{ enabled: false }}>
  <button>Can't tab here</button>
  <a href="/">Can't tab here either</a>
</div>

5. KEEPWITHINBOX.JS - Boundary Positioning
------------------------------------------
Offset elements to stay within parent boundaries.

<div class="container">
  <div use:keepWithinBox>
    Tooltip that stays within container
  </div>
</div>

6. CHECKOVERLAP.JS - Label Collision Detection
----------------------------------------------
Detect when labels overlap each other.

<script>
  import checkOverlap from '$actions/checkOverlap.js';

  function handleOverlap(event) {
    const overlapping = event.detail.overlapping;
    // Adjust label positions
  }
</script>

<g use:checkOverlap on:overlap={handleOverlap}>
  {#each labels as label}
    <text x={label.x} y={label.y}>{label.text}</text>
  {/each}
</g>

UTILITY FUNCTIONS
----------------

1. CHECKSCROLLDIR.JS - Scroll Direction
---------------------------------------
import { checkScrollDir } from '$utils/checkScrollDir.js';

let scrollDir = checkScrollDir();
// Returns: 'up', 'down', or null

$effect(() => {
  console.log('User scrolling:', scrollDir);
});

2. CSVDOWNLOAD.JS - Export Data
-------------------------------
import { csvDownload } from '$utils/csvDownload.js';

const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

csvDownload(data, 'export.csv');

3. GENERATEID.JS - Unique IDs
-----------------------------
import { generateId } from '$utils/generateId.js';

const uniqueId = generateId(); // Returns: "a1b2c3d4"

4. LOADCSV.JS - Load CSV Data
-----------------------------
import { loadCsv } from '$utils/loadCsv.js';

const data = await loadCsv('/data/file.csv');

Optional type conversion:
const data = await loadCsv('/data/file.csv', d => ({
  name: d.name,
  age: +d.age,  // Convert to number
  date: new Date(d.date)
}));

5. LOADIMAGE.JS - Load and Process Images
-----------------------------------------
import { loadImage } from '$utils/loadImage.js';

const imageData = await loadImage('/path/to/image.jpg');
// Returns: { width, height, data: Uint8ClampedArray }

Use case: Extract colors, create ASCII art, analyze image content

6. CLIPBOARD.JS - Copy to Clipboard
-----------------------------------
import { copyToClipboard } from '$utils/clipboard.js';

function handleCopy() {
  copyToClipboard('Text to copy');
}

HELPER COMPONENTS
----------------

1. BUTTONSET.SVELTE
------------------
Accessible button group for filtering/toggling.

<script>
  import ButtonSet from '$components/helpers/ButtonSet.svelte';

  let selected = $state('all');
  const options = [
    { value: 'all', label: 'All' },
    { value: 'a', label: 'Category A' },
    { value: 'b', label: 'Category B' }
  ];
</script>

<ButtonSet {options} bind:value={selected} />

2. RANGE.SVELTE
--------------
Customizable range slider.

<script>
  import Range from '$components/helpers/Range.svelte';
  let value = $state(50);
</script>

<Range
  bind:value
  min={0}
  max={100}
  step={1}
  label="Adjust value"
/>

3. SORTTABLE.SVELTE
------------------
Sortable semantic table with customizable props.

<script>
  import SortTable from '$components/helpers/SortTable.svelte';

  const data = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' }
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'city', label: 'City', sortable: false }
  ];
</script>

<SortTable {data} {columns} />

4. SHARELINK.SVELTE
------------------
Button to share link natively or copy to clipboard.

<script>
  import ShareLink from '$components/helpers/ShareLink.svelte';
</script>

<ShareLink
  url="https://yoursite.com/story"
  title="Check out this story"
/>

5. COUNTDOWN.SVELTE
------------------
Countdown timer text component.

<script>
  import Countdown from '$components/helpers/Countdown.svelte';
  const targetDate = new Date('2025-12-31');
</script>

<Countdown {targetDate} />

6. CHUNK.SVELTE
--------------
Split text into smaller DOM element chunks (useful for animations).

<script>
  import Chunk from '$components/helpers/Chunk.svelte';
</script>

<Chunk text="Animated text" splitBy="word" />
<Chunk text="Letter by letter" splitBy="char" />

7. MOTIONTOGGLE.SVELTE & DARKMODETOGGLE.SVELTE
---------------------------------------------
Toggle buttons for user preferences.

<script>
  import MotionToggle from '$components/helpers/MotionToggle.svelte';
  import DarkModeToggle from '$components/helpers/DarkModeToggle.svelte';
</script>

<MotionToggle />
<DarkModeToggle />

WINDOW DIMENSION TRACKING
-------------------------
Track window size reactively:

<script>
  import { windowWidth, windowHeight } from '$stores/dimensions.js';
</script>

<p>Window size: {$windowWidth} x {$windowHeight}</p>

{#if $windowWidth < 768}
  <MobileView />
{:else}
  <DesktopView />
{/if}

LOCALSTORAGE HELPERS
-------------------
<script>
  import { getLocalStorage, setLocalStorage } from '$utils/localStorage.js';

  let savedValue = getLocalStorage('myKey', 'defaultValue');

  function save() {
    setLocalStorage('myKey', 'newValue');
  }
</script>

================================================================================
14. RESPONSIVE SCROLLYTELLING BEST PRACTICES
================================================================================

Based on The Pudding's published process articles, here are battle-tested
approaches for making scrollytelling work across all devices.

MOBILE-FIRST PHILOSOPHY
-----------------------
"The main advantage of starting with mobile first is that it forces you to
pare down your experience to the nuts and bolts." - The Pudding

Start by designing for mobile:
1. Forces you to prioritize essential content
2. Easier to enhance for desktop than to strip down
3. Ensures core experience works everywhere
4. Identifies performance issues early

WHEN TO KEEP SCROLLYTELLING ON MOBILE
-------------------------------------
Maintain the scrollytelling experience when:
- Transitions are meaningful to the story
- Charts benefit from step-by-step revelation
- Performance is good on mobile devices
- The story is concise (avoid fatigue)

WHEN TO STACK CONTENT INSTEAD
-----------------------------
Consider stacking content vertically when:
- Animations might hurt performance
- Charts work better as standalone elements
- Development time is limited
- Story is very long

VIEWPORT HEIGHT HANDLING
------------------------
AVOID: CSS vh units for scrollytelling
REASON: Mobile browsers change vh when address bars appear/disappear

DO THIS:
<script>
  import { onMount } from 'svelte';

  let height = $state(0);

  onMount(() => {
    height = window.innerHeight;

    function handleResize() {
      height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<div class="step" style="height: {height}px">
  Step content
</div>

<style>
  /* Don't use this */
  .step {
    height: 100vh; /* ❌ Unreliable on mobile */
  }

  /* Use JavaScript-calculated height instead */
</style>

RESPONSIVE BREAKPOINT DETECTION
-------------------------------
Use matchMedia for reliable breakpoint detection:

<script>
  import { onMount } from 'svelte';

  let isDesktop = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia('(min-width: 800px)');

    function handleChange(e) {
      isDesktop = e.matches;
    }

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  });
</script>

{#if isDesktop}
  <ScrollytellingLayout />
{:else}
  <StackedLayout />
{/if}

RESPONSIVE CHART PATTERN
------------------------
Separate chart setup from drawing for easy resizing:

<script>
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  let width = $state(600);
  let height = $state(400);
  let svg;

  // Separate data processing
  function processData() {
    // Data transformations
  }

  // Separate scale creation
  const xScale = $derived(
    scaleLinear()
      .domain([0, 100])
      .range([0, width])
  );

  // Separate drawing function
  function draw() {
    // Clear and redraw
  }

  onMount(() => {
    function resize() {
      if (!svg) return;
      width = svg.clientWidth;
      height = width * 0.6;
      draw();
    }

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  });
</script>

<svg bind:this={svg} {width} {height}>
  <!-- Chart elements -->
</svg>

MOBILE INTERACTION CONSIDERATIONS
---------------------------------
1. Remove Hover Effects
<script>
  let isTouch = $state(false);

  onMount(() => {
    isTouch = 'ontouchstart' in window;
  });
</script>

{#if !isTouch}
  <!-- Hover interactions -->
{/if}

2. Make Touch Targets Large
<style>
  button {
    min-width: 44px;
    min-height: 44px;
    /* Apple's minimum touch target recommendation */
  }
</style>

3. Provide Clear Affordances
- Show scroll indicators
- Use visual cues for interactivity
- Don't rely on hover to reveal important information

PERFORMANCE ON MOBILE
---------------------
1. Limit Animation Complexity
- Reduce particle counts
- Simplify transitions
- Use CSS transforms (GPU-accelerated)

2. Debounce Scroll Events
<script>
  let scrollY = $state(0);
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollY = window.scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }
</script>

<svelte:window on:scroll={handleScroll} />

3. Lazy Load Images and Heavy Components
<script>
  import { inView } from '$actions/inView.js';
  let shouldLoad = $state(false);
</script>

<div use:inView on:enter={() => shouldLoad = true}>
  {#if shouldLoad}
    <HeavyComponent />
  {:else}
    <Placeholder />
  {/if}
</div>

RESPONSIVE GRID LAYOUT
----------------------
<style>
  .scrolly-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .sticky {
    position: sticky;
    top: 10vh;
    height: 80vh;
  }

  @media (max-width: 968px) {
    .scrolly-container {
      grid-template-columns: 1fr;
    }

    .sticky {
      position: relative;
      height: 60vh;
      top: 0;
    }

    .step {
      min-height: 60vh; /* Shorter on mobile */
    }
  }
</style>

TESTING CHECKLIST
----------------
□ Test on actual mobile devices (not just browser DevTools)
□ Test with slow 3G network throttling
□ Test with and without address bar visible
□ Test in portrait and landscape orientations
□ Test touch interactions
□ Test with reduced motion preferences
□ Check performance (aim for 60fps)
□ Verify scroll behavior is smooth
□ Ensure text is readable (min 16px)
□ Check that all content is accessible without scrolling horizontally

PROGRESSIVE ENHANCEMENT STRATEGY
--------------------------------
1. Build for mobile first (works everywhere)
2. Add desktop enhancements (larger viz, hover states)
3. Add advanced features for capable devices
4. Provide fallbacks for older browsers

Example:
<script>
  let canAnimate = $state(true);

  onMount(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    canAnimate = !prefersReducedMotion;
  });
</script>

{#if canAnimate}
  <AnimatedScrolly />
{:else}
  <StaticVersion />
{/if}

THE PUDDING'S GOLDEN RULE
-------------------------
"Keep scrollytelling concise, especially on mobile."

Users on mobile devices:
- Have smaller screens (less information density)
- May have slower connections
- Are often in distracting environments
- Have limited battery life

Therefore:
- Shorter stories work better
- Faster load times are critical
- Clear, focused narratives win
- Essential information only

================================================================================
ADDITIONAL RESOURCES
================================================================================

THE PUDDING
----------
- Main site: https://pudding.cool
- GitHub: https://github.com/the-pudding
- Svelte Starter: https://github.com/the-pudding/svelte-starter
- Process articles: https://pudding.cool/process/

SVELTE RESOURCES
---------------
- Official docs: https://svelte.dev
- Tutorial: https://learn.svelte.dev
- Examples: https://svelte.dev/examples
- Discord: https://svelte.dev/chat

D3.JS RESOURCES
--------------
- Official site: https://d3js.org
- Observable: https://observablehq.com/@d3
- D3 Graph Gallery: https://d3-graph-gallery.com

VISUALIZATION INSPIRATION
------------------------
- The Pudding: https://pudding.cool
- The Upshot (NYT): https://www.nytimes.com/section/upshot
- FlowingData: https://flowingdata.com
- Information is Beautiful: https://informationisbeautiful.net

ACCESSIBILITY TESTING
--------------------
- WAVE: https://wave.webaim.org
- axe DevTools: Browser extension
- Lighthouse: Built into Chrome DevTools
- NVDA/JAWS: Screen reader testing

================================================================================
QUICK START TEMPLATE
================================================================================

Here's a minimal starting point for a Pudding-style visualization:

<!-- App.svelte -->
<script>
  import Header from './components/Header.svelte';
  import Scrolly from './components/Scrolly.svelte';
  import Chart from './components/Chart.svelte';
  import Footer from './components/Footer.svelte';
  import { data } from './data/dataset.js';

  let currentStep = $state(0);

  const steps = [
    { text: "First insight...", highlight: null },
    { text: "Second insight...", highlight: 'groupA' },
    { text: "Third insight...", highlight: 'groupB' }
  ];

  const vizData = $derived(
    steps[currentStep]?.highlight
      ? data.filter(d => d.group === steps[currentStep].highlight)
      : data
  );
</script>

<Header />

<main>
  <section class="intro">
    <h1>Your Story Title</h1>
    <p>Introduction paragraph that hooks the reader...</p>
  </section>

  <section class="scrolly">
    <div class="sticky">
      <Chart data={vizData} />
    </div>

    <Scrolly bind:value={currentStep}>
      {#each steps as step, i}
        <div class="step" class:active={currentStep === i}>
          <div class="content">
            <p>{step.text}</p>
          </div>
        </div>
      {/each}
    </Scrolly>
  </section>

  <section class="conclusion">
    <h2>Takeaway</h2>
    <p>Summary and implications...</p>
  </section>
</main>

<Footer />

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f9f9f9;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .scrolly {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 4rem 0;
  }

  .sticky {
    position: sticky;
    top: 10vh;
    height: 80vh;
  }

  .step {
    min-height: 80vh;
    display: flex;
    align-items: center;
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  .step.active {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .scrolly {
      grid-template-columns: 1fr;
    }
  }
</style>

================================================================================
END OF GUIDE
================================================================================

For questions, issues, or contributions, visit:
https://github.com/the-pudding/svelte-starter

Happy visualizing!




CREATE A BEAUTIFUL PAGE BASED ON Football Transfer Market Dataset from 2016 Winter td - Only Top 5 Leagues
Overview
Comprehensive football transfer market dataset containing 19,454 player transfers from major European leagues and worldwide, covering 2016-2025 transfer windows. The dataset includes detailed transfer information with standardized player nationalities, positions, clubs, leagues, and transfer fees. This is only for the Top 5 lagues (incoming and outgoing)

File
File	Records	Years	Description
all_transfers_master_final.csv	19,454	2016-2025	Complete cleaned transfer dataset with standardized data
Quick Start
Load Data Directly from GitHub
import pandas as pd

# Load the transfer dataset directly from GitHub
transfers = pd.read_csv('https://raw.githubusercontent.com/vibedatascience/guardiancouk_football_transfers_data/refs/heads/main/guardian_football_transfers.csv')
Data Source
Data sourced from Guardian.co.uk transfer windows coverage:

Coverage Details
Leagues
Premier League - English top division
La Liga - Spanish top division
Bundesliga - German top division
Serie A - Italian top division
Ligue 1 - French top division
Other - All other leagues worldwide (58% of transfers)
Time Period
Years: 2016-2025 (9 years of data)
Transfer Windows: Summer and Winter windows included
Records: 19,454 unique transfer records
Data Dictionary
Player Information
Column	Type	Description	Null %	Top 6 Values
Player_name	str	Full name of the player	0.0%	João Pedro (11), Matheus Cunha (10), Jota (9), Danilo (9), Sandro (9), Paulinho (8)
Nationality	str	ISO 3-letter country code	22.4%	ENG (1,566), FRA (1,265), ESP (1,017), BRA (975), ITA (862), POR (745)
Player_position	str	Standardized position	11.8%	Midfielder (5,851), Defender (5,507), Forward (4,251), Goalkeeper (1,329), Winger (219)
Transfer Details
Column	Type	Description	Null %	Top 6 Values
Transfer_type	str	Type of transfer	0.0%	fee (8,455), Free (6,016), Loan (3,982), undisclosed fee (1,000)
Price_numeric	float	Transfer fee in currency units	74.3%	To find paid transfers, filter for Transfer_type == 'fee' and Price_numeric.notna()
Transfer_date	str	Date of transfer	4.6%	Various dates in DD-MM-YYYY format
Year	int	Year of transfer	4.6%	2019 (3,677), 2023 (2,871), 2022 (2,869), 2024 (2,863), 2018 (2,090), 2020 (1,557)
Transfer_Window	str	Transfer window	8.0%	Summer 2019 (3,677), Summer 2023 (2,871), Summer 2022 (2,869), Summer 2024 (2,863), Summer 2018 (2,090)
Club Information
Column	Type	Description	Null %	Top 6 Values
Prev_club	str	Previous/selling club	0.0%	Free agent (1,557), Chelsea (193), Barcelona (169), Juventus (161), Real Madrid (152), Manchester City (143)
New_club	str	New/buying club	0.0%	Unattached (1,557), Juventus (176), Chelsea (172), Barcelona (163), Wolves (152), Fulham (149)
Previous_club_league	str	League of previous club	0.0%	Other (6,179), Premier League (4,159), Serie A (3,162), Bundesliga (1,996), Ligue 1 (1,975), La Liga (1,954)
New_club_league	str	League of new club	0.0%	Other (11,278), Serie A (2,172), Premier League (1,745), La Liga (1,524), Ligue 1 (1,378), Bundesliga (1,357)
Metadata
Column	Type	Description	Null %
Timestamp	str	Record timestamp	0.0%
Transfer_date_parsed	datetime	Parsed transfer date	4.6%
Data Quality Notes
Price Data: 74.3% of transfers have no price (free transfers, loans, or undisclosed fees)
Nationality: 22.4% missing nationality data - primarily from 2016, 2017 and 2018 where nationality wasn't recorded - so be careful when looking at nationality trends here
Position: 11.8% missing position data
Special Cases:
"Free agent" appears as a club for unattached players (1,557 records)
"Unattached" appears as destination for released players (1,557 records)
"Retired" appears for players ending careers (34 retirements recorded)
Some clubs appear in "Other" category if outside top 5 leagues
Key Statistics
League Distribution
Previous Club League (Where players came from):

Other: 31.8%
Premier League: 21.4%
Serie A: 16.3%
Bundesliga: 10.3%
Ligue 1: 10.2%
La Liga: 10.1%
New Club League (Where players went to):

Other: 58.0%
Serie A: 11.2%
Premier League: 9.0%
La Liga: 7.8%
Ligue 1: 7.1%
Bundesliga: 7.0%
Transfer Types
Free transfers and loans included
74.3% of transfers have no recorded fee (free, loan, or undisclosed)
Fee-based transfers include numeric values where available
Usage Examples
Filter for Paid Transfers
# Get only transfers with disclosed fees
paid_transfers = transfers[(transfers['Transfer_type'] == 'fee') & (transfers['Price_numeric'].notna())]
Filter by League
# Get all Premier League arrivals
pl_transfers = transfers[transfers['New_club_league'] == 'Premier League']

# Get transfers between top 5 leagues
top5 = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1']
top5_transfers = transfers[
    (transfers['Previous_club_league'].isin(top5)) & 
    (transfers['New_club_league'].isin(top5))
]
Analyze Transfer Fees
# Get paid transfers only
paid_transfers = transfers[transfers['Price_numeric'].notna()]

# Average transfer fee by destination league
avg_fees = paid_transfers.groupby('New_club_league')['Price_numeric'].mean()
Track Player Movements
# Get all transfers for a specific player
player_history = transfers[transfers['Player_name'] == 'Cristiano Ronaldo']

# Find most active clubs
most_buying = transfers['New_club'].value_counts().head(10)
most_selling = transfers['Prev_club'].value_counts().head(10)
File Format
Format: CSV (Comma-Separated Values)
Encoding: UTF-8
Size: ~19,454 records × 14 columns
No index column: Data saved without pandas index