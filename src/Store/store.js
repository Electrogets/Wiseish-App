import {configureStore} from '@reduxjs/toolkit';
import * as tokenReducer from './masterToken/masterTokenReducer';

export const store = configureStore({
  reducer: {
    tokenReducer: tokenReducer.reducer,
  },
});

export default store;
