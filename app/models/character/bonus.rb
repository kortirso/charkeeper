# frozen_string_literal: true

class Character
  class Bonus < ApplicationRecord
    self.table_name = :character_bonus

    belongs_to :character
  end
end
