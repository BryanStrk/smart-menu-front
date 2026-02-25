import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../api/auth-service';
import { environment } from '../../environment/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  console.log('--- INTERCEPTOR DEBUG ---');
  console.log('URL de la petición:', req.url);
  console.log(
    'Token encontrado:',
    token ? 'SÍ (empieza por ' + token.substring(0, 10) + '...)' : 'NO HAY TOKEN',
  );

  if (!token) {
    console.warn('¡Ojo! No se está enviando token a:', req.url);
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};
