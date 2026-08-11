# frozen_string_literal: true

module Nimble
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :provider, :id, :name, :created_at, :updated_at, :avatar, :level, :guide_step, :ancestry, :main_class, :skills,
               :skill_points, :modified_abilities, :initiative, :size, :abilities, :armor, :speed, :health, :wounds_max,
               :wounds_spent, :languages, :attacks, :features, :hit_die_max, :hit_die_spent, :hit_die, :saves, :subclass,
               :conditions, :separate_shield, :shield, :key_points, :secondary_points, :keys, :schools, :mana_max, :mana_spent,
               :spell_level, :spells, :utility_spells_limit, :learned_spells, :save_dc, :names

    delegate :skills, :modified_abilities, :initiative, :armor, :shield, :speed, :wounds_max, :attacks, :features, :hit_die_max,
             :hit_die_spent, :hit_die, :saves, :keys, :schools, :mana_max, :spell_level, :spells, :utility_spells_limit, :save_dc,
             to: :decorator
    delegate :data, to: :object
    delegate :level, :guide_step, :ancestry, :main_class, :skill_points, :abilities, :health, :wounds_spent, :languages, :size,
             :subclass, :conditions, :separate_shield, :key_points, :secondary_points, :mana_spent, :learned_spells, to: :data

    def provider
      'nimble'
    end

    def names
      {
        ancestry_name: object.ancestry_name
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
