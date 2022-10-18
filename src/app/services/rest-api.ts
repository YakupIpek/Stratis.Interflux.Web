import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export class RestApi {
  protected API_URL: string;

  constructor(
    protected httpClient: HttpClient,
    apiUrl: string) {
    this.API_URL =  apiUrl;
  }

  protected getHttpOptions(
    accept: string,
    contentType: string,
    httpParams?: HttpParams,
  ): {
      headers?: HttpHeaders | {
        [header: string]: string | string[];
      };
      params?: HttpParams | {
        [param: string]: string | string[];
      };
    } {
    return {
      headers: new HttpHeaders({
        'Accept': accept,
        'Content-Type': contentType,

      }),
      params: httpParams
    };
  }

  public get<TResult>(path: string, accept = 'application/json', contentType?: string, params?: HttpParams): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType || 'application/json', params);

    return this.httpClient.get(`${this.API_URL}/${path}`, options) as Observable<TResult>;
  }

  public delete<TResult>(path: string, accept = 'application/json', contentType?: string, params?: HttpParams): Observable<TResult> {
    const options = this.getHttpOptions(accept, contentType || 'application/json', params);

    return this.httpClient.delete(`${this.API_URL}/${path}`, options) as Observable<TResult>;
  }

  public post<TResult>(path: string, body: any, contentType?: string, params?: HttpParams): Observable<TResult> {
    const options = this.getHttpOptions('application/json', contentType || 'application/json', params);

    return this.httpClient.post(`${this.API_URL}/${path}`, body, options) as Observable<TResult>;
  }

  public put<TResult>(path: string, body: any, contentType?: string, params?: HttpParams): Observable<TResult> {
    const options = this.getHttpOptions('application/json', contentType || 'application/json', params);

    return this.httpClient.put(`${this.API_URL}/${path}`, body, options) as Observable<TResult>;
  }
}
