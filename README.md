# 🌍 Seismic Viewer

A **3D Seismic & Horizon Viewer** built with Three.js for visualizing geological data including seismic planes, fault surfaces, horizons, and well data.

![Seismic Viewer](https://img.shields.io/badge/Three.js-0.153.0-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Application Flow](#application-flow)
- [Project Structure](#project-structure)
- [Layer Breakdown](#layer-breakdown)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Data Formats](#data-formats)

---

## Overview

The Seismic Viewer is a web-based 3D visualization application designed for exploring seismic survey data. It renders:

- **Seismic Planes**: Inline and crossline seismic sections
- **Faults**: 3D fault surfaces and fault lines
- **Horizons**: Geological horizon surfaces
- **Wells**: Well trajectories with associated well log data

---

## Features

✅ Interactive 3D camera controls (rotate, pan, zoom)
✅ Real-time seismic plane navigation via sliders
✅ Toggle visibility of faults, horizons, and individual wells
✅ Well log visualization with selectable log types
✅ Loading progress indicator with task status
✅ Automatic data source detection (Database API or CSV fallback)
✅ Responsive UI with collapsible control panels

---

## Architecture

The application follows a **layered architecture** with clear separation of concerns:

```text
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                    (Entry Point + UI Layout)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          app.js                                  │
│              (Main Application Orchestrator)                     │
│         SeismicViewerApp - initializes all systems               │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  UI Layer     │     │  Facade Layer   │     │   Data Layer    │
│               │     │                 │     │                 │
│ - UIManager   │     │ - SceneFacade   │     │ - DataLoader    │
│ - LoadingUI   │     │ - FaultFacade   │     │   Factory       │
│ - Controls    │     │ - HorizonFacade │     │ - Orchestrator  │
│               │     │ - WellFacade    │     │ - Strategies    │
└───────────────┘     │ - SeismicPlane  │     └─────────────────┘
                      │   Facade        │              │
                      └─────────────────┘              │
                                │                       │
                                ▼                       ▼
                      ┌─────────────────────────────────────────┐
                      │           Components Layer              │
                      │                                         │
                      │  - SeismicPlane (Inline/Crossline)     │
                      │  - FaultSegment / FaultPanel           │
                      │  - HorizonManager                       │
                      │  - WellLoader / WellLogLoader          │
                      └─────────────────────────────────────────┘
                                        │
                                        ▼
                      ┌─────────────────────────────────────────┐
                      │             Core Layer                  │
                      │                                         │
                      │  - SceneManager (Three.js scene)       │
                      │  - CoordinateSystem (transformations)   │
                      └─────────────────────────────────────────┘
                                        │
                                        ▼
                      ┌─────────────────────────────────────────┐
                      │            Config Layer                 │
                      │                                         │
                      │  - SeismicConfig (dimensions, camera)  │
                      │  - FaultFileConfig (fault file list)   │
                      │  - WellLogConfig (log types)           │
                      └─────────────────────────────────────────┘
```

---

## Application Flow

### 1. Initialization Sequence

```text
index.html loads
      │
      ▼
app.js creates SeismicViewerApp instance
      │
      ▼
app.init() is called
      │
      ├─► _initScene()
      │       └─► Creates SceneManager (Three.js scene, camera, renderer)
      │       └─► Creates SceneFacade (wrapper for scene operations)
      │
      ├─► _initSeismicPlanes()
      │       └─► Creates SeismicPlaneFacade
      │       └─► Initializes Inline and Crossline planes
      │
      ├─► _initDataOrchestrator()
      │       └─► Creates DataLoadingOrchestrator
      │       └─► Registers all data loaders (horizon, fault, well, wellLog)
      │
      ├─► _loadData()
      │       └─► Registers loading tasks with LoadingStateManager
      │       └─► Loads all data concurrently via orchestrator
      │       └─► Creates facades for loaded data
      │
      ├─► _initUI()
      │       └─► Creates UIManager
      │       └─► Binds sliders, toggles, and well panel to facades
      │
      └─► sceneFacade.startRenderLoop()
              └─► Begins Three.js animation loop
```

### 2. Data Loading Strategy

The application uses a **Strategy Pattern** for data sources:

```text
DataSourceManager
      │
      ├─► DatabaseStrategy (Priority: 1)
      │       └─► Attempts to fetch from /api endpoints
      │       └─► Used when backend database is available
      │
      └─► CSVStrategy (Priority: 100)
              └─► Falls back to CSV files
              └─► Always available for static deployments
```

### 3. Render Loop

```text
SceneManager.startRenderLoop()
      │
      └─► requestAnimationFrame (recursive)
              │
              ├─► renderer.render(scene, camera)
              └─► Check for mouse interactions (raycasting for wells)
```

---

## Project Structure

```text
html/
├── index.html              # Main HTML entry point
├── README.md               # This file
├── css/
│   └── styles.css          # Application styles
├── csv_data/
│   ├── fault/              # Fault CSV files (F1.csv, F2.csv, ...)
│   ├── horizon/            # Horizon CSV files
│   ├── well/               # Well coordinate data
│   ├── well_log/           # Well log data
│   └── inline_crossline/   # Seismic image slices
└── js/
    ├── app.js              # Main application entry
    ├── components/         # Three.js visual components
    │   ├── fault.js        # FaultSegment, FaultPanel, FaultLoader
    │   ├── horizon.js      # HorizonManager
    │   ├── seismic-plane.js# InlinePlane, CrosslinePlane
    │   ├── well.js         # WellLoader
    │   └── well-log.js     # WellLogLoader
    ├── config/             # Configuration constants
    │   ├── seismic.config.js   # SeismicConfig, CameraConfig, StyleConfig
    │   ├── fault-file.config.js# FaultFileConfig
    │   └── well-log.config.js  # WellLogConfig
    ├── core/               # Core systems
    │   ├── scene-manager.js    # Three.js scene management
    │   └── coordinate-system.js# Seismic-to-world transformations
    ├── data/               # Data loading layer
    │   ├── data-loader.js      # Specialized loaders
    │   └── data-loader-factory.js # Factory + strategies
    ├── facade/             # Facade layer (simplified APIs)
    │   ├── scene.facade.js
    │   ├── fault.facade.js
    │   ├── horizon.facade.js
    │   ├── seismic-plane.facade.js
    │   └── well.facade.js
    └── ui/                 # UI components
        ├── ui-controls.js  # SliderControl, ToggleButton, WellTogglePanel
        └── loading-ui.js   # LoadingUI
```

---

## Layer Breakdown

### 1. **Entry Point** (`index.html`)

- Defines the HTML structure with loading screen and control sidebar
- Includes Three.js from CDN
- Loads `app.js` as ES6 module

### 2. **Main Application** (`app.js`)

The `SeismicViewerApp` class orchestrates all subsystems:

| Method | Purpose |
| -------- | --------- |
| `init()` | Async initialization sequence |
| `_initScene()` | Creates Three.js scene via SceneManager |
| `_initSeismicPlanes()` | Sets up inline/crossline seismic sections |
| `_initDataOrchestrator()` | Prepares data loading pipeline |
| `_loadData()` | Loads all geological data |
| `_initUI()` | Binds UI controls to facades |

### 3. **Core Layer** (`js/core/`)

| Class | Responsibility |
| ------- | ---------------- |
| `SceneManager` | Manages Three.js scene, camera, renderer, lighting, and mouse interactions |
| `CoordinateSystem` | Converts seismic coordinates (inline, crossline, time) to 3D world coordinates |

### 4. **Components Layer** (`js/components/`)

| Component | Description |
| ----------- | ------------- |
| `InlinePlane` / `CrosslinePlane` | Seismic section planes with texture loading |
| `FaultSegment` | Line representation of a fault |
| `FaultPanel` | 3D surface mesh for fault visualization |
| `FaultLoader` | Parses CSV and creates fault geometries |
| `HorizonManager` | Manages multiple horizon surfaces |
| `WellLoader` | Loads well trajectory data |
| `WellLogLoader` | Loads well log curves |

### 5. **Facade Layer** (`js/facade/`)

Provides simplified, high-level APIs that hide the complexity of underlying components:

| Facade | Wraps |
| -------- | ------- |
| `SceneFacade` | SceneManager |
| `FaultFacade` | FaultLoader |
| `HorizonFacade` | HorizonManager |
| `SeismicPlaneFacade` | InlinePlane + CrosslinePlane |
| `WellFacade` | WellLoader + WellLogLoader |

### 6. **Data Layer** (`js/data/`)

Implements the **Factory** and **Strategy** patterns:

| Class | Pattern | Purpose |
| ------- | --------- | --------- |
| `DataSourceManager` | Strategy | Manages multiple data source strategies |
| `DatabaseStrategy` | Strategy | Fetches data from REST API |
| `CSVStrategy` | Strategy | Parses local CSV files |
| `AbstractDataLoader` | Template Method | Base class for all loaders |
| `DataLoaderFactory` | Factory | Creates loader instances |
| `DataLoadingOrchestrator` | Facade | Coordinates all data loading |
| `LoadingStateManager` | Observer | Tracks loading progress |

### 7. **UI Layer** (`js/ui/`)

| Class | Purpose |
| ------- | --------- |
| `SliderControl` | Range slider for inline/crossline navigation |
| `ToggleButton` | Show/hide toggle for visibility |
| `WellTogglePanel` | Individual well visibility + log type selection |
| `UIManager` | Creates and manages all UI controls |
| `LoadingUI` | Displays loading progress screen |

### 8. **Config Layer** (`js/config/`)

| Config | Contents |
| -------- | ---------- |
| `SeismicConfig` | Dimensions, counts, offsets for seismic data |
| `CameraConfig` | FOV, zoom limits, rotation speeds |
| `StyleConfig` | Colors, sizes, opacities |
| `FaultFileConfig` | List of fault CSV file paths |
| `WellLogConfig` | Available well log types |

---

## Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Local web server (for ES6 modules and fetch)

### Running Locally

```bash
# Using Python
cd html
python -m http.server 8000

# Using Node.js
npx serve html

# Using PHP
php -S localhost:8000 -t html
```

Open `http://localhost:8000` in your browser.

### Controls

| Input | Action |
| ------- | -------- |
| 🖱️ **Drag** | Rotate camera |
| ⇧ **Shift + Drag** | Pan camera |
| 🖲️ **Scroll** | Zoom in/out |
| **Inline Slider** | Move inline seismic section |
| **Crossline Slider** | Move crossline seismic section |

---

## Configuration

Edit `js/config/seismic.config.js` to customize:

```javascript
export const SeismicConfig = {
    inlineCount: 1092,        // Number of inline slices
    crosslineCount: 549,      // Number of crossline slices
    timeSize: 1400,           // Vertical time extent
    imageWidth: 2790,         // Horizontal dimension
    imageHeight: 2800,        // Vertical dimension
};

export const CameraConfig = {
    initialRadius: 6000,      // Starting zoom distance
    rotationSpeed: 0.005,     // Mouse rotation sensitivity
    zoomSpeed: 1.5,           // Scroll zoom sensitivity
};
```

---

## Data Formats

### Fault CSV

```csv
inline_n,crossline_n,z
100,200,500
101,201,502
...
```

### Well Coordinates CSV

```csv
well_name,x,y,z
Well_A,100,200,0
Well_A,100,200,500
...
```

### Horizon CSV

```csv
inline_n,crossline_n,top,bottom
0,0,100,1200
0,1,105,1205
...
```

---

## License

MIT License - Feel free to use and modify for your geological visualization needs.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

### Built with ❤️ using Three.js
