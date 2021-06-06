type Language = 'de' | 'fr' | 'it' | 'en';

export interface Activity {
    id: number;
    name: string;
    languages: Array<Language>;
}

// backend definition of an activity execution
export interface ActivityExectution {
    id: number;
    starts_at: Date;
    ends_at: Date;
    language_flags: Array<Language>;
}

// fullcalendar definition of an event 
export interface FullCalendarEvent {
    id: number;
    start: Date;
    end: Date;
    language_flags: Array<Language>;
    overlap: Boolean;
}

export class ActivityExecutionService {
    public getAll(activityId: number): Promise<Array<FullCalendarEvent>> {
       return fetch(`/activities/${activityId}/activity_executions`, {
           method: 'GET',
           headers: this.getHeaders()
        }).then(response => response.json())
        .then(result => {
            return result.map(element => ({
                id: element.id,
                start: new Date(element.starts_at),
                end: new Date(element.ends_at),
                language_flags: element.language_flags || [],
                overlap: true
            }))
        })
    }

    public create(activityId: number, activityExecution: FullCalendarEvent): Promise<FullCalendarEvent> {
        const requestOptions = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                "data": {
                    "type": "activity_execution",
                    "attributes": {
                        starts_at: activityExecution.start,
                        ends_at: activityExecution.end,
                        language_flags: activityExecution.language_flags
                    }
                }
            })
        };

        return fetch(`/activities/${activityId}/activity_executions`, requestOptions)
            .then(response => response.json())
            .then(element => {
                let event: FullCalendarEvent = {
                    id: element.id,
                    start: new Date(element.starts_at),
                    end: new Date(element.ends_at),
                    language_flags: element.language_flags || [],
                    overlap: true
                }
                return event
            })
    }

    public update(activityId: number, activityExecution: FullCalendarEvent): Promise<FullCalendarEvent> {
        const requestOptions = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                "data": {
                    "type": "activity_execution",
                    "attributes": {
                        starts_at: activityExecution.start,
                        ends_at: activityExecution.end,
                        language_flags: activityExecution.language_flags
                    }
                }
            })
        };

        return fetch(`/activities/${activityId}/activity_executions/${activityExecution.id}`, requestOptions)
            .then(response => response.json())
            .then(element => {
                let event: FullCalendarEvent = {
                    id: element.id,
                    start: new Date(element.starts_at),
                    end: new Date(element.ends_at),
                    language_flags: element.language_flags || [],
                    overlap: true
                }
                return event
            })
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
