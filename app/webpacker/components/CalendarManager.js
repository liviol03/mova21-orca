import React from 'react'
import { compose } from 'recompose';
import {
  Button,
  withStyles,
} from '@material-ui/core';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/common/main.css'
import '@fullcalendar/timegrid/main.css'
import '@fullcalendar/daygrid/main.css'

import EventEditor from './eventEditor'
import InfoSnackbar from './infoSnackbar';
import ErrorSnackbar from './errorSnackbar';
import LoadingBar from './loadingBar'

// define range of calendar view
const START_DATE = '2021-05-20'
const END_DATE = '2021-05-30' // end date + 1
const LOCAL = "DE"
const todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today
const styles = theme => ({
  headerButton: {
    position: 'fixed',
    top: theme.spacing(-0.5),
    right: theme.spacing(),
    color: '#f50057',
    zIndex: 1000,
    [theme.breakpoints.down('xs')]: {
      top: theme.spacing(-1),
      right: theme.spacing(0),
    }
  },
  helpIcon: {
    fontSize: '4.5em',
    color: '#2C3E50',
  }
})
// define some basic events which are being showed when starting up the application
const INITIAL_EVENTS_STANDARD = [
  {
    id: 1,
    title: 'Timed event',
    start: new Date(todayStr + 'T09:00:00'),
    end: new Date(todayStr + 'T10:00:00'),
    overlap: true
  },
  {
    id: 2,
    title: 'Timed event 2',
    start: new Date(todayStr + 'T13:00:00'),
    end: new Date(todayStr + 'T15:00:00'),
    overlap: true
  }
]
const INITIAL_EVENTS_BLOCKING = [
  {
    id: 3,
    title: "Welcome Event",
    start: new Date(todayStr + 'T10:00:00'),
    end: new Date(todayStr + 'T12:00:00'),
    overlap: false,
    rendering: 'background',
    color: '#ff9f89'
  }
]
const INITIAL_EVENTS = [...INITIAL_EVENTS_STANDARD, ...INITIAL_EVENTS_BLOCKING]

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


class CalendarManager extends React.Component {
  constructor() {
    super()

    this.state = {
      showEditor: false,    // flag to open editor
      selectInfo: null,     // fullcalendar selector
      currentEvents: INITIAL_EVENTS,

      loading: true,        // flag to trigger loading icon
      error: null,          // to trigger error banner
      success: null         // to trigger success banner
    }

    this.handleOnClose = this.handleOnClose.bind(this)
    this.handleEventRemove = this.handleEventRemove.bind(this)
    this.handleEventCopy = this.handleEventCopy.bind(this)
    this.renderSidebarEvent = this.renderSidebarEvent.bind(this)
  }

  componentDidMount() {
    this.setState({
      loading: false,
    })
  }

  // converts javascript date to readable outut
  convertToReadableTime(datetime) {
    let date = datetime.toLocaleDateString(LOCAL)
    let time = datetime.toLocaleTimeString(LOCAL)
  
    return [date, time].join(" ")
  }

  handleOnClose() {
    this.setState({
      showEditor: false
    })
  }

  handleDateSelect = (selectInfo) => {
    this.setState({
      showEditor: true,
      selectInfo: selectInfo
    })
  }

  handleEventSave = (event) => {
    // if id given, update event otherwise create new one
    if(event.id) {
      // save extended attributes to event object 
      this.state.selectInfo.event.setExtendedProp("language", event.language)
      this.state.selectInfo.event.setExtendedProp("place", event.place)
      this.state.selectInfo.event.setExtendedProp("amountParticipants", event.amountParticipants)

      // set base attributes to event object
      this.state.selectInfo.event.setDates(event.start)
      this.state.selectInfo.event.setEnd(event.end)

      this.state.selectInfo.event.setProp("overlap", event.overlap)
    } 
    else {
      event.id = uuidv4()
      this.state.selectInfo.view.calendar.addEvent(event)
    }

    this.setState({
      showEditor: false,
      success: "Ausführung erfolgreich gespeichert"
    })
  }

  handleEventCopy = (event) => {
    // create a new event
    this.state.selectInfo.view.calendar.addEvent({...event, id: uuidv4()})

    this.setState({
      showEditor: false
    })
  }

  handleEventClick = (clickInfo) => {
    if(clickInfo.event.overlap) {
      this.setState({
        showEditor: true,
        selectInfo: clickInfo
      })
    }
  }

  handleEventRemove() {
    if (window.confirm(`Bist du sicher, dass du den Termin löschen möchtest von '${ this.convertToReadableTime(this.state.selectInfo.event.start) }' bis '${ this.convertToReadableTime(this.state.selectInfo.event.end) }'`)) {
      this.state.selectInfo.event.remove()

      this.setState({
        showEditor: false
      })
    }
  }

  handleEvents = (events) => {
    this.setState({
      currentEvents: events
    })
  }

  // function to render the event content within the calendar
  renderEventContent(eventInfo) {
    return (
      <>
        {eventInfo.timeText && (
          <b>{ eventInfo.timeText } - </b>
        )}
        <i>{ eventInfo.event.extendedProps.language } - </i>
        <i>{ eventInfo.event.extendedProps.amountParticipants } - </i>
        <i>{ eventInfo.event.extendedProps.place }</i>
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
          <h2>All Events ({ this.state.currentEvents.length })</h2>
          <ul>
            { this.state.currentEvents.map(this.renderSidebarEvent) }
          </ul>
        </div>
      </div>
    )
  }
  
  // render event information within top information div
  renderSidebarEvent(event) {
    return (
      <li key={ event.id }>
        <i>{event.title} - </i>
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
            <i>{ event.extendedProps.language } - </i>
            <i>{ event.extendedProps.amountParticipants } - </i>
            <i>{ event.extendedProps.place }</i> 
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
            onClose={() => this.setState({ error: null })}
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
            onClose={() => this.setState({ success: null })}
            message={ this.state.success }
          />
        )}
      </div>
    )
  }

  render() {
    const { classes } = this.props

    return (
      <div className='calendar-manager'>
        { this.renderSidebar() }

        <div className='calendar-manager-main'>
          { this.state.showEditor && (
            /* Show editor based on flag*/
            <EventEditor 
              onSave={ this.handleEventSave } 
              onDelete={ this.handleEventRemove } 
              onClose={ this.handleOnClose } 
              onCopy={ this.handleEventCopy } 
              selectInfo={this.state.selectInfo }/> 
            )
          }

          {/* display fullcalendar */ }
          <FullCalendar
            plugins={ [dayGridPlugin, timeGridPlugin, interactionPlugin] }
            headerToolbar={ {
              left: 'prev,next',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            } }
            themeSystem="bootstrap"
            locale="DE"
            allDaySlot={ false }  // don't allow full day event
            firstDay={ 1 }        // set first day of week to monday 1
            validRange={ { start: START_DATE, end: END_DATE } }   // calendar is only available in given period
            initialView='timeGridWeek'
            editable={ true }
            selectable={ true }
            selectMirror={ true }
            dayMaxEvents={ false } 
            initialEvents={ this.state.currentEvents }
            select={ this.handleDateSelect }
            eventContent={ this.renderEventContent } // custom render function
            eventClick={ this.handleEventClick }
            eventsSet={ this.handleEvents } // called after events are initialized/added/changed/removed, save them to state
          />
        </div>

        { this.renderHelperElements() }
      </div>
    )
  }
}

export default compose(
  withStyles(styles), 
)(CalendarManager);
