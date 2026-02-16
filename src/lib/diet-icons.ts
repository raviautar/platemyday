import { FaSeedling, FaLeaf, FaDrumstickBite, FaFish, FaAppleAlt } from 'react-icons/fa';
import { GiMeat, GiOlive, GiFruitBowl, GiBread } from 'react-icons/gi';
import { MdOutlineNoFood } from 'react-icons/md';

export const DIET_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  omnivore: FaDrumstickBite,
  vegetarian: FaSeedling,
  vegan: FaLeaf,
  pescatarian: FaFish,
  keto: GiMeat,
  paleo: FaFish,
  primal: GiMeat,
  mediterranean: GiOlive,
  'low-carb': FaAppleAlt,
  flexitarian: GiFruitBowl,
  whole30: MdOutlineNoFood,
  'gluten-free': GiBread,
};
