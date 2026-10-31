import type { SliderVariable, ToggleVariable } from '../types/simulation';

// ------------------------------------------------------------------
// Slider variables.
// Ranges and defaults are anchored to observed Kenyan data where a
// World Bank indicator exists. The final slider is qualitative.
// ------------------------------------------------------------------

export const SLIDER_VARIABLES: SliderVariable[] = [
  {
    id: 'youth_unemployment',
    kind: 'slider',
    label: 'Youth unemployment',
    description:
      'Share of the labour force aged 15–24 without work but seeking employment. Higher values raise the salience of the Economy dimension.',
    unit: '%',
    min: 5,
    max: 35,
    step: 0.1,
    defaultValue: 15.2,
    worldBankCode: 'SL.UEM.1524.ZS',
    qualitative: false,
  },
  {
    id: 'adult_literacy',
    kind: 'slider',
    label: 'Adult literacy rate',
    description:
      'Share of the population aged 15 and above who can read and write. Affects the salience of Health & Education.',
    unit: '%',
    min: 50,
    max: 95,
    step: 0.1,
    defaultValue: 82.9,
    worldBankCode: 'SE.ADT.LITR.ZS',
    qualitative: false,
  },
  {
    id: 'female_labour_participation',
    kind: 'slider',
    label: 'Female labour force participation',
    description:
      'Share of women aged 15+ who are economically active. Shifts salience toward Economy and Health & Education.',
    unit: '%',
    min: 30,
    max: 85,
    step: 0.1,
    defaultValue: 63.0,
    worldBankCode: 'SL.TLF.CACT.FE.ZS',
    qualitative: false,
  },
  {
    id: 'poverty_headcount',
    kind: 'slider',
    label: 'Poverty headcount',
    description:
      'Share of the population living below the international poverty line. Raises salience of Economy and Devolution.',
    unit: '%',
    min: 15,
    max: 70,
    step: 0.1,
    defaultValue: 45.3,
    worldBankCode: 'SI.POV.DDAY',
    qualitative: false,
  },
  {
    id: 'turnout_propensity',
    kind: 'slider',
    label: 'Turnout propensity',
    description:
      'Expected share of registered voters who cast a ballot. Default is the 2022 national turnout (63.67%). Controls the spread of the internal Gumbel shock: higher turnout produces a wider distribution of outcomes.',
    unit: '%',
    min: 45,
    max: 90,
    step: 0.1,
    defaultValue: 63.67,
    worldBankCode: null,
    qualitative: false,
  },
  {
    id: 'qualitative_bias',
    kind: 'slider',
    label: 'Qualitative adjustment',
    description:
      'Captures unverifiable factors — sympathy votes, ethnic or tribal voting, name recognition, general like or dislike. Applied to the incumbent candidate only: negative values represent anti-incumbent sentiment, positive values an incumbency advantage. Individual candidate biases are configured separately on each candidate card.',
    unit: '',
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
    worldBankCode: null,
    qualitative: true,
  },
];

// ------------------------------------------------------------------
// Toggle variables (binary shocks).
// ------------------------------------------------------------------

export const TOGGLE_VARIABLES: ToggleVariable[] = [
  {
    id: 'misinformation_campaign',
    kind: 'toggle',
    label: 'Misinformation campaign active',
    description:
      'Adds a Gumbel shock to every candidate’s utility in every bloc, widening the percentile bands around each candidate’s share. Models an information environment in which voters’ preferences are less stable than usual.',
    defaultValue: false,
  },
  {
    id: 'corruption_scandal',
    kind: 'toggle',
    label: 'Incumbent corruption scandal',
    description:
      'Lowers the incumbent candidate’s position on the Corruption dimension by 20 points, increasing their distance from the median voter’s ideal.',
    defaultValue: false,
  },
  {
    id: 'registration_drive',
    kind: 'toggle',
    label: 'New voter registration drive',
    description:
      'Increases the share of low-information marginal voters, whose candidate preferences are less strongly anchored to stated policy positions. Implemented as a 15% reduction in the weight given to policy positions relative to qualitative factors and noise.',
    defaultValue: false,
  },
  {
    id: 'news_sentiment_shock',
    kind: 'toggle',
    label: 'Adverse news sentiment shock',
    description:
      'Applies a fixed negative utility shock (−0.3) to the incumbent candidate, representing an adverse news cycle. This is a planning constant; scaling by fetched GDELT sentiment is a planned improvement.',
    defaultValue: false,
  },
];

export function defaultSliderState(): Record<string, number> {
  return Object.fromEntries(SLIDER_VARIABLES.map((v) => [v.id, v.defaultValue]));
}

export function defaultToggleState(): Record<string, boolean> {
  return Object.fromEntries(TOGGLE_VARIABLES.map((v) => [v.id, v.defaultValue]));
}
