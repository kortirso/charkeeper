# frozen_string_literal: true

class Character
  class Feat < ApplicationRecord
    belongs_to :character, class_name: '::Character', touch: true
    belongs_to :feat, class_name: '::Feat'
  end
end
