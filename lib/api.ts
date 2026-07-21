import {
  clearCachedFirebaseToken,
  getCachedFirebaseToken,
  getSessionToken,
  refreshFirebaseTokenIfNeeded,
  setCachedFirebaseToken,
} from "@/lib/auth-token-manager";


type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";


type ApiOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
  cache?: RequestCache;
};



// =====================================================
// BACKEND URL
// =====================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.gansekou.com/api/v1";



// =====================================================
// ERROR
// =====================================================

export class ApiError extends Error {

  status:number;
  data:unknown;


  constructor(
    message:string,
    status:number,
    data:unknown=null
  ){

    super(message);

    this.name="ApiError";

    this.status=status;

    this.data=data;

  }

}



// =====================================================
// AUTH
// =====================================================

export function getAuthToken(){

  return getSessionToken();

}



export function setAuthToken(
  token:string
){

  setCachedFirebaseToken(token);

}



export function clearAuthToken(){

  clearCachedFirebaseToken();

}



// =====================================================
// DEBUG
// =====================================================

function authLog(
  message:string
){

  if(process.env.NODE_ENV !== "production"){

    console.info(message);

  }

}



// =====================================================
// TOKEN
// =====================================================

async function resolveAuthToken(
  explicitToken?:string|null
){

  if(explicitToken !== undefined){

    return explicitToken;

  }


  return getCachedFirebaseToken();

}



// =====================================================
// URL BUILDER CORRIGE
// =====================================================

function buildApiUrl(
  url:string
){


  // URL complète
  if(
    url.startsWith("http://") ||
    url.startsWith("https://")
  ){

    return url;

  }



  let path=url;



  /*
    Ton application garde :

    NEXT_PUBLIC_API_URL=
    https://api.gansekou.com/api/v1


    Donc si un service appelle :

    /api/v1/chat/start

    on supprime automatiquement
    le doublon.
  */


  path =
    path.replace(
      /^\/api\/v1/,
      ""
    );



  return `${API_BASE_URL}${path}`;

}



// =====================================================
// FETCH
// =====================================================

export async function apiFetch<T>(
  url:string,
  options:ApiOptions={}
):Promise<T>{


  const finalUrl =
    buildApiUrl(url);



  authLog(
    `[API] ${options.method || "GET"} ${finalUrl}`
  );



  const token =
    await resolveAuthToken(
      options.token
    );



  const requestInit:RequestInit={


    method:
      options.method || "GET",



    cache:
      options.cache || "no-store",



    headers:{


      Accept:
        "application/json",



      ...(options.body instanceof FormData
        ? {}
        :
        {
          "Content-Type":
            "application/json"
        }),



      ...(token
        ?
        {
          Authorization:
            `Bearer ${token}`
        }
        :
        {}),



      ...options.headers,


    },



    body:

      options.body instanceof FormData

      ?

      options.body

      :

      options.body

      ?

      JSON.stringify(options.body)

      :

      undefined,



  };





  let response =
    await fetch(
      finalUrl,
      requestInit
    );





  if(
    response.status===401 &&
    options.token===undefined
  ){


    authLog(
      "[auth] Refresh token Firebase"
    );



    const refreshedToken =
      await refreshFirebaseTokenIfNeeded(true);



    if(refreshedToken){


      const headers =
        new Headers(
          requestInit.headers
        );



      headers.set(
        "Authorization",
        `Bearer ${refreshedToken}`
      );



      response =
        await fetch(
          finalUrl,
          {
            ...requestInit,
            headers
          }
        );

    }

  }





  const contentType =
    response.headers.get(
      "content-type"
    );



  const data =
    contentType?.includes(
      "application/json"
    )

    ?

    await response.json()

    :

    await response.text();





  if(!response.ok){


    const message =
      typeof data==="object" &&
      data!==null &&
      "detail" in data

      ?

      String(
        (data as any).detail
      )

      :

      "Erreur serveur Gansekou.";



    throw new ApiError(
      message,
      response.status,
      data
    );

  }





  return data as T;

}





// =====================================================
// CLIENT
// =====================================================


export const api={



  get<T>(
    url:string
  ){

    return apiFetch<T>(
      url,
      {
        method:"GET"
      }
    );

  },



  post<T>(
    url:string,
    body?:unknown
  ){

    return apiFetch<T>(
      url,
      {
        method:"POST",
        body
      }
    );

  },



  put<T>(
    url:string,
    body?:unknown
  ){

    return apiFetch<T>(
      url,
      {
        method:"PUT",
        body
      }
    );

  },



  patch<T>(
    url:string,
    body?:unknown
  ){

    return apiFetch<T>(
      url,
      {
        method:"PATCH",
        body
      }
    );

  },



  delete<T>(
    url:string
  ){

    return apiFetch<T>(
      url,
      {
        method:"DELETE"
      }
    );

  },


};
