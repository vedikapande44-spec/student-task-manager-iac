"""
Convert PROJECT_REPORT.md to a beautifully formatted Word document (PROJECT_REPORT.docx).
Includes cover page, styled headings, tables, callout blocks, and code snippets.
"""

import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_report_docx(md_path="PROJECT_REPORT.md", docx_path="PROJECT_REPORT.docx"):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = Document()

    # Page Margins: 1 inch all sides
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    # Styles
    styles = doc.styles
    normal_style = styles["Normal"]
    normal_style.font.name = "Calibri"
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # ================= COVER PAGE =================
    cover_title_p = doc.add_paragraph()
    cover_title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_title_p.paragraph_format.space_before = Pt(72)
    cover_title_p.paragraph_format.space_after = Pt(12)
    run_tag = cover_title_p.add_run("MINI PROJECT REPORT ON INFRASTRUCTURE AS CODE\n")
    run_tag.font.size = Pt(13)
    run_tag.font.bold = True
    run_tag.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

    run_main_title = cover_title_p.add_run("Automated Deployment of a Serverless Student Task Management Application Using Terraform")
    run_main_title.font.size = Pt(22)
    run_main_title.font.bold = True
    run_main_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    desc_p = doc.add_paragraph()
    desc_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    desc_p.paragraph_format.space_after = Pt(140)
    run_sub = desc_p.add_run("A Serverless Cloud Architecture on Cloudflare Workers and Workers KV with GitHub Actions CI/CD")
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.paragraph_format.space_after = Pt(24)
    run_subm = meta_p.add_run("Submitted for Evaluation in\nCloud Computing & DevOps / Infrastructure as Code\n\nAcademic Year 2026")
    run_subm.font.size = Pt(11)
    run_subm.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    doc.add_page_break()

    # ================= CONTENT PARSING =================
    lines = md_text.splitlines()
    in_code = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table():
        nonlocal in_table, table_lines
        if not table_lines:
            return
        rows_data = []
        for tl in table_lines:
            if re.match(r'^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?\s*$', tl):
                continue
            cols = [c.strip() for c in tl.strip().strip('|').split('|')]
            if cols:
                rows_data.append(cols)
        if rows_data:
            num_cols = max(len(r) for r in rows_data)
            tbl = doc.add_table(rows=len(rows_data), cols=num_cols)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            tbl.style = "Table Grid"
            for r_idx, row in enumerate(rows_data):
                for c_idx, val in enumerate(row):
                    if c_idx < num_cols:
                        cell = tbl.cell(r_idx, c_idx)
                        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
                        cp = cell.paragraphs[0]
                        cp.paragraph_format.space_before = Pt(2)
                        cp.paragraph_format.space_after = Pt(2)
                        run = cp.add_run(val)
                        run.font.size = Pt(9.5)
                        if r_idx == 0:
                            set_cell_background(cell, "1E3A8A")
                            run.font.bold = True
                            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        else:
                            if r_idx % 2 == 1:
                                set_cell_background(cell, "F8FAFC")
                            else:
                                set_cell_background(cell, "FFFFFF")
            p_space = doc.add_paragraph()
            p_space.paragraph_format.space_before = Pt(0)
            p_space.paragraph_format.space_after = Pt(6)
        in_table = False
        table_lines = []

    def flush_code():
        nonlocal in_code, code_lines
        if code_lines:
            code_text = "\n".join(code_lines)
            table = doc.add_table(rows=1, cols=1)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = table.cell(0, 0)
            set_cell_background(cell, "0F172A")
            set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(code_text)
            run.font.name = "Consolas"
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)
            p_after = doc.add_paragraph()
            p_after.paragraph_format.space_after = Pt(6)
        in_code = False
        code_lines = []

    i = 0
    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```"):
            if in_table:
                flush_table()
            if in_code:
                flush_code()
            else:
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Table detection
        if "|" in line and (line.strip().startswith("|") or line.strip().endswith("|")):
            in_table = True
            table_lines.append(line)
            i += 1
            continue
        elif in_table:
            flush_table()

        # Headings
        if line.startswith("# ") and not line.startswith("# MINI PROJECT"):
            title = line[2:].strip()
            h = doc.add_heading(level=1)
            h.paragraph_format.space_before = Pt(18)
            h.paragraph_format.space_after = Pt(6)
            run = h.add_run(title)
            run.font.name = "Calibri"
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        elif line.startswith("## "):
            title = line[3:].strip()
            h = doc.add_heading(level=2)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(4)
            run = h.add_run(title)
            run.font.name = "Calibri"
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        elif line.startswith("### "):
            title = line[4:].strip()
            h = doc.add_heading(level=3)
            h.paragraph_format.space_before = Pt(10)
            h.paragraph_format.space_after = Pt(3)
            run = h.add_run(title)
            run.font.name = "Calibri"
            run.font.size = Pt(11.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        elif line.startswith("#### "):
            title = line[5:].strip()
            h = doc.add_heading(level=4)
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(2)
            run = h.add_run(title)
            run.font.name = "Calibri"
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
        elif line.strip().startswith("- ") or line.strip().startswith("* "):
            bullet_text = line.strip()[2:]
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            _format_inline(p, bullet_text)
        elif re.match(r'^\d+\.\s', line.strip()):
            m = re.match(r'^\d+\.\s(.*)$', line.strip())
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            _format_inline(p, m.group(1))
        elif line.strip().startswith("---"):
            pass
        elif line.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            _format_inline(p, line.strip())

        i += 1

    if in_table:
        flush_table()
    if in_code:
        flush_code()

    doc.save(docx_path)
    print(f"Document successfully created at: {docx_path}")

def _format_inline(paragraph, text):
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            run = paragraph.add_run(part[2:-2])
            run.font.bold = True
        elif part.startswith("*") and part.endswith("*"):
            run = paragraph.add_run(part[1:-1])
            run.font.italic = True
        elif part.startswith("`") and part.endswith("`"):
            run = paragraph.add_run(part[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0x93, 0x33, 0xEA)
        else:
            paragraph.add_run(part)

if __name__ == "__main__":
    create_report_docx()
