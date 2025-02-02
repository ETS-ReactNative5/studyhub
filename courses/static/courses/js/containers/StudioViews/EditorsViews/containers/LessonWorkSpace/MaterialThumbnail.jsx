import React from 'react'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
// import { FaGripHorizontal, FaTimes } from 'react-icons/fa'

import Paper from '@material-ui/core/Paper'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import { goToMaterial, deleteMaterial } from '../../../../../actions/studio'
import { DragItemTypes } from '../../../../../dnd'

export const dragSource = {
  beginDrag (props) {
    return { uuid: props.uuid }
  }
}

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

const initialState = {
  // context menu
  mouseX: null,
  mouseY: null
}

const MaterialThumbnailComponent = props => {
  const {
    onDeleteClick, selected, isDragging, onClick,
    connectDragSource, shortText, screenshot, position,
    connectDragPreview, index
  } = props

  const [state, setState] = React.useState(initialState)

  // context menu
  // TODO we have this bug now , fix this later https://github.com/mui-org/material-ui/issues/19145
  const handleMaterialThumbnailClick = event => {
    event.preventDefault()
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    })
  }

  const handleContextMenuClose = (event, menuName) => {
    event.preventDefault()
    setState(initialState)
    if (menuName === 'delete') {
      if (window.confirm('Are you sure you want to delete this material?')) {
        onDeleteClick()
      }
    }
  }

  // function handleDeleteClick (e) {
  //   e.preventDefault()
  //   if (window.confirm('Are you sure you want to delete this material?')) {
  //     onDeleteClick()
  //   }
  // }

  return (<Paper
    onClick={onClick}
    onContextMenu={handleMaterialThumbnailClick}
    elevation={3}
    className={
      'material-thumbnail draggable' +
          (selected ? ' selected' : '')
    }> {connectDragPreview(connectDragSource(
      <div
        style={{ display: isDragging ? 'none' : 'block', overflow: 'hidden', height: '100%'}}
      >
        {/* {connectDragSource(<span className='drag-handle'><FaGripHorizontal /></span>)} */}
        {/* TODO: we need to rewrite server side logic of index/position (this is not consecutive now) */}
        {/* <span className='position'>{position}</span> */}
        <span className='position'>{index}</span>
        <div className='thumbnail-inner' style={{height: '100%'}}>
          {screenshot
            ? <img
              src={screenshot + '?' + Math.random().toString(36).substring(2, 15)}
              style={{height: '100%', width: '100%'}}/>
            : <div style={{height: '100%'}}>{shortText}</div>
          }
        </div>
        {/* <FaTimes className='btn-delete' onClick={handleDeleteClick} /> */}
        <Menu
          keepMounted
          open={state.mouseY !== null}
          onClose={handleContextMenuClose}
          anchorReference='anchorPosition'
          anchorPosition={
            state.mouseY !== null && state.mouseX !== null
              ? { top: state.mouseY, left: state.mouseX }
              : undefined
          }
        >
          {/* <MenuItem onClick={(e) => { handleContextMenuClose(e, 'fork') }}>Fork</MenuItem> */}
          <MenuItem onClick={(e) => { handleContextMenuClose(e, 'delete') }}>Delete</MenuItem>
        </Menu>
      </div>
    ))
    } </Paper>)
}

MaterialThumbnailComponent.propTypes = {
  shortText: PropTypes.string,
  screenshot: PropTypes.string,
  onClick: PropTypes.func,
  uuid: PropTypes.string, // material uuid
  // position: PropTypes.string, // material position
  index: PropTypes.number, // material index
  lessonUuid: PropTypes.string.isRequired, // lesson uuid
  connectDragSource: PropTypes.func.isRequired,
  connectDragPreview: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  selected: PropTypes.bool
}

const mapStateToProps = (state, ownProps) => {
  const uuid = ownProps.uuid || ownProps.match.params.uuid
  var q = state.studio.materials[uuid]
  return {
    shortText: q.name,
    screenshot: q.screenshot,
    position: q.position
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const uuid = ownProps.uuid || ownProps.match.params.uuid
  return {
    onClick: e => dispatch(goToMaterial(uuid, ownProps.lessonUuid)),
    onDeleteClick: () => dispatch(deleteMaterial(uuid))
  }
}

export default DragSource(DragItemTypes.MATERIAL, dragSource, collect)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MaterialThumbnailComponent)
)
