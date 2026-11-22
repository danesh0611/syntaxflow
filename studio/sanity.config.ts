import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'uxe5yl0p';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'SyntaxFlow CMS',
  projectId,
  dataset,
  basePath: '/studio',
  studioHost: 'articles1234',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});