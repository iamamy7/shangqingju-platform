import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixturesDir = join(root, "fixtures");

const markets = [
  { code:"CN", name:"中国大陆", count:20, currency:"CNY", legalForm:"有限责任公司", cities:["合肥","上海","深圳","杭州"], industries:["企业软件服务","智能制造","新能源技术","医疗器械"] },
  { code:"US", name:"美国", count:15, currency:"USD", legalForm:"Corporation", cities:["Austin, TX","Wilmington, DE","Seattle, WA"], industries:["Enterprise Software","Advanced Manufacturing","Clean Technology"] },
  { code:"HK", name:"中国香港", count:10, currency:"HKD", legalForm:"Private Company Limited by Shares", cities:["Wan Chai, Hong Kong","Kowloon, Hong Kong"], industries:["International Trading","Business Services"] },
  { code:"SG", name:"新加坡", count:10, currency:"SGD", legalForm:"Private Company Limited by Shares", cities:["Singapore 068895","Singapore 018989"], industries:["Supply Chain Technology","Financial Technology"] },
  { code:"GB", name:"英国", count:10, currency:"GBP", legalForm:"Private Limited Company", cities:["London EC2Y","Cambridge CB2"], industries:["Biotechnology Research","Enterprise Services"] },
  { code:"DE", name:"德国", count:10, currency:"EUR", legalForm:"GmbH", cities:["Berlin","Munich"], industries:["Industrial Automation","Medical Technology"] },
  { code:"JP", name:"日本", count:10, currency:"JPY", legalForm:"Kabushiki Kaisha", cities:["Tokyo","Osaka"], industries:["Precision Manufacturing","Robotics"] },
  { code:"KR", name:"韩国", count:5, currency:"KRW", legalForm:"Jusik Hoesa", cities:["Seoul","Busan"], industries:["Semiconductor Equipment","Digital Commerce"] },
  { code:"NL", name:"荷兰", count:5, currency:"EUR", legalForm:"Besloten Vennootschap", cities:["Amsterdam","Rotterdam"], industries:["Logistics Technology","Sustainable Energy"] },
  { code:"FR", name:"法国", count:5, currency:"EUR", legalForm:"SAS", cities:["Paris","Lyon"], industries:["Consumer Technology","Life Sciences"] }
];

const roots = ["Asterbridge","Blueharbor","Cedarwave","Dawnfield","Evertrail","Farsight","Greenorbit","Highcrest","Ironleaf","Juniper","Keystone","Lumenpath","Moonridge","Nexora","Oakline","Pinegate","Quartzbay","Riverstone","Silverpeak","Truehaven"];
const suffixes = ["Analytics","Components","Dynamics","Industries","Networks"];
const cnRoots = ["星桥","蓝港","云杉","晨野","远航","观澜","绿环","高岭","铁杉","知行","基石","明径","月岚","新域","橡澜","松源","晶湾","河岳","银峰","真屿"];
const cnSuffixes = ["数据科技","精密部件","智能系统","产业服务","网络技术"];

function pad(n, size=4) { return String(n).padStart(size, "0"); }
function dateFor(n) { return `${2006 + (n % 17)}-${pad((n % 12) + 1,2)}-${pad((n % 27) + 1,2)}`; }

const companies = [];
let serial = 1;
for (const market of markets) {
  for (let i = 0; i < market.count; i += 1, serial += 1) {
    const root = roots[(serial - 1) % roots.length];
    const suffix = suffixes[Math.floor((serial - 1) / roots.length) % suffixes.length];
    const cnName = `${cnRoots[(serial - 1) % cnRoots.length]}${cnSuffixes[Math.floor((serial - 1) / cnRoots.length) % cnSuffixes.length]}有限公司`;
    const legalSuffix = market.code === "US" ? "Inc." : market.code === "GB" ? "Ltd" : market.code === "DE" ? "GmbH" : market.code === "NL" ? "B.V." : market.code === "FR" ? "SAS" : market.code === "SG" ? "Pte. Ltd." : market.code === "HK" ? "Limited" : market.code === "JP" ? "K.K." : market.code === "KR" ? "Co., Ltd." : "Co., Ltd.";
    const englishName = `${root} ${suffix} ${legalSuffix}`;
    const registrationNumber = market.code === "CN" ? `91340100SQJ${pad(serial,6)}` : `SQJ-${market.code}-REG-${pad(serial,5)}`;
    companies.push({
      id: `SQJ-SYN-${market.code}-${pad(serial)}`,
      name: market.code === "CN" ? `${root} ${suffix} Co., Ltd.` : englishName,
      localName: market.code === "CN" ? cnName : englishName,
      aliases: market.code === "CN" ? [cnName.replace("有限公司", ""), `${root} ${suffix}`] : [`${root} ${suffix}`, `SQJ Test ${pad(serial)}`],
      country: market.code,
      countryName: market.name,
      registrationNumber,
      status: serial % 19 === 0 ? "DISSOLVED" : "ACTIVE",
      address: market.code === "CN" ? `${market.cities[i % market.cities.length]}市商情测试路 ${100 + serial} 号` : `${100 + serial} Test Avenue, ${market.cities[i % market.cities.length]}`,
      foundedAt: dateFor(serial),
      legalForm: market.legalForm,
      industry: market.industries[i % market.industries.length],
      registeredCapital: `${market.currency} ${(1 + (serial % 25)) * 100000}`,
      isSynthetic: true,
      dataClassification: "SYNTHETIC_TEST_DATA",
      testBatch: "SQJ-MOCK-100-V1"
    });
  }
}

if (companies.length !== 100) throw new Error(`Expected 100 companies, got ${companies.length}`);

const companyModules = Object.fromEntries(companies.map((company, index) => {
  const n = index + 1;
  const currency = markets.find((market) => market.code === company.country)?.currency || "USD";
  const revenue = 18_000_000 + n * 730_000;
  const parentName = `${roots[(n + 7) % roots.length]} Holdings ${company.country === "CN" ? "有限公司" : "Ltd."}`;
  const ownerName = company.country === "CN" ? `${cnRoots[(n + 3) % cnRoots.length]}产业投资有限公司` : `${roots[(n + 3) % roots.length]} Capital Partners`;
  const legalRecords = n % 4 === 0 ? [{ id:`CASE-${pad(n,4)}-01`, type:"COMMERCIAL_DISPUTE", role:n % 8 === 0 ? "DEFENDANT" : "PLAINTIFF", filedAt:`202${n % 4}-0${(n % 8) + 1}-12`, status:"CLOSED", amount:50_000 + n * 1_000, currency }] : [];
  const sanctionsMatches = n % 37 === 0 ? [{ list:"MOCK-TEST-LIST", name:company.name, matchScore:0.72, disposition:"FALSE_POSITIVE_REVIEW_REQUIRED" }] : [];
  const modulesForCompany = {
    M01: { dataState:"AVAILABLE", data:{ identity:{ legalName:company.name, localName:company.localName, registrationNumber:company.registrationNumber, country:company.country, legalForm:company.legalForm, status:company.status, foundedAt:company.foundedAt, registeredCapital:company.registeredCapital, registeredAddress:company.address, industry:company.industry } } },
    M02: { dataState:"AVAILABLE", data:{ contacts:[{ type:"WEBSITE", value:`https://${company.id.toLowerCase()}.example.test`, confidence:0.9 },{ type:"EMAIL", value:`compliance.${pad(n)}@example.test`, confidence:0.82 }], operatingAddresses:[{ address:company.address, isRegisteredAddress:true },{ address:`${200 + n} Operations Road, ${company.country}`, isRegisteredAddress:false }] } },
    M03: { dataState:"AVAILABLE", data:{ shareholders:[{ name:parentName, type:"COMPANY", ownershipPct:62 + (n % 20) },{ name:ownerName, type:"COMPANY", ownershipPct:28 - (n % 10) },{ name:`Employee Pool ${pad(n)}`, type:"OTHER", ownershipPct:10 }], ultimateBeneficialOwners:[{ name:`Synthetic Beneficial Owner ${pad(n)}`, ownershipPct:28 + (n % 18), nationality:company.country }], disclosure:"COMPLETE_SYNTHETIC_TEST_PROFILE" } },
    M04: { dataState:"AVAILABLE", data:{ officers:[{ name:`Director ${pad(n)} A`, role:"Director", appointedAt:`2021-0${(n % 8) + 1}-15`, status:"ACTIVE" },{ name:`Executive ${pad(n)} B`, role:"Chief Executive Officer", appointedAt:`2022-0${(n % 8) + 1}-01`, status:"ACTIVE" },{ name:`Finance ${pad(n)} C`, role:"Chief Financial Officer", appointedAt:`2023-0${(n % 8) + 1}-20`, status:"ACTIVE" }] } },
    M05: { dataState:"AVAILABLE", data:{ parent:{ name:parentName, country:company.country, relationship:"DIRECT_PARENT", ownershipPct:62 + (n % 20) }, affiliates:[{ name:`${company.name} Operations ${pad(n)}`, country:company.country, relationship:"SUBSIDIARY", ownershipPct:100 },{ name:`${company.name} International ${pad(n)}`, country:markets[(index + 1) % markets.length].code, relationship:"SUBSIDIARY", ownershipPct:75 }] } },
    M06: { dataState:"AVAILABLE", data:{ currency, periods:[0,1,2].map((offset)=>({ year:2025-offset, revenue:revenue-offset*1_350_000, netIncome:Math.round((revenue-offset*1_350_000)*(0.07+(n%6)/100)), totalAssets:Math.round((revenue-offset*900_000)*0.78), totalLiabilities:Math.round((revenue-offset*900_000)*0.41), operatingCashFlow:Math.round((revenue-offset*1_000_000)*0.09) })), auditOpinion:n%17===0?"QUALIFIED":"UNQUALIFIED" } },
    M07: { dataState:"AVAILABLE", data:{ summary:{ courtCases:legalRecords.length, enforcementRecords:n%29===0?1:0, administrativePenalties:n%23===0?1:0 }, records:legalRecords, complianceFlags:[...(n%23===0?["ADMINISTRATIVE_PENALTY_REVIEW"]:[]), ...(n%29===0?["ENFORCEMENT_RECORD_REVIEW"]:[])] } },
    M08: { dataState:"AVAILABLE", data:{ screenedAt:`2026-08-${pad((n%23)+1,2)}T08:00:00Z`, lists:["MOCK-UN","MOCK-OFAC","MOCK-EU","MOCK-UK"], matches:sanctionsMatches, conclusion:sanctionsMatches.length?"POTENTIAL_MATCH_REQUIRES_REVIEW":"NO_MATCH_FOUND_IN_DECLARED_TEST_SCOPE" } },
    M09: { dataState:"AVAILABLE", data:{ listing:n%9===0?{ exchange:"MOCK-EXCHANGE", ticker:`SQJ${pad(n)}`, status:"LISTED" }:null, financingRounds:[{ round:n%3===0?"Series B":"Series A", announcedAt:`202${n%5}-06-15`, amount:2_000_000+n*80_000, currency, investors:[ownerName] }], mergersAndAcquisitions:n%11===0?[{ role:"ACQUIRER", target:`Synthetic Target ${pad(n)}`, announcedAt:"2025-04-18", status:"COMPLETED" }]:[] } },
    M10: { dataState:"AVAILABLE", data:{ patents:{ applications:8+(n%43), grants:4+(n%29), active:3+(n%24), sampleIds:[`PAT-SQJ-${pad(n)}-A`,`PAT-SQJ-${pad(n)}-B`] }, trademarks:{ registered:2+(n%12), pending:n%4 }, cyberRisk:{ score:42+(n%48), grade:n%5===0?"B":"A", observedAt:"2026-08-20" }, technologyTags:[company.industry,"SYNTHETIC_TEST_TECHNOLOGY"] } }
  };
  return [company.id, modulesForCompany];
}));

const columns = ["id","name","localName","aliases","country","countryName","registrationNumber","status","address","foundedAt","legalForm","industry","registeredCapital","isSynthetic","dataClassification","testBatch"];
const csvCell = (value) => `"${String(Array.isArray(value) ? value.join(" | ") : value).replaceAll('"','""')}"`;
const csv = [columns.join(","), ...companies.map((company) => columns.map((column) => csvCell(company[column])).join(","))].join("\n") + "\n";

await mkdir(fixturesDir, { recursive:true });
await writeFile(join(fixturesDir, "companies-100.json"), JSON.stringify(companies, null, 2) + "\n");
await writeFile(join(fixturesDir, "companies-100.csv"), csv);
await writeFile(join(fixturesDir, "company-modules-100.json"), JSON.stringify(companyModules, null, 2) + "\n");
console.log(`Generated ${companies.length} synthetic companies and ${companies.length * 10} company-module records.`);
