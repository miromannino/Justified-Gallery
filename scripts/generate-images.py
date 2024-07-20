import random
import os
import argparse
from PIL import Image, ImageDraw, ImageFont
import string

SIZES = {
    100: 't',   # Thumbnail
    240: 'm',   # Small
    320: 'n',   # Medium
    500: '',     # Large (default)
    640: 'z',   # Extra Large
    1024: 'b'   # Huge
}

COLORS = [
    (255, 179, 186),  # Light Pink
    (255, 223, 186),  # Light Peach
    (255, 255, 186),  # Light Yellow
    (186, 255, 201),  # Light Mint
    (186, 225, 255),  # Light Sky Blue
    (201, 186, 255),  # Light Lavender
    (255, 186, 250),  # Light Pink Lavender
    (255, 200, 250),  # Light Lilac
    (250, 200, 255),  # Light Purple
    (200, 255, 250),  # Light Aqua
    (240, 248, 255),  # Alice Blue
    (224, 255, 255),  # Light Cyan
    (240, 255, 240),  # Honeydew
    (255, 228, 225),  # Misty Rose
    (255, 240, 245),  # Lavender Blush
    (250, 235, 215),  # Antique White
    (245, 245, 220),  # Beige
    (230, 230, 250),  # Lavender
    (216, 191, 216),  # Thistle
    (255, 228, 196)   # Bisque
]

FRAME_COLORS = [
    (200, 200, 200),  # Grey Pastel
    (210, 180, 222),  # Thistle Pastel
    (238, 232, 170),  # Pale Goldenrod
    (255, 222, 173),  # Navajo White
    (244, 164, 96)    # Sandy Brown
]

ASPECT_RATIOS = [
    (1, 1),  # Square
    (4, 3),  # Standard Photo
    (16, 9),  # Widescreen
    (3, 2),  # Classic Print
    (5, 4),  # Nearly Square
    (4, 5),  # Portrait
    (2, 3),  # Portrait
    (9, 16)  # Tall (for vertical screens)
]


def lighten_color(color, factor=0.2):
  """Lighten the given color by the provided factor."""
  return tuple(min(int(c + (255 - c) * factor), 255) for c in color)


def darken_color(color, factor=0.2):
  """Darken the given color by the provided factor."""
  return tuple(max(int(c * (1 - factor)), 0) for c in color)


def create_gradient_image(width, height, base_color):
  """
  Create a gradient image using the base color.
  Top-left will be a lighter version of the color,
  bottom-right will be a darker version.
  """
  start_color = lighten_color(base_color)
  end_color = darken_color(base_color)

  gradient_image = Image.new('RGB', (width, height))
  draw = ImageDraw.Draw(gradient_image)

  for y in range(height):
    for x in range(width):
      # Calculate interpolation factor
      factor = (x / width + y / height) / 2
      # Interpolate between start_color and end_color
      r = int(start_color[0] * (1 - factor) + end_color[0] * factor)
      g = int(start_color[1] * (1 - factor) + end_color[1] * factor)
      b = int(start_color[2] * (1 - factor) + end_color[2] * factor)
      draw.point((x, y), (r, g, b))

  return gradient_image


def generate_random_prefix(length=5):
  """Generate a random string prefix for filenames."""
  return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_placeholder_image(
    width,
    height,
    aspect_ratio_str,
    size_suffix,
    bg_color=(200, 200, 200),
    text_color=(0, 0, 0),
    output_dir='./output',
    frame_color=(0, 0, 0),
    frame_width=5
  ):
  # Create gradient background
  gradient_image = create_gradient_image(width, height, base_color=bg_color)

  draw = ImageDraw.Draw(gradient_image)

  # Draw the frame
  draw.rectangle(
      [(frame_width // 2, frame_width // 2),
       (width - frame_width // 2 - 1, height - frame_width // 2 - 1)],
      outline=frame_color,
      width=frame_width
  )

  # Text to include aspect ratio and resolution in two lines
  human_readable_aspect_ratio = aspect_ratio_str.replace('_', ':')
  text_line1 = f"Aspect: {human_readable_aspect_ratio}"
  text_line2 = f"Resolution: {width}x{height}"

  # Use a better font and increase the font size
  try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 40)
  except IOError:
    font = ImageFont.load_default()

  # Calculate text size for both lines
  text_bbox1 = draw.textbbox((0, 0), text_line1, font=font)
  text_width1 = text_bbox1[2] - text_bbox1[0]
  text_height1 = text_bbox1[3] - text_bbox1[1]

  text_bbox2 = draw.textbbox((0, 0), text_line2, font=font)
  text_width2 = text_bbox2[2] - text_bbox2[0]
  text_height2 = text_bbox2[3] - text_bbox2[1]

  # Calculate the total text height and center positions
  total_text_height = text_height1 + text_height2 + 10  # Adding 10 pixels spacing between lines
  text_x1 = (width - text_width1) // 2
  text_x2 = (width - text_width2) // 2
  text_y = (height - total_text_height) // 2

  # Draw the text, centered
  draw.text((text_x1, text_y), text_line1, fill=text_color, font=font)
  draw.text((text_x2, text_y + text_height1 + 10), text_line2, fill=text_color, font=font)

  # Ensure output directory exists
  os.makedirs(output_dir, exist_ok=True)

  # Construct the filename with a random prefix to avoid repetition
  random_prefix = generate_random_prefix()
  filename = f"{random_prefix}_{aspect_ratio_str}"
  if size_suffix:
    filename += f"_{size_suffix}"
  filename += ".jpg"
  output_path = os.path.join(output_dir, filename)
  gradient_image.save(output_path)

  print(f"Image saved to {output_path}")


def generate_images(num_images=2, output_dir='./images'):
  # Ensure the output directory exists
  os.makedirs(output_dir, exist_ok=True)

  # Calculate how many aspect ratios to use
  num_aspect_ratios = min(num_images, len(ASPECT_RATIOS))
  selected_aspect_ratios = random.sample(ASPECT_RATIOS, k=num_aspect_ratios)

  # Assign random colors for each selected aspect ratio
  aspect_ratio_colors = {ratio: random.choice(COLORS) for ratio in selected_aspect_ratios}

  # Generate images
  for i in range(num_images):
    # Cycle through the selected aspect ratios to create images
    aspect_ratio = selected_aspect_ratios[i % num_aspect_ratios]
    aspect_ratio_str = f"{aspect_ratio[0]}_{aspect_ratio[1]}"

    # Get the assigned color for this aspect ratio
    bg_color = aspect_ratio_colors[aspect_ratio]
    frame_color = random.choice(FRAME_COLORS)

    # Generate images for each size
    for size, size_suffix in SIZES.items():
      # Calculate dimensions based on the aspect ratio
      if aspect_ratio[0] >= aspect_ratio[1]:  # Width is larger than or equal to height
        width = size
        height = int(size * aspect_ratio[1] / aspect_ratio[0])
      else:  # Height is larger than width
        height = size
        width = int(size * aspect_ratio[0] / aspect_ratio[1])

      # Generate the placeholder image with a frame
      generate_placeholder_image(
          width,
          height,
          aspect_ratio_str,
          size_suffix,
          bg_color=bg_color,
          text_color=(0, 0, 0),
          output_dir=output_dir,
          frame_color=frame_color,
          frame_width=5)


if __name__ == "__main__":
  parser = argparse.ArgumentParser(
      description="Generate multiple placeholder images with frames and gradient backgrounds.")
  parser.add_argument('-n', '--num-images', type=int, default=2,
                      help='Number of images to generate (default: 2).')
  parser.add_argument('-o', '--output-dir', type=str, default='./images',
                      help='Output directory to save images (default: ./images).')

  args = parser.parse_args()

  generate_images(num_images=args.num_images, output_dir=args.output_dir)
