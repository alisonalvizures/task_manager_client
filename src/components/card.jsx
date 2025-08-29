import React from 'react';
import { useDrag } from 'react-dnd';
import { TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

const Card = ({ card, onDelete, canEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { id: card._id, listId: card.list },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  };

  const priorityText = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      ref={drag}
      className={`
        bg-white p-4 rounded-lg shadow-sm border-l-4 cursor-move
        hover:shadow-md transition-all duration-200
        ${priorityColors[card.priority]}
        ${isDragging ? 'opacity-50 transform rotate-3' : ''}
      `}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 flex-1 leading-tight">
          {card.title}
        </h4>
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card._id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Card Description */}
      {card.description && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          {/* Priority Badge */}
          <span className={`
            px-2 py-1 rounded-full font-medium
            ${card.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
            ${card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${card.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
          `}>
            {priorityText[card.priority]}
          </span>

          {/* Due Date */}
          {card.dueDate && (
            <div className="flex items-center space-x-1 text-gray-500">
              <ClockIcon className="h-3 w-3" />
              <span>{formatDate(card.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Assigned User */}
        {card.assignedTo && (
          <div
            className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
            title={card.assignedTo.name}
          >
            {card.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;