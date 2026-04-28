import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserProgressService } from '../services/user-progress.service';

export const onboardingGuard: CanActivateFn = () => {
  const progress = inject(UserProgressService);
  const router = inject(Router);

  if (progress.onboardingCompleted()) {
    return true;
  }
  return router.createUrlTree(['/onboarding']);
};
