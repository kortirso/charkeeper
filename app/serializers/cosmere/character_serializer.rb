# frozen_string_literal: true

module Cosmere
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :avatar, :skills, :defense, :health_max, :focus_max, :investiture_max, :load,
               :movement, :recovery_die, :senses_range, :level, :abilities, :guide_step, :health, :focus, :investiture,
               :attribute_points, :skill_points, :deflect, :additional_skills, :tier, :ancestry, :cultures, :attacks,
               :talent_points, :updated_at, :expertises, :custom_expertises, :features, :modified_abilities, :purpose, :obstacle,
               :goals, :connections, :singer_forms, :singer_form, :names, :setting, :max_abilities

    delegate :skills, :defense, :focus_max, :investiture_max, :load, :movement, :recovery_die, :senses_range, :max_abilities,
             :deflect, :tier, :attacks, :talent_points, :features, :health_max, :modified_abilities, :singer_forms,
             to: :decorator
    delegate :data, to: :object
    delegate :attribute_points, :skill_points, :health, :focus, :investiture, :level, :guide_step, :additional_skills, :ancestry,
             :cultures, :expertises, :custom_expertises, :abilities, :purpose, :obstacle, :goals, :connections, :singer_form,
             :setting, to: :data

    def provider
      'cosmere'
    end

    def names
      {
        culture_names: object.culture_names,
        ancestry_name: object.ancestry_name,
        setting_name: object.setting_name
      }
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
