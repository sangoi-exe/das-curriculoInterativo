import os
import re
from datetime import datetime
import subprocess

# Configurações do script
include_extensions = {'.ts', '.js', '.json', '.vue'}
ignore_dirs = {'.git', 'dist', 'node_modules', 'test', '__pycache__'}
ignore_files = {'package-lock.json'}
ignore_file_patterns = [re.compile(r'.*\.spec\.ts$')]

# Função para criar a árvore de diretórios
def tree(root_path, current_path, padding, outfile, print_files=False):
    full_path = os.path.join(root_path, current_path) if current_path else root_path
    items = os.listdir(full_path)
    dirs = [d for d in items if os.path.isdir(os.path.join(full_path, d)) and d not in ignore_dirs]
    files = [f for f in items if os.path.isfile(os.path.join(full_path, f)) and f not in ignore_files and
             f.endswith(tuple(include_extensions)) and not any(p.match(f) for p in ignore_file_patterns)]
    
    # Escreve arquivos no README.md
    for f in sorted(files):
        outfile.write(f"{padding}+-- {os.path.join(current_path, f)}\n")

    # Escreve subdiretórios e seus conteúdos recursivamente
    for d in sorted(dirs):
        dir_path = os.path.join(current_path, d)
        outfile.write(f"{padding}+-- {dir_path}\\\n")
        tree(root_path, dir_path, padding + '   ', outfile, print_files)

# Salvar o arquivo
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
output_file = 'README.md'  # Nome do arquivo de saída
root_directory = ''  # Começamos com uma string vazia para o diretório raiz

with open(output_file, 'w', encoding='utf-8') as outfile:
    outfile.write("# Project Structure\n\n")
    outfile.write(f"Timestamp: {timestamp}\n\n```\n")
    tree(os.getcwd(), root_directory, '', outfile, print_files=True)
    outfile.write("```\n")

print(f"Project snapshot saved to {output_file}")

# Enviar README para o repositório
try:
    subprocess.run(["git", "add", output_file], check=True)
    subprocess.run(["git", "commit", "-m", f"Update project structure on {timestamp}"], check=True)
    subprocess.run(["git", "push"], check=True)
    print("README.md updated and pushed to the repository.")
except subprocess.CalledProcessError as e:
    print(f"Error pushing to the repository: {e}")
