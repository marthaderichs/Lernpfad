import React, { useState } from 'react';
import { ShopItem, UserStats } from '../types';
import { SHOP_ITEMS } from '../constants';
import { purchaseItem, setActiveAvatar } from '../services/storageService';
import { ArrowLeft, Coins, Check, Lock, Sparkles, ShoppingBag, User, Palette, Zap, Award } from 'lucide-react';

interface ShopProps {
    userStats: UserStats;
    onBack: () => void;
    onStatsUpdate: (stats: UserStats) => void;
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

const ShopItemCard: React.FC<{
    item: ShopItem;
    owned: boolean;
    active: boolean;
    canAfford: boolean;
    onPurchase: () => void;
    onSelect: () => void;
}> = ({ item, owned, active, canAfford, onPurchase, onSelect }) => (
    <div
        className={`relative bg-white rounded-2xl p-5 border-2 transition-all ${owned
            ? active
                ? 'border-brand-purple shadow-lg shadow-purple-100'
                : 'border-green-300 hover:border-green-400'
            : canAfford
                ? 'border-gray-200 hover:border-brand-purple hover:shadow-lg'
                : 'border-gray-100 opacity-60'
            }`}
    >
        {/* Status Badge */}
        {owned && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                <Check size={14} strokeWidth={3} />
            </div>
        )}
        {!owned && !canAfford && (
            <div className="absolute -top-2 -right-2 bg-gray-400 text-white p-1 rounded-full">
                <Lock size={14} />
            </div>
        )}

        {/* Icon */}
        <div className="text-5xl mb-4 text-center">{item.icon}</div>

        {/* Info */}
        <h3 className="font-black text-gray-800 text-center mb-1">{item.name}</h3>
        <p className="text-xs text-gray-400 text-center mb-4">{item.description}</p>

        {/* Price / Action */}
        {owned ? (
            item.category === 'avatar' ? (
                <button
                    onClick={onSelect}
                    className={`w-full py-2 rounded-xl font-bold transition-all ${active
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-brand-purple hover:text-white'
                        }`}
                >
                    {active ? 'Aktiv ✓' : 'Auswählen'}
                </button>
            ) : (
                <div className="w-full py-2 rounded-xl font-bold text-center bg-green-50 text-green-600">
                    Gekauft ✓
                </div>
            )
        ) : (
            <button
                onClick={onPurchase}
                disabled={!canAfford}
                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford
                    ? 'bg-gradient-to-r from-brand-orange to-yellow-400 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
            >
                <Coins size={16} />
                {item.price}
            </button>
        )}
    </div>
);

export const Shop: React.FC<ShopProps> = ({ userStats, onBack, onStatsUpdate }) => {
    const [activeCategory, setActiveCategory] = useState<ShopItem['category'] | 'all'>('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePurchase = async (itemId: string) => {
        const result = await purchaseItem(itemId);
        if (result.success) {
            onStatsUpdate(result.stats);
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleSelectAvatar = async (emoji: string) => {
        const newStats = await setActiveAvatar(emoji);
        onStatsUpdate(newStats);
        showToast('Avatar geändert!', 'success');
    };

    const filteredItems =
        activeCategory === 'all'
            ? SHOP_ITEMS
            : SHOP_ITEMS.filter((item) => item.category === activeCategory);

    const categories: { key: ShopItem['category'] | 'all'; icon: React.ReactNode; label: string }[] = [
        { key: 'all', icon: <ShoppingBag size={18} />, label: 'Alle' },
        { key: 'avatar', icon: <User size={18} />, label: 'Avatare' },
        { key: 'theme', icon: <Palette size={18} />, label: 'Themes' },
        { key: 'badge', icon: <Award size={18} />, label: 'Badges' },
        { key: 'powerup', icon: <Zap size={18} />, label: 'Power-ups' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={onBack}
                        className="bg-white/20 backdrop-blur-sm p-2 rounded-xl text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Coins size={20} className="text-yellow-300" />
                        <span className="font-black text-white text-lg">{userStats.coins.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">XP Shop</h1>
                        <p className="text-white/70 text-sm font-medium">Verdiene Coins und kaufe coole Items!</p>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <CategoryButton
                            key={cat.key}
                            icon={cat.icon}
                            label={cat.label}
                            active={activeCategory === cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                        />
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            owned={userStats.purchasedItems.includes(item.id)}
                            active={item.category === 'avatar' && userStats.activeAvatar === item.icon}
                            canAfford={userStats.coins >= item.price}
                            onPurchase={() => handlePurchase(item.id)}
                            onSelect={() => handleSelectAvatar(item.icon)}
                        />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-bold">Keine Items in dieser Kategorie</p>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-t border-yellow-100">
                <div className="flex items-center gap-3 text-sm">
                    <div className="bg-yellow-400 p-2 rounded-lg">
                        <Coins size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-700">So verdienst du Coins:</p>
                        <p className="text-gray-500">
                            ⭐ 1 Stern = 10 Coins • ⭐⭐ 2 Sterne = 25 Coins • ⭐⭐⭐ 3 Sterne = 50 Coins + Streak-Bonus!
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold shadow-lg animate-in slide-in-from-bottom-4 ${toast.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
};
