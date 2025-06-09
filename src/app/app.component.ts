import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet],
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  
})

export class AppComponent {
  title = 'forest-track';
}
