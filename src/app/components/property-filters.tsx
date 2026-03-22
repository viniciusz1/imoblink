import { useState, useEffect } from "react";
import { Property } from "./properties-screen";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Search } from "lucide-react";

export interface PropertyFiltersState {
  selectedTipos: string[];
  selectedBairros: string[];
  selectedCidades: string[];
  selectedImobiliarias: string[];
  selectedQuartos: number[];
  minPrice: string;
  maxPrice: string;
}

interface PropertyFiltersProps {
  properties: Property[];
  onFilterChange: (filtered: Property[]) => void;
  initialState: PropertyFiltersState;
  onFilterStateChange: (state: PropertyFiltersState) => void;
}

export function PropertyFilters({
  properties,
  onFilterChange,
  initialState,
  onFilterStateChange,
}: PropertyFiltersProps) {
  // Estados para filtros
  const [selectedTipos, setSelectedTipos] = useState<string[]>(
    initialState.selectedTipos
  );
  const [selectedBairros, setSelectedBairros] = useState<string[]>(
    initialState.selectedBairros
  );
  const [selectedCidades, setSelectedCidades] = useState<string[]>(
    initialState.selectedCidades
  );
  const [selectedImobiliarias, setSelectedImobiliarias] = useState<string[]>(
    initialState.selectedImobiliarias
  );
  const [selectedQuartos, setSelectedQuartos] = useState<number[]>(
    initialState.selectedQuartos
  );
  const [minPrice, setMinPrice] = useState<string>(initialState.minPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialState.maxPrice);

  // Estados para pesquisa em cada categoria
  const [searchTipo, setSearchTipo] = useState<string>("");
  const [searchBairro, setSearchBairro] = useState<string>("");
  const [searchCidade, setSearchCidade] = useState<string>("");
  const [searchImobiliaria, setSearchImobiliaria] = useState<string>("");

  // Extrair opções únicas (distinct) dos dados
  const tipos = Array.from(new Set(properties.map((p) => p.tipo))).sort();
  const bairros = Array.from(new Set(properties.map((p) => p.bairro))).sort();
  const cidades = Array.from(new Set(properties.map((p) => p.cidade))).sort();
  const imobiliarias = Array.from(
    new Set(properties.map((p) => p.imobiliaria))
  ).sort();
  const quartos = Array.from(
    new Set(properties.map((p) => p.quartos).filter((q) => q > 0))
  ).sort((a, b) => a - b);

  // Filtrar opções baseado na pesquisa
  const filteredTipos = tipos.filter((tipo) =>
    tipo.toLowerCase().includes(searchTipo.toLowerCase())
  );
  const filteredBairros = bairros.filter((bairro) =>
    bairro.toLowerCase().includes(searchBairro.toLowerCase())
  );
  const filteredCidades = cidades.filter((cidade) =>
    cidade.toLowerCase().includes(searchCidade.toLowerCase())
  );
  const filteredImobiliarias = imobiliarias.filter((imobiliaria) =>
    imobiliaria.toLowerCase().includes(searchImobiliaria.toLowerCase())
  );

  // Sincronizar estado interno quando URL mudar (ex.: back/forward)
  useEffect(() => {
    setSelectedTipos(initialState.selectedTipos);
    setSelectedBairros(initialState.selectedBairros);
    setSelectedCidades(initialState.selectedCidades);
    setSelectedImobiliarias(initialState.selectedImobiliarias);
    setSelectedQuartos(initialState.selectedQuartos);
    setMinPrice(initialState.minPrice);
    setMaxPrice(initialState.maxPrice);
  }, [initialState]);

  // Notificar mudanças de estado dos filtros para sincronização da URL
  useEffect(() => {
    onFilterStateChange({
      selectedTipos,
      selectedBairros,
      selectedCidades,
      selectedImobiliarias,
      selectedQuartos,
      minPrice,
      maxPrice,
    });
  }, [
    selectedTipos,
    selectedBairros,
    selectedCidades,
    selectedImobiliarias,
    selectedQuartos,
    minPrice,
    maxPrice,
    onFilterStateChange,
  ]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...properties];

    // Filtro por tipo
    if (selectedTipos.length > 0) {
      filtered = filtered.filter((p) => selectedTipos.includes(p.tipo));
    }

    // Filtro por bairro
    if (selectedBairros.length > 0) {
      filtered = filtered.filter((p) => selectedBairros.includes(p.bairro));
    }

    // Filtro por cidade
    if (selectedCidades.length > 0) {
      filtered = filtered.filter((p) => selectedCidades.includes(p.cidade));
    }

    // Filtro por imobiliária
    if (selectedImobiliarias.length > 0) {
      filtered = filtered.filter((p) =>
        selectedImobiliarias.includes(p.imobiliaria)
      );
    }

    // Filtro por quartos
    if (selectedQuartos.length > 0) {
      filtered = filtered.filter((p) => selectedQuartos.includes(p.quartos));
    }

    // Filtro por preço mínimo
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((p) => p.preco >= min);
      }
    }

    // Filtro por preço máximo
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((p) => p.preco <= max);
      }
    }

    onFilterChange(filtered);
  }, [
    selectedTipos,
    selectedBairros,
    selectedCidades,
    selectedImobiliarias,
    selectedQuartos,
    minPrice,
    maxPrice,
    properties,
    onFilterChange,
  ]);

  const handleTipoChange = (tipo: string, checked: boolean) => {
    setSelectedTipos((prev) =>
      checked ? [...prev, tipo] : prev.filter((t) => t !== tipo)
    );
  };

  const handleBairroChange = (bairro: string, checked: boolean) => {
    setSelectedBairros((prev) =>
      checked ? [...prev, bairro] : prev.filter((b) => b !== bairro)
    );
  };

  const handleCidadeChange = (cidade: string, checked: boolean) => {
    setSelectedCidades((prev) =>
      checked ? [...prev, cidade] : prev.filter((c) => c !== cidade)
    );
  };

  const handleImobiliariaChange = (imobiliaria: string, checked: boolean) => {
    setSelectedImobiliarias((prev) =>
      checked ? [...prev, imobiliaria] : prev.filter((i) => i !== imobiliaria)
    );
  };

  const handleQuartosChange = (quartos: number, checked: boolean) => {
    setSelectedQuartos((prev) =>
      checked ? [...prev, quartos] : prev.filter((q) => q !== quartos)
    );
  };

  const clearFilters = () => {
    setSelectedTipos([]);
    setSelectedBairros([]);
    setSelectedCidades([]);
    setSelectedImobiliarias([]);
    setSelectedQuartos([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchTipo("");
    setSearchBairro("");
    setSearchCidade("");
    setSearchImobiliaria("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Filtros
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Filtro de Preço */}
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Preço
          </h4>
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="minPrice"
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Valor Mínimo
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="R$ 0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="maxPrice"
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Valor Máximo
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="R$ 999.999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Filtro de Tipo */}
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Tipo de Imóvel
          </h4>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Pesquisar tipo..."
              value={searchTipo}
              onChange={(e) => setSearchTipo(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredTipos.map((tipo) => (
              <div key={tipo} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipo-${tipo}`}
                  checked={selectedTipos.includes(tipo)}
                  onCheckedChange={(checked) =>
                    handleTipoChange(tipo, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`tipo-${tipo}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {tipo}
                </Label>
              </div>
            ))}
            {filteredTipos.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhum tipo encontrado
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Filtro de Cidade */}
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Cidade
          </h4>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Pesquisar cidade..."
              value={searchCidade}
              onChange={(e) => setSearchCidade(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredCidades.map((cidade) => (
              <div key={cidade} className="flex items-center space-x-2">
                <Checkbox
                  id={`cidade-${cidade}`}
                  checked={selectedCidades.includes(cidade)}
                  onCheckedChange={(checked) =>
                    handleCidadeChange(cidade, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`cidade-${cidade}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {cidade}
                </Label>
              </div>
            ))}
            {filteredCidades.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhuma cidade encontrada
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Filtro de Bairro */}
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Bairro
          </h4>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Pesquisar bairro..."
              value={searchBairro}
              onChange={(e) => setSearchBairro(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredBairros.map((bairro) => (
              <div key={bairro} className="flex items-center space-x-2">
                <Checkbox
                  id={`bairro-${bairro}`}
                  checked={selectedBairros.includes(bairro)}
                  onCheckedChange={(checked) =>
                    handleBairroChange(bairro, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`bairro-${bairro}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {bairro}
                </Label>
              </div>
            ))}
            {filteredBairros.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhum bairro encontrado
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Filtro de Imobiliária */}
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Imobiliária
          </h4>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Pesquisar imobiliária..."
              value={searchImobiliaria}
              onChange={(e) => setSearchImobiliaria(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredImobiliarias.map((imobiliaria) => (
              <div key={imobiliaria} className="flex items-center space-x-2">
                <Checkbox
                  id={`imobiliaria-${imobiliaria}`}
                  checked={selectedImobiliarias.includes(imobiliaria)}
                  onCheckedChange={(checked) =>
                    handleImobiliariaChange(imobiliaria, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`imobiliaria-${imobiliaria}`}
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {imobiliaria}
                </Label>
              </div>
            ))}
            {filteredImobiliarias.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhuma imobiliária encontrada
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Filtro de Quartos */}
        {quartos.length > 0 && (
          <>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Quartos
              </h4>
              <div className="space-y-2">
                {quartos.map((quarto) => (
                  <div key={quarto} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quartos-${quarto}`}
                      checked={selectedQuartos.includes(quarto)}
                      onCheckedChange={(checked) =>
                        handleQuartosChange(quarto, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`quartos-${quarto}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      {quarto === 1 ? "1 quarto" : `${quarto} quartos`}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}
      </div>
    </div>
  );
}
