import { Routes } from '@angular/router';
import { CandidatesComponent } from './candidates/candidates.component';

export const routes: Routes = [
    { path: 'candidates', component: CandidatesComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
  ];