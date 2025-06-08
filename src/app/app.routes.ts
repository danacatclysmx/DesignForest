import type { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TecnicoComponent } from './tecnico/tecnico.component';
import { JefeComponent } from './jefe/jefe.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tecnico', component: TecnicoComponent },
  { path: 'jefe', component: JefeComponent },
  { path: '**', redirectTo: '/login' }, // Ruta wildcard para manejar rutas no encontradas
];
