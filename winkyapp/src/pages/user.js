import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Wink from '../components/wink/Wink';
import StaticProfile from '../components/profile/StaticProfile';
import Grid from '@material-ui/core/Grid';

import WinkSkeleton from '../util/WinkSkeleton';
import ProfileSkeleton from '../util/ProfileSkeleton';

import { connect } from 'react-redux';
import { getUserData } from '../redux/actions/dataActions';

class user extends Component {
  state = {
    profile: null,
    winkIdParam: null
  };
  componentDidMount() {
    const handle = this.props.match.params.handle;
    const winkId = this.props.match.params.winkId;

    if (winkId) this.setState({ winkIdParam: winkId });

    this.props.getUserData(handle);
    axios
      .get(`/user/${handle}`)
      .then((res) => {
        this.setState({
          profile: res.data.user
        });
      })
      .catch((err) => console.log(err));
  }
  render() {
    const { winks, loading } = this.props.data;
    const { winkIdParam } = this.state;

    const winksMarkup = loading ? (
      <WinkSkeleton />
    ) : winks === null ? (
      <p>No winks from this user</p>
    ) : !winkIdParam ? (
      winks.map((wink) => <Wink key={wink.winkId} wink={wink} />)
    ) : (
      winks.map((wink) => {
        if (wink.winkId !== winkIdParam)
          return <Wink key={wink.winkId} wink={wink} />;
        else return <Wink key={wink.winkId} wink={wink} openDialog />;
      })
    );

    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {winksMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          {this.state.profile === null ? (
            <ProfileSkeleton />
          ) : (
            <StaticProfile profile={this.state.profile} />
          )}
        </Grid>
      </Grid>
    );
  }
}

user.propTypes = {
  getUserData: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getUserData }
)(user);