import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyCard } from './property-card';
import { PropertyFilters } from './property-filters';
import { LogOut, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import propertiesData from '../../imports/sitemap_itaivan_pradi_imob.json';

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
function generateMockData(tipo: string, index: number): { quartos: number; areaPrivativa: number } {
  const seed = index;
  
  // Gerar quartos baseado no tipo
  let quartos = 0;
  if (tipo.toLowerCase().includes('apartamento') || tipo.toLowerCase().includes('casa') || tipo.toLowerCase().includes('chacara')) {
    quartos = (seed % 4) + 1; // 1 a 4 quartos
  }
  
  // Gerar área privativa baseado no tipo
  let areaPrivativa = 0;
  if (tipo.toLowerCase().includes('apartamento')) {
    areaPrivativa = 45 + (seed % 100); // 45 a 145 m²
  } else if (tipo.toLowerCase().includes('casa') || tipo.toLowerCase().includes('chacara')) {
    areaPrivativa = 80 + (seed % 220); // 80 a 300 m²
  } else if (tipo.toLowerCase().includes('sala') || tipo.toLowerCase().includes('comercial')) {
    areaPrivativa = 30 + (seed % 150); // 30 a 180 m²
  } else if (tipo.toLowerCase().includes('terreno')) {
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
    link_imovel: item.link_imovel
  };
});

const ITEMS_PER_PAGE = 20;

export function PropertiesScreen() {
  const [properties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>('none');


  // Aplicar ordenação
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.preco - b.preco;
    } else if (sortOrder === 'desc') {
      return b.preco - a.preco;
    }
    return 0;
  });

  // Cálculo da paginação
  const totalPages = Math.ceil(sortedProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = sortedProperties.slice(startIndex, endIndex);

  // Reset para primeira página quando filtros mudarem
  const handleFilterChange = (filtered: Property[]) => {
    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#0d1b2a]">
      {/* Header */}
      <header className="bg-[#0A4F6E] dark:bg-[#072a3d] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">ImobLink</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
              <Link to="/dashboard">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </Link>
            </Button>
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
              <Link to="/">
                <LogOut className="w-5 h-5" />
                Sair
              </Link>
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
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                  {totalPages > 1 && ` - Página ${currentPage} de ${totalPages}`}
                </p>
              </div>

              {/* Ordenação */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Ordenar por:
                </label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sort-select" className="w-[200px]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Padrão</SelectItem>
                    <SelectItem value="asc">Menor preço</SelectItem>
                    <SelectItem value="desc">Maior preço</SelectItem>
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
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar apenas algumas páginas ao redor da página atual
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          className={`min-w-[40px] ${
                            currentPage === page
                              ? "bg-[#0A4F6E] text-white"
                              : ""
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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