import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent implements AfterViewInit, OnDestroy {

  private observer?: IntersectionObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Reveal feature cards and steps as they scroll into view. One
    // orchestrated entrance rather than scattered per-element effects —
    // each item just fades and lifts in once, then stays put.
    const targets = this.host.nativeElement.querySelectorAll('[data-reveal]');
    if (!targets.length || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });

    targets.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  readonly features = [
    {
      title: 'Full student ledger',
      body: 'Search, sort and page through every enrolled student with roll numbers, courses, marks and admission dates in one register.',
      icon: 'list'
    },
    {
      title: 'Instant records',
      body: 'Add, edit and remove student entries in seconds, with validation that keeps the ledger clean and accurate.',
      icon: 'bolt'
    },
    {
      title: 'Performance overview',
      body: 'A live dashboard breaks down enrolment by course, average marks and top performers at a glance.',
      icon: 'chart'
    },
    {
      title: 'Secured access',
      body: 'Every session is protected by token-based authentication, so only registered staff can view or edit records.',
      icon: 'shield'
    }
  ];

  readonly steps = [
    { n: '01', title: 'Create an account', body: 'Register with your name, email and a password to get staff access to the portal.' },
    { n: '02', title: 'Sign in', body: 'Log in to reach your dashboard, overview charts and the full student ledger.' },
    { n: '03', title: 'Manage records', body: 'Add new students, update marks, and keep the register current in real time.' }
  ];
}