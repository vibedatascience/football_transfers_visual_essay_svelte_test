# Quick Reference Guide

## 🚀 Common Commands

```bash
# Start development server
npm run dev
# → Opens at http://localhost:5174/

# Build for production
npm run build
# → Output in /dist folder

# Preview production build
npm run preview

# Install dependencies (if needed)
npm install
```

---

## 📁 Where to Find Things

### Data
- **CSV File:** `src/data/transfers.csv` (2.5 MB, 19,454 records)
- **Processing Functions:** `src/data/processData.js`

### Components
- **Main App:** `src/App.svelte`
- **Club Explorer:** `src/components/ClubExplorer.svelte`
- **Search Box:** `src/components/helpers/ClubSearch.svelte`
- **Charts:** `src/components/charts/`

### Documentation
- **User Guide:** `README.md`
- **Technical Details:** `TECHNICAL_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`
- **This File:** `QUICK_REFERENCE.md`

---

## 🔧 How to Modify

### Change a Chart Color
**File:** `src/App.svelte` or specific chart component

```svelte
<LineChart
  data={yearlyTransfers}
  color="#4A90E2"  ← Change this!
/>
```

**Common colors:**
- Blue: `#4A90E2`
- Red: `#FF6B6B`
- Purple: `#9B59B6`
- Green: `#2ecc71`

### Add a New Scrollytelling Step
**File:** `src/App.svelte`

```javascript
// 1. Add to steps array (around line 44)
const steps = [
  // ... existing steps
  {
    text: "Your new insight here..."
  }
];

// 2. Add corresponding HTML (around line 170)
<div class="step" class:active={currentStep === 5}>
  <div class="step-content">
    <p>{steps[5].text}</p>
  </div>
</div>
```

### Change Typography
**File:** `src/App.svelte` (in `<style>` section)

```css
:global(body) {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  /* Change to: 'Georgia', serif or any other font */
}

h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  /* Adjust min, preferred, max sizes */
}
```

### Add New Data Processing Function
**File:** `src/data/processData.js`

```javascript
export function getYourNewMetric(data) {
  // Process data
  const result = data.filter(/* your logic */);

  // Return processed data
  return result;
}
```

Then use in App.svelte:
```javascript
import { getYourNewMetric } from './data/processData.js';

const myMetric = $derived(getYourNewMetric(allData));
```

---

## 🎨 Design Tokens

### Colors
```css
/* Primary */
--color-primary: #4A90E2;        /* Blue */
--color-accent: #FF6B6B;         /* Red/Coral */
--color-purple: #9B59B6;         /* Purple */

/* Grays */
--gray-50: #f9f9f9;
--gray-100: #f5f5f5;
--gray-300: #d4d4d4;
--gray-600: #666;
--gray-900: #1a1a1a;

/* Backgrounds */
--bg-main: #fafafa;
--bg-white: white;
--bg-card: white;
```

### Spacing
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.15);
```

---

## 📊 Available Data Functions

### General Statistics
```javascript
// Get all clubs
getAllClubs(data)
// → ["Barcelona", "Real Madrid", ...]

// Get transfers by year
getTransfersByYear(data)
// → [{ year: 2016, count: 1205 }, ...]

// Get top nationalities
getNationalityStats(data)
// → [{ nationality: "ENG", count: 1566 }, ...]

// Get position breakdown
getPositionBreakdown(data)
// → [{ position: "Midfielder", count: 5851 }, ...]

// Get league flows
getTransferFlows(data)
// → [{ source: "La Liga", target: "Premier League", count: 45 }, ...]
```

### Club-Specific
```javascript
// Get all transfers for a club
getClubTransfers(data, "Barcelona")
// → [{ Player_name: "Messi", ... }, ...]

// Get incoming transfers only
getClubIncomingTransfers(data, "Barcelona")
// → [{ Player_name: "Lewandowski", New_club: "Barcelona", ... }, ...]

// Get outgoing transfers only
getClubOutgoingTransfers(data, "Barcelona")
// → [{ Player_name: "Messi", Prev_club: "Barcelona", ... }, ...]

// Get comprehensive stats
getClubTransferStats(data, "Barcelona")
// → {
//   totalTransfers: 163,
//   incoming: 82,
//   outgoing: 81,
//   totalSpent: 856.5,
//   totalReceived: 623.2,
//   netSpend: 233.3
// }

// Get yearly breakdown
getClubTransfersByYear(data, "Barcelona")
// → [{ year: 2016, incoming: 9, outgoing: 8 }, ...]

// Get top transfers by fee
getClubTopTransfers(data, "Barcelona", 10)
// → [{ Player_name: "Coutinho", price: 120, direction: "in" }, ...]
```

---

## 🐛 Common Issues & Solutions

### Issue: Charts not showing
**Solution:** Check console for errors. Data might not be loaded yet.
```javascript
// Add loading check
{#if data.length > 0}
  <Chart data={processedData} />
{:else}
  <p>Loading...</p>
{/if}
```

### Issue: CSV parsing error
**Solution:** Check for malformed CSV rows
```javascript
// Add validation in parseCSV
if (values.length !== headers.length) {
  console.warn('Skipping malformed row:', line);
  continue;
}
```

### Issue: Club search not working
**Solution:** Check that clubs are loaded
```javascript
console.log('Available clubs:', allClubs.length);
// Should be ~1000+
```

### Issue: Scroll tracking not updating
**Solution:** Check that `.step` class is on elements
```html
<!-- Must have .step class -->
<div class="step">Content</div>
```

### Issue: Styles not applying
**Solution:** Check CSS specificity or use :global()
```svelte
<style>
  /* Component-scoped */
  .my-class { }

  /* Global */
  :global(.my-class) { }
</style>
```

---

## 🎯 Performance Tips

### Optimize Large Lists
```javascript
// Instead of rendering all 19,454 items:
{#each allData as item}
  <TransferCard {item} />
{/each}

// Render only visible/paginated items:
{#each displayedTransfers.slice(0, 50) as item}
  <TransferCard {item} />
{/each}
```

### Debounce Expensive Operations
```javascript
let searchTerm = $state('');
let debouncedSearch = $state('');
let timeoutId;

$effect(() => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    debouncedSearch = searchTerm;
  }, 300);
});
```

### Use $derived for Computed Values
```javascript
// ❌ Don't recalculate on every render
{data.filter(d => d.Year === '2018').length}

// ✅ Do use $derived
const count2018 = $derived(
  data.filter(d => d.Year === '2018').length
);
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Styles for phones */
}

/* Tablet */
@media (max-width: 968px) {
  /* Styles for tablets */
}

/* Desktop */
@media (min-width: 969px) {
  /* Styles for desktop */
}
```

**Used in:** `src/App.svelte` (around line 420)

---

## 🔍 Debugging Tips

### Check Data Loading
```javascript
onMount(async () => {
  console.log('Loading data...');
  allData = await loadTransferData();
  console.log('Loaded records:', allData.length);
  console.log('Sample record:', allData[0]);
});
```

### Inspect Derived Values
```javascript
const clubStats = $derived(
  selectedClub ? getClubTransferStats(data, selectedClub) : null
);

$effect(() => {
  console.log('Club stats updated:', clubStats);
});
```

### Monitor Scroll Position
```javascript
let currentStep = $state(0);

$effect(() => {
  console.log('Current step:', currentStep);
});
```

### Check D3 Scales
```javascript
console.log('X scale domain:', xScale.domain());
console.log('X scale range:', xScale.range());
console.log('Sample input → output:', xScale(2020));
```

---

## 🚀 Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Check all images/assets load correctly
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Check console for errors
- [ ] Test with slow 3G network throttling
- [ ] Validate accessibility (keyboard navigation)
- [ ] Check performance (Lighthouse score)
- [ ] Update meta tags in `index.html`

---

## 📞 Getting Help

### Documentation
1. **README.md** - Feature overview and getting started
2. **TECHNICAL_GUIDE.md** - How everything works in detail
3. **ARCHITECTURE.md** - Visual diagrams and data flow
4. **This file** - Quick reference

### External Resources
- [Svelte Documentation](https://svelte.dev/docs)
- [D3.js Documentation](https://d3js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [The Pudding](https://pudding.cool) - Design inspiration

### Common Search Terms
- "svelte 5 runes" - Reactivity system
- "d3 scale" - Data scaling
- "intersection observer" - Scroll detection
- "svelte props" - Component properties
- "css grid layout" - Responsive layouts

---

## 💡 Quick Examples

### Add a New Chart Type
```svelte
<!-- Create: src/components/charts/PieChart.svelte -->
<script>
  let { data = [], colors = [] } = $props();
  // Chart logic here
</script>

<svg>
  <!-- SVG elements -->
</svg>

<!-- Use in App.svelte -->
<PieChart data={myData} colors={['#4A90E2', '#FF6B6B']} />
```

### Filter Data by League
```javascript
const premierLeagueTransfers = $derived(
  allData.filter(d => d.New_club_league === 'Premier League')
);
```

### Create a Custom Stat
```javascript
const averageAge = $derived(
  allData.filter(d => d.Age)
    .reduce((sum, d) => sum + parseInt(d.Age), 0) /
  allData.filter(d => d.Age).length
);
```

---

**Need more help?** Check the other documentation files for detailed explanations!