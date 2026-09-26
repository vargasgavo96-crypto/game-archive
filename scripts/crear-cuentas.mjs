import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en .env.local"
  );
}

if (!secretKey) {
  throw new Error(
    "Falta SUPABASE_SECRET_KEY en .env.local"
  );
}

const supabase = createClient(
  supabaseUrl,
  secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const cuentas = [
  {
    usuario: "gonza",
    nombre: "Gonzalo",
    password: process.env.AUTH_PASS_GONZA,
    rol: "superadmin",
  },
  {
    usuario: "fefi",
    nombre: "Fefi",
    password: process.env.AUTH_PASS_FEFI,
    rol: "editor",
  },
  {
    usuario: "camilo",
    nombre: "Camilo",
    password: process.env.AUTH_PASS_CAMILO,
    rol: "editor",
  },
  {
    usuario: "javier",
    nombre: "Javier",
    password: process.env.AUTH_PASS_JAVIER,
    rol: "editor",
  },
  {
    usuario: "ricardo",
    nombre: "Ricardo",
    password: process.env.AUTH_PASS_RICARDO,
    rol: "editor",
  },
  {
    usuario: "cristobal",
    nombre: "Cristóbal",
    password: process.env.AUTH_PASS_CRISTOBAL,
    rol: "editor",
  },
  {
    usuario: "leslie",
    nombre: "Leslie",
    password: process.env.AUTH_PASS_LESLIE,
    rol: "editor",
  },
  {
    usuario: "jeimy",
    nombre: "Jeimy",
    password: process.env.AUTH_PASS_JEIMY,
    rol: "editor",
  },
  {
    usuario: "angelo",
    nombre: "Ángelo",
    password: process.env.AUTH_PASS_ANGELO,
    rol: "editor",
  },
];

function emailInterno(usuario) {
  return `${usuario.toLowerCase()}@gamearchive.local`;
}

async function obtenerUsuarios() {
  const usuarios = [];
  let pagina = 1;
  const porPagina = 1000;

  while (true) {
    const { data, error } =
      await supabase.auth.admin.listUsers({
        page: pagina,
        perPage: porPagina,
      });

    if (error) {
      throw error;
    }

    usuarios.push(...data.users);

    if (data.users.length < porPagina) {
      break;
    }

    pagina++;
  }

  return usuarios;
}

async function crearOActualizarCuenta(
  cuenta,
  usuariosExistentes
) {
  if (!cuenta.password) {
    throw new Error(
      `Falta la contraseña de ${cuenta.usuario} en .env.local`
    );
  }

  const email = emailInterno(cuenta.usuario);

  const usuarioExistente = usuariosExistentes.find(
    (user) =>
      user.email?.toLowerCase() === email.toLowerCase()
  );

  let userId;

  if (usuarioExistente) {
    const { data, error } =
      await supabase.auth.admin.updateUserById(
        usuarioExistente.id,
        {
          password: cuenta.password,
          email_confirm: true,
          user_metadata: {
            username: cuenta.usuario,
          },
        }
      );

    if (error) {
      throw error;
    }

    userId = data.user.id;

    console.log(
      `✓ Cuenta actualizada: ${cuenta.usuario}`
    );
  } else {
    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password: cuenta.password,
        email_confirm: true,
        user_metadata: {
          username: cuenta.usuario,
        },
      });

    if (error) {
      throw error;
    }

    userId = data.user.id;

    console.log(
      `✓ Cuenta creada: ${cuenta.usuario}`
    );
  }

  const { error: perfilError } = await supabase
    .from("perfiles")
    .upsert(
      {
        id: userId,
        usuario: cuenta.usuario,
        nombre: cuenta.nombre,
        rol: cuenta.rol,
        activo: true,
      },
      {
        onConflict: "id",
      }
    );

  if (perfilError) {
    throw perfilError;
  }
}

async function main() {
  console.log(
    "Creando/actualizando cuentas...\n"
  );

  const usuariosExistentes =
    await obtenerUsuarios();

  for (const cuenta of cuentas) {
    await crearOActualizarCuenta(
      cuenta,
      usuariosExistentes
    );
  }

  console.log(
    "\n✓ Todas las cuentas fueron procesadas correctamente."
  );
}

main().catch((error) => {
  console.error("\n✗ Error:");
  console.error(error);
  process.exit(1);
});