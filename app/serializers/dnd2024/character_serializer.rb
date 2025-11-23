# frozen_string_literal: true

module Dnd2024
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :id, :name, :level, :species, :legacy, :main_class, :classes, :subclasses, :abilities, :skills,
               :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
               :attacks, :features, :selected_features, :resistances, :death_saving_throws, :health, :energy, :spent_hit_dice,
               :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
               :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :created_at, :avatar, :selected_feats,
               :darkvision, :modified_abilities, :available_spell_level, :formatted_static_spells, :conditions,
               :selected_beastforms, :beastform, :weapon_mastery, :speeds, :money, :guide_step, :ability_boosts,
               :any_skill_boosts, :skill_boosts, :skill_boosts_list

    delegate :id, :name, :level, :species, :legacy, :main_class, :classes, :subclasses, :abilities, :skills,
             :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
             :attacks, :features, :selected_features, :resistances, :death_saving_throws, :health, :energy, :spent_hit_dice,
             :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
             :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :selected_feats, :darkvision,
             :modified_abilities, :available_spell_level, :formatted_static_spells, :selected_beastforms, :beastform,
             :weapon_mastery, :speeds, :money, to: :decorator
    delegate :created_at, :data, to: :object
    delegate :guide_step, :ability_boosts, :any_skill_boosts, :skill_boosts, :skill_boosts_list, to: :data

    def provider
      'dnd2024'
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
