<script>
  import ClubSearch from './helpers/ClubSearch.svelte';
  import GroupedBarChart from './charts/GroupedBarChart.svelte';
  import TransferCard from './helpers/TransferCard.svelte';
  import {
    getAllClubs,
    getClubTransferStats,
    getClubTransfersByYear,
    getClubIncomingTransfers,
    getClubOutgoingTransfers,
    getClubTopTransfers
  } from '../data/processData.js';
  import { format } from 'd3-format';

  let { data = [] } = $props();

  let selectedClub = $state(null);
  let viewMode = $state('overview'); // 'overview', 'incoming', 'outgoing', 'top'

  const allClubs = $derived(getAllClubs(data));

  const clubStats = $derived(
    selectedClub ? getClubTransferStats(data, selectedClub) : null
  );

  const yearlyTransfers = $derived(
    selectedClub ? getClubTransfersByYear(data, selectedClub) : []
  );

  const incomingTransfers = $derived(
    selectedClub ? getClubIncomingTransfers(data, selectedClub) : []
  );

  const outgoingTransfers = $derived(
    selectedClub ? getClubOutgoingTransfers(data, selectedClub) : []
  );

  const topTransfers = $derived(
    selectedClub ? getClubTopTransfers(data, selectedClub, 15) : []
  );

  const formatMoney = format(',.1f');
  const formatCount = format(',');

  const displayedTransfers = $derived(
    viewMode === 'incoming' ? incomingTransfers :
    viewMode === 'outgoing' ? outgoingTransfers :
    viewMode === 'top' ? topTransfers :
    [...incomingTransfers.slice(0, 5), ...outgoingTransfers.slice(0, 5)]
      .sort((a, b) => {
        const yearA = parseInt(a.Year || 0);
        const yearB = parseInt(b.Year || 0);
        return yearB - yearA;
      })
  );
</script>

<div class="club-explorer">
  <div class="explorer-header">
    <h2>Explore Club Transfers</h2>
    <p class="subtitle">Search for any club to see their complete transfer history</p>
  </div>

  <div class="search-section">
    <ClubSearch clubs={allClubs} bind:selectedClub />
  </div>

  {#if selectedClub && clubStats}
    <div class="club-content">
      <!-- Club Header -->
      <div class="club-header">
        <h3>{selectedClub}</h3>
        <div class="club-league">
          {#each data.filter(d => d.New_club === selectedClub || d.Prev_club === selectedClub).slice(0, 1) as t}
            {#if t.New_club === selectedClub && t.New_club_league}
              <span class="league-badge">{t.New_club_league}</span>
            {:else if t.Previous_club_league}
              <span class="league-badge">{t.Previous_club_league}</span>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{formatCount(clubStats.totalTransfers)}</div>
          <div class="stat-label">Total Transfers</div>
        </div>
        <div class="stat-card incoming">
          <div class="stat-value">{formatCount(clubStats.incoming)}</div>
          <div class="stat-label">Incoming</div>
        </div>
        <div class="stat-card outgoing">
          <div class="stat-value">{formatCount(clubStats.outgoing)}</div>
          <div class="stat-label">Outgoing</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">€{formatMoney(clubStats.totalSpent)}M</div>
          <div class="stat-label">Total Spent</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">€{formatMoney(clubStats.totalReceived)}M</div>
          <div class="stat-label">Total Received</div>
        </div>
        <div class="stat-card" class:positive={clubStats.netSpend < 0} class:negative={clubStats.netSpend > 0}>
          <div class="stat-value">
            {clubStats.netSpend >= 0 ? '-' : '+'}€{formatMoney(Math.abs(clubStats.netSpend))}M
          </div>
          <div class="stat-label">Net Spend</div>
        </div>
      </div>

      <!-- Timeline Chart -->
      {#if yearlyTransfers.length > 0}
        <div class="chart-section">
          <h4>Transfer Activity by Year</h4>
          <div class="chart-wrapper">
            <GroupedBarChart
              data={yearlyTransfers}
              xKey="year"
              keys={['incoming', 'outgoing']}
              colors={['#4A90E2', '#FF6B6B']}
              labels={['Incoming', 'Outgoing']}
            />
          </div>
        </div>
      {/if}

      <!-- View Mode Selector -->
      <div class="view-selector">
        <button
          class="view-btn"
          class:active={viewMode === 'overview'}
          onclick={() => viewMode = 'overview'}
        >
          Recent
        </button>
        <button
          class="view-btn"
          class:active={viewMode === 'incoming'}
          onclick={() => viewMode = 'incoming'}
        >
          All Incoming ({incomingTransfers.length})
        </button>
        <button
          class="view-btn"
          class:active={viewMode === 'outgoing'}
          onclick={() => viewMode = 'outgoing'}
        >
          All Outgoing ({outgoingTransfers.length})
        </button>
        <button
          class="view-btn"
          class:active={viewMode === 'top'}
          onclick={() => viewMode = 'top'}
        >
          Top Transfers
        </button>
      </div>

      <!-- Transfers List -->
      <div class="transfers-list">
        {#if displayedTransfers.length > 0}
          {#each displayedTransfers as transfer (transfer.Player_name + transfer.Transfer_date)}
            <TransferCard {transfer} clubName={selectedClub} />
          {/each}
        {:else}
          <div class="no-transfers">
            No transfers found in this category.
          </div>
        {/if}
      </div>
    </div>
  {:else if !selectedClub}
    <div class="empty-state">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" stroke="#e5e5e5" stroke-width="3"/>
        <path d="M35 45 L45 55 L65 35" stroke="#ccc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>Select a club to explore their transfer history</p>
    </div>
  {/if}
</div>

<style>
  .club-explorer {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .explorer-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .explorer-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #1a1a1a;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }

  .search-section {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #999;
  }

  .empty-state p {
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }

  .club-content {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .club-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .club-header h3 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #1a1a1a;
  }

  .league-badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    background: #f0f0f0;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-align: center;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .stat-card.incoming {
    border-top: 3px solid #4A90E2;
  }

  .stat-card.outgoing {
    border-top: 3px solid #FF6B6B;
  }

  .stat-card.positive {
    border-top: 3px solid #2e7d32;
  }

  .stat-card.negative {
    border-top: 3px solid #d32f2f;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chart-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 2rem;
  }

  .chart-section h4 {
    margin: 0 0 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .chart-wrapper {
    height: 300px;
  }

  .view-selector {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .view-btn {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .view-btn:hover {
    border-color: #4A90E2;
    color: #4A90E2;
  }

  .view-btn.active {
    background: #4A90E2;
    border-color: #4A90E2;
    color: white;
  }

  .transfers-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .no-transfers {
    text-align: center;
    padding: 3rem 2rem;
    color: #999;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .club-explorer {
      padding: 1.5rem;
    }

    .explorer-header h2 {
      font-size: 2rem;
    }

    .club-header h3 {
      font-size: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .chart-section {
      padding: 1.5rem;
    }

    .view-selector {
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
    }
  }
</style>