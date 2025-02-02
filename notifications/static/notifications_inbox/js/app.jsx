import React from 'react'

import { connect } from 'react-redux'
import PropTypes from 'prop-types'

class App extends React.Component {
  render () {
    return (
      <span className='app'>
        {this.props.children}
      </span>
    )
  }
}
App.propTypes = {
  children: PropTypes.shape().isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

export default connect(mapStateToProps)(App)
export { App as AppNotConnected }
