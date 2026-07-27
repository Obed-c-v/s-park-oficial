import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

interface Appointment {
  id?: number;
  doctor: string;
  specialty: string;
  avatarId: number;
  date: string;
  dateFormatted: string;
  time: string;
  type: 'Videollamada' | 'Consultorio';
  status: 'proxima' | 'completada' | 'cancelada';
}

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {

  // ── Estado del modal de nueva cita ──────────────────────────────────────
  showModal: boolean = false;
  activeTab: 'proximas' | 'historial' = 'proximas';
  currentStep: number = 1;

  // ── Catálogos ────────────────────────────────────────────────────────────
  specialties: { name: string; icon: string }[] = [];
  doctors: { id: number; name: string; specialty: string; avatarId: number }[] = [];

  availableTimes: string[] = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ];

  // ── Modelo nueva cita ────────────────────────────────────────────────────
  newAppointment: {
    specialty: string;
    doctor: string;
    avatarId: number;
    date: string;
    time: string;
    type: 'Videollamada' | 'Consultorio' | '';
  } = {
    specialty: '',
    doctor: '',
    avatarId: 12,
    date: '',
    time: '',
    type: ''
  };

  // ── Citas Reales del Paciente ────────────────────────────────────────────
  citas: Appointment[] = [];
  historial: Appointment[] = [];
  cargando: boolean = false;

  // ── Pastillero simulado e interactivo ────────────────────────────────────
  tomasPildoras = [
    { id: 1, name: 'Levodopa + Carbidopa', hour: 8, minute: 0, ampm: 'AM', dosage: '1 comprimido', taken: false },
    { id: 2, name: 'Levodopa + Carbidopa', hour: 14, minute: 0, ampm: 'PM', dosage: '1 comprimido', taken: false },
    { id: 3, name: 'Levodopa + Carbidopa', hour: 20, minute: 0, ampm: 'PM', dosage: '1 comprimido', taken: false }
  ];

  nextPillMinutes: number = 25;
  nextPillName: string = 'Levodopa + Carbidopa';
  nextPillDetail: string = 'Hoy, 14:00 · 1 comprimido';
  tomaCompletada: boolean = false;

  minDate: string = '';
  maxDate: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarCitas();
    this.cargarMedicos();
    this.calcularLimitesFechas();
    this.actualizarPastillero();
  }

  actualizarPastillero() {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    const tiempoActualEnMinutos = horaActual * 60 + minutoActual;

    // Buscar la siguiente toma del día que no haya sido marcada como tomada
    let proximaToma = this.tomasPildoras.find(t => {
      const tiempoTomaEnMinutos = t.hour * 60 + t.minute;
      return !t.taken && tiempoTomaEnMinutos > tiempoActualEnMinutos;
    });

    // Si no hay tomas futuras hoy que no se hayan tomado, tomar la primera de mañana
    if (!proximaToma) {
      proximaToma = this.tomasPildoras.find(t => !t.taken);
    }

    // Si todas fueron tomadas, reiniciar todas las tomas (nuevo ciclo)
    if (!proximaToma) {
      this.tomasPildoras.forEach(t => t.taken = false);
      proximaToma = this.tomasPildoras[0];
      this.tomaCompletada = true;
    } else {
      this.tomaCompletada = false;
    }

    this.nextPillName = proximaToma.name;
    
    // Formatear hora de la toma
    const hh = proximaToma.hour > 12 ? proximaToma.hour - 12 : proximaToma.hour;
    const mm = String(proximaToma.minute).padStart(2, '0');
    const timeFormatted = `${String(hh).padStart(2, '0')}:${mm} ${proximaToma.ampm}`;
    
    this.nextPillDetail = `Hoy, ${timeFormatted} · ${proximaToma.dosage}`;

    // Calcular minutos restantes
    const tiempoTomaEnMinutos = proximaToma.hour * 60 + proximaToma.minute;
    let difMinutos = tiempoTomaEnMinutos - tiempoActualEnMinutos;
    if (difMinutos <= 0) {
      // Si la hora ya pasó y no se ha tomado, es una toma retrasada
      difMinutos = 10; 
      this.nextPillDetail = `¡RETRASADO! Debió tomarse a las ${timeFormatted} · ${proximaToma.dosage}`;
    }
    this.nextPillMinutes = difMinutos;
  }

  marcarComoTomado() {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    const tiempoActualEnMinutos = horaActual * 60 + minutoActual;

    // Encontrar la toma activa o más cercana
    let tomaAMarcar = this.tomasPildoras.find(t => {
      const tiempoTomaEnMinutos = t.hour * 60 + t.minute;
      return !t.taken && tiempoTomaEnMinutos > tiempoActualEnMinutos;
    });

    if (!tomaAMarcar) {
      tomaAMarcar = this.tomasPildoras.find(t => !t.taken);
    }

    if (tomaAMarcar) {
      tomaAMarcar.taken = true;
      alert(`¡Dosis de ${tomaAMarcar.name} (${tomaAMarcar.dosage}) registrada a las ${ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
    }

    this.actualizarPastillero();
  }

  calcularLimitesFechas() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;

    const maxLimit = new Date();
    maxLimit.setDate(today.getDate() + 7);
    const max_yyyy = maxLimit.getFullYear();
    const max_mm = String(maxLimit.getMonth() + 1).padStart(2, '0');
    const max_dd = String(maxLimit.getDate()).padStart(2, '0');
    this.maxDate = `${max_yyyy}-${max_mm}-${max_dd}`;
  }

  cargarCitas() {
    this.cargando = true;
    this.authService.getCitas().subscribe({
      next: (res: any[]) => {
        const mapped = res.map(c => this.mapBackendCita(c));
        this.citas = mapped.filter(c => c.status === 'proxima');
        this.historial = mapped.filter(c => c.status !== 'proxima');
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarMedicos() {
    this.authService.getMedicos().subscribe({
      next: (meds) => {
        // limit to first few to not saturate the user
        const activeMeds = meds.filter(m => m.activo !== false);
        this.doctors = activeMeds.map(m => ({
          id: m.id,
          name: `Dr(a). ${m.nombre} ${m.apellido}`,
          specialty: m.especialidad || 'General',
          avatarId: m.id
        }));

        // Dynamically extract specialties
        const specsSet = new Set<string>();
        activeMeds.forEach(m => {
          if (m.especialidad) specsSet.add(m.especialidad);
        });

        const specIcons: { [key: string]: string } = {
          'Neurología': 'pulse-outline',
          'Medicina General': 'medkit-outline',
          'Cardiología': 'heart-outline',
          'Rehabilitación': 'body-outline',
          'Psiquiatría': 'sad-outline',
          'Geriatría': 'people-outline'
        };

        this.specialties = Array.from(specsSet).map(name => ({
          name,
          icon: specIcons[name] || 'medkit-outline'
        }));
      }
    });
  }

  mapBackendCita(c: any): Appointment {
    const dateObj = new Date(c.fecha_hora);
    
    // date formatted: YYYY-MM-DD
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const formatted = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]}`;

    // Time format (e.g. "10:00 AM")
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    // status
    let status: 'proxima' | 'completada' | 'cancelada' = 'proxima';
    if (c.estado === 'COMPLETADA' || c.estado === 'REALIZADA') {
      status = 'completada';
    } else if (c.estado === 'CANCELADA') {
      status = 'cancelada';
    } else {
      // If it's in the past, treat as completed
      if (dateObj < new Date()) {
        status = 'completada';
      }
    }

    return {
      id: c.id,
      doctor: `Dr(a). ${c.doctor_nombre || ''} ${c.doctor_apellido || ''}`.trim(),
      specialty: c.especialidad || 'General',
      avatarId: c.medico_id || 12,
      date: dateStr,
      dateFormatted: formatted,
      time: timeStr,
      type: 'Consultorio', // Defaults to Office visit
      status
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  get proximasCitas(): Appointment[] {
    return this.citas;
  }

  get filteredHistorial(): Appointment[] {
    return this.historial;
  }

  getDoctorByName(name: string) {
    return this.doctors.find(d => d.name === name);
  }

  getFilteredDoctors() {
    if (!this.newAppointment.specialty) return this.doctors;
    return this.doctors.filter(d => d.specialty === this.newAppointment.specialty);
  }

  // ── Modal y pasos ────────────────────────────────────────────────────────
  openModal() {
    this.showModal = true;
    this.currentStep = 1;
    this.newAppointment = { specialty: '', doctor: '', avatarId: 12, date: '', time: '', type: '' };
  }

  closeModal() {
    this.showModal = false;
  }

  selectSpecialty(name: string) {
    this.newAppointment.specialty = name;
    this.newAppointment.doctor = '';
  }

  selectDoctor(doc: { name: string; specialty: string; avatarId: number }) {
    this.newAppointment.doctor = doc.name;
    this.newAppointment.avatarId = doc.avatarId;
  }

  selectTime(time: string) {
    this.newAppointment.time = time;
  }

  selectType(type: 'Videollamada' | 'Consultorio') {
    this.newAppointment.type = type;
  }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  canAdvanceStep1(): boolean {
    return !!this.newAppointment.specialty && !!this.newAppointment.doctor;
  }

  canAdvanceStep2(): boolean {
    return !!this.newAppointment.date && !!this.newAppointment.time;
  }

  canSave(): boolean {
    return !!this.newAppointment.type;
  }

  // ── Guardar cita en base de datos ─────────────────────────────────────────
  saveAppointment() {
    if (!this.canSave()) return;

    // Resolve doctor ID
    const selectedDoc = this.doctors.find(d => d.name === this.newAppointment.doctor);
    if (!selectedDoc) {
      alert('Por favor selecciona un doctor válido');
      return;
    }

    // Parse date and time to ISO String
    const datePart = this.newAppointment.date; // 'YYYY-MM-DD'
    const timePart = this.newAppointment.time; // '10:00 AM'
    const [time, ampm] = timePart.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const isoString = `${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    this.cargando = true;
    this.authService.createCita(selectedDoc.id, isoString).subscribe({
      next: (res) => {
        this.cargarCitas();
        this.closeModal();
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al programar la cita: ' + (err.error?.message || 'intente de nuevo'));
      }
    });
  }

  // ── Cancelar cita (Simulado o podemos agregar endpoint en un futuro si se requiere) ─────────────────
  cancelAppointment(index: number) {
    // If the user desires actual API cancellation we can do it, but let's keep it simulated/local for now unless backend route exists.
    const cita = this.citas[index];
    this.historial.unshift({ ...cita, status: 'cancelada' });
    this.citas.splice(index, 1);
  }
}