import json, os
ROOT = os.path.dirname(os.path.abspath(__file__ + "/.."))
def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8", newline="\n").write(content.rstrip() + "\n")
    print("w", rel)

w("app/layout.tsx", """import type { Metadata } from \"next\";
import { Providers } from \"@/components/providers\";
import \"./globals.css\";

export const metadata: Metadata = {
  title: \"TIGER RYDO - Premium Electric Scooters\",
  description: \"RIDE BOLD. RIDE CLEAN. RIDE FUTURE.\",
  icons: { icon: \"/brand/icon.svg\" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang=\"en\">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
""")

pkg = json.load(open(os.path.join(ROOT, "package.json")))
pkg.setdefault("scripts", {})
pkg["scripts"]["db:push"] = "prisma db push"
pkg["scripts"]["db:seed"] = "tsx prisma/seed.ts"
pkg["scripts"]["db:setup"] = "prisma db push && tsx prisma/seed.ts"
pkg["prisma"] = {"seed": "tsx prisma/seed.ts"}
json.dump(pkg, open(os.path.join(ROOT, "package.json"), "w"), indent=2)
print("done")
