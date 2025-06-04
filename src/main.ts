import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]),
    provideAnimations(),
    provideHttpClient(),
    FormBuilder,
  ],
}).catch((err) => console.error(err));
