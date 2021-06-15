# frozen_string_literal: true

class UnitActivitiesController < ApplicationController
  load_and_authorize_resource :unit
  load_and_authorize_resource through: :unit, except: %i[show]

  def index
    @activities = filter.apply(Activity.bookable_by(@unit).distinct).page params[:page]
    @unit_activity_booking = UnitActivityBooking.new(@unit)
  end

  def show
    @activity = Activity.accessible_by(current_ability).find(params[:id])
  end

  def create
    @unit_activity.priority_position = :last
    flash = if @unit_activity.save
              { success: I18n.t('messages.created.success') }
            else
              { error: I18n.t('messages.created.error') }
            end
    redirect_to unit_unit_activities_path(@unit, anchor: helpers.anchor_for(@unit_activity.activity)), flash: flash
  end

  def destroy
    @unit_activity.destroy
    redirect_to unit_unit_activities_path(@unit), notice: I18n.t('messages.deleted.success')
  end

  def priorize
    @unit_activity.update(priority_position: params[:index])
  end

  def update
    @unit_activity.assign_attributes(unit_activity_params)

    if @unit_activity.save
      redirect_to unit_unit_activities_path(@unit, anchor: helpers.anchor_for(@unit_activity.activity)),
                  notice: I18n.t('messages.updated.success')
    else
      render :edit, alert: I18n.t('messages.updated.error')
    end
  end

  private

  def filter
    activity_filter_params = params[:activity_filter]&.permit(:min_participants_count, :stufe_recommended,
                                                              :activity_category, tags: [], languages: [])
    session[:activity_filter_params] = activity_filter_params if params.key?(:activity_filter)
    @filter ||= ActivityFilter.new(session[:activity_filter_params] || {})
  end

  def unit_activity_params
    params[:unit_activity].permit(:activity_id, :priority_postion)
  end
end
