import {DestroyRef, effect, inject, Injectable, Signal, signal} from '@angular/core';
import {combineLatest, filter, map, of, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {Document, PageImage} from '../../domain/document.model';
import {ApiFacadeService} from '../../services/api-facade.service';
import {DOCUMENT_ID} from '../../domain/route-params';
import {AnnotationsService} from "./services/annotations.service";
import {ZoomService} from './services/zoom.service';

@Injectable()
export class DocumentViewerService {
  document: Signal<Document | null>;
  pages: Signal<PageImage[] | null>;

  #route = inject(ActivatedRoute);
  #apiFacadeService = inject(ApiFacadeService);
  #annotationsService = inject(AnnotationsService);
  #zoomService = inject(ZoomService);
  #destroyRef = inject(DestroyRef);

  #document = signal<Document | null>(null);
  #document$ = toObservable(this.#document);
  #pages = signal<PageImage[] | null>(null);

  constructor() {
    this.document = this.#document.asReadonly();
    this.pages = this.#pages.asReadonly();

    this.#trackZoomAndSetToAnnotations();
  }

  run() {
    this.#getDocument();
    this.#trackDocumentAndGetPages();
    this.#trackDocumentAndGetAnnotations();
  }

  #getDocument(): void {
    this.#route.paramMap.pipe(
      map((params) => params.get(DOCUMENT_ID)),
      filter(Boolean),
      switchMap((id) => this.#apiFacadeService.getDocument(id)),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe((document) => {
      this.#document.set(document);
    });
  }

  #trackDocumentAndGetPages(): void {
    this.#document$
      .pipe(
        filter(Boolean),
        switchMap((document) => {
          const pageRequests = document.pages.map(({imageUrl, number}) => combineLatest([of(number), this.#apiFacadeService.getPage(imageUrl)]));
          return combineLatest(pageRequests)
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((pages) => {
        this.#pages.set(pages.map(([id, src]) => ({id, src})));
      })
  }

  #trackDocumentAndGetAnnotations(): void {
    this.#document$
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((document) => {
        this.#annotationsService.setDocumentName(document.name);
      })
  }

  #trackZoomAndSetToAnnotations(): void {
    effect(() => {
      const zoomLevel = this.#zoomService.zoomLevel();
      this.#annotationsService.setZoom(zoomLevel);
    })
  }
}
