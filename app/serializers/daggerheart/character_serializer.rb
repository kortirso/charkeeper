# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    attributes :features, :provider, :avatar, :id, :name, :level, :heritage, :main_class, :classes, :traits, :created_at, :gold,
               :spent_armor_slots, :health_marked, :health_max, :stress_marked, :hope_marked, :modified_traits,
               :damage_thresholds, :evasion, :base_armor_score, :armor_score, :stress_max, :hope_max, :armor_slots,
               :leveling, :subclasses, :subclasses_mastery, :attacks, :experience, :heritage_name,
               :domains, :selected_domains, :domain_cards_max, :spellcast_traits, :beastform, :beastforms, :tier, :proficiency,
               :can_have_companion, :transformations, :transformation, :can_have_stances, :selected_stances, :stance

    delegate :features, :id, :name, :level, :heritage, :main_class, :classes, :traits, :gold, :spent_armor_slots, :health_marked,
             :health_max, :stress_marked, :hope_marked, :stress_max, :hope_max, :modified_traits, :damage_thresholds, :evasion,
             :base_armor_score, :armor_score, :armor_slots, :leveling, :subclasses,
             :subclasses_mastery, :attacks, :experience, :heritage_name, :domains, :selected_domains,
             :domain_cards_max, :spellcast_traits, :beastform, :beastforms, :tier, :proficiency,
             :can_have_companion, :transformations, :transformation, :can_have_stances, :selected_stances, :stance, to: :decorator
    delegate :created_at, to: :object

    def provider
      'daggerheart'
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
