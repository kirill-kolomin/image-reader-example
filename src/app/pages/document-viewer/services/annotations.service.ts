import { Injectable } from '@angular/core';
import {Annotation, Page} from '../../../models/document.model';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class AnnotationsService {
  private annotationsSubject = new BehaviorSubject<Annotation[]>([]);

  addAnnotation(annotation: Omit<Annotation, 'id'>): void {
    const currentAnnotations = this.annotationsSubject.value;
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
    };

    const updatedAnnotations = [...currentAnnotations, newAnnotation];
    this.annotationsSubject.next(updatedAnnotations);

    this.#updateDocumentWithAnnotations(updatedAnnotations);
  }

  updateAnnotation(annotation: Annotation): void {
    const currentAnnotations = this.annotationsSubject.value;
    const updatedAnnotations = currentAnnotations.map(a =>
      a.id === annotation.id ? annotation : a
    );

    this.annotationsSubject.next(updatedAnnotations);
    this.#updateDocumentWithAnnotations(updatedAnnotations);
  }

  deleteAnnotation(id: string): void {
    const currentAnnotations = this.annotationsSubject.value;
    const updatedAnnotations = currentAnnotations.filter(a => a.id !== id);

    this.annotationsSubject.next(updatedAnnotations);
    this.#updateDocumentWithAnnotations(updatedAnnotations);
  }

  #updateDocumentWithAnnotations(annotations: Annotation[]): void {
    // const currentDocument = this.documentSubject.value;
    // if (currentDocument) {
    //   this.documentSubject.next({
    //     ...currentDocument,
    //     annotations
    //   });
    // }
  }
}
