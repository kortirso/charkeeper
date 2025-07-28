# frozen_string_literal: true

class User
  class Platform < ApplicationRecord
    belongs_to :user
  end
end
