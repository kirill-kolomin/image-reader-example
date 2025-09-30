import {ChangeDetectionStrategy, Component, inject, OnInit, signal, Signal} from '@angular/core';
import {DocumentViewerService} from './document-viewer.service';
import {Document, Annotation, Page, PageImage} from '../../models/document.model';
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
  annotations = signal<Annotation[]>([]);
  zoomLevel: Signal<number>;

  #documentViewerService =  inject(DocumentViewerService);
  #zoomService =  inject(ZoomService);
  #annotationsService =  inject(AnnotationsService);

  constructor(
  ) {
    this.document = this.#documentViewerService.document;
    this.pages = this.#documentViewerService.pages;
    this.zoomLevel = this.#zoomService.zoomLevel;
  }

  ngOnInit() {
    this.#documentViewerService.run();
  }

  increaseZoom(): void {
    this.#zoomService.increaseZoom();
  }

  decreaseZoom(): void {
    this.#zoomService.decreaseZoom();
  }

  saveDocument(): void {
    this.#saveAnnotations();
  }

  #saveAnnotations(): void {
  }

  drawing = false;
  dragging = false;
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private draggingRect: Annotation | null = null;

  startDrawing(event: MouseEvent, page: PageImage) {
    this.drawing = true;
    const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
    const bounds = container.getBoundingClientRect();
    this.startX = event.clientX - bounds.left;
    this.startY = event.clientY - bounds.top;

    this.annotations.set([...this.annotations(),{ pageId: page.id, top: this.startY, left: this.startX, width: 0, height: 0 }]);
  }

  onDrawing(event: MouseEvent) {
    if (this.drawing) {
      const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
      const bounds = container.getBoundingClientRect();
      const currentX = event.clientX - bounds.left;
      const currentY = event.clientY - bounds.top;

      const rect = this.annotations()[this.annotations().length - 1];
      rect.width = Math.abs(currentX - this.startX);
      rect.height = Math.abs(currentY - this.startY);
      rect.left = Math.min(this.startX, currentX);
      rect.top = Math.min(this.startY, currentY);
    }

    if (this.dragging && this.draggingRect !== null) {
      const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
      const bounds = container.getBoundingClientRect();
      const currentX = event.clientX - bounds.left;
      const currentY = event.clientY - bounds.top;

      const rect = this.draggingRect;
      rect.left = currentX - this.offsetX;
      rect.top = currentY - this.offsetY;
    }
  }

  endDrawing() {
    this.drawing = false;
    this.dragging = false;
    this.draggingRect = null;
  }

  startDragging(event: MouseEvent, rect: Annotation) {
    event.stopPropagation(); // prevent starting a new rect

    this.dragging = true;
    this.draggingRect = rect;

    const container = (event.target as HTMLElement).closest('.page-container') as HTMLElement;
    const bounds = container.getBoundingClientRect();

    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;

    this.offsetX = mouseX - rect.left;
    this.offsetY = mouseY - rect.top;
  }
}
