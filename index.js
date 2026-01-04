// index.js – AddTrains Mod (Complete Edition)
// Version 4.0 – Full feature set with proper API integration
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
    // TRAIN DEFINITIONS
    // --------------------------------------------------
	
	    // Base elevation multipliers
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
	
    const ALL_TRAINS = {
        "heavy-metro": {
            id: "heavy-metro",
            name: "Heavy Metro",
            description: "For higher capacity routes. Modeled after the NYC subway's R211 cars.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.1,
                maxDeceleration: 1.3,
                maxSpeed: 24.72,
                maxSpeedLocalStation: 13,
                capacityPerCar: 240,
                carLength: 15,
                minCars: 5,
                maxCars: 10,
                carsPerCarSet: 5,
                carCost: 2500000,
                trainWidth: 3.05,
                minStationLength: 160,
                maxStationLength: 227,
                baseTrackCost: 50000,
                baseStationCost: 75000000,
                trainOperationalCostPerHour: 500,
                carOperationalCostPerHour: 50,
                scissorsCrossoverCost: 15000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["heavy-metro"],
            appearance: { color: "#2563eb" },
            isFixed: true
        },
        "light-metro": {
            id: "light-metro",
            name: "Light Metro",
            description: "Lighter, more flexible transit for moderate capacity routes.",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.3,
                maxDeceleration: 1.3,
                maxSpeed: 25.0,
                maxSpeedLocalStation: 13.0,
                capacityPerCar: 120,
                carLength: 13,
                minCars: 3,
                maxCars: 6,
                carsPerCarSet: 3,
                carCost: 2500000,
                trainWidth: 2.65,
                minStationLength: 80,
                maxStationLength: 160,
                baseTrackCost: 30000,
                baseStationCost: 50000000,
                trainOperationalCostPerHour: 100,
                carOperationalCostPerHour: 10,
                scissorsCrossoverCost: 12000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["light-metro"],
            appearance: { color: "#10b981" },
            isFixed: true
        },
        "s-train": {
            id: "s-train",
            name: "S-train",
            description: "High-capacity commuter train. Modeled after Copenhagen S-train",
            allowAtGradeRoadCrossing: false,
            stats: {
                maxAcceleration: 1.3,
                maxDeceleration: 1.2,
                maxSpeed: 33.3,
                maxSpeedLocalStation: 13,
                capacityPerCar: 250,
                carLength: 21,
                minCars: 4,
                maxCars: 8,
                carsPerCarSet: 4,
                carCost: 3000000,
                trainWidth: 3.6,
                minStationLength: 180,
                maxStationLength: 200,
                baseTrackCost: 50000,
                baseStationCost: 80000000,
                trainOperationalCostPerHour: 600,
                carOperationalCostPerHour: 60,
                scissorsCrossoverCost: 15000000
            },
            elevationMultipliers: BASE_ELEVATION_MULTIPLIERS,
            compatibleTrackTypes: ["s-train"],
            appearance: { color: "#c2122b" },
            isFixed: false
        },
        "regional": {
            id: "regional",
            name: "Regional",
            description: "Regional diesel/electric unit for local services.",
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
            compatibleTrackTypes: ["regional"],
            appearance: { color: "#ebd768" },
            isFixed: false
        },
        "intercity": {
            id: "intercity",
            name: "Intercity",
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
            compatibleTrackTypes: ["intercity"],
            appearance: { color: "#222222" },
            isFixed: false
        },
        "tram": {
            id: "tram",
            name: "Tram",
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
            compatibleTrackTypes: ["tram"],
            appearance: { color: "#62b54e" },
            isFixed: false
        }
    };

    // --------------------------------------------------
    // CONFIG MANAGEMENT
    // --------------------------------------------------
    const STORAGE_KEY = 'addtrains_config';
    
    let uiState = {
        selectedTrainID: null,
        editedValues: {}
    };
    
    // Default config - all extra trains enabled by default
    const DEFAULT_CONFIG = {
        enabledTrains: Object.keys(ALL_TRAINS).filter(id => !ALL_TRAINS[id].isFixed),
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
        Object.entries(ALL_TRAINS).forEach(([trainId, trainDef]) => {
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
            if (ALL_TRAINS[trainId] && !ALL_TRAINS[trainId].isFixed) {
                // Use custom version if exists, otherwise default
                if (config.customTrains && config.customTrains[trainId]) {
                    trains[trainId] = deepClone(config.customTrains[trainId]);
                } else {
                    trains[trainId] = deepClone(ALL_TRAINS[trainId]);
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
            const errorMsg = `Train "${train.name}" is too long! Maximum train length (${maxTrainLength}m) must be at least 2m less than minimum station length (${minRequiredLength}m). Required: minStationLength > ${maxTrainLength + 2}`;
            showNotification(errorMsg, 'error');
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
    // REACT UI COMPONENTS - UPDATED WITH FULLSCREEN DESIGN
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

            // Fullscreen View Component - matches design template
            function FullscreenView({ title, children, onBack }) {
                return React.createElement('div', {
                    className: 'absolute inset-0 w-full h-full overflow-auto bg-background'
                }, React.createElement('main', {
                    className: 'min-h-screen w-full px-4 md:px-8 lg:px-12 py-8 lg:py-12 overflow-y-auto'
                }, [
                    // Back button header
                    React.createElement('div', {
                        key: 'header',
                        className: 'w-full max-w-4xl mx-auto flex flex-col gap-6'
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

            // Enable/Disable View Component
            function EnableDisableView() {
                const [enabledTrains, setEnabledTrains] = React.useState(new Set(currentConfig.enabledTrains || []));
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

                const toggleTrain = (trainId) => {
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

                const fixedTrains = Object.entries(ALL_TRAINS).filter(([_, train]) => train.isFixed);
                const extraTrains = Object.entries(ALL_TRAINS).filter(([_, train]) => !train.isFixed);
                const customTrains = currentConfig.customTrains ? 
                    Object.entries(currentConfig.customTrains).filter(([trainId]) => trainId.startsWith('custom-')) : [];

                return React.createElement(FullscreenView, {
                    title: 'Enable / Disable Trains',
                    onBack: () => setActiveView(null)
                }, React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' }, [
                    // Left column
                    React.createElement('div', { key: 'left', className: 'flex flex-col gap-6' }, [
                        // Fixed trains section
                        React.createElement('div', { key: 'fixed', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Fixed Trains (Always Enabled)'),
                            React.createElement('div', { className: 'space-y-2' },
                                fixedTrains.map(([trainId, train]) => 
                                    React.createElement('div', {
                                        key: trainId,
                                        className: 'px-4 py-3 bg-background/50 rounded border flex justify-between items-center'
                                    }, [
                                        React.createElement('div', { key: 'info' }, [
                                            React.createElement('div', { 
                                                className: 'font-medium' 
                                            }, train.name),
                                            React.createElement('div', { 
                                                className: 'text-sm text-muted-foreground' 
                                            }, train.description)
                                        ]),
                                        React.createElement('span', {
                                            className: 'px-2 py-1 text-xs bg-primary/20 text-primary rounded-full'
                                        }, 'Fixed')
                                    ])
                                )
                            )
                        ]),

                        // Extra trains section
                        React.createElement('div', { key: 'extra', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Extra Train Types'),
                            React.createElement('div', { className: 'space-y-2' },
                                extraTrains.map(([trainId, train]) => 
                                    React.createElement('div', {
                                        key: trainId,
                                        className: 'px-4 py-3 bg-background/50 rounded border flex justify-between items-center cursor-pointer hover:bg-accent/50 transition-colors',
                                        onClick: () => toggleTrain(trainId)
                                    }, [
                                        React.createElement('div', { key: 'info' }, [
                                            React.createElement('div', { 
                                                className: 'font-medium' 
                                            }, train.name),
                                            React.createElement('div', { 
                                                className: 'text-sm text-muted-foreground' 
                                            }, train.description)
                                        ]),
                                        React.createElement('label', {
                                            className: 'relative inline-flex items-center cursor-pointer'
                                        }, [
                                            React.createElement('input', {
                                                type: 'checkbox',
                                                className: 'sr-only',
                                                checked: enabledTrains.has(trainId),
                                                readOnly: true
                                            }),
                                            React.createElement('div', {
                                                className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${enabledTrains.has(trainId) ? 'bg-primary' : 'bg-input'}`
                                            }),
                                            React.createElement('div', {
                                                className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${enabledTrains.has(trainId) ? 'translate-x-5' : 'translate-x-0'}`
                                            })
                                        ])
                                    ])
                                )
                            )
                        ])
                    ]),

                    // Right column
                    React.createElement('div', { key: 'right', className: 'flex flex-col gap-6' }, [
                        // Custom trains section
                        customTrains.length > 0 && React.createElement('div', { key: 'custom', className: 'space-y-2' }, [
                            React.createElement('h2', {
                                className: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground'
                            }, 'Custom Train Types'),
                            React.createElement('div', { className: 'space-y-2' },
                                customTrains.map(([trainId, train]) => 
                                    React.createElement('div', {
                                        key: trainId,
                                        className: 'px-4 py-3 bg-background/50 rounded border flex justify-between items-center cursor-pointer hover:bg-accent/50 transition-colors group',
                                        onClick: () => toggleTrain(trainId)
                                    }, [
                                        React.createElement('div', { key: 'info' }, [
                                            React.createElement('div', { 
                                                className: 'font-medium' 
                                            }, train.name),
                                            React.createElement('div', { 
                                                className: 'text-sm text-muted-foreground' 
                                            }, train.description)
                                        ]),
                                        React.createElement('div', { className: 'flex items-center gap-2' }, [
                                            React.createElement('label', {
                                                className: 'relative inline-flex items-center cursor-pointer'
                                            }, [
                                                React.createElement('input', {
                                                    type: 'checkbox',
                                                    className: 'sr-only',
                                                    checked: enabledTrains.has(trainId),
                                                    readOnly: true
                                                }),
                                                React.createElement('div', {
                                                    className: `w-11 h-6 border-2 border-transparent rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${enabledTrains.has(trainId) ? 'bg-primary' : 'bg-input'}`
                                                }),
                                                React.createElement('div', {
                                                    className: `absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-lg transition-transform ${enabledTrains.has(trainId) ? 'translate-x-5' : 'translate-x-0'}`
                                                })
                                            ]),
                                            React.createElement('button', {
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    deleteCustomTrain(trainId, train.name);
                                                },
                                                className: 'p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity',
                                                title: 'Delete train'
                                            }, '🗑️')
                                        ])
                                    ])
                                )
                            )
                        ]),

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
                ]));
            }

            // Edit Train View Component
            function EditTrainView() {
                const [selectedTrainId, setSelectedTrainId] = React.useState(Object.keys(ALL_TRAINS)[0]);
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
						const availableTrains = Object.keys({ ...ALL_TRAINS, ...currentConfig.customTrains });
						if (availableTrains.length > 0) {
							setSelectedTrainId(availableTrains[0]);
							const nextTrain = currentConfig.customTrains?.[availableTrains[0]] || ALL_TRAINS[availableTrains[0]];
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
                    const train = currentConfig.customTrains?.[selectedTrainId] || ALL_TRAINS[selectedTrainId];
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
                            
                            const defaultTrain = ALL_TRAINS[selectedTrainId];
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
                const allAvailableTrains = { ...ALL_TRAINS, ...currentConfig.customTrains };

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
                                        className: 'backdrop-blur-sm border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 w-full',
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
                                            }, 'Train Name *'),
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

            // Create Train View Component - Now includes full editing capabilities
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

                const [showApply, setShowApply] = React.useState(true);

                React.useEffect(() => {
                    // Validate length on load
                    validateLength(trainData);
                }, []);

                const validateLength = (train) => {
                    if (!train.stats) {
                        setShowApply(true);
                        return;
                    }
                    
                    const maxTrainLength = train.stats.carLength * train.stats.maxCars;
                    const minRequiredLength = train.stats.minStationLength;
                    const isValid = maxTrainLength <= (minRequiredLength - 2);
                    setShowApply(isValid);
                };

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

                const handleCreate = () => {
                    if (!trainData.name.trim()) {
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

                // Calculate max train length for validation message
                const maxTrainLength = trainData.stats?.carLength * trainData.stats?.maxCars || 0;
                const minStationLength = trainData.stats?.minStationLength || 0;
                const isValidLength = maxTrainLength <= (minStationLength - 2);
				
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
                                    'Fix length issue to create'
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
                                        Object.keys(currentConfig.customTrains || {}).length
                                    ),
                                    React.createElement('div', { className: 'text-xs text-muted-foreground' }, 'Custom Trains')
                                ])
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
    // DOM FALLBACK UI
    // --------------------------------------------------
    function createDOMFallbackUI() {
        const button = document.createElement('div');
        button.innerHTML = `
            <div class="at-main-button" style="
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 8px;
                background: var(--card-bg, #ffffff);
                border: 1px solid var(--border, #e2e8f0);
                color: var(--text-primary, #1e293b);
                font-size: 20px;
                transition: all 0.2s;
            " title="Add Trains">
                🚆
            </div>
        `;
        
        button.addEventListener('click', openDOMMainMenu);
        return button;
    }

    function openDOMMainMenu() {
        const existing = document.getElementById('at-main-menu');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'at-main-menu';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        `;

        modal.innerHTML = `
            <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border, #e2e8f0); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-primary, #1e293b);">
                    Add Trains Manager
                </h3>
                <button id="at-main-close" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-secondary, #64748b);
                    padding: 0.25rem;
                    line-height: 1;
                ">×</button>
            </div>
            
            <div style="padding: 1.5rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button id="at-open-enable" style="
                        width: 100%;
                        padding: 0.75rem;
                        text-align: left;
                        background: var(--card-alt-bg, #f8fafc);
                        border: 1px solid var(--border-light, #e2e8f0);
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-primary, #1e293b);
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    ">
                        Enable / Disable Trains
                    </button>
                    
                    <button id="at-open-edit" style="
                        width: 100%;
                        padding: 0.75rem;
                        text-align: left;
                        background: var(--card-alt-bg, #f8fafc);
                        border: 1px solid var(--border-light, #e2e8f0);
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-primary, #1e293b);
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    ">
                        Edit Train Statistics
                    </button>
                    
                    <button id="at-open-create" style="
                        width: 100%;
                        padding: 0.75rem;
                        text-align: left;
                        background: var(--card-alt-bg, #f8fafc);
                        border: 1px solid var(--border-light, #e2e8f0);
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-primary, #1e293b);
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    ">
                        Create Custom Train
                    </button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Event listeners
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'at-main-close' || e.target === overlay) {
                overlay.remove();
                return;
            }

            if (e.target.id === 'at-open-enable') {
                overlay.remove();
                openDOMEnableDisable();
            } else if (e.target.id === 'at-open-edit') {
                overlay.remove();
                openDOMEditTrain();
            } else if (e.target.id === 'at-open-create') {
                overlay.remove();
                openDOMCreateTrain();
            }
        });
    }

    // DOM views would be implemented similarly to React views
	// But if React works I'll leave this as is
    function openDOMEnableDisable() {
        // Similar to previous DOM implementation
        const overlay = document.createElement('div');
        overlay.id = 'at-enable-modal';
        // ... implementation
    }

    function openDOMEditTrain() {
        // Full edit train implementation
        const overlay = document.createElement('div');
        overlay.id = 'at-edit-modal';
        // ... detailed implementation with sliders
    }

    function openDOMCreateTrain() {
        // Create train form
        const overlay = document.createElement('div');
        overlay.id = 'at-create-modal';
        // ... form implementation
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
            
            if (hasReact && api.ui?.registerComponent) {
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
            } else {
                // DOM fallback
                debugLogMessage("log", "Using DOM fallback");
                const fallbackButton = createDOMFallbackUI();
                const toolbar = document.querySelector('[class*="toolbar"], [class*="Toolbar"]');
                if (toolbar) {
                    toolbar.appendChild(fallbackButton);
                } else {
                    fallbackButton.style.position = 'fixed';
                    fallbackButton.style.top = '100px';
                    fallbackButton.style.right = '20px';
                    fallbackButton.style.zIndex = '9998';
                    document.body.appendChild(fallbackButton);
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

