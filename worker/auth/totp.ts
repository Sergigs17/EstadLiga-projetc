const PERIODO = 30
const DIGITOS = 6
const ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const encoder = new TextEncoder()

function hexABytes(hex: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error('Clave de cifrado no válida')
  }

  const bytes = new Uint8Array(32)

  for (let i = 0; i < 32; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

function bytesABase64(bytes: Uint8Array): string {
  let texto = ''

  for (const byte of bytes) {
    texto += String.fromCharCode(byte)
  }

  return btoa(texto)
}

function base64ABytes(texto: string): Uint8Array {
  const binario = atob(texto)
  const bytes = new Uint8Array(binario.length)

  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i)
  }

  return bytes
}

function bytesABase32(bytes: Uint8Array): string {
  let resultado = ''
  let acumulador = 0
  let bits = 0

  for (const byte of bytes) {
    acumulador = (acumulador << 8) | byte
    bits += 8

    while (bits >= 5) {
      bits -= 5
      resultado += ALFABETO_BASE32[
        (acumulador >>> bits) & 31
      ]
    }

    acumulador &= (1 << bits) - 1
  }

  if (bits > 0) {
    resultado += ALFABETO_BASE32[
      (acumulador << (5 - bits)) & 31
    ]
  }

  return resultado
}

function base32ABytes(texto: string): Uint8Array {
  const limpio = texto.toUpperCase().replace(/=+$/, '')
  const resultado: number[] = []

  let acumulador = 0
  let bits = 0

  for (const caracter of limpio) {
    const valor = ALFABETO_BASE32.indexOf(caracter)

    if (valor === -1) {
      throw new Error('Secreto TOTP no válido')
    }

    acumulador = (acumulador << 5) | valor
    bits += 5

    if (bits >= 8) {
      bits -= 8
      resultado.push((acumulador >>> bits) & 255)
      acumulador &= (1 << bits) - 1
    }
  }

  return new Uint8Array(resultado)
}

export function generarSecretoTOTP(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  return bytesABase32(bytes)
}

export function crearEnlaceTOTP(
  secreto: string,
  email: string,
): string {
  const emisor = 'EstadLiga'
  const cuenta = `${emisor}:${email}`

  const parametros = new URLSearchParams({
    secret: secreto,
    issuer: emisor,
    algorithm: 'SHA1',
    digits: String(DIGITOS),
    period: String(PERIODO),
  })

  return (
    `otpauth://totp/${encodeURIComponent(cuenta)}` +
    `?${parametros.toString()}`
  )
}

async function importarClaveCifrado(
  claveHex: string,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    Uint8Array.from(hexABytes(claveHex)),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function cifrarSecretoTOTP(
  secreto: string,
  claveHex: string,
): Promise<string> {
  const clave = await importarClaveCifrado(claveHex)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(iv) },
    clave,
    encoder.encode(secreto),
  )

  return (
    bytesABase64(iv) +
    '.' +
    bytesABase64(new Uint8Array(cifrado))
  )
}

export async function descifrarSecretoTOTP(
  secretoCifrado: string,
  claveHex: string,
): Promise<string> {
  const partes = secretoCifrado.split('.')

  if (partes.length !== 2) {
    throw new Error('Formato de secreto cifrado no válido')
  }

  const iv = base64ABytes(partes[0])
  const datos = base64ABytes(partes[1])

  if (iv.length !== 12) {
    throw new Error('IV de cifrado no válido')
  }

  const clave = await importarClaveCifrado(claveHex)

  const descifrado = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(iv) },
    clave,
    Uint8Array.from(datos),
  )

  return new TextDecoder().decode(descifrado)
}

async function calcularTOTP(
  secreto: string,
  contador: number,
): Promise<string> {
  const clave = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(base32ABytes(secreto)),
    {
      name: 'HMAC',
      hash: 'SHA-1',
    },
    false,
    ['sign'],
  )

  const mensaje = new ArrayBuffer(8)
  const vista = new DataView(mensaje)

  vista.setUint32(0, Math.floor(contador / 0x100000000))
  vista.setUint32(4, contador >>> 0)

  const firma = new Uint8Array(
    await crypto.subtle.sign('HMAC', clave, mensaje),
  )

  const offset = firma[firma.length - 1] & 15

  const numero = (
    ((firma[offset] & 0x7f) << 24) |
    ((firma[offset + 1] & 0xff) << 16) |
    ((firma[offset + 2] & 0xff) << 8) |
    (firma[offset + 3] & 0xff)
  ) >>> 0

  return String(numero % 1_000_000).padStart(6, '0')
}

export async function verificarCodigoTOTP(
  secreto: string,
  codigo: string,
  tiempoActual = Date.now(),
): Promise<boolean> {
  if (!/^\d{6}$/.test(codigo)) {
    return false
  }

  const contador = Math.floor(tiempoActual / 1000 / PERIODO)

  // Admitir una pequeña diferencia de reloj.
  for (const diferencia of [-1, 0, 1]) {
    const esperado = await calcularTOTP(
      secreto,
      contador + diferencia,
    )

    let distinto = 0

    for (let i = 0; i < DIGITOS; i++) {
      distinto |= esperado.charCodeAt(i) ^ codigo.charCodeAt(i)
    }

    if (distinto === 0) {
      return true
    }
  }

  return false
}


// Devuelve el intervalo temporal del código aceptado.
// Permite impedir la reutilización del mismo código TOTP.
export async function obtenerPasoTOTP(
  secreto: string,
  codigo: string,
  tiempoActual = Date.now(),
): Promise<number | null> {
  if (!/^\d{6}$/.test(codigo)) {
    return null
  }

  const pasoActual = Math.floor(tiempoActual / 1000 / PERIODO)

  for (const diferencia of [-1, 0, 1]) {
    const paso = pasoActual + diferencia

    if (paso < 0) continue

    const esperado = await calcularTOTP(secreto, paso)

    let diferenciaCodigo = 0

    for (let i = 0; i < DIGITOS; i++) {
      diferenciaCodigo |= esperado.charCodeAt(i) ^ codigo.charCodeAt(i)
    }

    if (diferenciaCodigo === 0) {
      return paso
    }
  }

  return null
}
