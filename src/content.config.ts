import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define the "Sub-Schemas"
const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const TeamSchema = z.object({
  number: z.number(),
  name: z.string(),
  org: z.string(),
  rookieYear: z.number(),
  coords: CoordinatesSchema,
});

const FTCEventSchema = z.object({
  code: z.string(),
  name: z.string(),
  typeName: z.string(),
  venue: z.string(),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date(),
  coords: CoordinatesSchema,
});

const seasonSchema = z.object({
    generationTimestamp: z.coerce.date(),
    season: z.number(),
    teams: z.array(TeamSchema),
    events: z.array(FTCEventSchema),
  })

// Use them in the main Collection
const seasons = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/seasons" }),
  schema: seasonSchema,
});

// Export the Types for use in React/Other files
export type Team = z.infer<typeof TeamSchema>;
export type FTCEvent = z.infer<typeof FTCEventSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type SeasonData = z.infer<typeof seasonSchema>;

export const collections = { seasons };