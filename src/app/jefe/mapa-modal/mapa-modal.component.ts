import { Component, Input, AfterViewInit } from '@angular/core';
import L, { LatLngTuple, map, tileLayer, marker } from 'leaflet';

@Component({
  selector: 'app-mapa-modal',
  templateUrl: './mapa-modal.component.html',
  styleUrls: ['./mapa-modal.component.css'],
  standalone: true
})
export class MapaModalComponent implements AfterViewInit {

  @Input() coordenadas!: string;

  ngAfterViewInit(): void {
    const parsed = this.parseDMS(this.coordenadas);
    if (parsed) {
      const map = L.map('map').setView(parsed, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      L.marker(parsed).addTo(map);
    }
  }

  private parseDMS(input: string): LatLngTuple | null {
    if (!input) return null;

    const regex = /(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])/i;
    const matches = input.match(regex);

    if (!matches) return null;

    const latDeg = parseFloat(matches[1]);
    const latMin = parseFloat(matches[2]);
    const latSec = parseFloat(matches[3]);
    const latDir = matches[4].toUpperCase();

    const lngDeg = parseFloat(matches[5]);
    const lngMin = parseFloat(matches[6]);
    const lngSec = parseFloat(matches[7]);
    const lngDir = matches[8].toUpperCase();

    let latitude = latDeg + latMin / 60 + latSec / 3600;
    let longitude = lngDeg + lngMin / 60 + lngSec / 3600;

    if (latDir === 'S') latitude = -latitude;
    if (lngDir === 'W') longitude = -longitude;

    return [latitude, longitude] as LatLngTuple;
  }
}