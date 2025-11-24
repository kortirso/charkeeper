# frozen_string_literal: true

module Dnd5
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :race, :subrace, :main_class, :classes, :subclasses, :abilities, :skills,
               :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
               :attacks, :features, :selected_features, :resistances, :death_saving_throws, :health, :spent_hit_dice,
               :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
               :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :created_at, :avatar, :modified_abilities,
               :available_spell_level, :formatted_static_spells, :conditions, :beastform, :speeds, :money,
               :heroic_inspiration, :bardic_inspiration

    delegate :id, :name, :level, :race, :subrace, :main_class, :classes, :subclasses, :abilities, :skills,
             :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
             :attacks, :features, :selected_features, :resistances, :death_saving_throws, :health, :spent_hit_dice,
             :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
             :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :modified_abilities,
             :available_spell_level, :formatted_static_spells, :beastform, :speeds, :money, to: :decorator
    delegate :created_at, :data, to: :object
    delegate :heroic_inspiration, :bardic_inspiration, to: :data

    def provider
      'dnd5'
    end

    def avatar
      object.avatar.blob.url if object.avatar.attached?
    end

    def conditions
      return decorator.conditions if context.blank?
      return decorator.conditions if context[:version].blank?
      return decorator.conditions if context[:version] >= '0.3.11'

      decorator.resistances
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
