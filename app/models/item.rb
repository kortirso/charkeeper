# frozen_string_literal: true

class Item < ApplicationRecord
  include Discard::Model
  include Homebrewable
  include Upvoteable

  belongs_to :user, optional: true, touch: :homebrew_updated_at
  belongs_to :itemable, polymorphic: true, optional: true

  has_many :character_items, class_name: '::Character::Item', dependent: :destroy
  has_many :bonuses, class_name: '::Character::Bonus', as: :bonusable, dependent: :destroy

  has_many :recipes, class_name: 'Item::Recipe', foreign_key: :tool_id, dependent: :destroy

  scope :dnd, -> { where(type: %w[Dnd5::Item Dnd2024::Item]) }
  scope :dnd5, -> { where(type: 'Dnd5::Item') }
  scope :dnd2024, -> { where(type: 'Dnd2024::Item') }
  scope :pathfinder2, -> { where(type: 'Pathfinder2::Item') }
  scope :daggerheart, -> { where(type: 'Daggerheart::Item') }
  scope :dc20, -> { where(type: 'Dc20::Item') }
  scope :fallout, -> { where(type: 'Fallout::Item') }
  scope :cosmere, -> { where(type: 'Cosmere::Item') }
  scope :nimble, -> { where(type: 'Nimble::Item') }

  scope :visible, -> { where(itemable: nil) }

  def self.ransackable_attributes(*)
    %w[slug name name_en name_ru kind]
  end

  def self.ransackable_associations(*)
    %w[]
  end

  ransacker :name_en, type: :string do |parent|
    Arel::Nodes::InfixOperation.new(
      '->>',
      parent.table[:name],
      Arel::Nodes.build_quoted('en')
    )
  end

  ransacker :name_ru, type: :string do |parent|
    Arel::Nodes::InfixOperation.new(
      '->>',
      parent.table[:name],
      Arel::Nodes.build_quoted('ru')
    )
  end
end
