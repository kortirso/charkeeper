# frozen_string_literal: true

class User
  class Feedback < ApplicationRecord
    belongs_to :user
  end
end
