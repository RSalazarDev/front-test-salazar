import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CandidatesComponent } from './candidates/candidates.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CandidatesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-test-salazar';
}
