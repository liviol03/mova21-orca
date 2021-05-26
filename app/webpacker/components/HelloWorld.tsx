import * as React from 'react'
import { ActivityExecutionService } from "../services/activity-execution-service";
import { useEffect, useState } from "react";

interface HelloWorldProps {
    activityId: number;
}

const HelloWorld: React.FC<HelloWorldProps> = ({activityId: activityId}) => {
    const [activityExecutions, setActivityExecutions] = useState([]);

    // ActivityExecutionService

    useEffect(() => {
        new ActivityExecutionService().getAll(activityId).then((result) => setActivityExecutions(result));
    }, [])


    return (
        <div>
            {activityId}
        </div>
    )
}

export default HelloWorld
