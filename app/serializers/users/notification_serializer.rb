# frozen_string_literal: true

module Users
  class NotificationSerializer < ApplicationSerializer
    attributes :id, :title, :value, :read, :created_at

    def created_at
      object.created_at.strftime('%Y-%m-%d %H:%M')
    end
  end
end
