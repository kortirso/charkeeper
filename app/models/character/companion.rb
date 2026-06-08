# frozen_string_literal: true

class Character
  class Companion < ApplicationRecord
    has_one_attached :avatar

    belongs_to :character

    has_many :bonuses, class_name: '::Character::Bonus', as: :bonusable, dependent: :destroy
  end
end
