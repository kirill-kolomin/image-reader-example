import { Pipe, PipeTransform } from '@angular/core';
import { Annotation } from '../domain/document.model';

@Pipe({
  name: 'annotationsForPage',
  standalone: true,
})
export class AnnotationsForPagePipe implements PipeTransform {
  transform(annotations: Annotation[], pageId: number): Annotation[] {
    if (!annotations || !pageId) {
      return [];
    }
    return annotations.filter(annotation => annotation.pageId === pageId);
  }
}
