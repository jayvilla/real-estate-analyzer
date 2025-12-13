import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Property } from '@real-estate-analyzer/types';

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<Property[]>) => {
      state.properties = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    addProperty: (state, action: PayloadAction<Property>) => {
      state.properties.unshift(action.payload);
    },
    updateProperty: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Property> }>
    ) => {
      const index = state.properties.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.properties[index] = {
          ...state.properties[index],
          ...action.payload.updates,
        };
      }
      if (state.selectedProperty?.id === action.payload.id) {
        state.selectedProperty = {
          ...state.selectedProperty,
          ...action.payload.updates,
        };
      }
    },
    removeProperty: (state, action: PayloadAction<string>) => {
      state.properties = state.properties.filter(
        (p) => p.id !== action.payload
      );
      if (state.selectedProperty?.id === action.payload) {
        state.selectedProperty = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProperties,
  setSelectedProperty,
  addProperty,
  updateProperty,
  removeProperty,
  setLoading,
  setError,
} = propertySlice.actions;

export default propertySlice.reducer;

