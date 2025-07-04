# frozen_string_literal: true

module Adminbook
  module Users
    class NotificationsController < Adminbook::BaseController
      include Deps[
        telegram_api: 'api.telegram.client'
      ]

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
        send_telegram_notification(notification) if notification.save
        redirect_to adminbook_users_notifications_path
      end

      def update
        notification = User::Notification.find(params[:id])
        notification.update(notification_params)
        redirect_to adminbook_users_notifications_path
      end

      def destroy
        notification = User::Notification.find(params[:id])
        notification.destroy
        redirect_to adminbook_users_notifications_path
      end

      private

      def send_telegram_notification(notification)
        telegram_identity = notification.user.identities.telegram.first
        return unless telegram_identity

        telegram_api.send_message(
          bot_secret: bot_secret,
          chat_id: telegram_identity.uid,
          text: "#{notification.title}\n\n#{notification.value}"
        )
      end

      def bot_secret
        Rails.application.credentials.dig(Rails.env.to_sym, :web_telegram_bot_token)
      end

      def notification_params
        params.require(:notification).permit!.to_h
      end
    end
  end
end
