# The Beautiful Game's Global Shuffle

An interactive data visualization exploring 19,454 football transfers across Europe's top 5 leagues from 2016 to 2025, built in the style of [The Pudding](https://pudding.cool).

![Football Transfers Visualization](https://img.shields.io/badge/Svelte-5-FF3E00?style=flat&logo=svelte)
![D3.js](https://img.shields.io/badge/D3.js-Visualizations-F9A03C?style=flat&logo=d3.js)

## ✨ Features

### 📖 Scrollytelling Narrative
- **Interactive Scrolling Experience**: Scroll-driven story that reveals insights as you progress
- **Sticky Visualizations**: Charts stay in view while contextual text updates
- **Smooth Transitions**: Elegant opacity and state changes as you scroll

### 📊 Data Visualizations
1. **Transfer Activity Timeline** - Line chart showing yearly transfer trends
2. **Nationality Breakdown** - Bar chart of most transferred nationalities
3. **League Flow Diagram** - Visualization of player movement between leagues
4. **Position Analysis** - Bar chart showing transfers by player position

### 🔍 Interactive Club Explorer
- **Smart Search**: Autocomplete search with keyboard navigation
- **Comprehensive Stats**:
  - Total transfers (incoming/outgoing)
  - Total spent/received
  - Net spend calculation
- **Timeline Visualization**: Grouped bar chart of yearly transfer activity
- **Transfer Cards**: Detailed view of individual transfers with:
  - Player information (name, position, nationality)
  - Transfer direction (incoming/outgoing)
  - Transfer type and fee
  - Source and destination clubs
- **Filter Views**:
  - Recent transfers
  - All incoming transfers
  - All outgoing transfers
  - Top transfers by fee

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Adaptive Layouts**: Scrollytelling sections stack on mobile
- **Touch-Friendly**: Large tap targets and smooth interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5174/`

## 📊 Data Source

**Dataset**: Guardian.co.uk Transfer Windows Coverage (2016-2025)
- **Records**: 19,454 transfers
- **Leagues**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
- **Years**: 2016-2025
- **Fields**: Player name, nationality, position, clubs, transfer fees, dates, and more

Data from: [Guardian Football Transfers Dataset](https://github.com/vibedatascience/guardiancouk_football_transfers_data)

## 🛠️ Tech Stack

- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with runes ($state, $derived, $effect)
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[D3.js](https://d3js.org/)** - Data visualization libraries:
  - d3-scale - Scale functions for mapping data to visual properties
  - d3-array - Data manipulation utilities
  - d3-shape - Path generators for complex shapes
  - d3-format - Number formatting
- **Intersection Observer API** - Scroll-triggered events for scrollytelling

## 📁 Project Structure

```
src/
├── components/
│   ├── helpers/
│   │   ├── Scrolly.svelte          # Scrollytelling component
│   │   ├── ClubSearch.svelte       # Autocomplete search
│   │   └── TransferCard.svelte     # Individual transfer display
│   ├── charts/
│   │   ├── BarChart.svelte         # Horizontal bar charts
│   │   ├── LineChart.svelte        # Time series line chart
│   │   ├── FlowChart.svelte        # League flow visualization
│   │   └── GroupedBarChart.svelte  # Grouped bars for comparisons
│   ├── ClubExplorer.svelte         # Main club explorer component
│   └── App.svelte                  # Main application
├── data/
│   ├── transfers.csv               # Raw transfer data
│   └── processData.js              # Data processing utilities
└── main.js                         # Application entry point
```

## 🎨 Design Philosophy

Inspired by [The Pudding](https://pudding.cool)'s approach to visual essays:

- **Narrative-First**: Every visualization tells a story
- **Simplicity & Clarity**: Clean layouts with generous white space
- **Accessibility**: Keyboard navigation, semantic HTML, ARIA labels
- **Mobile-First**: Touch-friendly, responsive design
- **Progressive Disclosure**: Information revealed through interaction

## 🌟 Key Components

### Scrolly Component
Uses Intersection Observer API to track scroll position and trigger state changes:
```svelte
<Scrolly bind:value={currentStep}>
  <div class="step">Content here</div>
</Scrolly>
```

### Club Explorer
Interactive search and exploration of club transfer history:
- Real-time search filtering
- Dynamic statistics calculation
- Multiple view modes
- Responsive card layouts

### Data Processing
Utility functions for analyzing transfer data:
- `getAllClubs()` - Get list of all clubs
- `getClubTransferStats()` - Calculate transfer statistics
- `getClubTransfersByYear()` - Yearly breakdown
- `getClubTopTransfers()` - Highest-fee transfers

## 📈 Future Enhancements

- [ ] Player search and profiles
- [ ] Transfer network graph visualization
- [ ] League comparison mode
- [ ] Export data functionality
- [ ] Animation of transfer flows
- [ ] Historical transfer fee inflation adjustment

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [The Pudding](https://pudding.cool) for design inspiration
- [Guardian.co.uk](https://www.theguardian.com) for transfer data
- [Svelte](https://svelte.dev/) team for an amazing framework
- [D3.js](https://d3js.org/) community for visualization tools

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Built with ❤️ using Svelte and D3.js • Inspired by The Pudding**