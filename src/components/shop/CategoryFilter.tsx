import React from 'react';
import { ShopItem } from '../../types';
import { ShoppingBag, User, Palette, Award, Zap } from 'lucide-react';

interface CategoryFilterProps {
    activeCategory: ShopItem['category'] | 'all';
    onSelectCategory: (category: ShopItem['category'] | 'all') => void;
}

const CategoryButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${active
            ? 'bg-brand-purple text-white shadow-lg shadow-purple-200'
            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, onSelectCategory }) => {
    const categories: { key: ShopItem['category'] | 'all'; icon: React.ReactNode; label: string }[] = [
        { key: 'all', icon: <ShoppingBag size={18} />, label: 'Alle' },
        { key: 'avatar', icon: <User size={18} />, label: 'Avatare' },
        { key: 'badge', icon: <Award size={18} />, label: 'Badges' },
        { key: 'powerup', icon: <Zap size={18} />, label: 'Power-ups' },
    ];

    return (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map((cat) => (
                    <CategoryButton
                        key={cat.key}
                        icon={cat.icon}
                        label={cat.label}
                        active={activeCategory === cat.key}
                        onClick={() => onSelectCategory(cat.key)}
                    />
                ))}
            </div>
        </div>
    );
};
