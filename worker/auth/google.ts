import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
} from 'jose'

// Claves públicas oficiales utilizadas por Google para firmar tokens.
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

const GOOGLE_ISSUERS = [
  'https://accounts.google.com',
  'accounts.google.com',
]

interface GooglePayload extends JWTPayload {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

export interface IdentidadGoogle {
  googleId: string
  email: string
  nombre: string
  imagen?: string
}

export async function verificarTokenGoogle(
  token: string,
  clientId: string,
): Promise<IdentidadGoogle> {
  if (!clientId || !token || token.length > 8192) {
    throw new Error('Token de Google no válido')
  }

  // Verifica la firma, el emisor, la audiencia y la caducidad.
  const { payload } = await jwtVerify(
    token,
    GOOGLE_JWKS,
    {
      issuer: GOOGLE_ISSUERS,
      audience: clientId,
      algorithms: ['RS256'],
      clockTolerance: 30,
    },
  )

  const datos = payload as GooglePayload

  if (
    typeof datos.sub !== 'string' ||
    !datos.sub ||
    typeof datos.email !== 'string' ||
    datos.email_verified !== true
  ) {
    throw new Error('Identidad de Google no verificada')
  }

  const email = datos.email.trim().toLowerCase()

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error('Correo de Google no válido')
  }

  const nombre =
    typeof datos.name === 'string' && datos.name.trim()
      ? datos.name.trim().slice(0, 50)
      : email.split('@')[0].slice(0, 50)

  return {
    googleId: datos.sub,
    email,
    nombre,
    imagen:
      typeof datos.picture === 'string'
        ? datos.picture
        : undefined,
  }
}
