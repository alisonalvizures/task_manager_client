import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import Card from './card';
import { PlusIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const List = ({ list, onMoveCard, onAddCard, onDeleteCard, onDeleteList, canEdit }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'card',
    drop: (item) => {
      if (item.listId !== list._id) {
        onMoveCard(item.id, list._id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard.title.trim()) return;

    await onAddCard(list._id, newCard);
    setNewCard({ title: '', description: '', priority: 'medium' });
    setShowAddCard(false);
  };

  return (
    <div
      ref={drop}
      className={`
        bg-gray-100 rounded-lg min-h-96 w-80 flex-shrink-0
        ${isOver ? 'bg-gray-200 ring-2 ring-blue-300' : ''}
      `}
    >
      {/* List Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex-1">{list.title}</h3>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {list.cards?.length || 0}
          </span>
          {canEdit && (
            <button
              onClick={() => onDeleteList(list._id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {list.cards?.map((card) => (
          <Card
            key={card._id}
            card={card}
            onDelete={onDeleteCard}
            canEdit={canEdit}
          />
        ))}
        
        {/* Add Card Form/Button */}
        {canEdit && (
          <>
            {showAddCard ? (
              <form onSubmit={handleAddCard} className="space-y-3">
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  placeholder="Título de la tarjeta"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                  placeholder="Descripción (opcional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <select
                  value={newCard.priority}
                  onChange={(e) => setNewCard({ ...newCard, priority: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Prioridad Baja</option>
                  <option value="medium">Prioridad Media</option>
                  <option value="high">Prioridad Alta</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex-1"
                  >
                    Agregar Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCard(false);
                      setNewCard({ title: '', description: '', priority: 'medium' });
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddCard(true)}
                className="w-full p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm">Agregar tarjeta</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default List;