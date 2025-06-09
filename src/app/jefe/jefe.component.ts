import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Add this
import { Router } from '@angular/router';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Conglomerado {
  id: string;
  coordenadas_centro: string;
  departamento: string;
  municipio: string;
  corregimiento?: string;
  fecha_inicio: string | null; // Make nullable
  fecha_finalizacion: string | null; // Make nullable
  aprobado_por?: string;
  precision: string;
  fecha_aprobacion?: string;
  estado: 'pendientes' | 'aprobados' | 'rechazados' | 'eliminado';
  punto_referencia?: {
    tipo?: string;
    azimut?: string;
    distancia_horizontal?: string;
  };
  subparcelas: any[];
}

@Component({
  selector: 'app-jefe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Add this
  templateUrl: './jefe.component.html',
  styleUrls: ['./jefe.component.css']
})

export class JefeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainerCrear') mapContainerCrear!: ElementRef;
  @ViewChild('mapElement') mapElement!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  menuOpen = false;
  currentSection: 'conglomerados' | 'papelera' = 'conglomerados';
  currentFilter = 'pendientes';
  modalCrearOpen = false;
  modalEditarOpen = false;
  modalDetallesOpen = false;
  showMenuId: string | null = null;
  areaCalculatorOpen = false;

  conglomerados: Conglomerado[] = [];
  papelera: Conglomerado[] = [];
  conglomeradosFiltrados: Conglomerado[] = [];
  selectedConglomerado: Conglomerado | null = null;
  editingConglomerado: Conglomerado | null = null;
  
  selectedCoordinates = '';
  locationData: any = {};
  
  createMap: any;
  createMarker: any;
  detailsMap: any;
  containerCircle: any;
  circles: any[] = [];
  
  areaDrawingMode = false;
  areaPoints: any[] = [];
  areaMarkers: any[] = [];
  areaLines: any[] = [];
  areaPolygon: any;
  coordinateList: any[] = [];

  conglomeradoForm: FormGroup;
  editarForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.conglomeradoForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      precision: ['', Validators.required],
      puntoTipo: [''],
      puntoAzimut: [''],
      puntoDistancia: ['']
    });

    this.editarForm = this.fb.group({
      id: [''],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      precision: ['', Validators.required],
      puntoTipo: [''],
      puntoAzimut: [''],
      puntoDistancia: ['']
    });

    this.loadData();
  }

  ngAfterViewInit() {
    this.initCreateMap();
  }

  ngOnDestroy() {
    if (this.createMap) this.createMap.remove();
    if (this.detailsMap) this.detailsMap.remove();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  setCurrentSection(section: 'conglomerados' | 'papelera') {
    this.currentSection = section;
    this.filterConglomerados(this.currentFilter);
  }

  abrirCrear() {
    this.modalCrearOpen = true;
    this.menuOpen = false;
    setTimeout(() => {
      this.initCreateMap();
      this.locationData = {};
      this.selectedCoordinates = '';
    }, 300);
  }

  cerrarModalCrear() {
    this.modalCrearOpen = false;
    if (this.createMap) {
      this.createMap.remove();
      this.createMap = null;
    }
  }

  abrirEditar() {
    this.modalEditarOpen = true;
  }

  cerrarModalEditar() {
    this.modalEditarOpen = false;
  }

  closeDetailsModal() {
    this.modalDetallesOpen = false;
    this.areaCalculatorOpen = false;
    if (this.detailsMap) {
      this.detailsMap.remove();
      this.detailsMap = null;
    }
    this.clearAreaDrawing();
  }

  toggleOptionsMenu(event: Event, id: string) {
    event.stopPropagation();
    this.showMenuId = this.showMenuId === id ? null : id;
  }

  initCreateMap() {
    if (this.createMap) {
      this.createMap.remove();
    }
    
    this.createMap = L.map(this.mapContainerCrear.nativeElement, {
      preferCanvas: true,
      zoomControl: true,
      renderer: L.canvas()
    }).setView([4.570868, -74.297333], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.createMap);

    this.createMap.on('click', (e: any) => {
      if (this.createMarker) {
        this.createMap.removeLayer(this.createMarker);
      }
      
      this.createMarker = L.marker(e.latlng).addTo(this.createMap);
      const coords = e.latlng;
      this.selectedCoordinates = `Coordenadas seleccionadas: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
      
      this.reverseGeocode(coords);
    });
    
    setTimeout(() => this.createMap.invalidateSize(true), 100);
  }

  reverseGeocode(latlng: any) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.address) {
          this.locationData = {
            departamento: data.address.state || '',
            municipio: data.address.city || data.address.town || data.address.village || '',
            corregimiento: data.address.suburb || data.address.county || ''
          };
        }
      })
      .catch(error => {
        console.error('Error en geocodificación inversa:', error);
        this.selectedCoordinates += ' (Error obteniendo datos de ubicación)';
      });
  }

  onSubmitConglomerado() {
    if (!this.createMarker) {
      alert('Por favor seleccione una ubicación en el mapa');
      return;
    }

    if (this.conglomeradoForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const formData = this.conglomeradoForm.value;
    const coords = this.createMarker.getLatLng();
    
    const nuevoConglomerado: Conglomerado = {
      id: 'CONG_' + Math.floor(10000 + Math.random() * 90000),
      coordenadas_centro: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      departamento: this.locationData.departamento || 'No identificado',
      municipio: this.locationData.municipio || 'No identificado',
      corregimiento: this.locationData.corregimiento || '',
      fecha_inicio: formData.fechaInicio || new Date().toISOString().split('T')[0],
      fecha_finalizacion: formData.fechaFin || new Date().toISOString().split('T')[0],
      aprobado_por: "",
      precision: formData.precision,
      fecha_aprobacion: "",
      estado: "pendientes",
      punto_referencia: {
        tipo: formData.puntoTipo,
        azimut: formData.puntoAzimut,
        distancia_horizontal: formData.puntoDistancia
      },
      subparcelas: [
        { id: "SPF1", radio: "40 m", azimut: "0°", distancia_centro: "0 m", materializado: "Sí", color: "Rojo", posicion: "Centro" },
        { id: "SPN", radio: "40 m", azimut: "0°", distancia_centro: "80 m", materializado: "Sí", color: "Azul", posicion: "Norte" },
        { id: "SPE", radio: "40 m", azimut: "90°", distancia_centro: "80 m", materializado: "Sí", color: "Verde", posicion: "Este" },
        { id: "SPS", radio: "40 m", azimut: "180°", distancia_centro: "80 m", materializado: "Sí", color: "Amarillo", posicion: "Sur" },
        { id: "SPO", radio: "40 m", azimut: "270°", distancia_centro: "80 m", materializado: "Sí", color: "Blanco", posicion: "Oeste" }
      ]
    };
    
    this.conglomerados.push(nuevoConglomerado);
    this.saveData();
    this.cerrarModalCrear();
    this.filterConglomerados(this.currentFilter);
    
    alert('Conglomerado creado exitosamente!');
  }

  onSubmitEditar() {
    if (this.editarForm.invalid) return;
    
    const formData = this.editarForm.value;
    const id = formData.id;
    const index = this.conglomerados.findIndex(c => c.id === id);
    
    if (index !== -1) {
      this.conglomerados[index].fecha_inicio = formData.fechaInicio;
      this.conglomerados[index].fecha_finalizacion = formData.fechaFin;
      this.conglomerados[index].precision = formData.precision;
      
      if (!this.conglomerados[index].punto_referencia) {
        this.conglomerados[index].punto_referencia = {
          tipo: '',
          azimut: '',
          distancia_horizontal: ''
        };
      }
      
      this.conglomerados[index].punto_referencia.tipo = formData.puntoTipo;
      this.conglomerados[index].punto_referencia.azimut = formData.puntoAzimut;
      this.conglomerados[index].punto_referencia.distancia_horizontal = formData.puntoDistancia;
      
      this.saveData();
      this.cerrarModalEditar();
      this.filterConglomerados(this.currentFilter);
      
      alert('Cambios guardados exitosamente!');
    }
  }

  filterConglomerados(status: string) {
    this.currentFilter = status;
    
    if (this.currentSection === 'conglomerados') {
      this.conglomeradosFiltrados = this.conglomerados.filter(c => 
        c.estado === status && c.estado !== 'eliminado'
      );
    } else {
      this.conglomeradosFiltrados = this.papelera;
    }
  }

  editConglomerado(id: string) {
    this.editingConglomerado = this.conglomerados.find(c => c.id === id) || null;
    
    if (this.editingConglomerado) {
      this.editarForm.patchValue({
        id: this.editingConglomerado.id,
        fechaInicio: this.editingConglomerado.fecha_inicio,
        fechaFin: this.editingConglomerado.fecha_finalizacion,
        precision: this.editingConglomerado.precision,
        puntoTipo: this.editingConglomerado.punto_referencia?.tipo || '',
        puntoAzimut: this.editingConglomerado.punto_referencia?.azimut || '',
        puntoDistancia: this.editingConglomerado.punto_referencia?.distancia_horizontal || ''
      });
      
      this.modalEditarOpen = true;
    }
  }

  showDetails(id: string) {
    if (this.currentSection === 'conglomerados') {
      this.selectedConglomerado = this.conglomerados.find(c => c.id === id) || null;
    } else {
      this.selectedConglomerado = this.papelera.find(c => c.id === id) || null;
    }
    
    if (this.selectedConglomerado) {
      // Ensure dates are valid
      if (!this.selectedConglomerado.fecha_inicio) {
        this.selectedConglomerado.fecha_inicio = new Date().toISOString().split('T')[0];
      }
      
      if (!this.selectedConglomerado.fecha_finalizacion) {
        this.selectedConglomerado.fecha_finalizacion = new Date().toISOString().split('T')[0];
      }
      
      this.modalDetallesOpen = true;
      setTimeout(() => {
        this.initDetailsMap();
        this.generateSubparcelsOnMap();
      }, 300);
    }
  }

  initDetailsMap() {
    if (this.detailsMap) {
      this.detailsMap.remove();
    }
    
    const coords = this.parseDMS(this.selectedConglomerado?.coordenadas_centro || '');
    if (!coords) return;
    
    this.detailsMap = L.map(this.mapElement.nativeElement, {
      preferCanvas: true,
      center: coords,
      zoom: 15,
      renderer: L.canvas()
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      updateWhenIdle: true,
      maxZoom: 19
    }).addTo(this.detailsMap);

    setTimeout(() => this.detailsMap.invalidateSize(true), 100);
  }

  generateSubparcelsOnMap() {
    if (!this.selectedConglomerado || !this.detailsMap) return;
    
    const coords = this.parseDMS(this.selectedConglomerado.coordenadas_centro);
    if (!coords) return;
    
    // Limpiar elementos anteriores
    if (this.containerCircle) this.detailsMap.removeLayer(this.containerCircle);
    this.circles.forEach(circle => this.detailsMap.removeLayer(circle));
    this.circles = [];
    
    // Círculo del conglomerado
    this.containerCircle = L.circle(coords, {
      color: '#FFD700',
      fillColor: '#FFD700',
      fillOpacity: 0.2,
      radius: 120,
      weight: 2
    }).addTo(this.detailsMap).bindTooltip("Área del Conglomerado", {permanent: false});
    
    // Subparcelas
    const positions = [
      { id: "SPF1", position: "Centro", color: "#FF0000", distance: 0, azimuth: 0 },
      { id: "SPN", position: "Norte", color: "#0000FF", distance: 80, azimuth: 0 },
      { id: "SPE", position: "Este", color: "#00FF00", distance: 80, azimuth: 90 },
      { id: "SPS", position: "Sur", color: "#FFFF00", distance: 80, azimuth: 180 },
      { id: "SPO", position: "Oeste", color: "#FFFFFF", distance: 80, azimuth: 270 }
    ];
    
    positions.forEach(pos => {
      const position = pos.distance > 0 ? 
        this.calculateOffset(coords, pos.distance, pos.azimuth) : 
        coords;
        
      const circle = L.circle(position, {
        color: pos.color,
        fillColor: pos.color,
        fillOpacity: 0.6,
        radius: 40,
        weight: 1
      }).addTo(this.detailsMap)
      .bindTooltip(`${pos.id} (${pos.position})`, {permanent: false});
      
      this.circles.push(circle);
    });
    
    const allCircles = L.featureGroup([this.containerCircle, ...this.circles]);
    this.detailsMap.fitBounds(allCircles.getBounds(), {
      padding: [30, 30],
      maxZoom: 17
    });
    
    setTimeout(() => this.detailsMap.invalidateSize(true), 100);
  }

  changeStatus(newStatus: string) {
    if (!this.selectedConglomerado) return;
    
    const id = this.selectedConglomerado.id;
    const index = this.conglomerados.findIndex(c => c.id === id);
    
    if (index !== -1) {
      if (newStatus === 'corregir') {
        alert(`El conglomerado ${id} ha sido marcado para corrección`);
        return;
      }
      
      this.conglomerados[index].estado = newStatus as any;
      
      if (newStatus === 'aprobados') {
        this.conglomerados[index].aprobado_por = "Usuario Actual";
        this.conglomerados[index].fecha_aprobacion = new Date().toLocaleDateString();
      }
      
      this.saveData();
      this.closeDetailsModal();
      this.filterConglomerados(this.currentFilter);
    }
  }

  deleteConglomerado(id: string) {
    if (confirm(`¿Estás seguro de mover el conglomerado ${id} a la papelera?`)) {
      const index = this.conglomerados.findIndex(c => c.id === id);
      
      if (index !== -1) {
        this.papelera.push({...this.conglomerados[index], estado: 'eliminado'});
        this.conglomerados.splice(index, 1);
        this.saveData();
        this.filterConglomerados(this.currentFilter);
      }
    }
  }

  restoreConglomerado(id: string) {
    const index = this.papelera.findIndex(c => c.id === id);
    
    if (index !== -1) {
      this.conglomerados.push({...this.papelera[index], estado: 'pendientes'});
      this.papelera.splice(index, 1);
      this.saveData();
      this.filterConglomerados(this.currentFilter);
      this.closeDetailsModal();
    }
  }

  deletePermanently(id: string) {
    if (confirm(`¿Estás seguro de eliminar permanentemente el conglomerado ${id}?`)) {
      const index = this.papelera.findIndex(c => c.id === id);
      
      if (index !== -1) {
        this.papelera.splice(index, 1);
        this.saveData();
        this.filterConglomerados(this.currentFilter);
        this.closeDetailsModal();
      }
    }
  }

  toggleAreaCalculator() {
    this.areaCalculatorOpen = !this.areaCalculatorOpen;
    
    if (this.areaCalculatorOpen) {
      this.clearAreaDrawing();
    } else {
      this.disableAreaDrawing();
    }
  }

  enableAreaDrawing() {
    this.areaDrawingMode = true;
    this.areaPoints = [];
    this.coordinateList = [];
    this.clearAreaDrawing();
    
    this.detailsMap.getContainer().style.cursor = 'crosshair';
    this.detailsMap.on('click', this.addAreaPoint.bind(this));
    this.detailsMap.on('mousemove', this.showMouseCoordinates.bind(this));
  }

  clearAreaDrawing() {
    this.areaMarkers.forEach(marker => marker.remove());
    this.areaLines.forEach(line => line.remove());
    if (this.areaPolygon) this.areaPolygon.remove();
    
    this.areaMarkers = [];
    this.areaLines = [];
    this.areaPolygon = null;
    this.areaPoints = [];
    this.coordinateList = [];
  }

  disableAreaDrawing() {
    this.areaDrawingMode = false;
    if (this.detailsMap) {
      this.detailsMap.getContainer().style.cursor = '';
      this.detailsMap.off('click');
      this.detailsMap.off('mousemove');
    }
  }

  addAreaPoint(e: any) {
    if (!this.areaDrawingMode) return;
    
    const point = e.latlng;
    this.areaPoints.push(point);
    
    this.coordinateList.push({
      id: this.coordinateList.length + 1,
      lat: point.lat,
      lng: point.lng
    });
    
    const marker = L.circleMarker(point, {
      radius: 8,
      color: '#ffffff',
      fillColor: '#000000',
      fillOpacity: 1,
      weight: 2
    }).addTo(this.detailsMap);
    
    marker.bindTooltip((this.coordinateList.length).toString(), {
      permanent: true,
      direction: 'center',
      className: 'marker-number'
    });
    
    this.areaMarkers.push(marker);
    
    if (this.areaPoints.length > 1) {
      const points = [this.areaPoints[this.areaPoints.length - 2], this.areaPoints[this.areaPoints.length - 1]];
      const line = L.polyline(points, {color: '#ff0000', weight: 2}).addTo(this.detailsMap);
      this.areaLines.push(line);
    }
    
    if (this.areaPoints.length >= 3) {
      if (this.areaPolygon) this.areaPolygon.remove();
      this.areaPolygon = L.polygon(this.areaPoints, {
        color: '#ff5722',
        weight: 2,
        fillColor: '#ff5722',
        fillOpacity: 0.2
      }).addTo(this.detailsMap);
      this.calculateArea();
    }
  }

  showMouseCoordinates(e: any) {
    if (!this.areaDrawingMode) return;
    
    const coordsContainer = document.getElementById('mouse-coordinates');
    if (coordsContainer) {
      coordsContainer.innerHTML = `
        <strong>Coordenadas actuales:</strong>
        <div class="coordinates-values">
          <span>Lat: ${e.latlng.lat.toFixed(6)}</span>
          <span>Lng: ${e.latlng.lng.toFixed(6)}</span>
        </div>
      `;
    }
  }

  calculateArea() {
    if (this.areaPoints.length < 3) return;
    
    let area = 0;
    const n = this.areaPoints.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const xi = this.areaPoints[i].lng * Math.PI / 180;
      const yi = this.areaPoints[i].lat * Math.PI / 180;
      const xj = this.areaPoints[j].lng * Math.PI / 180;
      const yj = this.areaPoints[j].lat * Math.PI / 180;
      
      area += xi * yj - xj * yi;
    }
    
    area = Math.abs(area) / 2;
    
    const earthRadius = 6378137;
    const areaM2 = area * earthRadius * earthRadius;
    
    let resultText = `Área: ${areaM2.toFixed(2)} m²`;
    
    if (areaM2 > 10000) {
      const hectares = areaM2 / 10000;
      resultText += ` (${hectares.toFixed(4)} ha)`;
    }
    
    const areaResult = document.getElementById('area-result');
    if (areaResult) {
      areaResult.textContent = resultText;
    }
  }

  parseDMS(coordenadas: string): [number, number] | null {
    // Limpiar la cadena de coordenadas
    coordenadas = coordenadas.toString()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/’’/g, '"')
        .replace(/’/g, "'")
        .replace(/""/g, '"');
    
    console.log('Coordenadas a parsear:', coordenadas);
    
    const patterns = [
        /^(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])$/i,
        /^(\d+)°(\d+)'(\d+)"([NS])\s+(\d+)°(\d+)'(\d+)"([EW])$/i,
        /^([\d.]+)([NS])\s+([\d.]+)([EW])$/i,
        /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/
    ];
    
    let matches: RegExpMatchArray | null = null;
    for (const pattern of patterns) {
        matches = coordenadas.match(pattern);
        if (matches) break;
    }
    
    if (!matches) {
        console.error('No se encontró patrón para:', coordenadas);
        return null;
    }
    
    // Inicializar con valores por defecto
    let lat = 0;
    let lng = 0;
    let parseSuccess = false;
    
    // Procesar según el patrón
    if (matches.length === 9) {
        const latDeg = parseFloat(matches[1]);
        const latMin = parseFloat(matches[2]);
        const latSec = parseFloat(matches[3]);
        const latDir = matches[4];
        
        const lngDeg = parseFloat(matches[5]);
        const lngMin = parseFloat(matches[6]);
        const lngSec = parseFloat(matches[7]);
        const lngDir = matches[8];
        
        if (!isNaN(latDeg) && !isNaN(latMin) && !isNaN(latSec) &&
            !isNaN(lngDeg) && !isNaN(lngMin) && !isNaN(lngSec)) {
            
            lat = latDeg + (latMin / 60) + (latSec / 3600);
            if (latDir.toUpperCase() === 'S') lat = -lat;
            
            lng = lngDeg + (lngMin / 60) + (lngSec / 3600);
            if (lngDir.toUpperCase() === 'W') lng = -lng;
            
            parseSuccess = true;
        }
    } 
    else if (matches.length === 5) {
        const latVal = parseFloat(matches[1]);
        const latDir = matches[2];
        const lngVal = parseFloat(matches[3]);
        const lngDir = matches[4];
        
        if (!isNaN(latVal) && !isNaN(lngVal)) {
            lat = latDir.toUpperCase() === 'S' ? -latVal : latVal;
            lng = lngDir.toUpperCase() === 'W' ? -lngVal : lngVal;
            parseSuccess = true;
        }
    } 
    else if (matches.length === 3) {
        const latVal = parseFloat(matches[1]);
        const lngVal = parseFloat(matches[2]);
        
        if (!isNaN(latVal) && !isNaN(lngVal)) {
            lat = latVal;
            lng = lngVal;
            parseSuccess = true;
        }
    }
    
    // Validar resultados
    if (!parseSuccess || isNaN(lat) || isNaN(lng)) {
        console.error('Coordenadas inválidas:', coordenadas);
        return null;
    }
    
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        console.error('Coordenadas fuera de rango:', lat, lng);
        return null;
    }
    
    console.log('Coordenadas parseadas:', lat, lng);
    return [lat, lng] as [number, number];
}

  calculateOffset(center: [number, number], distance: number, bearing: number): [number, number] {
    const earthRadius = 6378137; // Radio terrestre en metros
    const latRad = center[0] * Math.PI / 180;
    const angularDist = distance / earthRadius;
    const bearingRad = bearing * Math.PI / 180;
    
    const newLat = Math.asin(
        Math.sin(latRad) * Math.cos(angularDist) + 
        Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearingRad)
    );
    
    const newLng = center[1] * Math.PI / 180 + Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(latRad),
        Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLat)
    );
    
    return [
        newLat * 180 / Math.PI,
        ((newLng * 180 / Math.PI) + 540) % 360 - 180 // Normalizar longitud
    ];
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    
    try {
      // Handle various date formats
      if (dateStr.includes('-')) {
        return new Date(dateStr).toLocaleDateString();
      }
      
      // Handle DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`).toLocaleDateString();
      }
      
      // Fallback to ISO string
      return new Date(dateStr).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }

  loadData() {
    const savedConglomerados = localStorage.getItem('conglomerados');
    const savedPapelera = localStorage.getItem('papelera');
    
    this.conglomerados = savedConglomerados ? JSON.parse(savedConglomerados) : [];
    this.papelera = savedPapelera ? JSON.parse(savedPapelera) : [];
    
    this.filterConglomerados(this.currentFilter);
  }

  saveData() {
    localStorage.setItem('conglomerados', JSON.stringify(this.conglomerados));
    localStorage.setItem('papelera', JSON.stringify(this.papelera));
  }
}