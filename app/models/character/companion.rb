# frozen_string_literal: true

class Character
  class Companion < ApplicationRecord
    belongs_to :character
  end
end
