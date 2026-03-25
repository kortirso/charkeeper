# frozen_string_literal: true

class Character
  class Companion < ApplicationRecord
    has_one_attached :avatar

    belongs_to :character
  end
end
