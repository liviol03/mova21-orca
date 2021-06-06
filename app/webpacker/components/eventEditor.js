import React, { Component, Fragment } from 'react';
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
import { compose } from 'react-recompose';
import { FullCalendarEvent } from "../services/activity-execution-service"
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
// implement fields
const spots = [
  {
    name: "Test",
    id: 1,
    fields: [
      {
        id: 1,
        name: "Feld 1-1"
      },
      {
        id: 2,
        name: "Feld 1-2"
      }
    ]
  },
  {
    name: "Test 2",
    id: 2,
    fields: [
      {
        id: 1,
        name: "Feld 2-1"
      },
      {
        id: 2,
        name: "Feld 2-2"
      }
    ]
  }
]

function convertDateToIso(date) {
  return moment(date).toISOString(true).substring(0, 16)
}

class EventEditor extends Component {
  constructor() {
    super();

    this.state = {
      events: [],                     // all events

      evnt: {                         // current working event
          title: "", 
          start: "", 
          end: "", 
          allDay: false,
          amountParticipants: 0,
          spot: "",
          field: "",
          language_flags: [],
          overlap: true
      },

      availableLanguages: [],       // languages available for this activity execution
      errorText: ""                 // error text which will be displayed on the form
    };

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCopy = this.handleCopy.bind(this)
  }

  componentDidMount() {
    const { event, events, availableLanguages } = this.props
    let editor_event = ""
    
    // check if event or just time slot has been provided
    if(event.id) {
      // event passsed
      editor_event = event.toPlainObject()

      editor_event.allDay = event.allDay
      editor_event.start = convertDateToIso(event.start)
      editor_event.end = convertDateToIso(event.end)

      editor_event.amountParticipants = event.extendedProps.amountParticipants || this.state.evnt.amountParticipants
      editor_event.spot = event.extendedProps.spot || this.state.evnt.spot
      editor_event.language_flags = this.state.evnt.language_flags
      
      editor_event.overlap = this.state.evnt.overlap
    }
    else {
      // only date and time given
      editor_event = this.state.evnt
      editor_event.start = convertDateToIso(event.start);
      editor_event.end = convertDateToIso(event.end);
      editor_event.allDay = event.allDay;
    } 

    this.setState({
      events: events,
      evnt: editor_event,
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
    let event = this.state.evnt

    if(evt.target.name === 'languages') {
      let languages = event[evt.target.name]
      languages.push(evt.target.value)
      event[evt.target.name] = languages
    } else {
      event[evt.target.name] = evt.target.value
    }

    // check if the new event has a valid time period given, so that the start is not in front of the end time
    if(new Date(event.start) > new Date(event.end)) {
      this.setState({
        errorText: "The end time can not be before the start time"
      })
    } else if(this.checkIfEventsOverLap(event)) {
      // check if new event is overlapping with a blocking event
      this.setState({
        errorText: "The event is overlapping with a blocking event"
      })
    } else {
      this.setState({
        evnt: event,
        errorText: ""
      })
    }
  }

  // function handling submit of form
  handleSubmit = evt => {
    evt.preventDefault();
    const { onSave } = this.props
    let event = this.state.evnt

    // trigger parent function passed by props
    onSave(event)
  };

  // handling copy of event
  handleCopy = evt => {
    const { onCopy } = this.props

    // trigger parent function passed by props
    onCopy("", this.state.evnt.id)
  }

  render() {
    const { classes, onClose, onDelete} = this.props;
    let fields = []

    // get fields for the selected spot
    if(this.state.evnt.spot) {
      const spot = spots.filter(spot => spot.name === this.state.evnt.spot)
      fields = spot[0].fields
    }

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
                value={this.state.evnt.start}
                onChange={this.handleChange}
                className={classes.inputField}
              />

              <TextField
                key="inputEndTime"
                name="end"
                label="End time"
                type="datetime-local"
                value={this.state.evnt.end}
                onChange={this.handleChange}
                error ={this.state.errorText.length === 0 ? false : true }
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
                value={this.state.evnt.amountParticipants}
                onChange={this.handleChange}
                className={classes.inputField}
              />
      
              <InputLabel id="labelInputSpot">Programspot</InputLabel>
              <Select
                labelId="labelInputSpot"
                id="inputspot"
                name="spot"
                value={this.state.evnt.spot}
                onChange={this.handleChange}
                autoWidth
              >
                {
                  spots.map((spot, i) => (
                    <MenuItem key={`spot-${i}`} value={spot.name}><em>{spot.name}</em></MenuItem>
                  ))
                }
              </Select>

              { this.state.evnt.spot && (
                <Fragment>
                 <InputLabel id="labelInputField">Field</InputLabel>
                 <Select
                   labelId="labelInputField"
                   id="inputfield"
                   name="field"
                   value={this.state.evnt.field}
                   onChange={this.handleChange}
                   autoWidth
                 >
                   {
                     fields.map((field, i) => (
                       <MenuItem key={`field-${i}`} value={field.name}><em>{field.name}</em></MenuItem>
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
                  name="language_flags"
                  value={this.state.evnt.languages}
                  onChange={this.handleChange}
                  autoWidth
                  input={<Input />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {
                    this.state.availableLanguages.map((language, i) => (
                      <MenuItem key={`lang-${i}`} value={language}>
                        <Checkbox checked={this.state.evnt.language_flags.indexOf(language) > -1} />
                        <ListItemText primary={language} />
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" type="submit"><SaveAltIcon/>Save</Button>
              <Button size="small" onClick={this.handleCopy}><CopyIcon/>Copy</Button>
              <Button size="small" onClick={(evt) => onDelete(evt, this.state.evnt.id)}><DeleteIcon/>Delete</Button>
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
