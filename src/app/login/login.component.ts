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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('overlayBtn') overlayBtn!: ElementRef;

  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  isRightPanelActive = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      cargo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngAfterViewInit() {
    this.setupOverlayToggle();
  }

  setupOverlayToggle() {
    if (this.overlayBtn) {
      this.overlayBtn.nativeElement.addEventListener('click', () => {
        this.togglePanel();
      });
    }
  }

  togglePanel() {
    this.isRightPanelActive = !this.isRightPanelActive;

    if (this.container) {
      this.container.nativeElement.classList.toggle('right-panel-active');
    }

    // Animación del botón
    if (this.overlayBtn) {
      this.overlayBtn.nativeElement.classList.add('btnScaled');
      setTimeout(() => {
        this.overlayBtn.nativeElement.classList.remove('btnScaled');
      }, 600);
    }

    // Limpiar mensajes de error al cambiar de panel
    this.errorMessage = '';
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { usuario, contrasena } = this.loginForm.value;

      this.authenticateUser(usuario, contrasena)
        .then((redirectPath) => {
          if (redirectPath) {
            // En un proyecto real, aquí usarías el Router de Angular
            window.location.href = redirectPath;
          }
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });
    } else {
      this.errorMessage = 'Por favor complete todos los campos';
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      console.log('Datos de registro:', formData);
      // Aquí implementarías la lógica de registro
      alert('Solicitud de cuenta enviada correctamente');
      this.registerForm.reset();
    } else {
      this.errorMessage = 'Por favor complete todos los campos correctamente';
    }
  }

  private authenticateUser(
    username: string,
    password: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const validCredentials: {
          [key: string]: { password: string; redirect: string };
        } = {
          Arlec_Mohamed: { password: 'Arlec_Mohamed', redirect: 'jefe.html' },
          Larita_Garcia: {
            password: 'Larita_Garcia',
            redirect: 'tecnico.html',
          },
        };

        if (
          validCredentials[username] &&
          validCredentials[username].password === password
        ) {
          resolve(validCredentials[username].redirect);
        } else {
          reject(new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
        }
      }, 500);
    });
  }

  // Métodos para manejar el focus de los inputs
  onInputFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    const label = input.nextElementSibling as HTMLElement;
    if (label) {
      label.style.width = '100%';
    }
  }

  onInputBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const label = input.nextElementSibling as HTMLElement;
    if (label && !input.value) {
      label.style.width = '0%';
    }
  }
}
