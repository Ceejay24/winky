import {
    SET_WINKS,
    LOADING_DATA,
    LIKE_WINK,
    UNLIKE_WINK,
    DELETE_WINK,
    SET_ERRORS,
    POST_WINK,
    CLEAR_ERRORS,
    LOADING_UI,
    SET_WINK,
    STOP_LOADING_UI,
    SUBMIT_COMMENT
  } from '../types';
  import axios from 'axios';
  
  // Get all winks
  export const getWinks = () => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    axios
      .get('/winks')
      .then((res) => {
        dispatch({
          type: SET_WINKS,
          payload: res.data
        });
      })
      .catch((err) => {
        dispatch({
          type: SET_WINKS,
          payload: []
        });
      });
  };
  export const getWink = (winkId) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios
      .get(`/wink/${winkId}`)
      .then((res) => {
        dispatch({
          type: SET_WINK,
          payload: res.data
        });
        dispatch({ type: STOP_LOADING_UI });
      })
      .catch((err) => console.log(err));
  };

  // Post a wink
  export const postWink = (newWink) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    axios
      .post('/wink', newWink)
      .then((res) => {
        dispatch({
          type: POST_WINK,
          payload: res.data
        });
        dispatch(clearErrors());
      })
      .catch((err) => {
        dispatch({
          type: SET_ERRORS,
          payload: err.response.data
        });
      });
  };

  // Like a wink
  export const likeWink = (winkId) => (dispatch) => {
    axios
      .get(`/wink/${winkId}/like`)
      .then((res) => {
        dispatch({
          type: LIKE_WINK,
          payload: res.data
        });
      })
      .catch((err) => console.log(err));
  };

  // Unlike a wink
  export const unlikeWink = (winkId) => (dispatch) => {
    axios
      .get(`/wink/${winkId}/unlike`)
      .then((res) => {
        dispatch({
          type: UNLIKE_WINK,
          payload: res.data
        });
      })
      .catch((err) => console.log(err));
  };

  // Submit a comment
  export const submitComment = (winkId, commentData) => (dispatch) => {
    axios
      .post(`/wink/${winkId}/comment`, commentData)
      .then((res) => {
        dispatch({
          type: SUBMIT_COMMENT,
          payload: res.data
        });
        dispatch(clearErrors());
      })
      .catch((err) => {
        dispatch({
          type: SET_ERRORS,
          payload: err.response.data
        });
      });
  };


  export const deleteWink = (winkId) => (dispatch) => {
    axios
      .delete(`/wink/${winkId}`)
      .then(() => {
        dispatch({ type: DELETE_WINK, payload: winkId });
      })
      .catch((err) => console.log(err));
  };
  

  export const getUserData = (userHandle) => (dispatch) => {
    dispatch({ type: LOADING_DATA });
    axios
      .get(`/user/${userHandle}`)
      .then((res) => {
        dispatch({
          type: SET_WINKS,
          payload: res.data.winks
        });
      })
      .catch(() => {
        dispatch({
          type: SET_WINKS,
          payload: null
        });
      });
  };
  
  export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
  };