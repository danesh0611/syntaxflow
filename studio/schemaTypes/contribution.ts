import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contribution',
  title: 'Contributor Submissions',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      description: 'The title submitted by the contributor.',
    }),
    defineField({
      name: 'authorName',
      title: 'Contributor Name',
      type: 'string',
    }),
    defineField({
      name: 'authorEmail',
      title: 'Contributor Email',
      type: 'string',
    }),
    defineField({
      name: 'authorPhoto',
      title: 'Author Photo URL / Data',
      type: 'text',
      rows: 2,
      description: 'Profile photo to feature the author on the website.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio / Tagline',
      type: 'string',
    }),
    defineField({
      name: 'socialLink',
      title: 'LinkedIn / GitHub Profile',
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Category / Domain',
      type: 'string',
    }),
    defineField({
      name: 'summary',
      title: 'Article Summary / Key Takeaways',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'documentContent',
      title: 'Article Draft Content (Copy & Paste from here)',
      type: 'text',
      rows: 30,
      description: 'The full markdown / draft content submitted by the contributor. You can copy-paste this into a Post to publish.',
    }),
    defineField({
      name: 'fileName',
      title: 'Uploaded File Name',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Review Status',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Pending Review', value: 'pending' },
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Published to Site', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'submissionId',
      title: 'Tracking ID',
      type: 'string',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'authorName',
      category: 'category',
      status: 'status',
    },
    prepare({ title, author, category, status }) {
      return {
        title: title || 'Untitled Submission',
        subtitle: `${author || 'Unknown'} • ${category || 'General'} [${status || 'pending'}]`,
      };
    },
  },
});
