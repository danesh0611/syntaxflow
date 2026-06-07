import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-05-25';

export const isSanityConfigured = Boolean(projectId);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: projectId as string,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

const imageBuilder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export const sanityStudioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333';

export const urlForImage = (source: unknown) => {
  if (!imageBuilder) {
    return null;
  }

  type ImageSource = Parameters<NonNullable<typeof imageBuilder>['image']>[0];
  return imageBuilder.image(source as ImageSource);
};