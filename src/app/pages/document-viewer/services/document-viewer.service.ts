import {DestroyRef, inject, Injectable, Signal, signal} from '@angular/core';
import {combineLatest, filter, map, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {DocumentWithAnnotations, Page, Document} from '../../../models/document.model';
import {ApiFacadeService} from '../../../services/api-facade.service';
import {DOCUMENT_ID} from '../../../models/route-params';

@Injectable()
export class DocumentViewerService {
  document: Signal<DocumentWithAnnotations | null>;
  pages: Signal<string[] | null>;

  #route = inject(ActivatedRoute);
  #apiFacadeService = inject(ApiFacadeService);
  #destroyRef = inject(DestroyRef);
  #document = signal<Document | null>(null);
  #document$ = toObservable(this.#document);
  #pages = signal<string[] | null>(null);

  constructor() {
    // @ts-ignore
    this.document = this.#document.asReadonly();
    this.pages = this.#pages.asReadonly();
  }

  run() {
    this.#getDocument();
    this.#trackDocumentAndGetPages();
  }

  saveDocument(): DocumentWithAnnotations | null {
    const document = this.document();

    if (document) {
      return document;
    }

    return null;
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
          const pageRequests = document.pages.map(({imageUrl}) => this.#apiFacadeService.getPage(imageUrl));
          return combineLatest(pageRequests)
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((pages) => {
        this.#pages.set(pages);
      })
  }
}
