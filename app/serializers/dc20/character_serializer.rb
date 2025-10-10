# frozen_string_literal: true

module Dc20
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :main_class, :abilities, :modified_abilities, :created_at, :avatar, :health,
               :attribute_points, :classes, :ancestries, :combat_mastery, :save_dc, :precision_defense, :area_defense, :attack,
               :skills, :skill_points, :skill_expertise_points

    delegate :id, :name, :level, :main_class, :abilities, :modified_abilities, :health, :attribute_points, :classes,
             :ancestries, :combat_mastery, :save_dc, :precision_defense, :area_defense, :attack, :skills, :skill_points,
             :skill_expertise_points, to: :decorator
    delegate :created_at, to: :object

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
