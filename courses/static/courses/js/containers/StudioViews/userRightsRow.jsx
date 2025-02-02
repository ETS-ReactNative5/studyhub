import React from 'react'

import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import { FormGroup, DropdownButton, InputGroup, Dropdown } from 'react-bootstrap'

import { MultiSelect } from 'react-selectize'

import { findUsers, updateCourse } from '../../actions/studio'

class UserRightsRow extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchString: '',
      selectedUsers: []
    }
    this.onAddCollaboratorsClick = this.onAddCollaboratorsClick.bind(this)
  }

  onAddCollaboratorsClick () {
    if (this.state.selectedUsers.length > 0) {
      // this.props.addCollaborators(this.state.selectedUsers)
      var course = {uuid: this.props.course.uuid}
      var collaboratorsIds = []

      for (var i = 0; i < this.state.selectedUsers.length; i++) {
        collaboratorsIds.push(this.state.selectedUsers[i]['id'])
      }
      // append existing collaborators
      for (i = 0; i < this.props.course.collaborators.length; i++) {
        var id = this.props.course.collaborators[i]['id']
        if (collaboratorsIds.indexOf(id) === -1) {
          collaboratorsIds.push(id)
        }
      }

      course['collaborators_ids'] = collaboratorsIds

      this.props.updateCourse(course)
      this.setState({selectedUsers: []})
    }
  }

  render () {
    var self = this

    var onSearchChange = function (searchString_) {
      const searchString = searchString_.replace(/\W/g, '')
      self.setState({searchString: searchString})

      if (searchString.length > 0) {
        if (!self.props.findUserRequest) {
          self.props.findUsers(searchString)
        }
      }
    }

    var renderNoResultsFound = function (value, search) {
      return <div className='no-results-found' style={{fontSize: 13}}>
        {self.state.searchString.length === 0
          ? 'Start type username or display name' : 'No results found'}
      </div>
    }

    var renderOption = function (item) {
      return <div className='simple-option' style={{fontSize: 12}}>
        <div>
          <span style={{fontWeight: 'bold'}}>{item.display_name}</span>
        </div>
      </div>
    }

    var renderValue = function (item) {
      return <div className='simple-value'>
        <span style={{fontWeight: 'bold'}}>{item.display_name}</span>
        {/*<span onClick={function () {*/}
          {/*self.setState({*/}
            {/*selectedUsers: self.state.selectedUsers.splice(*/}
              {/*self.state.selectedUsers.map(function (user) { return user.id }).indexOf(item.id),*/}
              {/*1*/}
            {/*)*/}
          {/*})*/}
        {/*}}>x</span>*/}
      </div>
    }

    var onValuesChange = function (selectedUsers) {
      self.setState({
        selectedUsers: selectedUsers
      })
    }

    var filterOptions = function (options, values, search) {
      function comparer (otherArray) {
        return function (current) {
          return otherArray.filter(
            function (other) {
              return other.id === current.id
            }).length === 0
        }
      }

      var filterdOptions = options.filter(comparer(values))

      return filterdOptions
    }

    var uid = function (item) {
      if (item) {
        return item.id
      } else {
        return null
      }
    }

    var foundUsers = []
    if (this.props.foundUsers) {
      foundUsers = this.props.foundUsers.results
    }

    return (
      <FormGroup>
        <InputGroup>
          {/*<FormControl type='text' />*/}
          <MultiSelect
            placeholder='Select users'
            options={foundUsers}
            values={this.state.selectedUsers}
            search={this.state.searchString}
            onValuesChange={onValuesChange}
            onSearchChange={onSearchChange}
            uid={uid}
            renderOption={renderOption}
            renderNoResultsFound={renderNoResultsFound}
            renderValue={renderValue}
            filterOptions={filterOptions}
          />
          <DropdownButton
            // componentClass={InputGroup.Button}
            id='input-dropdown-addon'
            variant='light'
            title='Action'
          >
            <Dropdown.Item key='e' onSelect={this.onAddCollaboratorsClick}>Add collaborators</Dropdown.Item>
          </DropdownButton>
        </InputGroup>
      </FormGroup>
    )
  }
}

UserRightsRow.propTypes = {
  // actions
  findUsers: PropTypes.func.isRequired,
  updateCourse: PropTypes.func.isRequired,
  // data
  foundUsers: PropTypes.object,
  findUserRequest: PropTypes.bool,
  course: PropTypes.object.isRequired // not reducer data
}

const mapStateToProps = (state) => {
  return {
    foundUsers: state.studio.users.foundUsers,
    findUserRequest: state.studio.users.findUserRequest,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    findUsers: (searchString) => dispatch(findUsers(searchString)),
    updateCourse: (searchString) => dispatch(updateCourse(searchString))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserRightsRow)
export { UserRightsRow as UserRightsRowNotConnected }
