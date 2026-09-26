import { TreeSpeciesInfo, TreeSpeciesId } from '../types';

export const TREE_SPECIES: Record<TreeSpeciesId, TreeSpeciesInfo> = {
  oak: {
    id: 'oak',
    name: 'Дуб величний',
    botanicalName: 'Quercus robur',
    symbol: 'Міць та незламна воля',
    description: 'Один із наймогутніших лісових велетнів. Символізує непохитний характер, глибоке коріння та залізну витримку.',
    icon: '🌳',
    accentColor: '#1E8A69',
    leafColor: '#2D8055',
    leafColor2: '#41A870',
    trunkColor: '#6B4829',
    specialDetail: 'Жолуді та розлога кована крона',
    growDaysRealistic: 20
  },
  sakura: {
    id: 'sakura',
    name: 'Сакура квітуча',
    botanicalName: 'Prunus serrulata',
    symbol: 'Краса та оновлення життя',
    description: 'Японська декоративна вишня, чиє цвітіння знаменує весняне переродження і позбавлення від токсинів минулого.',
    icon: '🌸',
    accentColor: '#E06B9A',
    leafColor: '#4A9C72',
    leafColor2: '#F4A3C2',
    trunkColor: '#5C4436',
    specialDetail: 'Хмари ніжних рожевих пелюсток',
    growDaysRealistic: 20
  },
  pine: {
    id: 'pine',
    name: 'Карпатська Сосна',
    botanicalName: 'Pinus sylvestris',
    symbol: 'Чисті легені та свіжість гір',
    description: 'Вічнозелене хвойне дерево, що виділяє фітонциди й наповнює повітря ароматом чистоти і здоров’я.',
    icon: '🌲',
    accentColor: '#15803D',
    leafColor: '#1B6B45',
    leafColor2: '#2F9360',
    trunkColor: '#85532F',
    specialDetail: 'Вічнозелена хвоя та молоді шишки',
    growDaysRealistic: 20
  },
  apple: {
    id: 'apple',
    name: 'Яблуня плодова',
    botanicalName: 'Malus domestica',
    symbol: 'Життєва енергія та щедрі плоди',
    description: 'Дерево достатку й відновленого смаку життя. Навесні дарує біло-рожеві квіти, а згодом — соковиті плоди.',
    icon: '🍎',
    accentColor: '#DC2626',
    leafColor: '#369A5D',
    leafColor2: '#57B97E',
    trunkColor: '#664C35',
    specialDetail: 'Соковиті червоні яблука серед листя',
    growDaysRealistic: 20
  },
  maple: {
    id: 'maple',
    name: 'Золотистий Клен',
    botanicalName: 'Acer platanoides',
    symbol: 'Душевна гармонія та затишок',
    description: 'Благородне дерево з різьбленим листям теплих бурштинових тонів, що дарує спокій та рівновагу.',
    icon: '🍁',
    accentColor: '#D97706',
    leafColor: '#E68A2E',
    leafColor2: '#F5B041',
    trunkColor: '#73523B',
    specialDetail: 'Золотаве різьблене осіннє листя',
    growDaysRealistic: 20
  }
};

export interface TreeGrowthStage {
  minGrowth: number;
  maxGrowth: number;
  name: string;
  stageNum: number;
  approxDays: string;
  description: string;
  careTip: string;
}

export const TREE_STAGES: TreeGrowthStage[] = [
  {
    stageNum: 1,
    minGrowth: 0,
    maxGrowth: 15,
    name: 'Спляча насінина',
    approxDays: '1–3 дні',
    description: 'Зернятко спокійно спить у теплому вологому ґрунті, вбираючи енергію кожного чистого дня.',
    careTip: 'Медитативне спостереження та спокій живлять насінину для першого пробудження.'
  },
  {
    stageNum: 2,
    minGrowth: 15,
    maxGrowth: 35,
    name: 'Перший паросток',
    approxDays: '4–7 днів',
    description: 'Тендітне зелене стебельце пробиває шар ґрунту і розгортає перші сім’ядольні листочки.',
    careTip: 'Паростку потрібне м’яке розсіяне світло і спокійний подих чистоти.'
  },
  {
    stageNum: 3,
    minGrowth: 35,
    maxGrowth: 65,
    name: 'Молодий саджанець',
    approxDays: '8–13 днів',
    description: 'Стовбурець міцнішає, закладаються перші бічні гілочки та здорове глибоке коріння.',
    careTip: 'Стовбур міцнішає з кожним днем без диму.'
  },
  {
    stageNum: 4,
    minGrowth: 65,
    maxGrowth: 90,
    name: 'Зміцніле дерево',
    approxDays: '14–18 днів',
    description: 'Формується пишна розлога крона, кора потовстішала. Дерево вже стійке до будь-яких вітрів.',
    careTip: 'Дерево вже майже доросле — листя шумить спокоєм.'
  },
  {
    stageNum: 5,
    minGrowth: 90,
    maxGrowth: 100,
    name: 'Доросле дозріле дерево',
    approxDays: '19–20 днів',
    description: 'Дерево повністю дозріло! Воно сповнене життєвої сили та готове перейти у ваш Затишний ліс.',
    careTip: 'Відправте дозріле дерево у Затишний ліс і оберіть нову насінину за наступні 300 сигарет.'
  }
];

export function getTreeStageInfo(growth: number): TreeGrowthStage {
  for (let i = TREE_STAGES.length - 1; i >= 0; i--) {
    if (growth >= TREE_STAGES[i].minGrowth) {
      return TREE_STAGES[i];
    }
  }
  return TREE_STAGES[0];
}
