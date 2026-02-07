export function login(
  email: string,
  password: string
): Promise<{ user?: any; error?: any }>

export function logout(): Promise<{ success?: true; error?: any }>

declare const _default: {
  login: typeof login
  logout: typeof logout
}

export default _default
