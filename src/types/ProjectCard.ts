/*
 * @Author: Ender Wiggin
 * @Date: 2026-02-22 00:14:04
 * @LastEditors: Ender Wiggin
 * @LastEditTime: 2026-02-22 00:47:33
 * @Description:
 */
import { z } from 'zod';

import { Bonus, BonusSchema } from '@/types/Bonus';
import { CardSource, CardSourceSchema } from '@/types/CardSource';
import { Effect, EffectSchema } from '@/types/Effect';
import { Tag, TagSchema } from '@/types/Tags';

export type TProjectSlotPosition = 1 | 2 | 3;
export interface ProjectSlot {
  position: TProjectSlotPosition;
  bonuses: Bonus[];
  indicator?: number;
}
export enum ProjectCategory {
  BASE = 'Base',
  NORMAL = 'Normal',
  RELEASE = 'Release',
  BREED = 'Breed',
  MARINE = 'Marine',
  FAN_MADE = 'Fan Made',
}

export interface ProjectCard {
  id: string;
  name: string;
  type: ProjectCategory;
  image?: string;
  directUseImage?: boolean;
  tag: Tag;
  slots: ProjectSlot[];
  placeBonuses: Bonus[];
  description: Effect;
  // meta data
  source: CardSource;
}

const ProjectSlotSchema = z.object({
  position: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  bonuses: z.array(BonusSchema),
  indicator: z.optional(z.number()),
});

export const ProjectCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(ProjectCategory),
  image: z.optional(z.string()),
  directUseImage: z.optional(z.boolean()),
  tag: TagSchema,
  slots: z.array(ProjectSlotSchema).length(3),
  placeBonuses: z.array(BonusSchema),
  description: EffectSchema,
  source: CardSourceSchema,
});

export type ProjectCardSchemaDto = z.infer<typeof ProjectCardSchema>;
