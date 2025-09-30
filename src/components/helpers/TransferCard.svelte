<script>
  import { format } from 'd3-format';

  let {
    transfer,
    clubName
  } = $props();

  const formatMoney = format(',.2f');

  const isIncoming = $derived(transfer.New_club === clubName);
  const otherClub = $derived(isIncoming ? transfer.Prev_club : transfer.New_club);
  const direction = $derived(isIncoming ? 'in' : 'out');
</script>

<div class="transfer-card" class:incoming={isIncoming} class:outgoing={!isIncoming}>
  <div class="transfer-header">
    <div class="player-info">
      <h4 class="player-name">{transfer.Player_name}</h4>
      {#if transfer.Player_position && transfer.Player_position !== 'nan'}
        <span class="position">{transfer.Player_position}</span>
      {/if}
      {#if transfer.Nationality && transfer.Nationality !== 'nan'}
        <span class="nationality">{transfer.Nationality}</span>
      {/if}
    </div>
    <div class="direction-badge" class:in={isIncoming} class:out={!isIncoming}>
      {isIncoming ? '→ IN' : '← OUT'}
    </div>
  </div>

  <div class="transfer-details">
    <div class="club-flow">
      {#if isIncoming}
        <span class="from-club">{otherClub}</span>
        <span class="arrow">→</span>
        <span class="to-club highlight">{transfer.New_club}</span>
      {:else}
        <span class="from-club highlight">{transfer.Prev_club}</span>
        <span class="arrow">→</span>
        <span class="to-club">{otherClub}</span>
      {/if}
    </div>

    <div class="meta">
      {#if transfer.Transfer_type}
        <span class="transfer-type">{transfer.Transfer_type}</span>
      {/if}
      {#if transfer.Price_numeric && transfer.Transfer_type === 'fee'}
        <span class="price">€{formatMoney(parseFloat(transfer.Price_numeric))}M</span>
      {/if}
      {#if transfer.Year}
        <span class="year">{transfer.Year}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .transfer-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    border-left: 4px solid #ccc;
    transition: all 0.2s ease;
  }

  .transfer-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .transfer-card.incoming {
    border-left-color: #4A90E2;
  }

  .transfer-card.outgoing {
    border-left-color: #FF6B6B;
  }

  .transfer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .position,
  .nationality {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background: #f0f0f0;
    border-radius: 4px;
    margin-right: 0.25rem;
    color: #666;
  }

  .direction-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .direction-badge.in {
    background: #E3F2FD;
    color: #1976D2;
  }

  .direction-badge.out {
    background: #FFEBEE;
    color: #D32F2F;
  }

  .transfer-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .club-flow {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .from-club,
  .to-club {
    color: #666;
  }

  .highlight {
    font-weight: 600;
    color: #1a1a1a;
  }

  .arrow {
    color: #999;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .transfer-type,
  .year {
    color: #999;
  }

  .price {
    font-weight: 600;
    color: #2e7d32;
  }

  @media (max-width: 640px) {
    .transfer-card {
      padding: 0.875rem;
    }

    .player-name {
      font-size: 1rem;
    }

    .club-flow {
      font-size: 0.85rem;
    }
  }
</style>