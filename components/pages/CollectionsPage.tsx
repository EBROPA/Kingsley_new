import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize, FiMapPin, FiLayers, FiSearch, FiChevronLeft, FiChevronRight, FiX, FiChevronDown } from 'react-icons/fi';
import { Property } from '../../types';
import { propertyService, PropertyFilter } from '../../services/propertyService';

interface CollectionsPageProps {
  onPropertySelect: (property: Property) => void;
}

const ITEMS_PER_PAGE = 12;

// --- COMPONENTS ---

const PropertyCard: React.FC<{ item: Property, onClick: () => void }> = ({ item, onClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(1);
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(-1);
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 1
        })
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="group cursor-pointer flex flex-col bg-white rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full relative"
            onClick={onClick}
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.img 
                        key={currentImageIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                        }}
                        src={item.images[currentImageIndex]} 
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover absolute inset-0"
                    />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10" />
                
                <div className="absolute top-4 left-4 z-20">
                     <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] uppercase tracking-widest text-primary font-medium shadow-sm rounded-sm">
                        {item.category}
                     </span>
                </div>

                {item.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                        <button onClick={prevImage} className="pointer-events-auto w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-white transition-all shadow-md">
                            <FiChevronLeft size={18} className="md:size-4" />
                        </button>
                        <button onClick={nextImage} className="pointer-events-auto w-10 h-10 md:w-8 md:h-8 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-white transition-all shadow-md">
                            <FiChevronRight size={18} className="md:size-4" />
                        </button>
                    </div>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.images.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow relative">
                <div className="mb-8">
                     <h3 className="font-serif text-3xl text-primary leading-none group-hover:text-accent transition-colors duration-300 mb-3">
                        {item.title}
                     </h3>
                     <div className="flex items-center gap-2 text-primary/50 text-sm font-sans">
                        <FiMapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                     <span className="bg-[#F5F2EA] px-3 py-1.5 text-[10px] uppercase tracking-wider text-primary/70 rounded-sm flex items-center gap-1.5 font-sans font-medium">
                        <FiMaximize size={12} /> {item.area}
                     </span>
                </div>

                <div className="mt-auto pt-6 flex items-end justify-between border-t border-primary/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-primary/40 mb-1">Стоимость</span>
                        <span className="font-sans text-2xl text-primary font-bold leading-none">
                            {item.price}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const PropertyCardSkeleton: React.FC = () => (
    <div className="flex flex-col bg-white rounded-md overflow-hidden shadow-sm h-full animate-pulse">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="p-8 flex flex-col flex-grow space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-2 pt-4">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100">
                 <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    </div>
);

const CollectionsPage: React.FC<CollectionsPageProps> = ({ onPropertySelect }) => {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filters State
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: "", max: "" });
  const [areaRange, setAreaRange] = useState<{min: string, max: string}>({ min: "", max: "" });
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]); 

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DATA FETCHING ---
  
  useEffect(() => {
      const fetchProperties = async () => {
          setLoading(true);
          try {
              const filter: PropertyFilter = {
                  search: activeSearch,
                  rooms: selectedRooms,
                  priceMin: priceRange.min,
                  priceMax: priceRange.max,
                  areaMin: areaRange.min,
                  areaMax: areaRange.max,
                  page: currentPage,
                  limit: ITEMS_PER_PAGE
              };
              const response = await propertyService.getProperties(filter);
              setProperties(response.data);
              setTotalPages(response.totalPages);
          } catch (error) {
              console.error("Failed to fetch properties", error);
          } finally {
              setLoading(false);
          }
      };

      fetchProperties();
  }, [activeSearch, priceRange, areaRange, selectedRooms, currentPage]);

  // Suggestions Fetching
  useEffect(() => {
      const fetchSuggestions = async () => {
          if (searchInputValue.length > 1) {
              const results = await propertyService.getSuggestions(searchInputValue);
              setSuggestions(results);
          } else {
              setSuggestions([]);
          }
      };
      const debounce = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounce);
  }, [searchInputValue]);


  // --- HANDLERS ---

  const handleRoomToggle = (room: number) => {
      setSelectedRooms(prev => 
          prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
      );
      setCurrentPage(1);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setActiveSearch(searchInputValue);
      setShowSuggestions(false);
      setCurrentPage(1);
  };

  const handleSuggestionClick = (title: string) => {
      setSearchInputValue(title);
      setActiveSearch(title);
      setShowSuggestions(false);
      setCurrentPage(1);
  };

  const clearFilters = () => {
      setSearchInputValue("");
      setActiveSearch("");
      setPriceRange({ min: "", max: "" });
      setAreaRange({ min: "", max: "" });
      setSelectedRooms([]);
      setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPinPosition = (id: number) => {
      const x = (id * 137) % 80 + 10;
      const y = (id * 293) % 70 + 15;
      return { top: `${y}%`, left: `${x}%` };
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
          <h1 className="font-serif text-5xl md:text-7xl text-primary mb-4">Коллекция</h1>
        </motion.div>

        {/* --- FILTER BAR --- */}
        <div className="mb-16">
            <div className="flex flex-col gap-2">
                
                {/* Labels Row (Desktop) */}
                <div className="hidden lg:grid grid-cols-12 gap-4 text-xs text-primary/60">
                    <div className="col-span-3">Поиск</div>
                    <div className="col-span-2">Тип недвижимости</div>
                    <div className="col-span-3">Количество спален</div>
                    <div className="col-span-2">Цена, млн ₽</div>
                    <div className="col-span-2">Площадь, м²</div>
                </div>

                {/* Controls Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* Search */}
                    <div className="lg:col-span-3 relative h-16" ref={searchContainerRef}>
                        <form onSubmit={handleSearchSubmit} className="relative group h-full">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-accent transition-colors">
                                <FiSearch size={22} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Поиск ЖК, улицы, район..." 
                                value={searchInputValue}
                                onChange={(e) => { setSearchInputValue(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full bg-white rounded-2xl h-16 pl-14 pr-6 text-base font-sans shadow-sm border border-transparent hover:border-primary/5 focus:border-accent/30 focus:shadow-md focus:outline-none transition-all placeholder:text-primary/30"
                            />
                            {searchInputValue && (
                                <button type="button" onClick={() => { setSearchInputValue(""); setActiveSearch(""); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary">
                                    <FiX size={18} />
                                </button>
                            )}
                        </form>
                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-primary/5 z-50 overflow-hidden py-2"
                                >
                                    {suggestions.map((s) => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => handleSuggestionClick(s.title)} 
                                            className="px-6 py-4 hover:bg-[#F5F2EA] cursor-pointer text-base font-sans text-primary flex items-center justify-between group"
                                        >
                                            <span>{s.title}</span>
                                            <span className="text-[10px] text-primary/40 group-hover:text-accent uppercase tracking-wider">{s.category}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Type */}
                    <div className="lg:col-span-2 relative h-16">
                        <select className="w-full bg-white rounded-2xl h-16 px-6 appearance-none shadow-sm border border-transparent hover:border-primary/5 focus:border-accent/30 focus:shadow-md focus:outline-none transition-all cursor-pointer text-base font-sans text-primary">
                            <option>ЖК</option>
                            <option>Апартаменты</option>
                            <option>Пентхаусы</option>
                        </select>
                        <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                    </div>

                    {/* Rooms */}
                    <div className="lg:col-span-3 h-16">
                         <div className="flex bg-white rounded-2xl p-1.5 h-16 shadow-sm border border-transparent items-center justify-between">
                             {[0, 1, 2, 3, 4].map((r) => (
                                 <button
                                     key={r}
                                     onClick={() => handleRoomToggle(r)}
                                     className={`flex-1 h-full rounded-xl text-sm font-sans font-medium transition-all ${
                                         selectedRooms.includes(r) 
                                         ? 'bg-primary text-white shadow-md' 
                                         : 'text-primary/60 hover:bg-[#F5F2EA] hover:text-primary'
                                     }`}
                                 >
                                     {r === 0 ? 'Студия' : r === 4 ? '4+' : r}
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2 relative h-16">
                        <label className="block lg:hidden text-xs uppercase text-primary/50 mb-2 pl-1">Цена, млн ₽</label>
                        <div className="bg-white rounded-2xl h-16 px-3 flex items-center shadow-sm border border-transparent hover:border-primary/5 focus-within:border-accent/30 focus-within:shadow-md transition-all">
                            <input 
                                type="number"
                                placeholder="от" 
                                value={priceRange.min}
                                onChange={(e) => { setPriceRange({...priceRange, min: e.target.value}); setCurrentPage(1); }}
                                className="w-1/2 bg-transparent text-base font-sans focus:outline-none text-center placeholder:text-primary/30"
                            />
                            <span className="text-primary/20">-</span>
                            <input 
                                type="number"
                                placeholder="до" 
                                value={priceRange.max}
                                onChange={(e) => { setPriceRange({...priceRange, max: e.target.value}); setCurrentPage(1); }}
                                className="w-1/2 bg-transparent text-base font-sans focus:outline-none text-center placeholder:text-primary/30"
                            />
                        </div>
                    </div>

                    {/* Area */}
                    <div className="lg:col-span-2 relative h-16">
                        <label className="block lg:hidden text-xs uppercase text-primary/50 mb-2 pl-1">Площадь, м²</label>
                        <div className="bg-white rounded-2xl h-16 px-3 flex items-center shadow-sm border border-transparent hover:border-primary/5 focus-within:border-accent/30 focus-within:shadow-md transition-all">
                            <input 
                                type="number"
                                placeholder="от" 
                                value={areaRange.min}
                                onChange={(e) => { setAreaRange({...areaRange, min: e.target.value}); setCurrentPage(1); }}
                                className="w-1/2 bg-transparent text-base font-sans focus:outline-none text-center placeholder:text-primary/30"
                            />
                            <span className="text-primary/20">-</span>
                            <input 
                                type="number"
                                placeholder="до" 
                                value={areaRange.max}
                                onChange={(e) => { setAreaRange({...areaRange, max: e.target.value}); setCurrentPage(1); }}
                                className="w-1/2 bg-transparent text-base font-sans focus:outline-none text-center placeholder:text-primary/30"
                            />
                        </div>
                    </div>

                </div>

                {/* View Toggles & Clear Filters */}
                <div className="flex flex-wrap items-center justify-end mt-6 gap-4">
                    {(activeSearch || priceRange.min || priceRange.max || areaRange.min || areaRange.max || selectedRooms.length > 0) && (
                        <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 h-12 px-2">
                            <FiX /> Сбросить фильтры
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[800px]">
            <motion.div 
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-12"
            >
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 gap-y-16">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 gap-y-16">
                        {properties.map((item) => (
                            <PropertyCard 
                                key={item.id} 
                                item={item} 
                                onClick={() => onPropertySelect(item)} 
                            />
                        ))}
                    </div>
                )}

                {!loading && properties.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <FiSearch size={48} className="text-primary/10 mb-4" />
                        <p className="font-serif text-2xl text-primary/50">Объекты не найдены</p>
                        <p className="text-sm text-primary/40 mt-2">Попробуйте изменить параметры фильтрации</p>
                        <button 
                            onClick={clearFilters} 
                            className="mt-6 px-6 py-2 border border-accent text-accent text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                        >
                            Очистить все фильтры
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && properties.length > 0 && (
                    <div className="flex justify-center items-center gap-4 pt-12 border-t border-primary/5">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary"
                        >
                            <FiChevronLeft />
                        </button>
                        
                        <span className="font-sans text-sm tracking-widest">
                            <span className="text-accent font-bold">{currentPage}</span> <span className="text-primary/30">/</span> {totalPages}
                        </span>

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;