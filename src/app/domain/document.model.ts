export interface Document {
  id: string;
  name: string;
  pages: Page[];
}

export interface Page {
  number: number;
  imageUrl: string;
}

export interface PageImage {
  id: number;
  src: string;
}

export interface Annotation {
  id?: string;
  pageId?: number;
  text?: string;
  x?: number;
  y?: number;
  top: number;
  left: number;
  width: number;
  height: number;
}
