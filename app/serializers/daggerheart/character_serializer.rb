# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    include Deps[cache: 'cache.avatars']

    attributes :proficiency, :features, :provider, :avatar, :id, :name, :level, :heritage, :classes, :traits, :created_at, :gold,
               :spent_armor_slots, :health_marked, :health_max, :stress_marked, :hope_marked, :modified_traits, :money, :beast,
               :damage_thresholds, :evasion, :armor_score, :stress_max, :hope_max, :armor_slots, :resources,
               :leveling, :subclasses, :subclasses_mastery, :attacks, :experience, :heritage_name, :names, :community, :hybrid,
               :domains, :selected_domains, :domain_cards_max, :spellcast_traits, :beastform, :tier, :main_class,
               :can_have_companion, :transformations, :homebrew_domains, :transformation, :mechanic_items, :spell_bonus,
               :selected_features, :guide_step, :conditions, :advantage_dice, :disadvantage_dice, :scars, :scarred_hope,
               :can_have_beastform, :rally_dice, :available_mechanic_items, :selected_mechanic_items, :spellcast_trait

    delegate :features, :health_max, :stress_max, :hope_max, :modified_traits, :damage_thresholds, :evasion,
             :armor_score, :armor_slots, :scarred_hope, :attacks, :can_have_beastform, :disadvantage_dice, :tier, :resources,
             :domain_cards_max, :spellcast_traits, :proficiency, :spell_bonus, :selected_features, :mechanic_items,
             :can_have_companion, :transformations, :transformation, :advantage_dice, :homebrew_domains, to: :decorator
    delegate :created_at, :data, :id, :name, :selected_domains, to: :object
    delegate :guide_step, :heritage_name, :community, :beastform, :beast, :hybrid, :rally_dice, :available_mechanic_items,
             :selected_mechanic_items, :spellcast_trait, :level, :heritage, :main_class, :classes, :gold, :spent_armor_slots,
             :health_marked, :stress_marked, :hope_marked, :leveling, :subclasses, :money, :subclasses_mastery, :scars,
             :experience, :domains, :conditions, :traits, to: :data

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
