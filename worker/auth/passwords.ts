const ITERACIONES = 600_000
const LONGITUD_SAL = 16
const LONGITUD_HASH = 32

const encoder = new TextEncoder()

function aHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function deHex(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
    throw new Error('Formato hexadecimal inválido')
  }

  const bytes = new Uint8Array(hex.length / 2)

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

async function derivarClave(
  password: string,
  sal: Uint8Array,
  iteraciones: number,
): Promise<Uint8Array> {
  const clave = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: Uint8Array.from(sal),
      iterations: iteraciones,
      hash: 'SHA-256',
    },
    clave,
    LONGITUD_HASH * 8,
  )

  return new Uint8Array(bits)
}

export async function crearHashPassword(
  password: string,
): Promise<string> {
  const sal = crypto.getRandomValues(
    new Uint8Array(LONGITUD_SAL),
  )

  const hash = await derivarClave(password, sal, ITERACIONES)

  return `pbkdf2_sha256$${ITERACIONES}$${aHex(sal)}$${aHex(hash)}`
}

export async function verificarPassword(
  password: string,
  hashGuardado: string,
): Promise<boolean> {
  try {
    const partes = hashGuardado.split('$')

    if (partes.length !== 4 || partes[0] !== 'pbkdf2_sha256') {
      return false
    }

    const iteraciones = Number(partes[1])

    if (
      !Number.isInteger(iteraciones) ||
      iteraciones < 100_000 ||
      iteraciones > 1_000_000
    ) {
      return false
    }

    const sal = deHex(partes[2])
    const hashOriginal = deHex(partes[3])

    if (
      sal.length !== LONGITUD_SAL ||
      hashOriginal.length !== LONGITUD_HASH
    ) {
      return false
    }

    const hashCalculado = await derivarClave(
      password,
      sal,
      iteraciones,
    )

    let diferencia = 0

    for (let i = 0; i < LONGITUD_HASH; i++) {
      diferencia |= hashCalculado[i] ^ hashOriginal[i]
    }

    return diferencia === 0
  } catch {
    return false
  }
}
