import * as React from 'react';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'blockContent',
  title: 'Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 1', value: 'h1' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (Rule) => Rule.required(),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code block',
      type: 'object',
      fields: [
        defineField({
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' },
              { title: 'C#', value: 'csharp' },
              { title: 'Go', value: 'go' },
              { title: 'Rust', value: 'rust' },
              { title: 'Bash', value: 'bash' },
              { title: 'SQL', value: 'sql' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'JSON', value: 'json' },
              { title: 'Plain Text', value: 'plaintext' },
            ],
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 10,
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          language: 'language',
        },
        prepare({ language }) {
          return {
            title: 'Code block',
            subtitle: language || 'plaintext',
          };
        },
      },
    }),
    defineArrayMember({
      name: 'video',
      title: 'Video Embed',
      type: 'object',
      fields: [
        defineField({
          name: 'url',
          title: 'Video URL',
          type: 'url',
          description: 'Supports YouTube, Vimeo, or direct video link (MP4, etc.)',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
      preview: {
        select: {
          url: 'url',
          caption: 'caption',
        },
        prepare({ url, caption }) {
          return {
            title: caption || 'Video Embed',
            subtitle: url || 'No URL specified',
          };
        },
      },
    }),
    defineArrayMember({
      name: 'html',
      title: 'HTML Embed',
      type: 'object',
      icon: () =>
        React.createElement(
          'svg',
          {
            viewBox: '0 0 24 24',
            width: '1em',
            height: '1em',
            stroke: 'currentColor',
            strokeWidth: '2',
            fill: 'none',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          },
          React.createElement('polyline', { points: '16 18 22 12 16 6' }),
          React.createElement('polyline', { points: '8 6 2 12 8 18' })
        ),
      fields: [
        defineField({
          name: 'html',
          title: 'HTML Code',
          type: 'text',
          rows: 10,
          description: 'Raw HTML/JS/CSS code to render directly in the frontend',
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {
          html: 'html',
        },
        prepare({ html }) {
          return {
            title: 'HTML Embed',
            subtitle: html
              ? html.length > 50
                ? html.substring(0, 50) + '...'
                : html
              : 'No HTML code',
          };
        },
      },
    }),
  ],
});