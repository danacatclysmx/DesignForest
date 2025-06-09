import { Component, Input } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-conglomerado-card',
  templateUrl: './conglomerado-card.component.html',
  styleUrls: ['./conglomerado-card.component.css'],
  standalone: true,
  imports: [UpperCasePipe],
  providers: [DatePipe, UpperCasePipe]
})
export class ConglomeradoCardComponent {
  @Input() conglomerado: any;


  // Simular funciones básicas
  toggleOptionsMenu(event: Event): void {
    event.stopPropagation();
    // Implementar lógica real con ViewChild o servicio
  }

  editConglomerado(): void {
    alert('Editar no implementado aún');
  }

  deleteConglomerado(): void {
    // Llamar a servicio o evento
  }

  showDetails(): void {
    // Navegar a detalles usando router o servicio
  }

  constructor(
    private datePipe: DatePipe,
    private upperCasePipe: UpperCasePipe
  ) {}

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'mediumDate') || '';
  }

  toUpperCase(text: string): string {
    return this.upperCasePipe.transform(text);
  }
}