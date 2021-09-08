/*
 Copyright 2020 Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 *
 * CandidateSiteType
 *  - Candidate Site Type
 *
 * Author:   John Grayson - Applications Prototype Lab - Esri
 * Created:  8/24/2021 - 0.0.1 -
 * Modified:
 *
 */

class CandidateSiteType {

  /**
   * {string}
   */
  siteType;

  /**
   * {Object}
   */
  studyAreasOptions;

  /**
   * {Object[]}
   */
  analysisVariableInfos;

  /**
   * {String[]}
   */
  analysisVariables;

  /**
   *
   * @param {string} siteType
   */
  constructor({siteType}) {

    // SITE TYPE //
    this.siteType = siteType;

    // STUDY AREAS OPTIONS //
    this.studyAreasOptions = CandidateSiteType.STUDY_AREA_OPTIONS[siteType];

    // ANALYSIS VARIABLE INFOS //
    this.analysisVariableInfos = CandidateSiteType.ANALYSIS_VARIABLE_INFOS.filter(analysisVariableInfo => {
      return analysisVariableInfo.types.includes(siteType);
    });

    // ANALYSIS VARIABLES //
    this.analysisVariables = this.analysisVariableInfos.map(avi => avi.field);
  }

}

CandidateSiteType.TYPE_INFOS = {
  'Retail': 'Retail',
  'Office': 'Office',
  'Industrial': 'Industrial',
  'Mixed-Use': 'Mixed-Use'
};

CandidateSiteType.STUDY_AREA_OPTIONS = {
  'Retail': {
    areaType: "NetworkServiceArea",
    travel_mode: "Walking",
    bufferUnits: "Minutes",
    bufferRadii: [10]
  },
  'Office': {
    areaType: "NetworkServiceArea",
    travel_mode: "Driving",
    bufferUnits: "Minutes",
    bufferRadii: [15]
  },
  'Industrial': {
    areaType: "NetworkServiceArea",
    travel_mode: "Driving",
    bufferUnits: "Minutes",
    bufferRadii: [10]
  },
  'Mixed-Use': {
    areaType: "RingBuffer",
    bufferUnits: "esriMiles",
    bufferRadii: [1]
  }
};

CandidateSiteType.ANALYSIS_VARIABLE_INFOS = [
  {
    'label': 'Daytime Population',
    'field': 'DaytimePopulation.DPOP_CY',
    'description': '2021 Total Daytime Population (Esri)',
    'group': 'Population',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Unemployment Rate',
    'field': 'EmploymentUnemployment.UNEMPRT_CY',
    'description': 'Current-year estimate of the rate of unemployed persons aged 16 and older. The rate estimates the total number of unemployed persons as a percentage of the civilian labor force. (Esri)',
    'group': 'Population',
    'format': 'rate',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Total Businesses',
    'field': 'businesses.N01_BUS',
    'description': 'Total Businesses (NAICS)',
    'group': 'Businesses',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Total Housing Units',
    'field': 'HistoricalHousing.TOTHU_CY',
    'description': '2021 Total Housing Units (Esri)',
    'group': 'Housing',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Median Home Value 2021',
    'field': 'KeyUSFacts.MEDVAL_CY',
    'description': 'Current-year estimate of median home value (Esri)',
    'group': 'Housing',
    'format': 'money',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Median Home Value 2026',
    'field': 'KeyUSFacts.MEDVAL_FY',
    'description': 'Five-year forcast of median home value (Esri)',
    'group': 'Housing',
    'compareTo': 'MEDVAL_CY',
    'format': 'money',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Median Household Income 2021',
    'field': 'Health.MEDHINC_CY',
    'description': 'Current-year estimate of median household income (Esri)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Median Household Income 2026',
    'field': 'KeyUSFacts.MEDHINC_FY',
    'description': 'Five-year forcast of median household income (Esri)',
    'group': 'Income',
    'compareTo': 'MEDHINC_CY',
    'format': 'money',
    'types': ['Retail', 'Office', 'Industrial', 'Mixed-Use']
  },
  {
    'label': 'Annual Budget Expenditures',
    'field': 'SpendingTotal.X1001_X',
    'description': 'Expenses annually (Esri & Bureau of Labor Statistics)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Mixed-Use']
  },
  {
    'label': 'Median Disposable Income',
    'field': 'Wealth.MEDDI_CY',
    'description': 'Current-year estimate of median disposable income (Esri)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Mixed-Use']
  },
  {
    'label': 'Retail Goods (Monthly)',
    'field': 'spendingFactsForMobileApps.X15001_X_A_calc',
    'description': 'Total expenditures on retail goods per month (Esri & Bureau of Labor Statistics)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Mixed-Use']
  },
  {
    'label': 'Restaurant (Monthly)',
    'field': 'spendingFactsForMobileApps.X1131_X_A_calc',
    'description': 'Total expenditures on restaurants per month (Esri & Bureau of Labor Statistics)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Mixed-Use']
  },
  {
    'label': 'High School',
    'field': 'educationalattainment.HSGRAD_CY',
    'description': 'Population age 25+: High School Diploma',
    'group': 'Education',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial']
  },
  {
    'label': 'Bachelors',
    'field': 'educationalattainment.BACHDEG_CY',
    'description': 'Population age 25+: Bachelors Degree (Esri)',
    'group': 'Education',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial']
  },
  {
    'label': 'Graduate',
    'field': 'educationalattainment.GRADDEG_CY',
    'description': 'Population age 25+: Graduate/Professional Degree (Esri)',
    'group': 'Education',
    'format': 'count',
    'types': ['Retail', 'Office', 'Industrial']
  },

  {
    'label': 'Dominant Tapestry Segment',
    'field': 'AtRisk.TSEGNAME',
    'description': '2021 Dominant Tapestry Segment Name (Esri)',
    'group': 'Population',
    'format': 'none',
    'types': ['Mixed-Use']
  },
  {
    'label': 'Construction Employees',
    'field': 'employees.N05_EMP',
    'description': 'Construction Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Industrial']
  },
  {
    'label': 'Finance & Insurance Employees',
    'field': 'employees.N23_EMP',
    'description': 'Finance & Insurance Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Office']
  },
  {
    'label': 'Insurance Employees',
    'field': 'employees.N26_EMP',
    'description': 'Insur/Funds/Trusts/Other Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Office']
  },
  {
    'label': 'Manufacturing Employees',
    'field': 'employees.N06_EMP',
    'description': 'Manufacturing Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Industrial']
  },
  {
    'label': 'Management Employees',
    'field': 'employees.N30_EMP',
    'description': 'Mgmt of Companies/Enterprises Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Office']
  },
  {
    'label': 'Real Estate Employees',
    'field': 'employees.N27_EMP',
    'description': 'Real Estate/Rental/Leasing Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Office']
  },
  {
    'label': 'Transportation/Warehouse Employees',
    'field': 'employees.N21_EMP',
    'description': 'Transportation/Warehouse Employees (NAICS)',
    'group': 'Employees',
    'format': 'count',
    'types': ['Industrial']
  },
  {
    'label': 'Food Away From Home (2026)',
    'field': 'food.X1130FY_X',
    'description': 'Consumer Spending, Food Away from Home (Esri & Bureau of Labor Statistics)',
    'group': 'Income',
    'format': 'money',
    'types': ['Mixed-Use']
  },
  {
    'label': 'Retail Goods (2026)',
    'field': 'SpendingTotal.X15001FY_X',
    'description': 'Consumer Spending, Retail Goods (Esri & Bureau of Labor Statistics)',
    'group': 'Income',
    'format': 'money',
    'types': ['Retail', 'Mixed-Use']
  }
];

export default CandidateSiteType;
