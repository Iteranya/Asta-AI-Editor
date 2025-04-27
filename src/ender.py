import re
import os

class MarkdownToLatexConverter:
    def __init__(self, markdown_content, output_path, template="default.tex"):
        """
        Initialize the converter with markdown content as string.
        
        Args:
            markdown_content (str): The markdown content to convert
            output_path (str): Path where the output LaTeX file will be saved
            template_path (str, optional): Path to a single .tex template file
        """
        self.markdown_content = markdown_content
        self.output_path = 'projects/'+output_path
        self.template_path = "latex/"+template
        self.current_appendix = False

    def load_template(self):
       
        try:
            with open(self.template_path, "r", encoding="utf-8") as template_file:
                return template_file.read()
        except Exception as e:
            print(f"Error loading template: {e}")
            return ""

    def convert_markdown(self):
        """Convert markdown content to LaTeX."""
        content = self.markdown_content

        content = self.convert_headings(content)
        content = self.convert_images(content)
        content = self.convert_tables(content)
        content = self.convert_bold_italic(content)
        content = self.convert_links(content)
        content = self.convert_lists(content)
        content = self.convert_code_blocks(content)
        content = self.convert_inline_code(content)
        
        return content

    def convert_bold_italic(self, content):
        content = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', content)
        content = re.sub(r'\*(.*?)\*', r'\\textit{\1}', content)
        return content

    def convert_links(self,content):
        # First, convert Markdown-style links to \href{url}{text}
        content = re.sub(r'\[([^\]]+)\]\((https?://[^\)]+)\)', r'\\href{\2}{\1}', content)
        
        # Then, convert bare URLs that are NOT already inside a \href or \url command
        # Use negative lookbehind to avoid already processed LaTeX links
        content = re.sub(r'(?<!\\href\{)(?<!\\url\{)(?<!\{)(https?://\S+)', r'\\url{\1}', content)
        
        return content

    def convert_lists(self, content):
        lines = content.split('\n')
        output = []
        stack = []  # Stack untuk menyimpan (indent_level, list_type)
        in_code_block = False
        
        for line in lines:
            stripped = line.strip()

            if stripped.startswith('```'):
                in_code_block = not in_code_block
                output.append(line)
                continue
            
            if in_code_block:
                output.append(line)
                continue

            # Hitung indentasi
            indent_level = len(line) - len(line.lstrip(' '))

            # Deteksi apakah baris adalah list
            unordered_match = re.match(r'^([*+-])\s+(.*)', line.lstrip())
            ordered_match = re.match(r'^(\d+)\.\s+(.*)', line.lstrip())
            is_list_item = unordered_match or ordered_match

            if is_list_item:
                current_type = 'itemize' if unordered_match else 'enumerate'
                content_text = unordered_match.group(2) if unordered_match else ordered_match.group(2)

                # Jika stack kosong atau indent lebih dalam
                while stack and stack[-1][0] > indent_level:
                    output.append(f'\\end{{{stack.pop()[1]}}}')

                if not stack or indent_level > stack[-1][0]:
                    output.append(f'\\begin{{{current_type}}}')
                    stack.append((indent_level, current_type))
                elif stack[-1][1] != current_type:
                    # Tutup tipe sebelumnya, buka tipe baru
                    output.append(f'\\end{{{stack.pop()[1]}}}')
                    output.append(f'\\begin{{{current_type}}}')
                    stack.append((indent_level, current_type))
                
                output.append(f'\\item {content_text}')
            else:
                while stack:
                    output.append(f'\\end{{{stack.pop()[1]}}}')
                output.append(line)

        while stack:
            output.append(f'\\end{{{stack.pop()[1]}}}')

        return '\n'.join(output)

    def convert_headings(self, content):
        lines = content.split('\n')
        in_code_block = False
        new_lines = []
        
        for line in lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                new_lines.append(line)
                continue
            
            if not in_code_block:
                match = re.match(r'^(#+)\s*(.*?)\s*#*$', line)
                if match:
                    level = len(match.group(1))
                    title = match.group(2).strip()
                    
                    if "appendix" in title.lower():
                        self.current_appendix = True
                        new_lines.append('\n\\appendix')
                    
                    latex_cmd = self.get_latex_heading(level, title)
                    new_lines.append(latex_cmd)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        return '\n'.join(new_lines)

    def get_latex_heading(self, level, title):
        if self.current_appendix:
            if level == 1:
                return f'\\chapter{{{title}}}'
            elif level == 2:
                return f'\\section{{{title}}}'
        else:
            if level == 1:
                return f'\\chapter{{{title}}}'
            elif level == 2:
                return f'\\section{{{title}}}'
            elif level == 3:
                return f'\\subsection{{{title}}}'
            elif level == 4:
                return f'\\subsubsection{{{title}}}'
        return title

    def convert_images(self,content):
        pattern = r'!\[(.*?)\]\(([^ \)]+)(?:\s+"(.*?)")?\)'

        # Use a replacement function for more control, especially for the label
        def replace_func(match):
            alt_text = match.group(1)
            image_path = match.group(2)
            # Optional: title = match.group(3) # If you need the title for something else

            # Generate a cleaner label key from the image filename (without extension)
            # Replace non-alphanumeric characters with underscores for safety
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            label_key = re.sub(r'[^a-zA-Z0-9]+', '_', base_name)
            if not label_key: # Handle cases where filename might be weird
                label_key = "image"

            # Build the LaTeX string
            return (
                f'\\begin{{figure}}[ht]\n'
                f'  \\centering\n'
                f'  \\includegraphics[width=0.8\\textwidth]{{{image_path}}}\n' # Use group 2 (path only)
                f'  \\caption{{{alt_text}}}\n'                            # Use group 1 (alt text)
                f'  \\label{{fig:{label_key}}}\n'                         # Use cleaned label key
                f'\\end{{figure}}\n' # Added newline for better spacing in output
            )

        return re.sub(pattern, replace_func, content)

    def convert_tables(self, content):
        lines = content.split('\n')
        in_table = False
        table_rows = []
        table_content = []
        
        for line in lines:
            if line.strip().startswith('|') and '---' not in line:
                in_table = True
                table_rows.append(line.strip())
            elif in_table:
                in_table = False
                table_content.append(self.process_table(table_rows))
                table_rows = []
            else:
                if in_table:
                    table_rows.append(line.strip())
                else:
                    table_content.append(line)
        
        return '\n'.join(table_content)
    
    def convert_code_blocks(self, content):
        return re.sub(
            r'```(?:\w*\n)?(.*?)```',
            lambda m: r'\begin{verbatim}' + '\n' + m.group(1).strip() + '\n' + r'\end{verbatim}',
            content,
            flags=re.DOTALL
        )
    
    def convert_inline_code(self,content):
        return re.sub(r'`([^`]+)`', r'\\texttt{\1}', content)

    def process_table(self, rows):
        headers = [h.strip() for h in rows[0].split('|')[1:-1]]
        alignments = ['X' for _ in headers]
        latex = [
            '\\begin{table}[ht]',
            '  \\centering',
            '  \\caption{Caption}',
            f'  \\begin{{tabularx}}{{\\textwidth}}{{|{"|".join(alignments)}|}}',
            '    \\hline',
            '    ' + ' & '.join(headers) + ' \\\\',
            '    \\hline'
        ]
        
        for row in rows[2:]:
            cells = [c.strip() for c in row.split('|')[1:-1]]
            latex.append('    ' + ' & '.join(cells) + ' \\\\')
            latex.append('    \\hline')
        
        latex.extend([
            '  \\end{tabularx}',
            '\\end{table}'
        ])
        return '\n'.join(latex)

    def generate_latex(self):
        """Generate the final LaTeX document by combining template and converted content."""
        # Load template if provided
        template_content = self.load_template()
        
        # Convert markdown content
        latex_content = self.convert_markdown()
        
        # Check if template contains document environment
        has_document_env = "\\begin{document}" in template_content
        has_end_document = "\\end{document}" in template_content
        
        # Prepare final content
        if has_document_env:
            # If template has document environment, insert content before \end{document}
            if has_end_document:
                final_content = template_content.replace("\\end{document}", latex_content + "\n\\end{document}")
            else:
                final_content = template_content + "\n" + latex_content + "\n\\end{document}"
        else:
            # If template doesn't have document environment, just concatenate
            final_content = template_content + "\n" + latex_content + "\n\\end{document}"

        # Write to output file
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(final_content)