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

You need:

- **Subway Builder** (the game)
- The 2 files from this repository (manifest.json and index.js)

That's it.

---

## Installation

1. Open the game, go to Settings and enable modding. Press the "Open Mods Folder" button.

2. Create a folder and name it `addTrains`

3. [**Download the latest release**](https://github.com/mhmoeller/subwaybuilder-addtrains/releases/latest) and extract `manifest.json` and `index.js` to the `.\Mods\addTrains` folder.

4. Restart the game.

5. Enter the Mods menu again and enable "Add Trains".

6. Restart the game. The mod should now work and you can enable the trains you want to add/modify.

---

## Usage

Once installed, you'll see an "Add Trains" button in the main menu. Click it to access the management interface:

### Enable/Disable Trains
- Filter with Continent, Country and City
- Browse trains organized by category
- Toggle individual trains on/off (except fixed types)
- Hover over trains to see detailed statistics
- Delete custom trains
- Apply changes to register selected trains

### Edit Train Statistics
- Select any train (including custom ones)
- Modify all parameters: performance, capacity, costs, elevation multipliers
- Real-time validation ensures train length compatibility
- Save changes or reset to defaults
- Delete custom trains

### Create Custom Train
- Design your own train type from scratch
- Set all parameters including color and road crossing capability
- Validation ensures proper configuration
- Save and immediately use your custom train

---

## Train Categories

### Fixed Standard Trains (Always Enabled)
- `heavy-metro`: Base heavy metro type (NYC R211 inspired)
- `light-metro`: Base light metro type (Copenhagen Metro inspired)

### Heavy Metro Types
High capacity urban transit (capacity ≥ 700 at min cars):
- R188 (NYC), Tube 2024 (LDN), R179 (NYC), FE-10 (MXC)
- NM-16 (MXC), Toronto Rocket, Azur (MTL), 7000 Series (WSH)

### Light Metro Types
Moderate capacity flexible transit:
- AnsaldoBreda (CPH), Innovia Metro (VAN), VAL 208 (FRA)

### Tram Types
Street-running with road crossing capability:
- S700 (MSP), Avenio (CPH), S70 (ATL), P3010 LRV (LA)
- S700-US (SD), S200-HF (CGY), S200-HF (SF)
- GTW 2/6 (NJT), NJT Electric LRV

### Regional Types
Commuter rail and regional services:
- M9 (LIRR), IR4 (CPH), LINT 41 (CPH), DM30-C3 (LIRR)
- Litra SA (CPH), Desiro CJ (VIE), DBAG 483 (BER)

---

## Notes

Every train type has:
- **name** – label shown in the UI
- **description** – description string in the UI
- **stats** – performance, capacity, costs, etc.
- **allowAtGradeRoadCrossing** – only trains with this set to `true` are allowed to cross roads at grade

Important:
- When creating or editing trains, pay attention to the length validation warning.
- Changes require clicking "Apply Changes" to take effect in the game.
- Custom trains are saved between game sessions.
- DataPack trains must be manually enabled after loading.

If you want to tweak balance (speeds, capacities, costs, etc.), you can edit them in the main menu and apply changes. Just make sure that your `minStationLength` is at least a few meters longer than the total length of your `carLength * maxCars`, and that your `maxStationLength` is at least a few meters longer than `minStationLength`.

You can remove train types by unchecking them or pressing "Remove" in the Edit Train Stats menu, and add your own types as you please.

---

---

## DataPack Support

This mod is compatible with the **DataPack mod** by DanielD1909, which allows you to import additional train types from external JSON files.

### How DataPack Integration Works

- **Automatic Detection**: When both mods are installed, Add Trains will automatically detect and load trains from your DataPack files
- **Manual Activation Required**: DataPack trains are imported but **not automatically enabled**. You must manually select which DataPack trains to use through the Enable/Disable menu
- **Location Assignment**: The mod attempts to auto-assign locations to DataPack trains based on their naming (e.g., trains with "(NYC)" or "(LDN)" codes)
- **Full Editing Support**: DataPack trains can be edited and customized just like the built-in trains
- **Multi-Location Support**: DataPack trains can operate across multiple countries/cities (e.g., cross-border regional trains)

### Installing DataPack Trains

1. Install the DataPack mod (if not already installed)
2. Place your train JSON files in the DataPack folder
3. Launch the game - Add Trains will automatically detect the new trains
4. Open the Add Trains menu and go to Enable/Disable
5. Find your DataPack trains (they'll appear under their assigned locations)
6. Enable the trains you want to use
7. Click "Apply All Train Changes"

### DataPack Train Format

For best results, ensure your DataPack train files is set up like this:
```json
// train-datapack/index.js
(function() {
    'use strict';

    console.log('[TrainDataPack] Loading train data for AddTrains mod...');

    // YOUR TRAIN TYPES IN THIS FORMAT
    const TRAIN_DATA = {
        "SEPTA PCC III": {
            "id": "SEPTA PCC III",
            "name": "SEPTA PCC III",
            "description": "The PCC III is a derivation of the Presidents' Conference Committee Streetcar built by the St. Louis Car Company starting in 1936. SEPTA recieved theirs in 1947, and they've been refurbrished twice, first by Brookville Equipment and then in-house. They have been in service since 1948 in Philly, with the last refurbrishing being from 2020-2024.",
            "allowAtGradeRoadCrossing": true,
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
                "AT_GRADE": 0.3,
                "ELEVATED": 1.8
            },
            "compatibleTrackTypes": ["SEPTA PCC III"],
            "appearance": {
                "color": "#FCD602"
            },
            "isFixed": false,
            "location":{
				"continent": "North America",
				"country": "US",
				"city": "Philadelphia"
			}
        },

        "CTA 5000 Series": {
            "id": "CTA 5000 Series",
            "name": "CTA 5000 Series",
            "description": "The 5000 series is a subway EMU built by Bombardier for the Chicago L that entered service in 2011.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 24.6,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 123,
                "carLength": 14.63,
                "minCars": 4,
                "maxCars": 8,
                "carsPerCarSet": 2,
                "carCost": 2500000,
                "trainWidth": 2.84,
                "minStationLength": 130,
                "maxStationLength": 180,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
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
            "compatibleTrackTypes": ["CTA 5000 Series"],
            "appearance": {
                "color": "#009DDC"
            },
            "isFixed": false,
            "location": {
                "continent": "North America",
                "country": ["US"],
                "city": ["Chicago"]
            }
        }
		// Your trains here
    };

    // Save data in localstorage for the addTrains-mod
    function saveDataForAddTrains() {
        try {
            const storageKey = 'datapacktrains_data';
            const dataPackData = {
                trains: TRAIN_DATA,
                metadata: {
                    name: "Train Data Pack",
                    version: "1.0.0",
                    trainCount: Object.keys(TRAIN_DATA).length,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            localStorage.setItem(storageKey, JSON.stringify(dataPackData));
            console.log(`[TrainDataPack] Saved ${Object.keys(TRAIN_DATA).length} train types to localStorage for AddTrains mod`);
            
            // Give message if AddTrains-mod is available
            if (window.__AddTrainsModInitialized) {
                console.log('[TrainDataPack] AddTrains mod detected - data will be loaded automatically');
            }
            
        } catch (error) {
            console.error('[TrainDataPack] Failed to save data:', error);
        }
    }

    // Run the datapack
    saveDataForAddTrains();

    // Listen for addTrains-mod
    let checkCount = 0;
    const maxChecks = 10;
    
    function checkForAddTrains() {
        if (window.__AddTrainsModInitialized) {
            console.log('[TrainDataPack] AddTrains mod ready - data loaded');
            return;
        }
        
        checkCount++;
        if (checkCount < maxChecks) {
            setTimeout(checkForAddTrains, 1000);
        }
    }
    
    // Start check
    checkForAddTrains();

    console.log('[TrainDataPack] Data pack loaded successfully');
})();
```

**Multi-location trains** (e.g., cross-border services):
```json
{
  "location": {
    "continent": "Europe",
    "country": ["Denmark", "Sweden"],
    "city": ["Copenhagen", "Malmö"]
  }
}
```

Note: If location data is missing, the mod will attempt to guess based on city codes in the train ID, or assign them to "DataPack > Imported > From DataPack".

### Filtering DataPack Trains

- Use the Continent/Country/City filters to find specific trains
- DataPack trains appear alongside built-in trains in their respective categories
- Each train appears only once in the list, even if it operates in multiple locations
- Filtering by any of the train's assigned locations will show the train

---

## Credits

- Mod by **mhmoeller**
- Real-world train data compiled by **DanielD1909**
