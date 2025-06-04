# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :heritage, :main_class, :classes, :subclasses, :level, :gold, :spent_armor_slots, :health_marked, :stress_marked,
             :hope_marked, :traits, :total_gold, :subclasses_mastery, :experiences, :energy, :community, :selected_features,
             :leveling, to: :data

    def method_missing(_method, *args); end

    def modified_traits
      @modified_traits ||= traits.merge(equiped_armor_item_info&.dig('traits') || {}) { |_key, oldval, newval| newval + oldval }
    end

    def damage_thresholds
      @damage_thresholds ||=
        { 'minor' => level, 'major' => level, 'severe' => level }
          .merge(equiped_armor_item_info&.dig('thresholds') || {}) { |_key, oldval, newval| newval + oldval }
    end

    def evasion
      @evasion ||= data.evasion + equiped_armor_item_info&.dig('evasion').to_i + leveling['evasion']
    end

    def armor_score
      @armor_score ||= equiped_armor_item_info&.dig('base_score').to_i
    end

    def armor_slots
      @armor_slots ||= equiped_armor_item_info&.dig('base_score').to_i
    end

    def health_max
      @health_max ||= data.health_max + leveling['health']
    end

    def stress_max
      @stress_max ||= data.stress_max + leveling['stress']
    end

    def hope_max
      @hope_max ||= data.hope_max
    end

    def proficiency
      @proficiency ||= 1 + leveling['proficiency'] + proficiency_by_level
    end

    private

    def proficiency_by_level
      return 3 if level >= 8
      return 2 if level >= 5
      return 1 if level >= 2

      0
    end

    def equiped_armor_item_info
      @equiped_armor_item_info ||=
        __getobj__
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: 'armor' })
        .first&.item || {}
    end
  end
end
