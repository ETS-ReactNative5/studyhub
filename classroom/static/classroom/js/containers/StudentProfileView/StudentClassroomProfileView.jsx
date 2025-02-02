import React from 'react'
import PropTypes from 'prop-types'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Draggable from 'react-draggable'

import { BASE_URL } from '../../utils/config'
import { push } from 'connected-react-router'

import * as studentCreators from '../../actions/student'
import * as tabsCreators from '../../actions/tab'
import * as assignmentCreators from '../../actions/assignment'

import { FaTimes, FaClock, FaChevronLeft, FaCog, FaCheck } from 'react-icons/fa'
import { Container, Row, Col, Image, Dropdown } from 'react-bootstrap'
import { TeacherStudentAssignmentRow } from '../../components/TeacherStudentAssignmentRow'

class StudentClassroomProfileView extends React.Component {
  constructor (props) {
    super(props)
    this.handleSettingsClick = this.handleSettingsClick.bind(this)
  }

  componentWillMount () {
    this.props.tabActions.changeSelectedTab('teacher', 'tab', history, true)
    this.props.tabActions.changeTeacherClassroomSelectedTab(
      'students', 'teacherClassroomTab', history, this.props.match
    )
    this.props.studentActions.classroomFetchStudentClassroomProfile(
      this.props.match.params['uuid'],
      this.props.match.params['username']
    )
    this.props.studentActions.classroomFetchStudentClassroomAssignmentsList(
      this.props.match.params['uuid'],
      this.props.match.params['username']
    )
  }

  handleSettingsClick (e) {
    if (e === 'remove') {
      this.props.studentActions.removeFromClass(this.props.classroomTeacher.uuid, this.props.studentClassroomProfile.username)
    }
  }

  onAssignmentTitleClick (assignment) {
    this.props.dispatch(push(BASE_URL + 'teacher/' + this.props.classroomTeacher.uuid + '/assignments/' + assignment.uuid))
  }

  render () {
    var className = 'assignment-teacher-card'
    return (
      <div>
        <Container fluid>
          <Row>
            <Col
              sm={6}
              md={6}
              xs={12}
              style={{textAlign: 'left', paddingTop: '1rem'}} >
              <a
                className={'back-button'}
                onClick={() => { this.props.dispatch(push(BASE_URL + 'teacher/' + this.props.classroomTeacher.uuid + '/students/')) }} >
                <FaChevronLeft />
                All students
              </a>
            </Col>
            <Col sm={6} md={6} xs={12} className={'text-right'}>
              {this.props.classroomTeacher && !this.props.classroomTeacher.external_classroom ? <Dropdown onSelect={this.handleSettingsClick} id='dropdown-settings'>
                <Dropdown.Toggle className={'classroom-common-button'}>
                  {/* <Glyphicon glyph='cog' />&nbsp; */}
                  <FaCog />&nbsp;
                Manage student
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey='remove'>Remove from class</Dropdown.Item>
                  {/* <Dropdown.Item eventKey='send'>Send reminder</Dropdown.Item> */}
                  {/* <Dropdown.Item eventKey='edit'>Move student</Dropdown.Item> */}
                </Dropdown.Menu>
              </Dropdown> : null}
            </Col>
          </Row>
          <Row className={className}>
            <Col sm={2} md={1} xs={2}>
              {this.props.studentClassroomProfile && this.props.studentClassroomProfile.avatar_url
                ? <Image
                  fluid
                  src={this.props.studentClassroomProfile.avatar_url}
                  roundedCircle />
                : null}
            </Col>
            <Col sm={6} md={7} xs={8}>
              { this.props.studentClassroomProfile ? <div>
                <div className={'title'}>{this.props.studentClassroomProfile.display_name}</div>
                <div className={'deep-gray-text'}>{this.props.studentClassroomProfile.username}</div></div>
                : null }
            </Col>
            <Col sm={5} md={4} xs={12} className={'vcenter'}>
              <div style={{whiteSpace: 'nowrap', marginTop: '2rem'}}>
                <span className={'green-completed-box'}>
                  <FaCheck title={'Completed'} /> &nbsp;{this.props.studentClassroomProfile ? this.props.studentClassroomProfile.counts.num_completed_assignments : ''}
                </span>
                <span className={'yellow-delayed-box'}>
                  <FaClock title={'Completed late'} />
                  &nbsp;{this.props.studentClassroomProfile ? this.props.studentClassroomProfile.counts.num_delayed_assignments : ''}
                </span>
                <span className={'red-missed-box'}>
                  <FaTimes title={'Missed'} />
                  &nbsp;{ this.props.studentClassroomProfile ? this.props.studentClassroomProfile.counts.num_missed_assignments : '' }
                </span>
              </div>
            </Col>
          </Row>
        </Container>
        {/* TODO create dynamic bounds values */}
        <Draggable
          disabled={screen.width > 380}
          axis='x'
          bounds={{left: -400 + screen.width, top: 0, right: 0, bottom: 0}}
        >
          <div style={{minWidth: '400px'}}>
            <Container fluid>
              <Row style={{padding: '1rem 2rem', margin: '0'}} className={'small-text'}>
                <Col sm={5} md={5} xs={4}>
                  <span className={'gray-text'}>Assignment</span>
                </Col>
                <Col sm={2} md={2} xs={2} className={'vcenter'}>
              Assigned on
                </Col>
                <Col sm={3} md={3} xs={3} className={'vcenter'}>
              Status
                </Col>
                <Col sm={2} md={2} xs={2} className={'vcenter'}>
              Completed on
                </Col>
              </Row>
            </Container>
            <hr style={{margin: '0'}} />
            <Container fluid>
              { this.props.studentAssignmentsList
                ? this.props.studentAssignmentsList.map(function (assignment, i) {
                  return <TeacherStudentAssignmentRow
                    isTeacher={Boolean(true)}
                    assignment={assignment}
                    onTitleClick={() => { this.onAssignmentTitleClick(assignment) }}
                    key={i} />
                }, this) : null}
            </Container>
          </div>
        </Draggable>
      </div>
    )
  }
}

StudentClassroomProfileView.propTypes = {
  classroomTeacher: PropTypes.object,
  studentClassroomProfile: PropTypes.object,
  tabActions: PropTypes.shape({
    changeTeacherClassroomSelectedTab: PropTypes.func.isRequired
  }).isRequired,
  studentActions: PropTypes.shape({
    classroomFetchStudentClassroomAssignmentsList: PropTypes.func.isRequired,
    classroomFetchStudentClassroomProfile: PropTypes.func.isRequired,
    removeFromClass: PropTypes.func.isRequired
  }).isRequired,
  studentAssignmentsList: PropTypes.array
}

const mapStateToProps = (state) => {
  return {
    // classroomStudent: state.classroom.classroomStudentClassroom,
    classroomTeacher: state.classroom.classroomTeacherClassroom,
    studentClassroomProfile: state.student.studentClassroomProfile,
    studentAssignmentsList: state.student.studentClassroomAssignments
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    // assignmentActions: bindActionCreators(assignmentCreators, dispatch),
    tabActions: bindActionCreators(tabsCreators, dispatch),
    studentActions: bindActionCreators(studentCreators, dispatch),
    assignmentActions: bindActionCreators(assignmentCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentClassroomProfileView)
export { StudentClassroomProfileView as StudentClassroomProfileViewNotConnected }
