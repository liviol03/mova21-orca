type Language = 'de' | 'fr' | 'it' | 'en';

export interface Activity {
    id: number;
    name: string;
    languages: Array<Language>;
}

// backend definition of an activity execution
export interface ActivityExecution {
    id: number;
    starts_at: Date;
    ends_at: Date;
    languages: Array<Language>;
}

// fullcalendar definition of an event
export interface FullCalendarEvent {
    id: number;
    start: Date;
    end: Date;
    languages: Array<Language>;
    overlap: boolean;
}

export class ActivityExecutionService {
    public getAll(activityId: number): Promise<Array<FullCalendarEvent>> {
        return fetch(`/activities/${activityId}/activity_executions`, {
            method: 'GET',
            headers: this.getHeaders()
        })
            .then(response => response.json())
            .then((activityExexutions: Array<ActivityExecution>) =>
                activityExexutions.map(activityExexution => this.convertToFullCalendarEvent(activityExexution)));
    }

    private convertToFullCalendarEvent(activityExexution: ActivityExecution): FullCalendarEvent {
        return {
            id: activityExexution.id,
            start: new Date(activityExexution.starts_at),
            end: new Date(activityExexution.ends_at),
            languages: activityExexution.languages,
            overlap: true
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
            .then((activityExecution: ActivityExecution) => this.convertToFullCalendarEvent(activityExecution));
    }

    private getActivityExecutionRequestBody(fullCalendarEvent: FullCalendarEvent) {
        return JSON.stringify({
            activity_execution: {
                starts_at: fullCalendarEvent.start,
                ends_at: fullCalendarEvent.end,
                languages: fullCalendarEvent.languages
            }
        });
    }

    public update(activityId: number, activityExecution: FullCalendarEvent): Promise<FullCalendarEvent> {
        const requestOptions = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: this.getActivityExecutionRequestBody(activityExecution)
        };

        return fetch(`/activities/${activityId}/activity_executions/${activityExecution.id}`, requestOptions)
            .then(response => response.json())
            .then((activityExecution: ActivityExecution) => this.convertToFullCalendarEvent(activityExecution));
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
