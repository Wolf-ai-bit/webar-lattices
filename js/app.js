/**
 * WebAR Kristallstrukturen - Main Application
 *
 * Verwaltet AR-Tracking, Mode-Switching und UI-Updates
 */

// ============================================================================
// GLOBALE STATE
// ============================================================================

const appState = {
    currentMode: 'atom',           // 'atom' oder 'schematic'
    activeTarget: null,             // null, 'bcc', 'fcc', 'hcp'
    arReady: false,
    trackingActive: false
};

// Struktur-Informationen
const structureInfo = {
    bcc: {
        name: 'BCC - Kubisch Raumzentriert',
        description: 'Body-Centered Cubic',
        atomCount: 9,
        details: '8 Eckatome + 1 Zentralatom'
    },
    fcc: {
        name: 'FCC - Kubisch Flächenzentriert',
        description: 'Face-Centered Cubic',
        atomCount: 14,
        details: '8 Eckatome + 6 Flächenatome'
    },
    hcp: {
        name: 'HCP - Hexagonal Dichtest Gepackt',
        description: 'Hexagonal Close-Packed',
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

    // Event Listeners registrieren
    registerEventListeners();

    // Progress Bar Animation (simuliert)
    simulateLoading();

    // QR-Codes generieren
    generateQRCodes();
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
    setupTargetTracking('bcc', 0);
    setupTargetTracking('fcc', 1);
    setupTargetTracking('hcp', 2);
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
    // Verstecke vorheriges Modell falls ein anderer Marker aktiv war
    if (appState.activeTarget && appState.activeTarget !== structureType) {
        console.log(`[WebAR] Wechsle von ${appState.activeTarget.toUpperCase()} zu ${structureType.toUpperCase()}`);
        hideAllModels();
    }

    appState.activeTarget = structureType;
    appState.trackingActive = true;

    // UI aktualisieren
    showStructureInfo(structureType);
    elements.modeToggle.classList.remove('hidden');

    // Status aktualisieren
    const info = structureInfo[structureType];
    updateStatus(`${info.name} erkannt`, true);

    // Zeige aktuelles Modell basierend auf Modus
    updateModelVisibility(structureType);
}

/**
 * Versteckt alle Modelle
 */
function hideAllModels() {
    const allStructures = ['bcc', 'fcc', 'hcp'];

    allStructures.forEach(structure => {
        const atomModel = document.getElementById(`${structure}-atom`);
        const schematicModel = document.getElementById(`${structure}-schematic`);

        if (atomModel) atomModel.setAttribute('visible', 'false');
        if (schematicModel) schematicModel.setAttribute('visible', 'false');
    });
}

/**
 * Wird aufgerufen, wenn ein Marker verloren geht
 */
function onTargetLost(structureType) {
    // NICHT das Modell verstecken - es bleibt sichtbar!
    // Nur wenn ein anderer Marker erkannt wird, wird gewechselt
    console.log(`[WebAR] ${structureType.toUpperCase()} Marker verloren (Modell bleibt sichtbar)`);

    // Status aktualisieren (aber UI bleibt sichtbar)
    updateStatus(`${structureInfo[structureType].name} - Marker nicht mehr sichtbar`, true);
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
        updateModelVisibility(appState.activeTarget);
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
// DEBUGGING & DIAGNOSTICS
// ============================================================================

/**
 * Debugging-Funktion (nur für Entwicklung)
 */
function logAppState() {
    console.log('[WebAR] App State:', {
        currentMode: appState.currentMode,
        activeTarget: appState.activeTarget,
        arReady: appState.arReady,
        trackingActive: appState.trackingActive
    });
}

// Globale Debugging-Funktion
window.debugWebAR = () => {
    logAppState();

    console.log('[WebAR] Verfügbare Targets:', {
        bcc: document.getElementById('bcc-target'),
        fcc: document.getElementById('fcc-target'),
        hcp: document.getElementById('hcp-target')
    });

    console.log('[WebAR] Verfügbare Modelle:', {
        bcc_atom: document.getElementById('bcc-atom'),
        bcc_schematic: document.getElementById('bcc-schematic'),
        fcc_atom: document.getElementById('fcc-atom'),
        fcc_schematic: document.getElementById('fcc-schematic'),
        hcp_atom: document.getElementById('hcp-atom'),
        hcp_schematic: document.getElementById('hcp-schematic')
    });
};

// Console-Hinweis für Entwickler
console.log('[WebAR] Debugging verfügbar: window.debugWebAR()');

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generiert QR-Codes für schnellen Zugriff auf die Webseite
 */
function generateQRCodes() {
    const baseURL = 'https://wolf-ai-bit.github.io/webar-lattices';

    try {
        // QR-Code für Hauptseite
        new QRCode(document.getElementById('qrcode-main'), {
            text: baseURL,
            width: 100,
            height: 100,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        // QR-Code für BCC Marker
        new QRCode(document.getElementById('qrcode-bcc'), {
            text: `${baseURL}/assets/markers/marker_bcc.png`,
            width: 100,
            height: 100,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        // QR-Code für Marker-Druckseite
        new QRCode(document.getElementById('qrcode-markers'), {
            text: `${baseURL}/assets/markers/print-markers.html`,
            width: 100,
            height: 100,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        console.log('[WebAR] QR-Codes erfolgreich generiert');
    } catch (error) {
        console.error('[WebAR] Fehler beim Generieren der QR-Codes:', error);
    }
}

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
