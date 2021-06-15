import React from 'react'
import {compose} from 'react-recompose';
import {
  Menu,
  MenuItem,
  withStyles
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'
import CopyIcon from '@material-ui/icons/FileCopy'
import EditIcon from '@material-ui/icons/Edit'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrapPlugin from '@fullcalendar/bootstrap'

import EventEditor from './eventEditor'
import InfoSnackbar from './infoSnackbar'
import ErrorSnackbar from './errorSnackbar'
import LoadingBar from './loadingBar'

import {ActivityExecutionService, Field} from "../services/activity-execution-service"

// define range of calendar view
const START_DATE = '2022-07-23'
const END_DATE = '2022-08-07' // end date + 1
const LOCAL = "DE"

const styles = theme => ({
  eventContent: {
    height: "100%"
  },
})

class CalendarManager extends React.Component {
  constructor() {
    super()

    this.state = {
      activityId: 0,                                // activity ID
      activityExecutionService: new ActivityExecutionService(),
      availableLanguages: [],                       // executions can have same or less languages then the activity

      event: null,                                  // working event
      events: [],                                   // fullcalendar source for events
      spots: [],                                    // spots including available fields
      calendarRef: React.createRef(),               // reference to full calendar

      showEditor: false,    // flag to open editor
      loading: true,        // flag to trigger loading icon
      error: null,          // to trigger error banner
      success: null,        // to trigger success banner
      mouseX: null,         // position of context menu
      mouseY: null          // position of context menu
    }

    this.handleOnClose = this.handleOnClose.bind(this)
    this.handleEventRemove = this.handleEventRemove.bind(this)
    this.handleEventCopy = this.handleEventCopy.bind(this)
    this.renderSumEvent = this.renderSumEvent.bind(this)
    this.renderEventContent = this.renderEventContent.bind(this)
    this.handleContextMenuClick = this.handleContextMenuClick.bind(this)
    this.handlContextMenuClose = this.handlContextMenuClose.bind(this)
  }

  componentDidMount() {
    const { activityId, availableLanguages, spots } = this.props

    // todo: improve error handling
    this.state.activityExecutionService.getAll(this.props.activityId).then((result) => {
      this.setState({
        activityId: activityId,
        availableLanguages: availableLanguages,
        events: result,
        spots: spots,
        loading: false,
      })
    })
  }

  // converts javascript date to readable outut
  convertToReadableTime(datetime) {
    let date = datetime.toLocaleDateString(LOCAL)
    let time = datetime.toLocaleTimeString(LOCAL)

    return [date, time].join(" ")
  }

  handleOnClose() {
    this.handlContextMenuClose()
    this.setState({
      showEditor: false
    })
  }

  handleDateSelect = (selectInfo) => {
    let event = {
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: false
    }

    this.setState({
      showEditor: true,
      event: event
    })
  }

  convertFormEventToFullCalendarEvent = (selectedEvent) => ({
    id: selectedEvent.id,
    start: selectedEvent.start,
    end: selectedEvent.end,
    extendedProps: {
      languages: selectedEvent.languages,
      amountParticipants: selectedEvent.amountParticipants,
      field: selectedEvent.field,
      spot: selectedEvent.spot
    },
    overlap: selectedEvent.overlap
  });

  handleEventSave = (selectedEvent) => {
    const event = this.convertFormEventToFullCalendarEvent(selectedEvent)
    const API = this.state.calendarRef.current.getApi()

    // if id given, update event otherwise create new one
    if(event.id) {
      // todo: better error handling
      this.state.activityExecutionService.update(this.state.activityId, event).then(result => {
        // save extended attributes to event object

        // TODO: avoid mutating the state
        this.state.event.setExtendedProp("languages", result.extendedProps.languages)
        this.state.event.setExtendedProp("spot", result.extendedProps.spot)
        this.state.event.setExtendedProp("field", result.extendedProps.field)
        this.state.event.setExtendedProp("amountParticipants", result.extendedProps.amountParticipants)
        this.state.event.setExtendedProp("hasTransport", result.extendedProps.hasTransport)

        // set base attributes to event object
        this.state.event.setProp("backgroundColor", result.color)
        this.state.event.setDates(result.start)
        this.state.event.setEnd(result.end)
        this.state.event.setProp("overlap", result.overlap)

        this.setState({
          success: "Event successfully updated",
          showEditor: false,
        })
      })
    }
    else {
      // todo: better error handling
      this.state.activityExecutionService.create(this.state.activityId, event).then(result => {
        API.addEvent(result)

        this.setState({
          success: "Event successfully created",
          showEditor: false,
        })
      })
    }
  }

  handleEventCopy(evt, eventId) {
    const API = this.state.calendarRef.current.getApi()
    let event = API.getEventById(eventId)

    if(event) {
      // todo: better event handling
      this.state.activityExecutionService.create(this.state.activityId, event).then(result => {
        API.addEvent(result)

        this.handlContextMenuClose()
        this.setState({
          success: "Event successfully copied",
          showEditor: false,
        })
      })
    }
  }

  handleEdit = (evt, eventId) => {
    const API = this.state.calendarRef.current.getApi()
    let event = API.getEventById(eventId)

    if(event) {
      this.setState({
        showEditor: true,
        event: event
      })
    }
  }

  handleEventRemove(evt, eventId) {
    const API = this.state.calendarRef.current.getApi()
    let event = API.getEventById(eventId)

    if(event) {
      if (window.confirm(`Are you sure you would like to delete the activity execution from '${ this.convertToReadableTime(event.start) }' till '${ this.convertToReadableTime(event.end) }'?`)) {
        this.state.activityExecutionService.delete(this.state.activityId, event.id).then((success) => {
          if(success) {
            event.remove()

            this.handlContextMenuClose()
            this.setState({
              showEditor: false,
              success: "Event successfully removed"
            })
          } else {
            this.handlContextMenuClose()
            this.setState({
              showEditor: false,
              error: "Could not delete event execution"
            })
          }
        })
      }
    }
  }

  handleEventDrag = (evnt) =>{
    this.state.activityExecutionService.update(this.state.activityId, evnt.event).then(result => {
      this.setState({
        success: "Event successfully moved"
      })
    })
  }

  handleEventResize = (evnt) =>{
    this.state.activityExecutionService.update(this.state.activityId, evnt.event).then(result => {
      this.setState({
        success: "Event successfully moved"
      })
    })
  }

  handleContextMenuClick = (event) => {
    event.preventDefault();

    this.setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  handlContextMenuClose = () => {
    this.setState({
      mouseX: null,
      mouseY: null
    })
  };

  // function to render the event content within the calendar
  renderEventContent(eventInfo) {
    const { classes } = this.props
    
    return (
        <>
          <div  title={ eventInfo.timeText } 
                className={ classes.eventContent } 
                onContextMenu={ this.handleContextMenuClick } 
                style={{ cursor: 'context-menu' }}
          >
            {eventInfo.timeText && (
                <span><b>{ eventInfo.timeText } </b></span>
            )}

            <Menu
              keepMounted
              open={ this.state.mouseY !== null }
              onClose={ this.handlContextMenuClose }
              anchorReference="anchorPosition"
              anchorPosition={
                this.state.mouseY !== null && this.state.mouseX !== null
                  ? { top: this.state.mouseY, left: this.state.mouseX }
                  : undefined
              }
            >
              <MenuItem onClick={ (evt) => this.handleEdit(evt, eventInfo.event.id) }><EditIcon/>Edit</MenuItem>
              <MenuItem onClick={ (evt) => this.handleEventCopy(evt, eventInfo.event.id) }><CopyIcon/>Copy</MenuItem>
              <MenuItem size="small" onClick={ (evt) => this.handleEventRemove(evt, eventInfo.event.id) }><DeleteIcon/>Delete</MenuItem>
            </Menu>
          </div>
        </>
    )
  }

  // render top information div displaying current events
  renderSidebar() {
    return (
        <div className='calendar-manager-sidebar'>
          <div className='calendar-manager-sidebar-section'>
            <h2>Date range</h2>
            <p> Only dates can be seleceted between { START_DATE } - { END_DATE }</p>
          </div>
          <div className='calendar-manager-sidebar-section'>
            <h2>All Events ({ this.state.events.length })</h2>
            <ul>
              { this.state.events.map(this.renderSumEvent) }
            </ul>
          </div>
        </div>
    )
  }

  // render event information within top information div
  renderSumEvent(event) {
    return (
        <li key={ event.id }>
          <i>{ event.title } - </i>
          <b>
            { event.start && (
                this.convertToReadableTime(event.start)
            )}
          </b>
          -
          <b>
            { event.end && (
                this.convertToReadableTime(event.end)
            )}
          </b>
          { event.extendedProps && (
              <div>
                <i>{ event.extendedProps.language_flags } - </i>
                <i>{ event.extendedProps.amountParticipants } - </i>
                <i>{ event.extendedProps.spot.name }</i>
              </div>
          )}
        </li>
    )
  }

  renderHelperElements() {
    return (
        <div>
          {this.state.error && (
              /* Show error bar based on flag*/
              <ErrorSnackbar
                  onClose={ () => this.setState({ error: null }) }
                  message={ this.state.error.message }
              />
          )}

          {this.state.loading && (
              /* Show loading based on flag*/
              <LoadingBar/>
          )}

          {this.state.success && (
              /* show info bar based on flag*/
              <InfoSnackbar
                  onClose={ () => this.setState({ success: null }) }
                  message={ this.state.success }
              />
          )}
        </div>
    )
  }

  render() {
    return (
        <div className='calendar-manager'>
          { this.renderSidebar() }

          <div className='calendar-manager-main' >
            { this.state.showEditor && (
                /* Show editor based on flag*/
                <EventEditor
                    onSave={ this.handleEventSave }
                    onDelete={ this.handleEventRemove }
                    onClose={ this.handleOnClose }
                    onCopy={ this.handleEventCopy }
                    event={ this.state.event }
                    events={ this.state.events }
                    availableLanguages={ this.state.availableLanguages }
                    spots={ this.state.spots }
                />
            )}

            {/* display fullcalendar */ }
            {this.state.calendarRef && (
                <FullCalendar
                    ref={ this.state.calendarRef }
                    plugins={ [bootstrapPlugin, dayGridPlugin, timeGridPlugin, interactionPlugin] }
                    headerToolbar={ {
                      left: 'prev,next',
                      center: 'title',
                      right: 'timeGridWeek,timeGridDay'
                    } }
                    locale="DE"
                    themeSystem='bootstrap'
                    allDaySlot={ false }                                  // don't allow full day event
                    firstDay={ 6 }                                        // set first day of week to saturday 6
                    validRange={ { start: START_DATE, end: END_DATE } }   // calendar is only available in given period
                    initialView='timeGridWeek'
                    editable={ true }
                    selectable={ true }
                    selectMirror={ true }
                    dayMaxEvents={ false }
                    eventContent={ this.renderEventContent }              // custom render function
                    eventClick={ this.handleEventClick }
                    eventResize={ this.handleEventResize }
                    eventDrop={ this.handleEventDrag }
                    events={ this.state.events }
                    select={ this.handleDateSelect }
                    contentHeight="auto"
                />
            )}
          </div>

          { this.renderHelperElements() }
        </div>
    )
  }
}

export default compose(
  withStyles(styles),
)(CalendarManager);