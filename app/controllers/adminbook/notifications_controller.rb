# frozen_string_literal: true

module Adminbook
  class NotificationsController < Adminbook::BaseController
    include Deps[
      send_notification: 'services.notifications_context.send_notification'
    ]

    def index
      @pagy, @notifications = pagy(Notification.order(created_at: :desc), limit: 25)
    end

    def new
      @notification = Notification.new
    end

    def create
      notification = Notification.new(transform_params(notification_params))
      send_notification.call(notification: notification) if notification.save
      redirect_to adminbook_notifications_path
    end

    private

    def transform_params(updating_params)
      updating_params['targets'] = updating_params['targets'].split(',')
      updating_params
    end

    def notification_params
      params.require(:notification).permit!.to_h
    end
  end
end
