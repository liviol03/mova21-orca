type Language = 'de' | 'fr' | 'it' | 'en';

export interface Activity {
    id: number;
    name: string;
    languages: Array<Language>;
}

export interface ActivityExectution {
    name: string;
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
    }

    public create(activity: Activity, activityExecution: ActivityExectution): Promise<ActivityExectution> {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(activityExecution)

        };
        return fetch(`/activities/${activity.id}/activity_executions`, requestOptions)
            .then(response => response.json())
    }

    private getHeaders(): { [key: string]: string } {
        return {'Content-Type': 'application/json', 'X-CSRF-Token': this.getAuthenticityToken()};
    }

    private getAuthenticityToken(): string {
        return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]').content;
    }

}
