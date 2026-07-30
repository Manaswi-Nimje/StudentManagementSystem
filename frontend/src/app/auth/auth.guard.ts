import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Blocks access to the dashboard/profile routes unless a valid session
// token is present, redirecting to the login page (and remembering where
// the user was headed so we can send them back after they sign in).
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};

// Blocks the login/register pages once the user is already signed in,
// so they land straight back on the dashboard instead of seeing the form.
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};

// Frontend-side UX only — hides the /users route from non-admins so they
// don't land on a page that will just show "Admins only". The real
// enforcement is server-side (@PreAuthorize + the security filter chain on
// UserController); this guard never has to be trusted on its own.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
