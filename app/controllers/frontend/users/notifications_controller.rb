# frozen_string_literal: true

module Frontend
  module Users
    class NotificationsController < Frontend::BaseController
      include SerializeRelation

      after_action :mark_notifications_as_read, only: %i[index]

      def index
        serialize_relation(
          current_user.notifications.order(created_at: :desc),
          ::Users::NotificationSerializer,
          :notifications
        )
      end

      def unread
        render json: { unread: current_user.notifications.unread.count }, status: :ok
      end

      private

      def mark_notifications_as_read
        current_user.notifications.unread.update_all(read: true)
      end
    end
  end
end
