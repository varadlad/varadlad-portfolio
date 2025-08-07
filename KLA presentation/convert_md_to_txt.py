#!/usr/bin/env python3
"""
Convert Visual_Elements_Presentation_Guide.md to plain text format
"""

import re

def convert_md_to_txt():
    """Convert markdown file to plain text with proper formatting"""
    
    input_file = "Visual_Elements_Presentation_Guide.md"
    output_file = "Visual_Elements_Presentation_Guide.txt"
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Convert markdown to plain text
        txt_content = []
        
        lines = content.split('\n')
        
        for line in lines:
            # Remove markdown headers and replace with text formatting
            if line.startswith('# '):
                txt_content.append('=' * 80)
                txt_content.append(line[2:].upper())
                txt_content.append('=' * 80)
            elif line.startswith('## '):
                txt_content.append('')
                txt_content.append(line[3:].upper())
                txt_content.append('-' * 60)
            elif line.startswith('### '):
                txt_content.append('')
                txt_content.append(line[4:])
                txt_content.append('-' * 40)
            elif line.startswith('#### '):
                txt_content.append('')
                txt_content.append(line[5:])
                txt_content.append('-' * 30)
            # Remove markdown formatting
            elif line.startswith('**') and line.endswith('**'):
                # Bold text - remove ** but keep content
                clean_line = line.replace('**', '')
                txt_content.append(clean_line)
            elif '**' in line:
                # Bold text within line - remove ** but keep content
                clean_line = line.replace('**', '')
                txt_content.append(clean_line)
            elif line.startswith('- '):
                # List items
                txt_content.append('  • ' + line[2:])
            elif line.startswith('* '):
                # List items
                txt_content.append('  • ' + line[2:])
            elif line.startswith('> '):
                # Quotes - add quotation marks
                txt_content.append('"' + line[2:] + '"')
            elif line.startswith('---'):
                # Horizontal rules
                txt_content.append('=' * 60)
            elif line.startswith('|') and '|' in line[1:]:
                # Table rows - convert to simple format
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                txt_content.append('  '.join(f'{cell:<20}' for cell in cells))
            else:
                # Regular lines - remove any remaining markdown
                clean_line = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)  # Remove links
                clean_line = re.sub(r'`([^`]+)`', r'"\1"', clean_line)      # Code to quotes
                clean_line = re.sub(r'\*([^*]+)\*', r'\1', clean_line)      # Remove italic
                clean_line = re.sub(r'_{1,2}([^_]+)_{1,2}', r'\1', clean_line)  # Remove underlines
                txt_content.append(clean_line)
        
        # Write the converted content
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(txt_content))
        
        print(f"✅ Successfully converted to: {output_file}")
        print(f"📄 Original file: {input_file}")
        print(f"📝 Lines converted: {len(txt_content)}")
        
        return output_file
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
        return None
    except Exception as e:
        print(f"❌ Error converting file: {str(e)}")
        return None

if __name__ == "__main__":
    convert_md_to_txt()