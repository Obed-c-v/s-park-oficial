import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { staggerAnimation } from '../../shared/animations';

@Component({
  selector: 'app-alerts',
  imports: [RouterLink],
  animations: [staggerAnimation],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts {
  alerts = [
    {
      id: 'P-8821',
      name: 'García, Roberto',
      date: '2024-05-20',
      time: '14:30',
      level: 'Alta',
      levelClass: 'high',
      reason: 'Variabilidad extrema en frecuencia fundamental (Jitter > 2.5%). Indica posible fatiga vocal severa.',
      status: 'Pendiente'
    },
    {
      id: 'P-7742',
      name: 'Martínez, Elena',
      date: '2024-05-20',
      time: '11:15',
      level: 'Media',
      levelClass: 'medium',
      reason: 'Incremento del 15% en ratio ruido-armónicos (HNR). Se sugiere revisión de medicación.',
      status: 'En revisión'
    },
    {
      id: 'P-9903',
      name: 'López, Juan Carlos',
      date: '2024-05-19',
      time: '17:45',
      level: 'Baja',
      levelClass: 'low',
      reason: 'Leve disminución en rango dinámico tonal. Sin cambios significativos en inteligibilidad.',
      status: 'Atendido'
    },
    {
      id: 'P-6612',
      name: 'Sánchez, María',
      date: '2024-05-19',
      time: '09:20',
      level: 'Alta',
      levelClass: 'high',
      reason: 'Aparición de temblor vocal rítmico (4-6 Hz) ausente en registros previos.',
      status: 'Urgente'
    }
  ];

  filterLevels = ['Todas', 'Alta', 'Media', 'Baja'];
  selectedLevel = 'Todas';

  get filteredAlerts() {
    if (this.selectedLevel === 'Todas') {
      return this.alerts;
    }
    return this.alerts.filter(alert => alert.level === this.selectedLevel);
  }

  setFilter(level: string) {
    this.selectedLevel = level;
  }

  onPatientClick(id: string) {
    console.log('Ver paciente:', id);
  }
}
