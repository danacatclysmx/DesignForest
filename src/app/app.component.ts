import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Importa el LoginComponent
import { JefeComponent } from './jefe/jefe.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JefeComponent],
  template: `<app-jefe></app-jefe>`
})
export class AppComponent {
  title = 'desig-Forest';
}