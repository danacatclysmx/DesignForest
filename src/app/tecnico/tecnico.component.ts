import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-tecnico',
  imports: [CommonModule],
  templateUrl: './tecnico.component.html',
  styleUrls: ['./tecnico.component.css']
})

export class TecnicoComponent {
  currentSection = signal<'conglomerados' | 'muestras'>('conglomerados');

  get title() {
    return this.currentSection() === 'muestras'
      ? 'MUESTRAS'
      : 'CONGLOMERADOS';
  }
}
