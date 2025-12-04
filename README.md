# 🔬 WebAR Kristallstrukturen

Interaktive Augmented Reality Visualisierung von Metallgitterstrukturen: **BCC**, **FCC** und **HCP** mit umschaltbaren Darstellungsmodi.

![WebAR Lattices](assets/preview.png)

---

## 🎯 Features

- **3 Kristallstrukturen:**
  - **BCC** (Body-Centered Cubic) - Kubisch raumzentriert
  - **FCC** (Face-Centered Cubic) - Kubisch flächenzentriert
  - **HCP** (Hexagonal Close-Packed) - Hexagonal dichtest gepackt

- **2 Darstellungsmodi:**
  - **Atom-Modus**: Große, realistische Atome (berührend)
  - **Schematisch-Modus**: Kleine Atome mit sichtbaren Bindungen

- **AR Image Tracking** mit MindAR
- **Echtzeit Mode-Switching** ohne Marker-Verlust
- **Responsive UI** für Mobile & Desktop
- **3D-Rotation** der Modelle

---

## 🚀 Live Demo

**GitHub Pages:** [https://Wolf-ai-bit.github.io/webar-lattices](https://Wolf-ai-bit.github.io/webar-lattices)

**Testen:**
1. Öffne die Demo auf deinem Smartphone
2. Erlaube Kamera-Zugriff
3. Halte einen der [AR-Marker](#-ar-marker) vor die Kamera
4. Wechsle zwischen Atom- und Schematisch-Modus

---

## 📦 Projektstruktur

```
webar-lattices/
├── index.html                  # Haupt-HTML mit A-Frame Scene
├── css/
│   └── style.css               # UI-Styling
├── js/
│   └── app.js                  # Haupt-JavaScript-Logik
├── assets/
│   ├── models/                 # GLB 3D-Modelle
│   │   ├── bcc_atom.glb        # BCC Atom-Modus
│   │   ├── bcc_schematic.glb   # BCC Schematisch-Modus
│   │   ├── fcc_atom.glb        # FCC Atom-Modus
│   │   ├── fcc_schematic.glb   # FCC Schematisch-Modus
│   │   ├── hcp_atom.glb        # HCP Atom-Modus
│   │   └── hcp_schematic.glb   # HCP Schematisch-Modus
│   └── markers/                # AR-Marker
│       ├── targets.mind        # MindAR-kompilierte Marker-Datei
│       ├── marker_bcc.png      # BCC Marker-Bild
│       ├── marker_fcc.png      # FCC Marker-Bild
│       ├── marker_hcp.png      # HCP Marker-Bild
│       └── print-markers.html  # Marker-Druckvorlage
└── README.md                   # Diese Datei
```

---

## 🛠️ Technologie-Stack

| Technologie | Version | Zweck |
|------------|---------|-------|
| **MindAR** | 1.2.2 | AR Image Tracking |
| **A-Frame** | 1.4.2 | WebVR/AR Framework |
| **OpenFrameworks** | 0.12.1 | 3D-Modell-Export (C++) |
| **Blender** | 3.x | OBJ→GLB Konvertierung + Optimierung |
| **GitHub Pages** | - | Static Hosting |

---

## 📱 AR-Marker

### Herunterladen & Ausdrucken

Die AR-Marker befinden sich in [`assets/markers/`](assets/markers/):

- **[marker_bcc.png](assets/markers/marker_bcc.png)** - BCC (Kubisch raumzentriert)
- **[marker_fcc.png](assets/markers/marker_fcc.png)** - FCC (Kubisch flächenzentriert)
- **[marker_hcp.png](assets/markers/marker_hcp.png)** - HCP (Hexagonal dichtest gepackt)

**Druckanleitung:**
1. Öffne [`assets/markers/print-markers.html`](assets/markers/print-markers.html)
2. Drucke auf weißem Papier (A4, mindestens 300 DPI)
3. Schneide die Marker aus (optional: laminieren)
4. Marker sollte mindestens 10×10 cm groß sein

**Online-Anzeige:**
Du kannst die Marker auch am Desktop-Bildschirm anzeigen und mit Smartphone-Kamera testen.

---

## 💻 Lokales Setup

### Voraussetzungen
- Moderner Webbrowser (Chrome, Safari, Firefox)
- HTTPS-Server (erforderlich für WebAR)
- GLB-Modelle und `targets.mind` Datei

### Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/Wolf-ai-bit/webar-lattices.git
   cd webar-lattices
   ```

2. **Lokalen Server starten:**

   **Option 1: Python**
   ```bash
   python -m http.server 8000
   ```

   **Option 2: Node.js (http-server)**
   ```bash
   npx http-server -p 8000 --cors
   ```

   **Option 3: VS Code Live Server Extension**
   - Rechtsklick auf `index.html` → "Open with Live Server"

3. **Im Browser öffnen:**
   ```
   http://localhost:8000
   ```

   **Hinweis:** Für Smartphone-Testing benötigst du HTTPS:
   - Verwende `ngrok` für HTTPS-Tunnel:
     ```bash
     ngrok http 8000
     ```
   - Öffne die `https://...ngrok.io` URL auf deinem Smartphone

---

## 🎮 Verwendung

### Desktop-Testing (ohne AR)
1. Öffne `index.html` im Browser
2. Klicke "AR starten"
3. Zeige einen Marker vor der Webcam
4. Modell erscheint über dem Marker

### Mobile-Testing (AR)
1. Öffne die Seite auf deinem Smartphone (HTTPS erforderlich!)
2. Erlaube Kamera-Zugriff
3. Halte Marker vor die Kamera (10-50 cm Abstand)
4. Verwende den "Mode-Toggle" Button zum Wechseln

### Tastenkürzel (für Debugging)
- Browser-Konsole öffnen
- Eingabe: `window.debugWebAR()` → Zeigt App-State

---

## 🔧 Entwicklung

### Ordner-Struktur Konventionen

**CSS:**
- `style.css` - Haupt-Styling (keine externen Dependencies)

**JavaScript:**
- `app.js` - State-Management, AR-Tracking, UI-Logic
- Keine Build-Tools erforderlich (reines Vanilla JS)

**Assets:**
- **GLB-Modelle** müssen Draco-komprimiert sein (< 2 MB)
- **Marker** sollten high-contrast und feature-rich sein

### Eigene Modelle hinzufügen

1. **3D-Modell erstellen** (z.B. mit Blender, OpenFrameworks)
2. **Als OBJ exportieren**
3. **Mit Blender optimieren:**
   ```python
   # Siehe: ../ar-lattices/batch_convert_to_glb.py
   ```
4. **GLB in `assets/models/` kopieren**
5. **In `index.html` registrieren:**
   ```html
   <a-asset-item id="my-model" src="assets/models/my-model.glb"></a-asset-item>
   ```
6. **Target hinzufügen:**
   ```html
   <a-entity mindar-image-target="targetIndex: 3">
       <a-gltf-model src="#my-model" scale="0.8 0.8 0.8"></a-gltf-model>
   </a-entity>
   ```

### Neue Marker erstellen

1. **Marker-Bild designen** (mindestens 480×480 px, high contrast)
2. **Kompilieren mit MindAR Compiler:**
   - https://hiukim.github.io/mind-ar-js-doc/tools/compile
   - Upload alle Marker → Download `targets.mind`
3. **`targets.mind` ersetzen** in `assets/markers/`

---

## 📐 3D-Modell-Spezifikationen

### Geometrie-Parameter

| Struktur | Atome | Atom-Radius (Atom) | Atom-Radius (Schematic) | Bindungen |
|----------|-------|-------------------|------------------------|-----------|
| **BCC**  | 9     | 43.3 Units        | 10.0 Units             | Zentrum → 8 Ecken |
| **FCC**  | 14    | 35.35 Units       | 10.0 Units             | Ecken → nächste Flächen |
| **HCP**  | 17    | 30.0 Units        | 10.0 Units             | Hexagon-Kanten + Vertikal |

### Export-Workflow (aus OpenFrameworks)

```bash
# 1. Starte ar-lattices
cd ../ar-lattices/bin
./ar-lattices.exe

# 2. Exportiere alle Modelle:
# [1] [A] [E]  → bcc_atom.obj
# [1] [S] [E]  → bcc_schematic.obj
# [2] [A] [E]  → fcc_atom.obj
# [2] [S] [E]  → fcc_schematic.obj
# [3] [A] [E]  → hcp_atom.obj
# [3] [S] [E]  → hcp_schematic.obj

# 3. Konvertiere mit Blender:
cd ../ar-lattices
blender --background --python batch_convert_to_glb.py

# 4. Kopiere GLB-Dateien:
cp glb_output/*.glb ../webar-lattices/assets/models/
```

---

## 🚢 Deployment auf GitHub Pages

### Setup

1. **GitHub Repository erstellen** (falls nicht vorhanden)

2. **Dateien pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: WebAR Kristallstrukturen"
   git branch -M main
   git remote add origin https://github.com/Wolf-ai-bit/webar-lattices.git
   git push -u origin main
   ```

3. **GitHub Pages aktivieren:**
   - Gehe zu: Repository → Settings → Pages
   - Source: `main` Branch, `/` (root) Ordner
   - Klicke "Save"

4. **Warte ~2 Minuten**, dann ist die Seite verfügbar unter:
   ```
   https://Wolf-ai-bit.github.io/webar-lattices
   ```

### Wichtige Hinweise für GitHub Pages

- ✅ Alle Pfade müssen **relativ** sein (kein `/assets/`, sondern `assets/`)
- ✅ HTTPS ist automatisch aktiviert (wichtig für WebAR!)
- ✅ Große Dateien (> 100 MB) mit Git LFS verwalten
- ✅ `.nojekyll` Datei erstellen (falls Jekyll-Probleme)

---

## 🧪 Testing

### Desktop-Browser
- ✅ Chrome 90+ (empfohlen)
- ✅ Firefox 88+
- ✅ Safari 14+ (macOS)
- ⚠️ Edge (Chromium-basiert funktioniert)

### Mobile-Browser
- ✅ Chrome Android 90+
- ✅ Safari iOS 14.3+
- ⚠️ Samsung Internet (limitiert)
- ❌ In-App Browser (z.B. Instagram, Facebook)

### Marker-Tracking Qualität
- **Sehr gut:** Gedruckte Marker (matt, nicht glänzend)
- **Gut:** Desktop-Monitor → Smartphone-Kamera
- **Mittel:** Laptop-Bildschirm → Smartphone
- **Schlecht:** Smartphone → Smartphone (Spiegelung)

---

## ❓ Troubleshooting

### Problem: Kamera-Zugriff verweigert

**Lösung:**
- Stelle sicher, dass HTTPS verwendet wird (erforderlich für `getUserMedia`)
- Browser-Einstellungen: Kamera-Berechtigung für die Seite erlauben
- Mobile: Prüfe System-Einstellungen → Browser-App → Kamera-Berechtigung

### Problem: Marker wird nicht erkannt

**Lösung:**
1. Marker-Qualität prüfen:
   - Zu wenig Features? → Marker komplexer gestalten
   - Zu verschwommen? → Höhere Druckqualität
2. Abstand anpassen: 20-50 cm optimal
3. Beleuchtung verbessern: Diffuses Licht, keine direkten Reflexionen
4. Marker flach halten (nicht gebogen)

### Problem: GLB-Modelle laden nicht

**Lösung:**
- Prüfe Browser-Konsole auf 404-Fehler
- Stelle sicher, dass alle GLB-Dateien in `assets/models/` existieren
- Prüfe Dateigrößen: Jede Datei sollte < 2 MB sein
- Versuche einzelne Modelle mit Online-Viewer zu testen:
  https://gltf-viewer.donmccurdy.com/

### Problem: Mode-Toggle funktioniert nicht

**Lösung:**
- Browser-Konsole öffnen: `window.debugWebAR()`
- Prüfe, ob beide Modelle (atom + schematic) existieren
- Stelle sicher, dass Target aktiv ist (Marker muss erkannt sein)

### Problem: Schlechte Performance

**Lösung:**
- Polygon-Anzahl reduzieren (Blender Decimate Modifier)
- Draco-Kompression erhöhen (siehe `batch_convert_to_glb.py`)
- Ältere/schwächere Geräte: Resolution in `index.html` reduzieren

---

## 📚 Ressourcen & Links

### Dokumentation
- **MindAR:** https://hiukim.github.io/mind-ar-js-doc/
- **A-Frame:** https://aframe.io/docs/
- **OpenFrameworks:** https://openframeworks.cc/documentation/

### Tools
- **MindAR Compiler:** https://hiukim.github.io/mind-ar-js-doc/tools/compile
- **GLB Viewer:** https://gltf-viewer.donmccurdy.com/
- **Draco Compression:** https://google.github.io/draco/

### Verwandte Projekte
- **ar-lattices (OpenFrameworks):** `../ar-lattices/`
  - Export-Workflow-Dokumentation
  - C++ Quellcode für 3D-Modelle

---

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request für:
- Neue Kristallstrukturen
- UI-Verbesserungen
- Performance-Optimierungen
- Bug-Fixes
- Dokumentation

---

## 📄 Lizenz

Dieses Projekt ist frei verfügbar für Bildungszwecke.

**Dependencies:**
- MindAR: Apache 2.0 License
- A-Frame: MIT License
- OpenFrameworks: MIT License

---

## 👤 Autoren

**AR-Lattices WebAR Project**
- GitHub: [@Wolf-ai-bit](https://github.com/Wolf-ai-bit)
- Repository: https://github.com/Wolf-ai-bit/webar-lattices

---

## 🙏 Danksagungen

- MindAR Team für exzellentes AR-Framework
- A-Frame Community für WebVR/AR-Tools
- OpenFrameworks für 3D-Export-Funktionalität

---

**Version:** 1.0.0
**Letztes Update:** 2025
**Status:** ✅ Production Ready
