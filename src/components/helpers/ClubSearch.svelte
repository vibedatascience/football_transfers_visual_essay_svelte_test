<script>
  let {
    clubs = [],
    selectedClub = $bindable(null),
    placeholder = "Search for a club..."
  } = $props();

  let searchTerm = $state('');
  let showDropdown = $state(false);
  let highlightedIndex = $state(0);

  const filteredClubs = $derived(
    searchTerm
      ? clubs.filter(club =>
          club.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10)
      : []
  );

  function handleInput(event) {
    searchTerm = event.target.value;
    showDropdown = searchTerm.length > 0;
    highlightedIndex = 0;
  }

  function selectClub(club) {
    selectedClub = club;
    searchTerm = club;
    showDropdown = false;
  }

  function handleKeydown(event) {
    if (!showDropdown || filteredClubs.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, filteredClubs.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredClubs[highlightedIndex]) {
        selectClub(filteredClubs[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      showDropdown = false;
    }
  }

  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }

  function clearSearch() {
    searchTerm = '';
    selectedClub = null;
    showDropdown = false;
  }
</script>

<div class="search-container">
  <div class="search-input-wrapper">
    <input
      type="text"
      value={searchTerm}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={handleBlur}
      onfocus={() => showDropdown = searchTerm.length > 0}
      {placeholder}
      class="search-input"
    />
    {#if searchTerm}
      <button onclick={clearSearch} class="clear-button" aria-label="Clear search">
        ×
      </button>
    {/if}
  </div>

  {#if showDropdown && filteredClubs.length > 0}
    <ul class="dropdown" role="listbox">
      {#each filteredClubs as club, i}
        <li
          role="option"
          aria-selected={i === highlightedIndex}
          class="dropdown-item"
          class:highlighted={i === highlightedIndex}
          onclick={() => selectClub(club)}
          onkeydown={(e) => e.key === 'Enter' && selectClub(club)}
          onmouseenter={() => highlightedIndex = i}
          tabindex="-1"
        >
          {club}
        </li>
      {/each}
    </ul>
  {/if}

  {#if showDropdown && searchTerm && filteredClubs.length === 0}
    <div class="no-results">
      No clubs found matching "{searchTerm}"
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 500px;
  }

  .search-input-wrapper {
    position: relative;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 0.875rem 2.5rem 0.875rem 1rem;
    font-size: 1rem;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .search-input:focus {
    outline: none;
    border-color: #4A90E2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  .clear-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 2rem;
    height: 2rem;
    border: none;
    background: #f0f0f0;
    border-radius: 50%;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: all 0.2s ease;
  }

  .clear-button:hover {
    background: #e0e0e0;
    color: #333;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;
    z-index: 100;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
    color: #333;
  }

  .dropdown-item:hover,
  .dropdown-item.highlighted {
    background: #f5f5f5;
  }

  .no-results {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    color: #666;
    font-size: 0.9rem;
    z-index: 100;
  }

  @media (max-width: 640px) {
    .search-input {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
</style>