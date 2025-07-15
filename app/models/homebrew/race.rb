# frozen_string_literal: true

class Homebrew
  class Race < ApplicationRecord
    belongs_to :user

    has_many :homebrews, as: :brewery, dependent: :destroy
  end
end
