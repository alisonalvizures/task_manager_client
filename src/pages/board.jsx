import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../context/authContext';
import API from '../utils/api';
import List from '../components/list';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBoard();
  }, [id, user, navigate]);

  const fetchBoard = async () => {
    try {
      const response = await API.get(`/boards/${id}`);
      setBoard(response.data);
    } catch (error) {
      console.error('Error fetching board:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const response = await API.post('/lists', {
        title: newListTitle,
        boardId: id
      });
      
      setBoard(prev => ({
        ...prev,
        lists: [...prev.lists, { ...response.data, cards: [] }]
      }));
      
      setNewListTitle('');
      setShowCreateList(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleMoveCard = async (cardId, targetListId) => {
    try {
      await API.put(`/cards/${cardId}/move`, {
        newListId: targetListId
      });
      
      // Actualizar el estado local
      const updatedBoard = { ...board };
      let movedCard = null;
      
      // Encontrar y remover la tarjeta de su lista actual
      updatedBoard.lists.forEach(list => {
        const cardIndex = list.cards.findIndex(card => card._id === cardId);
        if (cardIndex !== -1) {
          movedCard = list.cards.splice(cardIndex, 1)[0];
        }
      });
      
      // Agregar la tarjeta a la nueva lista
      if (movedCard) {
        const targetList = updatedBoard.lists.find(list => list._id === targetListId);
        if (targetList) {
          movedCard.list = targetListId;
          targetList.cards.push(movedCard);
        }
      }
      
      setBoard(updatedBoard);
    } catch (error) {
      console.error('Error moving card:', error);
    }
  };

  const handleAddCard = async (listId, cardData) => {
    try {
      const response = await API.post('/cards', {
        ...cardData,
        listId
      });
      
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(list => 
          list._id === listId 
            ? { ...list, cards: [...list.cards, response.data] }
            : list
        )
      }));
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta lista?')) return;

    try {
      await API.delete(`/lists/${listId}`);
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.filter(list => list._id !== listId)
      }));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarjeta?')) return;

    try {
      await API.delete(`/cards/${cardId}`);
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(list => ({
          ...list,
          cards: list.cards.filter(card => card._id !== cardId)
        }))
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tablero no encontrado</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
                  {board.description && (
                    <p className="text-sm text-gray-600">{board.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {board.members.slice(0, 3).map((member) => (
                    <div
                      key={member._id}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {board.members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                      +{board.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Board Content */}
        <main className="p-6">
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {/* Lists */}
            {board.lists.map((list) => (
              <List
                key={list._id}
                list={list}
                onMoveCard={handleMoveCard}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onDeleteList={handleDeleteList}
                canEdit={board.owner._id === user?.id || board.members.some(m => m._id === user?.id)}
              />
            ))}
            
            {/* Add List Button/Form */}
            <div className="min-w-80">
              {showCreateList ? (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <form onSubmit={handleCreateList}>
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Título de la lista"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
                      >
                        Agregar Lista
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateList(false);
                          setNewListTitle('');
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateList(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 rounded-lg flex items-center space-x-2 w-full min-h-32 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Agregar otra lista</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  );
};

export default Board;