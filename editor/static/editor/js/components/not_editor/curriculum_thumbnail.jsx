import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment'

import { Col, Dropdown, DropdownItem } from 'react-bootstrap'
import { FaEllipsisV, FaEdit, FaPen, FaCodeBranch, FaShareAlt, FaTrash } from 'react-icons/fa'

import copy from 'copy-to-clipboard'

import { addCurriculum } from './../../actions'

import { Thumbnail } from './../thumbnail'
import { Overlay } from '../fullscreen_overlay'

import { store } from '../../app'
import { RingLoader } from 'react-spinners'

export class CurriculumThumbnail extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.onForkSelect = this.onForkSelect.bind(this)
    this.onEditCurriculumSelect = this.onEditCurriculumSelect.bind(this)
    this.onDeleteCurriculum = this.onDeleteCurriculum.bind(this)
    this.onEditContentSelect = this.onEditContentSelect.bind(this)
    this.onCopyShareableLink = this.onCopyShareableLink.bind(this)
    this.onTitleClick = this.onTitleClick.bind(this)
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

  // CurriculumMenuToggle.propTypes = {
  //   onClick: PropTypes.func
  // }

  onEditContentSelect (e) {
    this.props.onClick()
  }

  onTitleClick () {
    this.props.onClick()
    // window.open('/curriculum/' + this.props.uuid + '/', '_blank')
  }

  onCopyShareableLink (e) {
    copy(window.location.origin + '/curriculum/' + this.props.uuid + '/')
  }

  onEditCurriculumSelect (e) {
    this.props.onEditCurriculumProfileClick()
  }

  onDeleteCurriculum (e) {
    this.props.onDeleteCurriculumClick(this.props.uuid)
  }

  onForkSelect (e) {
    this.setState({showSpinnerOverlay: true})
    store.dispatch(addCurriculum(this.props.uuid))
  }

  render () {
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

    return (
      <Col
        sm={2}
        md={2}
        className={'curriculum-card'}
        style={{'cursor': 'pointer'}}>
        {this.state.showSpinnerOverlay && spinner}
        <div
          onClick={this.onTitleClick}
          style={{paddingBottom: '1rem', overflow: 'hidden', borderRadius: '15px', height: '13rem'}}
        >
          <Thumbnail image={this.props.image} />
        </div>
        <div>
          <Dropdown
            style={{float: 'right'}}
            id='dropdown-custom-menu'>
            <Dropdown.Toggle
              as={this.CurriculumMenuToggle}
              id='dropdown-curriculum'
            />
            <Dropdown.Menu rootCloseEvent={'click'}>
              <DropdownItem onSelect={this.onEditContentSelect} eventKey='1'>
                {/* <Glyphicon glyph='edit' /> Edit content */}
                <FaEdit /> Edit content
              </DropdownItem>
              <DropdownItem onSelect={this.onEditCurriculumSelect} eventKey='2'>
                {/* <Glyphicon glyph='pencil' /> Edit profile and settings */}
                <FaPen /> Edit profile and settings
              </DropdownItem>
              <DropdownItem onSelect={this.onForkSelect} eventKey='3'>
                {/* <Glyphicon glyph='export' /> Fork */}
                <FaCodeBranch /> Fork
              </DropdownItem>
              <DropdownItem onSelect={this.onCopyShareableLink} eventKey='4'>
                {/* <Glyphicon glyph='share-alt' /> Copy shareable link */}
                <FaShareAlt /> Copy shareable link
              </DropdownItem>
              <DropdownItem onSelect={this.onDeleteCurriculum} eventKey='5'>
                {/* <Glyphicon glyph='trash' /> Delete */}
                <FaTrash /> Delete
              </DropdownItem>
            </Dropdown.Menu>
          </Dropdown>
          <div onClick={this.onTitleClick} className={'blue-text'} style={{fontSize: '1.7rem'}}>
            {this.props.name}
          </div>
          <div style={{fontSize: '1rem', paddingTop: '0.5rem', textAlign: 'left', margin: '0 0.5rem 0 0.5rem'}}>
            <a href={this.props.author.get_absolute_url}>
              {this.props.author.display_name}
            </a> ∙ {this.props.count_lessons } lessons ∙ { this.props.number_of_learners } learners
          </div>
          <div style={{fontSize: '1rem', color: 'gray', textAlign: 'left', margin: '0 0.5rem 0 0.5rem'}}>
            Created <Moment fromNow>
              {this.props.created_on}
            </Moment> ∙ Last updated <Moment fromNow>
              {this.props.updated_on}
            </Moment>
          </div>
          {/* tags that can be use in the future */}
          {/* <div style={{textAlign: 'left', margin: '0 0.5rem 0 0.5rem'}}> */}
          {/* <div className='ReactTags__tags react-tags-wrapper'> */}
          {/* <div className='ReactTags__selected'> */}
          {/* {this.props.tags.map((tag, i) => { */}
          {/* return <span key={i} className='tag-wrapper ReactTags__tag' style={{ opacity: 1, cursor: 'auto' }}> */}
          {/* {tag} */}
          {/* </span> */}
          {/* }) */}
          {/* } */}
          {/* </div> */}
          {/* </div> */}
          {/* </div> */}
        </div>
      </Col>
    )
  }
}

CurriculumThumbnail.propTypes = {
  uuid: PropTypes.string.isRequired,
  onEditCurriculumProfileClick: PropTypes.func.isRequired,
  onDeleteCurriculumClick: PropTypes.func.isRequired
}
