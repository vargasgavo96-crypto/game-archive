import { supabase } from "@/lib/supabase";

export default async function TestSupabase() {
  const { data, error } = await supabase
    .from("personas")
    .select("id, nombre")
    .limit(5);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Prueba Supabase</h1>

      {error ? (
        <p className="mt-4 text-red-500">
          Error: {error.message}
        </p>
      ) : (
        <div className="mt-4">
          <p className="text-green-500">
            ¡Conexión exitosa! 🎉
          </p>

          <pre className="mt-4">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
