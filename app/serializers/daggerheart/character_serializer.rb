# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :proficiency, :features, :provider, :avatar, :id, :name, :level, :heritage, :classes, :traits, :created_at, :gold,
               :spent_armor_slots, :health_marked, :health_max, :stress_marked, :hope_marked, :modified_traits, :money, :beast,
               :damage_thresholds, :evasion, :base_armor_score, :armor_score, :stress_max, :hope_max, :armor_slots, :resources,
               :leveling, :subclasses, :subclasses_mastery, :attacks, :experience, :heritage_name, :names, :community, :hybrid,
               :domains, :selected_domains, :domain_cards_max, :spellcast_traits, :beastform, :beastforms, :tier, :main_class,
               :can_have_companion, :transformations, :homebrew_domains, :transformation, :mechanic_items, :spell_bonus,
               :selected_features, :guide_step, :conditions, :advantage_dice, :disadvantage_dice, :scars, :scarred_hope,
               :can_have_beastform, :rally_dice, :available_mechanic_items, :selected_mechanic_items

    delegate :features, :id, :name, :level, :heritage, :main_class, :classes, :traits, :gold, :spent_armor_slots, :health_marked,
             :health_max, :stress_marked, :hope_marked, :stress_max, :hope_max, :modified_traits, :damage_thresholds, :evasion,
             :base_armor_score, :armor_score, :armor_slots, :leveling, :subclasses, :money, :scars, :scarred_hope,
             :subclasses_mastery, :attacks, :experience, :domains, :selected_domains, :can_have_beastform, :disadvantage_dice,
             :domain_cards_max, :spellcast_traits, :beastforms, :tier, :proficiency, :resources, :spell_bonus, :selected_features,
             :can_have_companion, :transformations, :transformation, :advantage_dice, :conditions, :homebrew_domains,
             :mechanic_items, to: :decorator
    delegate :created_at, :data, to: :object
    delegate :guide_step, :heritage_name, :community, :beastform, :beast, :hybrid, :rally_dice, :available_mechanic_items,
             :selected_mechanic_items, to: :data

    def names
      {
        ancestry_name: object.ancestry_name,
        community_name: object.community_name,
        subclass_names: object.subclass_names
      }
    end

    def provider
      'daggerheart'
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
