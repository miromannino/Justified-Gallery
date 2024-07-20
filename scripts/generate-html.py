import os


def generate_html_for_images(
    folder_path,
    output_file="output.html",
    relative_path="../imgs/"
  ):
  """
  Generate HTML code for images stored in a specified folder.

  Args:
  - folder_path (str): The path to the folder containing images.
  - output_file (str): The file to save the generated HTML code.
  - relative_path (str): The relative path to use for the href and src attributes.
  """

  image_files = [
      f for f in os.listdir(folder_path) if f.lower().endswith(
          ('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

  image_files.sort()

  html_content = []

  for image_file in image_files:
    # Extract aspect ratio from the filename (e.g., "random_img_16_9.jpg")
    # Assume filename format is "{random_prefix}_img_{aspect_ratio}.jpg"
    parts = image_file.split('_')
    if len(parts) >= 4:  # Check if filename contains expected parts
      aspect_ratio = parts[2] + ":" + parts[3].split('.')[0]
    else:
      aspect_ratio = "Unknown"

    img_path = os.path.join(relative_path, image_file)
    html_snippet = f"""
        <a href="{img_path}" title="title {aspect_ratio}">
            <img src="{img_path}" alt="Image {aspect_ratio}" />
        </a>
        """
    html_content.append(html_snippet.strip())

  full_html = "\n".join(html_content)
  with open(output_file, 'w') as f:
    f.write(full_html)

  print(f"HTML saved to {output_file}")


if __name__ == "__main__":
  generate_html_for_images(
      folder_path='../test/browser/imgs',
      output_file='../test/browser/html/gallery.html',
      relative_path='../imgs/')
