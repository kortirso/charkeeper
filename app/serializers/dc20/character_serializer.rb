# frozen_string_literal: true

module Dc20
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :features, :provider, :id, :name, :level, :main_class, :modified_abilities, :created_at, :avatar, :visions,
               :attribute_points, :classes, :ancestries, :combat_mastery, :save_dc, :precision_defense, :area_defense, :attack,
               :skills, :skill_points, :skill_expertise_points, :guide_step, :trade_points, :trade_expertise_points,
               :language_points, :trades, :trade_knowledge, :language_levels, :attribute_saves, :physical_save, :mental_save,
               :initiative, :conditions, :attacks, :health, :path_points, :paths, :mana_points, :maneuvers, :maneuver_points,
               :stamina_points, :grit_points, :rest_points, :mana_spend_limit, :cantrips, :spells, :talent_points, :spell_attack,
               :spell_lists_amount, :selected_talents, :subclass, :speeds, :jump, :size, :breath, :spell_list, :spell_check,
               :selected_additional_talents, :ancestry_points, :damages, :resistances, :conditions_v2, :abilities, :martial_check

    delegate :features, :name, :modified_abilities, :health, :combat_mastery, :save_dc, :precision_defense, :breath, :size,
             :area_defense, :attack, :skills, :trades, :attribute_saves, :physical_save, :mental_save, :initiative, :attacks,
             :mana_points, :maneuver_points, :stamina_points, :grit_points, :rest_points, :damages, :mana_spend_limit,
             :stamina_spend_limit, :cantrips, :spells, :spell_lists_amount, :speeds, :jump, :visions, :spell_check,
             :martial_check, :spell_attack, to: :decorator
    delegate :id, :created_at, :data, to: :object
    delegate :guide_step, :selected_talents, :subclass, :spell_list, :selected_additional_talents, :ancestry_points,
             :conditions_v2, :abilities, :attribute_points, :classes, :ancestries, :skill_points, :skill_expertise_points,
             :trade_points, :trade_expertise_points, :language_points, :trade_knowledge, :language_levels, :conditions,
             :paths, :path_points, :maneuvers, :talent_points, :level, :main_class, :resistances, to: :data

    def provider
      'dc20'
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
