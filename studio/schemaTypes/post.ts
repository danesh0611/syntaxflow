import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentType',
      title: 'Content Format',
      type: 'string',
      initialValue: 'richText',
      options: {
        list: [
          { title: 'Standard Article (Sanity Rich Text / Blocks)', value: 'richText' },
          { title: 'Custom HTML / HTML Document Code', value: 'html' },
        ],
        layout: 'radio',
      },
      description: 'Choose whether you want to write using the visual block editor or paste custom/exported HTML directly.',
    }),
    defineField({
      name: 'htmlContent',
      title: 'HTML Markup / Code',
      type: 'text',
      rows: 25,
      description: 'Paste your raw HTML code here. It will be rendered directly on the article page.',
      hidden: ({ document }) => document?.contentType !== 'html',
    }),
    defineField({
      name: 'body',
      title: 'Body (Rich Text)',
      type: 'blockContent',
      hidden: ({ document }) => document?.contentType === 'html',
      validation: (Rule) =>
        Rule.custom((field, context) => {
          if ((context.document as any)?.contentType === 'html') {
            return true;
          }
          return field ? true : 'Body content is required for standard articles';
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Chakradhar',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'text',
      rows: 5,
      description: 'Enter SEO keywords (one per line, or separated by commas).',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'mainImage',
    },
  },
});