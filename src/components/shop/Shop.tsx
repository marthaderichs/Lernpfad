import React, { useState } from 'react';
import { ShopItem } from '../../types';
import { SHOP_ITEMS } from '../../constants';
import { useAppStore } from '../../stores/useAppStore';
import { purchaseItem, setActiveAvatar } from '../../services/api';
import { ArrowLeft, Coins, Sparkles, ShoppingBag } from 'lucide-react';
import { CategoryFilter } from './CategoryFilter';
import { ShopItemCard } from './ShopItem';

export const Shop: React.FC = () => {
    const { userStats, setUserStats, navigateTo } = useAppStore();
    const [activeCategory, setActiveCategory] = useState<ShopItem['category'] | 'all'>('all');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    if (!userStats) return null;

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePurchase = async (itemId: string) => {
        const result = await purchaseItem(itemId);
        if (result.success) {
            setUserStats(result.stats);
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleSelectAvatar = async (emoji: string) => {
        const newStats = await setActiveAvatar(emoji);
        setUserStats(newStats);
        showToast('Avatar geändert!', 'success');
    };

    const handleBack = () => {
        navigateTo('DASHBOARD');
    };

    const filteredItems =
        activeCategory === 'all'
            ? SHOP_ITEMS
            : SHOP_ITEMS.filter((item) => item.category === activeCategory);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleBack}
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
            <CategoryFilter activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

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
