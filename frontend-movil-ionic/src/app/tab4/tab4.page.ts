import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {

  // Resultado dinámico obtenido del análisis en Tab 1 o el examen más reciente de la BD
  analysisResult: any = null;

  // Estado de carga y datos de exámenes
  hasExams = false;
  loadingExams = false;

  // Variables dinámicas enlazadas a la vista
  vocalScore = 78;
  vocalScoreStatus = 'Atención';
  vocalScoreClass = 'attention';
  vocalScoreDesc = 'Tu voz se encuentra en un nivel intermedio estable. Registras buenas métricas pero recomendamos ejercitar a diario.';

  estabilidadVocal = 82;
  temblorVocal = 'Bajo';
  temblorClass = 'optimal';
  temblorBulletClass = 'bullet optimal';

  claridadHabla = 76;
  claridadClass = 'warn';
  claridadBulletClass = 'bullet warn';

  riesgoEstimado = 28;
  riesgoClass = 'optimal';
  riesgoBulletClass = 'bullet optimal';

  // Espectrograma de voz
  jitterVal = '0.520%';
  jitterStatus = 'Estable';
  jitterClass = 'stable';

  shimmerVal = '2.40%';
  shimmerStatus = 'Moderado';
  shimmerClass = 'moderate';

  hnrVal = '22.40 dB';
  hnrStatus = 'Bajo (Óptimo)';
  hnrClass = 'optimal';

  f0Val = '198.5 Hz';
  f0Status = 'Estable';
  f0Class = 'trend';

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    // 1. Recuperar el resultado si viene desde la redirección directa del Tab 1 (Grabación reciente)
    if (history.state && history.state.analysisResult) {
      this.analysisResult = history.state.analysisResult;
      
      // Extraer datos para el resto de la interfaz desde el resultado redireccionado
      this.populateFromRedirectResult(this.analysisResult);

      // Limpiar el estado del historial del Router
      history.replaceState(null, '');
    } else {
      // 2. Si no hay redirección reciente, buscar la última prueba en el historial del paciente en la BD
      this.cargarUltimoExamen();
    }
  }

  // Método interactivo para archivar y ocultar el banner temporal de análisis
  archivarAnalisis() {
    this.analysisResult = null;
  }

  // Carga la prueba de voz más reciente desde el backend
  cargarUltimoExamen() {
    // Obtener paciente id
    let pacienteId = 1;
    try {
      const usuarioActivo = localStorage.getItem('usuarioActivo');
      if (usuarioActivo) {
        const datos = JSON.parse(usuarioActivo);
        if (datos?.id) pacienteId = Number(datos.id);
      }
    } catch (_) {}

    this.loadingExams = true;

    this.http.get<any[]>(`${environment.apiUrl}/registros/${pacienteId}`).subscribe({
      next: (records) => {
        this.loadingExams = false;

        if (!records || records.length === 0) return;

        // Agrupar los registros en sesiones: registros grabados en un mismo bloque
        // de ±60 segundos se consideran de la misma sesión.
        const sorted = [...records]; // ya vienen DESC por fecha

        // Tomar la sesión más reciente: desde el primer registro y recoger
        // todos los que están a ≤60s del mismo
        const refTime = new Date(sorted[0].fecha_registro).getTime();
        const sesionActual = sorted.filter(r => {
          const t = new Date(r.fecha_registro).getTime();
          return Math.abs(refTime - t) <= 60_000;
        });

        const jitterRow  = sesionActual.find((r: any) => r.biomarcador_id === 1);
        const shimmerRow = sesionActual.find((r: any) => r.biomarcador_id === 2);
        const hnrRow     = sesionActual.find((r: any) => r.biomarcador_id === 3);

        if (jitterRow && shimmerRow && hnrRow) {
          this.hasExams = true;
          const jitter  = Number(jitterRow.valor);
          const shimmer = Number(shimmerRow.valor);
          const hnr     = Number(hnrRow.valor);

          const resultIa      = jitterRow.resultado_ia || {};
          const prob          = resultIa.probabilidad || 0;
          const riesgo        = (resultIa.riesgo || 'BAJO').toUpperCase();
          const interpretacion = resultIa.interpretacion || '';
          const f0            = resultIa.f0 || 198.5;

          // Actualizar variables dinámicas de la vista
          this.riesgoEstimado = Math.round(prob);
          this.vocalScore     = Math.max(0, Math.min(100, Math.round(100 - prob)));

          if (riesgo === 'ALTO') {
            this.vocalScoreStatus = 'Atención';
            this.vocalScoreClass  = 'attention';
            this.vocalScoreDesc   = interpretacion || 'Se identifican alteraciones acústicas significativas compatibles con disfonía. Se recomienda control médico.';
          } else {
            this.vocalScoreStatus = 'Estable';
            this.vocalScoreClass  = 'stable';
            this.vocalScoreDesc   = interpretacion || 'El análisis acústico indica estabilidad y buen control de frecuencias vocales. ¡Sigue así!';
          }

          // Estabilidad vocal
          this.estabilidadVocal = Math.max(10, Math.min(100, Math.round(100 - (jitter * 30 + Math.max(0, shimmer - 1) * 3))));

          // Temblor vocal
          if (jitter < 0.6) {
            this.temblorVocal = 'Bajo';          this.temblorClass = 'optimal';  this.temblorBulletClass = 'bullet optimal';
          } else if (jitter < 1.3) {
            this.temblorVocal = 'Moderado';      this.temblorClass = 'warn';     this.temblorBulletClass = 'bullet warn';
          } else {
            this.temblorVocal = 'Alto';          this.temblorClass = 'danger';   this.temblorBulletClass = 'bullet danger';
          }

          // Claridad de habla
          this.claridadHabla = Math.max(10, Math.min(100, Math.round(hnr * 3)));
          if (this.claridadHabla > 75) {
            this.claridadClass = 'optimal';  this.claridadBulletClass = 'bullet optimal';
          } else if (this.claridadHabla > 50) {
            this.claridadClass = 'warn';     this.claridadBulletClass = 'bullet warn';
          } else {
            this.claridadClass = 'danger';   this.claridadBulletClass = 'bullet danger';
          }

          if (riesgo === 'ALTO') {
            this.riesgoClass = 'danger';  this.riesgoBulletClass = 'bullet danger';
          } else {
            this.riesgoClass = 'optimal'; this.riesgoBulletClass = 'bullet optimal';
          }

          // Espectrograma
          this.jitterVal = `${jitter.toFixed(3)}%`;
          this.jitterStatus = jitter < 0.6 ? 'Estable' : (jitter < 1.3 ? 'Moderado' : 'Alto');
          this.jitterClass  = jitter < 0.6 ? 'stable'  : (jitter < 1.3 ? 'moderate' : 'danger');

          this.shimmerVal = `${shimmer.toFixed(2)}%`;
          this.shimmerStatus = shimmer < 2.5 ? 'Estable' : (shimmer < 5.0 ? 'Moderado' : 'Alto');
          this.shimmerClass  = shimmer < 2.5 ? 'stable'  : (shimmer < 5.0 ? 'moderate' : 'danger');

          this.hnrVal = `${hnr.toFixed(2)} dB`;
          if (hnr > 20) { this.hnrStatus = 'Bajo (Óptimo)'; this.hnrClass = 'optimal'; }
          else if (hnr > 12) { this.hnrStatus = 'Moderado'; this.hnrClass = 'moderate'; }
          else { this.hnrStatus = 'Alto (Ruido)'; this.hnrClass = 'danger'; }

          this.f0Val    = `${f0.toFixed(1)} Hz`;
          this.f0Status = f0 > 150 ? 'Estable (Agudo)' : 'Estable (Grave)';
          this.f0Class  = 'trend';

          // Reconstruir el analysisResult para la ficha de diagnóstico
          this.analysisResult = {
            status:      riesgo === 'ALTO' ? 'danger' : 'success',
            title:       riesgo === 'ALTO' ? 'Síntomas Posibles' : 'Libre de Parkinson',
            description: interpretacion,
            probabilidad: prob,
            riesgo: riesgo,
            features: [
              { name: 'Estabilidad de voz', value: riesgo === 'ALTO' ? 'Inestable' : 'Estable',
                icon: riesgo === 'ALTO' ? 'alert-circle' : 'checkmark-circle',
                color: riesgo === 'ALTO' ? 'danger' : 'success' },
              { name: 'Nivel de riesgo', value: riesgo, icon: 'shield-checkmark-outline',
                color: riesgo === 'ALTO' ? 'danger' : 'success' },
              { name: 'Probabilidad', value: `${prob.toFixed(1)}%`, icon: 'stats-chart-outline',
                color: riesgo === 'ALTO' ? 'danger' : 'success' }
            ]
          };
        }
      },
      error: (err) => {
        this.loadingExams = false;
        console.error('Error al cargar la prueba más reciente:', err);
      }
    });
  }

  // Helper para mapear si se redireccionó desde la página de grabación
  private populateFromRedirectResult(result: any) {
    this.hasExams = true;
    this.riesgoEstimado = Math.round(result.probabilidad || 28);
    this.vocalScore = Math.round(100 - this.riesgoEstimado);
    this.vocalScoreDesc = result.description;

    const status = result.status; // success, warning, danger
    if (status === 'danger') {
      this.vocalScoreStatus = 'Atención';
      this.vocalScoreClass = 'attention';
    } else if (status === 'warning') {
      this.vocalScoreStatus = 'Atención Leve';
      this.vocalScoreClass = 'warn';
    } else {
      this.vocalScoreStatus = 'Estable';
      this.vocalScoreClass = 'stable';
    }
    // Mantener los valores por defecto del espectrograma o esperar a recargar.
  }
}
