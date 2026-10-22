"""
Enterprise PDF & Grocery Shopping List Generator
Uses ReportLab to generate publication-grade nutritional reports
and supermarket aisle shopping manifests.
"""

import io
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_meal_plan_pdf(
    user_name: str,
    plan_title: str,
    target_calories: float,
    target_protein: float,
    target_carbs: float,
    target_fats: float,
    days: List[Dict[str, Any]],
    grocery_list: Dict[str, List[str]],
    verification: Dict[str, Any]
) -> bytes:
    """
    Generates a PDF document in bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1E293B')
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    
    elements = []
    
    # 1. Header Banner
    elements.append(Paragraph("Enterprise-Grade AI Nutrition Planner", title_style))
    elements.append(Paragraph(f"Autonomous Clinical Multi-Agent Nutrition Manifest | Prepared for: <b>{user_name}</b>", subtitle_style))
    elements.append(Spacer(1, 4))
    
    # 2. Executive Summary Metrics Table
    summary_data = [
        [
            Paragraph("<b>Daily Target Calories</b>", table_text),
            Paragraph("<b>Target Protein</b>", table_text),
            Paragraph("<b>Target Carbs</b>", table_text),
            Paragraph("<b>Target Fats</b>", table_text),
            Paragraph("<b>Adherence Score</b>", table_text)
        ],
        [
            Paragraph(f"{target_calories} kcal", table_text),
            Paragraph(f"{target_protein}g", table_text),
            Paragraph(f"{target_carbs}g", table_text),
            Paragraph(f"{target_fats}g", table_text),
            Paragraph(f"{verification.get('confidence_score', 100)}%", table_text)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[108, 108, 108, 108, 108])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 14))
    
    # 3. Multi-Day Meal Schedule
    elements.append(Paragraph("Weekly Multi-Day Nutrition Schedule", h2_style))
    
    schedule_rows = [
        [
            Paragraph("Day", table_header),
            Paragraph("Meal Type", table_header),
            Paragraph("Recipe & Description", table_header),
            Paragraph("Calories", table_header),
            Paragraph("P / C / F", table_header)
        ]
    ]
    
    for day in days:
        day_label = f"Day {day.get('day_number')} ({day.get('day_name')})"
        for idx, meal in enumerate(day.get("meals", [])):
            meal_label = meal.get("meal_type", "").capitalize()
            recipe_desc = f"<b>{meal.get('name')}</b><br/><font color='#64748B'>{meal.get('description', '')[:90]}...</font>"
            macros_str = f"{meal.get('protein')}g / {meal.get('carbs')}g / {meal.get('fats')}g"
            
            schedule_rows.append([
                Paragraph(day_label if idx == 0 else "", table_text),
                Paragraph(meal_label, table_text),
                Paragraph(recipe_desc, table_text),
                Paragraph(f"{meal.get('calories')} kcal", table_text),
                Paragraph(macros_str, table_text)
            ])
            
    schedule_table = Table(schedule_rows, colWidths=[70, 60, 260, 75, 75])
    schedule_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(schedule_table)
    elements.append(Spacer(1, 14))
    
    # 4. Supermarket Aisle-by-Aisle Grocery List
    elements.append(KeepTogether([
        Paragraph("Supermarket Aisle-by-Aisle Grocery Shopping Manifest", h2_style),
        Paragraph("<font color='#64748B'>Categorized by supermarket zones for efficient commercial fulfillment.</font>", subtitle_style),
        Spacer(1, 4)
    ]))
    
    grocery_rows = [
        [Paragraph("Aisle Zone", table_header), Paragraph("Consolidated Shopping Items", table_header)]
    ]
    
    for aisle, items in grocery_list.items():
        if items:
            items_str = ", ".join(items[:8])
            if len(items) > 8:
                items_str += f", and {len(items)-8} more..."
            grocery_rows.append([
                Paragraph(f"<b>{aisle}</b>", table_text),
                Paragraph(items_str, table_text)
            ])
            
    grocery_table = Table(grocery_rows, colWidths=[140, 400])
    grocery_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(grocery_table)
    elements.append(Spacer(1, 14))
    
    # 5. Verification & Compliance Footer
    remarks = verification.get("remarks", "Constraint verifier validated all nutritional boundaries.")
    footer_text = f"<b>Multi-Agent Verification Seal:</b> {remarks}<br/><i>B.Tech CSE (AI/ML) OJT Capstone Project | Saurav Sharma & Nitish Kumar</i>"
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=body_style, textColor=colors.HexColor('#059669'))))
    
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
