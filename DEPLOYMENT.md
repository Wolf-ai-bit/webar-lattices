# Deployment Guide - WebAR Kristallstrukturen

Komplette Anleitung zum Deployment auf GitHub Pages.

---

## Voraussetzungen

Bevor du deployest, stelle sicher, dass folgende Dateien existieren:

### Checkliste

- [ ] **GLB-Modelle** (6 Dateien in `assets/models/`):
  - `bcc_atom.glb`
  - `bcc_schematic.glb`
  - `fcc_atom.glb`
  - `fcc_schematic.glb`
  - `hcp_atom.glb`
  - `hcp_schematic.glb`

- [ ] **Marker-Datei**:
  - `assets/markers/targets.mind` (kompiliert mit MindAR)

- [ ] **Core-Dateien**:
  - `index.html`
  - `css/style.css`
  - `js/app.js`
  - `README.md`

- [ ] **Optional (empfohlen)**:
  - `assets/markers/marker_bcc.png`
  - `assets/markers/marker_fcc.png`
  - `assets/markers/marker_hcp.png`
  - `assets/markers/print-markers.html`

---

## Schritt 1: GLB-Modelle erstellen

Falls noch nicht geschehen, erstelle die GLB-Modelle aus ar-lattices:

### A) OBJ-Export aus ar-lattices

```batch
cd ..\ar-lattices\bin
ar-lattices.exe
```

Exportiere alle 6 Varianten mit der **E-Taste**:
- `[1] [A] [E]` → bcc_atom.obj
- `[1] [S] [E]` → bcc_schematic.obj
- `[2] [A] [E]` → fcc_atom.obj
- `[2] [S] [E]` → fcc_schematic.obj
- `[3] [A] [E]` → hcp_atom.obj
- `[3] [S] [E]` → hcp_schematic.obj

**Ausgabe:** `ar-lattices/bin/data/export/*.obj`

### B) OBJ → GLB Konvertierung

```batch
cd ..\ar-lattices
blender --background --python batch_convert_to_glb.py
```

**Ausgabe:** `ar-lattices/glb_output/*.glb`

### C) GLB-Dateien kopieren

```batch
xcopy glb_output\*.glb ..\webar-lattices\assets\models\ /Y
```

**Verifikation:**
```batch
dir ..\webar-lattices\assets\models\*.glb
```

Erwartete Ausgabe: **6 GLB-Dateien**, jeweils < 2 MB

---

## Schritt 2: AR-Marker erstellen

### A) Marker-Bilder designen

Erstelle 3 Marker-Bilder (siehe [ar-lattices/MARKER_GUIDE.md](../ar-lattices/MARKER_GUIDE.md)):
- `marker_krz.png` (640×640 px, high contrast) - Kubisch Raumzentriert
- `marker_kfz.png` (640×640 px, high contrast) - Kubisch Flächenzentriert
- `marker_hdp.png` (640×640 px, high contrast) - Hexagonal Dichteste Packung

**Speicherort:** `webar-lattices/assets/markers/`

### B) Marker kompilieren

**Online-Methode (empfohlen):**
1. Öffne: https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload alle 3 PNG-Dateien
3. Klicke "Start"
4. Download `targets.mind`
5. Speichere in `webar-lattices/assets/markers/targets.mind`

**CLI-Methode (alternativ):**
```bash
npm install -g mind-ar-cli

cd webar-lattices/assets/markers
mind-ar-cli compile \
  --input marker_bcc.png \
  --input marker_fcc.png \
  --input marker_hcp.png \
  --output targets.mind
```

**Verifikation:**
- `targets.mind` sollte existieren (ca. 100-500 KB)
- Online-Tool zeigt Feature-Points an (mindestens 50+ pro Marker)

---

## Schritt 3: Git Repository einrichten

### A) Git initialisieren (falls noch nicht geschehen)

```bash
cd webar-lattices
git init
```

### B) .gitignore erstellen

Erstelle `.gitignore` Datei:

```
# Development
node_modules/
.DS_Store
Thumbs.db
.vscode/
*.log

# Temporary files
*.tmp
*.bak

# Optional: Marker-Quellen (falls sehr groß)
# assets/markers/*.psd
# assets/markers/*.ai
```

### C) Erste Commit erstellen

```bash
git add .
git commit -m "Initial commit: WebAR Kristallstrukturen

- 6 GLB-Modelle (BCC/FCC/HCP, Atom/Schematic)
- MindAR Image Tracking
- Responsive UI mit Mode-Toggle
- Complete documentation"
```

---

## Schritt 4: GitHub Repository erstellen

### A) Auf GitHub

1. Gehe zu: https://github.com/new
2. **Repository name:** `webar-lattices`
3. **Description:** "WebAR visualization of crystal structures (BCC, FCC, HCP) with atom/schematic modes"
4. **Visibility:** Public
5. **Keine** README, .gitignore oder License hinzufügen (bereits vorhanden)
6. Klicke "Create repository"

### B) Remote hinzufügen

```bash
git remote add origin https://github.com/Wolf-ai-bit/webar-lattices.git
git branch -M main
git push -u origin main
```

**Verifikation:**
- Öffne https://github.com/Wolf-ai-bit/webar-lattices
- Alle Dateien sollten sichtbar sein

---

## Schritt 5: GitHub Pages aktivieren

### A) Settings konfigurieren

1. Gehe zu: **Repository → Settings → Pages** (linke Sidebar)
2. **Source:**
   - Branch: `main`
   - Folder: `/ (root)`
3. Klicke **"Save"**

### B) Warten auf Deployment

- **Dauer:** 1-3 Minuten
- **Status:** Prüfe oben auf der Pages-Seite:
  - "Your site is ready to be published" → Warte noch
  - "Your site is published" → Fertig!

### C) URL öffnen

Deine Seite ist verfügbar unter:
```
https://Wolf-ai-bit.github.io/webar-lattices
```

**Testen:**
1. Öffne URL im Browser
2. Erlaube Kamera-Zugriff
3. Halte einen Marker vor die Kamera
4. Modell sollte erscheinen

---

## Schritt 6: Testing

### Desktop-Testing

**Chrome/Firefox/Safari:**
```
https://Wolf-ai-bit.github.io/webar-lattices
```

1. Öffne die URL
2. Klicke "AR starten"
3. Erlaube Kamera-Zugriff
4. Zeige Marker vor Webcam
5. Teste Mode-Toggle

### Mobile-Testing

**Smartphone (iOS/Android):**

1. **QR-Code generieren** (optional):
   - https://www.qr-code-generator.com/
   - Eingabe: `https://Wolf-ai-bit.github.io/webar-lattices`
   - Scannen mit Smartphone

2. **Direkt öffnen:**
   - Öffne URL im mobilen Browser (Chrome/Safari)
   - Erlaube Kamera-Zugriff
   - Halte gedruckten Marker vor die Kamera (10-50 cm Abstand)

3. **Testing-Checklist:**
   - [ ] Kamera startet
   - [ ] Marker wird erkannt (KRZ/KFZ/HDP)
   - [ ] 3D-Modell erscheint über Marker
   - [ ] Modell rotiert
   - [ ] Mode-Toggle funktioniert
   - [ ] UI ist responsiv

---

## Schritt 7: Optimierungen (Optional)

### A) Custom Domain einrichten

Falls du eine eigene Domain hast:

1. **DNS konfigurieren:**
   - Erstelle CNAME-Record: `webar.deine-domain.de` → `Wolf-ai-bit.github.io`

2. **GitHub Pages konfigurieren:**
   - Settings → Pages → Custom domain
   - Eingabe: `webar.deine-domain.de`
   - Warte auf DNS-Propagation (bis zu 24h)

3. **HTTPS erzwingen:**
   - Checkbox: "Enforce HTTPS" aktivieren

### B) Performance-Optimierung

**GLB-Dateien weiter komprimieren:**

Falls Dateien > 2 MB sind:
```python
# In batch_convert_to_glb.py:
MAX_POLYGONS = 30000  # Reduzieren von 50000
```

**CDN verwenden:**
- GitHub Pages ist bereits schnell (CDN-backed)
- Optional: Cloudflare für zusätzliches Caching

### C) Analytics hinzufügen (Optional)

Google Analytics oder Plausible hinzufügen für Besucherstatistik:

```html
<!-- In index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Schritt 8: Monitoring & Maintenance

### A) GitHub Actions (CI/CD)

Erstelle `.github/workflows/deploy.yml` für automatisches Deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### B) Fehlerüberwachung

**Browser-Console Monitoring:**
- Öffne: https://Wolf-ai-bit.github.io/webar-lattices
- F12 → Console
- Prüfe auf Fehler (rot)

**Typische Fehler:**
- `404 Not Found` → GLB-Datei fehlt
- `Camera permission denied` → User muss Berechtigung erteilen
- `Failed to load targets.mind` → Marker-Datei fehlt/falsch

### C) Updates deployen

Nach Änderungen:
```bash
git add .
git commit -m "Update: [Beschreibung der Änderung]"
git push
```

GitHub Pages aktualisiert automatisch (1-2 Minuten).

---

## Schritt 9: Dokumentation finalisieren

### README.md aktualisieren

Füge Live-Demo-Link hinzu:

```markdown
## Live Demo

**GitHub Pages:** [https://Wolf-ai-bit.github.io/webar-lattices](https://Wolf-ai-bit.github.io/webar-lattices)
```

### Social Media Share

**Screenshot erstellen:**
1. Öffne die Live-Demo
2. Halte Marker vor Kamera
3. Screenshot (F12 → Rechtsklick auf Viewport → "Capture Screenshot")
4. Speichere als `assets/preview.png`

**Teilen:**
- Twitter/X: "WebAR Kristallstrukturen live! [Link]"
- LinkedIn: "Neue WebAR-Visualisierung von Metallgittern..."
- Reddit: r/webdev, r/augmentedreality

---

## Troubleshooting

### Problem: GitHub Pages zeigt 404

**Lösung:**
- Warte 2-5 Minuten nach Aktivierung
- Prüfe Branch: Muss `main` sein
- Prüfe Folder: Muss `/ (root)` sein
- Hard Refresh: Strg+Shift+R

### Problem: Modelle laden nicht (404)

**Lösung:**
```bash
# Prüfe Dateipfade:
git ls-files | grep "\.glb$"

# Erwartete Ausgabe:
# assets/models/bcc_atom.glb
# assets/models/bcc_schematic.glb
# ... (6 Dateien)
```

Falls Dateien fehlen:
```bash
git add assets/models/*.glb
git commit -m "Add GLB models"
git push
```

### Problem: Marker wird nicht erkannt

**Lösung:**
- Prüfe `targets.mind` Dateigröße (sollte > 10 KB sein)
- Neu-kompilieren mit MindAR Compiler
- Marker-Qualität verbessern (höherer Kontrast)

### Problem: HTTPS-Fehler

**Lösung:**
- GitHub Pages erzwingt automatisch HTTPS
- Falls Custom Domain: DNS CNAME korrekt setzen
- Warte auf SSL-Zertifikat (bis zu 24h)

---

## Erfolgsmetriken

Nach erfolgreichem Deployment sollte:

**Live-Demo funktionieren:**
- https://Wolf-ai-bit.github.io/webar-lattices öffnet sich

**Kamera-Zugriff funktionieren:**
- Browser fragt nach Berechtigung
- Kamera-Feed wird angezeigt

**AR-Tracking funktionieren:**
- Marker werden erkannt (< 1 Sekunde)
- 3D-Modelle erscheinen stabil über Marker

**Mode-Toggle funktionieren:**
- Umschalten zwischen Atom/Schematic ohne Ruckeln

**Mobile-Kompatibilität:**
- iOS Safari 14.3+
- Android Chrome 90+

---

## Nützliche Links

- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **MindAR Docs:** https://hiukim.github.io/mind-ar-js-doc/
- **WebAR Best Practices:** https://web.dev/ar/

---

## Finale Checkliste

- [ ] Alle GLB-Modelle hochgeladen (6 Dateien)
- [ ] `targets.mind` erstellt und hochgeladen
- [ ] Git Repository erstellt und gepusht
- [ ] GitHub Pages aktiviert
- [ ] Live-Demo getestet (Desktop)
- [ ] Live-Demo getestet (Mobile)
- [ ] README.md mit Live-Link aktualisiert
- [ ] Marker ausgedruckt und physisch getestet
- [ ] Dokumentation vollständig
- [ ] Repository auf Public gesetzt

---

**Glückwunsch!**

Dein WebAR-Projekt ist jetzt live unter:
**https://Wolf-ai-bit.github.io/webar-lattices**

---

**Version:** 1.0
**Autor:** AR-Lattices WebAR Project
**Datum:** 2025
