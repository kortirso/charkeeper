# frozen_string_literal: true

class User
  class Notification < ApplicationRecord
    belongs_to :user

    scope :unread, -> { where(read: false) }
  end
end
