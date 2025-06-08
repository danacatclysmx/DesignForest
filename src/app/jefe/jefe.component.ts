import {
  Component,
  ViewChild,
  type AfterViewInit,
  type ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

interface Conglomerado {
  id: string;
  departamento: string;
  municipio: string;
  corregimiento?: string;
  coordenadas_centro: string;
  fecha_inicio: string;
  fecha_finalizacion: string;
  estado: 'pendientes' | 'aprobados' | 'rechazados';
  precision_gps?: string;
  punto_referencia?: {
    tipo: string;
    azimut: string;
    distancia: string;
  };
}

@Component({
  selector: 'app-jefe',
  templateUrl: './jefe.component.html',
  styleUrls: ['./jefe.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class JefeComponent implements AfterViewInit {
  @ViewChild('modalCrear') modalCrear!: ElementRef;

  conglomerados: Conglomerado[] = [
    {
      id: 'CONG_10001',
      departamento: 'Cundinamarca',
      municipio: 'Bogotá',
      corregimiento: 'Centro',
      coordenadas_centro: '04°32\'15.67"N 74°12\'45.89"W',
      fecha_inicio: '2024-01-01',
      fecha_finalizacion: '2024-12-31',
      estado: 'pendientes',
      precision_gps: '±0.35 m',
      punto_referencia: {
        tipo: 'Árbol destacado',
        azimut: '45°',
        distancia: '15 m',
      },
    },
    {
      id: 'CONG_10002',
      departamento: 'Antioquia',
      municipio: 'Medellín',
      corregimiento: 'San Antonio de Prado',
      coordenadas_centro: '06°15\'30.12"N 75°36\'20.45"W',
      fecha_inicio: '2024-02-01',
      fecha_finalizacion: '2024-11-30',
      estado: 'aprobados',
      precision_gps: '±0.28 m',
      punto_referencia: {
        tipo: 'Roca grande',
        azimut: '120°',
        distancia: '8 m',
      },
    },
  ];

  currentFilter = 'pendientes';
  conglomeradoForm: FormGroup;
  modalCrearOpen = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.conglomeradoForm = this.fb.group({
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      corregimiento: [''],
      coordenadas: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      precision: ['', Validators.required],
      puntoTipo: [''],
      puntoAzimut: [''],
      puntoDistancia: [''],
    });
  }

  ngAfterViewInit(): void {
    // Lógica de inicialización del DOM si es necesaria
  }

  get conglomeradosFiltrados(): Conglomerado[] {
    return this.conglomerados.filter(
      (cong) => cong.estado === this.currentFilter
    );
  }

  filterConglomerados(status: string): void {
    this.currentFilter = status;
  }

  abrirCrear(): void {
    this.modalCrearOpen = true;
  }

  cerrarModalCrear(): void {
    this.modalCrearOpen = false;
    this.conglomeradoForm.reset();
  }

  onSubmitConglomerado(): void {
    if (this.conglomeradoForm.valid) {
      const formData = this.conglomeradoForm.value;
      const nuevoConglomerado: Conglomerado = {
        id: `CONG_${Date.now()}`,
        departamento: formData.departamento,
        municipio: formData.municipio,
        corregimiento: formData.corregimiento,
        coordenadas_centro: formData.coordenadas,
        fecha_inicio: formData.fechaInicio,
        fecha_finalizacion: formData.fechaFin,
        estado: 'pendientes',
        precision_gps: formData.precision,
        punto_referencia: {
          tipo: formData.puntoTipo,
          azimut: formData.puntoAzimut,
          distancia: formData.puntoDistancia,
        },
      };

      this.conglomerados.push(nuevoConglomerado);
      this.cerrarModalCrear();
      alert('Conglomerado creado exitosamente');
    }
  }

  aprobarConglomerado(id: string): void {
    const conglomerado = this.conglomerados.find((c) => c.id === id);
    if (conglomerado) {
      conglomerado.estado = 'aprobados';
      alert(`Conglomerado ${id} aprobado`);
    }
  }

  rechazarConglomerado(id: string): void {
    const conglomerado = this.conglomerados.find((c) => c.id === id);
    if (conglomerado) {
      conglomerado.estado = 'rechazados';
      alert(`Conglomerado ${id} rechazado`);
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
