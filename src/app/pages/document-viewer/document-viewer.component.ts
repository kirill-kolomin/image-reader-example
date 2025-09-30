import {ChangeDetectionStrategy, Component, inject, OnInit, Signal} from '@angular/core';
import {DocumentViewerService} from './document-viewer.service';
import {Document, Annotation} from '../../models/document.model';
import {AnnotationComponent} from '../../components/annotation/annotation.component';
import {AnnotationsForPagePipe} from '../../pipes/annotations-for-page.pipe';
import {AsyncPipe, PercentPipe} from '@angular/common';
import {AnnotationsService} from './services/annotations.service';
import {ZoomService} from './services/zoom.service';

@Component({
  selector: 'app-document-viewer',
  imports: [AnnotationComponent, AnnotationsForPagePipe, AsyncPipe, PercentPipe],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DocumentViewerService, AnnotationsService, ZoomService],
})
export class DocumentViewerComponent implements OnInit {
  document: Signal<Document | null>;
  pages: Signal<string[] | null>;
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
    this.#documentViewerService.saveDocument();
  }

  addAnnotation(event: MouseEvent, page: Page): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const text = prompt('Enter annotation text:');
    if (text) {
      this.#annotationsService.addAnnotation({
        pageId: page.number,
        text,
        x,
        y
      });
    }
  }
}
