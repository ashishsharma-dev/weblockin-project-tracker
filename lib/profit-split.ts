export type PartnerCode = "Ashish" | "Kush" | "Ankit" | "Mahrishi";

const leadPercentages: Record<string, number> = {
  Ankit: 40,
  Mahrishi: 40,
  "Ankit,Mahrishi": 20
};

const developerPercentages: Record<string, number> = {
  Ashish: 60,
  Kush: 60,
  "Ashish,Kush": 30
};

export function calculateProfitSplit(input: {
  projectValue: number;
  expensesTotal: number;
  leadContributors: PartnerCode[];
  developerContributors: PartnerCode[];
}) {
  const netProfit = Math.max(input.projectValue - input.expensesTotal, 0);
  const leadPool = (netProfit * 40) / 100;
  const developerPool = (netProfit * 60) / 100;

  const partnerAmounts: Record<PartnerCode, number> = {
    Ashish: 0,
    Kush: 0,
    Ankit: 0,
    Mahrishi: 0
  };

  for (const code of input.leadContributors) {
    const key = [...input.leadContributors].sort().join(",");
    const percentage = leadPercentages[key] ?? 0;
    partnerAmounts[code] = (netProfit * percentage) / 100;
  }

  for (const code of input.developerContributors) {
    const key = [...input.developerContributors].sort().join(",");
    const percentage = developerPercentages[key] ?? 0;
    partnerAmounts[code] = (netProfit * percentage) / 100;
  }

  return {
    netProfit,
    leadPool,
    developerPool,
    partnerAmounts
  };
}
