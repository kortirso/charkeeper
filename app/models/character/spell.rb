# frozen_string_literal: true

class Character
  class Spell < ApplicationRecord
    belongs_to :character
    belongs_to :spell
  end
end
