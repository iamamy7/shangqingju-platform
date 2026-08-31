from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = [
    ROOT / "output/pdf/Northstar_Components_商情据企业调查报告_V1.pdf",
    ROOT / "apps/web/public/prototype/downloads/Northstar_Components_商情据企业调查报告_V1.pdf",
]
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("SQJ-CJK", FONT))

INK = colors.HexColor("#101D27")
MUTED = colors.HexColor("#60727C")
GREEN = colors.HexColor("#08A879")
PALE = colors.HexColor("#EFF8F5")
LINE = colors.HexColor("#DCE8E3")
AMBER = colors.HexColor("#FF7A59")


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_kicker": ParagraphStyle("cover_kicker", parent=base["Normal"], fontName="SQJ-CJK", fontSize=10, leading=16, textColor=GREEN, alignment=TA_CENTER, spaceAfter=18),
        "cover_title": ParagraphStyle("cover_title", parent=base["Title"], fontName="SQJ-CJK", fontSize=30, leading=40, textColor=INK, alignment=TA_CENTER, spaceAfter=12),
        "cover_sub": ParagraphStyle("cover_sub", parent=base["Normal"], fontName="SQJ-CJK", fontSize=12, leading=20, textColor=MUTED, alignment=TA_CENTER, spaceAfter=10),
        "chapter_no": ParagraphStyle("chapter_no", parent=base["Normal"], fontName="SQJ-CJK", fontSize=10, leading=15, textColor=GREEN, spaceAfter=6),
        "chapter": ParagraphStyle("chapter", parent=base["Heading1"], fontName="SQJ-CJK", fontSize=23, leading=31, textColor=INK, spaceAfter=8),
        "intro": ParagraphStyle("intro", parent=base["Normal"], fontName="SQJ-CJK", fontSize=10.5, leading=18, textColor=MUTED, spaceAfter=18),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName="SQJ-CJK", fontSize=10.5, leading=18, textColor=INK),
        "small": ParagraphStyle("small", parent=base["Normal"], fontName="SQJ-CJK", fontSize=8.5, leading=14, textColor=MUTED),
        "label": ParagraphStyle("label", parent=base["Normal"], fontName="SQJ-CJK", fontSize=9, leading=14, textColor=MUTED),
        "value": ParagraphStyle("value", parent=base["Normal"], fontName="SQJ-CJK", fontSize=10.5, leading=17, textColor=INK),
    }


S = styles()


def p(text, style="body"):
    return Paragraph(text, S[style])


def info_table(rows):
    data = [[p(k, "label"), p(v, "value")] for k, v in rows]
    table = Table(data, colWidths=[44 * mm, 118 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), PALE),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return table


def section(story, number, title, intro, rows, state="有可交付数据"):
    story.extend([
        p(f"{number} · NORTHSTAR COMPONENTS INC.", "chapter_no"),
        p(title, "chapter"),
        p(intro, "intro"),
        info_table([("数据状态", state), *rows]),
        Spacer(1, 8 * mm),
        p("来源与血缘", "chapter_no"),
        p("演示数据源：MOCK_GLOBAL_PROVIDER；数据截止：2026-08-16 09:40 UTC；标准化版本：SQJ-NORM-V1。正式接入上游接口后，将按同一字段契约替换演示数据。", "small"),
        PageBreak(),
    ])


def build(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(path), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title="商情据 · Northstar Components Inc. 企业调查报告",
        author="商情据",
    )
    story = [
        Spacer(1, 26 * mm),
        p("SQJ · 商情据", "cover_kicker"),
        p("Northstar Components Inc.", "cover_title"),
        p("企业调查报告 · V1", "cover_sub"),
        Spacer(1, 15 * mm),
        info_table([
            ("企业主体", "Northstar Components Inc."),
            ("注册地", "美国 · Delaware"),
            ("注册号", "C0478921"),
            ("报告编号", "SQJ-RPT-PDF-QA"),
            ("已购模块", "M01、M03、M06、M07、M08"),
            ("生成方式", "自动化标准版（演示数据）"),
        ]),
        Spacer(1, 35 * mm),
        p("本报告为开发联调与版式验收样本，不构成法律、审计、投资或制裁专业意见。", "small"),
        PageBreak(),
        p("00 · EXECUTIVE SUMMARY", "chapter_no"),
        p("执行摘要", "chapter"),
        p("报告已完成主体识别，并围绕已购模块整理企业事实、规则提示与风险关注点。所有结论均保留来源、日期和版本信息。", "intro"),
        info_table([
            ("主体识别", "名称、国家、注册号与地址交叉确认，主体匹配置信度 92%。"),
            ("控制权", "演示股权结构可追溯至最终受益人；建议正式交易前复核最新股权变更。"),
            ("财务表现", "最近年度数据可用，部分季度字段缺失，已按 PARTIAL 明示。"),
            ("司法风险", "发现 2 条历史争议信息，均需结合原始案号和裁判文书复核。"),
            ("制裁与合规", "已完成指定名单筛查，当前为 NO_RECORD。"),
        ]),
        PageBreak(),
    ]
    section(story, "M01", "企业基础与注册", "核验企业名称、注册状态、注册号、注册地址与成立时间。", [
        ("英文名称", "Northstar Components Inc."), ("当地名称", "Northstar Components Inc."),
        ("经营状态", "在营"), ("成立日期", "2012-04-18"), ("注册地址", "1209 Orange St, Wilmington, Delaware, USA"),
    ])
    section(story, "M02", "联系与经营信息", "本模块未购买，报告仅展示模块名称和数据边界，不展示推测内容。", [
        ("购买状态", "未购买"), ("可提供字段", "官网、电话、邮箱、经营范围、行业标签"),
    ], "未购买")
    section(story, "M03", "股东与控制权", "识别直接股东、持股比例、控制链与最终受益人。", [
        ("控股股东", "Northstar Holdings LLC · 68%"), ("第二股东", "Aster Growth Partners · 22%"),
        ("其他股东", "管理层与员工持股平台 · 10%"), ("最终受益人", "Alex Morgan（演示）"),
    ])
    section(story, "M04", "董事与管理层", "本模块未购买，AI 不读取或引用该章节。", [
        ("购买状态", "未购买"), ("可提供字段", "董事、高管、法定代表人、任职历史"),
    ], "未购买")
    section(story, "M05", "集团与关联企业", "本模块未购买，报告不展示关联网络的推测信息。", [
        ("购买状态", "未购买"), ("可提供字段", "总部、分支机构、子公司、集团成员"),
    ], "未购买")
    section(story, "M06", "财务与经营表现", "观察营业收入、利润、资产负债和经营趋势。", [
        ("2025 年营业收入", "USD 186.4M"), ("2025 年净利润", "USD 18.7M"),
        ("资产总额", "USD 241.6M"), ("负债总额", "USD 96.2M"), ("数据完整性", "年度数据可用；季度现金流字段部分缺失"),
    ], "部分字段可用")
    section(story, "M07", "司法与经营风险", "汇总诉讼、处罚、经营异常和负面信号，并明确原始证据入口。", [
        ("历史诉讼", "2 条（演示）"), ("监管处罚", "0 条"), ("经营异常", "0 条"),
        ("关注事项", "一项合同争议已结案；一项知识产权争议待复核"),
    ])
    section(story, "M08", "制裁与合规", "对企业、关键股东、最终受益人和管理层进行制裁与 PEP 筛查。", [
        ("制裁名单命中", "0 条"), ("PEP 命中", "0 条"), ("出口管制命中", "0 条"),
        ("结论口径", "NO_RECORD 表示已核查未发现记录，不代表未来永久无风险"),
    ], "已核查 · 未发现记录")
    section(story, "M09", "知识产权", "本模块当前暂无可靠覆盖，不销售也不生成推测内容。", [
        ("覆盖状态", "NO_COVERAGE"), ("处理规则", "不可购买；待接入可靠来源后开放"),
    ], "暂无可靠覆盖")
    section(story, "M10", "网络与数据风险", "本模块未购买，报告仅保留目录和能力边界。", [
        ("购买状态", "未购买"), ("可提供字段", "域名、证书、公开暴露面与数据事件"),
    ], "未购买")
    story.extend([
        p("DATA RESPONSIBILITY", "chapter_no"), p("数据与责任说明", "chapter"),
        p("本报告使用 100 家企业、每家 10 个模块的演示数据验证完整业务闭环。正式上线时，供应商原始来源、采集时间、字段映射、标准化版本、报告版本和引用位置必须完整留痕；资料不足时不得推测。", "intro"),
        info_table([
            ("数据口径", "报告事实、规则提示与 AI 归纳分层展示。"),
            ("计费口径", "报告模块按当前原型样本价；API 按人民币余额、成功调用后扣费。"),
            ("支付与开票", "当前为 Mock / 示例流程，接口确定后替换为真实上游。"),
            ("外链分享", "不允许生成公开外链。"),
            ("隐私与权限", "报告详情仅登录且完成购买后可访问。"),
        ]),
    ])
    doc.build(story)


for output in OUTPUTS:
    build(output)
    print(output)
