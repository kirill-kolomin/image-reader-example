import {Routes} from '@angular/router';
import {DocumentViewerComponent} from './pages/document-viewer/document-viewer.component';
import {ResourceNotFound} from './pages/resource-not-found/resource-not-found';

export const routes: Routes = [
  {path: 'documents/:id', component: DocumentViewerComponent},
  {path: '**', component: ResourceNotFound}
];
