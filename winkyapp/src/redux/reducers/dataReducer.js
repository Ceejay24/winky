import {
    SET_WINKS,
    LIKE_WINK,
    UNLIKE_WINK,
    LOADING_DATA,
    DELETE_WINK,
    POST_WINK,
    SET_WINK,
    SUBMIT_COMMENT
  } from '../types';
  
  const initialState = {
    winks: [],
    wink: {},
    loading: false
  };
  // eslint-disable-next-line
  export default function(state = initialState, action) {
    switch (action.type) {
      case LOADING_DATA:
        return {
          ...state,
          loading: true
        };
      case SET_WINKS:
        return {
          ...state,
          winks: action.payload,
          loading: false
        };
      case SET_WINK:
        return {
          ...state,
          wink: action.payload
        };
      case LIKE_WINK:
      case UNLIKE_WINK:
        let index = state.winks.findIndex(
          (wink) => wink.winkId === action.payload.winkId
        );
        state.winks[index] = action.payload;
        if (state.wink.winkId === action.payload.winkId) {
          state.wink = action.payload;
        }
        return {
          ...state
        };
      case DELETE_WINK:
        index = state.winks.findIndex(
          (wink) => wink.winkId === action.payload
        );
        state.winks.splice(index, 1);
        return {
          ...state
        };
      case POST_WINK:
        return {
          ...state,
          winks: [action.payload, ...state.winks]
        };
      case SUBMIT_COMMENT:
        return {
          ...state,
          wink: {
            ...state.wink,
            comments: [action.payload, ...state.wink.comments]
          }
        };
      default:
        return state;
    }
  }