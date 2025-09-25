# frozen_string_literal: true

module UsersContext
  class RemoveProfileJob < ApplicationJob
    queue_as :default

    def perform(user_id:)
      user = User.find_by(id: user_id)
      return unless user

      user.destroy
    end
  end
end
