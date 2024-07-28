import os
import subprocess


def update_html_gallery(folder_path, html_files_path, relative_path="../imgs/"):
  """
  Update the gallery section in all HTML files in a folder, and format them with Prettier.

  Args:
  - folder_path (str): The path to the folder containing images.
  - html_files_path (str): The folder containing HTML files to update.
  - relative_path (str): The relative path to use for the href and src attributes.
  """
  # Fetch image files with valid extensions
  image_files = [
      f for f in os.listdir(folder_path) if f.lower().endswith(
          ('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
  image_files.sort()

  # Generate HTML content for the images
  html_content = []
  for image_file in image_files:
    # Extract aspect ratio from the filename (e.g., "random_16_9_suffix.jpg")
    # Assume filename format is "{random_prefix}_img_{aspect_ratio}_{suffix}.jpg"
    parts = image_file.split('_')
    if len(parts) == 3:
      aspect_ratio = parts[1] + ":" + parts[2].split('.')[0]
      thumbnail_img_file = parts[0] + '_' + parts[1] + '_' + \
          parts[2].split('.')[0] + '_t.' + parts[2].split('.')[1]
    else:
      continue

    img_path = os.path.join(relative_path, image_file)
    thumbnail_img_path = os.path.join(relative_path, thumbnail_img_file)
    html_snippet = f"""
        <a href="{img_path}" title="title {aspect_ratio}">
            <img src="{thumbnail_img_path}" alt="Image {aspect_ratio}" />
        </a>
        """
    html_content.append(html_snippet.strip())

  # Join the HTML snippets into a single string
  new_gallery_content = "\n".join(html_content)

  # Process each HTML file in the html_files_path
  for html_file in os.listdir(html_files_path):
    if html_file.endswith('.html'):
      html_file_path = os.path.join(html_files_path, html_file)

      # Read the existing HTML file
      with open(html_file_path, 'r') as f:
        html_data = f.read()

      # Locate the gallery section
      start_marker = "<!-- GALLERY START -->"
      end_marker = "<!-- GALLERY END -->"

      start_idx = html_data.find(start_marker)
      end_idx = html_data.find(end_marker)

      if start_idx == -1 or end_idx == -1:
        print(f"Gallery markers not found in {html_file_path}. Skipping.")
        continue

      # Insert the new gallery content between the markers
      updated_html_data = (
          html_data[:start_idx + len(start_marker)] +  # Up to the end of the start marker
          "\n<div id=\"gallery\">\n" +
          new_gallery_content +
          "\n</div>\n" +
          html_data[end_idx:]  # From the start of the end marker onward
      )

      # Write the updated content back to the file
      with open(html_file_path, 'w') as f:
        f.write(updated_html_data)

      print(f"Gallery updated in {html_file_path}")

      # Run Prettier to format the file using the locally installed Prettier via pnpm
      try:
        prettier_path = os.path.join("..", "node_modules", ".bin", "prettier")
        subprocess.run([prettier_path, "--write", html_file_path], check=True)
        print(f"Prettier formatting applied to {html_file_path}")
      except subprocess.CalledProcessError as e:
        print(f"Failed to run Prettier on {html_file_path}: {e}")
      except FileNotFoundError:
        print(
          f"Prettier binary not found at {prettier_path}. Ensure pnpm is installed and Prettier is available.")


if __name__ == "__main__":
  update_html_gallery(
      folder_path='../test/browser/imgs',
      html_files_path='../test/browser/html',
      relative_path='../imgs/')
