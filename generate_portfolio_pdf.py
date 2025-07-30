#!/usr/bin/env python3
"""
Portfolio PDF Generator
Generates a comprehensive PDF version of Varad Lad's portfolio projects
"""

import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
from PIL import Image as PILImage
import textwrap
from datetime import datetime

class PortfolioPDFGenerator:
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
            spaceAfter=20,
            textColor=HexColor('#fbd109'),
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        ))
        
        styles.add(ParagraphStyle(
            name='SectionTitle',
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
        
        return styles
    
    def add_introduction(self):
        """Add introduction page"""
        # Title
        title = Paragraph("Varad Lad - Engineering Portfolio Projects", self.styles['CustomTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 20))
        
        # Introduction text
        intro_text = """
        Welcome to my comprehensive engineering portfolio. This document presents a detailed overview of my key projects across various engineering disciplines including data center thermal optimization, semiconductor research, CFD analysis, robotics automation, and advanced materials engineering.
        
        Each project in this portfolio represents a significant engineering challenge that I have tackled using cutting-edge methodologies, advanced simulation tools, and innovative problem-solving approaches. From Microsoft-inspired nitrogen pod data centers to AI-powered automation systems, these projects demonstrate my expertise in mechanical design, thermal analysis, computational fluid dynamics, and process optimization.
        
        The projects are organized to showcase the breadth and depth of my engineering capabilities:
        • Data Center Cooling Solutions: Advanced thermal management systems for modern computing infrastructure
        • Semiconductor R&D: Materials optimization and thin-film photovoltaic research
        • CFD & FEA Analysis: Comprehensive fluid dynamics and structural analysis projects
        • Robotics & Automation: AI-powered systems for process automation
        • Process Engineering: Optimization of manufacturing and deposition processes
        
        Each project section includes detailed explanations of the problem statement, methodology, results, and technical achievements. The documentation reflects real-world engineering challenges and demonstrates proficiency with industry-standard tools including ANSYS Fluent, SimScale, Python, MATLAB, and various CAD platforms.
        
        This portfolio serves as a testament to my ability to deliver innovative engineering solutions that improve efficiency, reduce costs, and advance technological capabilities across multiple industries.
        """
        
        for paragraph in intro_text.strip().split('\n\n'):
            if paragraph.strip():
                p = Paragraph(paragraph.strip(), self.styles['IntroText'])
                self.story.append(p)
                self.story.append(Spacer(1, 12))
        
        # Add date and contact info
        self.story.append(Spacer(1, 30))
        contact_info = f"""
        <b>Varad Lad</b><br/>
        Senior Mechanical Engineer<br/>
        Email: vlad3@asu.edu<br/>
        LinkedIn: linkedin.com/in/varadlad<br/>
        Generated: {datetime.now().strftime('%B %Y')}
        """
        contact_p = Paragraph(contact_info, self.styles['CustomBodyText'])
        self.story.append(contact_p)
        self.story.append(PageBreak())
    
    def add_image_if_exists(self, image_path, width=5*inch, height=None):
        """Add image to story if it exists"""
        if os.path.exists(image_path):
            try:
                # Get image dimensions to maintain aspect ratio
                with PILImage.open(image_path) as img:
                    img_width, img_height = img.size
                    aspect_ratio = img_height / img_width
                
                if height is None:
                    height = width * aspect_ratio
                
                # Ensure image fits on page
                max_height = 4*inch
                if height > max_height:
                    height = max_height
                    width = height / aspect_ratio
                
                image = Image(image_path, width=width, height=height)
                self.story.append(image)
                self.story.append(Spacer(1, 10))
                return True
            except Exception as e:
                print(f"Error loading image {image_path}: {e}")
                return False
        return False
    
    def add_project(self, title, category, sections, images=None):
        """Add a project to the PDF"""
        # Project title
        project_title = Paragraph(title, self.styles['ProjectTitle'])
        self.story.append(project_title)
        
        # Category
        if category:
            cat_p = Paragraph(f"<i>Category: {category}</i>", self.styles['CustomBodyText'])
            self.story.append(cat_p)
            self.story.append(Spacer(1, 15))
        
        # Add sections (What, How, Results)
        for section_title, content in sections.items():
            # Section title
            sec_title = Paragraph(section_title, self.styles['SectionTitle'])
            self.story.append(sec_title)
            
            # Section content
            if isinstance(content, list):
                for item in content:
                    if item.strip():
                        # Clean up bullet points
                        clean_item = item.replace('•', '').replace('👉', '').strip()
                        bullet_p = Paragraph(f"• {clean_item}", self.styles['BulletPoint'])
                        self.story.append(bullet_p)
            else:
                # Regular paragraph
                if content.strip():
                    content_p = Paragraph(content, self.styles['CustomBodyText'])
                    self.story.append(content_p)
            
            self.story.append(Spacer(1, 12))
        
        # Add images if provided
        if images:
            for img_path in images:
                if self.add_image_if_exists(img_path):
                    self.story.append(Spacer(1, 10))
        
        # Page break for next project
        self.story.append(PageBreak())
    
    def generate_pdf(self):
        """Generate the complete PDF"""
        print("Generating portfolio PDF...")
        
        # Add introduction
        self.add_introduction()
        
        # Define all projects with their content
        projects = [
            {
                "title": "Data Center Advanced Thermal Optimization",
                "category": "Data Center Cooling & HVAC",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Data center cooling consumes nearly 50% of total energy, making efficiency critical.",
                            "Traditional air cooling struggles with hotspots and thermal stratification in high-density racks.",
                            "Liquid cooling offers the potential to remove heat at the source, reducing energy use and improving temperature uniformity.",
                            "The project aimed to compare air vs. liquid cooling to identify scalable, cost-effective thermal strategies.",
                            "Real-world conditions were simulated to benchmark methods for modern data center loads (~10 kW per rack)."
                        ],
                        "How?": [
                            "Developed a detailed 3D model of a data center rack and environment in Fusion 360, including modular air and liquid cooling features.",
                            "Ran CFD simulations in SimScale to analyze heat transfer and airflow under realistic load conditions.",
                            "Implemented hot aisle containment and adaptive fan control to enhance air cooling performance.",
                            "Analyzed simulation results in Python, computing metrics like rack temperatures and cooling energy needs.",
                            "Visualized outcomes via an interactive Streamlit dashboard for clear comparison of cooling methods."
                        ],
                        "Results?": [
                            "Improved cooling performance by 27% and reduced hotspots by 32% with optimized design.",
                            "Liquid cooling kept inlet temperatures up to 15°C cooler than air cooling at the same load.",
                            "Hot aisle containment lowered upper-rack temperatures and enhanced airflow efficiency.",
                            "Projected PUE improved from ~1.5 (air-cooled) to ~1.1 (liquid-cooled hybrid system).",
                            "Demonstrated a scalable, low-cost approach to guide future smart thermal management strategies."
                        ]
                    }
                },
                "images": [
                    "project-images/DC-thumbnail.png",
                    "project-images/air-cooled-pie-chart.png",
                    "project-images/liquid-cooled-pie-chart.png"
                ]
            },
            {
                "title": "Land-Based Cooling Pod Data Center (Microsoft Inspired)",
                "category": "Data Center Cooling & HVAC",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Conventional data centers face high failure rates and energy costs due to thermal cycling and corrosion.",
                            "Project Natick showed that sealed nitrogen pods underwater cut failure rates by 8× and achieved PUE ~1.07.",
                            "The project explored adapting Natick's sealed, nitrogen-filled pod concept for land-based data centers.",
                            "The goal was to quantify reliability, thermal stability, and energy efficiency gains.",
                            "Aimed to provide a practical design blueprint for land deployment."
                        ],
                        "How?": [
                            "Designed two CAD models: a standard open rack and a sealed nitrogen pod with integrated cooling.",
                            "Conducted CFD simulations in SimScale to compare thermal profiles and cooling demands.",
                            "Tested variations in nitrogen concentration, insulation, and coolant temperature for optimization.",
                            "Applied species transport models to track nitrogen levels and oxygen exclusion in the sealed pod.",
                            "Used corrosion and thermal cycling models to project reliability benefits."
                        ],
                        "Results?": [
                            "Temperature swings were dramatically reduced in the sealed pod, with daily fluctuations dropping from ±6°C in open racks to just ±1°C, helping to extend hardware lifespan.",
                            "Thermal reliability improved by 25% and projected failure rates dropped by 35–40%.",
                            "Energy flow analysis shows that the pod design reduces cooling energy demand by ~10%, with more power delivered to IT load and less lost to inefficiencies.",
                            "The robust operational cycle of the nitrogen pod emphasizes routine inspection and nitrogen replenishment for long-term reliability."
                        ]
                    }
                },
                "images": [
                    "project-images/underwater-dc-thumbnail.png",
                    "project-images/pod-lifecycle-diagram.svg",
                    "project-images/pod-sankey.svg"
                ]
            },
            {
                "title": "UFO Aerodynamics CFD Analysis",
                "category": "CAD, CFD & FEA",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Simulated 3D external flow around a flying saucer (UFO shape) inside a virtual wind tunnel to study aerodynamic behavior at high altitude.",
                            "Investigated how varying the tilt angle (0°, 22.5°, 45°) affects lift and drag forces.",
                            "Visualized velocity field distributions at different tilt configurations to assess stability and wake patterns."
                        ],
                        "How?": [
                            "Modeled the saucer by revolving a 2D profile and set it inside a cylindrical wind tunnel geometry.",
                            "Applied parabolic velocity profile at the inlet (max 100 m/s at center) and pressure outlet at the exit; used k-omega turbulence model for steady-state solutions.",
                            "Ran separate cases for each tilt angle and analyzed flow with x-velocity contour plots at key planes."
                        ],
                        "Results?": [
                            "Lift and drag forces increased with tilt angle; maximum lift recorded at 22.5° tilt.",
                            "X-velocity contours confirmed accurate boundary conditions and showed stronger flow separation at higher tilt angles.",
                            "Outlet flow revealed clear velocity gradient consistent with increased wake disturbance at 45° tilt."
                        ]
                    }
                },
                "images": [
                    "project-images/ufo-thumbnail.png",
                    "project-images/acfd3-mesh.jpg",
                    "project-images/acfd3-velocity-0.jpg",
                    "project-images/acfd3-velocity-22.jpg"
                ]
            },
            {
                "title": "AI Powered – Outreach Automation Bot for Gmail",
                "category": "Robotics & Automation",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Manual job outreach is slow, repetitive, and expensive. Traditional cold outreach requires hours of manual email writing, tracking, and follow-up—often costing $200–$500/month for recruiter services or SaaS tools.",
                            "Direct, personalized outreach is crucial for standing out, but doing it at scale is nearly impossible by hand.",
                            "After being laid off, I saw firsthand how important automation is in today's competitive job market and the new age of outreach.",
                            "Building this bot let me reclaim my time for what matters most—applying on career pages, preparing for interviews, and growing my skills—while the automation handled the busywork."
                        ],
                        "How?": [
                            "v1.0: OCR tools (Tesseract, Apple Vision, Microsoft OCR) for resume/contact extraction—quickly hit accuracy and formatting limits.",
                            "v2.0: DOM scraping and bookmarklets for LinkedIn/Apollo—HTML changes and anti-bot measures broke reliability.",
                            "v3.0: Apollo API access—limited to 10 contacts/page, not scalable for bulk outreach.",
                            "v3.5: CSV bulk export automation: Python parses Apollo CSVs, Gmail API + OAuth 2.0 for secure, multi-account draft creation, async drafting for speed, CLI interface prompts for company, position, template, and Gmail account."
                        ],
                        "Results?": [
                            "The bot drafts 108 personalized emails in just over 1 minute (1:03), making high-volume outreach practical and efficient for job seekers.",
                            "To avoid spam risks and ensure deliverability, the safest workflow is to generate drafts and send them manually—this keeps control in your hands and prevents bulk-sending flags.",
                            "This approach saves significant time and effort compared to manual drafting, and can easily replace $400–$800/month SaaS or recruiter tools for similar outreach volume.",
                            "While automation speeds up the process, it's designed to support—not replace—thoughtful, targeted outreach and follow-up."
                        ]
                    }
                },
                "images": [
                    "project-images/outreach-bot-thumbnail.png"
                ]
            },
            {
                "title": "Deposition Rate Optimization for Semiconductor Materials",
                "category": "Semiconductor R&D",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Optimization of the semiconductor deposition rate is critical for improving quality and reducing manufacturing costs.",
                            "The deposition rate affects properties like film thickness, uniformity, and purity that impact device performance and yield.",
                            "Faster deposition can increase production throughput and lower capital costs.",
                            "There is a complex relationship between process parameters like temperature and deposition rate that is difficult to optimize manually.",
                            "Bayesian optimization is an advanced machine learning technique to efficiently search high-dimensional parameter spaces."
                        ],
                        "How?": [
                            "An empirical deposition rate model was defined as a function of temperature and plasma power.",
                            "The model has a quadratic relationship between temperature and deposition rate.",
                            "Deposition rate increases linearly with higher plasma power.",
                            "A Gaussian process probabilistic model was constructed to represent belief over the deposition rate.",
                            "The model guides the selection of optimal parameters to evaluate next."
                        ],
                        "Results?": [
                            "The optimized deposition rate was 65.25 Å/s, a 30% improvement over the baseline.",
                            "The higher deposition rate can enable faster production and lower costs.",
                            "Film quality will also benefit from the optimized parameters.",
                            "Bayesian optimization efficiently searched the parameter space to determine the optimal configuration.",
                            "Only nine evaluations of the deposition model were required."
                        ]
                    }
                },
                "images": [
                    "project-images/deposition-thumbnail.png",
                    "project-images/deposition-rate-optimization-img-1.png",
                    "project-images/deposition-rate-optimization-img-2.png"
                ]
            },
            {
                "title": "Thin-Film PV Efficiency & Manufacturing Roadmap",
                "category": "Semiconductor R&D",
                "sections": {
                    "Project Overview": {
                        "What?": [
                            "Investigation into the potential of thin-film solar photovoltaic technologies to achieve over 30% cell efficiency and large-scale manufacturing by 2035.",
                            "Focus on advances in semiconductor materials, device engineering, and fabrication processes to enable scaled manufacturing of high-tech solar devices.",
                            "The 30% efficiency target is significant as it doubles the efficiency of current commercial panels and approaches the theoretical limits for single-junction solar cells.",
                            "Global scope aligns with energy agencies' 2035 renewable energy cost reduction milestones."
                        ],
                        "How?": [
                            "Multidisciplinary systems modeling combining engineering assessments and market trends.",
                            "Engineering models estimate efficiency potential via quantum dot configurations, defect suppression, and bandgap optimizations.",
                            "Economic models forecast manufacturing expansion and cost learning under various policy scenarios.",
                            "Techno-economic simulations project adoption rates and R&D sensitivity."
                        ],
                        "Results?": [
                            "Provides probability distributions for thin-film solar cells surpassing 30% efficiency and production forecasts by 2035.",
                            "Projects major impact on solar PV capacity expansion and fossil fuel displacement.",
                            "Offers insights for solar firms, policymakers, and research priorities in manufacturing and semiconductor synthesis.",
                            "Contributes to global decarbonization trajectories."
                        ]
                    }
                },
                "images": [
                    "project-images/thin-film-thumbnail.png",
                    "project-images/thin-film-pv-efficiency-img-1.png",
                    "project-images/thin-film-pv-efficiency-img-2.png"
                ]
            }
        ]
        
        # Add each project
        for project in projects:
            sections_dict = {}
            for section_name, section_content in project["sections"]["Project Overview"].items():
                sections_dict[section_name] = section_content
            
            self.add_project(
                title=project["title"],
                category=project["category"],
                sections=sections_dict,
                images=project.get("images", [])
            )
        
        # Build PDF
        self.doc.build(self.story)
        print(f"Portfolio PDF generated successfully: {self.output_filename}")

if __name__ == "__main__":
    generator = PortfolioPDFGenerator()
    generator.generate_pdf()
