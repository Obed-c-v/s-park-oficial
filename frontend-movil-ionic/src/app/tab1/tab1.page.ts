import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit, OnDestroy {

  isRecording = false;
  audioUrl: string | null = null;
  recordingDuration = 0;
  durationInterval: any;

  // Analysis States
  isAnalyzing = false;
  analysisResult: any = null;

  recentAnalyses: any[] = [];
  isLoadingHistory = false;

  // ── MediaRecorder (Web) ─────────────────────────────────────────────────
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  /** True si el plugin nativo de Capacitor está disponible (Android / iOS) */
  private get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarAnalisisRecientes();
  }

  ngOnDestroy() {
    clearInterval(this.durationInterval);
    this.stopMediaStream();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INICIO / PARADA — Enrutamiento automático web vs nativo
  // ═══════════════════════════════════════════════════════════════════════

  async startRecording() {
    this.isRecording = true;
    this.recordingDuration = 0;
    this.analysisResult = null;
    this.isAnalyzing = false;
    this.audioUrl = null;

    this.durationInterval = setInterval(() => this.recordingDuration++, 1000);

    if (this.isNative) {
      await this.startNativeRecording();
    } else {
      await this.startWebRecording();
    }
  }

  async stopRecording() {
    clearInterval(this.durationInterval);

    if (this.isNative) {
      await this.stopNativeRecording();
    } else {
      this.stopWebRecording();
    }
  }

  async cancelRecording() {
    clearInterval(this.durationInterval);
    this.isRecording = false;
    this.recordingDuration = 0;
    this.audioUrl = null;

    if (this.isNative) {
      try { await VoiceRecorder.stopRecording(); } catch (_) {}
    } else {
      this.stopMediaStream();
      this.mediaRecorder = null;
      this.audioChunks = [];
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GRABACIÓN NATIVA — Android / iOS (capacitor-voice-recorder)
  // ═══════════════════════════════════════════════════════════════════════

  private async startNativeRecording() {
    try {
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      if (!permission.value) {
        alert('Debes permitir el acceso al micrófono.');
        this.isRecording = false;
        clearInterval(this.durationInterval);
        return;
      }
      await VoiceRecorder.startRecording();
    } catch (error) {
      console.error('Error al iniciar grabación nativa:', error);
      this.isRecording = false;
      clearInterval(this.durationInterval);
    }
  }

  private async stopNativeRecording() {
    try {
      const result = await VoiceRecorder.stopRecording();
      this.isRecording = false;

      // Validar duración mínima de 5 segundos
      if (this.recordingDuration < 5) {
        this.audioUrl = null;
        alert('La grabación debe ser de al menos 5 segundos. Intenta de nuevo sosteniendo el sonido "A" por más tiempo.');
        return;
      }

      if (result.value?.recordDataBase64) {
        const audioBase64 = result.value.recordDataBase64;
        const mime = result.value.mimeType || 'audio/aac';
        const blob = this.base64ToBlob(audioBase64, mime);
        this.audioUrl = URL.createObjectURL(blob);
        this.runRealAnalysis(audioBase64);
      }
    } catch (error) {
      this.isRecording = false;
      console.error('Error al detener grabación nativa:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GRABACIÓN WEB — Navegador (MediaRecorder API)
  // ═══════════════════════════════════════════════════════════════════════

  private async startWebRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Elegir el formato más compatible con Flask/librosa
      const mimeType = this.getSupportedMimeType();
      this.audioChunks = [];

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Liberar el stream del micrófono
        stream.getTracks().forEach((t) => t.stop());

        // Validar duración mínima de 5 segundos
        if (this.recordingDuration < 5) {
          this.audioUrl = null;
          alert('La grabación debe ser de al menos 5 segundos. Intenta de nuevo sosteniendo el sonido "A" por más tiempo.');
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.audioUrl = URL.createObjectURL(audioBlob);
        this.blobToBase64(audioBlob).then((base64) => {
          this.runRealAnalysis(base64);
        });
      };

      this.mediaRecorder.start(100); // capturar cada 100ms
    } catch (error: any) {
      this.isRecording = false;
      clearInterval(this.durationInterval);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Debes permitir el acceso al micrófono en el navegador.');
      } else {
        alert('No se pudo acceder al micrófono: ' + error.message);
      }
      console.error('Error MediaRecorder:', error);
    }
  }

  private stopWebRecording() {
    this.isRecording = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop(); // dispara el evento `onstop`
    }
  }

  private stopMediaStream() {
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
  }

  /** Devuelve el MIME type de audio más compatible con el navegador actual */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return ''; // fallback al codec por defecto del navegador
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ANÁLISIS DE IA
  // ═══════════════════════════════════════════════════════════════════════

  runRealAnalysis(audioBase64: string) {
    this.isAnalyzing = true;
    this.analysisResult = null;

    // Obtener paciente_id desde la sesión guardada
    let pacienteId = 1;
    try {
      const usuarioActivo = localStorage.getItem('usuarioActivo');
      if (usuarioActivo) {
        const datos = JSON.parse(usuarioActivo);
        if (datos?.id) pacienteId = Number(datos.id);
      }
    } catch (_) {}

    // Obtener token de autenticación si existe
    const token = localStorage.getItem('spark_auth_token') || '';

    fetch(`${environment.apiUrl}/registros/voz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ paciente_id: pacienteId, audio: audioBase64 })
    })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || `Error ${response.status} del servidor`);
        });
      }
      return response.json();
    })
    .then((data) => {
      this.isAnalyzing = false;

      const riesgo = (data.riesgo || '').toLowerCase();
      const isHigh   = riesgo === 'alto'   || riesgo === 'crítico';
      const isMedium = riesgo === 'medio';

      this.analysisResult = {
        status:      isHigh ? 'danger'  : (isMedium ? 'warning'  : 'success'),
        title:       isHigh ? 'Síntomas Posibles' : (isMedium ? 'Voz Débil Detectada' : 'Libre de Parkinson'),
        description: data.interpretacion,
        probabilidad: data.probabilidad,
        riesgo:      data.riesgo,
        features: [
          {
            name:  'Estabilidad de voz',
            value: isHigh ? 'Inestable' : (isMedium ? 'Fluctuante' : 'Estable'),
            icon:  isHigh ? 'alert-circle' : (isMedium ? 'warning' : 'checkmark-circle'),
            color: isHigh ? 'danger' : (isMedium ? 'warning' : 'success')
          },
          {
            name:  'Nivel de riesgo',
            value: data.riesgo || 'N/A',
            icon:  'shield-checkmark-outline',
            color: isHigh ? 'danger' : (isMedium ? 'warning' : 'success')
          },
          {
            name:  'Probabilidad',
            value: data.probabilidad ? `${data.probabilidad.toFixed(1)}%` : 'N/A',
            icon:  'stats-chart-outline',
            color: isHigh ? 'danger' : (isMedium ? 'warning' : 'success')
          }
        ]
      };

      // Redirigir a tab4 con el resultado
      this.cargarAnalisisRecientes();
      this.router.navigate(['/tabs/tab4'], { state: { analysisResult: this.analysisResult } });
    })
    .catch((error) => {
      this.isAnalyzing = false;
      console.error('Error al procesar el análisis de IA:', error);
      alert(`Error al analizar la grabación: ${error.message || 'Por favor, verifica tu conexión a Internet o inténtalo más tarde.'}`);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Quitar el prefijo "data:audio/...;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  base64ToBlob(base64: string, mime: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  }

  cargarAnalisisRecientes() {
    let pacienteId = 1;
    try {
      const usuarioActivo = localStorage.getItem('usuarioActivo');
      if (usuarioActivo) {
        const datos = JSON.parse(usuarioActivo);
        if (datos?.id) pacienteId = Number(datos.id);
      }
    } catch (_) {}

    const token = localStorage.getItem('spark_auth_token') || '';
    this.isLoadingHistory = true;

    fetch(`${environment.apiUrl}/registros/${pacienteId}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    })
    .then((records: any[]) => {
      this.isLoadingHistory = false;
      if (!records || !Array.isArray(records) || records.length === 0) {
        this.recentAnalyses = [];
        return;
      }

      // Agrupar registros de biomarcador por sesión (diferencia < 5 seg)
      const groups: { [key: string]: any } = {};
      records.forEach((r: any) => {
        const timestamp = new Date(r.fecha_registro).getTime();
        const matchedKey = Object.keys(groups).find(k => Math.abs(Number(k) - timestamp) < 5000);
        const key = matchedKey || timestamp.toString();

        if (!groups[key]) {
          groups[key] = {
            id: r.id,
            fecha_registro: r.fecha_registro,
            resultado_ia: r.resultado_ia
          };
        }
      });

      // Ordenar por fecha DESC y tomar los primeros 3
      const sortedSessions = Object.values(groups).sort((a: any, b: any) => {
        return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
      });

      this.recentAnalyses = sortedSessions.slice(0, 3).map((session: any) => {
        const prob = session.resultado_ia?.probabilidad || 0;
        const riesgo = (session.resultado_ia?.riesgo || 'BAJO').toUpperCase();
        
        let label = 'Normal';
        let badgeClass = 'success';
        let iconClass = 'normal';
        let iconName = 'checkmark-circle-outline';

        if (riesgo === 'ALTO' || riesgo === 'CRÍTICO') {
          label = 'Riesgo Alto';
          badgeClass = 'danger';
          iconClass = 'danger';
          iconName = 'close-circle-outline';
        } else if (riesgo === 'MEDIO') {
          label = 'Riesgo Medio';
          badgeClass = 'warning';
          iconClass = 'warning';
          iconName = 'alert-circle-outline';
        }

        return {
          id: session.id,
          fechaLabel: this.formatFechaLabel(session.fecha_registro),
          probabilidad: prob,
          riesgo: riesgo,
          label: label,
          badgeClass: badgeClass,
          iconClass: iconClass,
          iconName: iconName
        };
      });
    })
    .catch(err => {
      this.isLoadingHistory = false;
      console.error('Error al cargar historial de análisis:', err);
    });
  }

  formatFechaLabel(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const hoy = new Date();
      const ayer = new Date();
      ayer.setDate(hoy.getDate() - 1);

      if (date.toDateString() === hoy.toDateString()) {
        return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (date.toDateString() === ayer.toDateString()) {
        return `Ayer, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('es-ES', options);
      }
    } catch (_) {
      return 'Fecha de prueba';
    }
  }
}