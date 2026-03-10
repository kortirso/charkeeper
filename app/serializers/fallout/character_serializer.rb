# frozen_string_literal: true

module Fallout
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :features, :provider, :id, :name, :created_at, :avatar, :origin, :abilities, :load, :initiative, :max_health,
               :ability_boosts, :tag_skill_boosts, :skill_boosts, :level, :guide_step, :max_abilities, :defense, :attacks,
               :modified_abilities, :perks, :additional_perks, :perks_boosts, :skills

    delegate :load, :initiative, :max_health, :skills, :defense, :modified_abilities, :attacks, :features, to: :decorator
    delegate :data, to: :object
    delegate :origin, :abilities, :ability_boosts, :tag_skill_boosts, :skill_boosts, :level, :guide_step,
             :max_abilities, :perks, :additional_perks, :perks_boosts, to: :data

    def provider
      'fallout'
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
