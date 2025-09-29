import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {Document} from '../models/document.model';
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
}
