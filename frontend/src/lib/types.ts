export interface PortableTextSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

export interface PortableTextBlock {
  _key: string;
  _type: 'block';
  style?: string;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  listItem?: string;
  level?: number;
}

export interface PortableTextImage {
  _key: string;
  _type: 'image';
  asset?: {
    _ref?: string;
  };
  alt?: string;
  caption?: string;
}

export interface PortableTextCodeBlock {
  _key: string;
  _type: 'codeBlock';
  language?: string;
  code?: string;
}

export interface PortableTextVideo {
  _key: string;
  _type: 'video';
  url?: string;
  caption?: string;
}

export interface PortableTextHtml {
  _key: string;
  _type: 'html';
  html?: string;
}

export type ArticleContent = string | Array<
  | PortableTextBlock
  | PortableTextImage
  | PortableTextCodeBlock
  | PortableTextVideo
  | PortableTextHtml
>;

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ArticleContent;
  category: string;
  author: string;
  coverImage: string;
  tags: string[];
  keywords: string[];
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}
