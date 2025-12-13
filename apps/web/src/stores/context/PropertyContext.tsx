'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Property } from '@real-estate-analyzer/types';

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
}

type PropertyAction =
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SET_SELECTED_PROPERTY'; payload: Property | null }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: { id: string; updates: Partial<Property> } }
  | { type: 'REMOVE_PROPERTY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
};

function propertyReducer(
  state: PropertyState,
  action: PropertyAction
): PropertyState {
  switch (action.type) {
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [action.payload, ...state.properties],
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.updates }
            : p
        ),
        selectedProperty:
          state.selectedProperty?.id === action.payload.id
            ? { ...state.selectedProperty, ...action.payload.updates }
            : state.selectedProperty,
      };
    case 'REMOVE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== action.payload),
        selectedProperty:
          state.selectedProperty?.id === action.payload
            ? null
            : state.selectedProperty,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface PropertyContextType {
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  return (
    <PropertyContext.Provider value={{ state, dispatch }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}

