import React, {Component, Fragment} from 'react';
import {
  TextField,
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Input,
  Checkbox,
  ListItemText
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete'; // to-do: change icons to fontawesome
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ClearIcon from '@material-ui/icons/Clear';
import CopyIcon from '@material-ui/icons/FileCopy'
import {compose} from 'react-recompose';
import {FullCalendarEvent} from "../services/activity-execution-service"
import moment from 'moment';
import 'moment-timezone';

const styles = theme => ({
  modal: {
    display: 'flex',
    outline: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: "100%"
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
  inputField: {
    marginTop: theme.spacing(1)
  }
});

// todo

function convertDateToIso(date) {
  return moment(date).toISOString(true).substring(0, 16)
}

class EventEditor extends Component {
  constructor() {
    super();

    this.state = {
      events: [],                     // all events
      availableSpots: [],
      /* TODO: Since we are passing a reference of event, this will change already the object, even if we don't
               save. make sure we pass always pass a copy and make the object immutable. */
      selectedEvent: {                         // current working event
        title: "",
        start: "",
        end: "",
        // TODO: handle case if field already selected (update)
        amountParticipants: 0,
        spot: { id: null, name: '', fields: []},
        field: { id: null, name: ''},
        languages: [],
        allDay: false,
        overlap: true
      },
      availableLanguages: [],       // languages available for this activity execution
      errorText: ""                 // error text which will be displayed on the form
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
  }

  componentDidMount() {
    const {event, events, availableLanguages, spots} = this.props
    console.log(event);
    let selectedEvent = {
      ...this.state.selectedEvent,
      id: event.id,
      start: convertDateToIso(event.start),
      end: convertDateToIso(event.end),
      allDay: event.allDay,
      languages: event.languages || availableLanguages,
      ...event.extendedProps
    };

    this.setState({
      events: events,
      availableSpots: spots,
      selectedEvent: selectedEvent,
      availableLanguages: availableLanguages
    })
  }

  isEventOverlapping(event1, event2) {
    return ((new Date(event1.start) > new Date(event2.start) && new Date(event1.start) < new Date(event2.end)) ||
      (new Date(event1.end) > new Date(event2.start) && new Date(event1.end) < new Date(event2.end)))
  }

  // check if the new event is overlapping with a blocked one
  checkIfEventsOverLap(event) {
    let blockingEvents = this.state.events.filter(event => event.overlap === false)
    return blockingEvents.some(event => this.isEventOverlapping(event, blockingEvents))
  }

  handleChange = evt => {
    let newSelectedEventState = {
      ...this.state.selectedEvent,
      ...this.mutateSelectedEventState(evt.target.name, evt.target.value)
    };
    // check if the new event has a valid time period given, so that the start is not in front of the end time
    if (new Date(newSelectedEventState.start) > new Date(newSelectedEventState.end)) {
      this.setState({
        errorText: "The end time can not be before the start time"
      })
    } else if (this.checkIfEventsOverLap(newSelectedEventState)) {
      // check if new event is overlapping with a blocking event
      this.setState({
        errorText: "The event is overlapping with a blocking event"
      })
    } else {
      this.setState({
        selectedEvent: newSelectedEventState,
        errorText: ""
      });
    }
  }

  mutateSelectedEventState(field, value) {
    const newState = {};
    newState[field] = value;
    return {...this.state.selectedEvent, ...newState };
  }

  handleLanguageChange = evt => {
    let event = this.state.selectedEvent;
    const index = event.languages.indexOf(evt.target.value)
    let newLanguages = index > -1 ?
      event.languages.filter(language => language !== evt.target.value) :
      [...event.languages, evt.target.value];
    this.mutateSelectedEventState('languages', newLanguages)
  }

  // function handling submit of form
  handleSubmit = evt => {
    evt.preventDefault();
    const {onSave} = this.props
    let selectedEvent = this.state.selectedEvent

    // trigger parent function passed by props
    onSave(selectedEvent)
  };

  // handling copy of event
  handleCopy = evt => {
    const {onCopy} = this.props

    // trigger parent function passed by props
    onCopy("", this.state.selectedEvent.id)
  }

  render() {
    const {classes, onClose, onDelete} = this.props;

    return (
      <Modal
        className={classes.modal}
        onClose={onClose}
        open
      >
        <Card className={classes.modalCard}>
          <form onSubmit={this.handleSubmit}>
            <CardContent className={classes.modalCardContent}>
              <TextField
                key="inputStartTime"
                name="start"
                label="Start time"
                type="datetime-local"
                value={this.state.selectedEvent.start}
                className={classes.inputField}
              />

              <TextField
                key="inputEndTime"
                name="end"
                label="End time"
                type="datetime-local"
                value={this.state.selectedEvent.end}
                onChange={this.handleChange}
                error={this.state.errorText.length === 0 ? false : true}
                helperText={this.state.errorText}
                className={classes.inputField}
              />

              <TextField
                required
                type="number"
                key="inputAmountParticipants"
                name="amountParticipants"
                placeholder="100"
                label="Amount Participants"
                value={this.state.selectedEvent.amountParticipants}
                onChange={this.handleChange}
                className={classes.inputField}
              />

              <InputLabel id="labelInputSpot">Programspot</InputLabel>
              <Select
                labelId="labelInputSpot"
                id="inputspot"
                name="spot"
                value={this.state.selectedEvent.spot}
                onChange={this.handleChange}
                autoWidth
              >
                {
                  this.state.availableSpots.map((spot, i) => (
                    <MenuItem key={`spot-${i}`} value={spot}><em>{spot.name}</em></MenuItem>
                  ))
                }
              </Select>

              {this.state.selectedEvent.spot.id && (
                <Fragment>
                  <InputLabel id="labelInputField">Field</InputLabel>
                  <Select
                    labelId="labelInputField"
                    id="inputfield"
                    name="field"
                    onChange={this.handleChange}
                    value={this.state.selectedEvent.field}
                    autoWidth
                  >
                    {
                      this.state.selectedEvent.spot.fields.map((field, i) => (
                        <MenuItem key={`field-${i}`} value={field}><em>{field.name}</em></MenuItem>
                      ))
                    }
                  </Select>
                </Fragment>
              )}

              <InputLabel id="labelInputLanguages">Languages</InputLabel>
              <FormControl className={classes.formControl}>
                <Select
                  labelId="labelInputLanguages"
                  id="inputLanguages"
                  name="languages"
                  value={this.state.selectedEvent.languages}
                  onChange={this.handleLanguageChange}
                  autoWidth
                  input={<Input/>}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {
                    this.state.availableLanguages.map((language, i) => (
                      <MenuItem key={`lang-${i}`} value={language}>
                        <Checkbox checked={this.state.selectedEvent.languages.indexOf(language) > -1}/>
                        <ListItemText primary={language}/>
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" type="submit"><SaveAltIcon/>Save</Button>
              <Button size="small" onClick={this.handleCopy}><CopyIcon/>Copy</Button>
              <Button size="small"
                      onClick={(evt) => onDelete(evt, this.state.selectedEvent.id)}><DeleteIcon/>Delete</Button>
              <Button size="small" onClick={onClose}><ClearIcon/>Cancel</Button>
            </CardActions>
          </form>
        </Card>
      </Modal>
    );
  }
}

export default compose(
  withStyles(styles),
)(EventEditor);
