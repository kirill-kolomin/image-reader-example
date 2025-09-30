import {DestroyRef, inject, Injectable, Signal, signal} from '@angular/core';
import {Annotation, PageImage} from '../../../domain/document.model';
import {ApiFacadeService} from '../../../services/api-facade.service';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {filter, switchMap} from 'rxjs';

@Injectable()
export class AnnotationsService {
  annotations: Signal<Annotation[]>;
  editingAnnotation: Signal<Annotation | null>;
  editing: Signal<boolean>;
  drawing: Signal<boolean>;
  dragging: Signal<boolean>;

  #apiFacadeService = inject(ApiFacadeService);
  #destroyRef = inject(DestroyRef);

  #annotations = signal<Annotation[]>([]);
  #editingAnnotation = signal<Annotation | null>(null);
  #editing = signal(false);
  #drawing = signal(false);
  #dragging = signal(false);
  #documentName = signal<string | null>(null);

  #documentName$ = toObservable(this.#documentName);

  #startX = 0;
  #startY = 0;
  #offsetX = 0;
  #offsetY = 0;
  #draggingAnnotation: Annotation | null = null;

  constructor() {
    this.annotations = this.#annotations.asReadonly();
    this.editingAnnotation = this.#editingAnnotation.asReadonly();
    this.editing = this.#editing.asReadonly();
    this.drawing = this.#drawing.asReadonly();
    this.dragging = this.#dragging.asReadonly();
  }

  run(): void {
    this.#trackDocumentAndGetAnnotations();
  }

  setDocumentName(documentName: string): void {
    this.#documentName.set(documentName);
  }

  saveAnnotations(text: string): void {
    const editingAnnotation = this.#editingAnnotation();

    if(!editingAnnotation) {
      throw new Error('There must be annotation for editing.');
    }

    editingAnnotation.text = text;
    this.stopEditing();
  }

  startDrawing(event: MouseEvent, page: PageImage) {
    this.#drawing.set(true);
    this.#editing.set(true);

    const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
    const bounds = container.getBoundingClientRect();
    this.#startX = event.clientX - bounds.left;
    this.#startY = event.clientY - bounds.top;

    const annotation = { pageId: page.id, top: this.#startY, left: this.#startX, width: 0, height: 0 };
    const annotations=  this.#annotations();
    this.#annotations.set([...annotations, annotation]);

    this.startEditing(annotation);
  }

  onDrawing(event: MouseEvent) {
    if (this.#drawing()) {
      const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
      const bounds = container.getBoundingClientRect();
      const currentX = event.clientX - bounds.left;
      const currentY = event.clientY - bounds.top;

      const annotations  = this.#annotations();
      const rect = annotations[annotations.length - 1];
      rect.width = Math.abs(currentX - this.#startX);
      rect.height = Math.abs(currentY - this.#startY);
      rect.left = Math.min(this.#startX, currentX);
      rect.top = Math.min(this.#startY, currentY);
    }

    if (this.#dragging() && this.#draggingAnnotation !== null) {
      const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
      const bounds = container.getBoundingClientRect();
      const currentX = event.clientX - bounds.left;
      const currentY = event.clientY - bounds.top;

      let newLeft = currentX - this.#offsetX;
      let newTop = currentY - this.#offsetY;

      // Clamp so rectangle stays inside container
      newLeft = Math.max(0, Math.min(newLeft, bounds.width - this.#draggingAnnotation.width));
      newTop = Math.max(0, Math.min(newTop, bounds.height - this.#draggingAnnotation.height));

      this.#draggingAnnotation.left = newLeft;
      this.#draggingAnnotation.top = newTop;
    }
  }

  endDrawing() {
    this.#drawing.set(false);
    this.#dragging.set(false);
    this.#draggingAnnotation = null;
  }

  startDragging(event: MouseEvent, rect: Annotation) {
    event.stopPropagation(); // prevent starting a new rect

    this.#dragging.set(true);
    this.#draggingAnnotation = rect;

    const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
    const bounds = container.getBoundingClientRect();

    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;

    this.#offsetX = mouseX - rect.left;
    this.#offsetY = mouseY - rect.top;
  }

  startEditing(annotation: Annotation): void {
    this.#editing.set(true);
    this.#editingAnnotation.set(annotation);
  }

  stopEditing() {
    this.#editing.set(false);
    this.#editingAnnotation.set(null);
  }

  removeAnnotation(_annotation: Annotation) {
    const annotations = [...this.#annotations()];
    const index = annotations.findIndex(annotation => annotation === _annotation);
    annotations.splice(index, 1);

    this.#annotations.set(annotations)
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
