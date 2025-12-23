# frozen_string_literal: true

class Character
  class Bonus < ApplicationRecord
    self.table_name = :character_bonus

    belongs_to :bonusable, polymorphic: true

    scope :enabled, -> { where(enabled: true) }
  end
end
