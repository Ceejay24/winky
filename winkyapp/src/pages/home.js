import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

import Wink from '../components/wink/Wink';
import Profile from '../components/profile/Profile';
import WinkSkeleton from '../util/WinkSkeleton';

import { connect } from 'react-redux';
import { getWinks } from '../redux/actions/dataActions';

class home extends Component {
  componentDidMount() {
    this.props.getWinks();
  }
  render() {
    const { winks, loading } = this.props.data;
    let recentWinksMarkup = !loading ? (
      winks.map((wink) => <Wink key={wink.winkId} wink={wink} />)
    ) : (
      <WinkSkeleton />
    );
    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {recentWinksMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  getWinks: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getWinks }
)(home);