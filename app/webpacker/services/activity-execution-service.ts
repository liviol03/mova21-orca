type Language = 'de' | 'fr' | 'it' | 'en';

export interface Activity {
    id: number;
    name: string;
    languages: Array<Language>;
}

export interface ActivityExectution {
    id: number;
    starts_at: Date;
    ends_at: Date;
    languages: Array<Language>;
}

export class ActivityExecutionService {
    public getAll(activityId: number): Promise<Array<ActivityExectution>> {
       return fetch(`/activities/${activityId}/activity_executions`, {
           method: 'GET',
           headers: this.getHeaders()
        }).then(response => response.json())
        .then(result =>
            result.map(element => ({
                id: element.id,
                start: new Date(element.starts_at),
                end: new Date(element.ends_at),
                languages: element.languages,
                overlap: true
            }))
        )
    }

    public create(activityId: number, activityExecution: ActivityExectution): Promise<ActivityExectution> {
        const requestOptions = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(activityExecution)

        };

        return fetch(`/activities/${activityId}/activity_executions`, requestOptions)
            .then(response => response.json())
    }

    public update(activityId: number, activityExecution: ActivityExectution): Promise<ActivityExectution> {
        const requestOptions = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(activityExecution)

        };

        return fetch(`/activities/${activityId}/activity_executions/${activityExecution.id}`, requestOptions)
            .then(response => response.json())
    }

    private getHeaders(): { [key: string]: string } {
        return {'Content-Type': 'application/json', 'X-CSRF-Token': this.getAuthenticityToken()};
    }

    private getAuthenticityToken(): string {
        return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]').content;
    }

}
