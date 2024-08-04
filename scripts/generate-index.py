import os
import subprocess


def generate_html_from_folder(folder_path, relative_path, output_html_path):
  file_list = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
  file_list.sort()

  html_content = """
<!doctype html>
<html>
  <head>
    <title>File Gallery</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }
      h1 {
        text-align: center;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      ul li {
        margin: 10px 0;
        font-size: 18px;
      }
      ul li a {
        text-decoration: none;
        color: #007bff;
        padding: 10px 20px;
        border: 1px solid #007bff;
        border-radius: 5px;
        display: inline-block;
      }
      ul li a:hover {
        background-color: #007bff;
        color: white;
      }
    </style>
  </head>
  <body>
    <h1>File Gallery</h1>
    <ul>
    """

  for file_name in file_list:
    file_path = os.path.join(folder_path, file_name)
    html_content += f'      <li><a href="{relative_path}/{file_name}">{file_name}</a></li>\n'

  html_content += """
    </ul>
  </body>
</html>
    """

  with open(output_html_path, 'w') as html_file:
    html_file.write(html_content)

  print(f"HTML file generated at {output_html_path}")

  try:
    prettier_path = os.path.join("..", "node_modules", ".bin", "prettier")
    subprocess.run([prettier_path, "--write", output_html_path], check=True)
    print(f"Prettier formatting applied to {output_html_path}")
  except subprocess.CalledProcessError as e:
    print(f"Failed to run Prettier on {output_html_path}: {e}")
  except FileNotFoundError:
    print(
        f"Prettier binary not found at {prettier_path}. Ensure pnpm is installed and Prettier is available."
    )


if __name__ == "__main__":
  folder_path = "../test/browser/html"
  relative_path = "./html"
  output_html_path = "../test/browser/index.html"

  generate_html_from_folder(folder_path, relative_path, output_html_path)
