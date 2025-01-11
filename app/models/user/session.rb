# frozen_string_literal: true

class User
  class Session < ApplicationRecord
    belongs_to :user
  end
end
