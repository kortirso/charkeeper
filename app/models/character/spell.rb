# frozen_string_literal: true

class Character
  class Spell < ApplicationRecord
    belongs_to :character, class_name: '::Character'
    belongs_to :spell, class_name: '::Spell'
  end
end
