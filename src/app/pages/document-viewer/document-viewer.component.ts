import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, HostListener,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import {DocumentViewerService} from './document-viewer.service';
import {Document, Annotation, Page, PageImage} from '../../domain/document.model';
import {AnnotationsForPagePipe} from '../../pipes/annotations-for-page.pipe';
import {NgClass, NgStyle, PercentPipe} from '@angular/common';
import {AnnotationsService} from './services/annotations.service';
import {ZoomService} from './services/zoom.service';

@Component({
  selector: 'app-document-viewer',
  imports: [AnnotationsForPagePipe, PercentPipe, NgStyle, NgClass],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DocumentViewerService, AnnotationsService, ZoomService],
})
export class DocumentViewerComponent implements OnInit {
  document: Signal<Document | null>;
  pages: Signal<PageImage[] | null>;
  annotations: Signal<Annotation[]>;
  zoomLevel: Signal<number>;
  editing: Signal<boolean>;
  drawing: Signal<boolean>;
  dragging: Signal<boolean>;
  editingAnnotation: Signal<Annotation | null>;

  #documentViewerService =  inject(DocumentViewerService);
  #zoomService =  inject(ZoomService);
  #annotationsService =  inject(AnnotationsService);

  textEditor  = viewChild<ElementRef<HTMLTextAreaElement>>('textEditor');

  constructor(
  ) {
    this.document = this.#documentViewerService.document;
    this.pages = this.#documentViewerService.pages;
    this.zoomLevel = this.#zoomService.zoomLevel;
    this.annotations = this.#annotationsService.annotations;
    this.editing = this.#annotationsService.editing;
    this.drawing = this.#annotationsService.drawing;
    this.dragging = this.#annotationsService.dragging;
    this.editingAnnotation = this.#annotationsService.editingAnnotation;
  }

  ngOnInit() {
    this.#annotationsService.run();
    this.#documentViewerService.run();
  }

  @HostListener('window:keydown.+')
  @HostListener('window:keydown.=')
  increaseZoom(): void {
    this.#zoomService.increaseZoom();
  }

  @HostListener('window:keydown.-')
  decreaseZoom(): void {
    this.#zoomService.decreaseZoom();
  }

  saveDocument(): void {
    this.#saveAnnotations();
    console.table(this.annotations())
  }

  #saveAnnotations(): void {
    const textEditor = this.textEditor();

    if(!textEditor) {
      throw new Error('There must be text editor.');
    }

    this.#annotationsService.saveAnnotations(textEditor.nativeElement.value);
  }

  startDrawing(event: MouseEvent, page: PageImage) {
    this.#annotationsService.startDrawing(event, page);
  }

  onDrawing(event: MouseEvent) {
    this.#annotationsService.onDrawing(event);
  }

  endDrawing() {
    this.#annotationsService.endDrawing();
  }

  startDragging(event: MouseEvent, annotation: Annotation) {
    event.stopPropagation(); // prevent starting a new rect
    this.#annotationsService.startDragging(event, annotation);
  }

  startEditing(annotation: Annotation): void {
    this.#annotationsService.startEditing(annotation);
  }

  removeAnnotation(annotation: Annotation, event: MouseEvent) {
    event.stopPropagation(); // prevent triggering drag/draw
    this.#annotationsService.removeAnnotation(annotation);
  }
}
