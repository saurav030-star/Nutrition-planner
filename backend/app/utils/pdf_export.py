"""
Enterprise PDF & Grocery Shopping List Generator
Uses ReportLab to generate publication-grade nutritional reports
and supermarket aisle shopping manifests.
Includes:
- User profile biometrics (Age, Gender, Weight, Height, Activity level, Health goal, BMR, TDEE)
- Target vs Actual nutritional breakdown
- 7-Day meal schedule with ingredients, quantities, meal nutrition, daily totals
- Supermarket aisle-by-aisle consolidated grocery list
- LangGraph constraint verification seal
"""

import io
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_meal_plan_pdf(
    user_name: str,
    plan_title: str,
    target_calories: float,
    target_protein: float,
    target_carbs: float,
    target_fats: float,
    days: List[Dict[str, Any]],
    grocery_list: Dict[str, List[str]],
    verification: Dict[str, Any],
    profile_data: Optional[Dict[str, Any]] = None
) -> bytes:
    """
    Generates a publication-grade PDF document in bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=32,
        leftMargin=32,
        topMargin=32,
        bottomMargin=32
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#064E3B'),  # Emerald-900
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=8
    )
    section_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=5
    )
    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#334155')
    )
    table_cell = ParagraphStyle(
        'TableCell',
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
    day_banner_title = ParagraphStyle(
        'DayBannerTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#065F46')
    )
    
    elements = []
    
    # 1. Header Banner
    elements.append(Paragraph("NutriGraph AI – Autonomous Nutrition Planner", title_style))
    elements.append(Paragraph(f"Autonomous Clinical Multi-Agent Nutrition Manifest | Prepared for: <b>{user_name}</b>", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#10B981'), spaceAfter=8))
    
    # 2. User Profile Biometrics & Clinical Metabolic Panel
    prof = profile_data or {}
    age_str = f"{prof.get('age', 25)} yrs"
    gender_str = str(prof.get('gender', 'Male')).capitalize()
    weight_str = f"{prof.get('weight', 70)} kg"
    height_str = f"{prof.get('height', 175)} cm"
    act_str = str(prof.get('activity_level', 'Moderately Active')).replace('_', ' ').title()
    goal_str = str(prof.get('health_goal', 'Weight Loss')).replace('_', ' ').title()
    diet_str = str(prof.get('diet_type', 'Vegetarian')).capitalize()
    bmr_val = prof.get('bmr', round(10.0*float(prof.get('weight', 70)) + 6.25*float(prof.get('height', 175)) - 5.0*float(prof.get('age', 25)) + 5.0, 1))
    tdee_val = prof.get('tdee', round(bmr_val * 1.55, 1))
    
    elements.append(Paragraph("User Profile & Metabolic Overview", section_h2))
    profile_table_data = [
        [
            Paragraph("<b>Age:</b> " + age_str, table_cell),
            Paragraph("<b>Gender:</b> " + gender_str, table_cell),
            Paragraph("<b>Weight:</b> " + weight_str, table_cell),
            Paragraph("<b>Height:</b> " + height_str, table_cell),
        ],
        [
            Paragraph("<b>Activity:</b> " + act_str, table_cell),
            Paragraph("<b>Health Goal:</b> " + goal_str, table_cell),
            Paragraph(f"<b>BMR:</b> {bmr_val} kcal", table_cell),
            Paragraph(f"<b>TDEE:</b> {tdee_val} kcal", table_cell),
        ]
    ]
    p_table = Table(profile_table_data, colWidths=[135, 135, 135, 135])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(p_table)
    elements.append(Spacer(1, 8))
    
    # 3. Target vs Actual Daily Nutrition Summary
    avg_cal = round(sum(d.get("total_calories", 0) for d in days) / len(days), 1) if days else target_calories
    avg_p = round(sum(d.get("total_protein", 0) for d in days) / len(days), 1) if days else target_protein
    avg_c = round(sum(d.get("total_carbs", 0) for d in days) / len(days), 1) if days else target_carbs
    avg_f = round(sum(d.get("total_fats", 0) for d in days) / len(days), 1) if days else target_fats
    
    elements.append(Paragraph(f"Target vs. Actual Nutrition ({diet_str} Framework)", section_h2))
    metrics_data = [
        [
            Paragraph("<b>Metric</b>", table_header),
            Paragraph("<b>Daily Target</b>", table_header),
            Paragraph("<b>Actual Daily Average</b>", table_header),
            Paragraph("<b>Adherence / Compliance</b>", table_header),
        ],
        [
            Paragraph("Energy (Calories)", table_cell),
            Paragraph(f"{round(target_calories)} kcal", table_cell),
            Paragraph(f"{round(avg_cal)} kcal", table_cell),
            Paragraph(f"{verification.get('confidence_score', 100)}% Adherence", table_cell),
        ],
        [
            Paragraph("Protein", table_cell),
            Paragraph(f"{round(target_protein, 1)}g", table_cell),
            Paragraph(f"{round(avg_p, 1)}g", table_cell),
            Paragraph(f"Target: {round(target_protein * 4 / target_calories * 100, 1)}% cal", table_cell),
        ],
        [
            Paragraph("Carbohydrates", table_cell),
            Paragraph(f"{round(target_carbs, 1)}g", table_cell),
            Paragraph(f"{round(avg_c, 1)}g", table_cell),
            Paragraph(f"Target: {round(target_carbs * 4 / target_calories * 100, 1)}% cal", table_cell),
        ],
        [
            Paragraph("Fats", table_cell),
            Paragraph(f"{round(target_fats, 1)}g", table_cell),
            Paragraph(f"{round(avg_f, 1)}g", table_cell),
            Paragraph(f"Target: {round(target_fats * 9 / target_calories * 100, 1)}% cal", table_cell),
        ],
    ]
    m_table = Table(metrics_data, colWidths=[130, 130, 140, 140])
    m_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065F46')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FFFFFF')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(m_table)
    elements.append(Spacer(1, 10))
    
    # 4. Seven-Day Meal Schedule
    elements.append(Paragraph("Complete Seven-Day Nutrition Schedule", section_h2))
    
    schedule_rows = [
        [
            Paragraph("Day / Meal", table_header),
            Paragraph("Recipe & Description", table_header),
            Paragraph("Ingredients & Quantities", table_header),
            Paragraph("Calories", table_header),
            Paragraph("P / C / F", table_header)
        ]
    ]
    
    for day in days:
        day_num = day.get("day_number")
        day_name = day.get("day_name")
        day_cal = day.get("total_calories")
        day_p = day.get("total_protein")
        day_c = day.get("total_carbs")
        day_f = day.get("total_fats")
        
        # Day Header Row
        day_summary_text = f"<b>Day {day_num} ({day_name})</b> — Total: <b>{round(day_cal)} kcal</b> | {day_p}g P | {day_c}g C | {day_f}g F"
        schedule_rows.append([
            Paragraph(day_summary_text, day_banner_title),
            Paragraph("", table_cell),
            Paragraph("", table_cell),
            Paragraph("", table_cell),
            Paragraph("", table_cell),
        ])
        
        for meal in day.get("meals", []):
            meal_label = f"<b>{meal.get('meal_type', '').capitalize()}</b><br/>{meal.get('prep_time_minutes', 15) + meal.get('cook_time_minutes', 10)}m"
            recipe_text = f"<b>{meal.get('name')}</b><br/><font color='#64748B'>{meal.get('description', '')[:75]}...</font>"
            
            # Format ingredients
            ing_list = []
            for ing in meal.get("ingredients", []):
                ing_list.append(f"{ing.get('name')}: {ing.get('quantity')} {ing.get('unit')}")
            ing_str = "<br/>".join(ing_list[:4])
            if len(ing_list) > 4:
                ing_str += f"<br/><i>+{len(ing_list)-4} more...</i>"
                
            cal_str = f"{round(meal.get('calories', 0))} kcal"
            macros_str = f"{meal.get('protein', 0)}g P<br/>{meal.get('carbs', 0)}g C<br/>{meal.get('fats', 0)}g F"
            
            schedule_rows.append([
                Paragraph(meal_label, table_cell),
                Paragraph(recipe_text, table_cell),
                Paragraph(ing_str, table_cell),
                Paragraph(cal_str, table_cell),
                Paragraph(macros_str, table_cell),
            ])
            
    schedule_table = Table(schedule_rows, colWidths=[70, 190, 160, 60, 60], repeatRows=1)
    
    # Custom row background styling for Day headers
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    
    current_row = 1
    for day in days:
        # Span day header across all columns
        table_styles.append(('SPAN', (0, current_row), (-1, current_row)))
        table_styles.append(('BACKGROUND', (0, current_row), (-1, current_row), colors.HexColor('#D1FAE5')))
        current_row += 1 + len(day.get("meals", []))
        
    schedule_table.setStyle(TableStyle(table_styles))
    elements.append(schedule_table)
    elements.append(Spacer(1, 10))
    
    # 5. Supermarket Aisle-by-Aisle Grocery List
    elements.append(KeepTogether([
        Paragraph("Supermarket Aisle-by-Aisle Grocery Manifest (7-Day Consolidated)", section_h2),
        Paragraph("<font color='#64748B'>Consolidated supply chain acquisition manifest grouped by supermarket zones.</font>", subtitle_style),
        Spacer(1, 4)
    ]))
    
    grocery_rows = [
        [Paragraph("Aisle Zone", table_header), Paragraph("Consolidated Shopping Items", table_header)]
    ]
    
    for aisle, items in grocery_list.items():
        if items:
            items_str = ", ".join(items[:10])
            if len(items) > 10:
                items_str += f", and {len(items)-10} more..."
            grocery_rows.append([
                Paragraph(f"<b>{aisle}</b>", table_cell),
                Paragraph(items_str, table_cell)
            ])
            
    grocery_table = Table(grocery_rows, colWidths=[140, 400])
    grocery_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(grocery_table)
    elements.append(Spacer(1, 10))
    
    # 6. Verification & Compliance Footer
    remarks = verification.get("remarks", "Constraint verifier validated all nutritional boundaries.")
    footer_text = f"<b>Multi-Agent Verification Seal:</b> {remarks}<br/><i>NutriGraph AI Autonomous Nutrition Planning & Validation System</i>"
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=body_style, textColor=colors.HexColor('#059669'))))
    
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
