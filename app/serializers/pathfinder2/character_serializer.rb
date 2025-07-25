# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities,
               :skills, :created_at, :subclasses, :background, :saving_throws_value, :saving_throws, :dying_condition_value,
               :avatar, :boosts, :weapon_skills, :armor_skills, :coins, :load, :armor_class, :speed, :perception

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities, :skills, :subclasses,
             :background, :saving_throws_value, :saving_throws, :dying_condition_value, :boosts, :weapon_skills,
             :armor_skills, :coins, :load, :armor_class, :speed, :perception, to: :decorator
    delegate :created_at, to: :object

    def provider
      'pathfinder2'
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
