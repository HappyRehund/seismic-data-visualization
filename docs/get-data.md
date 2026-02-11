# Data Fetching Documentation

This document contains all the data fetching functionality for the seismic viewer application, including CSV loading and API strategies.

---

## Table of Contents

1. [Overview](#overview)
2. [Data Source Strategies](#data-source-strategies)
3. [Specific Data Loaders](#specific-data-loaders)
4. [Code Locations](#code-locations)
5. [Usage Examples](#usage-examples)

---

## Overview

The application uses a **Strategy Pattern** for data fetching, which allows it to:
- Try fetching from a REST API first (if available)
- Automatically fall back to CSV files if the API is unavailable
- Parse CSV data into structured JavaScript objects

**Architecture:**
```
DataSourceManager
    ├── DatabaseStrategy (Priority: 1 - tried first)
    └── CSVStrategy (Priority: 100 - fallback)
```

---

## Data Source Strategies

### Base Strategy Class

**Location:** `app.bundle.js` lines 2270-2282

```javascript
class DataSourceStrategy {
    constructor(config = {}) {
        this.config = config;
        this.name = 'BaseStrategy';
    }

    async isAvailable() {
        throw new Error('Subclass must implement isAvailable()');
    }

    async fetch(endpoint, params = {}) {
        throw new Error('Subclass must implement fetch()');
    }
}
```

---

### DatabaseStrategy (API Fetching)

**Location:** `app.bundle.js` lines 2285-2324
**Priority:** 1 (tried first)

#### Methods

##### `isAvailable()`
Checks if the database API is available by making a health check request.

```javascript
async isAvailable() {
    try {
        const response = await fetch(`${this.baseUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch (error) {
        console.log(`Database API not available: ${error.message}`);
        return false;
    }
}
```

**Line:** 2294 - API health check

---

##### `fetch(endpoint, params)`
Fetches data from the REST API.

```javascript
async fetch(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`, window.location.origin);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Database fetch failed: ${response.status}`);
    }

    return await response.json();
}
```

**Line:** 2312 - Main API fetch call

**Parameters:**
- `endpoint` - API endpoint path (e.g., `'faults/1'`)
- `params` - Query parameters object (e.g., `{ filter: 'active' }`)

**Returns:** JSON response

---

### CSVStrategy (CSV File Fetching)

**Location:** `app.bundle.js` lines 2326-2369
**Priority:** 100 (fallback)

#### Methods

##### `isAvailable()`
CSV files are always available (returns `true`).

```javascript
async isAvailable() {
    return true;
}
```

---

##### `fetch(endpoint, params)`
Fetches and parses CSV files.

```javascript
async fetch(endpoint, params = {}) {
    const path = `${this.basePath}${endpoint}`;
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`CSV fetch failed: ${response.status} for ${path}`);
    }

    const text = await response.text();
    return this._parseCSV(text);
}
```

**Line:** 2340 - Main CSV fetch call

**Parameters:**
- `endpoint` - CSV file path (e.g., `'/csv_data/fault/F1.csv'`)
- `params` - Additional parameters (unused for CSV)

**Returns:** Object with `{ headers, rows, rawText }`

---

##### `_parseCSV(text)`
Parses CSV text into structured data.

```javascript
_parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx];
            });
            rows.push(row);
        }
    }

    return { headers, rows, rawText: text };
}
```

**Returns:**
```javascript
{
    headers: ['Column1', 'Column2', ...],
    rows: [
        { Column1: 'value1', Column2: 'value2', ... },
        { Column1: 'value3', Column2: 'value4', ... }
    ],
    rawText: '...'
}
```

---

### DataSourceManager

**Location:** `app.bundle.js` lines 2434-2472

Manages multiple data source strategies and provides automatic fallback.

#### Methods

##### `registerStrategy(strategy, priority)`
Registers a data source strategy with priority.

```javascript
registerStrategy(strategy, priority = 100) {
    this.strategies.push({ strategy, priority });
    this.strategies.sort((a, b) => a.priority - b.priority);
}
```

**Parameters:**
- `strategy` - Instance of a DataSourceStrategy
- `priority` - Lower number = higher priority (tried first)

---

##### `fetch(endpoint, params)`
Tries all strategies in priority order until one succeeds.

```javascript
async fetch(endpoint, params = {}) {
    for (const { strategy } of this.strategies) {
        try {
            if (await strategy.isAvailable()) {
                return await strategy.fetch(endpoint, params);
            }
        } catch (error) {
            console.warn(`Strategy ${strategy.name} failed for ${endpoint}:`, error.message);
        }
    }
    throw new Error(`All data sources failed for: ${endpoint}`);
}
```

---

## Specific Data Loaders

### FaultLoader

**Location:** `app.bundle.js` lines 695-799

Loads geological fault data from CSV files.

#### Methods

##### `loadFaultLines(path)`
Loads fault lines as 2D line segments.

**Line:** 705 - CSV fetch call

```javascript
async loadFaultLines(path) {
    const response = await fetch(path);
    const text = await response.text();
    const faultData = this._parseCSV(text);

    Object.values(faultData).forEach(segment => {
        if (segment.length !== 2) return;

        const fault = new FaultSegment(
            this.sceneManager,
            segment[0],
            segment[1],
            segment[0].name
        );
        this.faults.push(fault);
    });
}
```

**CSV Format:**
```csv
Fault_Plane,Fault_Stick,Inline,Crossline,Times
F1,1,100,200,300
F1,1,101,201,301
```

---

##### `loadFaultSurfaces(path)`
Loads fault surfaces as 3D panels.

**Line:** 731 - CSV fetch call

```javascript
async loadFaultSurfaces(path) {
    const response = await fetch(path);
    const text = await response.text();
    const faultData = this._parseCSV(text);

    const pairKeys = Object.keys(faultData)
        .map(k => parseInt(k))
        .sort((a, b) => a - b);

    for (let i = 0; i < pairKeys.length - 1; i++) {
        const p1 = faultData[pairKeys[i]];
        const p2 = faultData[pairKeys[i + 1]];

        if (p1[0].name !== p2[0].name) continue;

        if (p1.length === 2 && p2.length === 2) {
            const panel = new FaultPanel(
                this.sceneManager,
                p1[0], p1[1],
                p2[0], p2[1]
            );
            this.faults.push(panel);
        }
    }
}
```

---

### Horizon

**Location:** `app.bundle.js` lines 808-951

Loads horizon surfaces as point clouds.

#### Methods

##### `load(csvUrl, zColumnName)`
Loads horizon data from CSV.

**Line:** 822 - CSV fetch call

```javascript
async load(csvUrl, zColumnName) {
    const response = await fetch(csvUrl);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const data = this._parseCSV(text, zColumnName);

    if (data.points.length === 0) {
        console.warn('No valid horizon points found');
        return;
    }

    this._createPointCloud(data);
}
```

**Parameters:**
- `csvUrl` - Path to horizon CSV file
- `zColumnName` - Name of the Z-coordinate column (e.g., `'Z'`, `'Depth'`, `'TWT'`)

**CSV Format:**
```csv
Inline,Crossline,Z
100,200,500
101,201,502
```

---

##### `_parseCSV(text, zColumnName)`
Parses horizon CSV into point data.

```javascript
_parseCSV(text, zColumnName) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const inlineIdx = headers.indexOf('Inline');
    const crosslineIdx = headers.indexOf('Crossline');
    const zIdx = headers.indexOf(zColumnName);

    if (inlineIdx === -1 || crosslineIdx === -1 || zIdx === -1) {
        throw new Error(
            `Missing required columns. Found: ${headers.join(', ')}. ` +
            `Need: Inline, Crossline, ${zColumnName}`
        );
    }

    const points = [];
    let minInline = Infinity, maxInline = -Infinity;
    let minCrossline = Infinity, maxCrossline = -Infinity;

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        const inline = parseFloat(values[inlineIdx]);
        const crossline = parseFloat(values[crosslineIdx]);
        const z = parseFloat(values[zIdx]);

        if (!isNaN(inline) && !isNaN(crossline) && !isNaN(z)) {
            points.push({ inline, crossline, z });

            minInline = Math.min(minInline, inline);
            maxInline = Math.max(maxInline, inline);
            minCrossline = Math.min(minCrossline, crossline);
            maxCrossline = Math.max(maxCrossline, crossline);
            this.minZ = Math.min(this.minZ, z);
            this.maxZ = Math.max(this.maxZ, z);
        }
    }

    return {
        points,
        ranges: {
            inline: { min: minInline, max: maxInline },
            crossline: { min: minCrossline, max: maxCrossline },
            z: { min: this.minZ, max: this.maxZ }
        }
    };
}
```

---

### WellLogLoader

**Location:** `app.bundle.js` lines 1379-1485

Loads well log data (GR, RT, RHOB, NPHI, DT, SP, PHIE, VSH, SWE).

#### Methods

##### `load(csvPath)`
Loads well log data from CSV.

**Line:** 1388 - CSV fetch call

```javascript
async load(csvPath) {
    const response = await fetch(csvPath);
    const text = await response.text();

    this._parseCSV(text);

    console.log(`Well logs loaded for ${this.wellLogs.size} wells`);
    console.log(`Available log types: ${[...this.availableLogTypes].join(', ')}`);
}
```

**CSV Format:**
```csv
WELL,TVDSS,GR,RT,RHOB,NPHI,DT,SP,PHIE,VSH,SWE
GNK-1,1000,45.2,12.5,2.45,0.25,85.3,-50,0.15,0.3,0.6
GNK-1,1001,48.1,13.2,2.46,0.24,84.1,-48,0.16,0.28,0.58
```

**Columns:**
- `WELL` - Well name/identifier
- `TVDSS` - True Vertical Depth Sub-Sea
- `GR` - Gamma Ray
- `RT` - Resistivity
- `RHOB` - Density
- `NPHI` - Neutron Porosity
- `DT` - Sonic
- `SP` - Spontaneous Potential
- `PHIE` - Effective Porosity
- `VSH` - Shale Volume
- `SWE` - Water Saturation

---

### WellLoader

**Location:** `app.bundle.js` lines 1737-1828

Loads well location and trajectory data.

#### Methods

##### `load(path, defaultTimeEnd)`
Loads well locations from CSV.

**Line:** 1745 - CSV fetch call

```javascript
async load(path, defaultTimeEnd = 1200) {
    const response = await fetch(path);
    const text = await response.text();

    const delimiter = ';';  // Note: semicolon delimiter
    const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 1);
    const header = rows[0].split(delimiter);

    const inlineIdx = header.indexOf('Inline_n');
    const crossIdx = header.indexOf('Crossline_n');
    const nameIdx = header.indexOf('Well_name');

    // Parse well data...
    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(delimiter);

        const inline = parseFloat(cols[inlineIdx]);
        const crossline = parseFloat(cols[crossIdx]);
        const name = cols[nameIdx]?.trim();

        if (!isNaN(inline) && !isNaN(crossline) && name) {
            wellDataList.push({ inline, crossline, name });
        }
    }
}
```

**CSV Format:**
```csv
Well_name;Inline_n;Crossline_n
GNK-1;450;220
GNK-2;452;225
```

**Note:** Uses **semicolon (`;`)** as delimiter, not comma!

---

## Code Locations

All CSV/API fetch calls in `app.bundle.js`:

| Line | Class/Method | Purpose | Type |
|------|-------------|---------|------|
| **705** | `FaultLoader.loadFaultLines()` | Load fault lines | CSV |
| **731** | `FaultLoader.loadFaultSurfaces()` | Load fault surfaces | CSV |
| **822** | `Horizon.load()` | Load horizon points | CSV |
| **1388** | `WellLogLoader.load()` | Load well logs | CSV |
| **1745** | `WellLoader.load()` | Load well locations | CSV |
| **2294** | `DatabaseStrategy.isAvailable()` | API health check | API |
| **2312** | `DatabaseStrategy.fetch()` | API data fetch | API |
| **2340** | `CSVStrategy.fetch()` | Generic CSV fetch | CSV |

**Centralized CSV Strategy:** Lines 2326-2369

---

## Usage Examples

### Example 1: Using Data Source Manager

```javascript
// Create manager
const dataSourceManager = new DataSourceManager();

// Register strategies (lower priority = tried first)
dataSourceManager.registerStrategy(
    new DatabaseStrategy({ apiBaseUrl: '/api' }),
    1  // High priority - try API first
);

dataSourceManager.registerStrategy(
    new CSVStrategy({ csvBasePath: '/csv_data/' }),
    100  // Low priority - fallback to CSV
);

// Fetch data (automatically tries API first, falls back to CSV)
dataSourceManager.fetch('fault/F1(IL^Thrust Fault).csv')
    .then(data => {
        console.log('Data fetched:', data);
        console.log('Source:', dataSourceManager.getCurrentSourceName());
    })
    .catch(error => {
        console.error('Failed to fetch data:', error);
    });
```

---

### Example 2: Direct CSV Loading

```javascript
// Initialize scene manager
const sceneManager = new SceneManager();

// Load fault data
const faultLoader = new FaultLoader(sceneManager);
await faultLoader.loadFaultLines('/csv_data/fault/F1(IL^Thrust Fault).csv');

// Load horizon data
const horizon = new Horizon(sceneManager);
await horizon.load('/csv_data/horizon/horizon_data.csv', 'Z');

// Load well logs
const wellLogLoader = new WellLogLoader();
await wellLogLoader.load('/csv_data/well_log/well_logs.csv');

// Load wells
const wellLoader = new WellLoader(sceneManager);
await wellLoader.load('/csv_data/well/wells.csv', 1200);
```

---

### Example 3: Raw Fetch API

```javascript
async function loadCSV() {
    try {
        // Fetch CSV file
        const response = await fetch('/csv_data/fault/F1(IL^Thrust Fault).csv');
        const text = await response.text();

        // Parse CSV manually
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
                obj[header.trim()] = values[i]?.trim();
            });
            return obj;
        });

        console.log('Parsed CSV data:', data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
```

---

### Example 4: Load All Data Types

```javascript
async function loadAllData(sceneManager) {
    try {
        // 1. Load horizons
        const horizonFacade = new HorizonFacade(sceneManager);
        await horizonFacade.load('/csv_data/horizon/horizon_data.csv', 'Z');

        // 2. Load faults
        const faultFacade = new FaultFacade(sceneManager);
        const faultFiles = FaultFileConfig.getAllFaultFiles();
        await faultFacade.loadAs3D(faultFiles);

        // 3. Load wells and logs
        const wellFacade = new WellFacade(sceneManager);
        await wellFacade.loadAll(
            '/csv_data/well/wells.csv',
            '/csv_data/well_log/well_logs.csv'
        );

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}
```

---

## CSV File Formats Summary

### Fault CSV
```csv
Fault_Plane,Fault_Stick,Inline,Crossline,Times
F1,1,100,200,300
```

### Horizon CSV
```csv
Inline,Crossline,Z
100,200,500
```

### Well Log CSV
```csv
WELL,TVDSS,GR,RT,RHOB,NPHI,DT,SP,PHIE,VSH,SWE
GNK-1,1000,45.2,12.5,2.45,0.25,85.3,-50,0.15,0.3,0.6
```

### Well Location CSV
```csv
Well_name;Inline_n;Crossline_n
GNK-1;450;220
```
**Note:** Uses semicolon (`;`) delimiter!

---

## Architecture Diagram

```
Application Initialization
    │
    ├── DataSourceManager
    │   ├── DatabaseStrategy (Priority: 1)
    │   │   ├── isAvailable() → Check /api/health
    │   │   └── fetch() → GET /api/{endpoint}
    │   │
    │   └── CSVStrategy (Priority: 100)
    │       ├── isAvailable() → Always true
    │       └── fetch() → GET /csv_data/{path}
    │           └── _parseCSV() → Parse to JSON
    │
    ├── FaultLoader
    │   ├── loadFaultLines() → Line 705
    │   └── loadFaultSurfaces() → Line 731
    │
    ├── Horizon
    │   └── load() → Line 822
    │
    ├── WellLogLoader
    │   └── load() → Line 1388
    │
    └── WellLoader
        └── load() → Line 1745
```

---

## Error Handling

All fetch operations include error handling:

```javascript
try {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    // Process data...
} catch (error) {
    console.error('Failed to load data:', error);
    throw error;  // Re-throw for upstream handling
}
```

**Strategy Fallback:**
```javascript
// DataSourceManager automatically falls back
for (const { strategy } of this.strategies) {
    try {
        if (await strategy.isAvailable()) {
            return await strategy.fetch(endpoint, params);
        }
    } catch (error) {
        console.warn(`Strategy ${strategy.name} failed, trying next...`);
    }
}
```

---

## Performance Considerations

1. **Parallel Loading**: Load multiple datasets concurrently
   ```javascript
   await Promise.all([
       horizonFacade.load(...),
       faultFacade.loadAs3D(...),
       wellFacade.loadAll(...)
   ]);
   ```

2. **Caching**: Store parsed data to avoid re-fetching
   ```javascript
   const cache = new Map();
   if (cache.has(path)) return cache.get(path);
   ```

3. **Streaming**: For large files, consider streaming parsers

4. **Timeout**: API health check uses 3-second timeout
   ```javascript
   signal: AbortSignal.timeout(3000)
   ```

---

## Summary

- **7 fetch locations** in the codebase
- **2 strategies**: Database (API) and CSV (fallback)
- **4 main loaders**: Fault, Horizon, WellLog, Well
- **Automatic fallback**: API → CSV
- **Line 2340**: Central CSV fetching strategy

All data fetching is unified through the `DataSourceManager`, providing a consistent interface and automatic fallback mechanism.
