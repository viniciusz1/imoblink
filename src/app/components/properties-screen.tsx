import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PropertyCard } from "./property-card";
import { PropertyFilters, type PropertyFiltersState } from "./property-filters";
import { LogOut, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import propertiesData from "../../imports/sitemap_jaragua_do_sul_pradi_ajustado.json";

export interface Property {
  id: number;
  image: string;
  tipo: string;
  preco: number;
  bairro: string;
  cidade: string;
  imobiliaria: string;
  quartos: number;
  areaPrivativa: number;
  descricao: string;
  link_imovel: string;
}

// Função auxiliar para gerar dados mockados
function generateMockData(
  tipo: string,
  index: number
): { quartos: number; areaPrivativa: number } {
  const seed = index;

  // Gerar quartos baseado no tipo
  let quartos = 0;
  if (
    tipo.toLowerCase().includes("apartamento") ||
    tipo.toLowerCase().includes("casa") ||
    tipo.toLowerCase().includes("chacara")
  ) {
    quartos = (seed % 4) + 1; // 1 a 4 quartos
  }

  // Gerar área privativa baseado no tipo
  let areaPrivativa = 0;
  if (tipo.toLowerCase().includes("apartamento")) {
    areaPrivativa = 45 + (seed % 100); // 45 a 145 m²
  } else if (
    tipo.toLowerCase().includes("casa") ||
    tipo.toLowerCase().includes("chacara")
  ) {
    areaPrivativa = 80 + (seed % 220); // 80 a 300 m²
  } else if (
    tipo.toLowerCase().includes("sala") ||
    tipo.toLowerCase().includes("comercial")
  ) {
    areaPrivativa = 30 + (seed % 150); // 30 a 180 m²
  } else if (tipo.toLowerCase().includes("terreno")) {
    areaPrivativa = 200 + (seed % 800); // 200 a 1000 m²
  } else {
    areaPrivativa = 50 + (seed % 150); // Padrão
  }

  return { quartos, areaPrivativa };
}

// Capitalizar primeira letra
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Transformar dados do JSON
const mockProperties: Property[] = propertiesData.map((item, index) => {
  const mockData = generateMockData(item.tipo, index);

  return {
    id: index + 1,
    image: item.imagem,
    tipo: capitalize(item.tipo),
    preco: item.valor,
    bairro: capitalize(item.bairro),
    cidade: capitalize(item.cidade),
    imobiliaria: item.imobiliaria,
    quartos: mockData.quartos,
    areaPrivativa: mockData.areaPrivativa,
    descricao: item.descricao,
    link_imovel: item.link_imovel,
  };
});

const ITEMS_PER_PAGE = 20;

function getStringArrayParam(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).filter(Boolean);
}

function getNumberArrayParam(params: URLSearchParams, key: string): number[] {
  return params
    .getAll(key)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function setArrayParam(
  params: URLSearchParams,
  key: string,
  values: Array<string | number>
) {
  params.delete(key);
  values.forEach((value) => params.append(key, String(value)));
}

function areArrayParamsEqual(
  a: URLSearchParams,
  b: URLSearchParams,
  key: string
): boolean {
  const left = a.getAll(key);
  const right = b.getAll(key);

  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function didFilterParamsChange(
  prev: URLSearchParams,
  next: URLSearchParams
): boolean {
  if (!areArrayParamsEqual(prev, next, "tipo")) return true;
  if (!areArrayParamsEqual(prev, next, "bairro")) return true;
  if (!areArrayParamsEqual(prev, next, "cidade")) return true;
  if (!areArrayParamsEqual(prev, next, "imobiliaria")) return true;
  if (!areArrayParamsEqual(prev, next, "quartos")) return true;
  if ((prev.get("min") ?? "") !== (next.get("min") ?? "")) return true;
  if ((prev.get("max") ?? "") !== (next.get("max") ?? "")) return true;
  return false;
}

function buildFilterStateFromUrl(
  params: URLSearchParams
): PropertyFiltersState {
  return {
    selectedTipos: getStringArrayParam(params, "tipo"),
    selectedBairros: getStringArrayParam(params, "bairro"),
    selectedCidades: getStringArrayParam(params, "cidade"),
    selectedImobiliarias: getStringArrayParam(params, "imobiliaria"),
    selectedQuartos: getNumberArrayParam(params, "quartos"),
    minPrice: params.get("min") ?? "",
    maxPrice: params.get("max") ?? "",
  };
}

export function PropertiesScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(mockProperties);

  const filtersFromUrl = useMemo(
    () => buildFilterStateFromUrl(searchParams),
    [searchParams]
  );

  const sortOrderParam = searchParams.get("ordem");
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "none";

  const pageParam = Number(searchParams.get("pagina") ?? "1");
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // Aplicar ordenação
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.preco - b.preco;
    } else if (sortOrder === "desc") {
      return b.preco - a.preco;
    }
    return 0;
  });

  // Cálculo da paginação
  const totalPages = Math.ceil(sortedProperties.length / ITEMS_PER_PAGE);
  const effectivePage =
    totalPages === 0 ? 1 : Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = sortedProperties.slice(startIndex, endIndex);

  const handleFilterChange = useCallback((filtered: Property[]) => {
    setFilteredProperties(filtered);
  }, []);

  const handleFilterStateChange = useCallback(
    (state: PropertyFiltersState) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);

          setArrayParam(nextParams, "tipo", state.selectedTipos);
          setArrayParam(nextParams, "bairro", state.selectedBairros);
          setArrayParam(nextParams, "cidade", state.selectedCidades);
          setArrayParam(nextParams, "imobiliaria", state.selectedImobiliarias);
          setArrayParam(nextParams, "quartos", state.selectedQuartos);

          if (state.minPrice) {
            nextParams.set("min", state.minPrice);
          } else {
            nextParams.delete("min");
          }

          if (state.maxPrice) {
            nextParams.set("max", state.maxPrice);
          } else {
            nextParams.delete("max");
          }

          const filtersChanged = didFilterParamsChange(prev, nextParams);

          // Só volta para página 1 quando os filtros realmente mudam
          if (filtersChanged) {
            nextParams.delete("pagina");
          }

          return nextParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);

        if (value === "asc" || value === "desc") {
          nextParams.set("ordem", value);
        } else {
          nextParams.delete("ordem");
        }

        // Alteração de ordem também volta para página 1
        nextParams.delete("pagina");
        return nextParams;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);

        if (page <= 1) {
          nextParams.delete("pagina");
        } else {
          nextParams.set("pagina", String(page));
        }

        return nextParams;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete("pagina");
          return nextParams;
        },
        { replace: true }
      );
      return;
    }

    if (totalPages > 0 && currentPage !== effectivePage) {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          if (effectivePage <= 1) {
            nextParams.delete("pagina");
          } else {
            nextParams.set("pagina", String(effectivePage));
          }
          return nextParams;
        },
        { replace: true }
      );
    }
  }, [currentPage, effectivePage, setSearchParams, totalPages]);

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#0d1b2a]">
      {/* Header */}
      <header className="bg-[#0A4F6E] dark:bg-[#072a3d] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">ImoveLink</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 flex items-center gap-2"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 flex items-center gap-2"
              type="button"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar com filtros */}
          <aside className="lg:w-80 flex-shrink-0">
            <PropertyFilters
              properties={properties}
              onFilterChange={handleFilterChange}
              initialState={filtersFromUrl}
              onFilterStateChange={handleFilterStateChange}
            />
          </aside>

          {/* Lista de imóveis */}
          <main className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  Imóveis Disponíveis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredProperties.length}{" "}
                  {filteredProperties.length === 1
                    ? "imóvel encontrado"
                    : "imóveis encontrados"}
                  {totalPages > 1 &&
                    ` - Página ${effectivePage} de ${totalPages}`}
                </p>
              </div>

              {/* Ordenação */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  Ordenar por:
                </label>
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger id="sort-select" className="w-[200px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Padrão</SelectItem>
                    <SelectItem value="asc">Menor valor</SelectItem>
                    <SelectItem value="desc">Maior valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  Nenhum imóvel encontrado com os filtros selecionados.
                </p>
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  onClick={() => handlePageChange(effectivePage - 1)}
                  disabled={effectivePage === 1}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Mostrar apenas algumas páginas ao redor da página atual
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= effectivePage - 2 && page <= effectivePage + 2)
                      ) {
                        return (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            variant={
                              effectivePage === page ? "default" : "outline"
                            }
                            className={`min-w-[40px] ${
                              effectivePage === page
                                ? "bg-[#0A4F6E] text-white"
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === effectivePage - 3 ||
                        page === effectivePage + 3
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                <Button
                  onClick={() => handlePageChange(effectivePage + 1)}
                  disabled={effectivePage === totalPages}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
