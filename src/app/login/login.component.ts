// ============================================================================
// IMPORTACIONES DE ANGULAR Y DEPENDENCIAS
// ============================================================================

import {
  Component,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

// ============================================================================
// CONFIGURACIÓN DEL COMPONENTE
// ============================================================================

/**
 * COMPONENTE DE LOGIN Y REGISTRO
 *
 * Este componente maneja la autenticación de usuarios en el sistema ForestTrack.
 * Proporciona dos formularios: uno para login y otro para solicitar una nueva cuenta.
 *
 * Características principales:
 * - Formularios reactivos con validación
 * - Animaciones CSS para transiciones entre formularios
 * - Autenticación con credenciales predefinidas
 * - Redirección automática según el tipo de usuario
 * - Efectos visuales en los campos de entrada
 */
@Component({
  selector: 'app-login', // Selector para usar el componente
  standalone: true, // Componente independiente (Angular 14+)
  imports: [CommonModule, ReactiveFormsModule], // Módulos necesarios
  templateUrl: './login.component.html', // Archivo de template
  styleUrls: ['./login.component.css'], // Archivo de estilos
})
export class LoginComponent implements AfterViewInit {
  // ============================================================================
  // REFERENCIAS A ELEMENTOS DEL DOM
  // ============================================================================

  /**
   * REFERENCIA AL CONTENEDOR PRINCIPAL
   * - Permite manipular la clase CSS para animaciones
   * - Controla el estado visual del componente (login/registro)
   */
  @ViewChild('container') container!: ElementRef;

  /**
   * REFERENCIA AL BOTÓN DE OVERLAY
   * - Elemento oculto que controla las transiciones
   * - Maneja las animaciones de escala del botón
   */
  @ViewChild('overlayBtn') overlayBtn!: ElementRef;

  // ============================================================================
  // PROPIEDADES DEL COMPONENTE
  // ============================================================================

  /**
   * FORMULARIO DE INICIO DE SESIÓN
   * - FormGroup reactivo para manejar datos de login
   * - Incluye validaciones para usuario y contraseña
   */
  loginForm: FormGroup;

  /**
   * FORMULARIO DE REGISTRO
   * - FormGroup reactivo para solicitar nueva cuenta
   * - Incluye validaciones para nombre, cargo y email
   */
  registerForm: FormGroup;

  /**
   * MENSAJE DE ERROR
   * - String que almacena mensajes de error para mostrar al usuario
   * - Se limpia automáticamente al cambiar de panel
   */
  errorMessage = '';

  /**
   * ESTADO DEL PANEL ACTIVO
   * - Boolean que indica si el panel de registro está activo
   * - Controla qué formulario se muestra al usuario
   */
  isRightPanelActive = false;

  // ============================================================================
  // CONSTRUCTOR - INICIALIZACIÓN DE FORMULARIOS
  // ============================================================================

  /**
   * CONSTRUCTOR DEL COMPONENTE
   *
   * Inicializa los formularios reactivos con sus respectivas validaciones.
   * Inyecta las dependencias necesarias (FormBuilder y Router).
   *
   * @param fb - FormBuilder para crear formularios reactivos
   * @param router - Router para navegación entre rutas
   */
  constructor(private fb: FormBuilder, private router: Router) {
    /**
     * CONFIGURACIÓN DEL FORMULARIO DE LOGIN
     * - Campo usuario: requerido
     * - Campo contraseña: requerido
     */
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
    });

    /**
     * CONFIGURACIÓN DEL FORMULARIO DE REGISTRO
     * - Campo nombre: requerido
     * - Campo cargo: requerido
     * - Campo email: requerido + validación de formato email
     */
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      cargo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // ============================================================================
  // CICLO DE VIDA DEL COMPONENTE
  // ============================================================================

  /**
   * HOOK AFTER VIEW INIT
   *
   * Se ejecuta después de que Angular inicializa las vistas del componente.
   * Es el momento ideal para configurar event listeners en elementos del DOM.
   */
  ngAfterViewInit() {
    this.setupOverlayToggle();
  }

  // ============================================================================
  // MÉTODOS DE CONFIGURACIÓN DE UI
  // ============================================================================

  /**
   * CONFIGURACIÓN DEL TOGGLE DEL OVERLAY
   *
   * Configura el event listener para el botón oculto del overlay.
   * Este botón controla las transiciones entre formularios.
   *
   * Funcionalidad:
   * - Añade event listener de click al botón overlay
   * - Ejecuta togglePanel() cuando se hace click
   */
  setupOverlayToggle() {
    if (this.overlayBtn) {
      this.overlayBtn.nativeElement.addEventListener('click', () => {
        this.togglePanel();
      });
    }
  }

  /**
   * ALTERNAR ENTRE PANELES (LOGIN/REGISTRO)
   *
   * Función principal que maneja el cambio entre formularios.
   * Controla las animaciones y el estado visual del componente.
   *
   * Funcionalidades:
   * 1. Cambia el estado del panel activo
   * 2. Añade/quita la clase CSS para animaciones
   * 3. Ejecuta animación de escala del botón
   * 4. Limpia mensajes de error
   */
  togglePanel() {
    // Cambiar estado del panel
    this.isRightPanelActive = !this.isRightPanelActive;

    // Aplicar/quitar clase CSS para animaciones
    if (this.container) {
      this.container.nativeElement.classList.toggle('right-panel-active');
    }

    // Animación del botón overlay
    if (this.overlayBtn) {
      // Añadir clase de animación
      this.overlayBtn.nativeElement.classList.add('btnScaled');

      // Remover clase después de 600ms (duración de la animación)
      setTimeout(() => {
        this.overlayBtn.nativeElement.classList.remove('btnScaled');
      }, 600);
    }

    // Limpiar mensajes de error al cambiar de panel
    this.errorMessage = '';
  }

  // ============================================================================
  // MÉTODOS DE MANEJO DE FORMULARIOS
  // ============================================================================

  /**
   * PROCESAR ENVÍO DEL FORMULARIO DE LOGIN
   *
   * Maneja la lógica de autenticación cuando el usuario envía el formulario.
   * Valida credenciales y redirige según el tipo de usuario.
   *
   * Flujo de ejecución:
   * 1. Valida que el formulario esté completo
   * 2. Extrae credenciales del formulario
   * 3. Llama al método de autenticación
   * 4. Redirige si es exitoso o muestra error
   */
  onLoginSubmit() {
    if (this.loginForm.valid) {
      // Extraer datos del formulario
      const { usuario, contrasena } = this.loginForm.value;

      // Intentar autenticación
      this.authenticateUser(usuario, contrasena)
        .then((redirectPath) => {
          if (redirectPath) {
            // Navegación usando Angular Router (mejor práctica que window.location)
            this.router.navigate([redirectPath]);
          }
        })
        .catch((error) => {
          // Mostrar mensaje de error al usuario
          this.errorMessage = error.message;
        });
    } else {
      // Error de validación del formulario
      this.errorMessage = 'Por favor complete todos los campos';
    }
  }

  /**
   * PROCESAR ENVÍO DEL FORMULARIO DE REGISTRO
   *
   * Maneja la solicitud de nueva cuenta cuando el usuario envía el formulario.
   * Actualmente simula el envío, pero puede conectarse a un backend real.
   *
   * Funcionalidades:
   * 1. Valida que todos los campos estén completos
   * 2. Procesa los datos del formulario
   * 3. Muestra confirmación al usuario
   * 4. Resetea el formulario
   */
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      // Obtener datos del formulario
      const formData = this.registerForm.value;

      // Log para debugging (remover en producción)
      console.log('Datos de registro:', formData);

      // TODO: Aquí implementarías la lógica de registro real
      // Ejemplo: this.userService.requestAccount(formData)

      // Confirmación al usuario
      alert('Solicitud de cuenta enviada correctamente');

      // Limpiar formulario
      this.registerForm.reset();
    } else {
      // Error de validación
      this.errorMessage = 'Por favor complete todos los campos correctamente';
    }
  }

  // ============================================================================
  // MÉTODOS DE AUTENTICACIÓN
  // ============================================================================

  /**
   * AUTENTICAR USUARIO
   *
   * Método privado que simula la autenticación de usuarios.
   * En un entorno real, esto se conectaría a un servicio de backend.
   *
   * @param username - Nombre de usuario ingresado
   * @param password - Contraseña ingresada
   * @returns Promise<string> - Ruta de redirección si es exitoso
   *
   * Usuarios predefinidos:
   * - Arlec_Mohamed: Jefe de brigada (redirige a /jefe)
   * - Larita_Garcia: Técnico de suelos (redirige a /tecnico)
   */
  private authenticateUser(
    username: string,
    password: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simular delay de red (500ms)
      setTimeout(() => {
        /**
         * CREDENCIALES VÁLIDAS DEL SISTEMA
         *
         * Objeto que define usuarios válidos y sus rutas de redirección.
         * En producción, esto vendría de una base de datos o servicio de autenticación.
         */
        const validCredentials: {
          [key: string]: { password: string; redirect: string };
        } = {
          Arlec_Mohamed: {
            password: 'Arlec_Mohamed',
            redirect: '/jefe',
          },
          Larita_Garcia: {
            password: 'Larita_Garcia',
            redirect: '/tecnico',
          },
        };

        // Verificar credenciales
        if (
          validCredentials[username] &&
          validCredentials[username].password === password
        ) {
          // Autenticación exitosa - devolver ruta de redirección
          resolve(validCredentials[username].redirect);
        } else {
          // Credenciales incorrectas - rechazar con error
          reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
        }
      }, 500); // Delay de 500ms para simular llamada al servidor
    });
  }

  // ============================================================================
  // MÉTODOS DE EFECTOS VISUALES EN INPUTS
  // ============================================================================

  /**
   * MANEJAR FOCUS EN INPUTS
   *
   * Se ejecuta cuando un campo de entrada recibe el foco.
   * Activa la animación de la línea verde debajo del input.
   *
   * @param event - Evento de focus del input
   *
   * Funcionalidad:
   * 1. Obtiene referencia al input que recibió focus
   * 2. Encuentra el elemento label hermano (línea animada)
   * 3. Expande la línea al 100% del ancho
   */
  onInputFocus(event: Event) {
    // Obtener el input que disparó el evento
    const input = event.target as HTMLInputElement;

    // Obtener el elemento label siguiente (línea animada)
    const label = input.nextElementSibling as HTMLElement;

    if (label) {
      // Expandir la línea al 100% (efecto visual de focus)
      label.style.width = '100%';
    }
  }

  /**
   * MANEJAR BLUR EN INPUTS
   *
   * Se ejecuta cuando un campo de entrada pierde el foco.
   * Contrae la animación de la línea si el campo está vacío.
   *
   * @param event - Evento de blur del input
   *
   * Funcionalidad:
   * 1. Obtiene referencia al input que perdió focus
   * 2. Encuentra el elemento label hermano (línea animada)
   * 3. Si el input está vacío, contrae la línea a 0%
   * 4. Si tiene contenido, mantiene la línea visible
   */
  onInputBlur(event: Event) {
    // Obtener el input que disparó el evento
    const input = event.target as HTMLInputElement;

    // Obtener el elemento label siguiente (línea animada)
    const label = input.nextElementSibling as HTMLElement;

    // Solo contraer la línea si el input está vacío
    if (label && !input.value) {
      // Contraer la línea a 0% (efecto visual de blur sin contenido)
      label.style.width = '0%';
    }
    // Si input.value tiene contenido, la línea permanece visible
  }
}
