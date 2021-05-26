class ActivityExecutionsController < ApplicationController
  load_and_authorize_resource :activity
  load_and_authorize_resource through: :activity

  def index
    render json: @activity_executions
  end

  def create
    @activity_execution = @activity.activity_executions.create(activity_execution_params)
    if @activity_execution
      render json: { status: :success, activity_execution: @activity_execution }
    else
      render json: { status: :error }
    end
  end

  def update
    if @activity_execution.update(activity_execution_params)
      render json: { status: @activity_execution }
    else
      render json: { status: :error }
    end
  end

  def destroy
    if @activity_execution.destroy
      render json: { status: :success }
    else
      render json: { status: :error }
    end
  end

  private

  # def filter
  #   @filter ||= ActivityFilter.new(activity_filter_params.to_h)
  # end
  #
  # def delete_picture
  #   @activity_executions.picture.purge
  #   redirect_to edit_activity_url(@activity_executions)
  # end
  #
  # def delete_attachment
  #   @activity_executions.activity_documents.find_by(id: params[:attachment_id]).purge
  #   redirect_to edit_activity_url(@activity_executions)
  # end
  #
  # def activity_filter_params
  #   return {} unless params[:activity_filter]
  #
  #   params.require(:activity_filter).permit(:min_participants_count, :stufe_recommended, :activity_category,
  #                                           tags: [], languages: [])
  # end

  def activity_execution_params
    jsonapi_parse(params, %i[start end languages])
  end
end
