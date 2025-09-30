export interface Document {
  id: string;
  name: string;
  pages: Page[];
}

export interface Page {
  number: number;
  imageUrl: string;
}

export interface Annotation {
  id: string;
  pageId: number;
  text: string;
  x: number;
  y: number;
}

export interface DocumentWithAnnotations extends Document {
  annotations: Annotation[];
}
