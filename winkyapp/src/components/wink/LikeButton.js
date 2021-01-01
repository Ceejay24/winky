import React, { Component } from 'react';
import MyButton from '../../util/MyButton';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
// Icons
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
// REdux
import { connect } from 'react-redux';
import { likeWink, unlikeWink } from '../../redux/actions/dataActions';

export class LikeButton extends Component {
  likedWink = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find(
        (like) => like.winkId === this.props.winkId
      )
    )
      return true;
    else return false;
  };
  likeWink = () => {
    this.props.likeWink(this.props.winkId);
  };
  unlikeWink = () => {
    this.props.unlikeWink(this.props.winkId);
  };
  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.likedWink() ? (
      <MyButton tip="Undo like" onClick={this.unlikeWink}>
        <FavoriteIcon color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likeWink}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  winkId: PropTypes.string.isRequired,
  likeWink: PropTypes.func.isRequired,
  unlikeWink: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  user: state.user
});

const mapActionsToProps = {
  likeWink,
  unlikeWink
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(LikeButton);