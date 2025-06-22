# frozen_string_literal: true

module Daggerheart
  class CharacterSerializer < ApplicationSerializer
    attributes :provider, :avatar, :id, :name, :level, :heritage, :main_class, :classes, :traits, :created_at, :gold,
               :spent_armor_slots, :health_marked, :health_max, :stress_marked, :hope_marked, :modified_traits,
               :damage_thresholds, :evasion, :armor_score, :stress_max, :hope_max, :armor_slots, :features, :energy,
               :selected_features, :leveling, :subclasses, :subclasses_mastery, :attacks, :experience, :heritage_name

    delegate :id, :name, :level, :heritage, :main_class, :classes, :traits, :gold, :spent_armor_slots, :health_marked,
             :health_max, :stress_marked, :hope_marked, :stress_max, :hope_max, :modified_traits, :damage_thresholds, :evasion,
             :armor_score, :armor_slots, :features, :energy, :selected_features, :leveling, :subclasses,
             :subclasses_mastery, :attacks, :experience, :heritage_name, to: :decorator
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
        @decorator[key] = object.decorator
      end
    end
  end
end
