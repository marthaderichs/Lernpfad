import React from 'react';
import { ShopItem } from '../../types';
import { Coins, Check, Lock } from 'lucide-react';

interface ShopItemProps {
    item: ShopItem;
    owned: boolean;
    active: boolean;
    canAfford: boolean;
    onPurchase: () => void;
    onSelect: () => void;
}

export const ShopItemCard: React.FC<ShopItemProps> = ({ item, owned, active, canAfford, onPurchase, onSelect }) => (
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
