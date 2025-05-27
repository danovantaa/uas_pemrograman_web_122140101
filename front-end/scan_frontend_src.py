import os

def extract_js_jsx_files_to_md(src_dir, output_file):
    """
    Reads all .js and .jsx files within the specified src directory,
    excluding those in the 'components/ui' subdirectory, and writes
    their content to a Markdown file.
    """
    if not os.path.isdir(src_dir):
        print(f"❌ Directory '{src_dir}' not found. Ensure the script is run from the frontend project root.")
        return

    # Directory to be excluded, relative to src_dir
    EXCLUDE_DIR_RELATIVE_TO_SRC = os.path.join("components", "ui")

    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(f"# Frontend `src` Directory Scan\n\n")
        outfile.write(f"List of `.js` and `.jsx` files found in `{src_dir}` (excluding `{os.path.join(src_dir, EXCLUDE_DIR_RELATIVE_TO_SRC)}`):\n\n")

        found_files_count = 0
        
        for root, _, files in os.walk(src_dir):
            # Get the current directory's path relative to src_dir
            current_dir_relative_to_src = os.path.relpath(root, start=src_dir)
            
            # Skip 'components/ui' and its subdirectories
            if current_dir_relative_to_src.startswith(EXCLUDE_DIR_RELATIVE_TO_SRC):
                continue

            for file_name in files:
                if file_name.endswith(".js") or file_name.endswith(".jsx"):
                    file_path = os.path.join(root, file_name)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            # Get path relative to the current working directory
                            relative_path_from_cwd = os.path.relpath(file_path, start=os.getcwd())
                            outfile.write(f"\n\n---\n### File: {relative_path_from_cwd}\n\n")
                            outfile.write(content)
                            found_files_count += 1
                    except Exception as e:
                        print(f"⚠️ Failed to read file {file_path}: {e}")
        
    if found_files_count > 0:
        print(f"✅ Done. Found {found_files_count} `.js`/`.jsx` files. Content saved to '{output_file}'.")
    else:
        print(f"ℹ️ No `.js` or `.jsx` files found in '{src_dir}' (after exclusion).")

if __name__ == "__main__":
    FRONTEND_SRC_DIRECTORY = "src" # Assumes 'src' directory is at the frontend project root
    OUTPUT_MARKDOWN_FILE_NAME = "frontend_context_no_ui.md"
    
    extract_js_jsx_files_to_md(FRONTEND_SRC_DIRECTORY, OUTPUT_MARKDOWN_FILE_NAME)
