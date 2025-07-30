#!/usr/bin/env python3
"""
Refactored Portfolio PDF Generator
Generates a comprehensive PDF version of Varad Lad's portfolio projects with all requested improvements
"""

import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white, gray
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfgen import canvas
from PIL import Image as PILImage
import textwrap
from datetime import datetime
import re

class RefactoredPortfolioPDFGenerator:
    def __init__(self, output_filename="Varad_Lad_Portfolio_Projects.pdf"):
        self.output_filename = output_filename
        self.doc = SimpleDocTemplate(
            output_filename,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )
        self.styles = self._create_styles()
        self.story = []
        self.page_width = letter[0] - 1.5*inch  # Available width
        
    def _create_styles(self):
        """Create custom styles for the PDF"""
        styles = getSampleStyleSheet()
        
        # Custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=HexColor('#fbd109'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='ProjectTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=12,
            textColor=HexColor('#2c3e50'),
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=HexColor('#fbd109'),
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='CustomBodyText',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            textColor=black,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))
        
        styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            textColor=black,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leftIndent=20
        ))
        
        styles.add(ParagraphStyle(
            name='IntroText',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            textColor=black,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))
        
        styles.add(ParagraphStyle(
            name='CategoryText',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            textColor=gray,
            alignment=TA_RIGHT,
            fontName='Helvetica'
        ))
        
        styles.add(ParagraphStyle(
            name='TOCTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=20,
            textColor=HexColor('#2c3e50'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='TOCEntry',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            textColor=black,
            alignment=TA_LEFT,
            fontName='Helvetica'
        ))
        
        return styles
    
    def _load_image(self, image_path, max_width=None, max_height=None):
        """Load and resize image for PDF"""
        if not os.path.exists(image_path):
            print(f"Warning: Image not found: {image_path}")
            return None
        
        try:
            # Open with PIL to get dimensions
            with PILImage.open(image_path) as img:
                img_width, img_height = img.size
            
            # Calculate scaling
            scale = 1.0
            if max_width and img_width > max_width:
                scale = min(scale, max_width / img_width)
            if max_height and img_height > max_height:
                scale = min(scale, max_height / img_height)
            
            # Load image for ReportLab
            img = Image(image_path)
            img.drawWidth = img_width * scale
            img.drawHeight = img_height * scale
            
            return img
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            return None
    
    def _add_introduction_page(self):
        """Add introduction page"""
        title = Paragraph("Varad Lad", self.styles['CustomTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.3*inch))
        
        intro_text = Paragraph(
            "Mechanical Engineer & Data Scientist<br/><br/>"
            "Portfolio showcasing expertise in thermal systems, CFD analysis, semiconductor R&D, "
            "and advanced manufacturing processes, reflecting my experience in both R&D and industrial applications.<br/><br/>"
            "This portfolio demonstrates proficiency in engineering simulation, data analysis, "
            "and practical problem-solving across diverse technical domains.",
            self.styles['IntroText']
        )
        self.story.append(intro_text)
        self.story.append(PageBreak())
    
    def _add_index_page(self):
        """Add index/table of contents page with proper dot leaders and spacing"""
        title = Paragraph("Table of Contents", self.styles['TOCTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.3*inch))
        
        projects = [
            ("Data Center Advanced Thermal Optimization", "Data Center / CFD & Thermal Analysis"),
            ("Land-Based Cooling Pod Data Center (Microsoft Inspired)", "Data Center / CFD Analysis"),
            ("Thin-Film PV Efficiency & Manufacturing Roadmap", "Semiconductor R&D / Materials Engineering"),
            ("AI Powered – Outreach Automation Bot for Gmail", "Robotics & Automation / Data Analytics"),
            ("Deposition Rate Optimization for Semiconductor Materials", "Semiconductor R&D / Process Optimization"),
            ("UFO Aerodynamics CFD Analysis", "CFD & FEA / Aerodynamics"),
            ("CFD Explorations: From Earth's Gravity to Supersonic Jets", "CFD Analysis / Multi-Physics"),
            ("Applied CFD — Heat Transfer in Half Pipe Geometry", "CFD & Heat Transfer"),
            ("Industrial-Grade Brick-Making Machine", "Mechanical Design / Manufacturing"),
            ("Sustainable 3 Stage HEPA Air Filter", "Mechanical Design / Environmental Engineering"),
            ("Hydraulic Ram Pump for Rural Water Supply", "Mechanical Design / Fluid Systems"),
            ("Advanced PLC-Controlled Automatic Packaging Machine", "Automation / Control Systems"),
            ("Mister-Enhanced Vapor-Compression System", "Thermal Systems / HVAC"),
            ("DOE-Driven Pour-Over Coffee Optimization", "Data Analytics / Process Optimization"),
            ("Image Compression via Singular-Value Decomposition", "Data Analytics / MATLAB"),
            ("Automatic Password Generator with Python", "Software Development / Python"),
            ("CAD Models Collection", "Mechanical Design / 3D Modeling")
        ]
        
        # Create table data with proper spacing and dot leaders
        table_data = []
        for i, (title, category) in enumerate(projects, 1):
            # Create entry with dot leaders for proper spacing
            entry = f"{i}. {title}"
            table_data.append([entry, category])
        
        # Create table with proper styling and generous spacing
        table = Table(table_data, colWidths=[4.2*inch, 2.3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#fbd109')),
            ('TEXTCOLOR', (0, 0), (-1, 0), black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (0, -1), 10),
            ('RIGHTPADDING', (1, 0), (1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        self.story.append(table)
        self.story.append(PageBreak())
    
    def _add_project_section(self, title, category, thumbnail_path, sections):
        """Add a complete project section with proper image placement"""
        # Project title
        project_title = Paragraph(title, self.styles['ProjectTitle'])
        self.story.append(project_title)
        
        # Category
        if category:
            cat_p = Paragraph(f"<i>Category: {category}</i>", self.styles['CategoryText'])
            self.story.append(cat_p)
            self.story.append(Spacer(1, 0.1*inch))
        
        # Thumbnail image right after title
        if thumbnail_path and os.path.exists(thumbnail_path):
            thumbnail = self._load_image(thumbnail_path, max_width=self.page_width*0.6, max_height=2.5*inch)
            if thumbnail:
                self.story.append(thumbnail)
                self.story.append(Spacer(1, 0.2*inch))
        
        # Add each section (What, How, Results, etc.)
        for section in sections:
            if 'header' in section:
                # Standardize section headers to title case
                header_text = section['header'].title()
                header = Paragraph(header_text, self.styles['SectionHeader'])
                self.story.append(header)
                self.story.append(Spacer(1, 0.1*inch))
            
            if 'content' in section:
                for content_item in section['content']:
                    if content_item.startswith('•'):
                        # Ensure bullet points end with periods
                        if not content_item.endswith('.'):
                            content_item += '.'
                        bullet_p = Paragraph(content_item, self.styles['BulletPoint'])
                        self.story.append(bullet_p)
                    else:
                        content_p = Paragraph(content_item, self.styles['CustomBodyText'])
                        self.story.append(content_p)
            
            # Add images for this section
            if 'images' in section:
                self.story.append(Spacer(1, 0.1*inch))
                for img_path in section['images']:
                    if os.path.exists(img_path):
                        img = self._load_image(img_path, max_width=self.page_width*0.8, max_height=3*inch)
                        if img:
                            self.story.append(img)
                            self.story.append(Spacer(1, 0.1*inch))
            
            self.story.append(Spacer(1, 0.2*inch))
        
        # Page break after each project
        self.story.append(PageBreak())
    
    def _format_text_with_improvements(self, text):
        """Apply all text formatting improvements"""
        # Fix R&D; to R&D
        text = text.replace('R&D;', 'R&D')
        
        # Add non-breaking spaces between numbers and units
        text = re.sub(r'(\d+)\s*°C', r'\1\u00A0°C', text)
        text = re.sub(r'(\d+)\s*W/m²', r'\1\u00A0W/m²', text)
        text = re.sub(r'(\d+)\s*kW', r'\1\u00A0kW', text)
        text = re.sub(r'(\d+)\s*%', r'\1\u00A0%', text)
        text = re.sub(r'(\d+)\s*×', r'\1\u00A0×', text)
        
        # Standardize dashes
        # En dash for ranges
        text = re.sub(r'(\d+)\s*-\s*(\d+)', r'\1–\2', text)
        # Em dash for sentence breaks (replace double hyphens)
        text = text.replace('--', '—')
        
        return text
    
    def generate_pdf(self):
        """Generate the complete portfolio PDF"""
        print("Generating refactored portfolio PDF...")
        
        # Add introduction page
        self._add_introduction_page()
        
        # Add index page
        self._add_index_page()
        
        # Project 1: Data Center Advanced Thermal Optimization
        self._add_project_section(
            "Data Center Advanced Thermal Optimization",
            "Data Center / CFD & Thermal Analysis",
            "project-images/DC-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Data center cooling consumes nearly 50\u00A0% of total energy, making efficiency critical.',
                        '• Traditional air cooling struggles with hotspots and thermal stratification in high-density racks.',
                        '• Liquid cooling offers the potential to remove heat at the source, reducing energy use and improving temperature uniformity.',
                        '• The project aimed to compare air vs. liquid cooling to identify scalable, cost-effective thermal strategies.',
                        '• Real-world conditions were simulated to benchmark methods for modern data center loads (~10\u00A0kW per rack).'
                    ],
                    'images': ['project-images/air-cooled-pie-chart.png', 'project-images/liquid-cooled-pie-chart.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Developed a detailed 3D model of a data center rack and environment in Fusion 360, including modular air and liquid cooling features.',
                        '• Ran CFD simulations in SimScale to analyze heat transfer and airflow under realistic load conditions.',
                        '• Implemented hot aisle containment and adaptive fan control to enhance air cooling performance.',
                        '• Analyzed simulation results in Python, computing metrics like rack temperatures and cooling energy needs.',
                        '• Visualized outcomes via an interactive Streamlit dashboard for clear comparison of cooling methods.'
                    ],
                    'images': ['project-images/airflow-architecture-diagram.svg', 'project-images/liquid-cooling-diagram.svg']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Improved cooling performance by 27\u00A0% and reduced hotspots by 32\u00A0% with optimized design.',
                        '• Liquid cooling kept inlet temperatures up to 15\u00A0°C cooler than air cooling at the same load.',
                        '• Hot aisle containment lowered upper-rack temperatures and enhanced airflow efficiency.',
                        '• Projected PUE improved from ~1.5 (air-cooled) to ~1.1 (liquid-cooled hybrid system).',
                        '• Demonstrated a scalable, low-cost approach to guide future smart thermal management strategies.'
                    ],
                    'images': ['project-images/performance-comparison-chart.png']
                }
            ]
        )
        
        # Project 2: Land-Based Cooling Pod Data Center
        self._add_project_section(
            "Land-Based Cooling Pod Data Center (Microsoft Inspired)",
            "Data Center / CFD Analysis", 
            "project-images/underwater-dc-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Conventional data centers face high failure rates and energy costs due to thermal cycling and corrosion.',
                        '• Project Natick showed that sealed nitrogen pods underwater cut failure rates by 8\u00A0× and achieved PUE ~1.07.',
                        '• The project explored adapting Natick\'s sealed, nitrogen-filled pod concept for land-based data centers.',
                        '• The goal was to quantify reliability, thermal stability, and energy efficiency gains.',
                        '• Aimed to provide a practical design blueprint for land deployment.'
                    ]
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed two CAD models: a standard open rack and a sealed nitrogen pod with integrated cooling.',
                        '• Conducted CFD simulations in SimScale to compare thermal profiles and cooling demands.',
                        '• Tested variations in nitrogen concentration, insulation, and coolant temperature for optimization.',
                        '• Applied species transport models to track nitrogen levels and oxygen exclusion in the sealed pod.',
                        '• Used corrosion and thermal cycling models to project reliability benefits.'
                    ]
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Temperature swings were dramatically reduced in the sealed pod, with daily fluctuations dropping from ±6\u00A0°C in open racks to just ±1\u00A0°C.',
                        '• Thermal reliability improved by 25\u00A0% and projected failure rates dropped by 35–40\u00A0%.',
                        '• Energy flow analysis shows that the pod design reduces cooling energy demand by ~10\u00A0%.',
                        '• The design provides a robust operational cycle with routine inspection and nitrogen replenishment for long-term reliability.'
                    ]
                }
            ]
        )
        
        # Project 3: Thin-Film PV Efficiency
        self._add_project_section(
            "Thin-Film PV Efficiency & Manufacturing Roadmap",
            "Semiconductor R&D / Materials Engineering",
            "project-images/thin-film-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Investigation into the potential of thin-film solar photovoltaic technologies to achieve over 30\u00A0% cell efficiency and large-scale manufacturing by 2035.',
                        '• Focus on advances in semiconductor materials, device engineering, and fabrication processes to enable scaled manufacturing of high-tech solar devices.',
                        '• The 30\u00A0% efficiency target is significant as it doubles the efficiency of current commercial panels and approaches the theoretical limits for single-junction solar cells.',
                        '• Global scope aligns with energy agencies\' 2035 renewable energy cost reduction milestones.'
                    ],
                    'images': ['project-images/thin-film-pv-efficiency-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Multidisciplinary systems modeling combining engineering assessments and market trends.',
                        '• Engineering models estimate efficiency potential via quantum dot configurations, defect suppression, and bandgap optimizations.',
                        '• Economic models forecast manufacturing expansion and cost learning under various policy scenarios.',
                        '• Techno-economic simulations project adoption rates and R&D sensitivity.'
                    ]
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Provides probability distributions for thin-film solar cells surpassing 30\u00A0% efficiency and production forecasts by 2035.',
                        '• Projects major impact on solar PV capacity expansion and fossil fuel displacement.',
                        '• Offers insights for solar firms, policymakers, and research priorities in manufacturing and semiconductor synthesis.',
                        '• Contributes to global decarbonization trajectories.'
                    ],
                    'images': ['project-images/thin-film-pv-efficiency-img-2.png']
                }
            ]
        )
        
        # Project 4: AI Powered Outreach Automation Bot
        self._add_project_section(
            "AI Powered – Outreach Automation Bot for Gmail",
            "Robotics & Automation / Data Analytics",
            "project-images/ai-outreach-bot-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Automated email outreach system for job applications and professional networking.',
                        '• Integrates with Gmail API to send personalized emails at scale.',
                        '• Uses AI-powered templates and contact management for efficient communication.',
                        '• Designed to maintain professional standards while automating repetitive tasks.',
                        '• Includes analytics and tracking for campaign effectiveness.'
                    ],
                    'images': ['project-images/ai-outreach-bot-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Developed Python-based automation using Gmail API and OAuth2 authentication.',
                        '• Implemented template engine with Jinja2 for personalized email generation.',
                        '• Created contact management system with CSV import/export capabilities.',
                        '• Built dashboard for campaign analytics and performance tracking.',
                        '• Integrated rate limiting and error handling for reliable operation.'
                    ],
                    'images': ['project-images/ai-outreach-bot-img-2.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Automated 500+ personalized outreach emails with 95\u00A0% delivery success rate.',
                        '• Reduced manual email time by 80\u00A0% while maintaining personalization quality.',
                        '• Achieved 15\u00A0% response rate compared to industry average of 8\u00A0%.',
                        '• Generated comprehensive analytics dashboard for campaign optimization.',
                        '• Successfully integrated with multiple Gmail accounts for scalable operations.'
                    ],
                    'images': ['project-images/ai-outreach-bot-img-3.png']
                }
            ]
        )
        
        # Project 5: Deposition Rate Optimization
        self._add_project_section(
            "Deposition Rate Optimization for Semiconductor Materials",
            "Semiconductor R&D / Process Optimization",
            "project-images/deposition-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Optimization of thin-film deposition processes for semiconductor manufacturing.',
                        '• Focus on improving deposition rates while maintaining film quality and uniformity.',
                        '• Analysis of process parameters affecting deposition efficiency and material properties.',
                        '• Goal to reduce manufacturing costs and increase throughput in semiconductor fabrication.',
                        '• Investigation of various deposition techniques and their optimization strategies.'
                    ],
                    'images': ['project-images/deposition-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Conducted systematic parameter studies using design of experiments (DOE) methodology.',
                        '• Analyzed deposition rate dependencies on temperature, pressure, and gas flow rates.',
                        '• Implemented statistical modeling for process optimization and quality control.',
                        '• Used advanced characterization techniques to assess film quality and uniformity.',
                        '• Developed predictive models for deposition rate optimization.'
                    ],
                    'images': ['project-images/deposition-img-2.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 40\u00A0% improvement in deposition rates while maintaining film quality standards.',
                        '• Reduced process variability by 25\u00A0% through optimized parameter settings.',
                        '• Developed predictive models with 90\u00A0% accuracy for deposition rate forecasting.',
                        '• Implemented cost-effective process improvements reducing manufacturing costs by 15\u00A0%.',
                        '• Established robust quality control protocols for consistent film production.'
                    ],
                    'images': ['project-images/deposition-img-3.png']
                }
            ]
        )
        
        # Project 6: UFO Aerodynamics CFD Analysis
        self._add_project_section(
            "UFO Aerodynamics CFD Analysis",
            "CFD & FEA / Aerodynamics",
            "project-images/ufo-cfd-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Computational fluid dynamics analysis of unconventional aircraft geometries.',
                        '• Investigation of aerodynamic characteristics of disc-shaped vehicles.',
                        '• Analysis of lift, drag, and stability characteristics under various flight conditions.',
                        '• Comparison with traditional aircraft designs and performance metrics.',
                        '• Exploration of potential applications for unconventional aerodynamic configurations.'
                    ],
                    'images': ['project-images/ufo-cfd-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Created detailed 3D CAD models of disc-shaped aircraft configurations.',
                        '• Conducted comprehensive CFD simulations using ANSYS Fluent and OpenFOAM.',
                        '• Analyzed aerodynamic forces, pressure distributions, and flow patterns.',
                        '• Performed parametric studies varying angle of attack, velocity, and geometry.',
                        '• Implemented turbulence modeling and mesh refinement for accurate results.'
                    ],
                    'images': ['project-images/ufo-cfd-img-2.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Identified unique aerodynamic characteristics of disc-shaped configurations.',
                        '• Achieved lift-to-drag ratios comparable to conventional aircraft designs.',
                        '• Discovered potential stability advantages in certain flight regimes.',
                        '• Developed design guidelines for unconventional aerodynamic vehicles.',
                        '• Provided insights for future aircraft design and optimization strategies.'
                    ],
                    'images': ['project-images/ufo-cfd-img-3.png']
                }
            ]
        )
        
        # Project 7: CFD Explorations
        self._add_project_section(
            "CFD Explorations: From Earth's Gravity to Supersonic Jets",
            "CFD Analysis / Multi-Physics",
            "project-images/cfd-explorations-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Comprehensive CFD analysis spanning multiple physics domains and applications.',
                        '• Investigation of fluid dynamics from subsonic to supersonic flow regimes.',
                        '• Analysis of heat transfer, turbulence, and multi-phase flow phenomena.',
                        '• Exploration of environmental effects on fluid behavior and system performance.',
                        '• Development of computational models for complex engineering systems.'
                    ],
                    'images': ['project-images/cfd-explorations-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Utilized advanced CFD software including ANSYS Fluent, OpenFOAM, and SimScale.',
                        '• Implemented various turbulence models and numerical schemes for different flow regimes.',
                        '• Conducted mesh sensitivity studies and validation against experimental data.',
                        '• Applied multi-physics coupling for heat transfer and fluid-structure interaction.',
                        '• Developed custom post-processing scripts for comprehensive result analysis.'
                    ],
                    'images': ['project-images/cfd-explorations-img-2.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Successfully modeled flows ranging from 0.1 to 3.0 Mach numbers.',
                        '• Achieved grid convergence and validation with experimental benchmarks.',
                        '• Identified optimal turbulence models for different flow conditions.',
                        '• Developed efficient computational workflows for complex engineering problems.',
                        '• Provided insights for design optimization across multiple applications.'
                    ],
                    'images': ['project-images/cfd-explorations-img-3.png']
                }
            ]
        )
        
        # Project 8: Applied CFD Heat Transfer
        self._add_project_section(
            "Applied CFD — Heat Transfer in Half Pipe Geometry",
            "CFD & Heat Transfer",
            "project-images/half-pipe-cfd-thumbnail.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• CFD analysis of heat transfer in half-pipe heat exchanger geometries.',
                        '• Investigation of thermal performance and flow characteristics in curved channels.',
                        '• Analysis of heat transfer enhancement techniques and their effectiveness.',
                        '• Comparison of different heat exchanger configurations and performance metrics.',
                        '• Optimization of heat transfer surfaces for improved thermal efficiency.'
                    ],
                    'images': ['project-images/half-pipe-cfd-img-1.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Created detailed 3D models of half-pipe heat exchanger configurations.',
                        '• Implemented conjugate heat transfer analysis using ANSYS Fluent.',
                        '• Applied various turbulence models and boundary conditions for accurate simulation.',
                        '• Conducted parametric studies varying flow rates, temperatures, and geometries.',
                        '• Analyzed heat transfer coefficients, pressure drops, and thermal efficiency.'
                    ],
                    'images': ['project-images/half-pipe-cfd-img-2.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 30\u00A0% improvement in heat transfer coefficients with optimized designs.',
                        '• Reduced pressure drop by 20\u00A0% while maintaining thermal performance.',
                        '• Identified optimal flow conditions for maximum heat transfer efficiency.',
                        '• Developed design guidelines for half-pipe heat exchanger optimization.',
                        '• Provided insights for industrial heat exchanger design and operation.'
                    ],
                    'images': ['project-images/half-pipe-cfd-img-3.png']
                }
            ]
        )
        
        # Project 9: Industrial-Grade Brick-Making Machine
        self._add_project_section(
            "Industrial-Grade Brick-Making Machine",
            "Mechanical Design / Manufacturing",
            "project-images/brick-making-machine-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Design and development of automated brick-making machine for industrial production.',
                        '• Focus on high-volume manufacturing with consistent quality and reliability.',
                        '• Integration of mechanical, hydraulic, and control systems for automated operation.',
                        '• Optimization of production rates and material efficiency in brick manufacturing.',
                        '• Development of robust design for continuous industrial operation.'
                    ],
                    'images': ['project-images/brick-making-machine-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed complete mechanical system using SolidWorks and AutoCAD.',
                        '• Implemented hydraulic press system for consistent brick compression.',
                        '• Developed automated material handling and feeding mechanisms.',
                        '• Integrated PLC-based control system for production automation.',
                        '• Conducted stress analysis and optimization for industrial durability.'
                    ],
                    'images': ['project-images/brick-making-machine-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved production rate of 1000 bricks per hour with consistent quality.',
                        '• Reduced manual labor requirements by 80\u00A0% through automation.',
                        '• Improved brick strength and uniformity through optimized compression.',
                        '• Developed cost-effective design suitable for small to medium-scale production.',
                        '• Established maintenance protocols for long-term industrial operation.'
                    ],
                    'images': ['project-images/brick-making-machine-img-4.png']
                }
            ]
        )
        
        # Project 10: Sustainable 3 Stage HEPA Air Filter
        self._add_project_section(
            "Sustainable 3 Stage HEPA Air Filter",
            "Mechanical Design / Environmental Engineering",
            "project-images/hepa-filter-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Design of multi-stage HEPA air filtration system for environmental applications.',
                        '• Focus on sustainable materials and energy-efficient operation.',
                        '• Integration of pre-filter, HEPA filter, and activated carbon stages.',
                        '• Optimization of filtration efficiency and pressure drop characteristics.',
                        '• Development of modular design for various industrial applications.'
                    ],
                    'images': ['project-images/hepa-filter-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed three-stage filtration system using sustainable materials.',
                        '• Implemented computational fluid dynamics for airflow optimization.',
                        '• Developed modular housing design for easy maintenance and filter replacement.',
                        '• Integrated energy-efficient fan system with variable speed control.',
                        '• Conducted performance testing and validation of filtration efficiency.'
                    ],
                    'images': ['project-images/hepa-filter-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 99.97\u00A0% filtration efficiency for particles ≥0.3\u00A0μm.',
                        '• Reduced energy consumption by 25\u00A0% compared to conventional systems.',
                        '• Developed sustainable design using recyclable materials.',
                        '• Created modular system adaptable to various industrial applications.',
                        '• Established maintenance protocols for optimal long-term performance.'
                    ],
                    'images': ['project-images/hepa-filter-img-4.png']
                }
            ]
        )
        
        # Project 11: Hydraulic Ram Pump
        self._add_project_section(
            "Hydraulic Ram Pump for Rural Water Supply",
            "Mechanical Design / Fluid Systems",
            "project-images/ram-pump-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Design and development of hydraulic ram pump for rural water supply applications.',
                        '• Focus on sustainable water pumping without external power requirements.',
                        '• Optimization of pump efficiency and reliability for continuous operation.',
                        '• Development of cost-effective solution for remote water supply needs.',
                        '• Integration of mechanical and hydraulic systems for automated operation.'
                    ],
                    'images': ['project-images/ram-pump-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed hydraulic ram pump using fluid dynamics principles.',
                        '• Implemented check valve system for efficient water pumping.',
                        '• Developed pressure chamber design for optimal energy transfer.',
                        '• Conducted computational fluid dynamics analysis for performance optimization.',
                        '• Built and tested prototype for validation of design parameters.'
                    ],
                    'images': ['project-images/ram-pump-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 60\u00A0% efficiency in water pumping without external power.',
                        '• Developed reliable system capable of continuous 24/7 operation.',
                        '• Reduced installation and maintenance costs by 40\u00A0%.',
                        '• Created scalable design suitable for various rural applications.',
                        '• Established operational guidelines for optimal performance.'
                    ],
                    'images': ['project-images/ram-pump-img-4.png']
                }
            ]
        )
        
        # Project 12: PLC-Controlled Packaging Machine
        self._add_project_section(
            "Advanced PLC-Controlled Automatic Packaging Machine",
            "Automation / Control Systems",
            "project-images/packaging-machine-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Design and implementation of automated packaging system with PLC control.',
                        '• Integration of mechanical, electrical, and control systems for production automation.',
                        '• Focus on high-speed operation with consistent quality and reliability.',
                        '• Development of flexible system adaptable to various product types.',
                        '• Optimization of production efficiency and material handling.'
                    ],
                    'images': ['project-images/packaging-machine-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed mechanical system using CAD software for optimal performance.',
                        '• Implemented PLC-based control system for automated operation.',
                        '• Integrated sensors and actuators for precise product handling.',
                        '• Developed HMI interface for operator control and monitoring.',
                        '• Conducted system integration and performance testing.'
                    ],
                    'images': ['project-images/packaging-machine-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved production rate of 120 packages per minute with high accuracy.',
                        '• Reduced manual intervention by 90\u00A0% through automation.',
                        '• Improved packaging consistency and quality control.',
                        '• Developed flexible system adaptable to various product specifications.',
                        '• Established maintenance protocols for reliable long-term operation.'
                    ],
                    'images': ['project-images/packaging-machine-img-4.png']
                }
            ]
        )
        
        # Project 13: Mister-Enhanced Vapor-Compression System
        self._add_project_section(
            "Mister-Enhanced Vapor-Compression System",
            "Thermal Systems / HVAC",
            "project-images/mister-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Development of enhanced vapor-compression cooling system with misting technology.',
                        '• Integration of water misting for improved heat transfer and system efficiency.',
                        '• Optimization of cooling performance in high-temperature environments.',
                        '• Analysis of energy savings and performance improvements through misting enhancement.',
                        '• Development of control strategies for optimal misting operation.'
                    ],
                    'images': ['project-images/mister-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed misting system integration with conventional vapor-compression cycle.',
                        '• Implemented computational fluid dynamics for heat transfer analysis.',
                        '• Developed control algorithms for optimal misting timing and duration.',
                        '• Conducted experimental testing and performance validation.',
                        '• Analyzed energy consumption and efficiency improvements.'
                    ],
                    'images': ['project-images/mister-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 15\u00A0% improvement in cooling capacity through misting enhancement.',
                        '• Reduced energy consumption by 12\u00A0% compared to conventional systems.',
                        '• Improved system performance in high-temperature operating conditions.',
                        '• Developed control strategies for optimal misting operation.',
                        '• Established operational guidelines for enhanced system performance.'
                    ],
                    'images': ['project-images/mister-img-4.png']
                }
            ]
        )
        
        # Project 14: DOE-Driven Pour-Over Coffee Optimization
        self._add_project_section(
            "DOE-Driven Pour-Over Coffee Optimization",
            "Data Analytics / Process Optimization",
            "project-images/coffee-project-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Application of design of experiments (DOE) methodology to coffee brewing optimization.',
                        '• Systematic analysis of brewing parameters affecting coffee quality and consistency.',
                        '• Development of data-driven approach to process optimization in food preparation.',
                        '• Investigation of parameter interactions and their effects on final product quality.',
                        '• Creation of predictive models for coffee brewing optimization.'
                    ],
                    'images': ['project-images/coffee-project-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Designed factorial experiments to analyze brewing parameter effects.',
                        '• Implemented statistical analysis using R and Python for data processing.',
                        '• Developed response surface methodology for parameter optimization.',
                        '• Conducted sensory evaluation and quality assessment protocols.',
                        '• Created predictive models for coffee quality optimization.'
                    ],
                    'images': ['project-images/coffee-project-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Identified optimal brewing parameters for consistent coffee quality.',
                        '• Achieved 25\u00A0% improvement in taste consistency through parameter optimization.',
                        '• Developed predictive models with 85\u00A0% accuracy for quality forecasting.',
                        '• Established standardized brewing protocols for reproducible results.',
                        '• Created framework for data-driven food process optimization.'
                    ],
                    'images': ['project-images/coffee-project-img-4.png']
                }
            ]
        )
        
        # Project 15: Image Compression via SVD
        self._add_project_section(
            "Image Compression via Singular-Value Decomposition",
            "Data Analytics / MATLAB",
            "project-images/image-compression-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Implementation of image compression algorithms using singular value decomposition (SVD).',
                        '• Analysis of compression efficiency and image quality trade-offs.',
                        '• Development of mathematical framework for image data reduction.',
                        '• Investigation of SVD-based compression for various image types and sizes.',
                        '• Comparison with traditional compression methods and performance metrics.'
                    ],
                    'images': ['project-images/image-compression-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Implemented SVD algorithm in MATLAB for image matrix decomposition.',
                        '• Developed compression algorithms with variable compression ratios.',
                        '• Analyzed image quality metrics including PSNR and SSIM.',
                        '• Conducted performance testing on various image types and sizes.',
                        '• Created visualization tools for compression quality assessment.'
                    ],
                    'images': ['project-images/image-compression-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Achieved 80\u00A0% file size reduction while maintaining acceptable image quality.',
                        '• Developed compression ratios ranging from 10:1 to 50:1 depending on quality requirements.',
                        '• Created efficient algorithms suitable for real-time image processing.',
                        '• Established quality metrics for SVD-based compression optimization.',
                        '• Provided insights for mathematical image processing applications.'
                    ],
                    'images': ['project-images/image-compression-img-4.png']
                }
            ]
        )
        
        # Project 16: Automatic Password Generator
        self._add_project_section(
            "Automatic Password Generator with Python",
            "Software Development / Python",
            "project-images/password-img-1.png",
            [
                {
                    'header': 'What?',
                    'content': [
                        '• Development of secure password generation system using Python programming.',
                        '• Implementation of cryptographically secure random number generation.',
                        '• Focus on customizable password criteria and security features.',
                        '• Development of both command-line and graphical user interfaces.',
                        '• Integration of password strength analysis and security recommendations.'
                    ],
                    'images': ['project-images/password-img-2.png']
                },
                {
                    'header': 'How?',
                    'content': [
                        '• Implemented secure random number generation using Python\'s secrets module.',
                        '• Designed customizable password criteria (length, character sets, complexity).',
                        '• Added password strength analysis and security recommendations.',
                        '• Developed GUI using tkinter for user-friendly interface.',
                        '• Integrated command-line interface for automation and scripting.'
                    ],
                    'images': ['project-images/password-img-3.png']
                },
                {
                    'header': 'Results?',
                    'content': [
                        '• Created cryptographically secure password generator with customizable options.',
                        '• Implemented password strength analysis with entropy calculations.',
                        '• Developed user-friendly command-line and GUI interfaces.',
                        '• Achieved high entropy passwords suitable for security applications.',
                        '• Established framework for secure password generation systems.'
                    ],
                    'images': ['project-images/password-img-4.png']
                }
            ]
        )
        
        # Add CAD Models Collection
        self._add_cad_models_collection()
        
        # Build PDF
        self.doc.build(self.story)
        print(f"Refactored portfolio PDF generated successfully: {self.output_filename}")
    
    def _add_cad_models_collection(self):
        """Add CAD Models Collection with all images in proper grid layout"""
        title = Paragraph("CAD Models Collection", self.styles['ProjectTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.2*inch))
        
        # Description
        desc = Paragraph("A comprehensive collection of 3D CAD models showcasing mechanical design and modeling expertise across various engineering applications including manufacturing equipment, filtration systems, fluid machinery, and automation devices.", self.styles['CustomBodyText'])
        self.story.append(desc)
        self.story.append(Spacer(1, 0.3*inch))
        
        # All CAD model images with captions from HTML source
        cad_images = [
            ("project-images/cad-model/cad1.png", "Pump Motor Assembly"),
            ("project-images/cad-model/cad2.png", "Pump Housing Component"),
            ("project-images/cad-model/cad3.png", "Pump Assembly - Exploded View"),
            ("project-images/cad-model/cad4.png", "Pipe Manifold System"),
            ("project-images/cad-model/cad5.png", "Pipe Manifold - Alternate Design"),
            ("project-images/cad-model/cad6.png", "Screw Jack - Exploded View"),
            ("project-images/cad-model/cad7.png", "Screw Jack Assembly"),
            ("project-images/cad-model/cad8.png", "Mechanical Clamp"),
            ("project-images/cad-model/cad9.png", "Clamp - Exploded View"),
            ("project-images/cad-model/cad10.png", "V-Block Fixture"),
            ("project-images/cad-model/cad11.png", "Vane Rotor Assembly"),
            ("project-images/cad-model/cad12.png", "Toggle Clamp Mechanism"),
            ("project-images/cad-model/cad13.png", "Toggle Clamp - Exploded View"),
            ("project-images/cad-model/cad14.png", "Mount Bracket"),
            ("project-images/cad-model/cad15.png", "Housing Cover"),
            ("project-images/cad-model/cad16.png", "Bearing Block Assembly"),
            ("project-images/cad-model/cad17.png", "Bearing Block - Exploded View"),
            ("project-images/cad-model/cad18.png", "Hair Dryer Handle (Surface Modeling)"),
            ("project-images/cad-model/cad19.png", "Piston Head Assembly"),
            ("project-images/cad-model/cad20.png", "Water Jug (Surface Modeling)"),
            ("project-images/cad-model/cad21.png", "Water Jug - Alternate View"),
            ("project-images/cad-model/cad22.png", "Machining Block - Front View"),
            ("project-images/cad-model/cad23.png", "Machining Block - Isometric View"),
            ("project-images/cad-model/cad24.png", "Machining Block - Top View"),
            ("project-images/cad-model/cad25.png", "Drainer Sink (Surface Modeling)"),
            ("project-images/cad-model/cad26.png", "Bearing Cap")
        ]
        
        # Determine grid layout: ≤6 images = 2 per row, >6 images = 3 per row
        total_images = len(cad_images)
        images_per_row = 2 if total_images <= 6 else 3
        
        # Process images in rows
        for i in range(0, total_images, images_per_row):
            row_images = []
            row_captions = []
            
            # Get images for this row
            for j in range(i, min(i + images_per_row, total_images)):
                img_path, caption = cad_images[j]
                if os.path.exists(img_path):
                    img = self._load_image(img_path, max_width=self.page_width*(0.4 if images_per_row==2 else 0.3), max_height=2*inch)
                    if img:
                        row_images.append(img)
                        row_captions.append(Paragraph(caption, self.styles['CustomBodyText']))
            
            if row_images:
                # Create table for image row
                if images_per_row == 2:
                    # Two images per row
                    table_data = [row_images]
                    table = Table(table_data, colWidths=[self.page_width*0.45, self.page_width*0.45])
                else:
                    # Three images per row
                    table_data = [row_images]
                    table = Table(table_data, colWidths=[self.page_width*0.3, self.page_width*0.3, self.page_width*0.3])
                
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                    ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ]))
                self.story.append(table)
                
                # Add captions row
                if row_captions:
                    caption_table = Table([row_captions], colWidths=table._colWidths)
                    caption_table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 5),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                        ('TOPPADDING', (0, 0), (-1, -1), 2),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                    ]))
                    self.story.append(caption_table)
                
                self.story.append(Spacer(1, 0.15*inch))

if __name__ == "__main__":
    generator = RefactoredPortfolioPDFGenerator()
    generator.generate_pdf()
