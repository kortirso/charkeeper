# frozen_string_literal: true

module Dnd2024
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :level, :features, :provider, :id, :name, :species, :legacy, :main_class, :classes, :subclasses, :abilities,
               :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
               :attacks, :selected_features, :resistances, :death_saving_throws, :health, :spent_hit_dice,
               :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
               :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :created_at, :avatar, :selected_feats,
               :darkvision, :modified_abilities, :available_spell_level, :formatted_static_spells, :conditions, :background,
               :selected_beastforms, :beastform, :weapon_mastery, :speeds, :money, :guide_step, :ability_boosts,
               :any_skill_boosts, :skill_boosts, :skill_boosts_list, :heroic_inspiration, :bardic_inspiration, :selected_talents,
               :leveling_ability_boosts, :leveling_ability_boosts_list, :available_talents, :skills, :exhaustion, :alignment

    delegate :features, :id, :name, :level, :species, :legacy, :main_class, :classes, :subclasses, :abilities, :skills,
             :modifiers, :save_dc, :proficiency_bonus, :hit_dice, :armor_class, :initiative, :speed, :attacks_per_action,
             :attacks, :selected_features, :resistances, :death_saving_throws, :health, :spent_hit_dice,
             :spent_spell_slots, :coins, :load, :languages, :tools, :music, :weapon_core_skills, :weapon_skills,
             :armor_proficiency, :spell_classes, :spells_slots, :static_spells, :selected_feats, :darkvision,
             :modified_abilities, :available_spell_level, :formatted_static_spells, :selected_beastforms, :beastform,
             :weapon_mastery, :speeds, :money, :available_talents, to: :decorator
    delegate :created_at, :data, to: :object
    delegate :guide_step, :ability_boosts, :any_skill_boosts, :skill_boosts, :skill_boosts_list, :heroic_inspiration,
             :bardic_inspiration, :selected_talents, :leveling_ability_boosts, :leveling_ability_boosts_list, :exhaustion,
             :alignment, :background, to: :data

    def provider
      'dnd2024'
    end

    def avatar
      cache.fetch_item(id: object.id)
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
