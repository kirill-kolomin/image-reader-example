import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, of, switchMap, throwError} from 'rxjs';
import {Annotation, Document} from '../domain/document.model';
import mock from '../../mocks/1.json';

@Injectable({
  providedIn: 'root'
})
export class ApiFacadeService {
  #httpClient = inject(HttpClient);

  // TODO: Decorate for showing error toasts
  getDocument(documentId: string): Observable<Document> {
    return this.#httpClient.get<Document>(`/pages/${documentId}.json`)
      .pipe(
        catchError(() => {
          return of({id: crypto.randomUUID(), ...mock})
        })
      );
  }

  // TODO: Decorate for showing error toasts
  getPage(pageUrl: string): Observable<string> {
    return this.#httpClient.get(`${pageUrl}`, {observe: 'response', responseType: 'blob'})
      .pipe(
        switchMap(response => {
          if (!response.body) {
            return throwError(() => new Error('No content'));
          }

          const objectURL = URL.createObjectURL(response.body);

          return of(objectURL)
        })
      )
  }

  // TODO: fetch annotations from server or other storage
  getDocumentAnnotations(documentName: string): Observable<Annotation[]> {
    return of([]);
  }
}
