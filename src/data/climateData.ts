import { ClimateTopic } from '../types';

export const CLIMATE_TOPICS: ClimateTopic[] = [
  {
    id: 'what-is-air-pollution',
    title: 'What is Air Pollution?',
    subtitle: 'Understanding the airborne contaminants we breathe',
    iconName: 'Wind',
    sdgTag: 'SDG 11',
    overview:
      'Air pollution is the contamination of indoor or outdoor environments by chemical, physical, or biological agents that modify the natural characteristics of the atmosphere. Key hazardous components include fine particulate matter (PM2.5 and PM10), nitrogen dioxide (NO2), sulfur dioxide (SO2), carbon monoxide (CO), and ground-level ozone (O3).',
    keyPoints: [
      'PM2.5 particles are less than 2.5 microns in diameter—roughly 30 times smaller than a single human hair.',
      'Because of their minute size, PM2.5 can bypass nasal filtration and enter deep into lung alveoli and systemic blood circulation.',
      'Primary pollutants are emitted directly from sources (e.g., smokestacks and vehicle exhausts), while secondary pollutants form via photochemical reactions in sunlight.',
    ],
    impactStat: '99% of humanity breathes air that exceeds WHO quality limits.',
    actionableStep: 'Track daily AQI before outdoor commutes to minimize peak-exposure hours.',
  },
  {
    id: 'causes-poor-aqi',
    title: 'What Causes Poor AQI?',
    subtitle: 'Anthropogenic emissions & meteorological traps',
    iconName: 'Factory',
    sdgTag: 'SDG 11',
    overview:
      'Poor Air Quality Index (AQI) readings stem from a combination of concentrated urban human activities and atmospheric stagnation. While vehicular exhaust and industrial combustion continuously inject hydrocarbons and soot, winter temperature inversions trap pollutants near ground level like a sealed greenhouse lid.',
    keyPoints: [
      'Vehicular transport: Incomplete fossil fuel combustion releases ultra-fine soot, NOx, and volatile organic compounds.',
      'Thermal power & industrial clusters: Coal and heavy fuel oils release large amounts of SO2 and heavy metal fly ash.',
      'Seasonal crop stubble burning & biomass: Releases immense particulate plumes that travel hundreds of kilometers across river basins.',
      'Meteorological inversion: Cold, dense ground air trapped under warm air prevents vertical atmospheric dispersion.',
    ],
    impactStat: 'Urban vehicular emissions contribute up to 40% of ground-level PM2.5 in mega-cities.',
    actionableStep: 'Support electric mobility, active cycling, and stricter industrial emission filters.',
  },
  {
    id: 'affects-cities',
    title: 'How Air Pollution Affects Cities',
    subtitle: 'Urban stress, healthcare costs & SDG 11 alignment',
    iconName: 'Building2',
    sdgTag: 'SDG 11',
    overview:
      'Under United Nations SDG 11 (Sustainable Cities and Communities), urban resilience depends on clean air and equitable public spaces. Chronic smog accelerates the Urban Heat Island effect, degrades public infrastructure via acid deposition, decreases workforce productivity, and places massive burdens on public emergency medical systems.',
    keyPoints: [
      'Children and vulnerable demographics living near congested transit corridors suffer higher asthma hospitalizations.',
      'Acid gases and particulate corrosion deteriorate historic architecture, bridges, and solar energy generation efficiency.',
      'Urban heat islands worsen as particulate aerosol layers trap infrared re-radiation above concrete asphalt canyons.',
      'Target 11.6 specifically calls for reducing the adverse per capita environmental impact of cities, focusing on air quality.',
    ],
    impactStat: '$8.1 Trillion: Estimated global annual economic burden of air pollution healthcare costs.',
    actionableStep: 'Advocate for low-emission clean air zones and expanded urban forest green belts.',
  },
  {
    id: 'climate-change-nexus',
    title: 'Air Pollution & Climate Change',
    subtitle: 'Two sides of the same planetary crisis (SDG 13)',
    iconName: 'Flame',
    sdgTag: 'SDG 13',
    overview:
      'Air pollution and global climate change are intrinsically coupled through common emission sources: fossil fuels, industrial combustion, and deforestation. Short-lived climate pollutants (SLCPs) such as black carbon (soot) and ground-level ozone have global warming potentials hundreds to thousands of times higher than CO2 over short horizons.',
    keyPoints: [
      'Black carbon (soot) deposits on polar ice and Himalayan glaciers, darkening snow surfaces and accelerating glacial melt.',
      'Tropospheric ozone reduces photosynthetic plant productivity, diminishing natural forest and agricultural carbon sinks.',
      'Climate warming worsens wildfires and desertification dust storms, creating dangerous trans-boundary air pollution feedback loops.',
      'Target 13.2 integrates climate action measures into national policies, simultaneously clearing city air and cooling the planet.',
    ],
    impactStat: 'Black carbon is the 2nd largest contributor to global warming after CO2.',
    actionableStep: 'Transitioning to renewable energy eliminates both greenhouse gases and toxic particulate smog.',
  },
  {
    id: 'how-to-reduce',
    title: 'How Individuals Can Reduce Pollution',
    subtitle: 'Practical micro-actions for macro community impact',
    iconName: 'Sparkles',
    sdgTag: 'SDG 11 & 13',
    overview:
      'Meaningful climate action (SDG 13) and sustainable community design (SDG 11) begin with daily collective habits. By altering how we commute, heat our homes, consume energy, and dispose of municipal waste, individuals can significantly curb local aerosol burdens.',
    keyPoints: [
      'Embrace active transit: Walk, cycle, or use electric public transit for short trips under 5 kilometers.',
      'Eliminate open burning: Never burn fallen leaves, municipal plastics, or garden waste in open yards.',
      'Energy efficiency at home: Lower heating and cooling thermostats by 1°C; switch to LED and energy-star appliances.',
      'Plant air-filtering greenery: Cultivate urban balconies and community gardens with particulate-capturing vegetation (e.g., Ficus, Areca palm, Snake plant).',
    ],
    impactStat: 'Replacing one weekly solo car commute with cycling cuts 500kg of annual CO2e and urban PM2.5.',
    actionableStep: 'Pledge today to switch at least 2 trips per week to clean transit or active walking.',
  },
];
