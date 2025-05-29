import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  logoUrl = 'assets/logo.png';
  backgroundUrl = 'assets/Bosque.jpg';

  isRightPanelActive: boolean = false;
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  togglePanel(): void {
    this.isRightPanelActive = !this.isRightPanelActive;
  }

  login(): void {
    if (this.username === 'admin' && this.password === '1234') {
      this.errorMessage = '';
      console.log('Login exitoso');
    } else {
      this.errorMessage = 'Credenciales incorrectas';
    }
  }
}