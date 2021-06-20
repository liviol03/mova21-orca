type Language = 'de' | 'fr' | 'it' | 'en';

export interface Activity {
    id: number;
    name: string;
    languages: Array<Language>;
}

// backend definition of an activity execution
interface ActivityExecutionRequest {
    activity_execution: {
        starts_at: Date;
        ends_at: Date;
        field_id: number;
        amount_participants: number;
        languages: Array<Language>;
        hasTransport: boolean
    }
}

interface ActivityExecution {
    id: number;
    title: string;
    starts_at: Date;
    ends_at: Date;
    spot: Spot;
    field: Field;
    amount_participants: number;
    languages: Array<Language>;
    hasTransport: boolean
}

interface FixedEvent {
    id: number;
    title: string;
    starts_at: Date;
    ends_at: Date;
    overlap: boolean;
}

export interface Field {
    id: number;
    name: string;
}

export interface Spot {
    id: number;
    name: string;
    color: string;
    fields: Array<Field>
}

// fullcalendar definition of an event
export interface FullCalendarEvent {
    id: number;
    start: Date;
    end: Date;
    title?: string;
    extendedProps?: {
        languages: Array<Language>;
        amountParticipants: number;
        field: Field,
        spot: Spot,
        hasTransport: boolean
    }
    overlap: boolean;
    color: string;
}

export class ActivityExecutionService {
    public getAll(activityId: number): Promise<Array<FullCalendarEvent>> {
        return Promise.all([this.fetchActivityExecutions(activityId), this.fetchFixedEvents()])
            .then(([activityExecutions, fixedEvents]) =>
                [...activityExecutions, ...fixedEvents])
    }

    private fetchActivityExecutions(activityId: number): Promise<Array<FullCalendarEvent>>  {
        return fetch(`/activities/${activityId}/activity_executions`, {
            method: 'GET',
            headers: this.getHeaders()
        })
            .then(response => response.json())
            .then((activityExexutions: Array<ActivityExecution>) =>
                activityExexutions.map(activityExexution => this.convertActivityExecutionToFullCalendarEvent(activityExexution)));
    }

    private fetchFixedEvents(): Promise<Array<FullCalendarEvent>>  {
        return fetch('/admin/fixed_events', {
            method: 'GET',
            headers: this.getHeaders()
        })
            .then(response => response.json())
            .then(fixedEvents => fixedEvents.map(fixedEvent => this.convertFixedEventsToFullCalendarEvent(fixedEvent)));
    }

    private convertActivityExecutionToFullCalendarEvent(activityExexution: ActivityExecution): FullCalendarEvent {
        return {
            id: activityExexution.id,
            start: new Date(activityExexution.starts_at),
            end: new Date(activityExexution.ends_at),
            extendedProps: {
                languages: activityExexution.languages,
                amountParticipants: activityExexution.amount_participants,
                spot: activityExexution.spot,
                field: activityExexution.field,
                hasTransport: activityExexution.hasTransport
            },
            overlap: false,
            color: activityExexution.spot.color
        };
    }

    private convertFixedEventsToFullCalendarEvent(fixedEvent: FixedEvent): FullCalendarEvent {
        return {
            id: fixedEvent.id,
            title: fixedEvent.title,
            start: new Date(fixedEvent.starts_at),
            end: new Date(fixedEvent.ends_at),
            overlap: true,
            color: '#ffeb00'
        };
    }

    public create(activityId: number, fullCalendarEvent: FullCalendarEvent): Promise<FullCalendarEvent> {
        const requestOptions = {
            method: 'POST',
            headers: this.getHeaders(),
            body: this.getActivityExecutionRequestBody(fullCalendarEvent)
        };

        return fetch(`/activities/${activityId}/activity_executions`, requestOptions)
            .then(response => response.json())
            .then((activityExecution: ActivityExecution) => this.convertActivityExecutionToFullCalendarEvent(activityExecution));
    }

    private getActivityExecutionRequestBody(fullCalendarEvent: FullCalendarEvent) {
        const request: ActivityExecutionRequest = {
            activity_execution: {
                starts_at: fullCalendarEvent.start,
                ends_at: fullCalendarEvent.end,
                languages: fullCalendarEvent.extendedProps.languages,
                field_id: fullCalendarEvent.extendedProps.field.id,
                amount_participants: fullCalendarEvent.extendedProps.amountParticipants,
                hasTransport: fullCalendarEvent.extendedProps.hasTransport
            }
        };
        return JSON.stringify(request);
    }

    public update(activityId: number, activityExecution: FullCalendarEvent): Promise<FullCalendarEvent> {
        const requestOptions = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: this.getActivityExecutionRequestBody(activityExecution)
        };

        return fetch(`/activities/${activityId}/activity_executions/${activityExecution.id}`, requestOptions)
            .then(response => response.json())
            .then((activityExecution: ActivityExecution) => this.convertActivityExecutionToFullCalendarEvent(activityExecution));
    }

    public delete(activityId: number, activityExecutionId: number): Promise<boolean> {
        const requestOptions = {
            method: 'DELETE',
            headers: this.getHeaders()
        };

        return fetch(`/activities/${activityId}/activity_executions/${activityExecutionId}`, requestOptions)
            .then(response => response.status === 200)
    }

    private getHeaders(): { [key: string]: string } {
        return {'Content-Type': 'application/json', 'X-CSRF-Token': this.getAuthenticityToken()};
    }

    private getAuthenticityToken(): string {
        return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]').content;
    }
}
