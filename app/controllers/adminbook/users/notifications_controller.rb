# frozen_string_literal: true

module Adminbook
  module Users
    class NotificationsController < Adminbook::BaseController
      def index
        @notifications = User::Notification.order(created_at: :desc)
      end

      def new
        @notification = User::Notification.new
      end

      def edit
        @notification = User::Notification.find(params[:id])
      end

      def create
        notification = User::Notification.new(notification_params)
        redirect_to adminbook_users_notifications_path if notification.save
      end

      def update
        notification = User::Notification.find(params[:id])
        redirect_to adminbook_users_notifications_path if notification.update(notification_params)
      end

      def destroy
        notification = User::Notification.find(params[:id])
        notification.destroy
        redirect_to adminbook_users_notifications_path
      end

      private

      def notification_params
        params.require(:notification).permit!.to_h
      end
    end
  end
end
