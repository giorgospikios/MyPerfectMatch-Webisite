import { HttpInterceptorFn } from '@angular/common/http';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const accountService = inject(AccountService);

  if(accountService.currentUser()){
    req = req.clone({
      setHeaders:{
        Authorization: `Bearer ${accountService.currentUser()?.token}`
      }
    })
  }

  // console.log('Outgoing request:', req.method, 'this is the url',req.url, '\nthis is the body',req.body,'\n', 'this is the headers',req.headers,'\n', 'this is the context',req.context, 'this is the params',req.params, 'this is the responsetype',req.responseType);

  return next(req);
};
