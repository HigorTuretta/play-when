import {
  Camera,
  Clapperboard,
  Cpu,
  FlaskConical,
  Gamepad2,
  Globe2,
  Landmark,
  Music2,
  Rocket,
  TrainFront,
  Trophy,
  Wifi,
} from 'lucide-react'

const DEFAULT_ACCENT = '#201f1c'

const categoryStyles = {
  História: { accent: '#9d5cff', icon: Landmark },
  Tecnologia: { accent: '#10bfa5', icon: Cpu },
  Ciência: { accent: '#ff5c7d', icon: FlaskConical },
  Espaço: { accent: '#1aa8ff', icon: Rocket },
  Invenções: { accent: '#ff7a18', icon: Cpu },
  Exploração: { accent: '#5f7cff', icon: Globe2 },
  Cultura: { accent: '#f3b321', icon: Camera },
  Games: { accent: '#ff5b35', icon: Gamepad2 },
  Internet: { accent: '#1bbf89', icon: Wifi },
  'Cinema & TV': { accent: '#ee6fa8', icon: Clapperboard },
  Música: { accent: '#7f6df2', icon: Music2 },
  Esportes: { accent: '#34a853', icon: Trophy },
  Transportes: { accent: '#e68a27', icon: TrainFront },
  Brasil: { accent: '#25a65a', icon: Landmark },
}

export const accentFor = (category) => categoryStyles[category]?.accent || DEFAULT_ACCENT
export const iconFor = (category) => categoryStyles[category]?.icon || Globe2
