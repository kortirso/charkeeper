# frozen_string_literal: true

module Pathfinder2
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :features, :id, :name, :level, :race, :subrace, :main_class, :classes, :languages, :health, :abilities, :money,
               :skills, :created_at, :subclasses, :background, :saving_throws_value, :saving_throws, :dying_condition_value,
               :avatar, :weapon_skills, :armor_skills, :coins, :load, :armor_class, :speed, :perception, :conditions,
               :ability_boosts_v2, :skill_boosts, :attacks, :provider, :lores, :selected_features, :spells_info, :class_dc,
               :spell_attack, :spell_dc, :spent_spell_slots, :formatted_static_spells, :modified_abilities, :spell_list,
               :can_have_pet, :can_have_familiar, :raw_abilities, :experience, :max_dying, :speeds

    delegate :health, :abilities, :skills, :subclasses, :saving_throws_value, :weapon_skills, :raw_abilities, :max_dying,
             :money, :lores, :armor_skills, :coins, :load, :armor_class, :speed, :perception, :conditions, :attacks, :speeds,
             :features, :spells_info, :class_dc, :spell_attack, :spell_dc, :formatted_static_spells, :modified_abilities,
             :can_have_pet, :can_have_familiar, to: :decorator
    delegate :name, :id, :data, :created_at, to: :object
    delegate :level, :ability_boosts_v2, :skill_boosts, :selected_features, :race, :subrace, :main_class, :classes, :languages,
             :background, :saving_throws, :spent_spell_slots, :spell_list, :experience, :dying_condition_value, to: :data

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
