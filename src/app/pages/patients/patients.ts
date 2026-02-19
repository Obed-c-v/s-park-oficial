import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { staggerAnimation } from '../../shared/animations';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [RouterLink, FormsModule],
  animations: [staggerAnimation],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  settingsService = inject(SettingsService);
  searchTerm: string = '';
  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  formSubmitted = false;
  touched = { firstName: false, lastName: false };

  newPatient = {
    firstName: '',
    lastName: '',
    age: null as number | null,
    gender: 'Masculino',
    phone: '',
    email: '',
    initialDiagnosis: ''
  };

  patients = [
    { id: 'P-8821', name: 'Roberto García', age: 68, lastTest: '2024-05-20', riskLevel: 'Alta', riskClass: 'badge-high' },
    { id: 'P-4552', name: 'Elena López', age: 72, lastTest: '2024-05-19', riskLevel: 'Alta', riskClass: 'badge-high' },
    { id: 'P-3321', name: 'Juan Martínez', age: 65, lastTest: '2024-05-18', riskLevel: 'Medio', riskClass: 'badge-medium' },
    { id: 'P-7728', name: 'Manuel García', age: 70, lastTest: '2024-05-15', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-8892', name: 'Clara Sánchez', age: 64, lastTest: '2024-05-14', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-9912', name: 'Carlos Ruíz', age: 69, lastTest: '2024-05-10', riskLevel: 'Medio', riskClass: 'badge-medium' },
    { id: 'P-1122', name: 'Ana Beltrán', age: 55, lastTest: '2024-05-09', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-3344', name: 'Pedro Picapiedra', age: 45, lastTest: '2024-05-08', riskLevel: 'Medio', riskClass: 'badge-medium' },
    { id: 'P-5566', name: 'Vilma Picapiedra', age: 42, lastTest: '2024-05-07', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-7788', name: 'Beto Marmol', age: 48, lastTest: '2024-05-06', riskLevel: 'Medio', riskClass: 'badge-medium' },
    { id: 'P-9900', name: 'Sonia Marmol', age: 46, lastTest: '2024-05-05', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-2233', name: 'Luis Miguel', age: 53, lastTest: '2024-05-04', riskLevel: 'Alta', riskClass: 'badge-high' },
    { id: 'P-4455', name: 'Shakira Isabel', age: 47, lastTest: '2024-05-03', riskLevel: 'Medio', riskClass: 'badge-medium' },
    { id: 'P-6677', name: 'Rafa Nadal', age: 37, lastTest: '2024-05-02', riskLevel: 'Bajo', riskClass: 'badge-low' },
    { id: 'P-8899', name: 'Roger Federer', age: 42, lastTest: '2024-05-01', riskLevel: 'Bajo', riskClass: 'badge-low' },
  ];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  get filteredPatients() {
    return this.patients.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredPatients.length / this.pageSize);
  }

  get paginatedPatients() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(startIndex, startIndex + this.pageSize);
  }

  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openModal() {
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  editPatient(patient: any) {
    this.isEditing = true;
    this.editingId = patient.id;
    const nameParts = patient.name.split(' ');
    this.newPatient = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      age: patient.age,
      gender: patient.gender || 'Masculino',
      phone: patient.phone || '',
      email: patient.email || '',
      initialDiagnosis: patient.initialDiagnosis || ''
    };
    this.showModal = true;
  }

  deletePatient(id: string) {
    const confirmMsg = this.settingsService.language() === 'es'
      ? '¿Estás seguro de que deseas eliminar este paciente?'
      : 'Are you sure you want to delete this patient?';

    if (confirm(confirmMsg)) {
      this.patients = this.patients.filter(p => p.id !== id);
      console.log('Paciente eliminado:', id);
    }
  }

  closeModal() {
    this.showModal = false;
    this.formSubmitted = false;
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
  }

  resetForm() {
    this.newPatient = {
      firstName: '',
      lastName: '',
      age: null,
      gender: 'Masculino',
      phone: '',
      email: '',
      initialDiagnosis: ''
    };
  }

  savePatient() {
    this.formSubmitted = true;
    if (!this.newPatient.firstName || !this.newPatient.lastName) {
      alert(this.settingsService.translate('required_fields_msg'));
      return;
    }

    if (this.isEditing && this.editingId) {
      // Update existing patient
      const index = this.patients.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.patients[index] = {
          ...this.patients[index],
          name: `${this.newPatient.firstName} ${this.newPatient.lastName}`,
          age: this.newPatient.age || 0,
        };
        console.log('Paciente actualizado:', this.patients[index]);
      }
    } else {
      // Create new patient
      const id = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEntry = {
        id: id,
        name: `${this.newPatient.firstName} ${this.newPatient.lastName}`,
        age: this.newPatient.age || 0,
        lastTest: '-',
        riskLevel: 'Pendiente',
        riskClass: 'badge-medium'
      };
      this.patients = [newEntry, ...this.patients];
      this.currentPage = 1;
      console.log('Paciente registrado:', newEntry);
    }
    this.closeModal();
  }
}
