# frozen_string_literal: true

module Cthulhu7
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :abilities, :guide_step, :skills, :additional_skills, :speed, :luck,
               :improved_skills, :hidden_skills, :selected_skills, :health, :health_max, :magic, :magic_max, :sanity, :build,
               :sanity_max, :luck_max, :damage_bonus, :description, :ideology, :people, :locations, :treasure, :traits, :scars,
               :phobias, :tomes, :strange, :attacks

    delegate :skills, :health_max, :magic_max, :sanity_max, :damage_bonus, :build, :speed, :attacks, to: :decorator
    delegate :data, to: :object
    delegate :guide_step, :abilities, :additional_skills, :improved_skills, :hidden_skills, :selected_skills, :health, :magic,
             :sanity, :luck, :luck_max, :description, :ideology, :people, :locations, :treasure, :traits, :scars, :phobias,
             :tomes, :strange, to: :data

    def provider
      'cthulhu7'
    end

    def avatar
      cache.fetch_item(id: object.id)
    end

    def updated_at
      object.updated_at.to_i
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
