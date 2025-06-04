import { Component, type OnInit } from '@angular/core';
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
  nombre: string;
  departamento: string;
  municipio: string;
  estado: string;
  ubicacion?: string;
}

interface Muestra {
  id: string;
  codigo: string;
  conglomerado: string;
  subparcela: string;
  fechaRecoleccion: string;
  azimut: number;
  distancia: number;
  profundidad: number;
  colorSuelo: string;
  pesoFresco: number;
  analisis: string[];
  observaciones: string;
  fechaRegistro: string;
}

interface Ruta {
  id: string;
  codigo: string;
  muestraId?: string;
  conglomerado: string;
  fecha: string;
  estado: number;
  fechaRecoleccion: string;
  fechaEnvio?: string;
  fechaEnRuta?: string;
  fechaEntrega?: string;
}

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tecnico.component.html',
  styleUrls: ['./tecnico.component.css'],
})
export class TecnicoComponent implements OnInit {
  // Estado de la aplicación
  currentSection = 'conglomerados';
  sidebarOpen = false;

  // Datos
  conglomerados: Conglomerado[] = [];
  muestras: Muestra[] = [];
  rutas: Ruta[] = [];
  papelera: any[] = [];

  // Formularios
  muestraForm: FormGroup;
  nuevaRutaForm: FormGroup;
  actualizarEstadoForm: FormGroup;

  // Modales
  modalNuevaRutaOpen = false;
  modalActualizarEstadoOpen = false;
  rutaIdParaActualizar = '';

  // Opciones para selects
  subparcelas = ['SPF1', 'SPN', 'SPE', 'SPS', 'SPO'];
  tiposAnalisis = [
    { value: 'carbono', label: 'Carbono Orgánico' },
    { value: 'densidad', label: 'Densidad Aparente' },
    { value: 'fertilidad', label: 'Fertilidad' },
  ];

  estadosRuta = [
    { value: 0, label: 'Recolectada', class: 'status-recolectada' },
    { value: 1, label: 'Empacada', class: 'status-empacada' },
    { value: 2, label: 'En Ruta', class: 'status-en-ruta' },
    { value: 3, label: 'Entregada', class: 'status-entregada' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.muestraForm = this.fb.group({
      codigo: ['', Validators.required],
      conglomerado: ['', Validators.required],
      subparcela: [''],
      fechaRecoleccion: ['', Validators.required],
      azimut: [
        '',
        [Validators.required, Validators.min(0), Validators.max(360)],
      ],
      distancia: [
        '',
        [Validators.required, Validators.min(0), Validators.max(7)],
      ],
      profundidad: [
        '',
        [Validators.required, Validators.min(0), Validators.max(50)],
      ],
      colorSuelo: [''],
      pesoFresco: ['', [Validators.required, Validators.min(0)]],
      observaciones: [''],
    });

    this.nuevaRutaForm = this.fb.group({
      muestraId: ['', Validators.required],
      fechaEnvio: ['', Validators.required],
    });

    this.actualizarEstadoForm = this.fb.group({
      nuevoEstado: ['', Validators.required],
      fechaActualizacion: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadData();
    this.generateSampleCode();
  }

  // Navegación y UI
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  switchSection(section: string) {
    this.currentSection = section;
    this.closeSidebar();
  }

  // Gestión de datos
  loadData() {
    // Cargar desde localStorage
    const savedConglomerados = localStorage.getItem('conglomerados');
    const savedMuestras = localStorage.getItem('muestras');
    const savedRutas = localStorage.getItem('rutas');
    const savedPapelera = localStorage.getItem('papelera');

    if (savedConglomerados) this.conglomerados = JSON.parse(savedConglomerados);
    if (savedMuestras) this.muestras = JSON.parse(savedMuestras);
    if (savedRutas) this.rutas = JSON.parse(savedRutas);
    if (savedPapelera) this.papelera = JSON.parse(savedPapelera);

    // Datos de ejemplo si no existen
    if (this.conglomerados.length === 0) {
      this.conglomerados = [
        {
          id: 'CONG_32361',
          nombre: 'CONG_32361',
          departamento: 'Meta',
          municipio: 'Cubarral',
          estado: 'aprobado',
          ubicacion: '3.909747, -74.128876',
        },
        {
          id: 'cong2',
          nombre: 'Conglomerado Chocó Sur',
          departamento: 'Chocó',
          municipio: 'Quibdó',
          estado: 'aprobado',
        },
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('conglomerados', JSON.stringify(this.conglomerados));
    localStorage.setItem('muestras', JSON.stringify(this.muestras));
    localStorage.setItem('rutas', JSON.stringify(this.rutas));
    localStorage.setItem('papelera', JSON.stringify(this.papelera));
  }

  // Formulario de muestras
  generateSampleCode() {
    const codigo =
      'MUES_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    this.muestraForm.patchValue({ codigo });
  }

  onSubmitMuestra() {
    if (this.muestraForm.valid) {
      const analisisSeleccionados = this.getSelectedAnalisis();

      const nuevaMuestra: Muestra = {
        id: Date.now().toString(),
        ...this.muestraForm.value,
        analisis: analisisSeleccionados,
        fechaRegistro: new Date().toISOString(),
      };

      this.muestras.push(nuevaMuestra);
      this.saveToLocalStorage();
      this.muestraForm.reset();
      this.generateSampleCode();

      alert('Muestra registrada correctamente');
    }
  }

  getSelectedAnalisis(): string[] {
    const analisis: string[] = [];
    this.tiposAnalisis.forEach((tipo) => {
      const checkbox = document.querySelector(
        `input[value="${tipo.value}"]`
      ) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        analisis.push(tipo.value);
      }
    });
    return analisis;
  }

  // Gestión de rutas
  abrirModalNuevaRuta() {
    this.modalNuevaRutaOpen = true;
    this.nuevaRutaForm.patchValue({
      fechaEnvio: new Date().toISOString().split('T')[0],
    });
  }

  cerrarModalNuevaRuta() {
    this.modalNuevaRutaOpen = false;
    this.nuevaRutaForm.reset();
  }

  onSubmitNuevaRuta() {
    if (this.nuevaRutaForm.valid) {
      const { muestraId, fechaEnvio } = this.nuevaRutaForm.value;
      const muestra = this.muestras.find((m) => m.id === muestraId);
      const conglomerado = this.conglomerados.find(
        (c) => c.id === muestra?.conglomerado
      );

      const nuevaRuta: Ruta = {
        id: Date.now().toString(),
        codigo: muestra?.codigo || '',
        muestraId,
        conglomerado: conglomerado?.nombre || 'Sin conglomerado',
        fecha: fechaEnvio,
        estado: 0,
        fechaRecoleccion: muestra?.fechaRecoleccion || '',
      };

      this.rutas.push(nuevaRuta);
      this.saveToLocalStorage();
      this.cerrarModalNuevaRuta();

      alert('Ruta creada correctamente');
    }
  }

  // Actualizar estado de ruta
  abrirModalActualizarEstado(rutaId: string) {
    this.rutaIdParaActualizar = rutaId;
    this.modalActualizarEstadoOpen = true;

    const ruta = this.rutas.find((r) => r.id === rutaId);
    if (ruta) {
      this.actualizarEstadoForm.patchValue({
        nuevoEstado: ruta.estado,
        fechaActualizacion: new Date().toISOString().split('T')[0],
      });
    }
  }

  cerrarModalActualizarEstado() {
    this.modalActualizarEstadoOpen = false;
    this.actualizarEstadoForm.reset();
    this.rutaIdParaActualizar = '';
  }

  onSubmitActualizarEstado() {
    if (this.actualizarEstadoForm.valid) {
      const { nuevoEstado, fechaActualizacion } =
        this.actualizarEstadoForm.value;
      const ruta = this.rutas.find((r) => r.id === this.rutaIdParaActualizar);

      if (ruta) {
        ruta.estado = Number.parseInt(nuevoEstado);

        // Actualizar fechas según el estado
        switch (ruta.estado) {
          case 1:
            ruta.fechaEnvio = fechaActualizacion;
            break;
          case 2:
            ruta.fechaEnRuta = fechaActualizacion;
            break;
          case 3:
            ruta.fechaEntrega = fechaActualizacion;
            break;
        }

        this.saveToLocalStorage();
        this.cerrarModalActualizarEstado();

        alert('Estado actualizado correctamente');
      }
    }
  }

  // Funciones auxiliares
  getEstadoRuta(estado: number) {
    return this.estadosRuta[estado] || this.estadosRuta[0];
  }

  getFechaEtapa(ruta: Ruta, index: number): string {
    const fechas = [
      ruta.fechaRecoleccion,
      ruta.fechaEnvio,
      ruta.fechaEnRuta,
      ruta.fechaEntrega,
    ];
    return fechas[index] || '';
  }

  getMuestrasDisponibles() {
    return this.muestras.filter(
      (muestra) => !this.rutas.some((ruta) => ruta.muestraId === muestra.id)
    );
  }

  getConglomeradoNombre(id: string): string {
    const conglomerado = this.conglomerados.find((c) => c.id === id);
    return conglomerado?.nombre || id;
  }

  // Acciones
  eliminarMuestra(id: string) {
    if (confirm('¿Estás seguro de eliminar esta muestra?')) {
      const muestra = this.muestras.find((m) => m.id === id);
      if (muestra) {
        this.papelera.push({ ...muestra, tipo: 'muestra' });
        this.muestras = this.muestras.filter((m) => m.id !== id);
        this.saveToLocalStorage();
      }
    }
  }

  eliminarRuta(id: string) {
    if (confirm('¿Estás seguro de eliminar esta ruta?')) {
      const ruta = this.rutas.find((r) => r.id === id);
      if (ruta) {
        this.papelera.push({ ...ruta, tipo: 'ruta' });
        this.rutas = this.rutas.filter((r) => r.id !== id);
        this.saveToLocalStorage();
      }
    }
  }

  restaurarItem(id: string) {
    const item = this.papelera.find((i) => i.id === id);
    if (!item) return;

    if (item.tipo === 'conglomerado') {
      this.conglomerados.push(item);
    } else if (item.tipo === 'muestra') {
      this.muestras.push(item);
    } else if (item.tipo === 'ruta') {
      this.rutas.push(item);
    }

    this.papelera = this.papelera.filter((i) => i.id !== id);
    this.saveToLocalStorage();
  }

  handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
