import React, { useState } from 'react';
import { Course, DashboardItem, Folder, UserStats } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../common/Button';
import { AiImportModal } from '../ai-import';
import { AddFolderModal } from './AddFolderModal';
import { Trophy, Flame, Coins, Plus, BookOpen, Trash2, ShoppingBag, Folder as FolderIcon, ChevronLeft, Pencil, Check, GripVertical, FileStack, CheckSquare, Square, FolderInput, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const HeaderStat: React.FC<{ icon: React.ReactNode; value: string; label?: string; color: string; onClick?: () => void }> = ({ icon, value, color, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200/50 ${onClick ? 'cursor-pointer active:scale-95 transition-transform hover:bg-white/80' : ''}`}
    >
        <div className={`${color} p-1.5 rounded-lg text-white shadow-sm`}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 14 })}
        </div>
        <span className="font-black text-gray-700 text-sm">{value}</span>
    </div>
);

const themeColors: Record<string, string> = {
    'brand-purple': 'bg-brand-purple border-purple-700',
    'brand-blue': 'bg-brand-blue border-indigo-700',
    'brand-orange': 'bg-brand-orange border-orange-600',
    'brand-green': 'bg-brand-green border-green-700',
    'brand-sky': 'bg-brand-sky border-sky-600',
    'brand-teal': 'bg-brand-teal border-teal-600',
    'brand-red': 'bg-brand-red border-red-600',
    'brand-pink': 'bg-brand-pink border-[#d87a9e]',
    'brand-burgundy': 'bg-brand-burgundy border-rose-900',
    'brand-yellow': 'bg-brand-yellow border-yellow-600',
    'brand-lime': 'bg-brand-lime border-lime-700',
    'brand-fuchsia': 'bg-brand-fuchsia border-fuchsia-800',
};

// --- Sortable Wrapper ---
const SortableItem: React.FC<{ id: string; children: React.ReactNode; disabled?: boolean }> = ({ id, children, disabled }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/sortable h-full">
            {children}
            {!disabled && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-100 transition-opacity z-20"
                >
                    <GripVertical size={20} className="text-gray-500" />
                </div>
            )}
        </div>
    );
};

const FolderCard: React.FC<{
    folder: Folder;
    itemCount: number;
    onClick: () => void;
    onDelete: () => void;
    isEditMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
    onEdit?: () => void;
}> = ({ folder, itemCount, onClick, onDelete, isEditMode, isSelected, onToggleSelection, onEdit }) => {
    const cssClass = themeColors[folder.themeColor] || themeColors['brand-blue'];

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode && onToggleSelection) {
            e.stopPropagation();
            onToggleSelection();
        } else {
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        relative overflow-hidden cursor-pointer group h-full flex flex-col
        bg-white rounded-3xl border-b-4 ${isSelected ? 'border-brand-sky ring-4 ring-brand-sky/30' : 'border-gray-200'} 
        shadow-sm hover:border-gray-300 hover:shadow-md transition-all active:scale-95
      `}
        >
            {isEditMode && (
                <>
                    <div className="absolute top-3 left-3 z-20">
                        {isSelected ? (
                            <div className="bg-brand-sky text-white rounded-lg p-1 shadow-sm">
                                <CheckSquare size={24} />
                            </div>
                        ) : (
                            <div className="bg-white/80 text-gray-400 rounded-lg p-1 shadow-sm hover:text-brand-sky">
                                <Square size={24} />
                            </div>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 z-20 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit();
                            }}
                            className="bg-white/90 p-2 rounded-xl text-gray-500 shadow-sm hover:bg-brand-orange hover:text-white transition-all active:scale-90 flex items-center justify-center"
                            title="Bearbeiten"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                            className="bg-white/90 p-2 rounded-xl text-brand-sky shadow-sm hover:bg-brand-sky hover:text-white transition-all active:scale-90 flex items-center gap-1 font-bold text-xs pr-3"
                        >
                            <ChevronRight size={18} />
                            ÖFFNEN
                        </button>
                    </div>
                </>
            )}

            <div className={`h-32 ${cssClass} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute opacity-20 transform rotate-12 -right-6 -top-6 text-8xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {folder.icon}
                </div>
                <div className="text-6xl drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-300">{folder.icon}</div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-extrabold text-gray-800 text-xl leading-tight mb-2">{folder.title}</h3>
                    <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
                        <FolderIcon size={14} />
                        {itemCount} Elemente
                    </p>
                </div>
            </div>
        </div>
    );
};

const CourseCard: React.FC<{
    course: Course;
    onClick: () => void;
    onDelete: () => void;
    isEditMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}> = ({ course, onClick, onDelete, isEditMode, isSelected, onToggleSelection }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const cssClass = themeColors[course.themeColor] || themeColors['brand-blue'];

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode && onToggleSelection) {
            e.stopPropagation();
            onToggleSelection();
        } else {
            onClick();
        }
    };

    const handleDeleteClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete();
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowDeleteConfirm(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`
        relative overflow-hidden cursor-pointer group h-full flex flex-col
        bg-white rounded-3xl border-b-4 ${isSelected ? 'border-brand-sky ring-4 ring-brand-sky/30' : 'border-gray-200'} 
        shadow-sm hover:border-gray-300 hover:shadow-md transition-all active:scale-95
      `}
        >
            {isEditMode && (
                <div className="absolute top-3 left-3 z-20">
                    {isSelected ? (
                        <div className="bg-brand-sky text-white rounded-lg p-1 shadow-sm">
                            <CheckSquare size={24} />
                        </div>
                    ) : (
                        <div className="bg-white/80 text-gray-400 rounded-lg p-1 shadow-sm hover:text-brand-sky">
                            <Square size={24} />
                        </div>
                    )}
                </div>
            )}

            <div className={`h-32 ${cssClass} flex items-center justify-center relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute opacity-20 transform rotate-12 -right-6 -top-6 text-8xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {course.icon}
                </div>
                <div className="text-6xl drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-300">{course.icon}</div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-gray-800 text-xl leading-tight">{course.title}</h3>
                        {course.totalProgress === 100 && <span className="text-green-500">✅</span>}
                    </div>
                    <p className="text-gray-400 text-sm font-bold mb-6 flex items-center gap-2">
                        <BookOpen size={14} />
                        {course.units.length} Kapitel
                        <span className="text-gray-300">•</span>
                        {course.professor || 'AI Tutor'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden border border-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${course.themeColor === 'brand-purple' ? 'bg-brand-purple' :
                                course.themeColor === 'brand-green' ? 'bg-brand-green' :
                                    course.themeColor === 'brand-orange' ? 'bg-brand-orange' :
                                        course.themeColor === 'brand-red' ? 'bg-brand-red' :
                                            course.themeColor === 'brand-pink' ? 'bg-brand-pink' :
                                                course.themeColor === 'brand-sky' ? 'bg-brand-sky' :
                                                    course.themeColor === 'brand-teal' ? 'bg-brand-teal' :
                                                        course.themeColor === 'brand-burgundy' ? 'bg-brand-burgundy' :
                                                            course.themeColor === 'brand-yellow' ? 'bg-brand-yellow' :
                                                                course.themeColor === 'brand-lime' ? 'bg-brand-lime' :
                                                                    course.themeColor === 'brand-fuchsia' ? 'bg-brand-fuchsia' :
                                                                        'bg-brand-blue'
                                }`}
                            style={{ width: `${course.totalProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <span>Fortschritt</span>
                        <span className="text-gray-600">{course.totalProgress}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const {
        courses,
        userStats,
        currentFolderId,
        isEditMode,
        selectedItemIds,
        selectCourse,
        deleteCourse,
        deleteFolder,
        navigateTo,
        navigateToFolder,
        toggleEditMode,
        toggleItemSelection,
        moveItems,
        reorderItems
    } = useAppStore();

    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddFolderModal, setShowAddFolderModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (!userStats) return null;

    const handleSelectCourse = (course: Course) => {
        if (isEditMode) return;
        selectCourse(course);
        navigateTo('COURSE_MAP');
    };

    const handleSelectFolder = (folderId: string) => {
        // Allow navigation in edit mode to facilitate moving items deeply
        navigateToFolder(folderId);
    };

    const handleMoveHere = () => {
        if (selectedItemIds.length === 0) return;
        moveItems(selectedItemIds, currentFolderId || null);
    };

    const currentItems = courses.filter(item => item.parentFolderId === (currentFolderId || null));
    const parentFolder = currentFolderId ? (courses.find(c => c.id === currentFolderId) as Folder) : null;

    const handleBack = () => {
        if (parentFolder) {
            navigateToFolder(parentFolder.parentFolderId || null);
        } else {
            navigateToFolder(null);
        }
    };

    // --- Drag & Drop Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        // 1. Reordering within the same list
        const oldIndex = currentItems.findIndex(item => item.id === activeId);
        const newIndex = currentItems.findIndex(item => item.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
            // It's a reorder
            const newOrder = arrayMove(currentItems, oldIndex, newIndex);

            // We need to construct the full new courses array
            // Filter out current items from global list, then splice in new order
            const otherItems = courses.filter(item => item.parentFolderId !== (currentFolderId || null));
            // Merging is tricky if we don't know exact positions.
            // EASIER: Just swap indices in the global array if they are contiguous?
            // Actually, we just need to persist the order. 
            // For simplicity, let's just update the local order and save.
            // But wait, arrayMove only works on the filtered list.

            // Correct approach: Reconstruct the global list based on the new local order + others
            // BUT, others might be scattered.
            // Let's assume the global list order matters for display.
            // We'll map the reordered local items back to their original "slots" or just append them?
            // A simple approach: remove currentItems from global, then push newOrder? No, that breaks mixed order if flattened.
            // Let's just use reorderItems logic in store to handle the full list update? 
            // Actually, arrayMove works on indices. 

            const globalOldIndex = courses.findIndex(i => i.id === activeId);
            const globalNewIndex = courses.findIndex(i => i.id === overId);

            const newGlobalOrder = arrayMove(courses, globalOldIndex, globalNewIndex);
            reorderItems(newGlobalOrder);
            return;
        }

        // 2. Dragging INTO a folder (if overId is a folder)
        const overItem = courses.find(c => c.id === overId);
        if (overItem && overItem.type === 'folder' && overItem.id !== activeId) {
            // Check if we are dropping ONTO the folder (not just reordering near it)
            // dnd-kit sortable is tricky for "dropping into".
            // usually requires a separate droppable or collision detection strategy.
            // For now, let's stick to reordering.
            // TODO: Implement "Move to Folder" via Drag & Drop later or strict "Droppable" zones.
            // For MVP Edit Mode: Just Reorder.
        }
    };

    const activeItem = activeId ? courses.find(c => c.id === activeId) : null;

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Top Bar - Compact iOS Style (Responsive) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-2 md:py-4 md:px-8 transition-all">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-green rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-sm border border-green-200 transition-all">
                            {userStats.activeAvatar}
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <HeaderStat
                            icon={<Flame className="fill-current" />}
                            value={`${userStats.currentStreak}`}
                            color="bg-orange-400"
                        />
                        <HeaderStat
                            icon={<Trophy className="fill-current" />}
                            value={userStats.totalXp.toLocaleString()}
                            color="bg-yellow-400"
                        />
                        <HeaderStat
                            icon={<Coins className="fill-current" />}
                            value={userStats.coins.toLocaleString()}
                            color="bg-brand-purple"
                            onClick={() => navigateTo('SHOP')}
                        />
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex flex-col mb-6 gap-2">
                        {currentFolderId && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-500 font-bold hover:text-brand-sky transition-colors mb-2 w-fit"
                            >
                                <ChevronLeft size={20} />
                                Zurück
                            </button>
                        )}
                        <div className="flex justify-between items-end gap-4 flex-wrap">
                            <h3 className="text-2xl font-black text-gray-700">
                                {parentFolder ? parentFolder.title : 'Meine Vorlesungen'}
                            </h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={toggleEditMode}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isEditMode
                                        ? 'bg-brand-orange text-white shadow-lg shadow-orange-200 scale-105'
                                        : 'bg-white text-gray-500 border-2 border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    {isEditMode ? <Check size={20} /> : <Pencil size={20} />}
                                    {isEditMode ? 'Fertig' : 'Bearbeiten'}
                                </button>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="hidden md:flex items-center gap-2 bg-brand-sky/10 text-brand-sky px-4 py-2 rounded-xl font-bold hover:bg-brand-sky hover:text-white transition-colors"
                                >
                                    <Plus size={20} />
                                    Neuer Kurs
                                </button>
                            </div>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={currentItems.map(i => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                                {currentItems.map(item => (
                                    <SortableItem key={item.id} id={item.id} disabled={!isEditMode}>
                                        {item.type === 'folder' ? (
                                            <FolderCard
                                                folder={item as Folder}
                                                itemCount={courses.filter(c => c.parentFolderId === item.id).length}
                                                onClick={() => handleSelectFolder(item.id)}
                                                onDelete={() => deleteFolder(item.id)}
                                                isEditMode={isEditMode}
                                                isSelected={selectedItemIds.includes(item.id)}
                                                onToggleSelection={() => toggleItemSelection(item.id)}
                                                onEdit={() => {
                                                    setEditingFolder(item as Folder);
                                                    setShowAddFolderModal(true);
                                                }}
                                            />
                                        ) : (
                                            <CourseCard
                                                course={item as Course}
                                                onClick={() => handleSelectCourse(item as Course)}
                                                onDelete={() => deleteCourse(item.id)}
                                                isEditMode={isEditMode}
                                                isSelected={selectedItemIds.includes(item.id)}
                                                onToggleSelection={() => toggleItemSelection(item.id)}
                                            />
                                        )}
                                    </SortableItem>
                                ))}

                                {/* Add Actions in Edit Mode */}
                                {isEditMode ? (
                                    <button
                                        onClick={() => setShowAddFolderModal(true)}
                                        className="border-4 border-dashed border-brand-purple/30 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-brand-purple/5 hover:border-brand-purple hover:shadow-lg transition-all group h-full min-h-[320px] animate-in fade-in zoom-in duration-300"
                                    >
                                        <div className="w-20 h-20 bg-white border-2 border-brand-purple/30 rounded-full flex items-center justify-center mb-6 group-hover:border-brand-purple group-hover:scale-110 transition-all shadow-sm">
                                            <Plus size={32} strokeWidth={4} className="text-brand-purple/50 group-hover:text-brand-purple" />
                                        </div>
                                        <span className="font-extrabold text-brand-purple/50 group-hover:text-brand-purple uppercase text-lg tracking-wide">Neuer Ordner</span>
                                    </button>
                                ) : (
                                    /* Normal Add Course Placeholder */
                                    !currentFolderId && (
                                        <button
                                            onClick={() => setShowImportModal(true)}
                                            className="border-4 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-brand-sky hover:shadow-lg transition-all group h-full min-h-[320px] bg-white/50"
                                        >
                                            <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center mb-6 group-hover:border-brand-sky group-hover:scale-110 transition-all shadow-sm">
                                                <Plus size={32} strokeWidth={4} className="text-gray-300 group-hover:text-brand-sky" />
                                            </div>
                                            <span className="font-extrabold text-gray-400 group-hover:text-brand-sky uppercase text-lg tracking-wide">Kurs Hinzufügen</span>
                                            <span className="text-xs font-bold text-gray-300 mt-2 uppercase">(Import via JSON)</span>
                                        </button>
                                    )
                                )}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeItem ? (
                                <div className="opacity-80 scale-105 rotate-3 cursor-grabbing">
                                    {activeItem.type === 'folder' ? (
                                        <FolderCard
                                            folder={activeItem as Folder}
                                            itemCount={0}
                                            onClick={() => { }}
                                            onDelete={() => { }}
                                        />
                                    ) : (
                                        <CourseCard
                                            course={activeItem as Course}
                                            onClick={() => { }}
                                            onDelete={() => { }}
                                        />
                                    )}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Floating Action Bar for Bulk Move */}
            {isEditMode && selectedItemIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-brand-sky/10 text-brand-sky font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <FileStack size={18} />
                        {selectedItemIds.length} ausgewählt
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button
                        onClick={handleMoveHere}
                        className="bg-brand-sky text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-500 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-sky-200"
                    >
                        <FolderInput size={18} />
                        Hierhin verschieben
                    </button>
                </div>
            )}

            {showImportModal && <AiImportModal onClose={() => setShowImportModal(false)} />}
            {showAddFolderModal && (
                <AddFolderModal
                    onClose={() => {
                        setShowAddFolderModal(false);
                        setEditingFolder(undefined);
                    }}
                    existingFolder={editingFolder}
                />
            )}
        </div>
    );
};
