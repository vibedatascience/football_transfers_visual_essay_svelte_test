<script>
  import { onMount } from 'svelte';
  import Scrolly from './components/helpers/Scrolly.svelte';
  import BarChart from './components/charts/BarChart.svelte';
  import LineChart from './components/charts/LineChart.svelte';
  import FlowChart from './components/charts/FlowChart.svelte';
  import ClubExplorer from './components/ClubExplorer.svelte';
  import {
    loadTransferData,
    getTransfersByYear,
    getNationalityStats,
    getTopLeagues,
    getTransferFlows,
    getPositionBreakdown,
    getYearlySpending,
    filterPaidTransfers
  } from './data/processData.js';

  let allData = $state([]);
  let loading = $state(true);
  let currentStep = $state(0);

  // Processed data
  let yearlyTransfers = $state([]);
  let nationalityData = $state([]);
  let leagueFlows = $state([]);
  let positionData = $state([]);
  let yearlySpending = $state([]);
  let topLeagues = $state([]);

  onMount(async () => {
    allData = await loadTransferData();

    yearlyTransfers = getTransfersByYear(allData);
    nationalityData = getNationalityStats(allData);
    topLeagues = getTopLeagues();
    leagueFlows = getTransferFlows(allData);
    positionData = getPositionBreakdown(allData);
    yearlySpending = getYearlySpending(allData);

    loading = false;
  });

  // Step configurations for scrollytelling
  const steps = [
    {
      text: "Between 2016 and 2025, Europe's top 5 football leagues witnessed over 19,000 player transfers, reshaping the landscape of modern football.",
    },
    {
      text: "Transfer activity has varied significantly by year, with notable spikes in summer windows as clubs invest heavily in new talent.",
    },
    {
      text: "English players lead the transfer market, followed by French and Spanish players, reflecting the depth of their domestic talent pools.",
    },
    {
      text: "The flow of players between Europe's elite leagues reveals fascinating patterns—with the Premier League often being the final destination.",
    },
    {
      text: "Midfielders dominate the transfer market, making up nearly a third of all moves as clubs seek to control the center of the pitch.",
    }
  ];

  const highlightedNationality = $derived(
    currentStep === 2 ? nationalityData.slice(0, 10) : nationalityData.slice(0, 10)
  );

  const highlightedPositions = $derived(
    currentStep === 4 ? positionData.slice(0, 5) : positionData.slice(0, 5)
  );
</script>

<main>
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading transfer data...</p>
    </div>
  {:else}
    <!-- Header -->
    <header>
      <h1>The Beautiful Game's Global Shuffle</h1>
      <p class="subtitle">A decade of football transfers across Europe's elite leagues</p>
      <div class="byline">
        <span>19,454 transfers • 2016-2025 • Top 5 Leagues</span>
      </div>
    </header>

    <!-- Introduction -->
    <section class="intro">
      <p class="lead">
        Every transfer window, football clubs across Europe engage in a high-stakes game of chess,
        moving players between leagues and reshaping team dynamics. This is the story of that movement—told through data.
      </p>
    </section>

    <!-- Scrollytelling Section 1: Yearly Trends -->
    <section class="scrolly-section">
      <div class="sticky">
        <div class="viz-container">
          <h3>Transfer Activity by Year</h3>
          <LineChart
            data={yearlyTransfers.map(d => ({ x: d.year, y: d.count }))}
            xKey="x"
            yKey="y"
            color="#4A90E2"
            showDots={true}
            showArea={true}
          />
        </div>
      </div>

      <Scrolly bind:value={currentStep}>
        <div class="step" class:active={currentStep === 0}>
          <div class="step-content">
            <p>{steps[0].text}</p>
          </div>
        </div>
        <div class="step" class:active={currentStep === 1}>
          <div class="step-content">
            <p>{steps[1].text}</p>
          </div>
        </div>
      </Scrolly>
    </section>

    <!-- Scrollytelling Section 2: Nationalities -->
    <section class="scrolly-section">
      <div class="sticky">
        <div class="viz-container">
          <h3>Most Transferred Nationalities</h3>
          <BarChart
            data={highlightedNationality.map(d => ({ label: d.nationality, value: d.count }))}
            xKey="value"
            yKey="label"
            color="#FF6B6B"
          />
        </div>
      </div>

      <Scrolly bind:value={currentStep}>
        <div class="step" class:active={currentStep === 2}>
          <div class="step-content">
            <p>{steps[2].text}</p>
          </div>
        </div>
      </Scrolly>
    </section>

    <!-- Scrollytelling Section 3: League Flows -->
    <section class="scrolly-section">
      <div class="sticky">
        <div class="viz-container">
          <h3>Player Movement Between Leagues</h3>
          <FlowChart
            flows={leagueFlows.slice(0, 15)}
            leagues={topLeagues}
          />
        </div>
      </div>

      <Scrolly bind:value={currentStep}>
        <div class="step" class:active={currentStep === 3}>
          <div class="step-content">
            <p>{steps[3].text}</p>
          </div>
        </div>
      </Scrolly>
    </section>

    <!-- Scrollytelling Section 4: Positions -->
    <section class="scrolly-section">
      <div class="sticky">
        <div class="viz-container">
          <h3>Transfers by Position</h3>
          <BarChart
            data={highlightedPositions.map(d => ({ label: d.position, value: d.count }))}
            xKey="value"
            yKey="label"
            color="#9B59B6"
          />
        </div>
      </div>

      <Scrolly bind:value={currentStep}>
        <div class="step" class:active={currentStep === 4}>
          <div class="step-content">
            <p>{steps[4].text}</p>
          </div>
        </div>
      </Scrolly>
    </section>

    <!-- Interactive Club Explorer -->
    <section class="club-explorer-section">
      <ClubExplorer data={allData} />
    </section>

    <!-- Conclusion -->
    <section class="conclusion">
      <h2>The Transfer Market Never Sleeps</h2>
      <p>
        As clubs continue to seek competitive advantages, the transfer market remains
        one of football's most fascinating arenas—where millions of pounds, careers,
        and dreams intersect in the pursuit of glory.
      </p>
      <div class="data-note">
        <p><strong>Data Source:</strong> Guardian.co.uk Transfer Windows Coverage (2016-2025)</p>
        <p><strong>Dataset:</strong> 19,454 transfers across Premier League, La Liga, Bundesliga, Serie A, and Ligue 1</p>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <p>Built with Svelte and D3.js • Inspired by The Pudding</p>
    </footer>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    background: #fafafa;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4A90E2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Header */
  header {
    text-align: center;
    padding: 4rem 2rem 2rem;
    background: white;
    border-bottom: 1px solid #e5e5e5;
  }

  h1 {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 700;
    line-height: 1.1;
    margin: 0 0 1rem;
    color: #1a1a1a;
  }

  .subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    color: #666;
    margin: 0 0 1.5rem;
    font-weight: 400;
  }

  .byline {
    font-size: 0.95rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Introduction */
  .intro {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 2rem;
    text-align: center;
  }

  .lead {
    font-size: 1.3rem;
    line-height: 1.7;
    color: #333;
  }

  /* Scrollytelling Sections */
  .scrolly-section {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding: 2rem;
    margin: 4rem 0;
    min-height: 100vh;
  }

  .sticky {
    position: sticky;
    top: 10vh;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .viz-container {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  }

  .viz-container h3 {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .step {
    min-height: 80vh;
    display: flex;
    align-items: center;
    opacity: 0.3;
    transition: opacity 0.4s ease;
  }

  .step.active {
    opacity: 1;
  }

  .step-content {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .step-content p {
    font-size: 1.25rem;
    line-height: 1.8;
    color: #333;
    margin: 0;
  }

  /* Conclusion */
  .conclusion {
    max-width: 720px;
    margin: 6rem auto 4rem;
    padding: 0 2rem;
    text-align: center;
  }

  .conclusion h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
  }

  .conclusion p {
    font-size: 1.2rem;
    line-height: 1.7;
    color: #444;
  }

  .data-note {
    margin-top: 3rem;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    border-left: 4px solid #4A90E2;
  }

  .data-note p {
    font-size: 0.95rem;
    color: #666;
    margin: 0.5rem 0;
    text-align: left;
  }

  /* Club Explorer Section */
  .club-explorer-section {
    background: #f9f9f9;
    padding: 4rem 0;
    margin: 4rem 0;
  }

  /* Footer */
  footer {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-top: 1px solid #e5e5e5;
    color: #999;
    font-size: 0.9rem;
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .scrolly-section {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .sticky {
      position: relative;
      height: 60vh;
      top: 0;
    }

    .step {
      min-height: 50vh;
    }

    .viz-container {
      padding: 1.5rem;
    }

    .step-content {
      padding: 1.5rem;
    }

    .step-content p {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 640px) {
    header {
      padding: 3rem 1.5rem 1.5rem;
    }

    .intro {
      padding: 2rem 1.5rem;
    }

    .lead {
      font-size: 1.1rem;
    }

    .scrolly-section {
      padding: 1rem;
      margin: 2rem 0;
    }

    .viz-container {
      padding: 1rem;
    }

    .viz-container h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .step-content {
      padding: 1.25rem;
    }

    .step-content p {
      font-size: 1rem;
    }

    .conclusion {
      margin: 4rem auto 3rem;
      padding: 0 1.5rem;
    }

    .conclusion h2 {
      font-size: 2rem;
    }

    .conclusion p {
      font-size: 1.05rem;
    }
  }
</style>