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
import { CookieService } from '../services/cookie.service'; // Ruta a tu servicio

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
  @ViewChild('rememberMe', { static: false }) rememberMeCheckbox!: ElementRef<HTMLInputElement>;

  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  isRightPanelActive = false;

  showCookieBanner = false;

  constructor(private fb: FormBuilder, private router: Router, private cookieService: CookieService) {
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
    this.checkSavedUser();
    
    // Mostrar banner de cookies si no hay consentimiento
    if (!this.cookieService.checkCookie('cookieConsent')) {
      setTimeout(() => {
        this.showCookieBanner = true;
        setTimeout(() => {
          document.querySelector('.cookie-banner')?.classList.add('show');
        }, 10);
      }, 2000);
    }
  }

  // Verificar usuario guardado
  checkSavedUser() {
    if (this.cookieService.checkCookie('rememberUser') && 
        this.cookieService.getCookie('rememberUser') === 'true') {
      const savedUsername = this.cookieService.getCookie('savedUsername');
      if (savedUsername) {
        this.loginForm.patchValue({ usuario: savedUsername });
        this.rememberMeCheckbox.nativeElement.checked = true;
      }
    }
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

      // Guardar usuario si el checkbox está marcado y cookies aceptadas
      if (this.cookieService.getCookie('cookieConsent') === 'accepted' && 
          this.rememberMeCheckbox.nativeElement.checked) {
        this.cookieService.setCookie('rememberUser', 'true', 30);
        this.cookieService.setCookie('savedUsername', usuario, 30);
      } else if (this.cookieService.getCookie('cookieConsent') === 'accepted') {
        // Si desmarcó recordar usuario
        this.cookieService.eraseCookie('rememberUser');
        this.cookieService.eraseCookie('savedUsername');
      }

      this.authenticateUser(usuario, contrasena)
        .then((redirectPath) => {
          if (redirectPath) {
            // Usar el Router de Angular en lugar de window.location.href
            this.router.navigate([redirectPath]);
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
          Arlec_Mohamed: { password: 'Arlec_Mohamed', redirect: '/jefe' },
          Larita_Garcia: { password: 'Larita_Garcia', redirect: '/tecnico' },
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
  
  // Manejar cookies
  acceptCookies() {
    this.cookieService.setCookie('cookieConsent', 'accepted', 365);
    this.showCookieBanner = false;
  }

  rejectCookies() {
    this.cookieService.setCookie('cookieConsent', 'rejected', 365);
    this.showCookieBanner = false;
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
