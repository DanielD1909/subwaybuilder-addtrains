// index.js – AddTrains Mod
// Mod API version with React and added DanielD1909 train types
(function () {
    if (window.__AddTrainsModInitialized) return;
    window.__AddTrainsModInitialized = true;

    // --------------------------------------------------
    // DEBUG SYSTEM
    // --------------------------------------------------
    let debugLog = [];
    const MAX_LOG_ENTRIES = 100;

    function debugLogMessage(type, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, type, message, data };
        debugLog.unshift(entry);
        if (debugLog.length > MAX_LOG_ENTRIES) debugLog.pop();
        console.log(`[AddTrainsMod] ${message}`, data || '');
    }

    // --------------------------------------------------
    // HELPER FUNCTIONS
    // --------------------------------------------------
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    function pick(source, keys) {
        const out = {};
        keys.forEach(k => {
            if (source[k] !== undefined) {
                out[k] = source[k];
            }
        });
        return out;
    }

    function showNotification(message, type = 'info') {
        const api = window.SubwayBuilderAPI;
        if (api && api.ui && api.ui.showNotification) {
            api.ui.showNotification(message, type);
            return;
        }
        
        // Advanced fallback notification
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            z-index: 10002;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
            backdrop-filter: blur(8px);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // --------------------------------------------------
    // BASE ELEVATION MULTIPLIERS
    // --------------------------------------------------
    const BASE_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.0,
        STANDARD_TUNNEL: 1.5,
        CUT_AND_COVER: 1.2,
        AT_GRADE: 1.0,
        ELEVATED: 1.0
    };

    // Tram-specific
    const TRAM_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.0,
        STANDARD_TUNNEL: 1.5,
        CUT_AND_COVER: 1.2,
        AT_GRADE: 0.3,
        ELEVATED: 1.8
    };

    // Regional
    const REGIONAL_ELEVATION_MULTIPLIERS = {
        DEEP_BORE: 2.5,
        STANDARD_TUNNEL: 2.0,
        CUT_AND_COVER: 1.5,
        AT_GRADE: 0.8,
        ELEVATED: 1.2
    };
	
    // --------------------------------------------------
    // TRAIN TYPES
    // --------------------------------------------------
    const REAL_TRAINS = {
        // Heavy Metro Types (capacity over 700 at minCars)
        "heavy-metro": {
            "id": "heavy-metro",
            "name": "heavy-metro",
            "description": "For higher capacity routes. The R211 is a subway EMU built by Kawasaki for the NYC Subway's B Division that entered service in 2023.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 24.7,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 240.0,
                "carLength": 18.35,
                "minCars": 5.0,
                "maxCars": 10.0,
                "carsPerCarSet": 5.0,
                "carCost": 2700931,
                "trainWidth": 3.05,
                "minStationLength": 186,
                "maxStationLength": 227,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["heavy-metro"],
            "appearance": {
                "color": "#007EC6"
            },
            "isFixed": true
        },
        "R188 (NYC)": {
            "id": "R188 (NYC)",
            "name": "R188 (NYC)",
            "description": "For higher capacity routes. The R188 is a subway EMU built by Kawasaki for the NYC Subway's A Division that entered service in 2013.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 24.7,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 188.0,
                "carLength": 15.65,
                "minCars": 5.0,
                "maxCars": 10.0,
                "carsPerCarSet": 5.0,
                "carCost": 2500000,
                "trainWidth": 2.65,
                "minStationLength": 159,
                "maxStationLength": 200,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["R188 (NYC)"],
            "appearance": {
                "color": "#AF378B"
            },
            "isFixed": false
        },
        "Tube 2024 (LDN)": {
            "id": "Tube 2024 (LDN)",
            "name": "Tube 2024 (LDN)",
            "description": "For higher capacity routes. The 2024 Tube Stock is a subway EMU built by Siemens Mobility as part of their Inspiro family. It will enter service around mid-2026 on the Picadilly Line.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 27.5,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.4,
                "maxDeceleration": 1.4,
                "capacityPerCar": 116.0,
                "carLength": 12.63,
                "minCars": 9.0,
                "maxCars": 9.0,
                "carsPerCarSet": 9.0,
                "carCost": 2000000,
                "trainWidth": 2.65,
                "minStationLength": 160,
                "maxStationLength": 160,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Tube 2024 (LDN)"],
            "appearance": {
                "color": "#1B3F94"
            },
            "isFixed": false
        },
        "R179 (NYC)": {
            "id": "R179 (NYC)",
            "name": "R179 (NYC)",
            "description": "For separating the NYC subway into A and B Division Routes. The R179 is a subway EMU built by Bombardier (now Alstom) for the NYC Subway's B Division that entered service in 2019.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 24.7,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 240.0,
                "carLength": 18.4,
                "minCars": 4.0,
                "maxCars": 8.0,
                "carsPerCarSet": 4.0,
                "carCost": 2000000,
                "trainWidth": 3.05,
                "minStationLength": 150,
                "maxStationLength": 220,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["R179 (NYC)"],
            "appearance": {
                "color": "#A7752A"
            },
            "isFixed": false
        },
        "FE-10 (MXC)": {
            "id": "FE-10 (MXC)",
            "name": "FE-10 (MXC)",
            "description": "For higher capacity routes. The FE-10 is a steel-wheeled model of electrical multiple units used on the Mexico City Metro, first used in 2012.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 25.0,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.2,
                "maxDeceleration": 1.2,
                "capacityPerCar": 210.0,
                "carLength": 20.14,
                "minCars": 7.0,
                "maxCars": 7.0,
                "carsPerCarSet": 7.0,
                "carCost": 5580690,
                "trainWidth": 3.05,
                "minStationLength": 180,
                "maxStationLength": 180,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["FE-10 (MXC)"],
            "appearance": {
                "color": "#B0A32A"
            },
            "isFixed": false
        },
        "NM-16 (MXC)": {
            "id": "NM-16 (MXC)",
            "name": "NM-16 (MXC)",
            "description": "These are heavy metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The NM-16 is a rubber-tyred model of electrical multiple units used on the Mexico City Metro",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 19.4,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.43,
                "maxDeceleration": 1.43,
                "capacityPerCar": 249.0,
                "carLength": 16.77,
                "minCars": 9.0,
                "maxCars": 9.0,
                "carsPerCarSet": 9.0,
                "carCost": 2134515,
                "trainWidth": 3.0,
                "minStationLength": 200,
                "maxStationLength": 200,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 600,
                "carOperationalCostPerHour": 60,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["NM-16 (MXC)"],
            "appearance": {
                "color": "#F04E98"
            },
            "isFixed": false
        },
        "Toronto Rocket": {
            "id": "Toronto Rocket",
            "name": "Toronto Rocket",
            "description": "For higher capacity routes. The Toronto Rocket is an EMU built by Bombardier for the Toronto Subway that entered service in 2021.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 20.8,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 0.9,
                "maxDeceleration": 1.35,
                "capacityPerCar": 174.0,
                "carLength": 23.0,
                "minCars": 4.0,
                "maxCars": 6.0,
                "carsPerCarSet": 2.0,
                "carCost": 2000000,
                "trainWidth": 3.2,
                "minStationLength": 140,
                "maxStationLength": 180,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Toronto Rocket"],
            "appearance": {
                "color": "#DA251D"
            },
            "isFixed": false
        },
        "Azur (MTL)": {
            "id": "Azur (MTL)",
            "name": "Azur (MTL)",
            "description": "These are heavy metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The MPM-10 (Azur) is a rubber-tire vehicle built by Bombardier and Alstom for the Montreal Metro that entered service in 2016.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 20.1,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.21,
                "maxDeceleration": 1.23,
                "capacityPerCar": 126.0,
                "carLength": 16.93,
                "minCars": 9.0,
                "maxCars": 9.0,
                "carsPerCarSet": 9.0,
                "carCost": 1848654,
                "trainWidth": 2.5,
                "minStationLength": 190,
                "maxStationLength": 190,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 600,
                "carOperationalCostPerHour": 60,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Azur (MTL)"],
            "appearance": {
                "color": "#0085CA"
            },
            "isFixed": false
        },
        "7000 Series (WSH)": {
            "id": "7000 Series (WSH)",
            "name": "7000 Series (WSH)",
            "description": "For higher capacity routes. The 7000-series is a subway EMU built by Kawasaki for Washington DC's Subway that entered service in 2015.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 33.6,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.25,
                "maxDeceleration": 0.98,
                "capacityPerCar": 175.0,
                "carLength": 22.86,
                "minCars": 4.0,
                "maxCars": 8.0,
                "carsPerCarSet": 2.0,
                "carCost": 2765152,
                "trainWidth": 3.2,
                "minStationLength": 185,
                "maxStationLength": 220,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["7000 Series (WSH)"],
            "appearance": {
                "color": "#231F20"
            },
            "isFixed": false
        },

        // Light Metro Types (capacity under 700 at minCars)
        "light-metro": {
            "id": "light-metro",
            "name": "light-metro",
            "description": "Lighter, more flexible transit for moderate capacity routes. The Alstom Metropolis is a series of metro EMUs in service across the world since 1993. The Saint-Laurent is an autonomous light metro variant built for the Réseau express métropolitain in Montreal that entered service in 2023.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 27.8,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 150.0,
                "carLength": 19.05,
                "minCars": 2.0,
                "maxCars": 4.0,
                "carsPerCarSet": 2.0,
                "carCost": 2500000,
                "trainWidth": 2.65,
                "minStationLength": 80,
                "maxStationLength": 120,
                "baseTrackCost": 30000,
                "baseStationCost": 50000000,
                "trainOperationalCostPerHour": 100,
                "carOperationalCostPerHour": 10,
                "scissorsCrossoverCost": 12000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["light-metro"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": true
        },
        "AnsaldoBreda (CPH)": {
            "id": "AnsaldoBreda (CPH)",
            "name": "AnsaldoBreda (CPH)",
            "description": "Lighter, more flexible transit for moderate capacity routes. The Hitachi Rail Italy Driverless Metro (formerly AnsaldoBreda) is a fully autonomous EMU family used across the globe. This specific model is based on those used by Copenhagen's Metro since 2002.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 25.0,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.3,
                "maxDeceleration": 1.3,
                "capacityPerCar": 102.0,
                "carLength": 13.0,
                "minCars": 3.0,
                "maxCars": 6.0,
                "carsPerCarSet": 3.0,
                "carCost": 2500000,
                "trainWidth": 2.65,
                "minStationLength": 80,
                "maxStationLength": 160,
                "baseTrackCost": 30000,
                "baseStationCost": 50000000,
                "trainOperationalCostPerHour": 100,
                "carOperationalCostPerHour": 10,
                "scissorsCrossoverCost": 12000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["AnsaldoBreda (CPH)"],
            "appearance": {
                "color": "#9E0817"
            },
            "isFixed": false
        },
        "Innovia Metro (VAN)": {
            "id": "Innovia Metro (VAN)",
            "name": "Innovia Metro (VAN)",
            "description": "Lighter, more flexible transit for moderate capacity routes. The Innovia Metro is an automated rapid transit system family built by Alstom that have been in service across North America since 1985. This specific model is based on the Mark V used in Vancouver since 2025. Acceleration and decceleration are guesstimates.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 22.2,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.0,
                "maxDeceleration": 1.0,
                "capacityPerCar": 134.0,
                "carLength": 16.96,
                "minCars": 4.0,
                "maxCars": 5.0,
                "carsPerCarSet": 1.0,
                "carCost": 2500000,
                "trainWidth": 2.65,
                "minStationLength": 100,
                "maxStationLength": 130,
                "baseTrackCost": 30000,
                "baseStationCost": 50000000,
                "trainOperationalCostPerHour": 100,
                "carOperationalCostPerHour": 10,
                "scissorsCrossoverCost": 12000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Innovia Metro (VAN)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "VAL 208 (FRA)": {
            "id": "VAL 208 (FRA)",
            "name": "VAL 208 (FRA)",
            "description": "These are light metro systems which use rubber wheels instead of steel. Operational costs are higher, but so is acceleration. The VAL 208 is an autonomous, rubber-tire EMU made by Siemens primarily used in France (Lille, Renne, Toulouse) and has been in service since 2001.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 22.2,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.3,
                "maxDeceleration": 1.3,
                "capacityPerCar": 80.0,
                "carLength": 13.07,
                "minCars": 2.0,
                "maxCars": 4.0,
                "carsPerCarSet": 2.0,
                "carCost": 2000000,
                "trainWidth": 2.4,
                "minStationLength": 60,
                "maxStationLength": 100,
                "baseTrackCost": 30000,
                "baseStationCost": 50000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 12000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["VAL 208 (FRA)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },

        // Tram Types (allowAtGradeRoadCrossing: true)
        "S700 (MSP)": {
            "id": "S700 (MSP)",
            "name": "S700 (MSP)",
            "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S700 series are articulated low-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on those recieved in 2020 by Metro Transit in Minnesota.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 24.4,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 175.0,
                "carLength": 28.74,
                "minCars": 1.0,
                "maxCars": 3.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 89,
                "maxStationLength": 120,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S700 (MSP)"],
            "appearance": {
                "color": "#008244"
            },
            "isFixed": false
        },
        "Avenio (CPH)": {
            id: "Avenio (CPH)",
            name: "Avenio (CPH)",
            description: "City tram service modeled after Siemens Avenio.",
            allowAtGradeRoadCrossing: true,
            stats: {
                maxAcceleration: 1.2,
                maxDeceleration: 1.2,
                maxSpeed: 22.22,
                maxSpeedLocalStation: 8.0,
                capacityPerCar: 200,
                carLength: 30,
                minCars: 1,
                maxCars: 2,
                carsPerCarSet: 1,
                carCost: 1500000,
                trainWidth: 2.65,
                minStationLength: 62,
                maxStationLength: 80,
                baseTrackCost: 25000,
                baseStationCost: 20000000,
                trainOperationalCostPerHour: 200,
                carOperationalCostPerHour: 20,
                scissorsCrossoverCost: 5000000
            },
            elevationMultipliers: TRAM_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["Avenio (CPH)"],
            appearance: { color: "#62b54e" },
            isFixed: false
        },
        "S70 (ATL)": {
            "id": "S70 (ATL)",
            "name": "S70 (ATL)",
            "description": "City tram service. The S700 Streetcar is an articulated low-floor streetcar built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the streetcar model ordered by OC Streetcar.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 20.0,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 165.0,
                "carLength": 27.5,
                "minCars": 1.0,
                "maxCars": 1.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 62,
                "maxStationLength": 80,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S70 (ATL)"],
            "appearance": {
                "color": "#01235E"
            },
            "isFixed": false
        },
        "P3010 LRV (LA)": {
            "id": "P3010 LRV (LA)",
            "name": "P3010 LRV (LA)",
            "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The P3010 is an articulated low-floor light-rail vehicle built by Kinki Sharyo that has been in service in LA since 2016.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 28.9,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.56,
                "capacityPerCar": 175.0,
                "carLength": 27.13,
                "minCars": 1.0,
                "maxCars": 3.0,
                "carsPerCarSet": 1.0,
                "carCost": 2500000,
                "trainWidth": 2.65,
                "minStationLength": 84,
                "maxStationLength": 120,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["P3010 LRV (LA)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "S700-US (SD)": {
            "id": "S700-US (SD)",
            "name": "S700-US (SD)",
            "description": "City tram service. The S700 series are articulated low-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the ultra-short model used in San Diego since 2024.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 24.6,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 145.0,
                "carLength": 24.8,
                "minCars": 1.0,
                "maxCars": 4.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 102,
                "maxStationLength": 140,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S700-US (SD)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "S200-HF (CGY)": {
            "id": "S200-HF (CGY)",
            "name": "S200-HF (CGY)",
            "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S200 series are articulated high-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2016. This specific model is based on the model used in Calgary since 2019.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 22.4,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 0.95,
                "maxDeceleration": 1.32,
                "capacityPerCar": 180.0,
                "carLength": 25.8,
                "minCars": 1.0,
                "maxCars": 3.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 80,
                "maxStationLength": 120,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S200-HF (CGY)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "S200-HF (SF)": {
            "id": "S200-HF (SF)",
            "name": "S200-HF (SF)",
            "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. The S200 series are articulated high-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2016. This specific model is based on the model used in San Francisco since 2017.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 22.4,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 150.0,
                "carLength": 22.86,
                "minCars": 1.0,
                "maxCars": 3.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 71,
                "maxStationLength": 120,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S200-HF (SF)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "GTW 2/6 (NJT)": {
            "id": "GTW 2/6 (NJT)",
            "name": "GTW 2/6 (NJT)",
            "description": "The diesel light metro is a rare form of transit that is generally used when existing rail can be used but there is no electrification, and heavy rail is not justified. This is a variant of the Stadler GTW 2/6 which is one of the rare and bizarre light rail DMUs and is exclusively in service on NJT's River Line. Details are scarce so the acceleration and braking are guesstimates.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 30.6,
                "maxSpeedLocalStation": 10,
                "maxAcceleration": 1.3,
                "maxDeceleration": 1.3,
                "capacityPerCar": 180.0,
                "carLength": 31.2,
                "minCars": 1.0,
                "maxCars": 2.0,
                "carsPerCarSet": 1.0,
                "carCost": 2000000,
                "trainWidth": 2.65,
                "minStationLength": 65,
                "maxStationLength": 100,
                "baseTrackCost": 25000,
                "baseStationCost": 40000000,
                "trainOperationalCostPerHour": 300,
                "carOperationalCostPerHour": 30,
                "scissorsCrossoverCost": 10000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["GTW 2/6 (NJT)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },
        "NJT Electric LRV": {
            "id": "NJT Electric LRV",
            "name": "NJT Electric LRV",
            "description": "Light rail is a form of urban transit that uses rolling stock derived from tram technology while also having some features from heavy rapid transit. This is an unnamed articulated low-floor light-rail vehicle built by Kinki-Sharyo for New Jersey Transit, specifically Hudson-Bergen Light Rail and Newark Light Rail. It has been in service since 2000.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 24.4,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 190.0,
                "carLength": 27.43,
                "minCars": 1.0,
                "maxCars": 1.0,
                "carsPerCarSet": 1.0,
                "carCost": 2000000,
                "trainWidth": 2.65,
                "minStationLength": 62,
                "maxStationLength": 80,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["NJT Electric LRV"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        },

        // Regional Types (description contains "regional" or "commuter rail")
        "M9 (LIRR)": {
            "id": "M9 (LIRR)",
            "name": "M9 (LIRR)",
            "description": "Regional rail is a public rail transport service that operates between towns and cities. In North America, regional rail is often a synonym for commuter rail. The M9 is a commuter rail EMU built by Kawasaki for the Long Island Railroad that entered service in 2009.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 40.0,
                "maxSpeedLocalStation": 12,
                "maxAcceleration": 0.9,
                "maxDeceleration": 1.33,
                "capacityPerCar": 120.0,
                "carLength": 26.0,
                "minCars": 4.0,
                "maxCars": 14.0,
                "carsPerCarSet": 2.0,
                "carCost": 3859000,
                "trainWidth": 3.1,
                "minStationLength": 366,
                "maxStationLength": 400,
                "baseTrackCost": 50000,
                "baseStationCost": 65000000,
                "trainOperationalCostPerHour": 300,
                "carOperationalCostPerHour": 30,
                "scissorsCrossoverCost": 10500000,
            },
            "elevationMultipliers": REGIONAL_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["M9 (LIRR)"],
            "appearance": {
                "color": "#0039A6"
            },
            "isFixed": false
        },
        "IR4 (CPH)": {
            id: "IR4 (CPH)",
            name: "IR4 (CPH)",
            description: "Fast long-distance train modeled after the Danish IR4.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 0.8,
                maxDeceleration: 1.0,
                maxSpeed: 50.0,
                maxSpeedLocalStation: 15,
                capacityPerCar: 130,
                carLength: 26,
                minCars: 2,
                maxCars: 8,
                carsPerCarSet: 2,
                carCost: 4000000,
                trainWidth: 3.1,
                minStationLength: 210,
                maxStationLength: 275,
                baseTrackCost: 60000,
                baseStationCost: 90000000,
                trainOperationalCostPerHour: 700,
                carOperationalCostPerHour: 70,
                scissorsCrossoverCost: 20000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["IR4 (CPH)"],
            appearance: { color: "#222222" },
            isFixed: false
        },
		"LINT 41 (CPH)": {
            id: "LINT 41 (CPH)",
            name: "LINT 41 (CPH)",
            description: "Regional diesel/electric unit for local services. Modelled after the LINT 41",
            allowAtGradeRoadCrossing: true,
            stats: {
                maxAcceleration: 0.6,
                maxDeceleration: 0.9,
                maxSpeed: 33.3,
                maxSpeedLocalStation: 12,
                capacityPerCar: 100,
                carLength: 20,
                minCars: 2,
                maxCars: 4,
                carsPerCarSet: 2,
                carCost: 2000000,
                trainWidth: 2.75,
                minStationLength: 82,
                maxStationLength: 120,
                baseTrackCost: 40000,
                baseStationCost: 60000000,
                trainOperationalCostPerHour: 300,
                carOperationalCostPerHour: 30,
                scissorsCrossoverCost: 10000000
            },
            elevationMultipliers: REGIONAL_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["LINT 41 (CPH)"],
            appearance: { color: "#ebd768" },
            isFixed: false
        },
        "DM30-C3 (LIRR)": {
            "id": "DM30-C3 (LIRR)",
            "name": "DM30-C3 (LIRR)",
            "description": "Regional rail is a public rail transport service that operates between towns and cities. In North America, regional rail is often a synonym for commuter rail. The DM30AC-C3 is a commuter rail Diesel train that entered service in 1993, with coach cars manufacured by Kawasaki powered by an EMD manufactured Diesel locomotive.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 42.0,
                "maxSpeedLocalStation": 12,
                "maxAcceleration": 0.65,
                "maxDeceleration": 1.3,
                "capacityPerCar": 150.0,
                "carLength": 26.0,
                "minCars": 4.0,
                "maxCars": 12.0,
                "carsPerCarSet": 2.0,
                "carCost": 2500000,
                "trainWidth": 3.1,
                "minStationLength": 314,
                "maxStationLength": 400,
                "baseTrackCost": 40000,
                "baseStationCost": 60000000,
                "trainOperationalCostPerHour": 800,
                "carOperationalCostPerHour": 40,
                "scissorsCrossoverCost": 10000000,
            },
            "elevationMultipliers": REGIONAL_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["DM30-C3 (LIRR)"],
            "appearance": {
                "color": "#03B8A9"
            },
            "isFixed": false
        },
        "Litra SA (CPH)": {
            "id": "Litra SA (CPH)",
            "name": "Litra SA (CPH)",
            "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The Litra SA is an EMU produced by Alstom and Siemens for the Copenhagen S-Tog system which entered service in 1996.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 33.3,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.3,
                "maxDeceleration": 1.2,
                "capacityPerCar": 87.0,
                "carLength": 10.5,
                "minCars": 4.0,
                "maxCars": 8.0,
                "carsPerCarSet": 4.0,
                "carCost": 2500000,
                "trainWidth": 3.2,
                "minStationLength": 100,
                "maxStationLength": 220,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 25,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Litra SA (CPH)"],
            "appearance": {
                "color": "#BD2D3D"
            },
            "isFixed": false
        },
        "Desiro CJ (VIE)": {
            "id": "Desiro CJ (VIE)",
            "name": "Desiro CJ (VIE)",
            "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The Siemens Desiro is a family of DMUs and EMUs in service across the world made by Siemens and formerly Ural Locomotives. This specific model is based on Mainline model 'Urban' Varient in service since 2012 on Vienna's S-Bahn.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 44.4,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 0.8,
                "capacityPerCar": 180.0,
                "carLength": 25.0,
                "minCars": 3.0,
                "maxCars": 6.0,
                "carsPerCarSet": 3.0,
                "carCost": 2000000,
                "trainWidth": 3.2,
                "minStationLength": 152,
                "maxStationLength": 200,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["Desiro CJ (VIE)"],
            "appearance": {
                "color": "#0097D9"
            },
            "isFixed": false
        },
        "DBAG 483 (BER)": {
            "id": "DBAG 483 (BER)",
            "name": "DBAG 483 (BER)",
            "description": "An S-Bahn is a type of hybrid commuter rail and rapid transit service that links suburbs with the city centre at moderate speeds, while continuing across the urban core over a central high-frequency corridor where multiple lines converge, where they provide a rapid means of travel across the city. The DB Class 483 is an EMU built by Stadler and Siemens for the Berlin S-Bahn that entered service in 2021.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 27.8,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.0,
                "maxDeceleration": 0.8,
                "capacityPerCar": 87.0,
                "carLength": 18.4,
                "minCars": 2.0,
                "maxCars": 8.0,
                "carsPerCarSet": 2.0,
                "carCost": 2000000,
                "trainWidth": 3.0,
                "minStationLength": 150,
                "maxStationLength": 200,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["DBAG 483 (BER)"],
            "appearance": {
                "color": "#CE9D52"
            },
            "isFixed": false
        },
        "R211A (NYC)": {
            "id": "R211A (NYC)",
            "name": "R211A (NYC)",
            "description": "For separating the NYC subway into A and B Division Routes. The R211 is a subway EMU built by Kawasaki for the NYC Subway's B Division that entered service in 2023.",
            "allowAtGradeRoadCrossing": false,
            "stats": {
                "maxSpeed": 24.7,
                "maxSpeedLocalStation": 13,
                "maxAcceleration": 1.1,
                "maxDeceleration": 1.3,
                "capacityPerCar": 240.0,
                "carLength": 18.35,
                "minCars": 5.0,
                "maxCars": 10.0,
                "carsPerCarSet": 5.0,
                "carCost": 2700931,
                "trainWidth": 3.05,
                "minStationLength": 186,
                "maxStationLength": 227,
                "baseTrackCost": 50000,
                "baseStationCost": 75000000,
                "trainOperationalCostPerHour": 500,
                "carOperationalCostPerHour": 50,
                "scissorsCrossoverCost": 15000000,
            },
            "elevationMultipliers": BASE_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["R211A (NYC)"],
            "appearance": {
                "color": "#007EC6"
            },
            "isFixed": false
        },
        "S70 (ATL) (SA)": {
            "id": "S70 (ATL) (SA)",
            "name": "S70 (ATL) (SA)",
            "description": "City tram and LRT service, adjusted for street running speeds. The S700 Streetcar is an articulated low-floor streetcar built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the streetcar model ordered by OC Streetcar.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 10.0,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 165.0,
                "carLength": 27.5,
                "minCars": 1.0,
                "maxCars": 1.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 62,
                "maxStationLength": 80,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S70 (ATL) (SA)"],
            "appearance": {
                "color": "#01235E"
            },
            "isFixed": false
        },
        "S700-US (SD) (SA)": {
            "id": "S700-US (SD) (SA)",
            "name": "S700-US (SD) (SA)",
            "description": "City tram and LRT service, adjusted for street running speeds. The S700 series are articulated low-floor light-rail vehicles built by Siemens Mobility that have been in service across North America since 2004. This specific model is based on the ultra-short model used in San Diego since 2024.",
            "allowAtGradeRoadCrossing": true,
            "stats": {
                "maxSpeed": 10.0,
                "maxSpeedLocalStation": 6.7,
                "maxAcceleration": 1.34,
                "maxDeceleration": 1.34,
                "capacityPerCar": 145.0,
                "carLength": 24.8,
                "minCars": 1.0,
                "maxCars": 4.0,
                "carsPerCarSet": 1.0,
                "carCost": 2185000,
                "trainWidth": 2.65,
                "minStationLength": 102,
                "maxStationLength": 140,
                "baseTrackCost": 25000,
                "baseStationCost": 20000000,
                "trainOperationalCostPerHour": 200,
                "carOperationalCostPerHour": 20,
                "scissorsCrossoverCost": 5000000,
            },
            "elevationMultipliers": TRAM_ELEVATION_MULTIPLIERS,
            "compatibleTrackTypes": ["S700-US (SD) (SA)"],
            "appearance": {
                "color": "#000000"
            },
            "isFixed": false
        }
    };

    // --------------------------------------------------
    // CATEGORIZE TRAINS FOR ORGANIZED MENU
    // --------------------------------------------------
    function getTrainCategories() {
        const categories = {
            "Fixed Standard Trains": [],
            "Heavy Metro Types": [],
            "Light Metro Types": [],
            "Tram Types": [],
            "Regional Types": []
        };

        // Categorize trains
        Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
			const totalCapacityAtMinCars = trainDef.stats.capacityPerCar * trainDef.stats.minCars;
			const description = trainDef.description.toLowerCase();
			
			if (trainDef.isFixed) {
				categories["Fixed Standard Trains"].push([trainId, trainDef]);
			} else if (trainDef.allowAtGradeRoadCrossing) {
				// Check if it's NOT a regional/commuter type despite being able to cross roads
				if (!description.includes("regional") && 
					!description.includes("commuter") &&
					!description.includes("long-distance") &&
					!description.includes("s-bahn")) {
					categories["Tram Types"].push([trainId, trainDef]);
				} else {
					// If it can cross roads BUT is regional/commuter, put it in Regional Types
					categories["Regional Types"].push([trainId, trainDef]);
				}
			} else if (description.includes("regional") || 
					   description.includes("commuter") ||
					   description.includes("long-distance") ||
					   description.includes("s-bahn")) {
				categories["Regional Types"].push([trainId, trainDef]);
			} else if (totalCapacityAtMinCars >= 700) {
				categories["Heavy Metro Types"].push([trainId, trainDef]);
			} else {
				categories["Light Metro Types"].push([trainId, trainDef]);
			}
		});

        // Add custom trains to appropriate categories
        if (currentConfig.customTrains) {
			Object.entries(currentConfig.customTrains).forEach(([trainId, trainDef]) => {
				if (trainId.startsWith('custom-')) {
					const totalCapacityAtMinCars = trainDef.stats?.capacityPerCar * trainDef.stats?.minCars || 0;
					const description = (trainDef.description || "").toLowerCase();
					
					if (trainDef.allowAtGradeRoadCrossing) {
						// Check if it's NOT a regional/commuter type despite being able to cross roads
						if (!description.includes("regional") && 
							!description.includes("commuter") &&
							!description.includes("long-distance") &&
							!description.includes("s-bahn")) {
							categories["Tram Types"].push([trainId, trainDef]);
						} else {
							// If it can cross roads BUT is regional/commuter, put it in Regional Types
							categories["Regional Types"].push([trainId, trainDef]);
						}
					} else if (description.includes("regional") || 
							   description.includes("commuter") ||
							   description.includes("long-distance") ||
							   description.includes("s-bahn")) {
						categories["Regional Types"].push([trainId, trainDef]);
					} else if (totalCapacityAtMinCars >= 700) {
						categories["Heavy Metro Types"].push([trainId, trainDef]);
					} else {
						categories["Light Metro Types"].push([trainId, trainDef]);
					}
				}
			});
		}

        return categories;
    }

    // --------------------------------------------------
    // CONFIG MANAGEMENT
    // --------------------------------------------------
    const STORAGE_KEY = 'addtrains_config';
    
    let uiState = {
        selectedTrainID: null,
        editedValues: {}
    };
    
    // Default config
    const DEFAULT_CONFIG = {
        enabledTrains: Object.keys(REAL_TRAINS).filter(id => !REAL_TRAINS[id].isFixed),
        customTrains: {},
        customTrainCounter: 0,
        showEditPanel: false
    };

    function saveConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            debugLogMessage("log", "Config saved");
        } catch (e) {
            debugLogMessage("error", "Could not save config", e);
        }
    }

    function loadConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                debugLogMessage("log", "Config loaded");
                return JSON.parse(saved);
            }
        } catch (e) {
            debugLogMessage("error", "Could not load config", e);
        }
        const defaultConfig = deepClone(DEFAULT_CONFIG);
        saveConfig(defaultConfig);
        return defaultConfig;
    }

    let currentConfig = loadConfig();

    // --------------------------------------------------
    // GET TRAINS FOR REGISTRATION
    // --------------------------------------------------
    function getTrainsForRegistration() {
        const config = currentConfig || loadConfig();
        const trains = {};
        
        // Always include fixed trains
        Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
            if (trainDef.isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(trainDef);
                }
            }
        });
        
        // Include enabled extra trains
        (config.enabledTrains || []).forEach(trainId => {
            if (REAL_TRAINS[trainId] && !REAL_TRAINS[trainId].isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(REAL_TRAINS[trainId]);
                }
            }
        });
        
        // Include custom trains
        if (config.customTrains) {
            Object.entries(config.customTrains).forEach(([trainId, trainDef]) => {
                if (trainId.startsWith('custom-') && config.enabledTrains?.includes(trainId)) {
                    trains[trainId] = deepClone(trainDef);
                }
            });
        }
        
        debugLogMessage("log", `Preparing ${Object.keys(trains).length} trains for registration`);
        return trains;
    }

    // --------------------------------------------------
    // TRAIN REGISTRATION WITH VALIDATION
    // --------------------------------------------------
    function validateTrainLength(train) {
        if (!train.stats) return true;
        
        const maxTrainLength = train.stats.carLength * train.stats.maxCars;
        const minRequiredLength = train.stats.minStationLength;
        
        if (maxTrainLength > (minRequiredLength - 2)) {
            return false;
        }
        
        return true;
    }

    function registerTrainsToGame() {
        debugLogMessage("log", "=== REGISTERING TRAINS ===");
        
        const api = window.SubwayBuilderAPI;
        if (!api || !api.trains) {
            debugLogMessage("error", "API not available");
            return false;
        }

        const trainsApi = api.trains;
        const trains = getTrainsForRegistration();
        
        let successCount = 0;
        let failCount = 0;
        let validationFailed = false;

        // Get existing trains
        let existingTrains = {};
        try {
            if (typeof trainsApi.getTrainTypes === 'function') {
                existingTrains = trainsApi.getTrainTypes() || {};
                debugLogMessage("log", `Found ${Object.keys(existingTrains).length} existing trains`);
            }
        } catch (e) {
            debugLogMessage("warn", "Could not get existing trains", e);
        }

        // Validate and register each train
        Object.entries(trains).forEach(([trainId, trainDef]) => {
            try {
                // Validate train length
                if (!validateTrainLength(trainDef)) {
                    validationFailed = true;
                    failCount++;
                    return;
                }

                // Create complete train object
                const completeTrain = {
                    id: trainDef.id,
                    name: trainDef.name,
                    description: trainDef.description || "",
                    allowAtGradeRoadCrossing: trainDef.allowAtGradeRoadCrossing !== undefined 
                        ? trainDef.allowAtGradeRoadCrossing 
                        : false,
                    stats: deepClone(trainDef.stats || {}),
                    elevationMultipliers: deepClone(trainDef.elevationMultipliers || BASE_ELEVATION_MULTIPLIERS),
                    compatibleTrackTypes: trainDef.compatibleTrackTypes || [trainId],
                    appearance: deepClone(trainDef.appearance || { color: "#ffffff" })
                };

                debugLogMessage("log", `Registering: ${trainId}`, {
                    allowAtGradeRoadCrossing: completeTrain.allowAtGradeRoadCrossing,
                    elevationMultipliers: completeTrain.elevationMultipliers
                });

                // Check if exists
                const exists = existingTrains[trainId];
                
                if (exists) {
                    // Try to modify
                    try {
                        if (typeof trainsApi.modifyTrainType === 'function') {
                            trainsApi.modifyTrainType(trainId, completeTrain);
                            debugLogMessage("log", `Modified: ${trainId}`);
                        } else {
                            trainsApi.registerTrainType(completeTrain);
                            debugLogMessage("log", `Registered (fallback): ${trainId}`);
                        }
                    } catch (modifyError) {
                        // If modify fails, try register as new
                        try {
                            trainsApi.registerTrainType(completeTrain);
                            debugLogMessage("log", `Registered (after modify failed): ${trainId}`);
                        } catch (registerError) {
                            throw registerError;
                        }
                    }
                } else {
                    // Register new
                    trainsApi.registerTrainType(completeTrain);
                    debugLogMessage("log", `Registered new: ${trainId}`);
                }
                
                successCount++;
                
            } catch (error) {
                debugLogMessage("error", `Failed: ${trainId}`, error);
                failCount++;
            }
        });

        // Verification
        setTimeout(() => {
            try {
                const finalTrains = trainsApi.getTrainTypes ? trainsApi.getTrainTypes() : {};
                debugLogMessage("log", "=== VERIFICATION ===");
                debugLogMessage("log", `Total trains in game: ${Object.keys(finalTrains).length}`);
                
                Object.keys(trains).forEach(trainId => {
                    if (finalTrains[trainId]) {
                        const train = finalTrains[trainId];
                        debugLogMessage("log", `OK ${trainId}`, {
                            allowAtGradeRoadCrossing: train.allowAtGradeRoadCrossing,
                            hasElevationMultipliers: !!train.elevationMultipliers,
                            elevationMultipliers: train.elevationMultipliers,
                            compatibleTrackTypes: train.compatibleTrackTypes
                        });
                    } else {
                        debugLogMessage("error", `FAILED ${trainId} NOT FOUND`);
                    }
                });
            } catch (e) {
                debugLogMessage("error", "Verification failed", e);
            }
        }, 1000);

        const success = failCount === 0 && !validationFailed;
        if (validationFailed) {
            showNotification("Train registration failed: Some trains are too long!", 'error');
        } else {
            debugLogMessage(success ? "log" : "error", 
                `Registration: ${successCount} OK, ${failCount} failed`);
        }
        return success;
    }

    // --------------------------------------------------
    // CREATE CUSTOM TRAIN
    // --------------------------------------------------
    function createCustomTrain(name, description, color) {
        const trainId = `custom-${++currentConfig.customTrainCounter}`;
        
        const newTrain = {
            id: trainId,
            name: name,
            description: description || "Custom train type",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.0,
                maxDeceleration: 1.0,
                maxSpeed: 20.0,
                maxSpeedLocalStation: 10.0,
                capacityPerCar: 150,
                carLength: 20,
                minCars: 2,
                maxCars: 6,
                carsPerCarSet: 2,
                carCost: 2000000,
                trainWidth: 3.0,
                minStationLength: 100,
                maxStationLength: 150,
                baseTrackCost: 35000,
                baseStationCost: 50000000,
                trainOperationalCostPerHour: 300,
                carOperationalCostPerHour: 30,
                scissorsCrossoverCost: 10000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: [trainId],
            appearance: { color: color },
            isFixed: false
        };
        
        if (!currentConfig.customTrains) {
            currentConfig.customTrains = {};
        }
        
        currentConfig.customTrains[trainId] = newTrain;
        
        if (!currentConfig.enabledTrains) {
            currentConfig.enabledTrains = [];
        }
        
        currentConfig.enabledTrains.push(trainId);
        saveConfig(currentConfig);
        
        debugLogMessage("log", `Custom train created: ${trainId}`);
        return trainId;
    }

    // --------------------------------------------------
    // REACT UI COMPONENTS - UPDATED WITH ORGANIZED ENABLE/DISABLE
    // --------------------------------------------------
    function createReactUI() {
        const api = window.SubwayBuilderAPI;
        const React = api.utils?.React;
        const components = api.utils?.components || {};
        const icons = api.utils?.icons || {};
        
        if (!React) {
            debugLogMessage("error", "React not available");
            return null;
        }

        // Main Menu Component
        function MainMenuButton() {
            const [isOpen, setIsOpen] = React.useState(false);
            const [activeView, setActiveView] = React.useState(null); // 'enable', 'edit', 'create'
			const [hoveredTrain, setHoveredTrain] = React.useState(null);
            const [popupPosition, setPopupPosition] = React.useState({ x: 0, y: 0 });

            const openEnableDisable = () => {
                setActiveView('enable');
                setIsOpen(true);
            };

            const openEditTrain = () => {
                setActiveView('edit');
                setIsOpen(true);
            };

            const openCreateTrain = () => {
                setActiveView('create');
                setIsOpen(true);
            };

            // Available components or fallbacks
            const Button = components.Button || ((props) => {
                const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-sm';
                const variantClasses = props.variant === 'destructive' 
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive/20' 
                    : props.variant === 'secondary' 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : props.variant === 'ghost'
                    ? 'bg-transparent hover:bg-accent hover:text-accent-foreground border-0'
                    : '';
                
                return React.createElement('button', {
                    className: `${baseClasses} ${variantClasses} ${props.className || ''}`,
                    ...props
                }, props.children);
            });

            const Card = components.Card || ((props) => 
                React.createElement('div', {
                    className: 'bg-background/50 rounded border',
                    ...props
                }, props.children)
            );

            const TrainIcon = icons.Train || (() => 
                React.createElement('span', { className: 'text-xl' }, '🚆')
            );

            // Fullscreen View Component
            function FullscreenView({ title, children, onBack }) {
                return React.createElement('div', {
                    className: 'absolute inset-0 w-full h-full overflow-auto bg-background'
                }, React.createElement('main', {
                    className: 'min-h-screen w-full px-4 md:px-8 lg:px-12 py-8 lg:py-12 overflow-y-auto'
                }, [
                    // Back button header
                    React.createElement('div', {
                        key: 'header',
                        className: 'w-full max-w-6xl mx-auto flex flex-col gap-6'
                    }, [
                        React.createElement('div', {
                            key: 'back-button',
                            className: 'w-full font-bold flex items-center justify-start bg-transparent text-primary cursor-pointer text-xl gap-1 overflow-visible whitespace-nowrap',
                            onClick: onBack
                        }, [
                            React.createElement('svg', {
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                xmlns: "http://www.w3.org/2000/svg",
                                className: 'h-5 transition-transform overflow-visible flex-shrink-0 w-fit -ml-px',
                                style: { transform: 'rotate(180deg)', transitionDuration: '75ms' }
                            }, [
                                React.createElement('path', {
                                    d: "M12 4L20 12L12 20",
                                    stroke: "currentColor",
                                    strokeWidth: "4",
                                    strokeLinecap: "butt",
                                    strokeLinejoin: "inherit"
                                }),
                                React.createElement('path', {
                                    d: "M4 12H18",
                                    stroke: "currentColor",
                                    strokeWidth: "4",
                                    strokeLinecap: "square",
                                    strokeLinejoin: "inherit"
                                })
                            ]),
                            React.createElement('p', { className: 'flex-shrink-0' }, 'Back')
                        ]),
                        
                        // Main content
                        React.createElement('div', {
                            key: 'content',
                            className: 'w-full flex flex-col gap-6 min-h-full pb-6'
                        }, [
                            React.createElement('h1', {
                                key: 'title',
                                className: 'text-2xl font-bold'
                            }, title),
                            children
                        ])
                    ])
                ]));
            }

            // Enable/Disable View Component - ORGANIZED BY CATEGORIES
			function EnableDisableView() {
				const [enabledTrains, setEnabledTrains] = React.useState(() => {
					const enabledSet = new Set(currentConfig.enabledTrains || []);
					
					Object.entries(REAL_TRAINS).forEach(([trainId, trainDef]) => {
						if (trainDef.isFixed) {
							enabledSet.add(trainId);
						}
					});
					
					if (currentConfig.customTrains) {
						Object.entries(currentConfig.customTrains).forEach(([trainId, trainDef]) => {
							if (trainDef.isFixed) {
								enabledSet.add(trainId);
							}
						});
					}
					
					return enabledSet;
				});
				const trainCategories = getTrainCategories();
				const [hoveredTrain, setHoveredTrain] = React.useState(null);
				const [hoverTimer, setHoverTimer] = React.useState(null);
				const [popupPosition, setPopupPosition] = React.useState({ x: 0, y: 0 });
				const popupRef = React.useRef(null);
				const hoveredTrainRef = React.useRef(null);
				
				// Cleanup timer on unmount
				React.useEffect(() => {
					return () => {
						if (hoverTimer) {
							clearTimeout(hoverTimer);
						}
					};
				}, [hoverTimer]);
				
				// Handle mouse enter on train item
				const handleMouseEnter = (trainId, train, e) => {
					// Clear any existing timer
					if (hoverTimer) {
						clearTimeout(hoverTimer);
					}
					
					// Store which train we're hovering
					hoveredTrainRef.current = { trainId, train };
					
					// Set position for popup (to the right of the train item)
					const rect = e.currentTarget.getBoundingClientRect();
					setPopupPosition({ 
						x: rect.right - 400, 
						y: rect.bottom 
					});
					
					// Start 1 second timer to show popup
					const timer = setTimeout(() => {
						if (hoveredTrainRef.current) {
							setHoveredTrain(hoveredTrainRef.current);
						}
					}, 1000);
					
					setHoverTimer(timer);
				};
				
				// Handle mouse leave from train item
				const handleMouseLeave = () => {
					// Clear timer
					if (hoverTimer) {
						clearTimeout(hoverTimer);
						setHoverTimer(null);
					}
					
					// Clear hover reference
					hoveredTrainRef.current = null;
					
					// Don't hide popup immediately if mouse is over popup
					setTimeout(() => {
						if (!popupRef.current || !popupRef.current.matches(':hover')) {
							setHoveredTrain(null);
						}
					}, 50);
				};
				
				// Handle mouse enter on popup
				const handlePopupMouseEnter = () => {
					// Clear any close timers
					if (hoverTimer) {
						clearTimeout(hoverTimer);
						setHoverTimer(null);
					}
				};
				
				// Handle mouse leave from popup
				const handlePopupMouseLeave = () => {
					// Small delay before hiding to prevent flicker
					const timer = setTimeout(() => {
						setHoveredTrain(null);
					}, 300);
					
					setHoverTimer(timer);
				};
							
				const deleteCustomTrain = (trainId, trainName) => {
					if (confirm(`Delete "${trainName}"? This action cannot be undone.`)) {
						// Remove from customTrains
						if (currentConfig.customTrains && currentConfig.customTrains[trainId]) {
							delete currentConfig.customTrains[trainId];
						}
						
						// Remove from enabledTrains
						currentConfig.enabledTrains = currentConfig.enabledTrains.filter(id => id !== trainId);
						
						// Save config
						saveConfig(currentConfig);
						
						// Update local state
						const nextEnabled = new Set(enabledTrains);
						nextEnabled.delete(trainId);
						setEnabledTrains(nextEnabled);
						
						showNotification(`Train "${trainName}" deleted`, 'success');
					}
				};
				
				// Train Stats Popup Component
				function TrainStatsPopup() {
					if (!hoveredTrain) return null;
					
					const { trainId, train } = hoveredTrain;
					const isCustom = trainId.startsWith('custom-');
					const isFixed = train.isFixed || false;
					const maxTrainLength = train.stats.carLength * train.stats.maxCars;
					
					return React.createElement('div', {
						ref: popupRef,
						className: 'fixed z-50 bg-popover text-popover-foreground rounded-lg border shadow-lg backdrop-blur-sm',
						style: {
							left: `${popupPosition.x}px`,
							top: `${popupPosition.y}px`,
							width: '360px',
							maxHeight: '80vh',
							overflowY: 'auto'
						},
						onMouseEnter: handlePopupMouseEnter,
						onMouseLeave: handlePopupMouseLeave
					}, [
						// Header with color and name
						React.createElement('div', {
							key: 'header',
							className: 'p-4 border-b flex items-center gap-3'
						}, [
							React.createElement('div', {
								className: 'w-8 h-8 rounded-full',
								style: { backgroundColor: train.appearance?.color || '#3b82f6' }
							}),
							React.createElement('div', { className: 'flex-1' }, [
								React.createElement('h3', { 
									className: 'font-bold text-lg'
								}, train.name),
								React.createElement('div', { 
									className: 'flex gap-2 mt-1'
								}, [
									isFixed && React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
									}, 'Fixed'),
									isCustom && !isFixed && React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
									}, 'Custom'),
									React.createElement('span', {
										className: 'px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full'
									}, train.allowAtGradeRoadCrossing ? 'Can Cross Roads' : 'No Road Crossing')
								])
							])
						]),
						
						// Description
						React.createElement('div', {
							key: 'description',
							className: 'p-4 border-b'
						}, [
							React.createElement('p', { 
								className: 'text-sm text-muted-foreground'
							}, train.description)
						]),
						
						// Stats Grid
						React.createElement('div', {
							key: 'stats',
							className: 'p-4 border-b'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Performance Stats'),
							
							React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, [
								// Column 1
								React.createElement('div', { key: 'col1', className: 'space-y-2' }, [
									createStatItem('Max Speed', `${train.stats.maxSpeed} m/s`),
									createStatItem('Station Speed', `${train.stats.maxSpeedLocalStation} m/s`),
									createStatItem('Acceleration', `${train.stats.maxAcceleration} m/s²`),
									createStatItem('Deceleration', `${train.stats.maxDeceleration} m/s²`),
									createStatItem('Capacity per Car', train.stats.capacityPerCar),
									createStatItem('Total Capacity', train.stats.capacityPerCar * train.stats.minCars)
								]),
								
								// Column 2
								React.createElement('div', { key: 'col2', className: 'space-y-2' }, [
									createStatItem('Car Length', `${train.stats.carLength} m`),
									createStatItem('Train Width', `${train.stats.trainWidth || 3.0} m`),
									createStatItem('Max Train Length', `${maxTrainLength} m`),
									createStatItem('Min Cars', train.stats.minCars),
									createStatItem('Max Cars', train.stats.maxCars),
									createStatItem('Cars per Set', train.stats.carsPerCarSet)
								])
							])
						]),
						
						// Costs
						React.createElement('div', {
							key: 'costs',
							className: 'p-4 border-b'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Costs'),
							
							React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, [
								createStatItem('Car Cost', `$${train.stats.carCost.toLocaleString()}`),
								createStatItem('Track Cost/m', `$${train.stats.baseTrackCost.toLocaleString()}`),
								createStatItem('Station Cost', `$${train.stats.baseStationCost.toLocaleString()}`),
								createStatItem('Scissors Crossover', `$${train.stats.scissorsCrossoverCost.toLocaleString()}`),
								createStatItem('Train Op. Cost/hr', `$${train.stats.trainOperationalCostPerHour}`),
								createStatItem('Car Op. Cost/hr', `$${train.stats.carOperationalCostPerHour}`)
							])
						]),
						
						// Elevation Multipliers
						React.createElement('div', {
							key: 'elevation',
							className: 'p-4'
						}, [
							React.createElement('h4', {
								className: 'font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground'
							}, 'Elevation Cost Multipliers'),
							
							React.createElement('div', { className: 'space-y-2' }, [
								createMultiplierItem('Deep Bore', train.elevationMultipliers?.DEEP_BORE || 2.0),
								createMultiplierItem('Standard Tunnel', train.elevationMultipliers?.STANDARD_TUNNEL || 1.5),
								createMultiplierItem('Cut & Cover', train.elevationMultipliers?.CUT_AND_COVER || 1.2),
								createMultiplierItem('At Grade', train.elevationMultipliers?.AT_GRADE || 1.0),
								createMultiplierItem('Elevated', train.elevationMultipliers?.ELEVATED || 1.0)
							])
						])
					]);
					
					// Helper function for stat items
					function createStatItem(label, value) {
						return React.createElement('div', { 
							key: label,
							className: 'flex justify-between items-center'
						}, [
							React.createElement('span', { 
								className: 'text-sm text-muted-foreground'
							}, label),
							React.createElement('span', { 
								className: 'text-sm font-medium font-mono'
							}, value)
						]);
					}
					
					// Helper function for multiplier items
					function createMultiplierItem(label, value) {
						return React.createElement('div', { 
							key: label,
							className: 'flex justify-between items-center'
						}, [
							React.createElement('span', { 
								className: 'text-sm text-muted-foreground'
							}, label),
							React.createElement('span', { 
								className: 'text-sm font-medium font-mono bg-primary/10 text-primary px-2 py-1 rounded'
							}, `${value.toFixed(1)}x`)
						]);
					}
				}

				const toggleTrain = (trainId) => {
					// Check if train is fixed
					const train = REAL_TRAINS[trainId] || (currentConfig.customTrains && currentConfig.customTrains[trainId]);
					if (train && train.isFixed) {
						// Fixed trains can not be toggled off
						return;
					}
					
					const next = new Set(enabledTrains);
					if (next.has(trainId)) {
						next.delete(trainId);
					} else {
						next.add(trainId);
					}
					setEnabledTrains(next);
					currentConfig.enabledTrains = Array.from(next);
					saveConfig(currentConfig);
				};

				const handleApply = () => {
					const valid = registerTrainsToGame();
					if (valid) {
						showNotification('Train settings applied successfully!', 'success');
					}
					setIsOpen(false);
				};

				const renderTrainItem = (trainId, train) => {
					const isCustom = trainId.startsWith('custom-');
					const isFixed = train.isFixed || false;
					const isEnabled = enabledTrains.has(trainId);
					const totalCapacity = train.stats.capacityPerCar * train.stats.minCars;
					
					return React.createElement('div', {
						key: trainId,
						className: `px-4 py-3 bg-background/50 rounded border flex justify-between items-center ${isFixed ? '' : 'cursor-pointer hover:bg-accent/50'} transition-colors group relative`,
						onClick: isFixed ? undefined : () => toggleTrain(trainId),
						onMouseEnter: (e) => handleMouseEnter(trainId, train, e),
						onMouseLeave: handleMouseLeave,
						'data-train-id': trainId
					}, [
						React.createElement('div', { key: 'info', className: 'flex-1' }, [
							React.createElement('div', { 
								className: 'font-medium flex items-center gap-2' 
							}, [
								React.createElement('div', {
									key: 'color-indicator',
									className: 'w-3 h-3 rounded-full',
									style: { backgroundColor: train.appearance?.color || '#3b82f6' }
								}),
								train.name,
								isFixed && React.createElement('span', {
									className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
								}, 'Fixed'),
								isCustom && !isFixed && React.createElement('span', {
									className: 'px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full'
								}, 'Custom')
							]),
							React.createElement('div', { 
								className: 'text-sm text-muted-foreground line-clamp-2 mt-1' 
							}, train.description),
							React.createElement('div', { 
								className: 'text-xs text-muted-foreground mt-1 flex gap-3' 
							}, [
								React.createElement('span', {}, `Capacity: ${totalCapacity}`),
								React.createElement('span', {}, `Speed: ${train.stats.maxSpeed} m/s`),
								React.createElement('span', {}, `Cars: ${train.stats.minCars}-${train.stats.maxCars}`)
							])
						]),
						React.createElement('div', { className: 'flex items-center gap-2' }, [
							isCustom && !isFixed && React.createElement('button', {
								onClick: (e) => {
									e.stopPropagation();
									deleteCustomTrain(trainId, train.name);
								},
								className: 'p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity',
								title: 'Delete train'
							}, '🗑️'),
							React.createElement('label', {
								className: `relative inline-flex items-center ${isFixed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`
							}, [
								React.createElement('input', {
									type: 'checkbox',
									className: 'sr-only',
									checked: isEnabled,
									readOnly: true,
									disabled: isFixed
								}),
								React.createElement('div', {
									className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${isEnabled ? 'bg-primary' : 'bg-input'} ${isFixed ? 'cursor-not-allowed' : ''}`
								}),
								React.createElement('div', {
									className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'} ${isFixed ? 'cursor-not-allowed' : ''}`
								})
							])
						])
					]);
				};

				const renderCategory = (categoryName, trains, description = '') => {
					if (trains.length === 0) return null;
					
					return React.createElement('div', { key: categoryName, className: 'space-y-2' }, [
						React.createElement('h2', {
							className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'
						}, [
							categoryName,
							React.createElement('span', { className: 'text-xs font-normal bg-muted px-2 py-0.5 rounded' }, 
								`${trains.length} type${trains.length !== 1 ? 's' : ''}`
							)
						]),
						description && React.createElement('p', { 
							className: 'text-sm text-muted-foreground -mt-1' 
						}, description),
						React.createElement('div', { className: 'space-y-2' },
							trains.map(([trainId, train]) => renderTrainItem(trainId, train))
						)
					]);
				};

				return React.createElement(FullscreenView, {
					title: 'Enable / Disable Trains',
					onBack: () => setActiveView(null)
				}, React.createElement(React.Fragment, null, [
					React.createElement('div', { key: 'main-content', className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
						// Left column
						React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
							// Fixed trains section
							renderCategory(
								"Fixed Standard Trains",
								trainCategories["Fixed Standard Trains"],
								"Always enabled, cannot be disabled"
							),

							// Heavy Metro Types
							renderCategory(
								"Heavy Metro Types",
								trainCategories["Heavy Metro Types"],
								"High capacity transit for urban corridors"
							),

							// Light Metro Types
							renderCategory(
								"Light Metro Types", 
								trainCategories["Light Metro Types"],
								"Lighter capacity for flexible urban transit"
							)
						]),

						// Right column
						React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
							// Tram Types
							renderCategory(
								"Tram Types",
								trainCategories["Tram Types"],
								"Street-running and at-grade crossing capable"
							),

							// Regional Types
							renderCategory(
								"Regional Types",
								trainCategories["Regional Types"],
								"Commuter rail and regional services"
							),

							// Actions
							React.createElement('div', {
								key: 'actions',
								className: 'space-y-2 mt-auto'
							}, [
								React.createElement('div', {
									className: 'flex gap-2 pt-4 border-t'
								}, [
									React.createElement(Button, {
										onClick: () => setActiveView(null),
										variant: 'secondary',
										className: 'flex-1'
									}, 'Back'),
									React.createElement(Button, {
										onClick: handleApply,
										className: 'flex-1'
									}, 'Apply Changes')
								])
							])
						])
					]),
					// Train Stats Popup
					React.createElement(TrainStatsPopup, { key: 'popup' })
				]));
			}

            // Edit Train View Component
            function EditTrainView() {
                const [selectedTrainId, setSelectedTrainId] = React.useState(Object.keys(REAL_TRAINS)[0]);
                const [trainData, setTrainData] = React.useState({});
                const [showApply, setShowApply] = React.useState(true);
                const [isCustomTrain, setIsCustomTrain] = React.useState(false);
                
                const handleDelete = () => {
                    if (confirm(`Are you sure you want to delete "${trainData.name}"? This action cannot be undone.`)) {
                        // Remove from customTrains
                        if (currentConfig.customTrains && currentConfig.customTrains[selectedTrainId]) {
                            delete currentConfig.customTrains[selectedTrainId];
                        }
                        
                        // Remove from enabledTrains
                        currentConfig.enabledTrains = currentConfig.enabledTrains.filter(id => id !== selectedTrainId);
                        
                        // Save config
                        saveConfig(currentConfig);
                        
                        // Reset to first available train
                        const availableTrains = Object.keys({ ...REAL_TRAINS, ...currentConfig.customTrains });
                        if (availableTrains.length > 0) {
                            setSelectedTrainId(availableTrains[0]);
                            const nextTrain = currentConfig.customTrains?.[availableTrains[0]] || REAL_TRAINS[availableTrains[0]];
                            setTrainData(deepClone(nextTrain));
                            setIsCustomTrain(availableTrains[0].startsWith('custom-'));
                        } else {
                            setSelectedTrainId('');
                            setTrainData({});
                            setIsCustomTrain(false);
                        }
                        
                        showNotification(`Train "${trainData.name}" deleted`, 'success');
                    }
                };
				
				React.useEffect(() => {
					const handleMouseMove = (e) => {
						if (hoveredTrain) {
							setPopupPosition({ x: e.clientX + 15, y: e.clientY - 50 });
						}
					};
					
					window.addEventListener('mousemove', handleMouseMove);
					return () => window.removeEventListener('mousemove', handleMouseMove);
				}, [hoveredTrain]);
				
                React.useEffect(() => {
                    const train = currentConfig.customTrains?.[selectedTrainId] || REAL_TRAINS[selectedTrainId];
                    if (train) {
                        setTrainData(deepClone(train));
                        setIsCustomTrain(selectedTrainId.startsWith('custom-'));
                        // Validate length on load
                        validateLength(train);
                    }
                }, [selectedTrainId]);

                const validateLength = (train) => {
                    if (!train.stats) {
                        setShowApply(true);
                        return;
                    }
                    
                    const maxTrainLength = train.stats.carLength * train.stats.maxCars;
                    const minRequiredLength = train.stats.minStationLength;
                    const isValid = maxTrainLength <= (minRequiredLength - 2);
                    setShowApply(isValid);
                    
                    if (!isValid) {
                        showNotification(
                            `Warning: Train is too long! Minimum station length must be at least ${maxTrainLength + 2}m`,
                            'warning'
                        );
                    }
                };

                const updateStat = (statKey, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.stats) newData.stats = {};
                        
                        // Handle different value types
                        if (typeof value === 'string') {
                            // Convert to number if it looks like a number
                            if (!isNaN(value) && value.trim() !== '') {
                                value = statKey.includes('Speed') || statKey.includes('Acceleration') || statKey.includes('Deceleration') 
                                    ? parseFloat(value) 
                                    : parseInt(value);
                            }
                        }
                        
                        newData.stats[statKey] = value;
                        
                        // Validate length when relevant stats change
                        if (['carLength', 'maxCars', 'minStationLength'].includes(statKey)) {
                            validateLength(newData);
                        }
                        
                        return newData;
                    });
                };

                const updateField = (field, value) => {
                    setTrainData(prev => ({ ...prev, [field]: value }));
                };
                
                const updateAppearance = (field, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.appearance) newData.appearance = {};
                        newData.appearance[field] = value;
                        return newData;
                    });
                };
                
                const updateElevationMultiplier = (elevationType, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.elevationMultipliers) newData.elevationMultipliers = {};
                        newData.elevationMultipliers[elevationType] = parseFloat(value);
                        return newData;
                    });
                };

                const handleSave = () => {
                    if (!validateTrainLength(trainData)) {
                        return;
                    }

                    if (!currentConfig.customTrains) {
                        currentConfig.customTrains = {};
                    }
                    currentConfig.customTrains[selectedTrainId] = deepClone(trainData);
                    
                    if (!currentConfig.enabledTrains.includes(selectedTrainId)) {
                        currentConfig.enabledTrains.push(selectedTrainId);
                    }
                    
                    saveConfig(currentConfig);
                    showNotification('Train changes saved!', 'success');
                };

                const handleReset = () => {
                    if (confirm('Reset to default values? This will remove any customizations.')) {
                        if (currentConfig.customTrains && currentConfig.customTrains[selectedTrainId]) {
                            delete currentConfig.customTrains[selectedTrainId];
                            saveConfig(currentConfig);
                            
                            const defaultTrain = REAL_TRAINS[selectedTrainId];
                            if (defaultTrain) {
                                setTrainData(deepClone(defaultTrain));
                            }
                            showNotification('Train reset to defaults!', 'success');
                        }
                    }
                };

                const handleApply = () => {
                    handleSave();
                    registerTrainsToGame();
                };

                // Calculate max train length for validation message
                const maxTrainLength = trainData.stats?.carLength * trainData.stats?.maxCars || 0;
                const minStationLength = trainData.stats?.minStationLength || 0;
                const isValidLength = maxTrainLength <= (minStationLength - 2);
                // Check if train name has content for validation message
                const isValidName = trainData.name && trainData.name.trim().length > 0; 
                
                // Helper function for slider components
                const createStatSlider = (label, statKey, min, max, step, unit = '') => {
                    const value = trainData.stats?.[statKey] || min;
                    const displayValue = `${value}${unit}`;
                    
                    return React.createElement('div', { key: statKey, className: 'mb-4' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateStat(statKey, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                const createElevationSlider = (label, elevationType, min, max, step) => {
                    const value = trainData.elevationMultipliers?.[elevationType] || min;
                    const displayValue = `${value.toFixed(1)}x`;
                    
                    return React.createElement('div', { key: elevationType, className: 'mb-3' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateElevationMultiplier(elevationType, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                // Get all available trains including custom ones
                const allAvailableTrains = { ...REAL_TRAINS, ...currentConfig.customTrains };

                return React.createElement(FullscreenView, {
                    title: 'Edit Train Statistics',
                    onBack: () => setActiveView(null)
                }, React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    // Left column - Basic settings and selection
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        // Train selection
                        React.createElement('div', { key: 'select', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Select Train'),
                            React.createElement('div', { className: 'px-4 py-3 bg-background/50 rounded border' }, 
                                React.createElement('div', { className: 'flex flex-col gap-2' }, [
                                    React.createElement('label', {
                                        className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    }, 'Train Type'),
                                    React.createElement('button', {
                                        type: 'button',
                                        role: 'combobox',
                                        className: 'backdrop-blur-sm border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 w-full',
                                        onClick: () => {
                                            // Create dropdown menu
                                            const dropdown = document.createElement('div');
                                            dropdown.className = 'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md';
                                            dropdown.style.position = 'absolute';
                                            dropdown.style.width = '300px';
                                            
                                            Object.entries(allAvailableTrains).forEach(([id, train]) => {
                                                const item = document.createElement('div');
                                                item.className = 'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground';
                                                item.textContent = train.isFixed ? train.name : id.startsWith('custom-') ? `${train.name} (Custom)` : train.name;
                                                item.onclick = () => {
                                                    setSelectedTrainId(id);
                                                    dropdown.remove();
                                                };
                                                dropdown.appendChild(item);
                                            });
                                            
                                            const trigger = document.activeElement;
                                            const rect = trigger.getBoundingClientRect();
                                            dropdown.style.left = `${rect.left}px`;
                                            dropdown.style.top = `${rect.bottom}px`;
                                            document.body.appendChild(dropdown);
                                            
                                            // Close on click outside
                                            const closeDropdown = (e) => {
                                                if (!dropdown.contains(e.target) && e.target !== trigger) {
                                                    dropdown.remove();
                                                    document.removeEventListener('click', closeDropdown);
                                                }
                                            };
                                            setTimeout(() => document.addEventListener('click', closeDropdown), 0);
                                        }
                                    }, [
                                        React.createElement('span', {
                                            key: 'value',
                                            style: { pointerEvents: 'none' }
                                        }, trainData.name || 'Select a train'),
                                        React.createElement('svg', {
                                            key: 'icon',
                                            xmlns: "http://www.w3.org/2000/svg",
                                            width: "24",
                                            height: "24",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            className: "lucide lucide-chevron-down size-4 opacity-50",
                                            "aria-hidden": "true"
                                        }, React.createElement('path', { d: "m6 9 6 6 6-6" }))
                                    ])
                                ])
                            )
                        ]),

                        // Validation warning
                        !isValidLength && React.createElement('div', {
                            key: 'warning',
                            className: 'p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-3'
                        }, [
                            React.createElement('div', {
                                className: 'w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center shrink-0'
                            }, React.createElement('svg', {
                                xmlns: "http://www.w3.org/2000/svg",
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "lucide lucide-triangle-alert w-5 h-5 text-destructive"
                            }, [
                                React.createElement('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
                                React.createElement('path', { d: "M12 9v4" }),
                                React.createElement('path', { d: "M12 17h.01" })
                            ])),
                            React.createElement('div', { className: 'flex-1' }, [
                                React.createElement('div', { 
                                    className: 'font-medium text-destructive' 
                                }, 'Train Length Warning'),
                                React.createElement('div', { 
                                    className: 'text-sm text-muted-foreground mt-1' 
                                }, `Maximum train length (${maxTrainLength}m) must be at least 2m less than minimum station length (${minStationLength}m).`),
                                React.createElement('div', { 
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: minStationLength > ${maxTrainLength + 2}m`)
                            ])
                        ]),

                        // Length summary
                        React.createElement('div', {
                            key: 'length-summary',
                            className: 'p-4 bg-primary/5 border border-primary/20 rounded'
                        }, [
                            React.createElement('div', { 
                                className: 'text-sm font-medium text-primary mb-1' 
                            }, 'Length Summary'),
                            React.createElement('div', { 
                                className: 'text-xs text-muted-foreground grid grid-cols-2 gap-2' 
                            }, [
                                React.createElement('div', { key: 'train' }, `Max Train Length: ${maxTrainLength}m`),
                                React.createElement('div', { key: 'station' }, `Min Station: ${minStationLength}m`),
                                React.createElement('div', { key: 'status' }, `Status: ${isValidLength ? '✅ Valid' : '❌ Invalid'}`)
                            ])
                        ]),

                        // BASIC INFORMATION SECTION
                        React.createElement('div', { key: 'basic-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Basic Information'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    // Name and Description
                                    React.createElement('div', { key: 'name-desc', className: 'grid grid-cols-1 gap-4' }, [
                                        React.createElement('div', { key: 'name' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Name'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: trainData.name || '',
                                                onChange: (e) => updateField('name', e.target.value),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'desc' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Description'),
                                            React.createElement('textarea', {
                                                value: trainData.description || '',
                                                onChange: (e) => updateField('description', e.target.value),
                                                rows: 2,
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Color and Road Crossing
                                    React.createElement('div', { key: 'color-crossing', className: 'grid grid-cols-2 gap-4' }, [
                                        React.createElement('div', { key: 'color' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Color'),
                                            React.createElement('div', { className: 'flex items-center gap-3' }, [
                                                React.createElement('input', {
                                                    type: 'color',
                                                    value: trainData.appearance?.color || '#3b82f6',
                                                    onChange: (e) => updateAppearance('color', e.target.value),
                                                    className: 'w-10 h-10 cursor-pointer rounded border border-input'
                                                }),
                                                React.createElement('span', { 
                                                    className: 'text-sm font-mono text-muted-foreground' 
                                                }, trainData.appearance?.color || '#3b82f6')
                                            ])
                                        ]),
                                        
                                        React.createElement('div', { key: 'crossing' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Road Crossing'),
                                            React.createElement('div', { 
                                                className: 'flex items-center h-10 mt-2'
                                            }, [
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    id: 'road-crossing',
                                                    checked: trainData.allowAtGradeRoadCrossing || false,
                                                    onChange: (e) => updateField('allowAtGradeRoadCrossing', e.target.checked),
                                                    className: 'sr-only peer'
                                                }),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing',
                                                    className: 'relative inline-flex items-center cursor-pointer'
                                                }, [
                                                    React.createElement('div', {
                                                        className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${trainData.allowAtGradeRoadCrossing ? 'bg-primary' : 'bg-input'}`
                                                    }),
                                                    React.createElement('div', {
                                                        className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${trainData.allowAtGradeRoadCrossing ? 'translate-x-5' : 'translate-x-0'}`
                                                    })
                                                ]),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing',
                                                    className: 'ml-2 text-sm text-muted-foreground'
                                                }, 'Allow at-grade road crossing')
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ]),

                    // Right column - All other settings
                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        // PERFORMANCE SECTION
                        React.createElement('div', { key: 'performance-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Performance'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    createStatSlider('Max Speed', 'maxSpeed', 5, 100, 0.1, ' m/s'),
                                    createStatSlider('Station Speed', 'maxSpeedLocalStation', 1, 30, 0.1, ' m/s'),
                                    createStatSlider('Acceleration', 'maxAcceleration', 0.1, 3, 0.1, ' m/s²'),
                                    createStatSlider('Deceleration', 'maxDeceleration', 0.1, 3, 0.1, ' m/s²')
                                ])
                            ])
                        ]),

                        // CAPACITY & SIZE SECTION
                        React.createElement('div', { key: 'capacity-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Capacity & Size'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    // Left column
                                    React.createElement('div', { key: 'left', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'capacity' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Capacity per Car'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 10,
                                                max: 1000,
                                                value: trainData.stats?.capacityPerCar || 150,
                                                onChange: (e) => updateStat('capacityPerCar', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'car-length' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Car Length (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 5,
                                                max: 50,
                                                step: '0.5',
                                                value: trainData.stats?.carLength || 20,
                                                onChange: (e) => updateStat('carLength', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'train-width' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Width (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 5,
                                                step: '0.05',
                                                value: trainData.stats?.trainWidth || 3.0,
                                                onChange: (e) => updateStat('trainWidth', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Right column
                                    React.createElement('div', { key: 'right', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'min-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Minimum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.minCars || 2,
                                                onChange: (e) => updateStat('minCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'max-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Maximum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.maxCars || 6,
                                                onChange: (e) => updateStat('maxCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'cars-per-set' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Cars per Set'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 10,
                                                value: trainData.stats?.carsPerCarSet || 2,
                                                onChange: (e) => updateStat('carsPerCarSet', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ])
                                ])
                            ])
                        ]),

                        // STATION SECTION
                        React.createElement('div', { key: 'station-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Station Requirements'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'min-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Minimum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 20,
                                            max: 500,
                                            value: trainData.stats?.minStationLength || 100,
                                            onChange: (e) => updateStat('minStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'max-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Maximum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 30,
                                            max: 600,
                                            value: trainData.stats?.maxStationLength || 150,
                                            onChange: (e) => updateStat('maxStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // COSTS SECTION
                        React.createElement('div', { key: 'costs-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Costs ($)'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'car-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100000,
                                            max: 10000000,
                                            step: '10000',
                                            value: trainData.stats?.carCost || 2000000,
                                            onChange: (e) => updateStat('carCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'track-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Cost per meter'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000,
                                            max: 200000,
                                            step: '1000',
                                            value: trainData.stats?.baseTrackCost || 35000,
                                            onChange: (e) => updateStat('baseTrackCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'station-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Station Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 500000000,
                                            step: '100000',
                                            value: trainData.stats?.baseStationCost || 50000000,
                                            onChange: (e) => updateStat('baseStationCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'scissors-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Scissors Crossover Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 50000000,
                                            step: '100000',
                                            value: trainData.stats?.scissorsCrossoverCost || 10000000,
                                            onChange: (e) => updateStat('scissorsCrossoverCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'train-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Train Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.trainOperationalCostPerHour || 300,
                                            onChange: (e) => updateStat('trainOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'car-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 5,
                                            max: 500,
                                            step: '5',
                                            value: trainData.stats?.carOperationalCostPerHour || 30,
                                            onChange: (e) => updateStat('carOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // ELEVATION MULTIPLIERS SECTION
                        React.createElement('div', { key: 'elevation-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Elevation Cost Multipliers'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-3' }, [
                                    createElevationSlider('Deep Bore', 'DEEP_BORE', 1.0, 5.0, 0.1),
                                    createElevationSlider('Standard Tunnel', 'STANDARD_TUNNEL', 1.0, 4.0, 0.1),
                                    createElevationSlider('Cut & Cover', 'CUT_AND_COVER', 1.0, 3.0, 0.1),
                                    createElevationSlider('At Grade', 'AT_GRADE', 0.1, 2.0, 0.1),
                                    createElevationSlider('Elevated', 'ELEVATED', 1.0, 3.0, 0.1)
                                ])
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement('div', {
                                className: 'flex justify-between items-center text-sm text-muted-foreground'
                            }, [
                                React.createElement('span', {}, isCustomTrain ? '✎ Custom Train' : 'Default Train'),
                                !showApply && React.createElement('div', {
                                    className: 'flex items-center gap-2 text-destructive'
                                }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-alert-circle"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('line', { x1: "12", x2: "12", y1: "8", y2: "12" }),
                                        React.createElement('line', { x1: "12", x2: "12.01", y1: "16", y2: "16" })
                                    ]),
                                    'Fix length issue to apply'
                                ])
                            ]),
                            React.createElement('div', {
                                className: 'flex gap-2 pt-4 border-t'
                            }, [
                                React.createElement(Button, {
                                    onClick: handleReset,
                                    variant: 'secondary',
                                    className: 'flex-1'
                                }, 'Reset to Default'),
                                
                                isCustomTrain && React.createElement(Button, {
                                    onClick: handleDelete,
                                    variant: 'destructive',
                                    className: 'flex-1'
                                }, 'Delete Train'),
                                
                                showApply && React.createElement(Button, {
                                    onClick: handleApply,
                                    className: 'flex-1'
                                }, 'Save & Apply')
                            ])
                        ])
                    ])
                ]));
            }

            // Create Train View Component - UPDATED WITH VALIDATION
            function CreateTrainView() {
                const [trainData, setTrainData] = React.useState({
                    name: '',
                    description: 'Custom train type',
                    allowAtGradeRoadCrossing: false,
                    stats: {
                        maxAcceleration: 1.0,
                        maxDeceleration: 1.0,
                        maxSpeed: 20.0,
                        maxSpeedLocalStation: 10.0,
                        capacityPerCar: 150,
                        carLength: 20,
                        minCars: 2,
                        maxCars: 6,
                        carsPerCarSet: 2,
                        carCost: 2000000,
                        trainWidth: 3.0,
                        minStationLength: 100,
                        maxStationLength: 150,
                        baseTrackCost: 35000,
                        baseStationCost: 50000000,
                        trainOperationalCostPerHour: 300,
                        carOperationalCostPerHour: 30,
                        scissorsCrossoverCost: 10000000
                    },
                    elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
                    appearance: { color: '#7c3aed' }
                });
                
                // Validation constants
                const maxTrainLength = trainData.stats?.carLength * trainData.stats?.maxCars || 0;
                const minStationLength = trainData.stats?.minStationLength || 0;
                const isValidLength = maxTrainLength <= (minStationLength - 2);
                const isValidName = trainData.name && trainData.name.trim().length > 0;
                const showApply = isValidName && isValidLength;

                // Update functions
                const updateStat = (statKey, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.stats) newData.stats = {};
                        
                        if (typeof value === 'string') {
                            if (!isNaN(value) && value.trim() !== '') {
                                value = statKey.includes('Speed') || statKey.includes('Acceleration') || statKey.includes('Deceleration') 
                                    ? parseFloat(value) 
                                    : parseInt(value);
                            }
                        }
                        
                        newData.stats[statKey] = value;
                        return newData;
                    });
                };

                const updateField = (field, value) => {
                    setTrainData(prev => ({ ...prev, [field]: value }));
                };
                
                const updateAppearance = (field, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.appearance) newData.appearance = {};
                        newData.appearance[field] = value;
                        return newData;
                    });
                };
                
                const updateElevationMultiplier = (elevationType, value) => {
                    setTrainData(prev => {
                        const newData = deepClone(prev);
                        if (!newData.elevationMultipliers) newData.elevationMultipliers = {};
                        newData.elevationMultipliers[elevationType] = parseFloat(value);
                        return newData;
                    });
                };

                const handleCreate = () => {
                    if (!isValidName) {
                        showNotification('Please enter a train name', 'error');
                        return;
                    }

                    if (!validateTrainLength(trainData)) {
                        return;
                    }

                    const trainId = createCustomTrain(trainData.name, trainData.description, trainData.appearance.color);
                    
                    // Save custom stats
                    if (!currentConfig.customTrains) {
                        currentConfig.customTrains = {};
                    }
                    currentConfig.customTrains[trainId] = {
                        ...trainData,
                        id: trainId,
                        compatibleTrackTypes: [trainId],
                        isFixed: false
                    };
                    saveConfig(currentConfig);
                    
                    showNotification(`Custom train "${trainData.name}" created!`, 'success');
                    
                    // Switch to edit view with new train selected
                    setActiveView('edit');
                };
                
                // Helper function for slider components
                const createStatSlider = (label, statKey, min, max, step, unit = '') => {
                    const value = trainData.stats?.[statKey] || min;
                    const displayValue = `${value}${unit}`;
                    
                    return React.createElement('div', { key: statKey, className: 'mb-4' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateStat(statKey, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                const createElevationSlider = (label, elevationType, min, max, step) => {
                    const value = trainData.elevationMultipliers?.[elevationType] || min;
                    const displayValue = `${value.toFixed(1)}x`;
                    
                    return React.createElement('div', { key: elevationType, className: 'mb-3' }, [
                        React.createElement('div', {
                            key: 'label-row',
                            className: 'flex justify-between items-center mb-2'
                        }, [
                            React.createElement('label', {
                                className: 'text-sm font-medium'
                            }, label),
                            React.createElement('span', {
                                className: 'text-sm font-mono font-semibold text-primary'
                            }, displayValue)
                        ]),
                        React.createElement('input', {
                            type: 'range',
                            min: min,
                            max: max,
                            step: step,
                            value: value,
                            onChange: (e) => updateElevationMultiplier(elevationType, parseFloat(e.target.value)),
                            className: 'w-full h-2 bg-input rounded-lg appearance-none cursor-pointer',
                            style: {
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
                                WebkitAppearance: 'none',
                                height: '8px',
                                borderRadius: '4px'
                            }
                        })
                    ]);
                };

                return React.createElement(FullscreenView, {
                    title: 'Create Custom Train',
                    onBack: () => setActiveView(null)
                }, React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    // Left column - Basic settings
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        // Validation warning
                        (!isValidLength || !isValidName) && React.createElement('div', {
                            key: 'warning',
                            className: 'p-4 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-3 mb-4'
                        }, [
                            React.createElement('div', {
                                className: 'w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center shrink-0'
                            }, React.createElement('svg', {
                                xmlns: "http://www.w3.org/2000/svg",
                                width: "24",
                                height: "24",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "lucide lucide-triangle-alert w-5 h-5 text-destructive"
                            }, [
                                React.createElement('path', { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
                                React.createElement('path', { d: "M12 9v4" }),
                                React.createElement('path', { d: "M12 17h.01" })
                            ])),
                            React.createElement('div', { className: 'flex-1' }, [
                                React.createElement('div', { 
                                    className: 'font-medium text-destructive' 
                                }, !isValidLength && !isValidName ? 'Validation Issues' : 
                                   !isValidName ? 'Name Required' : 'Train Length Warning'),
                                !isValidLength && React.createElement('div', { 
                                    className: 'text-sm text-muted-foreground mt-1' 
                                }, `Maximum train length (${maxTrainLength}m) must be at least 2m less than minimum station length (${minStationLength}m).`),
                                !isValidLength && React.createElement('div', { 
                                    key: 'length-requirement',
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: minStationLength > ${maxTrainLength + 2}m`),
                                !isValidName && React.createElement('div', { 
                                    key: 'name-requirement',
                                    className: 'text-sm font-mono text-destructive mt-1' 
                                }, `Required: Enter a train name`)
                            ])
                        ]),

                        // Validation summary
                        React.createElement('div', {
                            key: 'length-summary',
                            className: 'p-4 bg-primary/5 border border-primary/20 rounded'
                        }, [
                            React.createElement('div', { 
                                className: 'text-sm font-medium text-primary mb-1' 
                            }, 'Validation Summary'),
                            React.createElement('div', { 
                                className: 'text-xs text-muted-foreground grid grid-cols-2 gap-2' 
                            }, [
                                React.createElement('div', { key: 'train' }, `Max Train Length: ${maxTrainLength}m`),
                                React.createElement('div', { key: 'station' }, `Min Station: ${minStationLength}m`),
                                React.createElement('div', { key: 'name' }, `Name: ${isValidName ? '✅ Provided' : '❌ Missing'}`),
                                React.createElement('div', { key: 'status' }, `Status: ${isValidLength && isValidName ? '✅ Valid' : '❌ Invalid'}`)
                            ])
                        ]),

                        // BASIC INFORMATION SECTION
                        React.createElement('div', { key: 'basic-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Basic Information'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    // Name and Description
                                    React.createElement('div', { key: 'name-desc', className: 'grid grid-cols-1 gap-4' }, [
                                        React.createElement('div', { key: 'name' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Name *'),
                                            React.createElement('input', {
                                                type: 'text',
                                                value: trainData.name || '',
                                                onChange: (e) => updateField('name', e.target.value),
                                                placeholder: 'e.g., Express Shuttle, Mountain Train',
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'desc' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Description'),
                                            React.createElement('textarea', {
                                                value: trainData.description || '',
                                                onChange: (e) => updateField('description', e.target.value),
                                                placeholder: 'Describe your custom train type...',
                                                rows: 2,
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Color and Road Crossing
                                    React.createElement('div', { key: 'color-crossing', className: 'grid grid-cols-2 gap-4' }, [
                                        React.createElement('div', { key: 'color' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Color'),
                                            React.createElement('div', { className: 'flex items-center gap-3' }, [
                                                React.createElement('input', {
                                                    type: 'color',
                                                    value: trainData.appearance?.color || '#7c3aed',
                                                    onChange: (e) => updateAppearance('color', e.target.value),
                                                    className: 'w-10 h-10 cursor-pointer rounded border border-input'
                                                }),
                                                React.createElement('span', { 
                                                    className: 'text-sm font-mono text-muted-foreground' 
                                                }, trainData.appearance?.color || '#7c3aed')
                                            ])
                                        ]),
                                        
                                        React.createElement('div', { key: 'crossing' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Road Crossing'),
                                            React.createElement('div', { 
                                                className: 'flex items-center h-10 mt-2'
                                            }, [
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    id: 'road-crossing-create',
                                                    checked: trainData.allowAtGradeRoadCrossing || false,
                                                    onChange: (e) => updateField('allowAtGradeRoadCrossing', e.target.checked),
                                                    className: 'sr-only peer'
                                                }),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing-create',
                                                    className: 'relative inline-flex items-center cursor-pointer'
                                                }, [
                                                    React.createElement('div', {
                                                        className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${trainData.allowAtGradeRoadCrossing ? 'bg-primary' : 'bg-input'}`
                                                    }),
                                                    React.createElement('div', {
                                                        className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${trainData.allowAtGradeRoadCrossing ? 'translate-x-5' : 'translate-x-0'}`
                                                    })
                                                ]),
                                                React.createElement('label', {
                                                    htmlFor: 'road-crossing-create',
                                                    className: 'ml-2 text-sm text-muted-foreground'
                                                }, 'Allow at-grade road crossing')
                                            ])
                                        ])
                                    ])
                                ])
                            ])
                        ])
                    ]),

                    // Right column - All other settings
                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        // PERFORMANCE SECTION
                        React.createElement('div', { key: 'performance-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Performance'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-4' }, [
                                    createStatSlider('Max Speed', 'maxSpeed', 5, 100, 0.1, ' m/s'),
                                    createStatSlider('Station Speed', 'maxSpeedLocalStation', 1, 30, 0.1, ' m/s'),
                                    createStatSlider('Acceleration', 'maxAcceleration', 0.1, 3, 0.1, ' m/s²'),
                                    createStatSlider('Deceleration', 'maxDeceleration', 0.1, 3, 0.1, ' m/s²')
                                ])
                            ])
                        ]),

                        // CAPACITY & SIZE SECTION
                        React.createElement('div', { key: 'capacity-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Capacity & Size'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    // Left column
                                    React.createElement('div', { key: 'left', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'capacity' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Capacity per Car'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 10,
                                                max: 1000,
                                                value: trainData.stats?.capacityPerCar || 150,
                                                onChange: (e) => updateStat('capacityPerCar', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'car-length' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Car Length (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 5,
                                                max: 50,
                                                step: '0.5',
                                                value: trainData.stats?.carLength || 20,
                                                onChange: (e) => updateStat('carLength', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'train-width' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Train Width (m)'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 5,
                                                step: '0.05',
                                                value: trainData.stats?.trainWidth || 3.0,
                                                onChange: (e) => updateStat('trainWidth', parseFloat(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ]),

                                    // Right column
                                    React.createElement('div', { key: 'right', className: 'space-y-4' }, [
                                        React.createElement('div', { key: 'min-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Minimum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.minCars || 2,
                                                onChange: (e) => updateStat('minCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'max-cars' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Maximum Cars'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 20,
                                                value: trainData.stats?.maxCars || 6,
                                                onChange: (e) => updateStat('maxCars', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ]),
                                        
                                        React.createElement('div', { key: 'cars-per-set' }, [
                                            React.createElement('label', {
                                                className: 'block text-sm font-medium mb-1'
                                            }, 'Cars per Set'),
                                            React.createElement('input', {
                                                type: 'number',
                                                min: 1,
                                                max: 10,
                                                value: trainData.stats?.carsPerCarSet || 2,
                                                onChange: (e) => updateStat('carsPerCarSet', parseInt(e.target.value)),
                                                className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                            })
                                        ])
                                    ])
                                ])
                            ])
                        ]),

                        // STATION SECTION
                        React.createElement('div', { key: 'station-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Station Requirements'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'min-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Minimum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 20,
                                            max: 500,
                                            value: trainData.stats?.minStationLength || 100,
                                            onChange: (e) => updateStat('minStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'max-length' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Maximum Station Length (m)'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 30,
                                            max: 600,
                                            value: trainData.stats?.maxStationLength || 150,
                                            onChange: (e) => updateStat('maxStationLength', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // COSTS SECTION
                        React.createElement('div', { key: 'costs-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Costs ($)'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                    React.createElement('div', { key: 'car-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 100000,
                                            max: 10000000,
                                            step: '10000',
                                            value: trainData.stats?.carCost || 2000000,
                                            onChange: (e) => updateStat('carCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'track-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Track Cost per meter'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000,
                                            max: 200000,
                                            step: '1000',
                                            value: trainData.stats?.baseTrackCost || 35000,
                                            onChange: (e) => updateStat('baseTrackCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'station-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Station Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 500000000,
                                            step: '100000',
                                            value: trainData.stats?.baseStationCost || 50000000,
                                            onChange: (e) => updateStat('baseStationCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'scissors-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Scissors Crossover Cost'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 1000000,
                                            max: 50000000,
                                            step: '100000',
                                            value: trainData.stats?.scissorsCrossoverCost || 10000000,
                                            onChange: (e) => updateStat('scissorsCrossoverCost', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'train-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Train Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 50,
                                            max: 5000,
                                            step: '10',
                                            value: trainData.stats?.trainOperationalCostPerHour || 300,
                                            onChange: (e) => updateStat('trainOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ]),
                                    
                                    React.createElement('div', { key: 'car-op-cost' }, [
                                        React.createElement('label', {
                                            className: 'block text-sm font-medium mb-1'
                                        }, 'Car Op. Cost per hour'),
                                        React.createElement('input', {
                                            type: 'number',
                                            min: 5,
                                            max: 500,
                                            step: '5',
                                            value: trainData.stats?.carOperationalCostPerHour || 30,
                                            onChange: (e) => updateStat('carOperationalCostPerHour', parseInt(e.target.value)),
                                            className: 'w-full p-2 border border-input bg-background rounded text-sm'
                                        })
                                    ])
                                ])
                            ])
                        ]),

                        // ELEVATION MULTIPLIERS SECTION
                        React.createElement('div', { key: 'elevation-section', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Elevation Cost Multipliers'),
                            
                            React.createElement(Card, { className: 'p-4' }, [
                                React.createElement('div', { className: 'space-y-3' }, [
                                    createElevationSlider('Deep Bore', 'DEEP_BORE', 1.0, 5.0, 0.1),
                                    createElevationSlider('Standard Tunnel', 'STANDARD_TUNNEL', 1.0, 4.0, 0.1),
                                    createElevationSlider('Cut & Cover', 'CUT_AND_COVER', 1.0, 3.0, 0.1),
                                    createElevationSlider('At Grade', 'AT_GRADE', 0.1, 2.0, 0.1),
                                    createElevationSlider('Elevated', 'ELEVATED', 1.0, 3.0, 0.1)
                                ])
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement('div', {
                                className: 'flex justify-between items-center text-sm text-muted-foreground'
                            }, [
                                React.createElement('span', {}, 'New Custom Train'),
                                !showApply && React.createElement('div', {
                                    className: 'flex items-center gap-2 text-destructive'
                                }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-alert-circle"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('line', { x1: "12", x2: "12", y1: "8", y2: "12" }),
                                        React.createElement('line', { x1: "12", x2: "12.01", y1: "16", y2: "16" })
                                    ]),
                                    'Fix validation issues to create'
                                ])
                            ]),
                            React.createElement('div', {
                                className: 'flex gap-2 pt-4 border-t'
                            }, [
                                React.createElement(Button, {
                                    onClick: () => setActiveView(null),
                                    variant: 'secondary',
                                    className: 'flex-1'
                                }, 'Cancel'),
                                
                                showApply && React.createElement(Button, {
                                    onClick: handleCreate,
                                    className: 'flex-1'
                                }, 'Create Train')
                            ])
                        ])
                    ])
                ]));
            }

            // Main menu view (shown when no active view selected)
            function MainMenuView() {
                const trainCategories = getTrainCategories();
                const totalTrains = Object.values(trainCategories).reduce((sum, category) => sum + category.length, 0);
                
                return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        React.createElement('div', { key: 'header', className: 'space-y-2' }, [
                            React.createElement('h1', {
                                className: 'text-2xl font-bold'
                            }, 'Add Trains Manager'),
                            React.createElement('p', {
                                className: 'text-sm text-muted-foreground'
                            }, 'Customize and manage your train types by mhmoeller')
                        ]),

                        // Quick stats
                        React.createElement(Card, { key: 'stats', className: 'p-4' }, [
                            React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, [
                                React.createElement('div', { className: 'space-y-1' }, [
                                    React.createElement('div', { className: 'text-2xl font-bold' }, 
                                        Object.keys(currentConfig.enabledTrains || []).length
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground' }, 'Enabled Trains')
                                ]),
                                React.createElement('div', { className: 'space-y-1' }, [
                                    React.createElement('div', { className: 'text-2xl font-bold' }, 
                                        totalTrains
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground' }, 'Total Train Types')
                                ])
                            ]),
                            React.createElement('div', { className: 'mt-4 text-xs text-muted-foreground grid grid-cols-2 gap-2' }, [
                                React.createElement('div', {}, `Heavy Metro: ${trainCategories["Heavy Metro Types"].length}`),
                                React.createElement('div', {}, `Light Metro: ${trainCategories["Light Metro Types"].length}`),
                                React.createElement('div', {}, `Tram Types: ${trainCategories["Tram Types"].length}`),
                                React.createElement('div', {}, `Regional: ${trainCategories["Regional Types"].length}`)
                            ])
                        ])
                    ]),

                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        React.createElement('div', { key: 'options', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Management Options'),

                            React.createElement('button', {
                                onClick: openEnableDisable,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-toggle-right h-4 w-4"
                                    }, [
                                        React.createElement('rect', { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6" }),
                                        React.createElement('circle', { cx: "16", cy: "12", r: "2" })
                                    ]),
                                    React.createElement('span', {}, 'Enable / Disable Trains')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ]),

                            React.createElement('button', {
                                onClick: openEditTrain,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-settings h-4 w-4"
                                    }, [
                                        React.createElement('path', { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
                                        React.createElement('circle', { cx: "12", cy: "12", r: "3" })
                                    ]),
                                    React.createElement('span', {}, 'Edit Train Statistics')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ]),

                            React.createElement('button', {
                                onClick: openCreateTrain,
                                className: 'inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full rounded-sm justify-between gap-2'
                            }, [
                                React.createElement('div', { className: 'flex items-center gap-2' }, [
                                    React.createElement('svg', {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        className: "lucide lucide-plus-circle h-4 w-4"
                                    }, [
                                        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
                                        React.createElement('path', { d: "M8 12h8" }),
                                        React.createElement('path', { d: "M12 8v8" })
                                    ]),
                                    React.createElement('span', {}, 'Create Custom Train')
                                ]),
                                React.createElement('svg', {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "lucide lucide-chevron-right h-4 w-4 text-muted-foreground"
                                }, React.createElement('path', { d: "m9 18 6-6-6-6" }))
                            ])
                        ]),

                        // Actions
                        React.createElement('div', {
                            key: 'actions',
                            className: 'space-y-2 mt-auto'
                        }, [
                            React.createElement(Button, {
                                onClick: registerTrainsToGame,
                                className: 'w-full'
                            }, 'Apply All Train Changes')
                        ])
                    ])
                ]);
            }

            // Render appropriate view
            let content;
            if (isOpen) {
                switch (activeView) {
                    case 'enable':
                        content = React.createElement(EnableDisableView);
                        break;
                    case 'edit':
                        content = React.createElement(EditTrainView);
                        break;
                    case 'create':
                        content = React.createElement(CreateTrainView);
                        break;
                    default:
                        content = React.createElement(FullscreenView, {
                            title: 'Add Trains Manager',
                            onBack: () => setIsOpen(false)
                        }, React.createElement(MainMenuView));
                        break;
                }
            }

            return React.createElement(React.Fragment, null, [
                // Main button (unchanged as requested)
                React.createElement('div', {
                    key: 'button-container',
                    className: 'flex flex-col gap-1'
                }, [
                    // Button element
                    React.createElement('div', {
                        key: 'button',
                        onClick: () => {
                            if (!isOpen) {
                                setActiveView(null);
                            }
                            setIsOpen(!isOpen);
                        },
                        className: 'max-w-full font-bold flex items-center bg-primary text-primary-foreground cursor-pointer text-4xl flex-row-reverse justify-end gap-1.5 w-full h-fit hover:bg-primary/90 transition-colors group',
                        style: {
                            borderRadius: '0'
                        }
                    }, [
                        // Text container
                        React.createElement('div', {
                            key: 'text-container',
                            className: 'flex gap-1 items-center px-1'
                        }, [
                            React.createElement('p', {
                                key: 'text',
                                className: 'h-full text-3xl'
                            }, 'Add Trains')
                        ]),
                        
                        // Icon container
                        React.createElement(TrainIcon, {
                            key: 'icon',
                            className: 'min-w-fit transition-all h-9 w-9 ml-1 group-hover:scale-110',
                            style: {
                                transitionDuration: '150ms'
                            }
                        })
                    ]),
                    
                    // Description under the button
                    React.createElement('p', {
                        key: 'description',
                        className: 'text-xs text-muted-foreground pl-1 truncate'
                    }, '')
                ]),
                
                // Fullscreen content
                isOpen && content
            ]);
        }

        return MainMenuButton;
    }
	
    // --------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------
    function initialize() {
        debugLogMessage("log", "=== ADD TRAINS MOD INITIALIZING ===");
        const api = window.SubwayBuilderAPI;

        if (!api) {
            debugLogMessage("error", "API not available");
            return;
        }

        // Register trains on game init
        if (api.hooks && typeof api.hooks.onGameInit === 'function') {
            api.hooks.onGameInit(() => {
                debugLogMessage("log", "Game initialized - registering trains");
                setTimeout(registerTrainsToGame, 500);
            });
        }

        // Try to register UI component
        try {
            const hasReact = !!api.utils?.React;
            
            if (hasReact && api.ui?.registerComponent && typeof api.hooks.onGameInit) {
                debugLogMessage("log", "Registering React component");
                const ReactComponent = createReactUI();
                if (ReactComponent) {
                    api.ui.registerComponent("main-menu", {
                        id: 'add-trains-button',
                        component: ReactComponent
                    });
                    debugLogMessage("log", "React component registered successfully");
                }
            } else if (api.ui?.addToolbarPanel) {
                debugLogMessage("log", "Adding toolbar panel");
                const ReactComponent = createReactUI();
                if (ReactComponent) {
                    api.ui.addToolbarPanel({
                        id: 'add-trains-panel',
                        icon: 'Train',
                        tooltip: 'Add Trains',
                        width: 500,
                        render: ReactComponent
                    });
                    debugLogMessage("log", "Toolbar panel added successfully");
                }
            }
		
        } catch (error) {
            debugLogMessage("error", "Failed to register UI", error);
        }

        // Initial train registration
        setTimeout(() => {
            registerTrainsToGame();
            debugLogMessage("log", "Initial train registration complete");
        }, 1000);

        debugLogMessage("log", "Mod initialized successfully");
    }

    // Start
    if (window.SubwayBuilderAPI) {
        initialize();
    } else {
        debugLogMessage("log", "Waiting for API...");
        const checkInterval = setInterval(() => {
            if (window.SubwayBuilderAPI) {
                clearInterval(checkInterval);
                initialize();
            }
        }, 100);
    }

})();