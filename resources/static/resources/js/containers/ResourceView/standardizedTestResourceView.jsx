import React from 'react'

import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {Container, Row, Col, Image} from 'react-bootstrap'
import {FaPlus, FaImage} from 'react-icons/fa'

import {DockableDropTarget, DragItemTypes} from '../../dnd'
import Problem from './Components/problem'
import * as resourcesCreators from '../../actions/resources'
import * as profileCreators from '../../actions/profile'
// import * as reactCommentsCreators from '../../actions/reactComments'
import {checkNestedProp} from '../../utils'

class StandardizedTestResourceView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      chapterEditModeId: null,
      resourceEditMode: false
    }

    this.titleSet = false

    this.addProblemClick = this.addProblemClick.bind(this)
    this.onChangeProblemTitle = this.onChangeProblemTitle.bind(this)
    this.onRemoveProblem = this.onRemoveProblem.bind(this)
  }

  componentDidMount () {
    if (!this.props.profile) {
      this.props.profileActions.fetchProfileMe()
    }
  }

  componentDidUpdate (prevProps) {
    // TODO no need this due external thread component
    // if (
    //   // we get resource via props!
    //   (prevProps.resource !== this.props.resource && this.props.resource) || // reload
    //   (this.props.resource && !this.props.thread) // new
    // ) {
    //   // reload thread
    //   this.props.reactCommentsActions.fetchThread(this.props.resource.thread)
    // }

    // title / metatags
    if (this.props.resource && !this.titleSet) {
      let title = this.props.resource.title

      // TODO refactor this
      if (!title && this.props.resource.metadata) {
        try {
          title = this.props.resource.metadata.data.volumeInfo.title
        } catch (e) {
          if (e instanceof TypeError) {
            title = 'Unknown resource'
          } else {
            throw e
          }
        }
      }

      // authors
      let authorsStr = ''
      if (checkNestedProp(this.props, ...'resource.metadata.data.volumeInfo.authors'.split('.'))) {
        authorsStr = this.props.resource.metadata.data.volumeInfo.authors.map(function (author, i) {
          return author
        }).join(' ')
      }

      document.title = authorsStr + ' ' + title + ' Solutions - Physics is Beautiful'

      var meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = authorsStr + ' ' + title + ' textbook solutions or solutions manual for all problems and chapters.'
      document.getElementsByTagName('head')[0].appendChild(meta)

      // var resourceOwner = ''
      // if (this.props.resource.hasOwnProperty('owner')) {
      //   resourceOwner = this.props.resource.owner.display_name
      // }

      // meta = document.createElement('meta')
      // meta.name = 'author'
      // meta.content = authorsStr
      // document.getElementsByTagName('head')[0].appendChild(meta)
      //
      meta = document.createElement('meta')
      meta.name = 'date'
      meta.content = this.props.resource.updated_on ? this.props.resource.updated_on : this.props.resource.created_on
      document.getElementsByTagName('head')[0].appendChild(meta)

      this.titleSet = true
    }
  }

  componentWillUnmount () {
    // clear titile
    document.title = 'Physics is Beautiful'
    // remove meta // TODO refactor this
    let element = document.getElementsByTagName('meta')['description']
    if (element && element.hasOwnProperty('parentNode')) {
      element.parentNode.removeChild(element)
    }
    element = document.getElementsByTagName('meta')['author']
    if (element && element.hasOwnProperty('parentNode')) {
      element.parentNode.removeChild(element)
    }
    element = document.getElementsByTagName('meta')['date']
    if (element && element.hasOwnProperty('parentNode')) {
      element.parentNode.removeChild(element)
    }
  }

  onRemoveProblem (problem) {
    if (confirm('Are you sure you want to delete this problem?')) { // TODO we can use Modal from react bootstrap if needed
      this.props.resourcesActions.removeProblemReloadResource(problem, this.props.resource)
    }
  }

  editResourceClick () {
    this.setState({
      resourceEditMode: !this.state.resourceEditMode
    })
  }

  addProblemClick (chapter) {
    this.setState({
      chapterEditModeId: null
    })
    // add problem to list
    this.props.resourcesActions.addProblem(chapter.id + '.' + (chapter.problems.length + 1), chapter, this.props.resource)
  }

  onChangeProblemTitle (value, problem) {
    // update problem title
    let newProblem = {uuid: problem.uuid, title: value, position: problem.position}
    this.props.resourcesActions.updateProblemReloadResource(newProblem, this.props.resource)
  }

  onProblemDroppedBefore (problemBefore, droppedProblem, newParentChapter) {
    let updateProblem = {
      uuid: droppedProblem.uuid,
      textbook_section_id: newParentChapter.id
    }

    if (problemBefore) {
      updateProblem['position'] = problemBefore.position
    }

    this.props.resourcesActions.updateProblemReloadResource(updateProblem, this.props.resource)
  }

  // onChangeChapterShowAd (chapter, checked) {
  //   let updateChapter = {id: chapter.id, show_ad: checked, position: chapter.position}
  //   // this.props.resourcesActions.updateChapter(updateChapter)
  //   // needs to reload to refres View mode
  //   this.props.resourcesActions.updateChapterReloadResource(updateChapter, this.props.resource)
  // }

  // addGoogleAdClick () {
  //   let ad = {'slot': 111, 'client': 'ca-pub-1780955227395785'}
  //   this.props.googleActions.addAd(ad, this.props.resource)
  // }

  render () {
    var haveEditAccess = false
    if (this.props.profile &&
      this.props.profile.is_anonymous !== true &&
      this.props.profile.is_staff === true) {
      haveEditAccess = true
    }

    let title = this.props.resource.title

    // TODO refactor this
    if (!title && this.props.resource.metadata) {
      try {
        title = this.props.resource.metadata.data.volumeInfo.title
      } catch (e) {
        if (e instanceof TypeError) {
          title = 'Unknown resource'
        } else {
          throw e
        }
      }
    }

    return (
      <Container fluid>
        <Row>
          <Col sm={12} md={12}>
            <span style={{position: 'relative', float: 'right', fontSize: 10}}>
              {haveEditAccess
                ? <span className={'base-circle-edit'}>
                  [<span
                    onClick={() => this.editResourceClick()}
                    className={'blue-text'}
                    style={{cursor: 'pointer'}}>
                    {this.state.resourceEditMode
                      ? 'View'
                      : 'Edit'}
                  </span>]
                </span>
                : null}
            </span>
            <h1 className={'textbook-title text-align-center'}>
              {title} Solutions
            </h1>
          </Col>
        </Row>
        <Row>
          <Col sm={9} md={9}>
            {this.props.resource.problems ? this.props.resource.problems.map(function (problem, i) { // ============ problems
              return <Row key={problem.uuid}>
                <Col sm={12} md={12}>
                  <DockableDropTarget
                    key={problem.id}
                    onDrop={(droppedChapter) => {
                      this.onProblemDroppedBefore(problem, droppedChapter)
                    }}
                    itemType={DragItemTypes.CHAPTER}
                    self={problem}
                    idAttr={'id'}
                  >
                    <Problem
                      resource={this.props.resource}
                      resourceEditMode={this.state.resourceEditMode}
                      onChangeProblemTitle={this.onChangeProblemTitle}
                      onRemoveProblem={this.onRemoveProblem}
                      key={problem.uuid}
                      problem={problem}
                    />
                  </DockableDropTarget>
                </Col>
              </Row>
            }, this)
              : null
            }
            {this.state.resourceEditMode
              ? <DockableDropTarget
                onDrop={(droppedChapter) => {
                  this.onChapterDroppedBefore(null, droppedChapter)
                }}
                itemType={DragItemTypes.CHAPTER}
                self={null}
                idAttr={'id'}
              >
                <div // Add chapter button
                  style={{cursor: 'pointer'}}
                  onClick={() => this.addChapterClick()}
                  className={'blue-text'}>
                  <FaPlus/> Add chapter
                </div>
                {/* <div // Add google ads button */}
                {/* style={{cursor: 'pointer'}} */}
                {/* onClick={() => this.addGoogleAdClick()} */}
                {/* className={'blue-text'}> */}
                {/* <Glyphicon glyph='plus' /> Add Google ad */}
                {/* </div> */}
              </DockableDropTarget> : null
            }
          </Col>
          <Col sm={3} md={3}>
            <div
              style={{
                paddingBottom: '1rem',
                fontSize: '10rem',
                overflow: 'hidden',
                textAlign: 'center'
              }}>
              {this.props.resource.metadata &&
              this.props.resource.metadata.data.volumeInfo &&
              this.props.resource.metadata.data.volumeInfo.hasOwnProperty('imageLinks') &&
              this.props.resource.metadata.data.volumeInfo.imageLinks.thumbnail
                ? <Image
                  src={this.props.resource.metadata.data.volumeInfo.imageLinks.thumbnail.replace('http', 'https')}/>
                : <FaImage/>}
              {/*: <Glyphicon glyph='picture' /> }*/}
            </div>
            {this.props.resource.metadata
              ? <div style={{backgroundColor: '#EDEDED', padding: '1rem'}}>
              {/*<Row>*/}
                {/*<Col>*/}
                  {/*<a href={}>Click to view the test</>*/}
                {/*</Col>*/}
              {/*</Row>*/}
                <Row>
                  <Col>
                    <b>Test number:</b>
                    {this.props.resource.standardized_test_info.test_number
                      ? <span> {this.props.resource.standardized_test_info.test_number}</span>
                      : null}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <b>Test year:</b>
                    {this.props.resource.standardized_test_info.test_year
                      ? <span> {this.props.resource.standardized_test_info.test_year}</span>
                      : null}
                  </Col>
                </Row>
              </div> : 'Book data not found'}
          </Col>
        </Row>
      </Container>
    )
  }
}

StandardizedTestResourceView.propTypes = {
  // actions
  // reactCommentsActions: PropTypes.shape({
  //   fetchThread: PropTypes.func.isRequired,
  //   createPostWithRefreshThread: PropTypes.func.isRequired,
  //   changePostVote: PropTypes.func.isRequired,
  //   updatePostWithRefreshThread: PropTypes.func.isRequired,
  //   deletePostWithRefreshThread: PropTypes.func.isRequired
  // }),
  resourcesActions: PropTypes.shape({
    addProblem: PropTypes.func.isRequired,
    // updateChapter: PropTypes.func.isRequired,
    updateProblemReloadResource: PropTypes.func.isRequired,
    removeProblemReloadResource: PropTypes.func.isRequired
  }),
  profileActions: PropTypes.shape({
    fetchProfileMe: PropTypes.func.isRequired
  }),
  // data
  profile: PropTypes.object,
  resource: PropTypes.object,
  // thread: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    resource: state.resources.resource,
    profile: state.profile.me,
    // thread: state.reactComments.thread
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    resourcesActions: bindActionCreators(resourcesCreators, dispatch),
    // reactCommentsActions: bindActionCreators(reactCommentsCreators, dispatch),
    profileActions: bindActionCreators(profileCreators, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StandardizedTestResourceView)
export {StandardizedTestResourceView as StandardizedTestResourceViewNotConnected}
