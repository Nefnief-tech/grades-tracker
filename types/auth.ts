export interface User {
  id: string
  email: string
  name: string
  syncEnabled: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
}

