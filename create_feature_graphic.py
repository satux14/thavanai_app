#!/usr/bin/env python3
"""
Create Play Store Feature Graphic (1024x500)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create a 1024x500 image
width, height = 1024, 500
img = Image.new('RGB', (width, height), color='#2c3e89')  # Blue background matching icon

# Create draw object
draw = ImageDraw.Draw(img)

# Try to load app icon
icon_path = 'assets/icon.png'
if os.path.exists(icon_path):
    icon = Image.open(icon_path)
    # Resize icon to fit feature graphic (350x350)
    icon = icon.resize((350, 350), Image.Resampling.LANCZOS)
    # Paste icon on the left side
    img.paste(icon, (50, 75), icon if icon.mode == 'RGBA' else None)

# Add gradient overlay for better text visibility
for i in range(height):
    opacity = int(255 * (1 - i / height) * 0.2)
    draw.rectangle([(0, i), (width, i+1)], fill=(0, 0, 0, opacity))

# Add text on the right side
try:
    # Try to use a system font
    title_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 56)
    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 32)
except:
    # Fallback to default font
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()

# Title text
title = "eThavanai Book"
title_tamil = "தினத்தவணைப் புத்தகம்"
subtitle = "Daily Installment Ledger"
tagline = "Digital lending made simple"

# Calculate text positions
text_x = 450
title_y = 120

# Draw title
draw.text((text_x, title_y), title, fill='white', font=title_font)

# Draw Tamil title
draw.text((text_x, title_y + 70), title_tamil, fill='#ffc107', font=subtitle_font)

# Draw subtitle
draw.text((text_x, title_y + 130), subtitle, fill='#e3f2fd', font=subtitle_font)

# Draw tagline
draw.text((text_x, title_y + 180), tagline, fill='#90caf9', font=subtitle_font)

# Add decorative elements (bottom line)
draw.rectangle([(text_x, 450), (text_x + 500, 455)], fill='#ffc107')

# Save the image
output_path = 'play-store-assets/feature-graphic-1024x500.png'
img.save(output_path, 'PNG', optimize=True)
print(f"✅ Feature graphic created: {output_path}")
print(f"   Size: {width}x{height} px")
print(f"   Format: PNG")

