import {masterRefresh, masterToken} from './masterTokenConstant';
let initialState = {
  accessToken: {},
  refreshToken:{},
};

export const reducer = (state = initialState, action) => {
  if (action.type === masterToken) {
    return {
      ...state,
      accessToken: action.payload,
      
    };
  }

  if (action.type === masterRefresh) {
    return {
      ...state,
      refreshToken: action.payload,
      
    };
  }
  return state;
};
