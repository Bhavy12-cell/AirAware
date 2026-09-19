import { AQICategoryDetails, AQILevel } from '../types';

export const AQI_CATEGORIES: Record<AQILevel, AQICategoryDetails> = {
  good: {
    key: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    color: '#10B981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    shortDesc: 'Air quality is satisfactory and poses little to no health risk.',
    detailedExplanation:
      'Air quality is in the ideal range. Particulate concentrations (PM2.5 and PM10) are well within WHO daily targets. Everyone can freely engage in normal outdoor activities, jogging, and ventilation.',
    precautions: {
      general: 'Ideal conditions to enjoy the outdoors and air out indoor living spaces.',
      sensitive: 'No restrictions needed; safe for asthma and heart patients.',
      children: 'Outdoor sports and playground activities are fully encouraged.',
      elderly: 'Safe for long outdoor walks and routine activities.',
      exercise: 'Perfect conditions for running, cycling, and intense outdoor cardio.',
    },
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    color: '#EAB308', // amber-500
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: '#EAB308',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    shortDesc: 'Air quality is acceptable; however, very sensitive individuals may experience mild symptoms.',
    detailedExplanation:
      'Air quality is generally acceptable for the majority of the population. A very small number of individuals who are unusually sensitive to ozone or fine particulates may experience mild cough or throat tickle.',
    precautions: {
      general: 'Generally safe to be outside; keep normal awareness of dust and traffic.',
      sensitive: 'Consider taking more breaks and doing less strenuous activities if prone to asthma.',
      children: 'Safe for playground games; monitor if your child exhibits unusual coughing.',
      elderly: 'Safe for regular routines; avoid busy high-traffic highway corridors.',
      exercise: 'Safe for outdoor exercise; sensitive athletes should stay hydrated.',
    },
  },
  sensitive: {
    key: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    color: '#F97316', // orange-500
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#F97316',
    badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
    textColor: 'text-orange-600 dark:text-orange-400',
    shortDesc: 'Members of sensitive groups may experience health effects; general public is less affected.',
    detailedExplanation:
      'Children, older adults, active outdoor workers, and people with lung or heart diseases (such as asthma, COPD, or coronary artery disease) are at increased risk. The general public is unlikely to be severely affected, but may notice minor throat irritation.',
    precautions: {
      general: 'Most adults can carry on, but avoid prolonged heavy outdoor exertion near busy roadways.',
      sensitive: 'Reduce prolonged or heavy outdoor exertion. Keep inhalers or medications within reach.',
      children: 'Take more frequent rest breaks during outdoor sports. Switch to low-intensity games.',
      elderly: 'Limit lengthy outdoor chores during mid-day or rush hour pollution peaks.',
      exercise: 'Switch intense cardio to early morning before traffic peaks, or exercise indoors.',
    },
  },
  unhealthy: {
    key: 'unhealthy',
    label: 'Unhealthy',
    min: 151,
    max: 200,
    color: '#EF4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#EF4444',
    badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
    textColor: 'text-red-600 dark:text-red-400',
    shortDesc: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
    detailedExplanation:
      'Fine particulate matter (PM2.5) concentrations are significantly elevated. Long-term exposure to this air increases cardiopulmonary strain. Healthy people may experience eye irritation, coughing, and shortness of breath.',
    precautions: {
      general: 'Wear a certified N95 / KN95 mask when outdoors. Keep home windows closed during high-smog hours.',
      sensitive: 'Avoid prolonged outdoor exertion entirely. Use indoor HEPA air filtration where possible.',
      children: 'Schools should conduct physical education classes indoors. Avoid prolonged playground exposure.',
      elderly: 'Stay indoors with closed doors and windows. Monitor blood pressure and respiratory ease.',
      exercise: 'Avoid outdoor running, jogging, or cycling. Substitute with indoor bodyweight or yoga workouts.',
    },
  },
  very_unhealthy: {
    key: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#A855F7', // purple-500
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: '#A855F7',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    shortDesc: 'Health alert: The risk of health effects is increased for everyone in the population.',
    detailedExplanation:
      'Smog and aerosol layers are heavy. Inhaling this air triggers systemic inflammation and acute strain on the respiratory tract. Significant adverse symptoms are common across all demographic groups.',
    precautions: {
      general: 'Avoid all unnecessary outdoor exposure. Put on a tightly sealed N95 respirator if stepping out.',
      sensitive: 'Remain in air-purified indoor rooms. Follow medical action plans strictly.',
      children: 'Keep all children strictly indoors. School recess and sports matches should be suspended outdoors.',
      elderly: 'Avoid physical exertion; keep indoor air clean with HEPA purifiers or sealed spaces.',
      exercise: 'Strictly no outdoor jogging or athletic training. Only low-intensity indoor movement.',
    },
  },
  hazardous: {
    key: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 500,
    color: '#881337', // rose-900 / dark maroon
    bgColor: 'rgba(136, 19, 55, 0.15)',
    borderColor: '#881337',
    badgeClass: 'bg-rose-950/20 text-rose-800 dark:text-rose-300 border-rose-800/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    shortDesc: 'Health warning of emergency conditions. The entire population is likely to be affected.',
    detailedExplanation:
      'Emergency health condition. Severe atmospheric inversion and heavy combustion particles create severe toxicity. Immediate risk of acute airway constriction, chest tightness, and cardiovascular stress.',
    precautions: {
      general: 'Emergency status: Stay indoors with windows sealed. Run HEPA purifiers at maximum setting.',
      sensitive: 'Zero outdoor exposure. Have medical support lines ready if experiencing chest tightness.',
      children: 'Schools should activate emergency air pollution protocols (online classes or indoor shelter).',
      elderly: 'Remain in filtered indoor sanctuary rooms. Avoid any physical work or sudden outdoor cold air.',
      exercise: 'Completely eliminate all outdoor physical activities. Rest indoors in purified air.',
    },
  },
};

export const AQI_SCALE_LIST = Object.values(AQI_CATEGORIES);

export function getAQICategory(aqi: number): AQICategoryDetails {
  if (aqi <= 50) return AQI_CATEGORIES.good;
  if (aqi <= 100) return AQI_CATEGORIES.moderate;
  if (aqi <= 150) return AQI_CATEGORIES.sensitive;
  if (aqi <= 200) return AQI_CATEGORIES.unhealthy;
  if (aqi <= 300) return AQI_CATEGORIES.very_unhealthy;
  return AQI_CATEGORIES.hazardous;
}
