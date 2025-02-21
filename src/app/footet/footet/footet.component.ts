import { Component } from '@angular/core';

@Component({
  selector: 'app-footet',
  standalone: false,
  templateUrl: './footet.component.html',
  styleUrl: './footet.component.css'
})
export class FootetComponent {
  showModal = false;
  
  copyEmail() {
    navigator.clipboard.writeText('mecg1994@gmail.com')
      .then(() => {
        alert('Email copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar el email:', err);
      });
  }
}
