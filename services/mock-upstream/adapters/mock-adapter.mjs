function normalize(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function source(code, path) {
  return {
    providerCode: "MOCK_PROVIDER",
    sourceType: "SYNTHETIC_TEST_DATA",
    sourceField: path,
    collectedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    license: "TEST_ONLY",
    disclaimer: "仅用于联调与验收，不得作为真实商业决策依据。",
    moduleCode: code
  };
}

export function createMockAdapter({ companies, modules, companyModules = {} }) {
  const byId = new Map(companies.map((company) => [company.id, company]));

  function searchCompanies({ q, country, dataSource = "GLOBAL" }) {
    const needle = normalize(q);
    const matches = companies.filter((company) => {
      if (country && company.country !== String(country).toUpperCase()) return false;
      const haystack = [
        company.name,
        company.localName,
        company.registrationNumber,
        company.address,
        ...(company.aliases || [])
      ].map(normalize).join(" | ");
      return haystack.includes(needle);
    });
    return {
      dataState: matches.length === 0 ? "NO_RECORD" : matches.length > 1 ? "AMBIGUOUS" : "AVAILABLE",
      billable: false,
      data: {
        query: { q, country: country || null, dataSource },
        total: matches.length,
        candidates: matches.map((company, index) => ({
          ...company,
          matchScore: Math.max(0.73, 0.97 - index * 0.08),
          matchReasons: ["NAME", country ? "COUNTRY" : "REGISTRY_CANDIDATE"]
        }))
      }
    };
  }

  function getCompany(companyId) {
    return byId.get(companyId) || null;
  }

  function getMarkets() {
    const confirmed = new Set(["CN", "HK", "US", "SG"]);
    const names = { CN: "中国大陆", HK: "中国香港", US: "美国", SG: "新加坡", GB: "英国", DE: "德国", FR: "法国", NL: "荷兰", JP: "日本", KR: "韩国" };
    return Object.entries(names).map(([code, name]) => ({
      code,
      name,
      readiness: confirmed.has(code) ? "CONFIRMED_FOR_MOCK" : "TO_VERIFY_BEFORE_SALE",
      modules: Object.entries(modules).map(([moduleCode, module]) => ({
        code: moduleCode,
        name: module.name,
        dataState: module.defaultState,
        mockPrice: module.price
      }))
    }));
  }

  function getModule(companyId, moduleCode) {
    const company = byId.get(companyId);
    const module = modules[moduleCode];
    if (!company || !module) return null;

    const fixtureResult = companyModules?.[companyId]?.[moduleCode];
    if (fixtureResult) {
      const dataState = fixtureResult.dataState || "AVAILABLE";
      return {
        dataState,
        billable: !["NO_COVERAGE", "PROVIDER_ERROR", "SYSTEM_ERROR"].includes(dataState),
        data: {
          companyId,
          companyName: company.name,
          module: { code: moduleCode, name: module.name, mockPrice: module.price },
          result: fixtureResult.data,
          evidence: [source(moduleCode, `companyModules.${companyId}.${moduleCode}`)]
        }
      };
    }

    let dataState = module.defaultState;
    let data;
    if (moduleCode === "M01") {
      data = {
        identity: {
          legalName: company.name,
          localName: company.localName,
          aliases: company.aliases,
          registrationNumber: company.registrationNumber,
          country: company.country,
          legalForm: company.legalForm,
          status: company.status,
          foundedAt: company.foundedAt,
          registeredCapital: company.registeredCapital,
          registeredAddress: company.address,
          industry: company.industry
        }
      };
    } else if (moduleCode === "M02") {
      data = {
        contacts: [
          { type: "WEBSITE", value: `https://www.${company.id.toLowerCase().replaceAll("-", "")}.example`, confidence: 0.91 },
          { type: "EMAIL", value: "compliance@example.test", confidence: 0.78 },
          { type: "PHONE", value: "+1-202-555-01**", confidence: 0.74 }
        ],
        operatingAddresses: [{ address: company.address, isRegisteredAddress: true }]
      };
    } else if (moduleCode === "M03") {
      data = {
        shareholders: [
          { name: "North Bridge Industrial Holdings Ltd.", type: "COMPANY", ownershipPct: 82.0 },
          { name: "Employee Incentive Pool", type: "OTHER", ownershipPct: 18.0 }
        ],
        ultimateBeneficialOwners: [],
        disclosure: "PARTIAL_UBO_DISCLOSURE"
      };
      dataState = "PARTIAL";
    } else if (moduleCode === "M04") {
      data = {
        officers: [
          { name: "Alex Morgan", role: "Director", appointedAt: "2021-03-17", status: "ACTIVE" },
          { name: "Jamie Chen", role: "Chief Executive Officer", appointedAt: "2022-06-01", status: "ACTIVE" }
        ]
      };
    } else if (moduleCode === "M05") {
      data = {
        parent: { name: "North Bridge Industrial Holdings Ltd.", country: "GB", relationship: "DIRECT_PARENT" },
        affiliates: [
          { name: "Northstar Components Asia Pte. Ltd.", country: "SG", relationship: "SUBSIDIARY", ownershipPct: 100 },
          { name: "Northstar Components Europe B.V.", country: "NL", relationship: "SUBSIDIARY", ownershipPct: 100 }
        ]
      };
    } else if (moduleCode === "M06") {
      data = {
        currency: company.country === "US" ? "USD" : "LOCAL",
        periods: [
          { year: 2025, revenue: 48600000, netIncome: 4100000, totalAssets: 35200000 },
          { year: 2024, revenue: 43900000, netIncome: 3700000, totalAssets: 31900000 },
          { year: 2023, revenue: null, netIncome: null, totalAssets: 29400000 }
        ],
        missingFields: ["2023.revenue", "2023.netIncome"]
      };
      dataState = "PARTIAL";
    } else if (moduleCode === "M07") {
      data = {
        summary: { courtCases: company.status === "DISSOLVED" ? 2 : 0, enforcementRecords: 0, administrativePenalties: 0 },
        records: company.status === "DISSOLVED" ? [
          { type: "CIVIL_CASE", date: "2023-08-11", role: "DEFENDANT", amount: 125000, currency: "USD", status: "CLOSED" },
          { type: "CIVIL_CASE", date: "2022-05-09", role: "PLAINTIFF", amount: 48000, currency: "USD", status: "CLOSED" }
        ] : []
      };
      dataState = data.records.length ? "AVAILABLE" : "NO_RECORD";
    } else if (moduleCode === "M08") {
      data = {
        screenedAt: new Date().toISOString(),
        lists: ["MOCK-UN", "MOCK-OFAC", "MOCK-EU", "MOCK-UK"],
        matches: [],
        conclusion: "NO_MATCH_FOUND_IN_DECLARED_TEST_SCOPE"
      };
      dataState = "NO_RECORD";
    } else if (moduleCode === "M09") {
      data = { listing: null, financingRounds: [], mergersAndAcquisitions: [] };
      dataState = "NO_RECORD";
    } else {
      data = { reason: "MOCK_PROVIDER_HAS_NO_RELIABLE_COVERAGE", sellable: false, billable: false };
      dataState = "NO_COVERAGE";
    }

    return {
      dataState,
      billable: dataState !== "NO_COVERAGE",
      data: {
        companyId,
        companyName: company.name,
        module: { code: moduleCode, name: module.name, mockPrice: module.price },
        result: data,
        evidence: [source(moduleCode, `${moduleCode}.result`)]
      }
    };
  }

  return { mode: "mock", searchCompanies, getCompany, getMarkets, getModule };
}
