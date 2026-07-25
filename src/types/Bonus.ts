import { z } from 'zod';

import { Tag, TagSchema } from '@/types/Tags';

export enum BonusType {
  // Base Game
  CONSERVATION_POINT = 'Conservation Point',
  REPUTATION = 'Reputation',
}

export interface Bonus {
  bonusType: BonusType;
  bonusRequirement?: Tag | 'release';
  bonusDesc?: string;
  bonusValue: number;
}

export const BonusSchema = z.object({
  bonusType: z.nativeEnum(BonusType),
  bonusRequirement: z.optional(z.union([TagSchema, z.literal('release')])),
  bonusDesc: z.optional(z.string()),
  bonusValue: z.number(),
});
