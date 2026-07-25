import { z } from 'zod';

export enum EffectType {
  // Base Game
  PASSIVE = 'passive',
  IMMEDIATE = 'immediate',
  INCOME = 'income',
  ENDGAME = 'endgame',
  CONSERVATION = 'conservation', // use for project card
}

export interface Effect {
  effectType: EffectType;
  effectDesc: string;

  // front end logic
  display?: boolean;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  start?: number;
  end?: number;
}

export const EffectSchema = z.object({
  effectType: z.nativeEnum(EffectType),
  effectDesc: z.string(),
  display: z.optional(z.boolean()),
  fontSize: z.optional(
    z.enum(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']),
  ),
  start: z.optional(z.number()),
  end: z.optional(z.number()),
});
