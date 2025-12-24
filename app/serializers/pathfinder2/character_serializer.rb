# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities, :money,
               :skills, :created_at, :subclasses, :background, :saving_throws_value, :saving_throws, :dying_condition_value,
               :avatar, :boosts, :weapon_skills, :armor_skills, :coins, :load, :armor_class, :speed, :perception, :conditions,
               :ability_boosts_v2, :skill_boosts, :attacks

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities, :skills, :subclasses,
             :background, :saving_throws_value, :saving_throws, :dying_condition_value, :boosts, :weapon_skills, :money,
             :armor_skills, :coins, :load, :armor_class, :speed, :perception, :conditions, :attacks, to: :decorator
    delegate :data, :created_at, to: :object
    delegate :ability_boosts_v2, :skill_boosts, to: :data

    def provider
      'pathfinder2'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator(
          simple: (context ? (context[:simple] || false) : false),
          version: (context ? (context[:version] || nil) : nil)
        )
      end
    end
  end
end
