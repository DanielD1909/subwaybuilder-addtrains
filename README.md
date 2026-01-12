# Subway Builder – addTrains Mod

This mod extends the Subway Builder Modding API by adding a comprehensive collection of real-world train types, organized into categories, with a full-featured UI for enabling/disabling, editing, and creating custom train types.

The package is meant for players who want more realistic regional/commuter rail and tram options for their custom maps.

I know the Menu button stays up throughout the Menu structure. It will be updated once we get hooks to the Main Menu. Untill then It will stay at it is.

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
- The 2 files from here(Manifest and Index)
  That's it.
---

## Installation

1. Open the game, go to the Settings and enable modding. Press the Open Mods Folder.

2. Create a folder and name it addTrains

4. Download the manifest.json and the index.js from here to the .\Mods\addTrains folder. 

5. Restart the game.
   
6. Enter the Mods menu again and enable the Add Trains.

7. Restart the game. The Mod should now work and you can enable the Trains you want to add/mod.

## Usage

Once installed, you'll see an "Add Trains" button in the main menu. Click it to access the management interface:

### Enable/Disable Trains
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

Notes:
Every train type has:
- name – label shown in the UI
- description – description string in the UI
- stats – performance, capacity, costs, etc.
- allowAtGradeRoadCrossing:true. These are the only trains allowed to cross roads at grade in the patched validateRoadCollision logic.
- When creating or editing trains, pay attention to the length validation warning.
- Changes require clicking "Apply Changes" to take effect in the game.
- Custom trains are saved between game sessions.

If you want to tweak balance (speeds, capacities, costs, etc.), you only need to edit them in the main menu and apply changes.
Just make sure if that your minStationLength is at least a few meters longer than the total length of your carLength\*maxCars
and of course that your maxStationLength is at least a few meters longer than minStationLength.

You can remove the new train types by unchecking them or pressing remove in the Edit Train Stats menu and add your own types as you please.

## Credits

- Mod by mhmoeller
- Real-world train data compiled by DanielD1909
