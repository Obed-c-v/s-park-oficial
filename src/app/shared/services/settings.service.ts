import { Injectable, signal, effect } from '@angular/core';

export type Language = 'en' | 'es';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    darkMode = signal<boolean>(localStorage.getItem('darkMode') === 'true');
    language = signal<Language>((localStorage.getItem('language') as Language) || 'en');

    // Basic translations dictionary
    private translations: any = {
        en: {
            dashboard: 'Dashboard',
            patients: 'Patients',
            alerts: 'Alerts',
            settings: 'Settings',
            system_settings: 'System Settings',
            profile_settings: 'Professional Profile',
            security: 'Security',
            preferences: 'Preferences',
            dark_mode: 'Dark Mode',
            system_language: 'System Language',
            save_changes: 'Save Changes',
            change_password: 'Change Password',
            current_password: 'Current Password',
            new_password: 'New Password',
            confirm_password: 'Confirm Password',
            logout: 'Logout',
            portal_title: 'S-park Portal',
            welcome: 'Welcome',
            total_patients: 'Total Patients',
            high_risk: 'High Risk',
            tests_performed: 'Tests Performed',
            last_test: 'Last Test',
            recent_activity: 'Recent Activity',
            clinical_alerts: 'Clinical Alerts',
            patient_directory: 'Patient Directory',
            register_patient: 'Register Patient',
            search_placeholder: 'Search by name or ID...',
            filter: 'Filter',
            export: 'Export',
            risk_level: 'Risk Level',
            actions: 'Actions',
            view_detail: 'View Detail',
            new_test: 'New Test',
            edit: 'Edit',
            invalid_login: 'Invalid email or password.',
            email_required: 'Email is required.',
            password_required: 'Password is required.',
            field_required: 'This field is required.',
            register_new_patient: 'Register New Patient',
            first_name: 'First Name',
            last_name: 'Last Name',
            age: 'Age',
            gender: 'Gender',
            male: 'Male',
            female: 'Female',
            other: 'Other',
            phone: 'Phone',
            email: 'Email',
            initial_diagnosis: 'Initial Diagnosis',
            cancel: 'Cancel',
            save_patient: 'Save Patient',
            edit_patient: 'Edit Patient',
            delete: 'Delete',
            required_fields_msg: 'Please complete all required fields.'
        },
        es: {
            dashboard: 'Panel de Control',
            patients: 'Pacientes',
            alerts: 'Alertas',
            settings: 'Configuración',
            system_settings: 'Configuración del Sistema',
            profile_settings: 'Perfil Profesional',
            security: 'Seguridad',
            preferences: 'Preferencias',
            dark_mode: 'Modo Oscuro',
            system_language: 'Idioma del Sistema',
            save_changes: 'Guardar Cambios',
            change_password: 'Cambiar Contraseña',
            current_password: 'Contraseña Actual',
            new_password: 'Nueva Contraseña',
            confirm_password: 'Confirmar Contraseña',
            logout: 'Cerrar Sesión',
            portal_title: 'Portal S-park',
            welcome: 'Bienvenido',
            total_patients: 'Total Pacientes',
            high_risk: 'Riesgo Alto',
            tests_performed: 'Pruebas Realizadas',
            last_test: 'Última Prueba',
            recent_activity: 'Actividad Reciente',
            clinical_alerts: 'Alertas Clínicas',
            patient_directory: 'Directorio de Pacientes',
            register_patient: 'Registrar Paciente',
            search_placeholder: 'Buscar por nombre o ID...',
            filter: 'Filtrar',
            export: 'Exportar',
            risk_level: 'Nivel de Riesgo',
            actions: 'Acciones',
            view_detail: 'Ver Detalle',
            new_test: 'Nueva Prueba',
            edit: 'Editar',
            invalid_login: 'Correo o contraseña incorrectos.',
            email_required: 'El correo es obligatorio.',
            password_required: 'La contraseña es obligatoria.',
            field_required: 'Este campo es obligatorio.',
            register_new_patient: 'Registrar Nuevo Paciente',
            first_name: 'Nombre(s)',
            last_name: 'Apellidos',
            age: 'Edad',
            gender: 'Género',
            male: 'Masculino',
            female: 'Femenino',
            other: 'Otro',
            phone: 'Teléfono',
            email: 'Correo Electrónico',
            initial_diagnosis: 'Diagnóstico Inicial',
            cancel: 'Cancelar',
            save_patient: 'Guardar Paciente',
            edit_patient: 'Editar Paciente',
            delete: 'Eliminar',
            required_fields_msg: 'Por favor complete los campos obligatorios.'
        }
    };

    constructor() {
        // Sync with localStorage whenever signals change
        effect(() => {
            localStorage.setItem('darkMode', this.darkMode().toString());
            if (this.darkMode()) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });

        effect(() => {
            localStorage.setItem('language', this.language());
        });
    }

    toggleDarkMode() {
        this.darkMode.set(!this.darkMode());
    }

    setLanguage(lang: Language) {
        this.language.set(lang);
    }

    translate(key: string): string {
        return this.translations[this.language()][key] || key;
    }
}
