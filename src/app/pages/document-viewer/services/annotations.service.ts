import {DestroyRef, inject, Injectable, Signal, signal} from '@angular/core';
import {Annotation} from '../../../models/document.model';
import {filter, switchMap} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {ApiFacadeService} from '../../../services/api-facade.service';

@Injectable()
export class AnnotationsService {
  annotations: Signal<Annotation[] | null>;

  #apiFacadeService = inject(ApiFacadeService);
  #destroyRef = inject(DestroyRef);

  #annotations = signal<Annotation[] | null>(null);
  #documentName = signal<string | null>(null);

  #documentName$ = toObservable(this.#documentName);

  constructor() {
    this.annotations = this.#annotations.asReadonly();
  }

  setDocumentName(documentName: string): void {
    this.#documentName.set(documentName);
  }

  addAnnotation(annotation: Omit<Annotation, 'id'>): void {
    const currentAnnotations = this.#annotations();

    if(!currentAnnotations) {
      return;
    }

    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
    };

    const updatedAnnotations = [...currentAnnotations, newAnnotation];
    this.#annotations.set(updatedAnnotations);
  }

  updateAnnotation(annotation: Annotation): void {
    const currentAnnotations = this.#annotations();

    if(!currentAnnotations) {
      return;
    }

    const updatedAnnotations = currentAnnotations.map(a =>
      a.id === annotation.id ? annotation : a
    );

    this.#annotations.set(updatedAnnotations);
  }

  deleteAnnotation(id: string): void {
    const currentAnnotations = this.#annotations();

    if(!currentAnnotations) {
      return;
    }

    const updatedAnnotations = currentAnnotations.filter(a => a.id !== id);

    this.#annotations.set(updatedAnnotations);
  }

  #trackDocumentAndGetAnnotations(): void {
    this.#documentName$
      .pipe(
        filter(Boolean),
        switchMap((documentName) => this.#apiFacadeService.getDocumentAnnotations(documentName)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((annotations) => {
        this.#annotations.set(annotations);
      })
  }
}
