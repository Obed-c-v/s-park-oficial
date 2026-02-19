import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.css',
})
export class PatientDetail {
  private route = inject(ActivatedRoute);
  settingsService = inject(SettingsService);
  patientId = this.route.snapshot.paramMap.get('id') || 'P-8821';

  isEditingNotes = false;
  tempNotes = '';

  patient = {
    id: this.patientId,
    name: 'Roberto García',
    age: 68,
    gender: 'Masculino',
    diagnosisDate: '2022-03-15',
    currentStage: 'Estadío II (Hoehn & Yahr)',
    riskLevel: 'Alta',
    riskClass: 'high',
    interpretation: 'Se observa una progresión moderada en los biomarcadores vocales. El Jitter ha incrementado un 0.8% en los últimos 3 meses, correlacionando con el aumento reportado de rigidez matutina. La inteligibilidad se mantiene estable (>85%).',
    observations: 'Paciente refiere dificultad leve al inicio de la fonación. Se recomienda ajuste en la dosis de levodopa y seguimiento en 4 semanas.',
    history: [
      { date: '2024-05-20', jitter: '2.8%', shimmer: '12.4%', hnr: '14.2 dB', result: 'Crítico' },
      { date: '2024-04-15', jitter: '2.1%', shimmer: '11.8%', hnr: '15.8 dB', result: 'Estable' },
      { date: '2024-03-10', jitter: '2.0%', shimmer: '11.5%', hnr: '16.1 dB', result: 'Estable' },
      { date: '2024-02-05', jitter: '1.9%', shimmer: '11.2%', hnr: '16.5 dB', result: 'Estable' }
    ]
  };

  trendData = [
    { label: 'Feb', value: 45 },
    { label: 'Mar', value: 48 },
    { label: 'Abr', value: 52 },
    { label: 'May', value: 75 }
  ];

  toggleEditNotes() {
    this.tempNotes = this.patient.observations;
    this.isEditingNotes = true;
  }

  saveNotes() {
    this.patient.observations = this.tempNotes;
    this.isEditingNotes = false;
    console.log('Notas actualizadas para:', this.patientId);
  }

  cancelEditNotes() {
    this.isEditingNotes = false;
  }
}
