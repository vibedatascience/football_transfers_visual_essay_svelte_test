# Technical Architecture Guide

## How The Entire Application Works

This document explains the complete data flow and architecture of the football transfer visualization.

---

## 🗂️ Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. USER OPENS BROWSER
   └─> Vite Dev Server serves index.html
       └─> Loads main.js
           └─> Initializes App.svelte


2. APP.SVELTE LOADS
   └─> onMount() lifecycle hook fires
       └─> Calls loadTransferData()
           └─> Fetches /src/data/transfers.csv
               └─> Parses CSV into JavaScript objects
                   └─> Returns array of 19,454 transfer records


3. DATA PROCESSING
   └─> Raw data passed through processing functions:
       ├─> getTransfersByYear() → Line chart data
       ├─> getNationalityStats() → Bar chart data
       ├─> getTransferFlows() → Flow chart data
       └─> getPositionBreakdown() → Bar chart data


4. RENDERING
   └─> Data bound to Svelte components via props
       └─> Components use D3.js to create visualizations
           └─> SVG elements rendered in the browser


5. USER INTERACTION
   └─> User scrolls → Scrolly component detects position
   └─> User searches club → ClubSearch filters clubs
   └─> User selects club → ClubExplorer recalculates data
```

---

## 📊 Data Source & Loading

### Where Does the Data Come From?

**Location:** `/src/data/transfers.csv`

**Source:** Guardian.co.uk transfer windows coverage (2016-2025)

**Downloaded from:**
```
https://raw.githubusercontent.com/vibedatascience/guardiancouk_football_transfers_data/refs/heads/main/guardian_football_transfers.csv
```

**Size:** 2.5 MB (19,454 records)

### How is Data Loaded?

**File:** `src/data/processData.js`

```javascript
export async function loadTransferData() {
  // 1. Fetch the CSV file from the public directory
  const response = await fetch('/src/data/transfers.csv');

  // 2. Convert response to text
  const text = await response.text();

  // 3. Parse CSV into JavaScript objects
  return parseCSV(text);
}
```

### CSV Parsing Process

```javascript
function parseCSV(text) {
  // 1. Split text into lines
  const lines = text.split('\n');

  // 2. First line contains headers
  const headers = lines[0].split(',');
  // ['Player_name', 'Nationality', 'Transfer_type', ...]

  // 3. Loop through remaining lines
  for (let i = 1; i < lines.length; i++) {
    // 4. Handle quoted fields (commas inside quotes)
    const values = parseCSVLine(lines[i]);

    // 5. Create object mapping headers to values
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    data.push(row);
  }

  return data;
}
```

**Result:** Array of objects like:
```javascript
[
  {
    Player_name: "Cristiano Ronaldo",
    Nationality: "POR",
    Player_position: "Forward",
    Prev_club: "Real Madrid",
    New_club: "Juventus",
    Transfer_type: "fee",
    Price_numeric: "100",
    Year: "2018",
    // ... more fields
  },
  // ... 19,453 more records
]
```

---

## 🎨 Visualization Creation

### How Are Graphs Created?

Graphs are created using **Svelte components** + **D3.js** + **SVG**

### Example: Line Chart (Transfer Activity by Year)

**Step 1: Data Processing**
```javascript
// src/data/processData.js
export function getTransfersByYear(data) {
  const yearCounts = {};

  // Count transfers per year
  data.forEach(d => {
    const year = d.Year;
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  // Convert to array and sort
  return Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
}

// Result:
// [
//   { year: 2016, count: 1205 },
//   { year: 2017, count: 1389 },
//   { year: 2018, count: 2090 },
//   ...
// ]
```

**Step 2: Create D3 Scales**
```javascript
// src/components/charts/LineChart.svelte
import { scaleLinear } from 'd3-scale';

// Map year values (2016-2025) to X pixel positions (0-600)
const xScale = scaleLinear()
  .domain([2016, 2025])        // Input range
  .range([60, 540]);           // Output range (pixels)

// Map count values (0-3677) to Y pixel positions (400-20)
const yScale = scaleLinear()
  .domain([0, 3677])           // Input range
  .range([360, 20]);           // Output range (inverted for SVG)
```

**Step 3: Generate SVG Path**
```javascript
import { line } from 'd3-shape';

// Create path generator function
const linePath = line()
  .x(d => xScale(d.year))      // X coordinate for each point
  .y(d => yScale(d.count))     // Y coordinate for each point
  (data);                       // Apply to data

// Result: "M60,280 L120,250 L180,200 ..." (SVG path string)
```

**Step 4: Render SVG**
```svelte
<svg width={600} height={400}>
  <!-- Draw the line -->
  <path
    d={linePath}
    stroke="#4A90E2"
    stroke-width="3"
    fill="none"
  />

  <!-- Draw dots at each data point -->
  {#each data as d}
    <circle
      cx={xScale(d.year)}
      cy={yScale(d.count)}
      r="5"
      fill="#4A90E2"
    />
  {/each}
</svg>
```

---

## 🔄 Reactive Updates (Svelte 5 Runes)

### How Does Data Update Automatically?

Svelte 5 uses **runes** for reactivity:

```javascript
// Define reactive state
let selectedClub = $state(null);

// Define derived (computed) values
const clubStats = $derived(
  selectedClub ? getClubTransferStats(data, selectedClub) : null
);

// When selectedClub changes:
// 1. Svelte detects the change
// 2. Automatically recalculates clubStats
// 3. Updates the DOM
```

**Example Flow:**
```
User types "Barcelona" → selectedClub = "Barcelona"
                       ↓
          $derived triggers recalculation
                       ↓
          clubStats = getClubTransferStats(data, "Barcelona")
                       ↓
          Returns: { totalTransfers: 163, incoming: 82, ... }
                       ↓
          DOM updates with new stats
```

---

## 📜 Scrollytelling Mechanism

### How Does Scroll-Triggered Content Work?

**Component:** `src/components/helpers/Scrolly.svelte`

**Technology:** Intersection Observer API

```javascript
// 1. Find all step elements
const steps = container.querySelectorAll('.step');

// 2. Create observer for each step
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Step is visible!
      value = stepIndex;  // Update current step
    }
  });
}, {
  threshold: [0, 0.25, 0.5, 0.75, 1]  // Trigger at multiple points
});

// 3. Observe each step
steps.forEach(step => observer.observe(step));
```

**What Happens:**
```
User scrolls down
       ↓
Step 2 enters viewport
       ↓
Intersection Observer fires
       ↓
currentStep = 2
       ↓
Svelte reactivity updates visualizations
       ↓
Chart transitions to show data for step 2
```

---

## 🔍 Club Explorer Interactive Flow

### Complete User Journey

```
1. USER TYPES IN SEARCH BOX
   └─> ClubSearch.svelte
       └─> oninput event fires
           └─> searchTerm = "Man"


2. AUTOCOMPLETE FILTERS CLUBS
   └─> const filteredClubs = $derived(
         clubs.filter(club =>
           club.toLowerCase().includes("man".toLowerCase())
         )
       );

   └─> Result: ["Manchester City", "Manchester United", ...]


3. USER SELECTS "MANCHESTER CITY"
   └─> selectedClub = "Manchester City"

   └─> Triggers multiple $derived calculations:

       ├─> clubStats = getClubTransferStats(data, "Manchester City")
       │   └─> Filters all transfers involving Man City
       │   └─> Calculates totals, averages, net spend
       │   └─> Result: { totalTransfers: 143, incoming: 72, ... }

       ├─> yearlyTransfers = getClubTransfersByYear(data, "Manchester City")
       │   └─> Groups transfers by year
       │   └─> Counts incoming vs outgoing
       │   └─> Result: [{ year: 2016, incoming: 8, outgoing: 6 }, ...]

       ├─> incomingTransfers = getClubIncomingTransfers(data, "Manchester City")
       │   └─> Filters: d.New_club === "Manchester City"
       │   └─> Result: [{ Player_name: "Erling Haaland", ... }, ...]

       └─> outgoingTransfers = getClubOutgoingTransfers(data, "Manchester City")
           └─> Filters: d.Prev_club === "Manchester City"
           └─> Result: [{ Player_name: "Ferran Torres", ... }, ...]


4. RENDER UPDATES
   └─> Stats Grid displays calculated numbers
   └─> GroupedBarChart receives yearlyTransfers data
   └─> TransferCard components render for each transfer
```

---

## 🎯 Component Hierarchy

```
App.svelte (Root Component)
│
├─> Header
│   └─> Title, subtitle, byline
│
├─> Introduction
│   └─> Lead paragraph
│
├─> Scrollytelling Section 1
│   ├─> Sticky Container
│   │   └─> LineChart (yearly transfers)
│   └─> Scrolly
│       ├─> Step 1 (text)
│       └─> Step 2 (text)
│
├─> Scrollytelling Section 2
│   ├─> Sticky Container
│   │   └─> BarChart (nationalities)
│   └─> Scrolly
│       └─> Step 3 (text)
│
├─> Scrollytelling Section 3
│   ├─> Sticky Container
│   │   └─> FlowChart (league flows)
│   └─> Scrolly
│       └─> Step 4 (text)
│
├─> Scrollytelling Section 4
│   ├─> Sticky Container
│   │   └─> BarChart (positions)
│   └─> Scrolly
│       └─> Step 5 (text)
│
├─> Club Explorer Section ⭐ INTERACTIVE
│   └─> ClubExplorer.svelte
│       ├─> ClubSearch.svelte
│       │   └─> Input with autocomplete dropdown
│       ├─> Stats Grid
│       │   └─> 6 stat cards with calculated values
│       ├─> GroupedBarChart
│       │   └─> Incoming vs Outgoing by year
│       ├─> View Mode Buttons
│       │   └─> Filter transfers by category
│       └─> Transfers List
│           └─> TransferCard.svelte (for each transfer)
│               ├─> Player info
│               ├─> Direction badge
│               ├─> Club flow
│               └─> Transfer details
│
├─> Conclusion
│   └─> Closing text + data note
│
└─> Footer
    └─> Credits
```

---

## 🖥️ Rendering Process (What Happens in the Browser)

### Initial Load

```
1. Browser requests http://localhost:5174/
   ↓
2. Vite dev server responds with index.html
   ↓
3. HTML loads /src/main.js
   ↓
4. main.js imports and mounts App.svelte
   ↓
5. App.svelte runs onMount() → loads CSV data
   ↓
6. Data processing functions transform raw data
   ↓
7. Svelte compiles components to JavaScript
   ↓
8. D3.js calculates scales and paths
   ↓
9. Browser renders SVG elements
   ↓
10. Event listeners attached for interactions
```

### User Interaction

```
USER SCROLLS
   ↓
Intersection Observer detects scroll position
   ↓
Updates currentStep state
   ↓
Svelte's reactivity system notices change
   ↓
Runs all $derived calculations dependent on currentStep
   ↓
Virtual DOM diff calculated
   ↓
Browser DOM updated (only changed elements)
   ↓
CSS transitions animate the changes
```

```
USER SEARCHES CLUB
   ↓
Input event fires
   ↓
searchTerm state updated
   ↓
$derived(filteredClubs) recalculates
   ↓
Dropdown list re-renders with filtered results
   ↓
User clicks club → selectedClub updated
   ↓
Multiple $derived values recalculate:
  - clubStats
  - yearlyTransfers
  - incomingTransfers
  - outgoingTransfers
   ↓
All dependent components re-render
   ↓
Charts redraw with new data
   ↓
Transfer cards populate with filtered transfers
```

---

## 📦 Key Technologies & Their Roles

### Svelte 5
- **Role:** UI framework and reactivity system
- **What it does:**
  - Compiles components to efficient JavaScript
  - Manages state with $state, $derived, $effect
  - Updates DOM automatically when data changes
  - Handles component lifecycle (onMount, etc.)

### D3.js
- **Role:** Data transformation and scale generation
- **What it does:**
  - `d3-scale`: Maps data values to pixel positions
  - `d3-array`: Data manipulation (max, extent, etc.)
  - `d3-shape`: Generates SVG paths (line, area, etc.)
  - `d3-format`: Formats numbers for display

### Vite
- **Role:** Development server and build tool
- **What it does:**
  - Serves files during development
  - Hot Module Replacement (HMR) - instant updates
  - Bundles files for production
  - Optimizes assets

### SVG (Scalable Vector Graphics)
- **Role:** Graphics rendering
- **What it does:**
  - Draws charts, lines, circles, paths
  - Scales without losing quality
  - Can be styled with CSS
  - Responds to mouse/touch events

### Intersection Observer API
- **Role:** Scroll position detection
- **What it does:**
  - Monitors when elements enter/exit viewport
  - More efficient than scroll event listeners
  - Triggers state changes for scrollytelling

---

## 🔄 Data Processing Pipeline

### Example: Club Statistics Calculation

```javascript
// INPUT: Raw transfer data (19,454 records)
const allData = [
  { Player_name: "Kevin De Bruyne", New_club: "Manchester City", ... },
  { Player_name: "Ferran Torres", Prev_club: "Manchester City", ... },
  // ... thousands more
]

// STEP 1: Filter for specific club
function getClubIncomingTransfers(data, clubName) {
  return data.filter(d => d.New_club === clubName);
}

// STEP 2: Calculate statistics
function getClubTransferStats(data, clubName) {
  const incoming = getClubIncomingTransfers(data, clubName);
  const outgoing = getClubOutgoingTransfers(data, clubName);

  // Filter paid transfers
  const incomingPaid = incoming.filter(d =>
    d.Transfer_type === 'fee' && d.Price_numeric
  );

  // Sum up fees
  const totalSpent = incomingPaid.reduce((sum, d) =>
    sum + parseFloat(d.Price_numeric), 0
  );

  return {
    totalTransfers: incoming.length + outgoing.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
    totalSpent,
    totalReceived,
    netSpend: totalSpent - totalReceived
  };
}

// OUTPUT: Aggregated statistics
{
  totalTransfers: 143,
  incoming: 72,
  outgoing: 71,
  totalSpent: 856.5,
  totalReceived: 623.2,
  netSpend: 233.3
}
```

---

## 🎨 CSS & Styling

### How Styling Works

1. **Global Styles** - Applied in App.svelte with `:global()`
   ```css
   :global(body) {
     font-family: -apple-system, BlinkMacSystemFont, sans-serif;
     background: #fafafa;
   }
   ```

2. **Component Styles** - Scoped to each component
   ```svelte
   <style>
     .transfer-card {
       background: white;
       border-radius: 8px;
       /* Only applies to this component */
     }
   </style>
   ```

3. **Responsive Design** - Media queries
   ```css
   @media (max-width: 768px) {
     .stats-grid {
       grid-template-columns: repeat(2, 1fr);
     }
   }
   ```

4. **CSS Transitions** - Smooth animations
   ```css
   .step {
     opacity: 0.3;
     transition: opacity 0.4s ease;
   }
   .step.active {
     opacity: 1;
   }
   ```

---

## 🚀 Performance Optimizations

### 1. Efficient Data Loading
- CSV loaded once on mount
- Stored in memory for instant access
- No repeated network requests

### 2. Reactive Computations
- Only recalculate when dependencies change
- `$derived` caches results until inputs change
- Prevents unnecessary re-renders

### 3. Virtual DOM Diffing
- Svelte compares previous and new state
- Only updates changed DOM elements
- Minimal browser repaints

### 4. Lazy Rendering
- Charts only render when visible
- Transfer cards only created for current view
- Images/assets loaded on demand

### 5. ResizeObserver
- Charts resize efficiently
- No constant polling for size changes
- Debounced to prevent excessive redraws

---

## 🐛 Error Handling

### Data Validation
```javascript
// Check for missing values
if (!d.Year || d.Year === '') return;

// Convert and validate numbers
const price = parseFloat(d.Price_numeric);
if (isNaN(price)) return;

// Handle null/undefined
const club = d.New_club || 'Unknown';
```

### CSV Parsing
```javascript
// Handle quoted fields with commas
if (char === '"') {
  inQuotes = !inQuotes;
}

// Skip empty lines
if (!lines[i].trim()) continue;
```

---

## 📱 Responsive Behavior

### Desktop (>968px)
- Side-by-side scrollytelling layout
- Full-width charts
- Hover effects enabled

### Tablet (768px - 968px)
- Stacked scrollytelling
- Slightly smaller charts
- Touch-friendly targets

### Mobile (<768px)
- Fully stacked layout
- Reduced font sizes
- Larger tap targets (44px minimum)
- Simplified charts

---

## 🎯 Key Takeaways

1. **Data lives in CSV**, loaded once at startup
2. **D3.js transforms data** into chart coordinates
3. **Svelte renders components** as interactive SVG
4. **Reactivity automatically updates** everything when state changes
5. **Intersection Observer handles** scroll-triggered animations
6. **Component composition** keeps code organized and reusable

The entire app is a pipeline: **CSV → Parse → Process → Scale → Render → Interact**

Each technology has a specific role, working together to create a smooth, interactive data visualization experience!