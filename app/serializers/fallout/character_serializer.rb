# frozen_string_literal: true

module Fallout
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :origin, :abilities, :carry_weight, :initiative, :health, :skills,
               :tag_skills, :ability_boosts, :tag_skill_boosts, :skill_boosts, :level, :guide_step, :max_abilities

    delegate :carry_weight, :initiative, :health, to: :decorator
    delegate :data, to: :object
    delegate :origin, :abilities, :skills, :tag_skills, :ability_boosts, :tag_skill_boosts, :skill_boosts, :level, :guide_step,
             :max_abilities, to: :data

    def provider
      'fallout'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator
      end
    end
  end
end
