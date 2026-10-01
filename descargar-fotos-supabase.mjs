import fs from "fs";
import path from "path";

// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

// ============================================================
// CONFIGURACIÓN
// ============================================================

const BUCKET = "eventos-fotos";

const CARPETA_SALIDA = path.resolve(
  "./fotos-the-game-archive"
);

const LIMITE_POR_PAGINA = 1000;

// ============================================================
// VALIDACIÓN
// ============================================================

if (!SUPABASE_URL) {
  console.error("");
  console.error(
    "❌ Falta NEXT_PUBLIC_SUPABASE_URL en .env.local"
  );
  console.error("");
  process.exit(1);
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error("");
  console.error(
    "❌ Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local"
  );
  console.error("");
  process.exit(1);
}

if (!SUPABASE_SECRET_KEY) {
  console.error("");
  console.error(
    "❌ Falta SUPABASE_SECRET_KEY en .env.local"
  );
  console.error("");
  process.exit(1);
}

// ============================================================
// HEADERS
// ============================================================

const HEADERS = {
  apikey: SUPABASE_SECRET_KEY,
};

const JSON_HEADERS = {
  apikey: SUPABASE_SECRET_KEY,
  "Content-Type": "application/json",
};

// ============================================================
// ESTADÍSTICAS
// ============================================================

const estadisticas = {
  archivos: 0,
  bytes: 0,
  errores: 0,
  sinClasificar: 0,
  carpetas: 0,
  archivosConError: [],
};

// ============================================================
// FORMATEAR TAMAÑO
// ============================================================

function formatearBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${(
    bytes /
    1024 /
    1024 /
    1024
  ).toFixed(2)} GB`;
}

// ============================================================
// NORMALIZAR NOMBRE
// ============================================================

function normalizarNombre(nombre) {
  return String(nombre)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// OBTENER EVENTOS
// ============================================================

async function obtenerEventos() {
  const url =
    `${SUPABASE_URL}/rest/v1/eventos` +
    `?select=id,nombre,slug`;

  const response = await fetch(url, {
    headers: HEADERS,
  });

  if (!response.ok) {
    const texto =
      await response.text();

    throw new Error(
      `Error obteniendo eventos: ${response.status} ${texto}`
    );
  }

  return await response.json();
}

// ============================================================
// OBTENER EDICIONES
// ============================================================

async function obtenerEdiciones() {
  const url =
    `${SUPABASE_URL}/rest/v1/ediciones` +
    `?select=id,evento_id,a%C3%B1o`;

  const response = await fetch(url, {
    headers: HEADERS,
  });

  if (!response.ok) {
    const texto =
      await response.text();

    throw new Error(
      `Error obteniendo ediciones: ${response.status} ${texto}`
    );
  }

  return await response.json();
}

// ============================================================
// CREAR MAPA EDICIÓN -> EVENTO/AÑO
// ============================================================

async function crearMapaEdiciones() {
  console.log(
    "🔎 Consultando eventos..."
  );

  const eventos =
    await obtenerEventos();

  console.log(
    `   ✅ ${eventos.length} eventos encontrados`
  );

  console.log(
    "🔎 Consultando ediciones..."
  );

  const ediciones =
    await obtenerEdiciones();

  console.log(
    `   ✅ ${ediciones.length} ediciones encontradas`
  );

  const eventosPorId =
    new Map();

  for (const evento of eventos) {
    eventosPorId.set(
      String(evento.id),
      evento
    );
  }

  const mapa =
    new Map();

  for (const edicion of ediciones) {
    const evento =
      eventosPorId.get(
        String(edicion.evento_id)
      );

    if (!evento) {
      continue;
    }

    const slug =
      evento.slug ||
      normalizarNombre(
        evento.nombre
      );

    const año =
      String(edicion.año);

    mapa.set(
      String(edicion.id),
      {
        eventoId: evento.id,
        eventoNombre: evento.nombre,
        slug,
        año,
      }
    );
  }

  return mapa;
}

// ============================================================
// LISTAR UNA PÁGINA DEL STORAGE
// ============================================================

async function listarPagina(
  carpeta = "",
  offset = 0
) {
  const url =
    `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`;

  const response = await fetch(url, {
    method: "POST",

    headers: JSON_HEADERS,

    body: JSON.stringify({
      prefix: carpeta,

      limit: LIMITE_POR_PAGINA,

      offset,

      sortBy: {
        column: "name",
        order: "asc",
      },
    }),
  });

  if (!response.ok) {
    const texto =
      await response.text();

    throw new Error(
      `Error listando "${carpeta}": ${response.status} ${texto}`
    );
  }

  return await response.json();
}

// ============================================================
// LISTAR TODA UNA CARPETA
// ============================================================

async function listarCarpeta(
  carpeta = ""
) {
  const todos = [];

  let offset = 0;

  while (true) {
    const elementos =
      await listarPagina(
        carpeta,
        offset
      );

    todos.push(
      ...elementos
    );

    if (
      elementos.length <
      LIMITE_POR_PAGINA
    ) {
      break;
    }

    offset +=
      LIMITE_POR_PAGINA;
  }

  return todos;
}

// ============================================================
// DETERMINAR DESTINO
// ============================================================
//
// En tu estructura de Supabase las fotos de las galerías
// están guardadas usando el edicion_id como primera carpeta.
//
// Ejemplo:
//
// 123/foto.jpg
//
// Si la edición 123 corresponde a Winterween 2024:
//
// winterween/2024/foto.jpg
//
// ============================================================

function obtenerDestino(
  ruta,
  mapaEdiciones
) {
  const partes =
    ruta.split("/");

  const primerElemento =
    partes[0];

  const edicion =
    mapaEdiciones.get(
      String(primerElemento)
    );

  if (!edicion) {
    return {
      clasificado: false,

      rutaDestino: path.join(
        "sin-clasificar",
        ruta
      ),
    };
  }

  const resto =
    partes.slice(1);

  const carpetaEvento =
    normalizarNombre(
      edicion.slug ||
      edicion.eventoNombre
    );

  const carpetaAño =
    String(edicion.año);

  return {
    clasificado: true,

    rutaDestino: path.join(
      carpetaEvento,
      carpetaAño,
      ...resto
    ),
  };
}

// ============================================================
// DESCARGAR ARCHIVO
// ============================================================

async function descargarArchivo(
  ruta,
  rutaDestino
) {
  const rutaCodificada =
    ruta
      .split("/")
      .map((parte) =>
        encodeURIComponent(parte)
      )
      .join("/");

  const url =
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${rutaCodificada}`;

  const response = await fetch(url, {
    headers: HEADERS,
  });

  if (!response.ok) {
    const texto =
      await response.text();

    throw new Error(
      `Error descargando "${ruta}": ${response.status} ${texto}`
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );

  const destino =
    path.join(
      CARPETA_SALIDA,
      rutaDestino
    );

  fs.mkdirSync(
    path.dirname(destino),
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    destino,
    buffer
  );

  return buffer.length;
}

// ============================================================
// RECORRER STORAGE
// ============================================================

async function recorrerCarpeta(
  carpeta,
  mapaEdiciones
) {
  const elementos =
    await listarCarpeta(
      carpeta
    );

  for (
    const elemento
    of elementos
  ) {
    const rutaActual =
      carpeta
        ? `${carpeta}/${elemento.name}`
        : elemento.name;

    // --------------------------------------------------------
    // CARPETA
    // --------------------------------------------------------

    if (
      elemento.id === null
    ) {
      estadisticas.carpetas++;

      console.log("");
      console.log(
        `📁 ${rutaActual}`
      );

      await recorrerCarpeta(
        rutaActual,
        mapaEdiciones
      );

      continue;
    }

    // --------------------------------------------------------
    // ARCHIVO
    // --------------------------------------------------------

    const destino =
      obtenerDestino(
        rutaActual,
        mapaEdiciones
      );

    if (
      !destino.clasificado
    ) {
      estadisticas.sinClasificar++;

      console.log(
        `⚠️  Sin edición: ${rutaActual}`
      );
    } else {
      console.log(
        `⬇️  ${rutaActual}`
      );

      console.log(
        `   → ${destino.rutaDestino}`
      );
    }

    try {
      const bytes =
        await descargarArchivo(
          rutaActual,
          destino.rutaDestino
        );

      estadisticas.archivos++;
      estadisticas.bytes +=
        bytes;

      console.log(
        `   ✅ ${formatearBytes(bytes)}`
      );

    } catch (error) {
      estadisticas.errores++;

      estadisticas.archivosConError.push(
        rutaActual
      );

      console.error(
        `   ❌ ${error.message}`
      );
    }
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.clear();

  console.log(
    "================================================"
  );

  console.log(
    "             THE GAME ARCHIVE"
  );

  console.log(
    "       DESCARGA DE FOTOS SUPABASE"
  );

  console.log(
    "================================================"
  );

  console.log("");

  console.log(
    `🌐 Supabase: ${SUPABASE_URL}`
  );

  console.log(
    `🗂️  Bucket: ${BUCKET}`
  );

  console.log(
    `📁 Destino: ${CARPETA_SALIDA}`
  );

  console.log("");

  console.log(
    "🔐 Secret Key detectada."
  );

  console.log("");

  // ----------------------------------------------------------
  // CREAR MAPA
  // ----------------------------------------------------------

  const mapaEdiciones =
    await crearMapaEdiciones();

  console.log("");

  console.log(
    `🗺️  Ediciones mapeadas: ${mapaEdiciones.size}`
  );

  console.log("");

  // ----------------------------------------------------------
  // MOSTRAR ALGUNAS RELACIONES
  // ----------------------------------------------------------

  console.log(
    "📚 Ejemplos de organización:"
  );

  let ejemplos = 0;

  for (
    const [
      edicionId,
      edicion
    ]
    of mapaEdiciones
  ) {
    console.log(
      `   ${edicionId} → ${edicion.slug}/${edicion.año}`
    );

    ejemplos++;

    if (ejemplos >= 10) {
      break;
    }
  }

  console.log("");

  // ----------------------------------------------------------
  // CREAR CARPETA
  // ----------------------------------------------------------

  fs.mkdirSync(
    CARPETA_SALIDA,
    {
      recursive: true,
    }
  );

  const inicio =
    Date.now();

  // ----------------------------------------------------------
  // DESCARGAR
  // ----------------------------------------------------------

  try {
    console.log(
      "🚀 Comenzando descarga..."
    );

    console.log("");

    await recorrerCarpeta(
      "",
      mapaEdiciones
    );

    // --------------------------------------------------------
    // RESULTADOS
    // --------------------------------------------------------

    const segundos =
      (
        (Date.now() - inicio) /
        1000
      ).toFixed(1);

    console.log("");

    console.log(
      "================================================"
    );

    console.log(
      "             DESCARGA TERMINADA"
    );

    console.log(
      "================================================"
    );

    console.log("");

    console.log(
      `📸 Archivos descargados: ${estadisticas.archivos}`
    );

    console.log(
      `💾 Tamaño total: ${formatearBytes(
        estadisticas.bytes
      )}`
    );

    console.log(
      `📁 Carpetas encontradas: ${estadisticas.carpetas}`
    );

    console.log(
      `⚠️  Sin clasificar: ${estadisticas.sinClasificar}`
    );

    console.log(
      `❌ Errores: ${estadisticas.errores}`
    );

    console.log(
      `⏱️  Tiempo: ${segundos} segundos`
    );

    console.log("");

    console.log(
      "📂 Fotos guardadas en:"
    );

    console.log(
      CARPETA_SALIDA
    );

    console.log("");

    // --------------------------------------------------------
    // ERRORES
    // --------------------------------------------------------

    if (
      estadisticas.errores >
      0
    ) {
      console.log(
        "Archivos con error:"
      );

      console.log("");

      for (
        const archivo
        of estadisticas.archivosConError
      ) {
        console.log(
          `   ❌ ${archivo}`
        );
      }

      console.log("");
    }

    // --------------------------------------------------------
    // SIN CLASIFICAR
    // --------------------------------------------------------

    if (
      estadisticas.sinClasificar >
      0
    ) {
      console.log(
        "⚠️ Algunas fotos no estaban asociadas"
      );

      console.log(
        "a una edición reconocida y fueron"
      );

      console.log(
        "guardadas en:"
      );

      console.log(
        path.join(
          CARPETA_SALIDA,
          "sin-clasificar"
        )
      );

      console.log("");
    }

    if (
      estadisticas.errores === 0 &&
      estadisticas.sinClasificar === 0
    ) {
      console.log(
        "🎉 TODO QUEDÓ CLASIFICADO."
      );

      console.log("");
    }

  } catch (error) {
    console.error("");

    console.error(
      "================================================"
    );

    console.error(
      "            ❌ LA DESCARGA FALLÓ"
    );

    console.error(
      "================================================"
    );

    console.error("");

    console.error(
      error.message
    );

    console.error("");

    process.exit(1);
  }
}

// ============================================================
// INICIAR
// ============================================================

main();