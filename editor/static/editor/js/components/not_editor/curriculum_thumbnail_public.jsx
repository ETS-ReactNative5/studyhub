import React from 'react'
import ReactDOM from 'react-dom'

import PropTypes from 'prop-types'
import Moment from 'react-moment'
import { Dropdown, DropdownItem } from 'react-bootstrap'
import { RingLoader } from 'react-spinners'
import copy from 'copy-to-clipboard'
import { FaEllipsisV, FaGraduationCap, FaInfoCircle, FaCodeBranch, FaShareAlt, FaMinus, FaPlus } from 'react-icons/fa'

import { addCurriculum, addCurriculumToDashboard, removeCurriculumFromDashboard } from './../../actions'
import { history } from '../../history'
import { Thumbnail } from './../thumbnail'
import { store } from '../../app'
import { Overlay } from '../fullscreen_overlay'

// class CurriculumMenuToggle extends React.Component {
//   constructor (props, context) {
//     super(props, context)
//     this.handleClick = this.handleClick.bind(this)
//   }
//
//   handleClick (e) {
//     e.preventDefault()
//     this.props.onClick(e)
//   }
//
//   render () {
//     return (
//       <FaEllipsisV onClick={this.handleClick} style={{fontSize: '2rem'}}>
//         {this.props.children}
//       </FaEllipsisV>
//     )
//   }
// }

// CurriculumMenuToggle.propTypes = {
//   onClick: PropTypes.func
// }

export class CurriculumThumbnailPublic extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.onTitleClick = this.onTitleClick.bind(this)
    this.onLearnSelect = this.onLearnSelect.bind(this)
    this.onViewProfileSelect = this.onViewProfileSelect.bind(this)
    this.onForkSelect = this.onForkSelect.bind(this)
    this.onCopyShareableLink = this.onCopyShareableLink.bind(this)
    this.onAddToDashboardSelect = this.onAddToDashboardSelect.bind(this)
    this.onRemoveFromDashboardSelect = this.onRemoveFromDashboardSelect.bind(this)
    this.state = {showSpinnerOverlay: false}
    this.CurriculumMenuToggle = React.forwardRef(({ children, onClick }, ref) => {
      return (
        <FaEllipsisV
          ref={ref}
          onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
          style={{fontSize: '2rem'}}>
          {children}
        </FaEllipsisV>
      )
    })
  }

  onLearnSelect () {
    window.open('/curriculum/' + this.props.curriculum.uuid + '/', '_self')
  }

  onViewProfileSelect () {
    history.push('/curriculum/profile/' + this.props.curriculum.uuid + '/')
  }

  onTitleClick () {
    window.open('/curriculum/' + this.props.curriculum.uuid + '/', '_self')
  }

  onCopyShareableLink (e) {
    copy(window.location.origin + '/curriculum/' + this.props.curriculum.uuid + '/')
  }

  onAddToDashboardSelect (e) {
    store.dispatch(addCurriculumToDashboard(this.props.curriculum.uuid))
    if (this.props.slidesListName !== 'recentSlides') {
      this.props.onAddRemoveFromDashboardSlides('add', this.props.curriculum)
    }
  }

  onRemoveFromDashboardSelect (e) {
    store.dispatch(removeCurriculumFromDashboard(this.props.curriculum.uuid))
    if (this.props.slidesListName === 'recentSlides') {
      this.props.onAddRemoveFromDashboardSlides('remove', this.props.curriculum)
    }
  }

  onForkSelect (e) {
    this.setState({showSpinnerOverlay: true})
    store.dispatch(addCurriculum(this.props.curriculum.uuid))
  }

  render () {
    // set spinner
    const spinner = <Overlay>
      <div className='overlay-wrapper'>
        <div className='overlay-inner'>
          <RingLoader
            color={'#1caff6'}
            loading={Boolean(true)}
          />
        </div>
      </div>
    </Overlay>

    // neeed react >= 16
    // fix issue https://github.com/akiran/react-slick/issues/757 by append Dropdown.Menu to the react app DOM element
    const DropdownMenu = () =>
      ReactDOM.createPortal(
        <Dropdown.Menu rootCloseEvent={'mousedown'}>
          <DropdownItem onSelect={this.onLearnSelect} eventKey='1'>
            <FaGraduationCap /> Learn
          </DropdownItem>
          <DropdownItem onSelect={this.onViewProfileSelect} eventKey='2'>
            <FaInfoCircle /> View profile
          </DropdownItem>
          <DropdownItem onSelect={this.onForkSelect} eventKey='3'>
            <FaCodeBranch /> Fork to curriculum studio
          </DropdownItem>
          <DropdownItem onSelect={this.onCopyShareableLink} eventKey='4'>
            <FaShareAlt /> Copy shareable link
          </DropdownItem>
          { this.props.slidesListName === 'recentSlides'
            ? <DropdownItem onSelect={this.onRemoveFromDashboardSelect} eventKey='5'>
              <FaMinus /> Remove from dashboard
            </DropdownItem>
            : <DropdownItem onSelect={this.onAddToDashboardSelect} eventKey='5'>
              <FaPlus /> Add to dashboard
            </DropdownItem>
          }
        </Dropdown.Menu>,
        document.getElementById('editor-app')
      )

    return (
      <div
        className={'curriculum-card'}
        style={{'cursor': 'pointer'}}>
        {this.state.showSpinnerOverlay && spinner}
        <div
          onClick={this.onTitleClick}
          style={{paddingBottom: '1rem', overflow: 'hidden', borderRadius: '15px', height: '13rem'}}
        >
          <Thumbnail image={this.props.curriculum.image} />
        </div>
        <div>
          <Dropdown
            style={{float: 'right'}}
            id='dropdown-custom-menu'>
            <Dropdown.Toggle as={this.CurriculumMenuToggle} />
            <DropdownMenu />
          </Dropdown>
          <div onClick={this.onTitleClick} className={'blue-text'} style={{fontSize: '1.7rem'}}>
            {this.props.curriculum.name}
          </div>
          <div style={{fontSize: '1rem', paddingTop: '0.5rem', textAlign: 'left', margin: '0 0.5rem 0 0.5rem'}}>
            <a href={this.props.curriculum.author.get_absolute_url}>
              {this.props.curriculum.author.display_name}
            </a> ∙ {this.props.curriculum.count_lessons } lessons ∙ { this.props.curriculum.number_of_learners } learners
          </div>
          <div style={{fontSize: '1rem', color: 'gray', textAlign: 'left', margin: '0 0.5rem 0 0.5rem'}}>
            Created <Moment fromNow>
              {this.props.curriculum.created_on}
            </Moment> ∙ Last updated <Moment fromNow>
              {this.props.curriculum.updated_on}
            </Moment>
          </div>
        </div>
      </div>
    )
  }
}

CurriculumThumbnailPublic.propTypes = {
  // uuid: PropTypes.string.isRequired,
  // author: PropTypes.object.isRequired,
  // name: PropTypes.string.isRequired,
  curriculum: PropTypes.object.isRequired,
  slidesListName: PropTypes.string,
  onAddRemoveFromDashboardSlides: PropTypes.func
}
