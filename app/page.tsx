import { fetchAppData } from "@/lib/db";
import { ProfileCard } from "@/components/ProfileCard";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ShareButton } from "@/components/ShareButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminButton } from "@/components/AdminButton";
import { Link } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data;
  try {
    data = await fetchAppData();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Serviço Indisponível
          </h1>
          <p className="text-[var(--text-secondary)]">
            Não foi possível carregar os dados. Tente novamente em alguns
            instantes.
          </p>
        </div>
      </main>
    );
  }

  const categories: Record<string, Link[]> = {};
  for (const link of data.links) {
    const cat = link.category || "Outros";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(link);
  }

  return (
    <main className="min-h-screen pb-32">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <ShareButton />
        <AdminButton />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-12 mt-4 mb-8 border-4 border-[#1a2e4a] rounded-2xl py-8">
        <ProfileCard profile={data.profile} />

        <SearchBar />

        <div id="links-container">
          {Object.entries(categories).map(([category, links]) => (
            <CategorySection
              key={category}
              category={category}
              links={links}
            />
          ))}
        </div>

        {data.links.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] mt-8">
            Nenhum link adicionado ainda.
          </p>
        )}
      </div>

      <Footer />
    </main>
  );
}
