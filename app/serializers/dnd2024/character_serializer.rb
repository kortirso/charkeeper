# frozen_string_literal: true

module Dnd2024
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :species, :legacy, :main_class, :classes, :subclasses, :abilities, :skills,
               :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
               :attacks, :features, :selected_features, :conditions, :death_saving_throws, :health, :energy, :spent_hit_dice,
               :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
               :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :created_at, :avatar

    delegate :id, :name, :level, :species, :legacy, :main_class, :classes, :subclasses, :abilities, :skills,
             :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
             :attacks, :features, :selected_features, :conditions, :death_saving_throws, :health, :energy, :spent_hit_dice,
             :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
             :armor_proficiency, :spell_classes, :spells_slots, :static_spells, to: :decorator
    delegate :created_at, to: :object

    def provider
      'dnd2024'
    end

    def avatar
      object.avatar.blob.url if object.avatar.attached?
    end

    def decorator
      @decorator ||= {}
      @decorator.fetch(object.id) do |key|
        @decorator[key] = object.decorator(simple: (context ? (context[:simple] || false) : false))
      end
    end
  end
end
