#!/usr/bin/env python3
"""
Combine all individual slide notes into one comprehensive document
"""

import os
import glob

def combine_slide_notes():
    """Combine all slide notes files into one comprehensive document"""
    
    # Slide titles for proper formatting
    slide_titles = {
        1: "Title Slide - Deposition Rate Optimization for Thin-Film Materials",
        2: "Introduction",
        3: "Background and Problem Statement", 
        4: "User Requirements",
        5: "Concept and Methodology",
        6: "Decision Framework (DOE & Design Tree)",
        7: "Technical Implementation & Parameter Mapping",
        8: "Bayesian Optimization Code and Analysis",
        9: "Results & Data Interpretation",
        10: "Metrology & Validation",
        11: "Relevance to KLA & Candidate Fit",
        12: "Q&A"
    }
    
    # Create combined document
    combined_content = []
    
    # Header
    combined_content.append("DEPOSITION RATE OPTIMIZATION FOR THIN-FILM MATERIALS")
    combined_content.append("=" * 80)
    combined_content.append("COMPLETE SPEAKER NOTES COMPILATION")
    combined_content.append("Technical Interview Presentation for KLA SensArray Division")
    combined_content.append("Varad Lad - Mechanical Manufacturing Design Engineer Candidate")
    combined_content.append("=" * 80)
    combined_content.append("")
    
    # Table of Contents
    combined_content.append("TABLE OF CONTENTS")
    combined_content.append("-" * 40)
    for slide_num, title in slide_titles.items():
        combined_content.append(f"Slide {slide_num:2d}: {title}")
    combined_content.append("")
    combined_content.append("=" * 80)
    combined_content.append("")
    
    # Process each slide notes file
    for slide_num in range(1, 13):
        filename = f"slide_{slide_num}_notes.txt"
        
        if os.path.exists(filename):
            # Add slide header
            slide_title = slide_titles.get(slide_num, f"Slide {slide_num}")
            combined_content.append(f"SLIDE {slide_num}: {slide_title.upper()}")
            combined_content.append("=" * 80)
            combined_content.append("")
            
            # Read and add content
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Extract just the notes content (skip the header)
                    lines = content.split('\n')
                    content_start = 0
                    for i, line in enumerate(lines):
                        if line.startswith('='):
                            content_start = i + 1
                            break
                    
                    # Add the actual notes content
                    notes_content = '\n'.join(lines[content_start:]).strip()
                    if notes_content:
                        combined_content.append(notes_content)
                    else:
                        combined_content.append("[No speaker notes available for this slide]")
                    
            except FileNotFoundError:
                combined_content.append(f"[Notes file not found: {filename}]")
            except Exception as e:
                combined_content.append(f"[Error reading {filename}: {str(e)}]")
            
            combined_content.append("")
            combined_content.append("-" * 80)
            combined_content.append("")
        else:
            combined_content.append(f"SLIDE {slide_num}: {slide_titles.get(slide_num, f'Slide {slide_num}').upper()}")
            combined_content.append("=" * 80)
            combined_content.append(f"[Notes file not found: {filename}]")
            combined_content.append("")
            combined_content.append("-" * 80)
            combined_content.append("")
    
    # Add footer
    combined_content.append("END OF SPEAKER NOTES")
    combined_content.append("=" * 80)
    combined_content.append("")
    combined_content.append("Document Information:")
    combined_content.append(f"- Total Slides: 12")
    combined_content.append(f"- Presentation Type: Technical Interview")
    combined_content.append(f"- Target Role: Mechanical Manufacturing Design Engineer")
    combined_content.append(f"- Company: KLA Corporation - SensArray Division")
    combined_content.append(f"- Candidate: Varad Lad")
    combined_content.append("")
    combined_content.append("Generated automatically from individual slide notes files.")
    
    # Write combined file
    output_filename = "Complete_Speaker_Notes.txt"
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write('\n'.join(combined_content))
    
    print(f"✅ Combined speaker notes created: {output_filename}")
    print(f"📄 Total slides processed: 12")
    print(f"📝 Document length: {len(combined_content)} lines")
    
    # Also create a markdown version for better formatting
    markdown_content = []
    markdown_content.append("# Deposition Rate Optimization for Thin-Film Materials")
    markdown_content.append("## Complete Speaker Notes Compilation")
    markdown_content.append("")
    markdown_content.append("**Technical Interview Presentation for KLA SensArray Division**")
    markdown_content.append("**Candidate:** Varad Lad - Mechanical Manufacturing Design Engineer")
    markdown_content.append("")
    markdown_content.append("---")
    markdown_content.append("")
    
    # Table of contents in markdown
    markdown_content.append("## Table of Contents")
    markdown_content.append("")
    for slide_num, title in slide_titles.items():
        markdown_content.append(f"{slide_num}. [{title}](#slide-{slide_num}-{title.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('&', 'and')})")
    markdown_content.append("")
    markdown_content.append("---")
    markdown_content.append("")
    
    # Process each slide for markdown
    for slide_num in range(1, 13):
        filename = f"slide_{slide_num}_notes.txt"
        
        if os.path.exists(filename):
            slide_title = slide_titles.get(slide_num, f"Slide {slide_num}")
            markdown_content.append(f"## Slide {slide_num}: {slide_title}")
            markdown_content.append("")
            
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.split('\n')
                    content_start = 0
                    for i, line in enumerate(lines):
                        if line.startswith('='):
                            content_start = i + 1
                            break
                    
                    notes_content = '\n'.join(lines[content_start:]).strip()
                    if notes_content:
                        markdown_content.append(notes_content)
                    else:
                        markdown_content.append("*No speaker notes available for this slide*")
                    
            except Exception as e:
                markdown_content.append(f"*Error reading notes: {str(e)}*")
            
            markdown_content.append("")
            markdown_content.append("---")
            markdown_content.append("")
    
    # Write markdown file
    markdown_filename = "Complete_Speaker_Notes.md"
    with open(markdown_filename, 'w', encoding='utf-8') as f:
        f.write('\n'.join(markdown_content))
    
    print(f"✅ Markdown version created: {markdown_filename}")
    
    return output_filename, markdown_filename

if __name__ == "__main__":
    combine_slide_notes()