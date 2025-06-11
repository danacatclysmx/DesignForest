import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // <-- Esto es MUY importante
})
export class ConglomeradoService {
  private conglomerados: any[] = [];
  private papelera: any[] = [];

  constructor() {
    const storedConglomerados = localStorage.getItem('conglomerados');
    const storedPapelera = localStorage.getItem('papelera');

    this.conglomerados = storedConglomerados ? JSON.parse(storedConglomerados) : [];
    this.papelera = storedPapelera ? JSON.parse(storedPapelera) : [];
  }

  getConglomerados(filtroEstado?: string): any[] {
    if (!filtroEstado) return this.conglomerados;
    return this.conglomerados.filter(c => c.estado === filtroEstado);
  }

  saveToLocalStorage(): void {
    localStorage.setItem('conglomerados', JSON.stringify(this.conglomerados));
    localStorage.setItem('papelera', JSON.stringify(this.papelera));
  }
}