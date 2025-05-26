# frozen_string_literal: true

module DaggerheartCharacter
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :heritage, :main_class, :classes, :level, :gold, :spent_armor_slots, :health, :stress, :hope, :traits,
             :total_gold, to: :data

    def method_missing(_method, *args); end

    def modified_traits
      @modified_traits ||= traits.merge(equiped_armor_item&.info&.dig('traits') || {}) { |_key, oldval, newval| newval + oldval }
    end

    def damage_thresholds
      @damage_thresholds ||=
        { 'minor' => level, 'major' => level, 'severe' => level }
          .merge(equiped_armor_item&.info&.dig('thresholds') || {}) { |_key, oldval, newval| newval + oldval }
    end

    def evasion
      @evasion ||= data.evasion + equiped_armor_item&.info&.dig('evasion').to_i
    end

    def armor_score
      @armor_score ||= equiped_armor_item&.info&.dig('base_score').to_i
    end

    def armor_slots
      @armor_slots ||= equiped_armor_item&.info&.dig('base_score').to_i
    end

    private

    def equiped_armor_item
      @equiped_armor_item ||=
        __getobj__
        .items
        .where(ready_to_use: true)
        .joins(:item)
        .where(items: { kind: 'armor' })
        .first&.item
    end
  end
end
