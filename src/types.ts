export type AQILevel = 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AQICategoryDetails {
  key: AQILevel;
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  textColor: string;
  shortDesc: string;
  detailedExplanation: string;
  precautions: {
    general: string;
    sensitive: string;
    children: string;
    elderly: string;
    exercise: string;
  };
}

export interface TrendDayData {
  day: string;
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  category: AQILevel;
}

export interface CityAirData {
  id: string;
  name: string;
  state: string;
  country: string;
  currentAQI: number;
  category: AQILevel;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  lastUpdated: string;
  healthRecommendation: string;
  dominantPollutant: string;
  trendDirection: 'Improving' | 'Worsening' | 'Stable';
  weeklyTrend: TrendDayData[];
  quickAdvice: {
    jogging: string;
    children: string;
    mask: string;
    ventilation: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  cityContext?: string;
  aqiContext?: number;
  categoryContext?: string;
}

export interface ClimateTopic {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  sdgTag: 'SDG 11' | 'SDG 13' | 'SDG 11 & 13';
  overview: string;
  keyPoints: string[];
  impactStat: string;
  actionableStep: string;
}

export interface SafetyTipGroup {
  id: string;
  title: string;
  targetAudience: string;
  iconName: string;
  goodAdvice: string;
  moderateAdvice: string;
  unhealthyAdvice: string;
  hazardousAdvice: string;
  generalTips: string[];
}

export type AlertSeverity = 'none' | 'normal' | 'caution' | 'warning' | 'high' | 'critical';

export interface AqiAnalysisData {
  whyHigh: string;
  levelMeaning: string;
  generalPrecautions: string[];
  whatToAvoid: string[];
  safeToDo: string[];
  source: string;
}

export type ActivityType =
  | 'jogging'
  | 'cycling'
  | 'walking'
  | 'outdoor_sports'
  | 'running'
  | 'indoor_exercise';

export interface ActivityRecommendationData {
  activity: ActivityType;
  activityLabel: string;
  status: 'safe' | 'caution' | 'not_recommended';
  statusLabel: string;
  recommendation: string;
  alternativeIndoor: string;
  source: string;
}

export interface TrendSummaryData {
  averageAQI: number;
  highestAQI: number;
  lowestAQI: number;
  trendStatus: 'Improving' | 'Worsening' | 'Stable';
  aiSummary: string;
  source: string;
}

export interface SchoolSafetyData {
  outdoorRecess: string;
  sportsRecommendation: string;
  studentExplanation: string;
  teacherParentMessage: string;
  source: string;
}
