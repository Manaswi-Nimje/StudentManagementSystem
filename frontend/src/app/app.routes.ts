import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

// Every route below is lazy-loaded via loadComponent() instead of a static
// top-of-file import. With eager imports, Angular has to bundle every page
// (landing, login, dashboard, students, add-student, profile, users...)
// into the one JS chunk the browser downloads before it can render
// anything. Lazy loading splits each page into its own chunk that's only
// fetched the moment the user actually navigates there, so first paint
// only waits on the page they're actually looking at.
export const routes: Routes = [

  // Public front page of the portal.
  {
    path: '',
    loadComponent: () => import('./landing/landing').then(m => m.LandingComponent),
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },

  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },

  // Everything below requires a signed-in session.
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      // Land straight on the student ledger — it's the page staff need
      // most, and it's fully populated the moment it loads.
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./overview/overview').then(m => m.OverviewComponent) },
      { path: 'students', loadComponent: () => import('./studentlist/studentlist').then(m => m.StudentlistComponent) },
      { path: 'add-student', loadComponent: () => import('./addstudent/addstudent').then(m => m.AddstudentComponent) },
      { path: 'edit-student/:id', loadComponent: () => import('./addstudent/addstudent').then(m => m.AddstudentComponent) },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.UsersComponent)
      },
    ]
  },

  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  {
    path: 'profile/:id',
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }

];