/**
 * WebAR Kristallstrukturen - Main Application
 *
 * Verwaltet AR-Tracking, Camera-Relative Mode und UI-Updates
 */

// ============================================================================
// GLOBALE STATE
// ============================================================================

const appState = {
    currentMode: 'atom',           // 'atom' oder 'schematic'
    activeTarget: null,             // null, 'krz', 'kfz', 'hdp'
    activeStructure: null,          // null, 'krz', 'kfz', 'hdp' (für Free Mode)
    arReady: false,
    trackingActive: false,
    freeMode: false                 // Camera-Relative Mode aktiviert
};

// Struktur-Informationen
const structureInfo = {
    krz: {
        name: 'KRZ - Kubisch Raumzentriert',
        description: 'Kubisch-Raumzentrierte Struktur',
        atomCount: 9,
        details: '8 Eckatome + 1 Zentralatom'
    },
    kfz: {
        name: 'KFZ - Kubisch Flächenzentriert',
        description: 'Kubisch-Flächenzentrierte Struktur',
        atomCount: 14,
        details: '8 Eckatome + 6 Flächenatome'
    },
    hdp: {
        name: 'HDP - Hexagonal Dichteste Packung',
        description: 'Hexagonal-Dichteste-Packung',
        atomCount: 17,
        details: '12 Hexagon-Ecken + 2 Zentren + 3 Mitte'
    }
};

// ============================================================================
// UI ELEMENTE
// ============================================================================

const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    progressFill: document.getElementById('progress-fill'),
    instructionsOverlay: document.getElementById('instructions-overlay'),
    startBtn: document.getElementById('start-ar-btn'),
    structureInfo: document.getElementById('structure-info'),
    structureName: document.getElementById('structure-name'),
    structureDesc: document.getElementById('structure-desc'),
    atomCount: document.getElementById('atom-count'),
    currentModeDisplay: document.getElementById('current-mode'),
    modeToggle: document.getElementById('mode-toggle'),
    modeText: document.querySelector('.mode-text'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    infoBtn: document.getElementById('info-btn'),
    arScene: document.getElementById('ar-scene')
};

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[WebAR] Initialisiere Anwendung...');
    console.log('[WebAR] Camera-Relative Tracking aktiviert');

    // Event Listeners registrieren
    registerEventListeners();

    // Progress Bar Animation (simuliert)
    simulateLoading();
});

/**
 * Simuliert Lade-Fortschritt
 */
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        elements.progressFill.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
            }, 500);
        }
    }, 300);
}

/**
 * Registriert alle Event Listeners
 */
function registerEventListeners() {
    // Start-Button
    elements.startBtn.addEventListener('click', startAR);

    // Info-Button
    elements.infoBtn.addEventListener('click', showInstructions);

    // Mode-Toggle-Button
    elements.modeToggle.addEventListener('click', toggleMode);

    // A-Frame Scene Events
    const scene = elements.arScene;

    scene.addEventListener('loaded', onSceneLoaded);
    scene.addEventListener('arReady', onARReady);
    scene.addEventListener('arError', onARError);

    // Target Events für alle drei Strukturen
    setupTargetTracking('krz', 0);
    setupTargetTracking('kfz', 1);
    setupTargetTracking('hdp', 2);
}

// ============================================================================
// AR LIFECYCLE
// ============================================================================

/**
 * Startet die AR-Session
 */
function startAR() {
    console.log('[WebAR] Starte AR-Session...');

    elements.instructionsOverlay.classList.add('hidden');
    updateStatus('Initialisiere Kamera...', false);

    // MindAR startet automatisch nach dem Ausblenden des Overlays
    setTimeout(() => {
        updateStatus('Kamera bereit - Halte Marker vor die Kamera', false);
    }, 2000);
}

/**
 * Zeigt Anleitung erneut an
 */
function showInstructions() {
    elements.instructionsOverlay.classList.remove('hidden');
}

/**
 * Wird aufgerufen, wenn A-Frame Scene geladen ist
 */
function onSceneLoaded() {
    console.log('[WebAR] A-Frame Scene geladen');
}

/**
 * Wird aufgerufen, wenn AR bereit ist
 */
function onARReady(event) {
    console.log('[WebAR] AR bereit');
    appState.arReady = true;
    updateStatus('Kamera bereit - Halte Marker vor die Kamera', true);
}

/**
 * Wird bei AR-Fehler aufgerufen
 */
function onARError(event) {
    console.error('[WebAR] AR-Fehler:', event.detail);
    updateStatus('Fehler: ' + event.detail.error, false);

    alert('AR-Fehler: Bitte stelle sicher, dass du Kamera-Zugriff erteilt hast.');
}

// ============================================================================
// TARGET TRACKING
// ============================================================================

/**
 * Richtet Event-Tracking für einen Target ein
 */
function setupTargetTracking(structureType, targetIndex) {
    const target = document.getElementById(`${structureType}-target`);

    if (!target) {
        console.error(`[WebAR] Target nicht gefunden: ${structureType}`);
        return;
    }

    // Target gefunden
    target.addEventListener('targetFound', () => {
        console.log(`[WebAR] ${structureType.toUpperCase()} Marker erkannt`);
        onTargetFound(structureType);
    });

    // Target verloren
    target.addEventListener('targetLost', () => {
        console.log(`[WebAR] ${structureType.toUpperCase()} Marker verloren`);
        onTargetLost(structureType);
    });
}

/**
 * Wird aufgerufen, wenn ein Marker erkannt wird
 */
function onTargetFound(structureType) {
    // FALL 1: Derselbe QR-Code wird nochmal gescannt → Nichts tun
    if (appState.activeStructure === structureType) {
        console.log(`[WebAR] ${structureType.toUpperCase()} Marker erneut erkannt - keine Änderung`);
        updateStatus(`${structureInfo[structureType].name} erkannt`, true);
        return; // Einfach weiterlaufen lassen
    }

    // FALL 2: Ein NEUER QR-Code wird gescannt → Wechsel
    if (appState.activeStructure && appState.activeStructure !== structureType) {
        console.log(`[WebAR] Wechsle von ${appState.activeStructure.toUpperCase()} zu ${structureType.toUpperCase()}`);
        exitFreeMode(appState.activeStructure);
        hideAllModels();
    }

    // FALL 3: Erster QR-Code Scan
    appState.activeTarget = structureType;
    appState.activeStructure = structureType;
    appState.trackingActive = true;

    // UI aktualisieren
    showStructureInfo(structureType);
    elements.modeToggle.classList.remove('hidden');

    // Status aktualisieren
    const info = structureInfo[structureType];
    updateStatus(`${info.name} erkannt`, true);

    // Zeige aktuelles Modell basierend auf Modus
    updateModelVisibility(structureType);

    // SOFORT in Camera-Relative Mode wechseln (keine Verzögerung!)
    enterFreeMode(structureType);

    console.log(`[WebAR] ${structureType.toUpperCase()} erfolgreich geladen und in Free Mode`);
}

/**
 * Versteckt alle Modelle (setzt BEIDE Properties: A-Frame + THREE.js)
 */
function hideAllModels() {
    const allStructures = ['krz', 'kfz', 'hdp'];

    allStructures.forEach(structure => {
        const atomModel = document.getElementById(`${structure}-atom`);
        const schematicModel = document.getElementById(`${structure}-schematic`);

        if (atomModel) {
            atomModel.setAttribute('visible', 'false');
            if (atomModel.object3D) atomModel.object3D.visible = false;
        }
        if (schematicModel) {
            schematicModel.setAttribute('visible', 'false');
            if (schematicModel.object3D) schematicModel.object3D.visible = false;
        }
    });

    console.log('[WebAR] Alle Modelle versteckt');
}

/**
 * Wird aufgerufen, wenn ein Marker verloren geht
 * WICHTIG: Im Camera-Relative Mode bleibt das Modell sichtbar!
 * Das Modell bleibt so lange sichtbar, bis ein NEUER QR-Code gescannt wird
 */
function onTargetLost(structureType) {
    console.log(`[WebAR] ${structureType.toUpperCase()} Marker verloren`);
    console.log(`[WebAR] Modell bleibt sichtbar bis neuer QR-Code gescannt wird`);

    // WICHTIG: MindAR versucht die Modelle zu verstecken - wir forcieren Sichtbarkeit!
    if (appState.freeMode && appState.activeStructure === structureType) {
        // Sofort Sichtbarkeit wiederherstellen
        const atomModel = document.getElementById(`${structureType}-atom`);
        const schematicModel = document.getElementById(`${structureType}-schematic`);

        // Setze BEIDE Properties für das aktive Modell
        if (appState.currentMode === 'atom' && atomModel) {
            atomModel.setAttribute('visible', 'true');
            if (atomModel.object3D) atomModel.object3D.visible = true;
            console.log('[WebAR] Atom-Modell Sichtbarkeit erzwungen');
        } else if (appState.currentMode === 'schematic' && schematicModel) {
            schematicModel.setAttribute('visible', 'true');
            if (schematicModel.object3D) schematicModel.object3D.visible = true;
            console.log('[WebAR] Schematisch-Modell Sichtbarkeit erzwungen');
        }

        // Setze auch den Container explizit auf visible
        const container = document.getElementById(`${structureType}-models`);
        if (container) {
            container.setAttribute('visible', 'true');
            if (container.object3D) container.object3D.visible = true;
        }
    }

    // Status aktualisieren
    updateStatus(`${structureInfo[structureType].name} - Frei drehbar (Marker nicht sichtbar)`, true);
}

// ============================================================================
// MODE SWITCHING
// ============================================================================

/**
 * Wechselt zwischen Atom- und Schematisch-Modus
 */
function toggleMode() {
    const oldMode = appState.currentMode;
    const newMode = (oldMode === 'atom') ? 'schematic' : 'atom';

    console.log(`[WebAR] Wechsle Modus: ${oldMode} → ${newMode}`);

    appState.currentMode = newMode;

    // UI aktualisieren
    updateModeUI();

    // Modell-Sichtbarkeit für aktuellen Target aktualisieren
    if (appState.activeTarget) {
        const structureType = appState.activeTarget;
        const atomModel = document.getElementById(`${structureType}-atom`);
        const schematicModel = document.getElementById(`${structureType}-schematic`);

        // Ändere NUR die Sichtbarkeit - NICHT Free Mode deaktivieren!
        if (newMode === 'atom') {
            // Zeige Atom, verstecke Schematisch
            if (atomModel) {
                atomModel.setAttribute('visible', 'true');
                if (atomModel.object3D) atomModel.object3D.visible = true;
            }
            if (schematicModel) {
                schematicModel.setAttribute('visible', 'false');
                if (schematicModel.object3D) schematicModel.object3D.visible = false;
            }
        } else {
            // Zeige Schematisch, verstecke Atom
            if (schematicModel) {
                schematicModel.setAttribute('visible', 'true');
                if (schematicModel.object3D) schematicModel.object3D.visible = true;
            }
            if (atomModel) {
                atomModel.setAttribute('visible', 'false');
                if (atomModel.object3D) atomModel.object3D.visible = false;
            }
        }

        console.log(`[WebAR] Mode gewechselt zu: ${newMode}, Modelle aktualisiert`);
    }
}

/**
 * Aktualisiert Mode-Toggle UI
 */
function updateModeUI() {
    const mode = appState.currentMode;
    const modeDisplayName = (mode === 'atom') ? 'Atom' : 'Schematisch';
    const nextModeName = (mode === 'atom') ? 'Schematisch' : 'Atom';

    elements.currentModeDisplay.textContent = modeDisplayName;
    elements.modeText.textContent = `Zu ${nextModeName} wechseln`;
}

/**
 * Aktualisiert Modell-Sichtbarkeit basierend auf Modus
 */
function updateModelVisibility(structureType) {
    const atomModel = document.getElementById(`${structureType}-atom`);
    const schematicModel = document.getElementById(`${structureType}-schematic`);

    if (!atomModel || !schematicModel) {
        console.error(`[WebAR] Modelle nicht gefunden für: ${structureType}`);
        return;
    }

    // Zeige/Verstecke Modelle mit sanftem Übergang
    if (appState.currentMode === 'atom') {
        atomModel.setAttribute('visible', 'true');
        schematicModel.setAttribute('visible', 'false');
    } else {
        atomModel.setAttribute('visible', 'false');
        schematicModel.setAttribute('visible', 'true');
    }

    console.log(`[WebAR] Modell-Sichtbarkeit aktualisiert: ${structureType} → ${appState.currentMode}`);
}

// ============================================================================
// UI UPDATES
// ============================================================================

/**
 * Zeigt Struktur-Informationen an
 */
function showStructureInfo(structureType) {
    const info = structureInfo[structureType];

    elements.structureName.textContent = info.name;
    elements.structureDesc.textContent = info.description;
    elements.atomCount.textContent = `${info.atomCount} Atome`;

    elements.structureInfo.classList.remove('hidden');
}

/**
 * Versteckt Struktur-Informationen
 */
function hideStructureInfo() {
    elements.structureInfo.classList.add('hidden');
}

/**
 * Aktualisiert Status-Anzeige
 */
function updateStatus(message, active) {
    elements.statusText.textContent = message;

    if (active) {
        elements.statusDot.classList.add('active');
    } else {
        elements.statusDot.classList.remove('active');
    }
}

// ============================================================================
// CAMERA-RELATIVE FREE MODE FUNKTIONEN
// ============================================================================

/**
 * Aktiviert Camera-Relative Free Mode für eine Struktur
 * Das Modell wird in gespeicherter Distanz vor die Kamera gesetzt
 */
function enterFreeMode(structureType) {
    console.log(`[WebAR] Aktiviere Camera-Relative Free Mode für: ${structureType}`);

    appState.freeMode = true;

    // Finde das SICHTBARE Modell der Struktur
    const atomModel = document.getElementById(`${structureType}-atom`);
    const schematicModel = document.getElementById(`${structureType}-schematic`);

    // Aktiviere free-mode Component nur für das SICHTBARE Modell
    let visibleModel = null;

    if (atomModel && atomModel.getAttribute('visible') === 'true') {
        visibleModel = atomModel;
    } else if (schematicModel && schematicModel.getAttribute('visible') === 'true') {
        visibleModel = schematicModel;
    }

    if (visibleModel) {
        visibleModel.setAttribute('free-mode', {
            enabled: true,
            structureType: structureType
        });
        console.log(`[WebAR] Camera-Relative Mode aktiviert für: ${visibleModel.id}`);

        // Starte Sichtbarkeits-Watcher
        startVisibilityWatcher(structureType);
    }

    updateStatus(`${structureInfo[structureType].name} - Frei drehbar & zoombar`, true);
}

/**
 * Überwacht die Sichtbarkeit und stellt sicher, dass das Modell sichtbar bleibt
 */
let visibilityWatcherInterval = null;

function startVisibilityWatcher(structureType) {
    // Stoppe vorherigen Watcher
    if (visibilityWatcherInterval) {
        clearInterval(visibilityWatcherInterval);
    }

    // Starte neuen Watcher (alle 200ms)
    visibilityWatcherInterval = setInterval(() => {
        if (appState.freeMode && appState.activeStructure === structureType) {
            const atomModel = document.getElementById(`${structureType}-atom`);
            const schematicModel = document.getElementById(`${structureType}-schematic`);

            // Stelle sicher, dass das aktive Modell sichtbar ist
            if (appState.currentMode === 'atom' && atomModel) {
                // Setze BEIDE Attribute (A-Frame + THREE.js)
                atomModel.setAttribute('visible', 'true');
                if (atomModel.object3D) atomModel.object3D.visible = true;

                // Verstecke schematic explizit
                if (schematicModel) {
                    schematicModel.setAttribute('visible', 'false');
                    if (schematicModel.object3D) schematicModel.object3D.visible = false;
                }
            } else if (appState.currentMode === 'schematic' && schematicModel) {
                // Setze BEIDE Attribute (A-Frame + THREE.js)
                schematicModel.setAttribute('visible', 'true');
                if (schematicModel.object3D) schematicModel.object3D.visible = true;

                // Verstecke atom explizit
                if (atomModel) {
                    atomModel.setAttribute('visible', 'false');
                    if (atomModel.object3D) atomModel.object3D.visible = false;
                }
            }
        }
    }, 200); // Prüfe alle 200ms
}

function stopVisibilityWatcher() {
    if (visibilityWatcherInterval) {
        clearInterval(visibilityWatcherInterval);
        visibilityWatcherInterval = null;
    }
}

/**
 * Deaktiviert Camera-Relative Free Mode für eine Struktur
 */
function exitFreeMode(structureType) {
    console.log(`[WebAR] Deaktiviere Free Mode für: ${structureType}`);

    appState.freeMode = false;

    // Stoppe Sichtbarkeits-Watcher
    stopVisibilityWatcher();

    const atomModel = document.getElementById(`${structureType}-atom`);
    const schematicModel = document.getElementById(`${structureType}-schematic`);

    // Deaktiviere free-mode Component für beide Modelle
    if (atomModel) {
        atomModel.setAttribute('free-mode', { enabled: false });
    }

    if (schematicModel) {
        schematicModel.setAttribute('free-mode', { enabled: false });
    }
}

/**
 * Versteckt eine bestimmte Struktur komplett
 */
function hideStructure(structureType) {
    console.log(`[WebAR] Verstecke Struktur: ${structureType}`);

    const atomModel = document.getElementById(`${structureType}-atom`);
    const schematicModel = document.getElementById(`${structureType}-schematic`);

    if (atomModel) atomModel.setAttribute('visible', 'false');
    if (schematicModel) schematicModel.setAttribute('visible', 'false');
}

// ============================================================================
// DEBUGGING & DIAGNOSTICS
// ============================================================================

/**
 * Debugging-Funktion (nur für Entwicklung)
 */
function logAppState() {
    console.log('[WebAR] App State:', {
        currentMode: appState.currentMode,
        activeTarget: appState.activeTarget,
        activeStructure: appState.activeStructure,
        arReady: appState.arReady,
        trackingActive: appState.trackingActive,
        freeMode: appState.freeMode
    });
}

// Globale Debugging-Funktion
window.debugWebAR = () => {
    logAppState();

    console.log('[WebAR] Verfügbare Targets:', {
        krz: document.getElementById('krz-target'),
        kfz: document.getElementById('kfz-target'),
        hdp: document.getElementById('hdp-target')
    });

    console.log('[WebAR] Verfügbare Modelle:', {
        krz_atom: document.getElementById('krz-atom'),
        krz_schematic: document.getElementById('krz-schematic'),
        kfz_atom: document.getElementById('kfz-atom'),
        kfz_schematic: document.getElementById('kfz-schematic'),
        hdp_atom: document.getElementById('hdp-atom'),
        hdp_schematic: document.getElementById('hdp-schematic')
    });
};

// Console-Hinweis für Entwickler
console.log('[WebAR] Debugging verfügbar: window.debugWebAR()');
console.log('[WebAR] Camera-Relative Tracking: Modelle bleiben in fester Distanz vor Kamera');

// ============================================================================
// FEHLERBEHANDLUNG
// ============================================================================

/**
 * Globaler Error Handler
 */
window.addEventListener('error', (event) => {
    console.error('[WebAR] Globaler Fehler:', event.error);

    // Zeige benutzerfreundliche Fehlermeldung
    if (!appState.arReady) {
        updateStatus('Fehler beim Laden - Bitte Seite neu laden', false);
    }
});

/**
 * Unhandled Promise Rejection Handler
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('[WebAR] Unhandled Promise Rejection:', event.reason);
});

// ============================================================================
// EXPORT (für Tests)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        structureInfo,
        toggleMode,
        updateModelVisibility
    };
}
