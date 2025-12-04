#!/usr/bin/env python3
"""
AR Marker Generator
===================

Creates feature-rich markers optimized for MindAR image tracking.
These markers have high contrast patterns with many trackable features.
"""

from PIL import Image, ImageDraw, ImageFont
import os
import math

OUTPUT_DIR = "assets/markers"
MARKER_SIZE = 640  # 640x640 pixels (recommended for MindAR)

def create_bcc_marker():
    """
    Creates BCC (Body-Centered Cubic) marker with geometric pattern
    """
    img = Image.new('RGB', (MARKER_SIZE, MARKER_SIZE), 'white')
    draw = ImageDraw.Draw(img)

    # Black border
    border_width = 40
    draw.rectangle([0, 0, MARKER_SIZE, MARKER_SIZE], outline='black', width=border_width)

    # Center cube pattern (3D cube illusion)
    center = MARKER_SIZE // 2
    cube_size = 200

    # Draw 3D cube in isometric view
    # Front face
    points_front = [
        (center - cube_size//2, center),
        (center + cube_size//2, center),
        (center + cube_size//2, center + cube_size//2),
        (center - cube_size//2, center + cube_size//2)
    ]
    draw.polygon(points_front, fill='black', outline='black')

    # Top face
    points_top = [
        (center - cube_size//2, center),
        (center, center - cube_size//3),
        (center + cube_size, center - cube_size//3),
        (center + cube_size//2, center)
    ]
    draw.polygon(points_top, fill='gray', outline='black')

    # Side face
    points_side = [
        (center + cube_size//2, center),
        (center + cube_size, center - cube_size//3),
        (center + cube_size, center + cube_size//6),
        (center + cube_size//2, center + cube_size//2)
    ]
    draw.polygon(points_side, fill='dimgray', outline='black')

    # Center dot (body-centered atom)
    center_dot_size = 30
    draw.ellipse([
        center - center_dot_size,
        center - center_dot_size,
        center + center_dot_size,
        center + center_dot_size
    ], fill='white', outline='black', width=3)

    # Corner dots (8 corner atoms)
    corner_size = 20
    corners = [
        (100, 100), (540, 100), (100, 540), (540, 540),  # Main corners
        (200, 200), (440, 200), (200, 440), (440, 440)   # Inner feature points
    ]
    for x, y in corners:
        draw.ellipse([x - corner_size, y - corner_size, x + corner_size, y + corner_size],
                     fill='black', outline='white', width=2)

    # Add "BCC" text at bottom
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    text = "BCC"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    draw.text((center - text_width//2, MARKER_SIZE - 80), text, fill='black', font=font)

    return img

def create_fcc_marker():
    """
    Creates FCC (Face-Centered Cubic) marker with diamond pattern
    """
    img = Image.new('RGB', (MARKER_SIZE, MARKER_SIZE), 'white')
    draw = ImageDraw.Draw(img)

    # Black border
    border_width = 40
    draw.rectangle([0, 0, MARKER_SIZE, MARKER_SIZE], outline='black', width=border_width)

    center = MARKER_SIZE // 2

    # Large diamond in center (representing face-centered structure)
    diamond_size = 220
    points_diamond = [
        (center, center - diamond_size),  # Top
        (center + diamond_size, center),  # Right
        (center, center + diamond_size),  # Bottom
        (center - diamond_size, center)   # Left
    ]
    draw.polygon(points_diamond, fill='black', outline='black')

    # Smaller white diamond inside
    small_diamond = 150
    points_small = [
        (center, center - small_diamond),
        (center + small_diamond, center),
        (center, center + small_diamond),
        (center - small_diamond, center)
    ]
    draw.polygon(points_small, fill='white', outline='black', width=3)

    # Face-centered dots (6 face positions)
    face_size = 25
    faces = [
        (center, 100),      # Top face
        (center, 540),      # Bottom face
        (100, center),      # Left face
        (540, center),      # Right face
        (center - 120, center - 120),  # Diagonal
        (center + 120, center + 120)   # Diagonal
    ]
    for x, y in faces:
        draw.ellipse([x - face_size, y - face_size, x + face_size, y + face_size],
                     fill='black', outline='white', width=2)

    # Corner squares (8 corner atoms)
    square_size = 25
    corners = [
        (120, 120), (520, 120), (120, 520), (520, 520),
        (220, 220), (420, 220), (220, 420), (420, 420)
    ]
    for x, y in corners:
        draw.rectangle([x - square_size, y - square_size, x + square_size, y + square_size],
                       fill='gray', outline='black', width=2)

    # Add "FCC" text
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    text = "FCC"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    draw.text((center - text_width//2, MARKER_SIZE - 80), text, fill='black', font=font)

    return img

def create_hcp_marker():
    """
    Creates HCP (Hexagonal Close-Packed) marker with hexagonal pattern
    """
    img = Image.new('RGB', (MARKER_SIZE, MARKER_SIZE), 'white')
    draw = ImageDraw.Draw(img)

    # Black border
    border_width = 40
    draw.rectangle([0, 0, MARKER_SIZE, MARKER_SIZE], outline='black', width=border_width)

    center = MARKER_SIZE // 2

    # Large hexagon in center
    hex_radius = 200
    hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i  # 60 degrees
        x = center + hex_radius * math.cos(angle)
        y = center + hex_radius * math.sin(angle)
        hex_points.append((x, y))

    draw.polygon(hex_points, fill='black', outline='black')

    # Inner hexagon (white)
    inner_radius = 140
    inner_points = []
    for i in range(6):
        angle = math.pi / 3 * i
        x = center + inner_radius * math.cos(angle)
        y = center + inner_radius * math.sin(angle)
        inner_points.append((x, y))

    draw.polygon(inner_points, fill='white', outline='black', width=3)

    # Center hexagon (smallest)
    tiny_radius = 60
    tiny_points = []
    for i in range(6):
        angle = math.pi / 3 * i
        x = center + tiny_radius * math.cos(angle)
        y = center + tiny_radius * math.sin(angle)
        tiny_points.append((x, y))

    draw.polygon(tiny_points, fill='black', outline='black')

    # 6 hexagonal corner atoms
    corner_hex_radius = 30
    corner_distance = 220
    for i in range(6):
        angle = math.pi / 3 * i
        cx = center + corner_distance * math.cos(angle)
        cy = center + corner_distance * math.sin(angle)

        corner_points = []
        for j in range(6):
            angle_j = math.pi / 3 * j
            x = cx + corner_hex_radius * math.cos(angle_j)
            y = cy + corner_hex_radius * math.sin(angle_j)
            corner_points.append((x, y))

        draw.polygon(corner_points, fill='gray', outline='black', width=2)

    # Additional feature points (circles between hexagons)
    feature_size = 15
    feature_distance = 180
    for i in range(6):
        angle = math.pi / 3 * i + math.pi / 6  # Offset by 30 degrees
        fx = center + feature_distance * math.cos(angle)
        fy = center + feature_distance * math.sin(angle)
        draw.ellipse([fx - feature_size, fy - feature_size, fx + feature_size, fy + feature_size],
                     fill='white', outline='black', width=2)

    # Add "HCP" text
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    text = "HCP"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    draw.text((center - text_width//2, MARKER_SIZE - 80), text, fill='black', font=font)

    return img

def main():
    """Main function"""
    print("="*70)
    print("  AR MARKER GENERATOR")
    print("="*70)
    print(f"Output: {OUTPUT_DIR}")
    print(f"Size: {MARKER_SIZE}x{MARKER_SIZE} pixels")
    print("="*70)

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"[OK] Created directory: {OUTPUT_DIR}")

    print("\n[*] Creating markers...")

    # Create BCC marker
    print("\n  [BCC] Body-Centered Cubic...")
    bcc_img = create_bcc_marker()
    bcc_path = os.path.join(OUTPUT_DIR, "marker_bcc.png")
    bcc_img.save(bcc_path, optimize=True)
    print(f"     [OK] Saved: {bcc_path}")

    # Create FCC marker
    print("\n  [FCC] Face-Centered Cubic...")
    fcc_img = create_fcc_marker()
    fcc_path = os.path.join(OUTPUT_DIR, "marker_fcc.png")
    fcc_img.save(fcc_path, optimize=True)
    print(f"     [OK] Saved: {fcc_path}")

    # Create HCP marker
    print("\n  [HCP] Hexagonal Close-Packed...")
    hcp_img = create_hcp_marker()
    hcp_path = os.path.join(OUTPUT_DIR, "marker_hcp.png")
    hcp_img.save(hcp_path, optimize=True)
    print(f"     [OK] Saved: {hcp_path}")

    print("\n" + "="*70)
    print("  MARKER CREATION COMPLETE")
    print("="*70)
    print("\nNext steps:")
    print("  1. Compile markers with MindAR:")
    print("     -> https://hiukim.github.io/mind-ar-js-doc/tools/compile")
    print("  2. Upload all 3 PNG files")
    print("  3. Download targets.mind")
    print("  4. Save to: assets/markers/targets.mind")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
