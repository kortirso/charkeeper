# frozen_string_literal: true

module Dc20
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :main_class, :abilities, :modified_abilities, :created_at, :avatar, :health,
               :attribute_points, :classes, :ancestries, :combat_mastery, :save_dc, :precision_defense, :area_defense, :attack,
               :skills, :skill_points, :skill_expertise_points, :guide_step, :trade_points, :trade_expertise_points,
               :language_points, :trades, :trade_knowledge, :language_levels

    delegate :id, :name, :level, :main_class, :abilities, :modified_abilities, :health, :attribute_points, :classes,
             :ancestries, :combat_mastery, :save_dc, :precision_defense, :area_defense, :attack, :skills, :skill_points,
             :skill_expertise_points, :trade_points, :trade_expertise_points, :language_points, :trades, :trade_knowledge,
             :language_levels, to: :decorator
    delegate :created_at, :updated_at, :data, to: :object
    delegate :guide_step, to: :data

    def provider
      'dc20'
    end

    def avatar
      object.avatar.blob.url if object.avatar.attached?
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
