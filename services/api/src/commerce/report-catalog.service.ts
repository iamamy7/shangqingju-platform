import { Injectable, NotFoundException } from "@nestjs/common";

export interface ReportProduct {
  code: string;
  name: string;
  summary: string;
  price: number;
  dataState: "AVAILABLE" | "PARTIAL" | "NO_RECORD" | "NO_COVERAGE";
  coverage: string;
  fields: string[];
}

@Injectable()
export class ReportCatalogService {
  private readonly products: ReportProduct[] = [
    { code: "M01", name: "企业基础与注册", summary: "确认主体是谁、是否仍在经营", price: 39, dataState: "AVAILABLE", coverage: "完整", fields: ["当地语言名称", "注册号", "法律形式", "经营状态", "注册地址"] },
    { code: "M02", name: "联系与经营信息", summary: "了解官网、经营地址与主营业务", price: 29, dataState: "PARTIAL", coverage: "部分", fields: ["官方网站", "经营地址", "主营业务", "员工规模", "主要市场"] },
    { code: "M03", name: "股东与控制权", summary: "识别股东、控制链与最终受益人", price: 89, dataState: "AVAILABLE", coverage: "完整", fields: ["直接股东", "持股比例", "控制路径", "最终所有者", "实际受益人"] },
    { code: "M04", name: "董事与管理层", summary: "核对董事、高管和治理结构", price: 49, dataState: "AVAILABLE", coverage: "完整", fields: ["董事", "高管", "法定代表人", "任职状态", "任职变化"] },
    { code: "M05", name: "集团与关联企业", summary: "梳理总部、分支与全球关联网络", price: 69, dataState: "AVAILABLE", coverage: "完整", fields: ["总部", "分支机构", "母子公司", "集团成员", "全球实体"] },
    { code: "M06", name: "财务与经营表现", summary: "观察营收、利润、负债和趋势", price: 79, dataState: "PARTIAL", coverage: "部分", fields: ["营业收入", "利润", "资产", "负债", "员工趋势"] },
    { code: "M07", name: "司法与经营风险", summary: "核查诉讼、处罚、破产与异常记录", price: 89, dataState: "NO_RECORD", coverage: "已核查", fields: ["诉讼", "执行", "行政处罚", "破产", "经营异常"] },
    { code: "M08", name: "制裁与合规", summary: "筛查国际制裁与限制名单", price: 99, dataState: "AVAILABLE", coverage: "完整", fields: ["制裁名单", "命中主体", "名单来源", "命中时间", "关联说明"] },
    { code: "M09", name: "上市、融资与并购", summary: "查看上市状态、融资与交易活动", price: 59, dataState: "PARTIAL", coverage: "部分", fields: ["上市状态", "证券代码", "融资事件", "并购交易", "GIIN"] },
    { code: "M10", name: "知识产权与网络风险", summary: "评估专利、商标和网络暴露", price: 69, dataState: "NO_COVERAGE", coverage: "暂不支持", fields: ["专利", "商标", "专利价值", "域名", "网络安全风险"] }
  ];

  list() { return this.products; }

  resolve(codes: string[]) {
    const unique = [...new Set(codes.map((code) => code.toUpperCase()))];
    return unique.map((code) => {
      const product = this.products.find((item) => item.code === code);
      if (!product) throw new NotFoundException(`报告模块 ${code} 不存在`);
      return product;
    });
  }

  quote(codes: string[]) {
    const products = this.resolve(codes);
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const discountRate = products.length >= 3 ? 0.12 : 0;
    const discount = Math.round(subtotal * discountRate);
    return { products, subtotal, discountRate, discount, total: subtotal - discount, currency: "CNY" as const };
  }
}
