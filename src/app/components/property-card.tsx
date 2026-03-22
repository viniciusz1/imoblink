import { Home, MapPin, Building2, Maximize, BedDouble } from 'lucide-react';
import { Property } from './properties-screen';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleViewDetails = () => {
    window.open(property.link_imovel, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={property.image}
          alt={`${property.tipo} em ${property.bairro}`}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-[#0A4F6E] text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.tipo}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Preço */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatPrice(property.preco)}
          </p>
        </div>

        {/* Informações principais */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-[#0A4F6E] dark:text-[#3bb8e8]" />
            <span className="text-sm">{property.bairro} - {property.cidade}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Building2 className="w-4 h-4 text-[#2ECC71] dark:text-[#2ECC71]" />
            <span className="text-sm">{property.imobiliaria}</span>
          </div>
        </div>

        {/* Características */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {property.quartos > 0 && (
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <BedDouble className="w-4 h-4 text-[#0A4F6E] dark:text-[#3bb8e8]" />
              <span className="text-sm">{property.quartos} {property.quartos === 1 ? 'quarto' : 'quartos'}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Maximize className="w-4 h-4 text-[#2ECC71] dark:text-[#2ECC71]" />
            <span className="text-sm">{property.areaPrivativa}m²</span>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {property.descricao}
        </p>

        {/* Botão */}
        <button
          onClick={handleViewDetails}
          className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}
