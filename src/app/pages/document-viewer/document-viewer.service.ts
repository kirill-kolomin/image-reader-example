import {DestroyRef, inject, Injectable, Signal, signal} from '@angular/core';
import {combineLatest, filter, map, of, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {Document, PageImage} from '../../models/document.model';
import {ApiFacadeService} from '../../services/api-facade.service';
import {DOCUMENT_ID} from '../../models/route-params';
import {AnnotationsService} from "./services/annotations.service";

@Injectable()
export class DocumentViewerService {
  document: Signal<Document | null>;
  pages: Signal<PageImage[] | null>;

  #route = inject(ActivatedRoute);
  #apiFacadeService = inject(ApiFacadeService);
  #annotationsService = inject(AnnotationsService);
  #destroyRef = inject(DestroyRef);

  #document = signal<Document | null>(null);
  #document$ = toObservable(this.#document);
  #pages = signal<PageImage[] | null>(null);

  constructor() {
    // @ts-ignore
    this.document = this.#document.asReadonly();
    this.pages = this.#pages.asReadonly();
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
      // @ts-ignore
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
}
