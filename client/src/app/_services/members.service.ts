import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  // private accountService = inject(AccountService);
  baseUrl = environment.apiUrl;
  // members = signal<Member[]>([]);
  paginatedResult = signal< PaginatedResult< Member[] > | null >(null);
  memberCache = new Map();

  private setPagintionHeaders(pageNumber: number, pageSize: number){

    let params = new HttpParams();

    if(pageNumber && pageSize) {
      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);
    }

    return params;
  }

  private setPaginationResponse(response: HttpResponse<Member[]>)
  {
    this.paginatedResult.set({
      items: response.body as Member[],
      pagination: JSON.parse(response.headers.get('Pagination')!)
    })
  }

  getMembers(UserParams: UserParams){

    const response = this.memberCache.get(Object.values(UserParams).join('_'));

    if(response)
      return this.setPaginationResponse(response);

    let params = this.setPagintionHeaders(UserParams.pageNumber, UserParams.pageSize);

    params = params.append('minAge', UserParams.minAge);
    params = params.append('maxAge', UserParams.maxAge);
    params = params.append('gender', UserParams.gender);
    params = params.append('orderBy', UserParams.orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: "response", params}).subscribe({
      next: response => {
        this.setPaginationResponse(response);
        this.memberCache.set(Object.values(UserParams).join('_'), response);
      }
    })
  }

  getMember(username: string){

    // const member = this.members().find(x => x.userName === username);
    // if(member !== undefined)
    //     return of(member);

    const member : Member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.body), [])
      .find((m: Member) => m.userName === username);

    if(member)
      return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  // getHttpOptions(){
  //   return{
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.accountService.currentUser()?.token}`
  //     })
  //   }
  // }

  updateMember(member: Member)
  {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => m.userName === member.userName
      //     ? member : m))
      // })
    )
  }

  setMainPhoto(photo: Photo)
  {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if(m.photos.includes(photo))
      //     {
      //       m.photoUrl = photo.url
      //     }
      //     return m;
      //   }))
      // })
    )
  }

  deletePhoto(photo: Photo)
  {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if(m.photos.includes(photo))
      //     {
      //       m.photos = m.photos.filter(x => x.id === photo.id)
      //     }
      //     return m;
      //   }))
      // })
    )
  }
}
