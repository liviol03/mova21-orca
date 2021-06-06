class ActivityExecutionsController < ApplicationController
  load_and_authorize_resource :activity
  load_and_authorize_resource through: :activity

  def index
    render json: ActivityExecutionBlueprint.render(@activity_executions)
  end

  def create
    @activity_execution = @activity.activity_executions.create(activity_execution_params)
    if @activity_execution
      render status: :ok, json: ActivityExecutionBlueprint.render(@activity_execution)
    else
      render status: :error
    end
  end

  def update
    if @activity_execution.update(activity_execution_params)
      render status: :ok, json: ActivityExecutionBlueprint.render(@activity_execution)
    else
      render status: :error
    end
  end

  def destroy
    if @activity_execution.destroy
      render status: :ok, json: { success: true }
    else
      render status: :error
    end
  end

  private

  def activity_execution_params
    params.require(:activity_execution).permit(:starts_at, :ends_at, :field_id, :spot_id, :amount_participants, languages: []).tap do |params|
      if params[:languages]
        params[:languages].each do |language|
          params["language_#{language}".to_sym] = true
        end
        params.delete('languages')
      end
    end
  end
end
