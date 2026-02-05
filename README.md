# Subway Builder – addTrains Mod

This mod extends the Subway Builder Modding API by adding a comprehensive collection of real-world train types, organized into categories, with a full-featured UI for enabling/disabling, editing, and creating custom train types.

The package is meant for players who want more realistic regional/commuter rail and tram options for their custom maps.

I know the Exit to desktop button stays up throughout the Menu structure. I hope it disappears with an update to Subway Builder.

---

## Features

- **Extensive Real-World Train Collection**: Over 40 train types from cities worldwide including NYC, London, Copenhagen, Mexico City, Toronto, Montreal, Washington DC, and more.
- **Organized Train Categories**: Trains are automatically categorized into:
  - Fixed Standard Trains (always enabled)
  - Heavy Metro Types (high capacity)
  - Light Metro Types (moderate capacity)
  - Tram Types (street-running, road-crossing capable)
  - Regional Types (commuter rail and S-Bahn)
- **Full UI Management System**: Complete React-based interface with:
  - Enable/Disable panel with organized categories
  - Train statistics popup on hover
  - Detailed train editing with validation
  - Custom train creation
- **Validation System**: Ensures train length compatibility with station requirements.
- **Custom Train Support**: Create and save your own custom train types.
- **Elevation Multipliers**: Different cost multipliers for various elevation types (Deep Bore, Standard Tunnel, Cut & Cover, At Grade, Elevated).
- **Road Crossing Control**: Proper handling of `allowAtGradeRoadCrossing` property.
- **Configuration Persistence**: Settings saved to localStorage.

---

## Requirements

- **Subway Builder** (the game)
- The 2 files from this repository (manifest.json and index.js)

That's it!

---

## Installation

1. Open the game, go to Settings and enable modding. Press the "Open Mods Folder" button.

2. Create a folder and name it `addTrains`

3. [**Download the latest release**](https://github.com/mhmoeller/subwaybuilder-addtrains/releases/latest) and extract `manifest.json` and `index.js` to the `.\Mods\addTrains` folder.

4. Restart the game.

5. Enter the Mods menu again and enable "Add Trains".

6. Restart the game. The mod should now work and you can enable the trains you want to add/modify.

---

## User Guide

### Using the Add Trains Menu

Once installed, you'll see an "Add Trains" button in the main menu. Click it to access the management interface.

### Enable/Disable Trains

**Filtering Trains:**
- Use the dropdown menus to filter by **Continent**, **Country**, **City**, or **Manufacturer**
- Filters work independently - you can filter by manufacturer without selecting a location
- Click "Clear Filter" to reset all filters

**Managing Trains:**
- Browse trains organized by category (Heavy Metro, Light Metro, Tram, Regional)
- **Toggle trains on/off** by clicking the checkbox next to each train
- **Hover over any train** to see detailed statistics
- Fixed trains (heavy-metro, light-metro) are always enabled and cannot be disabled
- Click **"Apply All Train Changes"** when you're done to register your selections

### Edit Train Statistics

1. Click on any train name to edit it
2. Modify any parameter: speed, acceleration, capacity, costs, etc.
3. The validation warning will tell you if your train length is compatible with stations
4. Click **"Save Changes"** to keep your modifications
5. Click **"Reset to Default"** to undo changes
6. Click **"Delete Custom Train"** to remove custom trains you've created

### Create Custom Train

1. Click "Create Custom Train" from the main menu
2. Fill in all the parameters for your train
3. Choose a color for your train
4. Set whether it can cross roads at grade (for trams)
5. Add location and manufacturer information (optional)
6. Click **"Create Train"** to save it

**Tips:**
- Make sure `minStationLength` is longer than `carLength * maxCars`
- Make sure `maxStationLength` is longer than `minStationLength`
- Pay attention to the validation warnings

### Train Categories

**Fixed Standard Trains** (Always Enabled)
- `heavy-metro`: Base heavy metro type (NYC R211 inspired)
- `light-metro`: Base light metro type (Copenhagen Metro inspired)

**Heavy Metro Types**
High capacity urban transit (capacity ≥ 700 at minimum cars)

**Light Metro Types**
Moderate capacity flexible transit

**Tram Types**
Street-running with road crossing capability

**Regional Types**
Commuter rail and regional services

---

## DataPack Support (For users)

This mod works with the **DataPack mod** to import additional trains.

### How to Use DataPack Trains

1. Install the DataPack mod (if not already installed)
2. Place DataPack train files in the DataPack folder
3. Launch the game - Add Trains will automatically detect new trains
4. Open Add Trains menu → Enable/Disable
5. Find your DataPack trains (they appear under their assigned locations)
6. **Enable the trains you want** (they are NOT enabled automatically)
7. Click "Apply All Train Changes"

### Finding DataPack Trains

- Use filters to find trains by location or manufacturer
- DataPack trains appear alongside built-in trains
- Each train appears once in the list, even if it operates in multiple locations
- Filter by any location or manufacturer to see the train

---

## Developer Guide

### Train Data Structure

Each train is defined with the following structure:
```javascript
"Train ID": {
    "id": "Train ID",
    "name": "Display Name",
    "description": "Description of the train",
    "allowAtGradeRoadCrossing": false,  // true for trams
    "stats": {
        "maxSpeed": 25.0,                    // m/s
        "maxSpeedLocalStation": 13.0,        // m/s
        "maxAcceleration": 1.1,              // m/s²
        "maxDeceleration": 1.3,              // m/s²
        "capacityPerCar": 240,               // passengers
        "carLength": 18.35,                  // meters
        "minCars": 5,
        "maxCars": 10,
        "carsPerCarSet": 5,
        "carCost": 2700000,                  // cost per car
        "trainWidth": 3.05,                  // meters
        "minStationLength": 186,             // meters
        "maxStationLength": 227,             // meters
        "baseTrackCost": 50000,              // per unit
        "baseStationCost": 75000000,         // per station
        "trainOperationalCostPerHour": 500,
        "carOperationalCostPerHour": 50,
        "scissorsCrossoverCost": 15000000
    },
    "elevationMultipliers": {
        "DEEP_BORE": 2.0,
        "STANDARD_TUNNEL": 1.5,
        "CUT_AND_COVER": 1.2,
        "AT_GRADE": 1.0,
        "ELEVATED": 1.0
    },
    "compatibleTrackTypes": ["Train ID"],
    "appearance": {
        "color": "#007EC6"
    },
    "isFixed": false,
    "location": {
        "continent": "North America",
        "country": "US",
        "city": "New York City"
    },
    "manufacturer": "Kawasaki"
}
```

### Location and Manufacturer System

**All location and manufacturer fields support both single values and arrays.**

#### Single Location
```javascript
"location": {
    "continent": "North America",
    "country": "US",
    "city": "New York City"
},
"manufacturer": "Kawasaki"
```

#### Multiple Cities in One Country

When a train operates in multiple cities within the **same country**, use a single country value:
```javascript
"location": {
    "continent": "North America",
    "country": "US",  // Single value
    "city": ["New York", "Boston", "Philadelphia"]  // Multiple cities
},
"manufacturer": "Kawasaki"
```

All cities will be associated with the US.

#### Multiple Countries with Matching Cities

**IMPORTANT**: Countries and cities are **paired by index**. This prevents incorrect associations.
```javascript
"location": {
    "continent": "Europe",
    "country": ["Denmark", "Germany"],
    "city": ["Copenhagen", "Hamburg"]
},
"manufacturer": "Siemens"
```

This creates:
- Denmark -> Copenhagen
- Germany -> Hamburg

#### Multiple Cities Across Multiple Countries

When you have multiple cities across different countries, **repeat the country codes**:
```javascript
"location": {
    "continent": "North America",
    "country": ["US", "US", "CA", "CA", "CA"],
    "city": ["Philadelphia", "Chicago", "Montreal", "Toronto", "Vancouver"]
},
"manufacturer": "Bombardier"
```

This creates:
- US -> Philadelphia
- US -> Chicago
- Canada -> Montreal
- Canada -> Toronto
- Canada -> Vancouver

**If you have fewer country entries than cities**, the **last country repeats**:
```javascript
"location": {
    "continent": "North America",
    "country": ["US", "US", "CA"],  // 3 countries
    "city": ["Philadelphia", "Chicago", "Montreal", "Toronto", "Vancouver"]  // 5 cities
}
```

Results in:
- US -> Philadelphia
- US -> Chicago
- CA -> Montreal
- CA -> Toronto (last country repeated)
- CA -> Vancouver (last country repeated)

#### Multi-Continent Trains
```javascript
"location": {
    "continent": ["Europe", "Asia"],
    "country": ["Turkey", "Turkey"],
    "city": ["Istanbul (European)", "Istanbul (Asian)"]
},
"manufacturer": "Siemens"
```

#### Multiple Manufacturers (Joint Ventures)
```javascript
"manufacturer": ["Bombardier", "Alstom"]
```

The train will appear when filtering by either manufacturer.

### Location Pairing Rules

| Scenario | Country | City | Result |
|----------|---------|------|--------|
| Single location | `"US"` | `"New York"` | US → New York |
| Multiple cities, one country | `"US"` | `["NYC", "Boston"]` | US → NYC, US → Boston |
| Paired countries & cities | `["US", "CA"]` | `["NYC", "Toronto"]` | US → NYC, CA → Toronto |
| More cities than countries | `["US", "CA"]` | `["NYC", "Toronto", "Vancouver"]` | US → NYC, CA → Toronto, CA → Vancouver |

### Display Behavior

**In the train list:**
- Each train appears **once** under its **first** continent, country, and city
- Example: A Germany-France train appears only under "Europe > Germany > Frankfurt"

**When filtering:**
- Selecting any of the train's locations shows the train
- Selecting any of the train's manufacturers shows the train
- Train appears in search results but only listed once

### Best Practices

**DO:**
- Pair countries with their cities in the correct order
- Use single country value when all cities are in the same country
- Repeat country codes when you have multiple cities across different countries
- Add manufacturer information when known
- Test your trains in the UI to verify correct location assignment

**DON'T:**
- Mix up the order of countries and cities
- Put a German city first and a French country first
- Assume the system will figure out which city belongs to which country

### DataPack Development

Create a DataPack mod to share your custom trains:
```javascript
// train-datapack/index.js
(function() {
    'use strict';

    const TRAIN_DATA = {
        "Your Train Name": {
            "id": "Your Train Name",
            "name": "Your Train Name",
            "description": "Description...",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 17.9,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.60,
                "maxDeceleration": 1.60,
                "capacityPerCar": 103,
                "carLength": 14.20,
                "minCars": 1,
                "maxCars": 1,
                "carsPerCarSet": 1,
                "carCost": 216222,
                "trainWidth": 2.44,
                "minStationLength": 62,
                "maxStationLength": 80,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 150,
                "carOperationalCostPerHour": 15,
                "scissorsCrossoverCost": 5000000
            },
            "elevationMultipliers": {
                "DEEP_BORE": 2.0,
                "STANDARD_TUNNEL": 1.5,
                "CUT_AND_COVER": 1.2,
                "AT_GRADE": 1.0,
                "ELEVATED": 1.0
            },
            "compatibleTrackTypes": ["Your Train Name"],
            "appearance": {
                "color": "#007EC6"
            },
            "isFixed": false,
            "location": {
                "continent": "North America",
                "country": "US",
                "city": "Boston"
            },
            "manufacturer": "Siemens"
        },
        
        // Multi-location example
        "Regional Express": {
            "id": "Regional Express",
            // ... other fields
            "location": {
                "continent": "North America",
                "country": ["US", "US", "CA"],
                "city": ["Boston", "New York", "Montreal"]
            },
            "manufacturer": ["Siemens", "Bombardier"]
        }
    };

    // Save to localStorage for AddTrains mod
    function saveDataForAddTrains() {
        try {
            const storageKey = 'datapacktrains_data';
            const dataPackData = {
                trains: TRAIN_DATA,
                metadata: {
                    name: "Your Data Pack Name",
                    version: "1.0.0",
                    trainCount: Object.keys(TRAIN_DATA).length,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataPackData));
            console.log(`[TrainDataPack] Saved ${Object.keys(TRAIN_DATA).length} trains`);
            
        } catch (error) {
            console.error('[TrainDataPack] Failed to save data:', error);
        }
    }

    saveDataForAddTrains();
    console.log('[TrainDataPack] Data pack loaded successfully');
})();
```

### Validation Requirements

- `minStationLength` must be ≥ `carLength * maxCars` (plus some buffer)
- `maxStationLength` must be > `minStationLength`
- All numeric fields must be positive
- `color` must be a valid hex color code
- `compatibleTrackTypes` should include the train's own ID

You can go through them in-game and see in the edit menu to see if any of your trains compiles with the validation.

### Elevation Multipliers

Cost multipliers for different construction types:

- **DEEP_BORE**: Deep underground tunnels (highest cost)
- **STANDARD_TUNNEL**: Standard tunnels
- **CUT_AND_COVER**: Cut-and-cover construction
- **AT_GRADE**: Surface level (cheapest for metro, expensive for trams)
- **ELEVATED**: Elevated tracks

**Tram-specific multipliers** typically have:
- Low `AT_GRADE` (0.3) - trams are cheap at surface level
- High `ELEVATED` (1.8) - trams are expensive elevated

---

## Troubleshooting

**Train doesn't appear when filtering:**
- Check that location data is correctly formatted
- Verify country codes match (US vs United States vs USA)
- Check that cities are paired with correct countries

**Train appears in wrong location:**
- Verify country-city pairing is correct
- Check that countries array matches cities array order
- Remember: first country goes with first city, second with second, etc.

**DataPack trains not loading:**
- Ensure DataPack mod is installed and enabled
- Check browser console for error messages
- Verify train data format matches examples above

---

## Notes

- Changes require clicking **"Apply All Train Changes"** to take effect
- Custom trains are saved between game sessions
- DataPack trains must be manually enabled after loading
- Fixed trains (heavy-metro, light-metro) cannot be disabled

---

## Credits

- Mod by **mhmoeller**
- Real-world train data compiled by **DanielD1909**
