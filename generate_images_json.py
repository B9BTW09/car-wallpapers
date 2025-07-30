import os
import json

IMAGES_PATH = './images'  # hovedmappen med bilbilder

def generate_images_json():
    images = []
    for category in os.listdir(IMAGES_PATH):
        category_path = os.path.join(IMAGES_PATH, category)
        if os.path.isdir(category_path):
            for filename in os.listdir(category_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                    images.append({
                        "filename": filename,
                        "category": category,
                        "device": "Telefon"  # eller "PC", kan du evt. tilpasse
                    })

    with open(os.path.join(IMAGES_PATH, 'images.json'), 'w') as f:
        json.dump(images, f, indent=2)
    print(f"Generated {len(images)} image entries in {IMAGES_PATH}/images.json")

if __name__ == "__main__":
    generate_images_json()
