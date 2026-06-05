import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  isRecording = false;
  audioUrl: string | null = null;
  recordingDuration = 0;
  durationInterval: any;

  // Analysis States
  isAnalyzing = false;
  analysisResult: any = null;

  constructor(private router: Router) {}

  async startRecording() {
    try {

      const permission = await VoiceRecorder.requestAudioRecordingPermission();

      if (!permission.value) {
        alert("Debes permitir el micrófono");
        return;
      }

      await VoiceRecorder.startRecording();

      this.isRecording = true;
      this.recordingDuration = 0;
      this.analysisResult = null;
      this.isAnalyzing = false;

      this.durationInterval = setInterval(() => {
        this.recordingDuration++;
      }, 1000);

    } catch (error) {
      console.error("Error al iniciar grabación", error);
    }
  }

  async stopRecording() {

    try {

      const result = await VoiceRecorder.stopRecording();

      this.isRecording = false;
      clearInterval(this.durationInterval);

      if (result.value && result.value.recordDataBase64) {

        const audioBase64 = result.value.recordDataBase64;

        const audioBlob = this.base64ToBlob(audioBase64, 'audio/mp3');
        this.audioUrl = URL.createObjectURL(audioBlob);

        this.runRealAnalysis(audioBase64);
      }

    } catch (error) {
      console.error("Error al detener grabación", error);
    }

  }

  async cancelRecording() {
    try {
      await VoiceRecorder.stopRecording();
      this.isRecording = false;
      clearInterval(this.durationInterval);
      this.recordingDuration = 0;
      this.audioUrl = null;
    } catch (error) {
      console.error("Error al cancelar grabación", error);
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  base64ToBlob(base64: string, mime: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const hStr = hours < 10 ? '0' + hours : hours;
    const mStr = mins < 10 ? '0' + mins : mins;
    const sStr = secs < 10 ? '0' + secs : secs;
    
    return `${hStr}:${mStr}:${sStr}`;
  }

  runRealAnalysis(audioBase64: string) {
    this.isAnalyzing = true;
    this.analysisResult = null;

    let pacienteId = 1;
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (usuarioActivo) {
      const datos = JSON.parse(usuarioActivo);
      if (datos.id) {
        pacienteId = Number(datos.id);
      }
    }

    fetch(`${environment.apiUrl}/registros/voz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paciente_id: pacienteId,
        audio: audioBase64
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al conectar con la API de IA');
      }
      return response.json();
    })
    .then(data => {
      this.isAnalyzing = false;

      const isHigh = data.riesgo.toLowerCase() === 'alto' || data.riesgo.toLowerCase() === 'crítico';
      const isMedium = data.riesgo.toLowerCase() === 'medio';

      this.analysisResult = {
        status: isHigh ? 'danger' : (isMedium ? 'warning' : 'success'),
        title: isHigh ? 'Síntomas Posibles' : (isMedium ? 'Voz Débil Detectada' : 'Libre de Parkinson'),
        description: data.interpretacion,
        features: [
          {
            name: 'Estabilidad de voz',
            value: isHigh ? 'Inestable' : (isMedium ? 'Fluctuante' : 'Estable'),
            icon: isHigh ? 'alert-circle' : (isMedium ? 'warning' : 'checkmark-circle'),
            color: isHigh ? 'danger' : (isMedium ? 'warning' : 'success')
          },
          {
            name: 'Volumen',
            value: isHigh ? 'Muy Débil' : (isMedium ? 'Débil' : 'Normal'),
            icon: 'volume-high',
            color: isHigh ? 'danger' : (isMedium ? 'warning' : 'success')
          }
        ]
      };

      // Redirigir a tab4 enviando el resultado
      this.router.navigate(['/tabs/tab4'], { state: { analysisResult: this.analysisResult } });
    })
    .catch(error => {
      console.error("Error al procesar el audio de IA:", error);
      this.isAnalyzing = false;
      alert("Error al realizar el análisis acústico con los modelos de IA. Verifica tu conexión de red local.");
    });
  }

}