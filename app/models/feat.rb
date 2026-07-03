# frozen_string_literal: true

class Feat < ApplicationRecord
  include Itemable

  scope :dnd5, -> { where(type: 'Dnd5::Feat') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Feat') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Feat') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Feat') }

  belongs_to :user, optional: true

  has_many :character_feats, class_name: 'Character::Feat', dependent: :destroy
  has_many :bonuses, class_name: '::Character::Bonus', as: :bonusable, dependent: :destroy

  def to_homebrew_json
    attributes.slice('title', 'description', 'kind', 'price', 'description_eval_variables', 'conditions', 'limit_refresh')
  end
end
