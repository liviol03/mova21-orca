class ActivityExecutionsController < ApplicationController
  load_and_authorize_resource :activity
  load_and_authorize_resource through: :activity
  # TODO
  skip_before_action :verify_authenticity_token, only: [:create]

  def index
    render json: @activity_executions
  end

  #
  # def show; end
  #
  # def new
  #   @activity_execution = ActivityExecution.new
  # end
  #
  # def edit; end

  def create

    # respond_to do |format|
    #   format.json do
    if @activity.activity_executions.create!(activity_execution_params)
      render json: { status: :success }
    else
      render json: { status: :error }
    end
    # end
    # end

  end

  #
  # def update
  #   if @activity_executions.update(activity_params)
  #     redirect_to @activity_executions, notice: I18n.t('messages.updated.success')
  #   else
  #     render :edit
  #   end
  # end
  #
  # def destroy
  #   if params[:attachment_id]
  #     delete_attachment
  #   elsif params[:picture_id]
  #     delete_picture
  #   else
  #     @activity_executions.destroy
  #     redirect_to activities_url, notice: I18n.t('messages.deleted.success')
  #   end
  # end

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
    params.require(:activity_execution).permit(:from, :to, :activity_id)
  end
end
