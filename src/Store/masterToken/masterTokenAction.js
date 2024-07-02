import { masterToken,masterRefresh } from './masterTokenConstant';


export const actionCreators = {
  setMasterToken: (token) => async (dispatch, getState) => {
    console.log('token', token);
    dispatch({type: masterToken, payload: token});
  },
  setRefreshToken: (token) => async (dispatch, getState) => {
    console.log('retoken', token);
    dispatch({type: masterRefresh, payload: token});
  },
};
