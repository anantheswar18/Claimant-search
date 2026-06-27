import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Heade } from './heade/heade';
import { Main } from './main/main';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,Heade,Main,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inastoo');
}
