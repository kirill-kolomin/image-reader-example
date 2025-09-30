import {Routes} from '@angular/router';
import {DocumentViewerComponent} from './pages/document-viewer/document-viewer.component';
import {ResourceNotFound} from './pages/resource-not-found/resource-not-found';
import {DOCUMENT_ID} from './domain/route-params';

export const routes: Routes = [
  {path: `documents/:${DOCUMENT_ID}`, component: DocumentViewerComponent},
  {path: '**', component: ResourceNotFound}
];
