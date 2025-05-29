import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ConglomeradoCardComponent } from './conglomerado-card/conglomerado-card.component';
import { ConglomeradoService } from '../jefe/services/conglomerado.service';
import { MapaModalComponent } from './mapa-modal/mapa-modal.component';

@Component({
  selector: 'app-jefe',
  templateUrl: './jefe.component.html',
  styleUrls: ['./jefe.component.css'],
  standalone: true,
  imports: [
    ConglomeradoCardComponent,
    MapaModalComponent
  ]
})
export class JefeComponent {

  @ViewChild('modalCrear') modalCrear: any;

  conglomerados = [
    {
      id: 'CONG_10001',
      departamento: 'Cundinamarca',
      municipio: 'Bogotá',
      corregimiento: '',
      coordenadas_centro: '04°32\'15.67"N 74°12\'45.89"W',
      fecha_inicio: '2024-01-01',
      fecha_finalizacion: '2024-12-31',
      estado: 'pendientes'
    },
    // Agrega más datos de prueba si quieres
  ];

  constructor(private conglomeradoService: ConglomeradoService) {}

  ngOnInit(): void {
    this.conglomerados = this.conglomeradoService.getConglomerados();
  }

  ngAfterViewInit(): void {
    // Aquí va cualquier lógica que necesite acceso al DOM
  }

  abrirCrear(): void {
    if (this.modalCrear && this.modalCrear.nativeElement) {
      this.modalCrear.nativeElement.classList.add('open');
    }
  }
}