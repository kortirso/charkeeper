# frozen_string_literal: true

class Feat < ApplicationRecord
  include Itemable
  include Homebrewable
  include Upvoteable

  scope :dnd5, -> { where(type: 'Dnd5::Feat') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Feat') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Feat') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Feat') }

  belongs_to :user, optional: true

  has_many :character_feats, class_name: 'Character::Feat', dependent: :destroy
  has_many :bonuses, class_name: '::Character::Bonus', as: :bonusable, dependent: :destroy

  def to_homebrew_json(with_id: true) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
    option_feats = ::Feat.where(slug: options&.keys, type: type)
    attributes
      .slice('title', 'description', 'kind', 'price', 'limit_refresh', 'modifiers', 'exclude', 'continious', 'tokens')
      .merge({
        id: with_id ? id : nil,
        limit: description_eval_variables['limit'] || info['limit'],
        subclass_mastery: conditions['subclass_mastery'],
        level: conditions['level'],
        type: info['type'],
        recall: info['recall'],
        hope_dice: info['hope_dice'],
        fear_dice: info['fear_dice'],
        required_for: info['required_for'],
        extra_skills: info['extra_skills'],
        options: options&.map do |key, value|
          {
            title: value,
            feature: option_feats.find { |feat| feat.slug == key }&.to_homebrew_json(with_id: false)
          }.compact
        end
      }).compact_blank
  end
end
