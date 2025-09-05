export async function GET() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>CramClock</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="color-scheme" content="light dark">
</head>
<body class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
  <main class="mx-auto max-w-4xl p-6 space-y-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-bold">CramClock</h1>
      <p class="text-sm text-zinc-600 dark:text-zinc-400">Synced from Google Sheets</p>
    </header>
    <section id="cards" class="grid gap-4 md:grid-cols-2">
      <div class="text-zinc-600 dark:text-zinc-300">Loading…</div>
    </section>
  </main>
  <script src="/app.js"></script>
</body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
