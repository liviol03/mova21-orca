# frozen_string_literal: true

module Admin
  class ActivityEventsController < ApplicationController
    load_and_authorize_resource

    def index
    end

    def new
      @activity_event = ActivityEvent.new
    end

    def edit
    end

    def create
      @activity_event = ActivityEvent.new(activity_event_params)

      if @activity_event.save
        redirect_to admin_activity_events_path, notice: I18n.t('messages.created.success')
      else
        render :new
      end
    end

    def update
      if @activity_event.update(activity_event_params)
        redirect_to admin_activity_events_path, notice: I18n.t('messages.updated.success')
      else
        render :edit
      end
    end

    def destroy
      @activity_event.destroy
      redirect_to admin_activity_events_path, notice: I18n.t('messages.deleted.success')
    end

    private

    def set_activity_event
      @activity_event = ActivityEvent.find(params[:id])
    end

    def activity_event_params
      params.require(:activity_event).permit(:title, :starts_at, :ends_at)
    end
  end
end
